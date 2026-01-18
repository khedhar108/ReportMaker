import { useState } from 'react';
import { Mail, User, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DeveloperCredit() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.button
                        key="collapsed"
                        layoutId="credit-card"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setIsExpanded(true)}
                        className="flex flex-col items-end gap-1 p-3 px-5 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:border-purple-500/50 hover:bg-slate-900/60 transition-all duration-300 group text-right cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Creator</span>
                            <User className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            Pradeep Kumar
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors text-[11px]">
                            <Mail className="w-3 h-3" />
                            khedhar.pradeep@gmail.com
                        </div>
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded"
                        layoutId="credit-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center gap-6 relative"
                    >
                        {/* Close Button - Enhanced hit area and z-index */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="absolute top-6 right-6 z-[60] p-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-full transition-all duration-300 group cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        </button>

                        {/* Profile Image */}
                        <div className="relative group/img cursor-pointer mt-4" onClick={() => window.open('/images/dev.png', '_blank')}>
                            <div className="absolute -inset-8 bg-gradient-to-tr from-purple-500/30 via-indigo-500/30 to-cyan-500/30 rounded-[3rem] blur-3xl animate-pulse" />

                            <div className="relative w-64 h-64 bg-slate-800 rounded-[2.5rem] p-1.5 border border-white/10 overflow-hidden shadow-inner group-hover:border-purple-500/50 transition-colors duration-500">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-900/50 relative">
                                    <img
                                        src="/images/dev.png"
                                        alt="Pradeep Kumar"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pradeep';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <ExternalLink className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="text-center w-full space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Pradeep Kumar</h3>
                                <p className="text-xs font-medium text-purple-400 uppercase tracking-widest mt-1">Lead Developer</p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <a
                                    href="mailto:khedhar.pradeep@gmail.com"
                                    className="flex items-center justify-center gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Mail className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-semibold text-white/80 group-hover:text-white truncate max-w-[180px]">khedhar.pradeep@gmail.com</span>
                                </a>
                            </div>
                        </div>

                        <div className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
                            Available for support
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
