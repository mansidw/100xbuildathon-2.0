import React, { useState, useEffect } from 'react';
import { X, Loader2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getJobDescription } from '../../services/api';
import toast from 'react-hot-toast';

const JobDescriptionModal = ({ isOpen, onClose, tableName }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tableName) {
      fetchJobDescription();
    }
  }, [isOpen, tableName]);

  const fetchJobDescription = async () => {
    setIsLoading(true);
    try {
      const response = await getJobDescription(tableName);
      setJobDescription(response.job_desc || response.result || response.description || 'No job description available');
    } catch (error) {
      console.error('Error fetching job description:', error);
      toast.error('Failed to load job description');
      setJobDescription('Unable to load job description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseJobDescription = (text) => {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
  };

  const jobPoints = parseJobDescription(jobDescription);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-black border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 flex-shrink-0 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Briefcase size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Job Description</h2>
                  <p className="text-sm text-white/60">Role details and requirements</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 size={28} className="text-white animate-spin" />
                  <span className="text-white font-medium">Loading Description...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {jobPoints.map((point, index) => {
                  const cleanedPoint = point.replace(/^\*\s*/, '');
                  const parts = cleanedPoint.split(/:(.*)/);
                  const title = parts[0] ? `${parts[0].replace(/\*\*/g, '')}:` : '';
                  const description = parts[1] ? parts[1].replace(/\*\*/g, '').trim() : '';

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-2 h-2 bg-white/50 rounded-full mt-[10px] flex-shrink-0" />
                      <p className="text-white leading-relaxed text-base">
                        <span className="font-semibold">{title}</span>
                        {description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 flex-shrink-0 border-t border-white/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobDescriptionModal; 