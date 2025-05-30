from flask import jsonify, request
from services.chat_service import ChatService
from services.db_service import DatabaseService

class ChatController:
    def __init__(self):
        self.db_service = DatabaseService()
        self.chat_service = ChatService(self.db_service)

    def process_chat(self):
        data = request.get_json()
        table_name = data.get('tableName')
        query = data.get('query')
        
        if not table_name or not query:
            return jsonify({'error': 'tableName and query are required'}), 400
            
        try:
            result = self.chat_service.process_query(table_name, query)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500 