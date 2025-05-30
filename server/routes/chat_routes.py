from flask import Blueprint
from controllers.chat_controller import ChatController

chat_bp = Blueprint('chat', __name__)
chat_controller = ChatController()

@chat_bp.route('/chat', methods=['POST'])
def chat():
    return chat_controller.process_chat() 