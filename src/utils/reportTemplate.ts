import type { StudentData } from "../context/AppContext";

export function generateReportHTML(student: StudentData, examTitle: string = 'Talent Hunt Examination 2026'): string {
    // --- Color Palette for Categories (Vibrant for print) ---
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

    // Motivational Logic with Gradient Colors
    let motivationalEmoji = '🙂';
    let motivationalText = 'Keep Smiling & Growing!';
    let gradientClass = 'from-slate-400 to-slate-500';
    let badgeBg = 'bg-slate-100';
    let badgeText = 'text-slate-600';

    if (numPercentage >= 60) {
        motivationalEmoji = '🏆';
        motivationalText = 'Absolute Champion!';
        gradientClass = 'from-amber-400 to-orange-500';
        badgeBg = 'bg-amber-50';
        badgeText = 'text-amber-700';
    } else if (numPercentage >= 40) {
        motivationalEmoji = '🌟';
        motivationalText = 'Rising Star!';
        gradientClass = 'from-purple-400 to-pink-500';
        badgeBg = 'bg-purple-50';
        badgeText = 'text-purple-700';
    }

    // Custom Attributes Badges HTML (Light theme)
    const customAttributesHtml = student.customAttributes
        ? Object.entries(student.customAttributes).map(([key, value]) => `
            <div class="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-2">
                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">${key}</span>
                <span class="text-sm font-bold text-indigo-700">${value}</span>
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
            theme: {
                extend: {
                    fontFamily: { 
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body { 
            background: #ffffff; 
            color: #1e293b; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .report-card {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .identity-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }
        .chart-container { position: relative; width: 100%; height: 300px; }
        .chart-container-lg { position: relative; width: 100%; height: 400px; }
        
        @media print {
            body { background: white !important; }
            .report-card { 
                box-shadow: none;
                border: 2px solid #cbd5e1;
            }
            .break-inside-avoid { break-inside: avoid; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body class="antialiased min-h-screen py-10 px-6 font-sans">

    <div class="max-w-5xl mx-auto space-y-8">
        
        <!-- EXAM HEADER -->
        <div class="text-center space-y-2">
             <div class="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-wider">${examTitle}</h2>
             </div>
        </div>

        <!-- UNIFIED MASTER CARD -->
        <div class="report-card rounded-3xl overflow-hidden break-inside-avoid">
            
            <!-- Top Section: Split Identity & Motivation -->
            <div class="flex flex-col md:flex-row items-stretch">
                
                <!-- LEFT: 60% IDENTITY (Colorful Gradient Header) -->
                <div class="w-full md:w-[60%] identity-header p-8 md:p-10 relative">
                    
                    <div class="relative z-10 flex items-start gap-6">
                        <!-- SVG Avatar -->
                        <div class="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shrink-0 text-white/80">
                             <svg class="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>

                        <div class="space-y-4 w-full">
                            <div>
                                <div class="flex items-center gap-3">
                                    <h1 class="text-4xl font-display font-black text-white tracking-tight uppercase drop-shadow-sm">${student.name}</h1>
                                    <div class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wide">Active</div>
                                </div>
                                
                                <div class="flex flex-wrap items-center gap-6 mt-3 text-sm font-medium text-white/90">
                                    <div>
                                        <span class="block text-[10px] text-white/60 uppercase tracking-wider font-bold mb-0.5">Roll Number</span>
                                        <span class="font-mono text-white text-lg font-bold">${student.rollNo}</span>
                                    </div>
                                    <div class="w-px h-8 bg-white/20"></div>
                                    <div>
                                        <span class="block text-[10px] text-white/60 uppercase tracking-wider font-bold mb-0.5">Class</span>
                                        <span class="font-mono text-white text-lg font-bold">${student.className || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Custom Attributes Badges (New Area) -->
                            ${customAttributesHtml ? `
                            <div class="flex flex-wrap gap-2 pt-3 border-t border-white/20">
                                ${student.customAttributes ? Object.entries(student.customAttributes).map(([key, value]) => `
                                    <div class="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-2">
                                        <span class="text-[10px] font-bold text-white/70 uppercase tracking-wider">${key}</span>
                                        <span class="text-sm font-bold text-white">${value}</span>
                                    </div>
                                `).join('') : ''}
                            </div>
                            ` : ''}

                        </div>
                    </div>
                </div>

                <!-- RIGHT: 40% MOTIVATION & SCORE -->
                <div class="w-full md:w-[40%] p-8 md:p-10 bg-gradient-to-br ${gradientClass} relative flex flex-col items-center justify-center text-center">
                    
                    <!-- Score Display -->
                    <div class="relative mb-4">
                        <div class="text-5xl font-display font-black text-white tracking-tighter drop-shadow-lg">
                            ${totalPercentage}%
                        </div>
                        <div class="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">Aggregate Score</div>
                    </div>

                    <!-- Emoji & Text -->
                    <div class="space-y-2">
                        <div class="text-5xl md:text-6xl mb-2 filter drop-shadow-md select-none">
                            ${motivationalEmoji}
                        </div>
                        <h3 class="text-xl font-bold text-white leading-none drop-shadow-sm">${motivationalText}</h3>
                         <p class="text-xs font-medium text-white/70">
                             ${numPercentage >= 60 ? 'Outstanding!' : (numPercentage >= 40 ? 'Well done!' : 'Keep going!')}
                        </p>
                    </div>
                </div>

            </div>

            <!-- BOTTOM: SUMMARY -->
            <div class="border-t-2 border-slate-100 bg-slate-50 p-6 md:p-8">
                <div class="flex items-start gap-4">
                    <div class="mt-1 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                         <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Performance Summary</h4>
                        <p class="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                            ${student.remarks || `${student.name} has shown consistent effort tailored to their grade level. With continued focus on their identified growth areas, they can achieve even greater potential in future assessments.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section (Reorganized) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Slot 1: Category Breakdown (NEW) -->
            <div class="report-card rounded-3xl p-8">
                <h3 class="text-xl font-bold text-slate-800 mb-2">Category Performance</h3>
                <p class="text-sm text-slate-500 mb-6">Performance breakdown by assessment category.</p>
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>

            <!-- Slot 2: Subject Mastery Map (Radar) -->
            <div class="report-card rounded-3xl p-8">
                <h3 class="text-xl font-bold text-slate-800 mb-2">Subject Mastery Map</h3>
                <p class="text-sm text-slate-500 mb-6">Subject proficiency profile.</p>
                
                <div class="chart-container flex items-center justify-center">
                    <canvas id="radarChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Full Width: Subject Breakdown (Moved Down) -->
        <div class="report-card rounded-3xl p-8">
            <h3 class="text-xl font-bold text-slate-800 mb-2">Subject-Wise Scoring Breakdown</h3>
            <p class="text-sm text-slate-500 mb-6">Detailed percentage comparison across all subjects.</p>
            <div class="chart-container-lg">
                <canvas id="subjectBarChart"></canvas>
            </div>
        </div>

        <!-- Insights -->
        <div class="report-card rounded-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
                 <h3 class="text-2xl font-bold text-white">Performance Insights & Recommendations</h3>
            </div>
            
            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Key Strengths -->
                <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-emerald-50 rounded-lg w-fit border border-emerald-200">
                        <span class="text-2xl">🧠</span> 
                        <h4 class="font-bold text-emerald-600 text-lg">Key Strengths</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.strengths || ['Exceptional IT Recall: Scored 10/10.', 'General Awareness: 87% in GK.', 'Mathematical Logic: 80%.']).map(s => {
        const parts = s.split(':');
        const title = parts.length > 1 ? parts[0] : '';
        const desc = parts.length > 1 ? parts.slice(1).join(':') : s;

        return `
                            <div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    ${title ? `<div class="font-bold text-slate-700 text-base mb-1">${title}:</div>` : ''}
                                    <div class="text-slate-500 text-sm leading-relaxed">${desc}</div>
                                </div>
                            </div>`;
    }).join('')}
                     </div>
                </div>

                <!-- Growth Plan -->
                 <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-orange-50 rounded-lg w-fit border border-orange-200">
                        <span class="text-2xl">🌱</span>
                        <h4 class="font-bold text-orange-600 text-lg">Areas for Growth</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.growthPlan || [{ priority: "Concept Review", description: "Review core concepts" }]).map(g =>
        `<div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200">
                                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-700 text-base mb-1">${g.priority}:</div>
                                    <div class="text-slate-500 text-sm leading-relaxed">${g.description}</div>
                                </div>
                            </div>`
    ).join('')}
                     </div>
                </div>
            </div>
        </div>
        
        <footer class="text-center text-slate-400 text-xs py-8">
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
        
        // Chart Defaults (Light theme optimized)
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.color = '#64748b';
        Chart.defaults.borderColor = '#e2e8f0';
        Chart.defaults.interaction.mode = 'nearest';
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.plugins.tooltip.enabled = true;
        Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
        Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
        Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
        Chart.defaults.plugins.tooltip.borderColor = '#334155';
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
                        borderRadius: 8,
                        barThickness: 50
                    }]
                },
                options: {
                    indexAxis: 'x',
                    scales: {
                         y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
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
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.15)',
                    pointBackgroundColor: '#0d9488',
                    pointBorderColor: '#ffffff',
                    borderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                scales: { 
                    r: { 
                        suggestedMin: 0, suggestedMax: 100, 
                        ticks: { display: true, stepSize: 20, color: '#94a3b8', backdropColor: 'transparent' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 11, weight: '600' }, color: '#475569' },
                        angleLines: { color: '#e2e8f0' }
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
                        borderRadius: 8,
                        barThickness: 50
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
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
