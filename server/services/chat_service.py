from crewai import Agent, Task, Crew
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from dotenv import load_dotenv
import os
import mysql.connector
import pandas as pd
import requests
from PyPDF2 import PdfReader
import tempfile
import json


load_dotenv()

class ChatService:
    def __init__(self):
        # Initialize the LLM with Gemini
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        
        # Create agents
        self.sql_expert = Agent(
            role='SQL Expert',
            goal='Write and execute SQL queries accurately',
            backstory='Expert in SQL and database management',
            llm=self.llm,
            verbose=True
        )
        
        self.data_processor = Agent(
            role='Data Processor',
            goal='Process and analyze data from various sources',
            backstory='Expert in data processing and analysis',
            llm=self.llm,
            verbose=True
        )
        
        # Initialize MySQL connection
        self.connection_string = os.getenv('CONNECTION_URL')
        self._init_db()

    def _init_db(self):
        try:
            # Create rejected_candidates table if it doesn't exist
            db = SQLDatabase.from_uri(self.connection_string)
            db.run("""
                CREATE TABLE IF NOT EXISTS rejected_candidates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        except Exception as e:
            raise Exception(f"Error initializing database: {str(e)}")

    def process_query(self, table_name, query):
        try:
            # Create database connection
            db = SQLDatabase.from_uri(
                self.connection_string,
                include_tables=[table_name]
            )
            
            # Create tasks for the crew
            sql_task = Task(
                description=f"Write and execute a SQL query for the following request: {query}\nOnly query the table '{table_name}'.",
                agent=self.sql_expert
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.sql_expert],
                tasks=[sql_task],
                verbose=True
            )
            
            result = crew.kickoff()
            return result
            
        except Exception as e:
            raise Exception(f"Error processing query: {str(e)}")

    def process_new_chat(self, df, jd_text, table_name):
        try:
            # Create tasks for the crew
            analysis_task = Task(
                description=f"Analyze this job description and determine required columns for the candidates table:\n{jd_text}",
                agent=self.data_processor
            )
            
            processing_task = Task(
                description="Process the candidate data and create the table structure",
                agent=self.data_processor
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.data_processor],
                tasks=[analysis_task, processing_task],
                verbose=True
            )
            
            result = crew.kickoff()
            columns = json.loads(result)
            
            # Create table
            db = SQLDatabase.from_uri(self.connection_string)
            
            # Add score column
            columns.append("score")
            create_table_sql = f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    {', '.join([f'{col} VARCHAR(255)' for col in columns])},
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            db.run(create_table_sql)
            
            # Process each candidate
            for _, row in df.iterrows():
                # Download and process resume
                resume_text = self._download_and_extract_resume(row['pdf_url'])
                
                # Background check
                background_check = self._perform_background_check(resume_text, row['linkedin_url'])
                if not background_check['passed']:
                    self._add_to_rejected(row['name'], background_check['reason'])
                    continue
                
                # Extract candidate info
                candidate_info = self._extract_candidate_info(resume_text)
                
                # Calculate score
                score = self._calculate_score(candidate_info, jd_text)
                candidate_info['score'] = str(score)
                
                # Insert into table
                placeholders = ', '.join(['%s' for _ in columns])
                values = [candidate_info.get(col, '') for col in columns]
                insert_sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
                db.run(insert_sql, values)
            
            return {"message": "Processing completed successfully"}
            
        except Exception as e:
            raise Exception(f"Error processing new chat: {str(e)}")

    def _download_and_extract_resume(self, pdf_url):
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            response = requests.get(pdf_url)
            temp_file.write(response.content)
            temp_file.flush()
            
            pdf_reader = PdfReader(temp_file.name)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            os.unlink(temp_file.name)
            return text

    def _perform_background_check(self, resume_text, linkedin_url):
        prompt = f"""Perform a background check on this candidate:
        Resume: {resume_text}
        LinkedIn: {linkedin_url}
        Return a JSON with 'passed' (boolean) and 'reason' (string if failed)."""
        
        response = self.llm.invoke(prompt)
        return json.loads(response.content)

    def _extract_candidate_info(self, resume_text):
        prompt = f"""Extract candidate information from this resume:
        {resume_text}
        Return a JSON object with the extracted information."""
        
        response = self.llm.invoke(prompt)
        return json.loads(response.content)

    def _calculate_score(self, candidate_info, jd_text):
        prompt = f"""Calculate a match score (0-100) between this candidate and job description:
        Candidate: {json.dumps(candidate_info)}
        Job Description: {jd_text}
        Return only the score number."""
        
        response = self.llm.invoke(prompt)
        return float(response.content.strip())

    def _add_to_rejected(self, name, reason):
        db = SQLDatabase.from_uri(self.connection_string)
        db.run(
            "INSERT INTO rejected_candidates (name, reason) VALUES (%s, %s)",
            (name, reason)
        )

    def get_all_tables(self):
        db = SQLDatabase.from_uri(self.connection_string)
        result = db.run("SHOW TABLES")
        return [row[0] for row in result]

    def get_table_insights(self, table_name):
        db = SQLDatabase.from_uri(self.connection_string)
        columns = db.run(f"SHOW COLUMNS FROM {table_name}")
        data = db.run(f"SELECT * FROM {table_name}")
        
        return {
            "columns": [col[0] for col in columns],
            "data": [dict(zip([col[0] for col in columns], row)) for row in data]
        }