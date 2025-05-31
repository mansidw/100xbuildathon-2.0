import { Plus, MessageSquare } from 'lucide-react';

const ChatSidebar = ({ chats, activeChat, onChatSelect, onNewChat }) => {
    return (
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>New Chat</span>
                </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chats.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No chats yet</p>
                        <p className="text-sm">Create a new chat to get started</p>
                    </div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onChatSelect(chat)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                activeChat?.id === chat.id
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800/50'
                            }`}
                        >
                            <div className="font-medium truncate">{chat.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {chat.fileName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {chat.createdAt}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatSidebar; 