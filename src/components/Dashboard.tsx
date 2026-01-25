import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, BarChart3, Download, PlusCircle, PenLine, Loader2, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportProcessedDataToExcel } from '../utils/excelExport';
import { StudentCard } from './StudentCard';
import { ManualEntryForm } from './ManualEntryForm';
import { analyzeManualEntry } from '../services/manualEntryService';
import { generateReportHTML } from '../utils/reportTemplate';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import JSZip from 'jszip';

interface DashboardProps {
    onViewReport: (rollNo: string) => void;
    onNewAnalysis: () => void;
    onReview: () => void;
}

export function Dashboard({ onViewReport, onNewAnalysis, onReview }: DashboardProps) {
    const { students, summary, setStudents, settings, setLoading, examTitle } = useApp();
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isNewAnalysisDialogOpen, setIsNewAnalysisDialogOpen] = useState(false);

    if (!summary && !isManualEntry) {
        return (
            <div className="space-y-8">
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsManualEntry(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
                    >
                        <PenLine className="w-4 h-4" />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setIsNewAnalysisDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Analysis
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                    <Trophy className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                    <p className="max-w-md text-center">
                        Get started by uploading an Excel sheet or entering student data manually.
                    </p>
                    <button
                        onClick={() => setIsManualEntry(true)}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <PenLine className="w-5 h-5" />
                        Start Manual Entry
                    </button>
                </div>
            </div>
        );
    }

    const stats = summary ? [
        { label: 'Total Students', value: summary.totalStudents, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { label: 'Top Performer', value: summary.topPerformer, icon: Trophy, color: 'from-purple-500 to-pink-500' },
        { label: 'Avg Score', value: summary.avgScore.toFixed(1), icon: BarChart3, color: 'from-orange-500 to-amber-500' },
    ] : [];

    const handleManualGenerate = async (data: any) => {
        if (!settings.apiKey) {
            alert('Please configure your Groq API key in settings first.');
            return;
        }

        setIsGenerating(true);
        setLoading(true);

        try {
            // Use the specialized Manual Entry service
            const result = await analyzeManualEntry(settings.apiKey, settings.model, data);

            setStudents(result.students, result.summary);
            setIsManualEntry(false);
            onReview(); // Trigger the approval modal
        } catch (error) {
            console.error(error);
            alert('Failed to generate report from manual entry. Please try again.');
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleDownloadAll = async () => {
        if (students.length === 0) return;

        const zip = new JSZip();

        // Generate HTML for each student with custom exam title
        students.forEach(student => {
            const html = generateReportHTML(student, examTitle);
            const fatherPart = student.fatherName ? `_${student.fatherName.replace(/\s+/g, '_')}` : '';
            const fileName = `${student.name.replace(/\s+/g, '_')}${fatherPart}_Report.html`;
            zip.file(fileName, html);
        });

        // Generate the ZIP file
        const blob = await zip.generateAsync({ type: 'blob' });

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Student_Reports_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                {isManualEntry ? (
                    <motion.div
                        key="manual-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                                <h3 className="text-xl font-bold">Generating Reports...</h3>
                                <p className="text-slate-400">AI is analyzing your manual entry.</p>
                            </div>
                        ) : (
                            <ManualEntryForm
                                onGenerate={handleManualGenerate}
                                onCancel={() => setIsManualEntry(false)}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        {/* Header Actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsManualEntry(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
                            >
                                <PenLine className="w-4 h-4" />
                                Manual Entry
                            </button>
                            <button
                                onClick={() => setIsNewAnalysisDialogOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/20"
                            >
                                <PlusCircle className="w-4 h-4" />
                                New Analysis
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">{stat.label}</p>
                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Student Cards */}
                        {students.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Student Reports</h2>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDownloadAll}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-purple-500/20"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download All Reports
                                        </button>
                                        <button
                                            onClick={() => exportProcessedDataToExcel(students, `Final_Student_Data_${new Date().toISOString().slice(0, 10)}.xlsx`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/10"
                                            title="Download Source Data"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-400" />
                                            Export Excel
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map((student, index) => (
                                        <StudentCard
                                            key={student.rollNo}
                                            student={student}
                                            index={index}
                                            onClick={() => onViewReport(student.rollNo)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Analysis Confirmation Dialog */}
            <AlertDialog open={isNewAnalysisDialogOpen} onOpenChange={setIsNewAnalysisDialogOpen}>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start New Analysis?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will clear all current student data and reports. Your saved templates will remain, but any unsaved work in the current session will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={() => { setIsNewAnalysisDialogOpen(false); onNewAnalysis(); }}
                        >
                            Start New Analysis
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
