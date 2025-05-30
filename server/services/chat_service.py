from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_google_genai import ChatGoogleGenerativeAI
import os

class ChatService:
    def __init__(self, db_service):
        self.db_service = db_service
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=os.getenv('GOOGLE_API_KEY'))
        self.db_name = os.getenv('SUPABASE_DB_NAME', 'postgres')

    def process_query(self, table_name, query):
        supabase = self.db_service.get_client()
        try:
            response = supabase.table(table_name).select("*").limit(1).execute()
            schema = self._get_schema_from_response(response)
            
            db = SQLDatabase.from_uri(
                f"postgresql://{os.getenv('SUPABASE_DB_USER')}:{os.getenv('SUPABASE_DB_PASSWORD')}@{os.getenv('SUPABASE_DB_HOST')}:{os.getenv('SUPABASE_DB_PORT')}/{self.db_name}",
                schema=schema,
                include_tables=[table_name]
            )
            
            toolkit = SQLDatabaseToolkit(db=db, llm=self.llm)
            agent = create_sql_agent(
                llm=self.llm,
                toolkit=toolkit,
                verbose=True,
                agent_kwargs={
                    "prefix": f"You are a SQL expert. You can only query the table '{table_name}'. Do not attempt to query any other tables. If the query requires joining with other tables, inform the user that you can only work with the specified table."
                }
            )
            return agent.invoke(query)
        except Exception as e:
            raise Exception(f"Error processing query: {str(e)}")

    def _get_schema_from_response(self, response):
        if not response.data:
            return {}
        
        schema = {}
        for column in response.data[0].keys():
            schema[column] = "text"
        return schema 