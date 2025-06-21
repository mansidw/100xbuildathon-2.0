import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, Briefcase } from 'lucide-react';
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
    setJobDescription('');
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

  // Simple parsing to extract clean points
  const parseJobDescription = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const points = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('*')) {
        // Remove markdown syntax and clean up
        const cleanPoint = trimmedLine
          .replace(/^\*\s*/, '') // Remove leading * and spaces
          .replace(/\*\*/g, '') // Remove **
          .trim();
        if (cleanPoint) {
          points.push(cleanPoint);
        }
      }
    });
    
    return points;
  };

  const jobPoints = parseJobDescription(jobDescription);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#1a1a1a] border border-[#808080]/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#808080]/20 bg-[#000000]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFFFFF]/10 rounded-lg flex items-center justify-center">
                  <Briefcase size={20} className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#FFFFFF]">Job Description</h2>
                  <p className="text-sm text-[#808080]">Role details and requirements</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#808080]/10 hover:bg-[#808080]/20 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-[#FFFFFF]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={24} className="text-[#FFFFFF] animate-spin" />
                  <span className="text-[#FFFFFF] font-medium">Loading job description...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobPoints.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-[#808080]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText size={20} className="text-[#808080]" />
                    </div>
                    <p className="text-[#FFFFFF] font-medium mb-1">No job description available</p>
                    <p className="text-[#808080] text-sm">The job description for this role hasn't been uploaded yet.</p>
                  </div>
                ) : (
                  jobPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-2 h-2 bg-[#FFFFFF]/60 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-[#FFFFFF]/90 leading-relaxed">
                        {point}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-[#808080]/20 bg-[#000000]/30">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-colors font-medium text-sm"
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