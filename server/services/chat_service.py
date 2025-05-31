from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import sqlite3
import pandas as pd
import requests
from PyPDF2 import PdfReader
import tempfile
import json


load_dotenv()

class ChatService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        self.db_path = "candidates.db"
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS rejected_candidates
                    (name TEXT, reason TEXT)''')
        conn.commit()
        conn.close()

    def process_query(self, table_name, query):
        try:
            connection_string = os.getenv('CONNECTION_URL')
            
            db = SQLDatabase.from_uri(
                connection_string,
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
            # Analyze JD to determine required columns
            columns_prompt = f"""Based on this job description, what columns should be in the candidates table?
            Job Description: {jd_text}
            Return only a JSON array of column names."""
            
            columns_response = self.llm.invoke(columns_prompt)
            columns = json.loads(columns_response.content)
            
            # Create table
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            
            # Add score column
            columns.append("score")
            create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join([f'{col} TEXT' for col in columns])})"
            c.execute(create_table_sql)
            
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
                placeholders = ', '.join(['?' for _ in columns])
                values = [candidate_info.get(col, '') for col in columns]
                c.execute(f"INSERT INTO {table_name} VALUES ({placeholders})", values)
            
            conn.commit()
            conn.close()
            
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
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("INSERT INTO rejected_candidates VALUES (?, ?)", (name, reason))
        conn.commit()
        conn.close()

    def get_all_tables(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in c.fetchall()]
        conn.close()
        return tables

    def get_table_insights(self, table_name):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute(f"SELECT * FROM {table_name}")
        columns = [description[0] for description in c.description]
        rows = c.fetchall()
        conn.close()
        
        return {
            "columns": columns,
            "data": [dict(zip(columns, row)) for row in rows]
        }