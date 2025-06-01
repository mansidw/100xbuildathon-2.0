import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSidebar = ({ chats, activeChat, onChatSelect, onNewChat }) => {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 bg-[#000000] border-r border-[#808080]/20 flex flex-col h-full sticky top-0"
        >
            {/* Header */}
            <div className="p-4 border-b border-[#808080]/20">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNewChat}
                    className="w-full py-3 px-4 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    New Analysis
                </motion.button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <AnimatePresence>
                    {chats.map((chat) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChatSelect(chat)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                activeChat?.id === chat.id
                                    ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]'
                                    : 'hover:bg-[#808080]/10 text-[#FFFFFF]'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare size={20} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{chat.title}</p>
                                    <p className="text-sm text-[#808080] truncate">
                                        {chat.roleName}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add delete functionality here
                                    }}
                                    className="p-1 hover:bg-[#808080]/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} className="text-[#808080]" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#808080]/20">
                <div className="text-center text-sm text-[#808080]">
                    <p>Hire AI</p>
                    <p className="text-xs mt-1">v1.0.0</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatSidebar; 