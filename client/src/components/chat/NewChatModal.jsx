import { X, Upload, FileText, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

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
    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate();
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
                    className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#000000] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#808080]/20"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[#FFFFFF]">New Analysis</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="text-[#808080] hover:text-[#FFFFFF] transition-colors"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {isProcessing ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12"
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
                                            className="w-16 h-16 border-4 border-[#FFFFFF] border-t-transparent rounded-full mx-auto mb-8"
                                        />
                                        <h3 className="text-xl font-semibold text-[#FFFFFF] mb-6">
                                            <Typewriter
                                                words={processingSteps}
                                                cursor
                                                cursorStyle='_'
                                                typeSpeed={50}
                                                deleteSpeed={30}
                                                loop={true}
                                            />
                                        </h3>
                                        <div className="space-y-4">
                                            {processingSteps.map((step, index) => (
                                                <motion.div
                                                    key={step}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.2 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            opacity: [0.5, 1, 0.5],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: index * 0.2,
                                                        }}
                                                        className="w-2 h-2 bg-[#FFFFFF] rounded-full"
                                                    />
                                                    <span className="text-[#808080]">{step}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2">
                                            Role Name
                                        </label>
                                        <motion.input
                                            whileFocus={{ scale: 1.02 }}
                                            type="text"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            placeholder="e.g., Senior Frontend Developer"
                                            className="w-full p-3 bg-[#000000] border border-[#808080]/20 rounded-lg text-[#FFFFFF] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#008000]/20 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2">
                                            Job Description
                                        </label>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
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
                                                className="flex items-center gap-3 p-4 bg-[#000000] border border-[#808080]/20 rounded-lg cursor-pointer hover:bg-[#000000]/80 transition-colors"
                                            >
                                                <FileText size={20} className="text-[#808080]" />
                                                <span className="text-[#FFFFFF]">
                                                    {jdFile ? jdFile.name : 'Upload Job Description'}
                                                </span>
                                            </label>
                                        </motion.div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2">
                                            Candidate Data
                                        </label>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
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
                                                className="flex items-center gap-3 p-4 bg-[#000000] border border-[#808080]/20 rounded-lg cursor-pointer hover:bg-[#000000]/80 transition-colors"
                                            >
                                                <Users size={20} className="text-[#808080]" />
                                                <span className="text-[#FFFFFF]">
                                                    {candidatesFile ? candidatesFile.name : 'Upload Candidate Data'}
                                                </span>
                                            </label>
                                        </motion.div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full py-4 bg-[#FFFFFF] text-[#000000] font-medium rounded-lg hover:bg-[#FFFFFF]/90 transition-colors"
                                    >
                                        Start Analysis
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

export default NewChatModal; 