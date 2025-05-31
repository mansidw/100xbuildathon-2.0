import os
import json
import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

class InsightsService:
    def __init__(self):
        self.connection_url = os.getenv('CONNECTION_URL')
        self.connection = None
        self._parse_connection_url()

    def _parse_connection_url(self):
        try:
            parsed = urlparse(self.connection_url)
            self.db_config = {
                'host': parsed.hostname,
                'port': parsed.port or 5432,
                'user': parsed.username,
                'password': parsed.password,
                'database': parsed.path.lstrip('/')
            }
        except Exception as e:
            raise Exception(f"Error parsing connection URL: {str(e)}")

    def _get_connection(self):
        if not self.connection or self.connection.closed:
            self.connection = psycopg2.connect(**self.db_config)
        return self.connection

    def generate_insights(self, table_name, data=None):
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            columns_query = """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position
            """
            cursor.execute(columns_query, (table_name,))
            columns_result = cursor.fetchall()
            
            if not columns_result:
                raise Exception(f"No columns found for table {table_name}")
            
            columns = [row[0] for row in columns_result]
            
            data_query = f'SELECT * FROM "{table_name}"'
            cursor.execute(data_query)
            data_rows = cursor.fetchall()
            
            table_data = []
            for row in data_rows:
                row_dict = {}
                for i, col in enumerate(columns):
                    if i < len(row):
                        value = row[i]
                        row_dict[col] = str(value) if value is not None else None
                    else:
                        row_dict[col] = None
                table_data.append(row_dict)
            
            cursor.close()
            
            return {
                "columns": columns,
                "data": table_data,
                "total_rows": len(table_data)
            }
            
        except Exception as e:
            raise Exception(f"Error getting table data: {str(e)}")

    def get_table_info(self, table_name):
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # PostgreSQL equivalent of DESCRIBE
            structure_query = """
                SELECT 
                    column_name as field,
                    data_type as type,
                    is_nullable as null,
                    column_default as default,
                    character_maximum_length as length
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position
            """
            cursor.execute(structure_query, (table_name,))
            structure = cursor.fetchall()
            
            count_query = f'SELECT COUNT(*) FROM "{table_name}"'
            cursor.execute(count_query)
            row_count = cursor.fetchone()[0]
            
            cursor.close()
            
            return {
                "table_name": table_name,
                "structure": [
                    {
                        "field": row[0],
                        "type": row[1],
                        "null": row[2],
                        "default": row[3],
                        "length": row[4]
                    } for row in structure
                ],
                "row_count": row_count
            }
            
        except Exception as e:
            raise Exception(f"Error getting table info: {str(e)}")

    def run_query(self, query, params=None):
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                result = {
                    "columns": columns,
                    "data": [
                        {col: (str(row[i]) if row[i] is not None else None) 
                         for i, col in enumerate(columns)}
                        for row in rows
                    ],
                    "total_rows": len(rows)
                }
            else:
                result = {
                    "affected_rows": cursor.rowcount,
                    "message": "Query executed successfully"
                }
            
            cursor.close()
            return result
            
        except Exception as e:
            raise Exception(f"Error executing query: {str(e)}")

    def get_sample_data(self, table_name, limit=10):
        try:
            query = f'SELECT * FROM "{table_name}" LIMIT %s'
            return self.run_query(query, (limit,))
        except Exception as e:
            raise Exception(f"Error getting sample data: {str(e)}")

    def close_connection(self):
        if self.connection and not self.connection.closed:
            self.connection.close()

    def __del__(self):
        self.close_connection()