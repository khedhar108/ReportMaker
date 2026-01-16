import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, setApiKey, setModel } = useApp();
    const [key, setKey] = useState(settings.apiKey);
    const [model, setModelValue] = useState(settings.model);
    const [showKey, setShowKey] = useState(false);

    const handleSave = () => {
        setApiKey(key);
        setModel(model);
        onClose();
    };



    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">⚙️ AI Settings</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* API Key Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">
                                Groq API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-12"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                                >
                                    {showKey ? (
                                        <EyeOff className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Get your key at{' '}
                                <a
                                    href="https://console.groq.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:underline"
                                >
                                    console.groq.com
                                </a>
                            </p>
                        </div>

                        {/* Model Selection */}
                        <div className="mb-6">
                            <label className="block text-sm text-slate-400 mb-2">Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModelValue(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                                <option value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</option>
                                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
                                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                                <option value="gemma2-9b-it">Gemma 2 9B</option>
                            </select>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Save className="w-4 h-4" />
                            Save Configuration
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
