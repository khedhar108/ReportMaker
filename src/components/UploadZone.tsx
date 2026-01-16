import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseExcelFile } from '../utils/excelParser';
import { analyzeExcelData } from '../services/excelAnalysisService';
import { useApp } from '../context/AppContext';

interface UploadZoneProps {
    onSuccess: () => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
    const { settings, setStudents, setLoading, isLoading } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [context, setContext] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });

    const removeFile = () => {
        setFile(null);
        setError(null);
    };

    const handleProcess = async () => {
        if (!file) return;

        if (!settings.apiKey) {
            setError('Please configure your Groq API key in settings first.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const excelData = await parseExcelFile(file);
            // Use the specialized Excel Analysis service
            const result = await analyzeExcelData(settings.apiKey, settings.model, excelData, context);
            setStudents(result.students, result.summary);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const dropzoneProps = getRootProps();

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Drag and Drop Zone */}
            <div
                onClick={dropzoneProps.onClick}
                onKeyDown={dropzoneProps.onKeyDown}
                onFocus={dropzoneProps.onFocus}
                onBlur={dropzoneProps.onBlur}
                onDragEnter={dropzoneProps.onDragEnter}
                onDragLeave={dropzoneProps.onDragLeave}
                onDragOver={dropzoneProps.onDragOver}
                onDrop={dropzoneProps.onDrop}
                tabIndex={dropzoneProps.tabIndex}
                role={dropzoneProps.role}
            >
                <motion.div
                    className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                        ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                        : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                        }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence mode="wait">
                        {file ? (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-center gap-4"
                            >
                                <FileSpreadsheet className="w-12 h-12 text-green-400" />
                                <div className="text-left">
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-slate-400 text-sm">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Drop your Excel file here
                                </h3>
                                <p className="text-slate-400">
                                    or <span className="text-purple-400 underline">browse files</span>
                                </p>
                                <p className="text-slate-500 text-sm mt-2">
                                    Supports .xlsx, .xls, .csv
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Context Input Field */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    AI Instructions & Marking Scheme (Optional)
                </label>
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="E.g., Total marks are 50. Pass rate is 40%. Math is out of 30. Please be strict with remarks."
                    className="w-full bg-black/20 text-white rounded-xl border border-white/10 p-3 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 min-h-[80px]"
                />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-center mt-4"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Process Button */}
            <motion.button
                onClick={handleProcess}
                disabled={!file || isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${file && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                whileTap={file && !isLoading ? { scale: 0.98 } : {}}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing with AI...
                    </>
                ) : (
                    'Analyze & Generate Reports'
                )}
            </motion.button>
        </div>
    );
}
