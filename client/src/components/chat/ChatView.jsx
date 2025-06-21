import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import PropTypes from 'prop-types';

const ChatView = ({
  activeChat,
  onLogout,
  onShowDashboard,
  onShowJd,
  messages,
  followupLoading,
  messagesEndRef,
  localMessage,
  setLocalMessage,
  handleSendMessage,
  isLoading,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex-1 flex flex-col h-full"
  >
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b border-[#808080]/20 p-6 bg-[#000000]/50 backdrop-blur-sm sticky top-0 z-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#FFFFFF]">
            {activeChat.title}
          </h2>
          <p className="text-sm text-[#808080]">
            {activeChat.type === 'global'
              ? 'Global Chat'
              : `Analyzing data from ${activeChat.fileName}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeChat.type !== 'global' && (
            <>
              <button
                onClick={onShowDashboard}
                className="px-6 py-2 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 text-base font-medium shadow hover:shadow-lg"
              >
                View Dashboard
              </button>
              <button
                onClick={onShowJd}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg shadow hover:bg-secondary/90 transition"
              >
                View Job Description
              </button>
            </>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg shadow hover:bg-destructive/90 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>

    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <AnimatePresence>
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            message={msg}
            onFollowup={handleSendMessage}
          />
        ))}
      </AnimatePresence>
      {followupLoading && (
        <div className="flex justify-start">
          <div className="max-w-4xl p-4 rounded-2xl bg-[#000000]/50 backdrop-blur-sm text-[#FFFFFF]">
            <div className="flex items-center gap-1">
              <span className="loading-dot">.</span>
              <span className="loading-dot delay-100">.</span>
              <span className="loading-dot delay-200">.</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-6 bg-[#000000]/50 backdrop-blur-sm sticky bottom-0"
    >
      <div className="relative">
        <textarea
          value={localMessage}
          onChange={(e) => setLocalMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a follow-up question..."
          className="w-full bg-[#FFFFFF]/10 text-[#FFFFFF] placeholder-[#808080] rounded-lg p-6 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50 transition scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage()}
          className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-[#FFFFFF] text-[#000000] rounded-full p-3 hover:bg-[#FFFFFF]/90 disabled:bg-gray-600 transition"
          disabled={!localMessage.trim() || isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  </motion.div>
);

ChatView.propTypes = {
  activeChat: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onShowDashboard: PropTypes.func.isRequired,
  onShowJd: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  followupLoading: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  localMessage: PropTypes.string.isRequired,
  setLocalMessage: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

ChatView.displayName = 'ChatView';

export default ChatView; 