import { motion } from 'framer-motion';
import { generateReportHTML } from '../utils/reportTemplate';
import { ArrowLeft, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';

interface ReportViewProps {
    rollNo: string;
    onBack: () => void;
}

export function ReportView({ rollNo, onBack }: ReportViewProps) {
    const { students } = useApp();
    const student = students.find((s) => s.rollNo === rollNo);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!student || !iframeRef.current) return;

        const html = generateReportHTML(student);
        const iframe = iframeRef.current;

        // Write HTML directly to iframe
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
        }
    }, [student]);

    if (!student) {
        return <div className="flex items-center justify-center min-h-[400px] text-slate-400">Student not found</div>;
    }

    const startDownload = () => {
        if (!student) return;

        const html = generateReportHTML(student);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.name.replace(/\s+/g, '_')}_Report.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pb-20"
        >
            {/* Preview mode Toolbar */}
            <div className="flex items-center justify-between mb-6 sticky top-4 z-50 max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-white font-bold text-sm">Live Preview</div>
                </div>

                <button
                    onClick={startDownload}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-full text-white font-bold shadow-2xl shadow-emerald-500/20 transition-all text-sm group"
                >
                    <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Download HTML
                </button>
            </div>

            {/* FULL-WIDTH IFRAME PREVIEW (1:1 with Download) */}
            <div className="w-full bg-slate-100">
                <iframe
                    ref={iframeRef}
                    title="Report Preview"
                    className="w-full border-0 min-h-screen"
                    style={{ height: '100vh' }}
                />
            </div>
        </motion.div>
    );
}
