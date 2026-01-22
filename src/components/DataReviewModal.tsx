import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Save, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { StudentData } from '../context/AppContext';

interface DataReviewModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function DataReviewModal({ onConfirm, onCancel }: DataReviewModalProps) {
    const { students, setStudents } = useApp();
    const [editedStudents, setEditedStudents] = useState<StudentData[]>([]);

    useEffect(() => {
        // Deep copy to avoid mutating context directly during edits
        setEditedStudents(JSON.parse(JSON.stringify(students)));
    }, [students]);

    const handleCellChange = (index: number, field: string, value: any) => {
        const updated = [...editedStudents];
        // deeply nested update helper
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            // @ts-ignore - dynamic access
            updated[index][parent][child] = value;
        } else {
            // @ts-ignore - dynamic access
            updated[index][field] = value;
        }
        setEditedStudents(updated);
    };

    const handleSubjectScoreChange = (studentIndex: number, subjectIndex: number, newScore: string) => {
        const updated = [...editedStudents];
        updated[studentIndex].subjects[subjectIndex].score = Number(newScore) || 0;

        // Auto-recalculate Total Score
        const newTotal = updated[studentIndex].subjects.reduce((sum, sub) => sum + (Number(sub.score) || 0), 0);
        updated[studentIndex].totalScore = newTotal;

        setEditedStudents(updated);
    };

    const handleSave = () => {
        // Validation could go here

        // Calculate class summary stats if needed (but Dashboard does this dynamically)
        // Just update the students list
        const newSummary = {
            totalStudents: editedStudents.length,
            avgScore: editedStudents.reduce((acc, s) => acc + s.totalScore, 0) / editedStudents.length,
            topPerformer: editedStudents.reduce((prev, current) => (prev.totalScore > current.totalScore) ? prev : current).name
        };

        setStudents(editedStudents, newSummary);
        onConfirm();
    };

    // Get all unique subject names from the first student to build columns
    // (Assuming all students have same subjects for this batch)
    const subjectColumns = editedStudents[0]?.subjects.map(s => s.name) || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-6xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-slate-900 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="text-amber-400" />
                            Data Verification
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            AI extraction is powerful but not perfect. Please review marks before generating reports.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Approve & Generate
                        </button>
                    </div>
                </div>

                {/* Scrollable Table Area */}
                <div className="flex-1 overflow-auto p-6 bg-slate-950/50">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10">Roll No</th>
                                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10 min-w-[200px]">Student Name</th>
                                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10 min-w-[150px]">Father's Name</th>
                                {subjectColumns.map((sub, i) => (
                                    <th key={i} className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10 text-center">
                                        {sub}
                                    </th>
                                ))}
                                <th className="p-3 text-xs font-bold text-emerald-500 uppercase tracking-wider border-b border-white/10 text-right">Total</th>
                                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10 min-w-[300px]">AI Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {editedStudents.map((student, sIdx) => (
                                <tr key={sIdx} className="hover:bg-white/5 group transition-colors">
                                    <td className="p-2">
                                        <input
                                            value={student.rollNo}
                                            onChange={(e) => handleCellChange(sIdx, 'rollNo', e.target.value)}
                                            className="bg-transparent text-slate-300 w-full focus:outline-none focus:text-white focus:bg-white/10 rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={student.name}
                                            onChange={(e) => handleCellChange(sIdx, 'name', e.target.value)}
                                            className="bg-transparent text-white font-medium w-full focus:outline-none focus:bg-white/10 rounded px-2 py-1"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={student.fatherName || ''}
                                            onChange={(e) => handleCellChange(sIdx, 'fatherName', e.target.value)}
                                            placeholder="Father's Name"
                                            className="bg-transparent text-slate-300 w-full focus:outline-none focus:text-white focus:bg-white/10 rounded px-2 py-1"
                                        />
                                    </td>
                                    {student.subjects.map((sub, subIdx) => (
                                        <td key={subIdx} className="p-2 text-center">
                                            <input
                                                type="number"
                                                value={sub.score}
                                                onChange={(e) => handleSubjectScoreChange(sIdx, subIdx, e.target.value)}
                                                className="bg-transparent text-slate-300 w-16 text-center mx-auto focus:outline-none focus:text-white focus:bg-white/10 rounded px-1 py-1 [appearance:textfield]"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3 text-right font-bold text-emerald-400">
                                        {student.totalScore}
                                    </td>
                                    <td className="p-2">
                                        <textarea
                                            value={student.remarks}
                                            onChange={(e) => handleCellChange(sIdx, 'remarks', e.target.value)}
                                            rows={1}
                                            className="bg-transparent text-slate-400 text-sm w-full focus:outline-none focus:text-white focus:bg-white/10 rounded px-2 py-1 resize-none overflow-hidden focus:h-20 transition-all z-20 relative"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900 border-t border-white/10 text-xs text-center text-slate-500">
                    <Edit2 className="w-3 h-3 inline mr-1" />
                    Click on any cell to edit. Total scores update automatically.
                </div>
            </motion.div>
        </motion.div>
    );
}
