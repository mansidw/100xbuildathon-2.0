import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ProcessingScreen = ({ fileName, roleName }) => (
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
          ease: "linear",
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
          Analyzing {fileName} for {roleName} position
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
);

ProcessingScreen.propTypes = {
  fileName: PropTypes.string,
  roleName: PropTypes.string,
};

ProcessingScreen.displayName = 'ProcessingScreen';

export default ProcessingScreen; 