import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message }) => {
    return (
        <div
            className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
        >
            {message.type === 'ai' && (
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                </div>
            )}
            <div
                className={`max-w-3xl p-4 rounded-2xl ${message.type === 'user'
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-gray-100'
                    }`}
            >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
            </div>
            {message.type === 'user' && (
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default ChatMessage; 