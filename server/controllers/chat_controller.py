from flask import jsonify, request
from services.chat_service import ChatService


class ChatController:
    def __init__(self):
        self.chat_service = ChatService()

    def process_chat(self):
        data = request.get_json()
        table_name = data.get("tableName")
        query = data.get("query")
        user_id = data.get("user_id")

        if not table_name or not query:
            return jsonify({"error": "tableName and query are required"}), 400

        try:
            result = self.chat_service.process_query(table_name, query, user_id)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
