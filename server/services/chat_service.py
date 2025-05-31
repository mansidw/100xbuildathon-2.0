from crewai import Agent, Task, Crew, Process
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
from urllib.parse import urlparse, parse_qs
import re
import gdown
import litellm
import io
import sys
import uuid

load_dotenv()

TEMP_DIR = os.path.join(os.path.dirname(__file__), '..', 'temp')

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

class LiteLLMAgent(Agent):
    def __init__(self, role, goal, backstory, **kwargs):
        super().__init__(role=role, goal=goal, backstory=backstory, allow_delegation=False, **kwargs)

    def execute_task(self, task, context=None, tools=None):
        try:
            print(f"Executing task: {task.description}")
            response = litellm.completion(
                model="gemini/gemini-2.0-flash",  # Correct model format for LiteLLM
                messages=[{"role": "user", "content": task.description}],
                api_key=os.getenv('GOOGLE_API_KEY')
            )
            print(f"LiteLLM Response: {response}")
            # Extract the content and ensure it's treated as the raw output
            output_content = response.choices[0].message.content
            print(f"Output content: {output_content}")
            return output_content # Return the content directly
        except Exception as e:
            print(f"Error in LiteLLMAgent execution: {e}")
            return f"Error: {e}"

class ChatService:
    def __init__(self):
        self.data_processor = LiteLLMAgent(
            role='Data Processor',
            goal='Process and analyze data from various sources',
            backstory='Expert in data processing and analysis'
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
            
            toolkit = SQLDatabaseToolkit(db=db, llm=self.data_processor)
            agent = create_sql_agent(
                llm=self.data_processor,
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
        # Capture standard output for debugging CrewAI response
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output

        try:
            analysis_task = Task(
                description=f"Analyze this job description and determine required columns for the candidates table based on the job description provided. Return ONLY a JSON array of strings with the column names, for example: [\"column1\", \"column2\"].\nJob Description:\n{jd_text}",
                agent=self.data_processor,
                expected_output="A JSON array of column names required for the candidates table, and ONLY the JSON array."
            )
            
            processing_task = Task(
                description="Process the candidate data and create the table structure",
                agent=self.data_processor,
                expected_output="A JSON object confirming the table structure and data processing, and ONLY the JSON object."
            )
            
            crew = Crew(
                agents=[self.data_processor],
                tasks=[analysis_task, processing_task],
                process=Process.sequential,
                verbose=True
            )
            
            result = crew.kickoff()

            # Restore standard output
            sys.stdout = old_stdout
            captured_output = redirected_output.getvalue()
            print(f"Captured CrewAI stdout:\n{captured_output}")
            
            columns = None
            raw_output = ""
            task_output_str = ""

            # Try accessing output from TaskOutput object first
            if result and result.tasks_output and len(result.tasks_output) > 0:
                 analysis_task_output = result.tasks_output[0]
                 raw_output = analysis_task_output.raw
                 task_output_str = str(analysis_task_output)

                 # Prioritize json_dict if available
                 if analysis_task_output.json_dict is not None:
                      columns = analysis_task_output.json_dict
                      print("Debug: Loaded columns from json_dict.")

                 # If json_dict is empty or None, try parsing the raw output
                 if columns is None and raw_output:
                     try:
                         columns = json.loads(raw_output)
                         print("Debug: Loaded columns from raw output.")
                     except json.JSONDecodeError:
                         print(f"Debug: Raw output is not valid JSON: {raw_output}")
                         pass # Keep columns as None, proceed to next fallback

                 # If columns is still None, try parsing the string representation of the TaskOutput object
                 if columns is None and task_output_str:
                     try:
                         columns = json.loads(task_output_str)
                         print("Debug: Loaded columns from TaskOutput string representation.")
                     except json.JSONDecodeError:
                         print(f"Debug: TaskOutput string representation is not valid JSON: {task_output_str}")
                         pass # Keep columns as None, proceed to error below

            # If columns is still None, try parsing the captured standard output as a last resort
            if columns is None and captured_output:
                 print("Debug: Attempting to parse captured standard output as JSON.")
                 # This is a heuristic and might need refinement based on actual stdout content
                 # We might need to extract the JSON part from the captured output
                 json_match = re.search(r'(\[.*?\]|\{.*?\})', captured_output)
                 if json_match:
                     json_string = json_match.group(0)
                     try:
                         columns = json.loads(json_string)
                         print("Debug: Loaded columns from captured standard output.")
                     except json.JSONDecodeError:
                         print(f"Debug: Captured standard output is not valid JSON: {json_string}")
                         pass
                 else:
                      print("Debug: No potential JSON found in captured standard output.")

            # If columns is still None or not a list, raise an error
            if not isinstance(columns, list) or not columns:
                 raise Exception(f"Could not extract columns from analysis task output. Expected a non-empty JSON list. Raw output: {raw_output}. TaskOutput string: {task_output_str}. Captured stdout: {captured_output}")

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
                
                candidate_info = self._extract_candidate_info(resume_text)
                
                score = self._calculate_score(candidate_info, jd_text)
                candidate_info['score'] = str(score)
                
                placeholders = ', '.join(['%s' for _ in columns])
                values = [candidate_info.get(col, '') for col in columns]
                insert_sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
                db.run(insert_sql, values)
            
            return {"message": "Processing completed successfully"}
            
        except Exception as e:
            # Ensure standard output is restored even if an error occurs
            sys.stdout = old_stdout
            raise Exception(f"Error processing new chat: {str(e)}")

    def _is_google_drive_url(self, url):
        return 'drive.google.com' in url

    def _get_google_drive_file_id(self, url):
        if 'id=' in url:
            return parse_qs(urlparse(url).query)['id'][0]
        elif '/d/' in url:
            return url.split('/d/')[1].split('/')[0]
        return None

    def _download_and_extract_resume(self, pdf_url):
        try:
            # Generate a unique filename in the temp directory
            temp_file_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}.pdf")

            if self._is_google_drive_url(pdf_url):
                file_id = self._get_google_drive_file_id(pdf_url)
                if not file_id:
                    raise Exception("Invalid Google Drive URL")
                
                gdown.download(f"https://drive.google.com/uc?id={file_id}", temp_file_path, quiet=False)
                
                if not os.path.exists(temp_file_path) or os.path.getsize(temp_file_path) == 0:
                    raise Exception("Failed to download file from Google Drive")
            else:
                response = requests.get(pdf_url)
                if response.status_code != 200:
                    raise Exception(f"Failed to download PDF: {response.status_code}")
                # Write directly to the specified temporary file path
                with open(temp_file_path, 'wb') as temp_file:
                    temp_file.write(response.content)

            # The file is now closed after writing

            pdf_reader = PdfReader(temp_file_path)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            os.unlink(temp_file_path) # Now it should be safe to delete
            return text
                
        except Exception as e:
            # Attempt to clean up the temporary file if it exists and an error occurred
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                 try:
                     os.unlink(temp_file_path)
                 except Exception as cleanup_error:
                     print(f"Error cleaning up temporary file {temp_file_path}: {cleanup_error}")
            raise Exception(f"Error downloading or processing PDF: {str(e)}")

    def _extract_candidate_info(self, resume_text):
        try:
            response = litellm.completion(
                model="gemini/gemini-2.0-flash",
                messages=[{"role": "user", "content": f"Extract candidate information from this resume:\n{resume_text}\nReturn ONLY a JSON object with the extracted information. Structure the JSON with relevant keys like 'name', 'email', 'phone', 'linkedin', 'skills', 'experience', 'education'. Ensure the output is ONLY the JSON object, for example: {{ \"name\": \"John Doe\", \"email\": \"john.doe@example.com\" }}. Do NOT include any other text or formatting before or after the JSON."}],
                api_key=os.getenv('GOOGLE_API_KEY')
            )
            # Ensure we are only trying to load the content of the message
            llm_output_content = response.choices[0].message.content.strip()
            print(f"Debug: Raw LLM output for candidate info: {llm_output_content}")

            # Remove markdown code block formatting if present
            if llm_output_content.startswith('```json'):
                llm_output_content = llm_output_content[len('```json'):].lstrip()
            if llm_output_content.endswith('```'):
                llm_output_content = llm_output_content[:-len('```')].rstrip()

            return json.loads(llm_output_content)
        except json.JSONDecodeError as e:
             # Include the raw output in the error message for debugging
             raise Exception(f"Error decoding JSON from LLM output for candidate info. Raw output: {llm_output_content}. Error: {e}")
        except Exception as e:
            raise Exception(f"Error extracting candidate info: {str(e)}")

    def _calculate_score(self, candidate_info, jd_text):
        try:
            response = litellm.completion(
                model="gemini/gemini-2.0-flash",
                messages=[{"role": "user", "content": f"Calculate a match score (0-100) between this candidate and job description. Return ONLY the score number as a float.\nCandidate: {json.dumps(candidate_info)}\nJob Description: {jd_text}"}],
                api_key=os.getenv('GOOGLE_API_KEY')
            )
            return float(response.choices[0].message.content.strip())
        except Exception as e:
            raise Exception(f"Error calculating score: {str(e)}")

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