import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import PropTypes from 'prop-types';

const WelcomeScreen = ({ onStart, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex-1 flex items-center justify-center relative"
  >
    <button
      onClick={onLogout}
      className="absolute top-6 right-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition"
    >
      Logout
    </button>
    <div className="text-center max-w-md">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="w-24 h-24 bg-[#FFFFFF]/10 rounded-full flex items-center justify-center mx-auto mb-6"
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
          words={["Hire AI"]}
          cursor
          cursorStyle="_"
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
        onClick={onStart}
        className="px-8 py-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-all duration-300 inline-flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl"
      >
        Start New Analysis
      </motion.button>
    </div>
  </motion.div>
);

WelcomeScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen; 