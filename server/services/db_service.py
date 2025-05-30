from supabase import create_client
import os

class DatabaseService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        self.client = create_client(self.supabase_url, self.supabase_key)

    def get_client(self):
        return self.client

    def get_connection_string(self, db_name):
        return f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{db_name}" 