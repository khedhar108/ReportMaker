import type { StudentData } from "../context/AppContext";

export function generateReportHTML(student: StudentData, examTitle: string = 'Talent Hunt Examination 2026'): string {
    // --- Color Palette for Categories ---
    const CATEGORY_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#ef4444', '#eab308'];

    // --- Aggregation Logic for Categories (with Color Mapping) ---
    const categories: Record<string, { totalScore: number; totalMarks: number; totalMaxMarks: number; count: number; color: string }> = {};
    let colorIndex = 0;
    student.subjects.forEach(s => {
        const cat = s.category || 'General';
        if (!categories[cat]) {
            categories[cat] = { totalScore: 0, totalMarks: 0, totalMaxMarks: 0, count: 0, color: CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length] };
            colorIndex++;
        }
        categories[cat].totalScore += Number(s.score) || 0;
        categories[cat].totalMarks += Number(s.marks) || 0;
        categories[cat].totalMaxMarks += Number(s.maxMarks) || 0;
        categories[cat].count += 1;
    });

    const categoryLabels = Object.keys(categories);
    const categoryScores = categoryLabels.map(cat => Math.round(categories[cat].totalScore / categories[cat].count));
    const categoryTotalMarks = categoryLabels.map(cat => categories[cat].totalMarks);
    const categoryTotalMaxMarks = categoryLabels.map(cat => categories[cat].totalMaxMarks);
    const categoryColorsArray = categoryLabels.map(cat => categories[cat].color);

    // --- Subject Data (with Category Color Matching) ---
    const subjectNames = JSON.stringify(student.subjects.map(s => s.name));
    const subjectScores = JSON.stringify(student.subjects.map(s => Number(s.score) || 0));
    const subjectMarks = JSON.stringify(student.subjects.map(s => Number(s.marks) || 0));
    const subjectMaxMarks = JSON.stringify(student.subjects.map(s => Number(s.maxMarks) || 0));
    const subjectColors = JSON.stringify(student.subjects.map(s => categories[s.category || 'General']?.color || '#14b8a6'));

    // Fallback logic for Total Score if not provided
    const effectiveTotal = student.totalScore || 0;
    const totalPercentage = (effectiveTotal).toFixed(1);
    const numPercentage = Number(totalPercentage);

    // Motivational Logic
    let motivationalEmoji = '🙂';
    let motivationalText = 'Keep Smiling & Growing!';
    let trophyClass = 'grayscale opacity-80';

    if (numPercentage >= 60) {
        motivationalEmoji = '🏆';
        motivationalText = 'Absolute Champion!';
        trophyClass = 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]';
    } else if (numPercentage >= 40) {
        motivationalEmoji = '🌟';
        motivationalText = 'Rising Star!';
        trophyClass = 'drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    }

    // Custom Attributes Badges HTML
    const customAttributesHtml = student.customAttributes
        ? Object.entries(student.customAttributes).map(([key, value]) => `
            <div class="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${key}</span>
                <span class="text-sm font-bold text-white">${value}</span>
            </div>
        `).join('')
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${student.name} - Performance Report</title>
    <script src="https://cdn.tailwindcss.com/3.4.16"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;700;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            // Force legacy color format (RGB instead of oklab) for html2canvas compatibility
            future: {
                disableColorOpacityUtilitiesByDefault: true
            },
            theme: {
                extend: {
                    fontFamily: { 
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    colors: { 
                        glass: 'rgba(255, 255, 255, 0.1)',
                    },
                    boxShadow: {
                        'neon': '0 0 20px rgba(139, 92, 246, 0.3)',
                        'gold': '0 0 25px rgba(234, 179, 8, 0.2)',
                    }
                }
            }
        }
    </script>
    <style>
        body { background: #0f172a; color: #f8fafc; } /* Dark simplified theme for report */
        .glass-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .text-glow { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
        .chart-container { position: relative; width: 100%; height: 300px; }
        .chart-container-lg { position: relative; width: 100%; height: 400px; }
        
        @media print {
            body { background: white; color: black; }
            .glass-card { 
                background: white; 
                border: 2px solid #e2e8f0; 
                backdrop-filter: none;
                box-shadow: none;
                -webkit-print-color-adjust: exact;
            }
            .glass-panel { background: #f8fafc; border: 1px solid #e2e8f0; }
            .text-glow { text-shadow: none; }
            .print-invert { filter: invert(1); }
            /* Force ensure unified card looks good on print */
            .break-inside-avoid { break-inside: avoid; }
        }
    </style>
</head>
<body class="antialiased min-h-screen py-10 px-6 font-sans bg-slate-900">

    <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- EXAM HEADER -->
        <div class="text-center space-y-2">
             <div class="inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-wider text-glow">${examTitle}</h2>
             </div>
        </div>

        <!-- UNIFIED MASTER CARD -->
        <div class="glass-card rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 break-inside-avoid">
            
            <!-- Top Section: Split Identity & Motivation -->
            <div class="flex flex-col md:flex-row items-stretch">
                
                <!-- LEFT: 60% IDENTITY -->
                <div class="w-full md:w-[60%] p-8 md:p-10 relative">
                    <!-- Background Bloom -->
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div class="relative z-10 flex items-start gap-6">
                        <!-- SVG Avatar -->
                        <div class="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 shadow-neon text-slate-400">
                             <svg class="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>

                        <div class="space-y-4 w-full">
                            <div>
                                <div class="flex items-center gap-3">
                                    <h1 class="text-4xl font-display font-black text-white tracking-tight uppercase">${student.name}</h1>
                                    <div class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20 uppercase tracking-wide">Active</div>
                                </div>
                                
                                <div class="flex flex-wrap items-center gap-6 mt-2 text-sm font-medium text-slate-300">
                                    <div>
                                        <span class="block text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Roll Number</span>
                                        <span class="font-mono text-white text-lg">${student.rollNo}</span>
                                    </div>
                                    <div class="w-px h-8 bg-white/10"></div>
                                    <div>
                                        <span class="block text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Class</span>
                                        <span class="font-mono text-white text-lg">${student.className || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Custom Attributes Badges (New Area) -->
                            ${customAttributesHtml ? `
                            <div class="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                ${customAttributesHtml}
                            </div>
                            ` : ''}

                        </div>
                    </div>
                </div>

                <!-- RIGHT: 40% MOTIVATION & SCORE -->
                <div class="w-full md:w-[40%] p-8 md:p-10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-l border-white/5 relative flex flex-col items-center justify-center text-center">
                    
                    <!-- Score Display -->
                    <div class="relative mb-4">
                        <div class="text-5xl font-display font-black text-white tracking-tighter drop-shadow-lg">
                            ${totalPercentage}%
                        </div>
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Aggregate Score</div>
                    </div>

                    <!-- Emoji & Text -->
                    <div class="space-y-2">
                        <div class="${trophyClass} text-5xl md:text-6xl mb-2 filter drop-shadow-md select-none transform hover:scale-110 transition-transform duration-300">
                            ${motivationalEmoji}
                        </div>
                        <h3 class="text-xl font-bold text-white leading-none">${motivationalText}</h3>
                         <p class="text-xs font-medium text-slate-400">
                             ${numPercentage >= 60 ? 'Outstanding!' : (numPercentage >= 40 ? 'Well done!' : 'Keep going!')}
                        </p>
                    </div>
                </div>

            </div>

            <!-- BOTTOM: SUMMARY -->
            <div class="border-t border-white/5 bg-white/[0.02] p-6 md:p-8">
                <div class="flex items-start gap-4">
                    <div class="mt-1 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                         <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Performance Summary</h4>
                        <p class="text-slate-300 leading-relaxed text-sm md:text-base font-medium">
                            ${student.remarks || `${student.name} has shown consistent effort tailored to their grade level. With continued focus on their identified growth areas, they can achieve even greater potential in future assessments.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section (Reorganized) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Slot 1: Category Breakdown (NEW) -->
            <div class="glass-card rounded-3xl p-8">
                <h3 class="text-xl font-bold text-white mb-2">Category Performance</h3>
                <p class="text-sm text-slate-400 mb-6">Performance breakdown by assessment category.</p>
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>

            <!-- Slot 2: Subject Mastery Map (Radar) -->
            <div class="glass-card rounded-3xl p-8">
                <h3 class="text-xl font-bold text-white mb-2">Subject Mastery Map</h3>
                <p class="text-sm text-slate-400 mb-6">Subject proficiency profile.</p>
                
                <div class="chart-container flex items-center justify-center">
                    <canvas id="radarChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Full Width: Subject Breakdown (Moved Down) -->
        <div class="glass-card rounded-3xl p-8">
            <h3 class="text-xl font-bold text-white mb-2">Subject-Wise Scoring Breakdown</h3>
            <p class="text-sm text-slate-400 mb-6">Detailed percentage comparison across all subjects.</p>
            <div class="chart-container-lg">
                <canvas id="subjectBarChart"></canvas>
            </div>
        </div>

        <!-- Insights -->
        <div class="glass-card rounded-3xl overflow-hidden">
            <div class="bg-white/5 p-8 border-b border-white/5">
                 <h3 class="text-2xl font-bold text-blue-400">Performance Insights & Recommendations</h3>
            </div>
            
            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Key Strengths -->
                <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-emerald-500/10 rounded-lg w-fit border border-emerald-500/20">
                        <span class="text-2xl">🧠</span> 
                        <h4 class="font-bold text-emerald-400 text-lg">Key Strengths</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.strengths || ['Exceptional IT Recall: Scored 10/10.', 'General Awareness: 87% in GK.', 'Mathematical Logic: 80%.']).map(s => {
        const parts = s.split(':');
        const title = parts.length > 1 ? parts[0] : '';
        const desc = parts.length > 1 ? parts.slice(1).join(':') : s;

        return `
                            <div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    ${title ? `<div class="font-bold text-slate-200 text-base mb-1">${title}:</div>` : ''}
                                    <div class="text-slate-400 text-sm leading-relaxed">${desc}</div>
                                </div>
                            </div>`;
    }).join('')}
                     </div>
                </div>

                <!-- Growth Plan -->
                 <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-orange-500/10 rounded-lg w-fit border border-orange-500/20">
                        <span class="text-2xl">🌱</span>
                        <h4 class="font-bold text-orange-400 text-lg">Areas for Growth</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.growthPlan || [{ priority: "Concept Review", description: "Review core concepts" }]).map(g =>
        `<div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/20">
                                    <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-200 text-base mb-1">${g.priority}:</div>
                                    <div class="text-slate-400 text-sm leading-relaxed">${g.description}</div>
                                </div>
                            </div>`
    ).join('')}
                     </div>
                </div>
            </div>
        </div>
        
        <footer class="text-center text-slate-600 text-xs py-8">
            Generated by MG Global School AI Engine
        </footer>

    </div>

    <script>
        const subjects = ${subjectNames};
        const scores = ${subjectScores};
        const marks = ${subjectMarks};
        const maxMarksArr = ${subjectMaxMarks};
        const subjectColorsArr = ${subjectColors};
        
        const categoryLabels = ${JSON.stringify(categoryLabels)};
        const categoryScores = ${JSON.stringify(categoryScores)};
        const categoryColorsArr = ${JSON.stringify(categoryColorsArray)};
        const categoryMarks = ${JSON.stringify(categoryTotalMarks)};
        const categoryMaxMarks = ${JSON.stringify(categoryTotalMaxMarks)};
        
        // Chart Defaults
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.interaction.mode = 'nearest';
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.plugins.tooltip.enabled = true;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
        Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;

        // 1. Category Chart (Bar) - Colors Matching Subject Chart
        if (document.getElementById('categoryChart')) {
             new Chart(document.getElementById('categoryChart'), {
                type: 'bar',
                data: {
                    labels: categoryLabels.length ? categoryLabels : ['General'],
                    datasets: [{
                        label: 'Avg Score (%)',
                        data: categoryScores.length ? categoryScores : [0],
                        backgroundColor: categoryColorsArr.length ? categoryColorsArr : ['#3b82f6'],
                        borderRadius: 6,
                        barThickness: 50
                    }]
                },
                options: {
                    indexAxis: 'x',
                    scales: {
                         y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                         x: { grid: { display: false } }
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const m = categoryMarks[idx] || 0;
                                    const mm = categoryMaxMarks[idx] || 0;
                                    return m + ' / ' + mm + ' (' + context.parsed.y + '%)';
                                }
                            }
                        }
                    },
                    maintainAspectRatio: false
                }
            });
        }

        // 2. Radar Chart - Shows percentage for each subject
        new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Score',
                    data: scores,
                    borderColor: '#2dd4bf',
                    backgroundColor: 'rgba(45, 212, 191, 0.1)',
                    pointBackgroundColor: '#2dd4bf',
                    pointBorderColor: '#0f172a',
                    borderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                scales: { 
                    r: { 
                        suggestedMin: 0, suggestedMax: 100, 
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { font: { size: 11, weight: '600' }, color: '#94a3b8' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.05)' }
                    } 
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const m = marks[idx] || 0;
                                const mm = maxMarksArr[idx] || 0;
                                return m + ' / ' + mm + ' (' + context.parsed.r + '%)';
                            }
                        }
                    }
                },
                maintainAspectRatio: false
            }
        });

        // 3. Subject-Wise Breakdown (Vertical Bar - Full Width, Colors Match Category)
        if (document.getElementById('subjectBarChart')) {
            new Chart(document.getElementById('subjectBarChart'), {
                type: 'bar',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'Performance (%)',
                        data: scores,
                        backgroundColor: subjectColorsArr, // Colors match parent category
                        borderRadius: 6,
                        barThickness: 50
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        x: { grid: { display: false } }
                    },
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const m = marks[idx] || 0;
                                    const mm = maxMarksArr[idx] || 0;
                                    return m + ' / ' + mm + ' (' + context.parsed.y + '%)';
                                }
                            }
                        }
                    },
                    maintainAspectRatio: false
                }
            });
        }
    </script>
</body>
</html>`;
}
