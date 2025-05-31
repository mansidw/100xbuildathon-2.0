import os
import json
import pymysql
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

class InsightsService:
    def __init__(self):
        # Parse connection URL
        self.connection_url = os.getenv('CONNECTION_URL')
        self.connection = None
        self._parse_connection_url()

    def _parse_connection_url(self):
        """Parse MySQL connection URL and extract components"""
        try:
            parsed = urlparse(self.connection_url)
            self.db_config = {
                'host': parsed.hostname,
                'port': parsed.port or 3306,
                'user': parsed.username,
                'password': parsed.password,
                'database': parsed.path.lstrip('/'),
                'charset': 'utf8mb4',
                'autocommit': True
            }
        except Exception as e:
            raise Exception(f"Error parsing connection URL: {str(e)}")

    def _get_connection(self):
        """Get database connection"""
        if not self.connection or not self.connection.open:
            self.connection = pymysql.connect(**self.db_config)
        return self.connection

    def generate_insights(self, table_name, data=None):
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Get column names
            columns_query = """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = %s 
                AND table_name = %s
                ORDER BY ordinal_position
            """
            cursor.execute(columns_query, (self.db_config['database'], table_name))
            columns_result = cursor.fetchall()
            
            if not columns_result:
                raise Exception(f"No columns found for table {table_name}")
            
            columns = [row[0] for row in columns_result]
            
            # Get all data from table
            data_query = f"SELECT * FROM `{table_name}`"
            cursor.execute(data_query)
            data_rows = cursor.fetchall()
            
            # Convert rows to dictionaries
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
        """Get table structure information"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Get table structure
            describe_query = f"DESCRIBE `{table_name}`"
            cursor.execute(describe_query)
            structure = cursor.fetchall()
            
            # Get row count
            count_query = f"SELECT COUNT(*) FROM `{table_name}`"
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
                        "key": row[3],
                        "default": row[4],
                        "extra": row[5]
                    } for row in structure
                ],
                "row_count": row_count
            }
            
        except Exception as e:
            raise Exception(f"Error getting table info: {str(e)}")

    def run_query(self, query, params=None):
        """Execute a custom query"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # Check if it's a SELECT query
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
        """Get sample data from table"""
        try:
            query = f"SELECT * FROM `{table_name}` LIMIT %s"
            return self.run_query(query, (limit,))
        except Exception as e:
            raise Exception(f"Error getting sample data: {str(e)}")

    def close_connection(self):
        """Close database connection"""
        if self.connection and self.connection.open:
            self.connection.close()

    def __del__(self):
        """Cleanup connection on object destruction"""
        self.close_connection()