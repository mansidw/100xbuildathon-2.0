import { Send, Bot } from 'lucide-react';
import useChat from '../../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import NewChatModal from './NewChatModal';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState(''); // Local state for input

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!localMessage.trim()) return;

    const currentMessage = localMessage;
    setLocalMessage(''); // Clear local input immediately
    setMessage(''); // Also clear the state in useChat

    try {
      await sendMessage(currentMessage);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  // Add highlight animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const elements = document.querySelectorAll('.highlight-animation');
      elements.forEach((el) => {
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 1000);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#000000] font-['Inter'] overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={() => setShowNewChatModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-0">
        <AnimatePresence mode="wait">
          {!activeChat ? (
            /* Welcome Screen */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center max-w-md">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-24 h-24 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-6 highlight-animation"
                >
                  <Bot size={40} className="text-[#FFFFFF]" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold mb-4 text-[#FFFFFF]"
                >
                  <Typewriter
                    words={['Hire AI']}
                    cursor
                    cursorStyle='_'
                    typeSpeed={70}
                    deleteSpeed={50}
                  />
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#808080] mb-8 text-lg"
                >
                  Upload candidate data and get intelligent insights to make better hiring decisions.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewChatModal(true)}
                  className="px-8 py-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 inline-flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  Start New Analysis
                </motion.button>
              </div>
            </motion.div>
          ) : !activeChat.processed ? (
            /* Processing Screen */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-16 h-16 border-4 border-[#FFFFFF] border-t-transparent rounded-full mx-auto mb-6"
                />
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold mb-4 text-[#FFFFFF]"
                >
                  Processing Your Data
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-[#808080] text-lg mb-2">
                    Analyzing {activeChat.fileName} for {activeChat.roleName} position
                  </p>
                  <div className="flex flex-col gap-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-1 bg-[#808080]/20 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-[#FFFFFF]"
                      />
                    </motion.div>
                    <p className="text-sm text-[#808080]">
                      This may take a few moments...
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Chat Interface */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-b border-[#808080]/20 p-6 bg-[#000000]/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#FFFFFF]">{activeChat.title}</h2>
                    <p className="text-sm text-[#808080]">
                      Analyzing data from {activeChat.fileName}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 text-base font-medium shadow hover:shadow-lg"
                  >
                    View Insights
                  </button>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 h-0">
                <AnimatePresence>
                  {activeChat.messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <Bot size={48} className="mx-auto mb-4 text-[#808080]" />
                      <p className="text-[#FFFFFF] mb-2 text-lg">Ready to analyze your data!</p>
                      <p className="text-sm text-[#808080]">
                        Ask questions about candidate insights, skills analysis, or hiring recommendations.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {activeChat.messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ChatMessage
                            message={message}
                            isLoading={message.isLoading}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <MemoizedInputArea
                message={localMessage}
                setMessage={setLocalMessage}
                handleKeyPress={handleKeyPress}
                handleSendMessage={handleSendMessage}
              />
            </motion.div>
          )}
        </AnimatePresence>
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

// Create a memoized component for the input area
const MemoizedInputArea = React.memo(({ message: localMessage, setMessage: setLocalMessage, handleKeyPress, handleSendMessage }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-[#808080]/20 p-6 bg-[#000000]/50 backdrop-blur-sm"
    >
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about candidate insights, skills analysis, or hiring recommendations..."
            className="w-full p-4 pr-12 bg-[#000000] text-[#FFFFFF] border border-[#808080]/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-transparent placeholder-[#808080]"
            rows={1}
            style={{ minHeight: '56px' }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!localMessage.trim()}
          className="px-4 py-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 disabled:bg-[#808080]/20 disabled:text-[#808080] disabled:cursor-not-allowed rounded-xl transition-all duration-300"
        >
          <Send size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
});

export default RecruiterChatInterface; 