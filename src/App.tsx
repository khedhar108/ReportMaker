import { useState } from 'react';
import { Settings, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { UploadZone } from './components/UploadZone';
import { Dashboard } from './components/Dashboard';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { DataReviewModal } from './components/DataReviewModal';

type View = 'upload' | 'review' | 'dashboard' | 'report';

function AppContent() {
  const { students, clearData } = useApp();
  const [view, setView] = useState<View>(students.length > 0 ? 'dashboard' : 'upload');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleViewReport = (rollNo: string) => {
    setSelectedStudent(rollNo);
    setView('report');
  };

  const handleBackToDashboard = () => {
    setSelectedStudent(null);
    setView('dashboard');
  };

  const handleNewAnalysis = () => {
    if (window.confirm('Are you sure you want to start a new analysis? Current student data will be cleared.')) {
      clearData();
      setView('upload');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white cursor-pointer" onClick={() => setView('dashboard')}>
              Report<span className="text-purple-400">Maker</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {view === 'upload' && (
              <button
                onClick={() => setView('dashboard')}
                className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5"
              >
                Skip to Dashboard
              </button>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Transform Excel into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Beautiful Reports
                </span>
              </h2>
              <p className="text-slate-400 mb-12 max-w-lg mx-auto">
                Upload your student data and let AI analyze and generate stunning HTML reports in seconds.
              </p>
              <UploadZone onSuccess={() => setView('review')} />
            </motion.div>
          )}

          {view === 'review' && (
            <DataReviewModal
              onConfirm={() => setView('dashboard')}
              onCancel={() => {
                if (window.confirm('Cancel review? Data will be lost.')) {
                  clearData();
                  setView('upload');
                }
              }}
            />
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard
                onViewReport={handleViewReport}
                onNewAnalysis={handleNewAnalysis}
                onReview={() => setView('review')}
              />
            </motion.div>
          )}

          {view === 'report' && selectedStudent && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportView
                rollNo={selectedStudent}
                onBack={handleBackToDashboard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
