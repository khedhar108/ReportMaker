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
    const { students, examTitle, reportHeader, reportFooter } = useApp();
    const student = students.find((s) => s.rollNo === rollNo);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!student || !iframeRef.current) return;

        const html = generateReportHTML(student, examTitle, {
            headerImage: reportHeader.imageData,
            footerText: reportFooter.text
        });
        const iframe = iframeRef.current;

        // Write HTML directly to iframe
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
        }
    }, [student, examTitle, reportHeader, reportFooter]);

    if (!student) {
        return <div className="flex items-center justify-center min-h-[400px] text-slate-400">Student not found</div>;
    }

    const handleDownloadHTML = () => {
        if (!student) return;

        const html = generateReportHTML(student, examTitle, {
            headerImage: reportHeader.imageData,
            footerText: reportFooter.text
        });
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fatherPart = student.fatherName ? `_${student.fatherName.replace(/\s+/g, '_')}` : '';
        a.download = `${student.name.replace(/\s+/g, '_')}${fatherPart}_Report.html`;
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
            <div className="flex items-center justify-between mb-6 sticky top-4 z-50 max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wide">Back</span>
                    </button>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="text-slate-800 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Review Report
                    </div>
                </div>

                <button
                    onClick={handleDownloadHTML}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-white font-bold shadow-lg shadow-slate-900/20 transition-all text-sm group"
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
                    className="w-full border-0 min-h-screen shadow-2xl"
                    style={{ height: '100vh' }}
                />
            </div>
        </motion.div>
    );
}
