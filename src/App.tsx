import { useState } from 'react';
import { Settings, FileSpreadsheet, CheckCircle, AlertCircle, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { UploadZone } from './components/UploadZone';
import { Dashboard } from './components/Dashboard';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { DataReviewModal } from './components/DataReviewModal';
import { DeveloperCredit } from './components/DeveloperCredit';

type View = 'upload' | 'review' | 'dashboard' | 'report';

function AppContent() {
  const { students, clearData, settings } = useApp();
  const [view, setView] = useState<View>(students.length > 0 ? 'dashboard' : 'upload');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showUploadInput, setShowUploadInput] = useState(false);

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
      setShowUploadInput(false);
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
            {/* API Key Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${settings.apiKey
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
              }`}>
              {settings.apiKey ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-500">API Key Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-500">No API Key</span>
                </>
              )}
            </div>

            {view === 'upload' && showUploadInput && (
              <button
                onClick={() => setShowUploadInput(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Smart Reports</span>
              </h2>
              <p className="text-slate-400 mb-16 max-w-lg mx-auto text-lg">
                Choose how you want to start your analysis
              </p>

              {!showUploadInput ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Option 1: Upload Excel */}
                  <div
                    onClick={() => setShowUploadInput(true)}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50 group-hover:opacity-100" />
                    <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl hover:border-purple-500/50 transition-all duration-300 group-hover:-translate-y-2">
                      <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FileSpreadsheet className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Upload Data</h3>
                      <p className="text-slate-400">Import student data from Excel or CSV files for bulk processing.</p>
                    </div>
                  </div>

                  {/* Option 2: Dashboard / Manual */}
                  <div
                    onClick={() => setView('dashboard')}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50 group-hover:opacity-100" />
                    <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-indigo-500/30 p-10 rounded-3xl hover:border-indigo-500/80 transition-all duration-300 group-hover:-translate-y-2">
                      {/* Recommended Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full shadow-lg shadow-indigo-500/20 border border-white/20">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Recommended
                        </span>
                      </div>

                      <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <LayoutDashboard className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Manual Entry</h3>
                      <p className="text-slate-400">Create custom templates and ensure high-precision data entry for the most detailed, high-quality reports.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-slate-400 mb-8">Upload your Excel file to get started</p>
                  <UploadZone onSuccess={() => setView('review')} />
                </motion.div>
              )}

              {/* Home Page Footer Message */}
              {!showUploadInput && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-24 border-t border-white/5 pt-8"
                >
                  <p className="text-slate-500 font-medium tracking-wide text-sm uppercase">
                    Empowering Educators with <span className="text-slate-400">Intelligent Insights</span> & <span className="text-slate-400">Beautiful Design</span>
                  </p>
                </motion.div>
              )}
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

      {/* Developer Credit */}
      <DeveloperCredit />
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
