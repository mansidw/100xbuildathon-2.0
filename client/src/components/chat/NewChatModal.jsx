import { Upload, FileText, Loader2 } from 'lucide-react';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-md mx-4 border border-gray-800">
                <h3 className="text-xl font-bold mb-6">Create New Analysis</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Role Name</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Job Description (JD)</label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={(e) => setJdFile(e.target.files[0])}
                                className="hidden"
                                id="jd-upload"
                            />
                            <label htmlFor="jd-upload" className="cursor-pointer">
                                {jdFile ? (
                                    <div className="flex items-center justify-center gap-2 text-green-400">
                                        <FileText size={20} />
                                        <span>{jdFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p>Click to upload or drag and drop</p>
                                        <p className="text-sm">Supported formats: PDF, DOC, DOCX, TXT</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Candidates Data</label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => setCandidatesFile(e.target.files[0])}
                                className="hidden"
                                id="candidates-upload"
                            />
                            <label htmlFor="candidates-upload" className="cursor-pointer">
                                {candidatesFile ? (
                                    <div className="flex items-center justify-center gap-2 text-green-400">
                                        <FileText size={20} />
                                        <span>{candidatesFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p>Click to upload or drag and drop</p>
                                        <p className="text-sm">Excel files (.xlsx, .xls, .csv)</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onCreate}
                        disabled={!roleName || !jdFile || !candidatesFile || isProcessing}
                        className="flex-1 px-4 py-2 bg-white text-black hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Create & Process'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal; 