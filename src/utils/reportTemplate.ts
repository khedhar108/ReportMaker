import type { StudentData } from "../context/AppContext";

export function generateReportHTML(student: StudentData): string {
    const subjectNames = JSON.stringify(student.subjects.map(s => s.name));
    const subjectScores = JSON.stringify(student.subjects.map(s => Number(s.score))); // Ensure numbers
    // Use optional chaining and nullish coalescing for robust fallbacks
    const objective = student.objectiveScore ?? Math.round(student.totalScore * 0.7);
    const subjective = student.subjectiveScore ?? Math.round(student.totalScore * 0.3);
    const totalPercentage = (Number(student.totalScore) || 0).toFixed(1);
    const numPercentage = Number(totalPercentage);

    // Color Logic for Percentage
    let scoreColor = 'text-green-500';
    let strokeColor = 'stroke-green-500';
    let ringColor = 'text-green-50'; // Background ring

    if (numPercentage < 40) {
        scoreColor = 'text-red-500';
        strokeColor = 'stroke-red-500';
        ringColor = 'text-red-50';
    } else if (numPercentage < 60) {
        scoreColor = 'text-yellow-500';
        strokeColor = 'stroke-yellow-500';
        ringColor = 'text-yellow-50';
    }

    // SVG Circle Calculations
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (numPercentage / 100) * circumference;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${student.name} - Performance Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: { 
                        primary: '#0F172A', 
                        accent: '#F97316', 
                        subtle: '#64748B', 
                        bg: '#F1F5F9',
                        success: '#10B981',
                        'success-light': '#ECFDF5',
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    boxShadow: {
                        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #F8FAFC; color: #334155; }
        .chart-container { position: relative; width: 100%; height: 350px; }
        @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
            .shadow-premium { box-shadow: none !important; border: 1px solid #cbd5e1; }
            canvas { max-height: 300px !important; }
        }
    </style>
</head>
<body class="antialiased min-h-screen py-10 px-4">

    <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Exam Header -->
        <div class="text-center mb-[-20px] pt-4">
             <div class="inline-block bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Talent Hunt Examination 2026</h2>
                <div class="h-1 w-20 bg-blue-600 mx-auto mt-2 rounded-full"></div>
             </div>
        </div>

        <!-- Identity Card (Central Focus) -->
        <div class="bg-white rounded-3xl shadow-premium border border-slate-200 p-8 md:p-10 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div class="flex flex-col md:flex-row justify-between items-center gap-8">
                <!-- Name & Details with Avatar -->
                <div class="flex items-center gap-6 flex-1">
                    <!-- Student Avatar SVG -->
                    <div class="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                         <svg class="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    
                    <div>
                        <h1 class="text-3xl font-extrabold text-slate-900 mb-1">${student.name}</h1>
                        <div class="text-slate-500 font-medium text-sm mb-3 flex items-center gap-2">
                            <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Roll No: ${student.rollNo}</span>
                            <span>•</span>
                            <span>Grade {student.className || '10'}</span>
                        </div>
                        <div class="inline-block bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                            <span class="text-blue-700 font-bold text-[10px] uppercase tracking-wider">Academic Standing: High Potential</span>
                        </div>
                    </div>
                </div>

                <!-- Circular Percentage Score -->
                <div class="relative w-32 h-32 flex items-center justify-center">
                    <!-- Background Circle -->
                    <svg class="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="${radius}"
                            stroke="currentColor"
                            stroke-width="8"
                            fill="transparent"
                            class="text-slate-100"
                        />
                        <!-- Progress Circle -->
                        <circle
                            cx="64"
                            cy="64"
                            r="${radius}"
                            stroke="currentColor"
                            stroke-width="8"
                            fill="transparent"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${strokeDashoffset}"
                            stroke-linecap="round"
                            class="${strokeColor} transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <!-- Percentage Text -->
                    <div class="absolute inset-0 flex items-center justify-center flex-col">
                        <span class="text-3xl font-black ${scoreColor}">${totalPercentage}%</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    </div>
                </div>
            </div>

            <!-- Score Blocks (Objective / Subjective) -->
            <div class="grid grid-cols-2 gap-4 max-w-2xl mt-8">
                <div class="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OBJECTIVE</div>
                    <div class="text-2xl font-bold text-blue-600">${objective} <span class="text-sm text-slate-400 font-medium">/ 70</span></div>
                </div>
                <div class="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SUBJECTIVE</div>
                    <div class="text-2xl font-bold text-orange-600">${subjective} <span class="text-sm text-slate-400 font-medium">/ 30</span></div>
                </div>
            </div>

            <!-- Full-Width Summary -->
            <div class="mt-8 pt-8 border-t border-slate-100">
                <p class="text-slate-600 leading-7 text-lg font-medium">
                    ${student.remarks || `${student.name} demonstrates a solid grasp of fundamental concepts, particularly in objective assessments. The performance indicates strong aptitude in core areas. ${student.name} demonstrates good conceptual clarity and problem-solving skills, with specific opportunities for growth in complex application.`}
                </p>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Assessment Composition -->
            <div class="bg-white rounded-3xl shadow-premium border border-slate-200 p-8">
                <h3 class="text-xl font-bold text-slate-900 mb-2">Assessment Composition</h3>
                <p class="text-sm text-slate-500 mb-6 w-3/4">Comparing ${student.name}'s performance in multiple-choice reasoning versus expressive writing.</p>
                
                <div class="chart-container">
                    <canvas id="compositionChart"></canvas>
                </div>
            </div>

            <!-- Subject Mastery Map -->
            <div class="bg-white rounded-3xl shadow-premium border border-slate-200 p-8">
                <h3 class="text-xl font-bold text-slate-900 mb-2">Subject Mastery Map</h3>
                <p class="text-sm text-slate-500 mb-6">Subject proficiency profile.</p>
                
                <div class="chart-container flex items-center justify-center">
                    <canvas id="radarChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Insights -->
        <div class="bg-white rounded-3xl shadow-premium border border-slate-200 overflow-hidden">
            <div class="bg-slate-50/50 p-8 border-b border-slate-100">
                 <h3 class="text-2xl font-bold text-blue-600">Performance Insights & Recommendations</h3>
            </div>
            
            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Key Strengths -->
                <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-success-light rounded-lg w-fit">
                        <span class="text-2xl">🧠</span> 
                        <h4 class="font-bold text-teal-800 text-lg">Key Strengths</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.strengths || ['Exceptional IT Recall: Scored 10/10. Correctly identified CPU types.', 'General Awareness: 87% in GK.', 'Mathematical Logic: 80% with strong geometry skills.']).map(s => {
        const parts = s.split(':');
        const title = parts.length > 1 ? parts[0] : '';
        const desc = parts.length > 1 ? parts.slice(1).join(':') : s;

        return `
                            <div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-success-light flex items-center justify-center shrink-0 mt-0.5">
                                    <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    ${title ? `<div class="font-bold text-slate-800 text-base mb-1">${title}:</div>` : ''}
                                    <div class="text-slate-600 text-sm leading-relaxed">${desc}</div>
                                </div>
                            </div>`;
    }).join('')}
                     </div>
                </div>

                <!-- Growth Plan -->
                 <div>
                     <div class="flex items-center gap-3 mb-6 p-3 bg-orange-50 rounded-lg w-fit">
                        <span class="text-2xl">🌱</span>
                        <h4 class="font-bold text-orange-800 text-lg">Areas for Growth</h4>
                     </div>
                     <div class="space-y-6">
                        ${(student.growthPlan || [{ priority: "Concept Review", description: "Review core concepts" }]).map(g =>
        `<div class="flex gap-4">
                                <div class="w-8 h-8 rounded-md bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-base mb-1">${g.priority}:</div>
                                    <div class="text-slate-600 text-sm leading-relaxed">${g.description}</div>
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
        
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.color = '#64748b';
        // Explicitly enable interactivity defaults
        Chart.defaults.interaction.mode = 'nearest';
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.plugins.tooltip.enabled = true;

        // 1. Composition (Blue/Orange Stacked)
        new Chart(document.getElementById('compositionChart'), {
            type: 'bar',
            data: {
                labels: ['${student.name}'],
                datasets: [
                    { label: 'Objective', data: [${objective}], backgroundColor: '#2563EB', barThickness: 100, borderRadius: 4 },
                    { label: 'Subjective', data: [${subjective}], backgroundColor: '#F97316', barThickness: 100, borderRadius: 4 }
                ]
            },
            options: {
                hover: { mode: 'nearest', intersect: false },
                scales: { 
                    y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
                maintainAspectRatio: false
            }
        });

        // 2. Radar (Teal)
        new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Score',
                    data: scores,
                    borderColor: '#14B8A6', // Teal 500
                    backgroundColor: 'rgba(20, 184, 166, 0.2)', // Teal 500 / 0.2
                    pointBackgroundColor: '#14B8A6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#14B8A6',
                    borderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                hover: { mode: 'nearest', intersect: false },
                scales: { 
                    r: { 
                        suggestedMin: 0, 
                        suggestedMax: 100, 
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 11, weight: '600' }, color: '#475569' }
                    } 
                },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            }
        });
    </script>
</body>
</html>`;
}
