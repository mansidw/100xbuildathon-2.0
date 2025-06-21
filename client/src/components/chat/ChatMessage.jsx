import { User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import React from 'react';

const ChatMessage = React.memo(({ message, isLoading, onFollowup }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
        <div
            className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSystem ? 'bg-[#FFFFFF]/10' : 'bg-[#FFFFFF]/10'
                        }`}
                >
                    {isSystem ? (
                        <AlertCircle size={20} className="text-[#FFFFFF]" />
                    ) : (
                        <Bot size={20} className="text-[#FFFFFF]" />
                    )}
                </div>
            )}
            <div
                className={`max-w-3xl p-6 rounded-2xl ${isUser
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
                                    <p className="text-[#FFFFFF]">
                                        {children}
                                    </p>
                                ),
                                a: (props) => (
                                    <a
                                        {...props}
                                        className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                code: (props) => (
                                    <code
                                        {...props}
                                        className="bg-[#000000] rounded px-1.5 py-0.5 font-mono text-sm text-[#FFFFFF]"
                                    />
                                ),
                                pre: (props) => (
                                    <pre
                                        {...props}
                                        className="bg-[#000000] rounded-lg p-4 overflow-x-auto"
                                    />
                                ),
                                table: (props) => (
                                    <div className="overflow-x-auto">
                                        <table
                                            {...props}
                                            className="border-collapse table-auto w-full text-sm"
                                        />
                                    </div>
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
                {/* Followup chips */}
                {Array.isArray(message.followups) && message.followups.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-6 justify-start">
                        {message.followups.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => onFollowup && onFollowup(q)}
                                className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold shadow hover:bg-gray-200 transition border border-[#e5e7eb]"
                                style={{ minWidth: 'fit-content' }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-xs mt-3 text-[#808080]">
                    {message.timestamp}
                </p>
            </div>
            {isUser && (
                <div
                    className="w-10 h-10 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center flex-shrink-0"
                >
                    <User size={20} className="text-[#FFFFFF]" />
                </div>
            )}
        </div>
    );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage; 