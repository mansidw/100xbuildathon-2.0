import { User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, isLoading }) => {
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
            {message.type === 'system' && (
                <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-yellow-500" />
                </div>
            )}
            <div
                className={`max-w-3xl p-4 rounded-2xl ${message.type === 'user'
                    ? 'bg-white text-black'
                    : message.type === 'system'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-gray-800 text-gray-100'
                    }`}
            >
                {message.isLoading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 size={16} className="animate-spin" />
                        <div>
                            <div className="h-4 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Style links
                                a: (props) => (
                                    <a
                                        {...props}
                                        className="text-blue-400 hover:text-blue-300 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                ),
                                // Style code blocks
                                code: (props) => (
                                    <code
                                        {...props}
                                        className="bg-black/30 rounded px-1 py-0.5 font-mono text-sm"
                                    />
                                ),
                                // Style code blocks with language
                                pre: (props) => (
                                    <pre
                                        {...props}
                                        className="bg-black/30 rounded-lg p-3 overflow-x-auto"
                                    />
                                ),
                                // Style tables
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
                                        className="border border-gray-600 px-4 py-2 text-left"
                                    />
                                ),
                                td: (props) => (
                                    <td
                                        {...props}
                                        className="border border-gray-600 px-4 py-2"
                                    />
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
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