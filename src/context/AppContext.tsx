import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Settings {
    apiKey: string;
    model: string;
}

export interface StudentData {
    rollNo: string;
    name: string;
    grade: string;
    className?: string;
    customAttributes?: Record<string, string>;
    totalScore: number;
    subjects: { name: string; score: number; marks?: number; category?: string; maxMarks?: number }[];
    remarks?: string;
    strengths?: string[];
    growthPlan?: { priority: string; description: string }[];
    objectiveScore?: number;
    subjectiveScore?: number;
}

interface AppState {
    settings: Settings;
    students: StudentData[];
    summary: {
        totalStudents: number;
        topPerformer: string;
        avgScore: number;
    } | null;
    isLoading: boolean;
    examTitle: string; // Dynamic exam title for reports
}

interface AppContextType extends AppState {
    setApiKey: (key: string) => void;
    setModel: (model: string) => void;
    setStudents: (data: StudentData[], summary: AppState['summary']) => void;
    clearData: () => void;
    setLoading: (loading: boolean) => void;
    setExamTitle: (title: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'reportmaker_data';

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Invalid JSON, use defaults
            }
        }
        return {
            settings: { apiKey: '', model: 'llama-3.3-70b-versatile' },
            students: [],
            summary: null,
            isLoading: false,
            examTitle: 'Talent Hunt Examination 2026', // Default exam title
        };
    });

    // Persist to localStorage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const setApiKey = (key: string) => {
        setState(prev => ({ ...prev, settings: { ...prev.settings, apiKey: key } }));
    };

    const setModel = (model: string) => {
        setState(prev => ({ ...prev, settings: { ...prev.settings, model } }));
    };

    const setStudents = (students: StudentData[], summary: AppState['summary']) => {
        setState(prev => ({ ...prev, students, summary }));
    };

    const clearData = () => {
        setState(prev => ({ ...prev, students: [], summary: null }));
    };

    const setLoading = (isLoading: boolean) => {
        setState(prev => ({ ...prev, isLoading }));
    };

    const setExamTitle = (examTitle: string) => {
        setState(prev => ({ ...prev, examTitle }));
    };

    return (
        <AppContext.Provider value={{ ...state, setApiKey, setModel, setStudents, clearData, setLoading, setExamTitle }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
