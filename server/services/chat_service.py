from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os


load_dotenv()

class ChatService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )

    def process_query(self, table_name, query):
        try:
            connection_string = "mysql://root:@localhost:3306/classicmodels"
            
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