import { User, Bot, AlertCircle, ExternalLink, Linkedin, Github, Mail } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = React.memo(({ message, isLoading, onFollowup }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    const extractLinks = (content) => {
        if (!content || typeof content !== 'string') return [];
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
        const links = [];
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            links.push({ text: match[1], url: match[2] });
        }
        return links;
    };

    const professionalLinks = !isUser && !isLoading ? extractLinks(message.content) : [];

    // Function to safely render markdown with fallback
    const renderContent = (content) => {
        if (!content || typeof content !== 'string') {
            return <div className="text-[#808080]">No content available</div>;
        }

        // Check if content contains markdown elements
        const hasMarkdown = /[#*`\[\]()]/.test(content);
        
        if (!hasMarkdown) {
            // If no markdown detected, render as plain text with line breaks
            return (
                <div className="whitespace-pre-wrap text-[#FFFFFF]/90">
                    {content}
                </div>
            );
        }

        try {
            return (
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline" />
                            ),
                            h2: (props) => <h2 {...props} className="text-xl font-bold border-b border-gray-700 pb-2 mb-4" />,
                            h3: (props) => <h3 {...props} className="text-lg font-semibold mb-3" />,
                            ul: (props) => <ul {...props} className="list-disc pl-5 space-y-2" />,
                            li: (props) => <li {...props} className="text-gray-300" />,
                            p: (props) => <p {...props} className="text-gray-300 mb-2" />,
                            strong: (props) => <strong {...props} className="text-white font-semibold" />,
                            code: (props) => <code {...props} className="bg-[#FFFFFF]/10 px-1 py-0.5 rounded text-sm" />,
                            pre: (props) => <pre {...props} className="bg-[#FFFFFF]/10 p-3 rounded-lg overflow-x-auto" />,
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            );
        } catch (error) {
            console.error('Markdown parsing error:', error);
            // Fallback to plain text with line breaks
            return (
                <div className="whitespace-pre-wrap text-[#FFFFFF]/90">
                    {content}
                </div>
            );
        }
    };

    return (
        <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSystem ? 'bg-[#FFFFFF]/10' : 'bg-[#FFFFFF]/10'}`}>
                    {isSystem ? <AlertCircle size={20} className="text-[#FFFFFF]" /> : <Bot size={20} className="text-[#FFFFFF]" />}
                </div>
            )}
            <div className={`max-w-4xl p-6 rounded-2xl ${isUser ? 'bg-[#000000]/50 backdrop-blur-sm text-[#FFFFFF]' : isSystem ? 'bg-[#FFFFFF]/10 text-[#FFFFFF]' : 'bg-[#000000]/50 backdrop-blur-sm text-[#FFFFFF]'}`}>
                {message.isLoading ? (
                    <div className="flex items-center gap-1">
                        <span className="loading-dot">.</span>
                        <span className="loading-dot delay-100">.</span>
                        <span className="loading-dot delay-200">.</span>
                    </div>
                ) : (
                    renderContent(message.content)
                )}
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
                <div className="w-10 h-10 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-[#FFFFFF]" />
                </div>
            )}
        </div>
    );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage; 