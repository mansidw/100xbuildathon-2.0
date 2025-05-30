from flask import Blueprint, jsonify, request
from services.chat_service import ChatService

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    table_name = data.get('tableName')
    query = data.get('query')
    
    if not table_name or not query:
        return jsonify({'error': 'tableName and query are required'}), 400
        
    try:
        result = chat_service.process_query(table_name, query)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 