import { X, FileText, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import PropTypes from 'prop-types';
import { useState } from 'react';

const NewChatModal = ({
    isOpen,
    onClose,
    onCreate,
    isProcessing,
    roleName,
    setRoleName,
    jdFile,
    setJdFile,
    candidatesFile,
    setCandidatesFile,
}) => {
    const [chatType, setChatType] = useState('database'); // 'database' or 'global'
    const [globalChatName, setGlobalChatName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (chatType === 'global') {
            if (!globalChatName.trim()) return;
            onCreate({ chatType, globalChatName });
        } else {
            onCreate({ chatType });
        }
    };

    const processingSteps = [
        "Parsing job description...",
        "Analyzing candidate data...",
        "Building knowledge graph...",
        "Preparing insights engine...",
        "Initializing AI model..."
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[#000000]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        className="bg-[#000000] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-[#808080]/20"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-[#FFFFFF]">New Analysis</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="text-[#808080] hover:text-[#FFFFFF] transition-colors"
                                >
                                    <X size={28} />
                                </motion.button>
                            </div>
                            {/* Chat type toggle */}
                            <div className="flex gap-4 mb-8">
                                <button
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${chatType === 'database' ? 'bg-white text-black' : 'bg-[#222] text-[#aaa]'}`}
                                    onClick={() => setChatType('database')}
                                    type="button"
                                >
                                    Database Chat
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${chatType === 'global' ? 'bg-white text-black' : 'bg-[#222] text-[#aaa]'}`}
                                    onClick={() => setChatType('global')}
                                    type="button"
                                >
                                    Global Chat
                                </button>
                            </div>
                            {isProcessing ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-16"
                                >
                                    <div className="text-center relative h-96 overflow-hidden flex items-center justify-center">
                                        {/* Elegant Loading Animation */}
                                        
                                        {/* Subtle Background Particles */}
                                        {[...Array(100)].map((_, i) => (
                                            <motion.div
                                                key={`particle-${i}`}
                                                initial={{ x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500, scale: 0.5, opacity: 0 }}
                                                animate={{ 
                                                    x: Math.random() * 1000 - 500, 
                                                    y: Math.random() * 1000 - 500, 
                                                    scale: [0.5, 1, 0.5], 
                                                    opacity: [0, 0.3, 0] 
                                                }}
                                                transition={{ 
                                                    duration: 3, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut", 
                                                    delay: i * 0.02 
                                                }}
                                                className="absolute w-1 h-1 bg-[#FFFFFF] rounded-full"
                                            />
                                        ))}

                                        {/* Elegant Orbital Rings */}
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={`orbital-${i}`}
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: 360 }}
                                                transition={{ 
                                                    duration: 8 + i * 2, 
                                                    repeat: Infinity, 
                                                    ease: "linear" 
                                                }}
                                                className="absolute w-64 h-64 border border-[#FFFFFF]/10 rounded-full"
                                                style={{
                                                    transformOrigin: 'center center',
                                                    transform: `scale(${1 + i * 0.2})`
                                                }}
                                            />
                                        ))}

                                        {/* Central Pulsing Circle */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ 
                                                scale: [0.8, 1.2, 0.8],
                                                opacity: [0.5, 0.8, 0.5]
                                            }}
                                            transition={{ 
                                                duration: 2, 
                                                repeat: Infinity, 
                                                ease: "easeInOut" 
                                            }}
                                            className="absolute w-32 h-32 bg-gradient-to-r from-[#FFFFFF]/10 to-[#FFFFFF]/5 rounded-full backdrop-blur-sm"
                                        />

                                        {/* Elegant Data Flow Lines */}
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={`data-line-${i}`}
                                                initial={{ 
                                                    x: -200, 
                                                    y: Math.random() * 400 - 200,
                                                    opacity: 0 
                                                }}
                                                animate={{ 
                                                    x: 200, 
                                                    y: Math.random() * 400 - 200,
                                                    opacity: [0, 0.5, 0]
                                                }}
                                                transition={{ 
                                                    duration: 2, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut",
                                                    delay: i * 0.2
                                                }}
                                                className="absolute h-px w-40 bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent"
                                            />
                                        ))}

                                        {/* Processing Text */}
                                        <div className="absolute z-30 bottom-16 left-0 right-0 text-center">
                                            <h3 className="text-2xl font-semibold text-[#FFFFFF] mb-8">
                                                <Typewriter
                                                    words={processingSteps}
                                                    cursor
                                                    cursorStyle='_'
                                                    typeSpeed={60}
                                                    deleteSpeed={40}
                                                    loop={true}
                                                />
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-8"
                                >
                                    {chatType === 'global' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-[#808080] mb-3">
                                                    Chat Name
                                                </label>
                                                <motion.input
                                                    whileFocus={{ scale: 1.01 }}
                                                    type="text"
                                                    value={globalChatName}
                                                    onChange={e => setGlobalChatName(e.target.value)}
                                                    placeholder="e.g., Global Talent Search"
                                                    className="w-full p-4 bg-[#000000] border border-[#808080]/30 rounded-lg text-[#FFFFFF] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/30 focus:border-transparent text-lg"
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Database chat form fields (role, jd, candidates) */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#808080] mb-3">
                                                    Role Name
                                                </label>
                                                <motion.input
                                                    whileFocus={{ scale: 1.01 }}
                                                    type="text"
                                                    value={roleName}
                                                    onChange={(e) => setRoleName(e.target.value)}
                                                    placeholder="e.g., Senior Frontend Developer"
                                                    className="w-full p-4 bg-[#000000] border border-[#808080]/30 rounded-lg text-[#FFFFFF] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/30 focus:border-transparent text-lg"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#808080] mb-3">
                                                    Job Description
                                                </label>
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    className="relative"
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt"
                                                        onChange={(e) => setJdFile(e.target.files[0])}
                                                        className="hidden"
                                                        id="jd-file"
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="jd-file"
                                                        className="flex items-center gap-4 p-4 bg-[#000000] border border-[#808080]/30 rounded-lg cursor-pointer hover:bg-[#000000]/80 transition-colors text-lg"
                                                    >
                                                        <FileText size={24} className="text-[#808080]" />
                                                        <span className="text-[#FFFFFF]">
                                                            {jdFile ? jdFile.name : 'Upload Job Description'}
                                                        </span>
                                                    </label>
                                                </motion.div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#808080] mb-3">
                                                    Candidate Data
                                                </label>
                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    className="relative"
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".csv,.xlsx,.xls"
                                                        onChange={(e) => setCandidatesFile(e.target.files[0])}
                                                        className="hidden"
                                                        id="candidates-file"
                                                        required
                                                    />
                                                    <label
                                                        htmlFor="candidates-file"
                                                        className="flex items-center gap-4 p-4 bg-[#000000] border border-[#808080]/30 rounded-lg cursor-pointer hover:bg-[#000000]/80 transition-colors text-lg"
                                                    >
                                                        <Users size={24} className="text-[#808080]" />
                                                        <span className="text-[#FFFFFF]">
                                                            {candidatesFile ? candidatesFile.name : 'Upload Candidate Data'}
                                                        </span>
                                                    </label>
                                                </motion.div>
                                            </div>
                                        </>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-4 bg-[#FFFFFF] text-[#000000] font-medium rounded-lg hover:bg-[#FFFFFF]/90 transition-colors text-xl"
                                    >
                                        {chatType === 'global' ? 'Start Global Chat' : 'Start Analysis'}
                                    </motion.button>
                                </motion.form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

NewChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  roleName: PropTypes.string.isRequired,
  setRoleName: PropTypes.func.isRequired,
  jdFile: PropTypes.object,
  setJdFile: PropTypes.func.isRequired,
  candidatesFile: PropTypes.object,
  setCandidatesFile: PropTypes.func.isRequired,
};

export default NewChatModal; 