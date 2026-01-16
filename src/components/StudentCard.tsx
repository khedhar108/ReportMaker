import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

interface StudentCardProps {
    student: {
        rollNo: string;
        name: string;
        grade: string;
        totalScore: number;
    };
    index: number;
    onClick: () => void;
}

export function StudentCard({ student, index, onClick }: StudentCardProps) {
    const gradeColors: Record<string, string> = {
        A: 'from-green-500 to-emerald-500',
        B: 'from-blue-500 to-cyan-500',
        C: 'from-yellow-500 to-orange-500',
        D: 'from-red-500 to-rose-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold">{student.name}</p>
                        <p className="text-slate-400 text-sm">Roll No: {student.rollNo}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-white text-sm font-bold bg-gradient-to-r ${gradeColors[student.grade] || gradeColors['C']}`}>
                    {student.grade}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-bold text-white">{student.totalScore}</p>
                    <p className="text-slate-400 text-sm">Total Score</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                View Full Report
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
}
