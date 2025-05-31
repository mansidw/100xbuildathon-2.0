from crewai import Agent, Task, Crew
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from dotenv import load_dotenv
import os
import MySQLdb
import pandas as pd
import requests
from PyPDF2 import PdfReader
import tempfile
import json
import pymysql
from urllib.parse import urlparse

load_dotenv()

class ChatService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        
        self.data_processor = Agent(
            role='Data Processor',
            goal='Process and analyze data from various sources',
            backstory='Expert in data processing and analysis',
            llm=self.llm,
            verbose=True
        )
        
        self.connection_string = os.getenv('CONNECTION_URL')
        self._init_db()

    def _init_db(self):
        try:
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
            db = SQLDatabase.from_uri(
                self.connection_string,
                include_tables=[table_name]
            )
            
            toolkit = SQLDatabaseToolkit(db=db, llm=self.llm)
            agent = create_sql_agent(
                llm=self.llm,
                toolkit=toolkit,
                verbose=True,
                agent_kwargs={
                    "prefix": f"You are a SQL expert. You can only query the table '{table_name}'. "
                              "Do not attempt to query any other tables. If the query requires joining "
                              "with other tables, inform the user that you can only work with the specified table."
                }
            )
            
            return agent.run(query)
        except Exception as e:
            raise Exception(f"Error processing query: {str(e)}")

    def process_new_chat(self, df, jd_text, table_name):
        try:
            analysis_task = Task(
                description=f"Analyze this job description and determine required columns for the candidates table:\n{jd_text}",
                agent=self.data_processor
            )
            
            processing_task = Task(
                description="Process the candidate data and create the table structure",
                agent=self.data_processor
            )
            
            crew = Crew(
                agents=[self.data_processor],
                tasks=[analysis_task, processing_task],
                verbose=True
            )
            
            result = crew.kickoff()
            columns = json.loads(result)
            
            db = SQLDatabase.from_uri(self.connection_string)
            
            columns.append("score")
            create_table_sql = f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    {', '.join([f'{col} VARCHAR(255)' for col in columns])},
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            db.run(create_table_sql)
            
            for _, row in df.iterrows():
                resume_text = self._download_and_extract_resume(row['pdf_url'])
                
                background_check = self._perform_background_check(resume_text, row['linkedin_url'])
                if not background_check['passed']:
                    self._add_to_rejected(row['name'], background_check['reason'])
                    continue
                
                candidate_info = self._extract_candidate_info(resume_text)
                
                score = self._calculate_score(candidate_info, jd_text)
                candidate_info['score'] = str(score)
                
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
        try:
            parsed = urlparse(self.connection_string)
            db_config = {
                'host': parsed.hostname,
                'port': parsed.port or 3306,
                'user': parsed.username,
                'password': parsed.password,
                'database': parsed.path.lstrip('/'),
                'charset': 'utf8mb4'
            }
            
            connection = pymysql.connect(**db_config)
            cursor = connection.cursor()
            
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s", (db_config['database'],))
            tables_result = cursor.fetchall()
            
            tables = [row[0] for row in tables_result]
            
            cursor.close()
            connection.close()
            
            return tables
            
        except Exception as e:
            raise Exception(f"Error getting tables: {str(e)}")

    def get_table_insights(self, table_name):
        try:
            db = SQLDatabase.from_uri(self.connection_string)
            
            columns_query = f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'classicmodels' 
                AND table_name = '{table_name}'
            """
            columns_result = db.run(columns_query)
            columns = [row[0] for row in columns_result]
            
            data_query = f"SELECT * FROM {table_name}"
            data_result = db.run(data_query)
            
            table_data = []
            for row in data_result:
                row_dict = {}
                for i, col in enumerate(columns):
                    if i < len(row):
                        value = row[i]
                        row_dict[col] = str(value) if value is not None else None
                    else:
                        row_dict[col] = None
                table_data.append(row_dict)
            
            return {
                "columns": columns,
                "data": table_data
            }
            
        except Exception as e:
            raise Exception(f"Error getting table insights: {str(e)}")