import { Send, Bot } from 'lucide-react';
import useChat from '../../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import NewChatModal from './NewChatModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

const RecruiterChatInterface = () => {
  const {
    chats,
    activeChat,
    showNewChatModal,
    isProcessing,
    message,
    roleName,
    jobDescription,
    file,
    jdFile,
    candidatesFile,
    messagesEndRef,
    setActiveChat,
    setShowNewChatModal,
    setMessage,
    setRoleName,
    setJobDescription,
    setFile,
    setJdFile,
    setCandidatesFile,
    createNewChat,
    sendMessage
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage(''); // Clear input immediately

    try {
      await sendMessage(currentMessage);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={() => setShowNewChatModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">Recruiter Insights AI</h1>
              <p className="text-gray-400 mb-8">
                Upload candidate data and get intelligent insights to make better hiring decisions.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        ) : !activeChat.processed ? (
          /* Processing Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-white">Processing Your Data</h2>
              <p className="text-gray-400 mb-2">
                Analyzing {activeChat.fileName} for {activeChat.roleName} position
              </p>
              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-800 p-4">
              <h2 className="text-xl font-semibold text-white">{activeChat.title}</h2>
              <p className="text-sm text-gray-400">
                Analyzing data from {activeChat.fileName}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeChat.messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-300 mb-2">Ready to analyze your data!</p>
                  <p className="text-sm text-gray-500">
                    Ask questions about candidate insights, skills analysis, or hiring recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeChat.messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      isLoading={message.isLoading}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about candidate insights, skills analysis, or hiring recommendations..."
                    className="w-full p-4 pr-12 bg-gray-900 text-white border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent placeholder-gray-500"
                    rows={1}
                    style={{ minHeight: '56px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="px-4 py-4 bg-white text-black hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setRoleName('');
          setJdFile(null);
          setCandidatesFile(null);
        }}
        onCreate={createNewChat}
        isProcessing={isProcessing}
        roleName={roleName}
        setRoleName={setRoleName}
        jdFile={jdFile}
        setJdFile={setJdFile}
        candidatesFile={candidatesFile}
        setCandidatesFile={setCandidatesFile}
      />
    </div>
  );
};

export default RecruiterChatInterface; 