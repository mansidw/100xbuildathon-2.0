import { User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import React from 'react';

const ChatMessage = ({ message, isLoading }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSystem ? 'bg-[#FFFFFF]/10' : 'bg-[#FFFFFF]/10'
                    }`}
                >
                    {isSystem ? (
                        <AlertCircle size={20} className="text-[#FFFFFF]" />
                    ) : (
                        <Bot size={20} className="text-[#FFFFFF]" />
                    )}
                </motion.div>
            )}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className={`max-w-3xl p-6 rounded-2xl ${
                    isUser
                        ? 'bg-[#000000]/50 backdrop-blur-sm text-[#FFFFFF]'
                        : isSystem
                            ? 'bg-[#FFFFFF]/10 text-[#FFFFFF]'
                            : 'bg-[#000000]/50 backdrop-blur-sm text-[#FFFFFF]'
                }`}
            >
                {message.isLoading ? (
                    <div className="flex items-center gap-1">
                        <span className="loading-dot">.</span>
                        <span className="loading-dot delay-100">.</span>
                        <span className="loading-dot delay-200">.</span>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-[#FFFFFF]"
                                    >
                                        {children}
                                    </motion.p>
                                ),
                                a: (props) => (
                                    <motion.a
                                        {...props}
                                        className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    />
                                ),
                                code: (props) => (
                                    <motion.code
                                        {...props}
                                        className="bg-[#000000] rounded px-1.5 py-0.5 font-mono text-sm text-[#FFFFFF]"
                                        whileHover={{ scale: 1.02 }}
                                    />
                                ),
                                pre: (props) => (
                                    <motion.pre
                                        {...props}
                                        className="bg-[#000000] rounded-lg p-4 overflow-x-auto"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ),
                                table: (props) => (
                                    <motion.div
                                        className="overflow-x-auto"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <table
                                            {...props}
                                            className="border-collapse table-auto w-full text-sm"
                                        />
                                    </motion.div>
                                ),
                                th: (props) => (
                                    <th
                                        {...props}
                                        className="border border-[#808080]/20 px-4 py-2 text-left bg-[#000000]/50"
                                    />
                                ),
                                td: (props) => (
                                    <td
                                        {...props}
                                        className="border border-[#808080]/20 px-4 py-2"
                                    />
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs mt-3 text-[#808080]"
                >
                    {message.timestamp}
                </motion.p>
            </motion.div>
            {isUser && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-10 h-10 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center flex-shrink-0"
                >
                    <User size={20} className="text-[#FFFFFF]" />
                </motion.div>
            )}
        </motion.div>
    );
};

export default React.memo(ChatMessage); 