import type { StudentData } from "../context/AppContext";

export function generateReportHTML(
    student: StudentData,
    examTitle: string = 'Talent Hunt Examination 2026',
    options?: { headerImage?: string | null; footerText?: string }
): string {
    console.debug('[reportTemplate] generateReportHTML input', {
        name: student?.name,
        fatherName: student?.fatherName,
        customAttributes: student?.customAttributes,
    });
    // --- Color Palette for Categories (Vibrant for print) ---
    const CATEGORY_COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#ef4444', '#eab308'];

    // --- Filter Numeric vs Graded Subjects ---
    const numericSubjects = student.subjects.filter(s => s.maxMarks !== 'Grade');
    // We still want all subjects in the table, but only numeric ones in charts/totals.

    // --- Aggregation Logic for Categories (Numeric Only) ---
    const categories: Record<string, { totalScore: number; totalMarks: number; totalMaxMarks: number; count: number; color: string }> = {};
    let colorIndex = 0;

    // Process ALL subjects for category keys, but only aggregations for numeric ones
    student.subjects.forEach(s => {
        const cat = s.category || 'General';
        if (!categories[cat]) {
            categories[cat] = { totalScore: 0, totalMarks: 0, totalMaxMarks: 0, count: 0, color: CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length] };
            colorIndex++;
        }

        if (s.maxMarks !== 'Grade') {
            categories[cat].totalScore += Number(s.score) || 0;
            categories[cat].totalMarks += Number(s.marks) || 0;
            categories[cat].totalMaxMarks += Number(s.maxMarks) || 0;
            categories[cat].count += 1;
        }
    });

    const categoryLabels = Object.keys(categories);
    const categoryScores = categoryLabels.map(cat => categories[cat].count ? Math.round(categories[cat].totalScore / categories[cat].count) : 0);
    const categoryTotalMarks = categoryLabels.map(cat => categories[cat].totalMarks);
    const categoryTotalMaxMarks = categoryLabels.map(cat => categories[cat].totalMaxMarks);
    const categoryColorsArray = categoryLabels.map(cat => categories[cat].color);

    // --- Subject Data for Charts (Numeric Only) ---
    // If we want to show ALL subjects in charts, we'd need a Grade->Number scale. For now, exclude Graded subjects from charts to avoid skewing.
    const chartSubjects = numericSubjects;

    const subjectNames = JSON.stringify(chartSubjects.map(s => s.name));
    const subjectScores = JSON.stringify(chartSubjects.map(s => Number(s.score) || 0));
    const subjectMarks = JSON.stringify(chartSubjects.map(s => Number(s.marks) || 0));
    const subjectMaxMarks = JSON.stringify(chartSubjects.map(s => Number(s.maxMarks) || 0));
    const subjectColors = JSON.stringify(chartSubjects.map(s => categories[s.category || 'General']?.color || '#14b8a6'));

    // Fallback logic for Total Score (Numeric Only)
    // Recalculate based on numeric subjects to be safe
    const totalObtained = numericSubjects.reduce((acc, s) => acc + (Number(s.marks) || 0), 0);
    const totalMax = numericSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 0), 0);
    const totalPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
    const numPercentage = Number(totalPercentage);

    // ... (Motivational Logic remains same) ...
    // Motivational logic ...
    let motivationalEmoji = '🙂';
    let motivationalText = 'Keep Smiling & Growing!';
    let gradientClass = 'from-slate-400 to-slate-500';

    if (numPercentage >= 60) {
        motivationalEmoji = '🏆';
        motivationalText = 'Absolute Champion!';
        gradientClass = 'from-amber-400 to-orange-500';
    } else if (numPercentage >= 40) {
        motivationalEmoji = '🌟';
        motivationalText = 'Rising Star!';
        gradientClass = 'from-purple-400 to-pink-500';
    }

    // ... (HTML Body) ...

    // ... inside marksheet table rendering ...
    /* 
       I will replace the entire marksheet table body generation 
    */

    /* Skipping implicit parts for brevity in this thought trace, but I will include full replacement in tool call */


    // Custom Attributes Badges HTML (Light theme) - Exclude fatherName since it has its own display
    const customAttributesHtml = student.customAttributes
        ? Object.entries(student.customAttributes)
            .filter(([key]) => key.toLowerCase() !== 'fathername' && key.toLowerCase() !== 'father name' && key.toLowerCase() !== 'father\'s name')
            .map(([key, value]) => `
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
        .chart-container { position: relative; width: 100%; height: 300px; overflow: hidden; }
        .chart-container-lg { position: relative; width: 100%; height: 400px; overflow: hidden; }
        
        .header-image {
            width: 100%;
            height: auto;
            max-height: 260px;
            object-fit: contain;
            display: block;
            margin-bottom: 0px;
        }

        @media print {
            body { background: white !important; }
            .report-card { 
                box-shadow: none;
                border: 2px solid #cbd5e1;
                padding: 16px !important;
            }
            .chart-container { 
                height: 350px !important; 
                overflow: hidden !important;
            }
            .chart-container-lg { 
                height: 400px !important;
                overflow: hidden !important;
            }
            .break-inside-avoid { break-inside: avoid; }
            .page-break { page-break-before: always; }

        }
    </style>
</head>
<body class="antialiased min-h-screen font-sans">

    ${options?.headerImage ? `<img src="${options.headerImage}" class="header-image w-full h-auto block" alt="Institute Header" />` : ''}

    <div class="max-w-7xl mx-auto space-y-4 px-10">
        
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
                    
                    <div class="relative z-10 space-y-4">
                        <!-- Student Name -->
                        <h1 class="text-4xl font-display font-black text-white tracking-tight uppercase drop-shadow-sm">${student.name}</h1>
                        
                        <!-- Father's Name Box -->
                        ${student.fatherName ? `
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25" style="text-transform: none;">
                            <span class="text-xs font-semibold text-white/70" style="text-transform: none; letter-spacing: 0.02em;">Father's Name:</span>
                            <span class="text-base font-bold text-white" style="text-transform: none;">${student.fatherName}</span>
                        </div>
                        ` : ''}
                        
                        <!-- Roll Number & Class -->
                        <div class="flex flex-wrap items-center gap-6 text-sm font-medium text-white/90">
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

                        <!-- Custom Attributes Badges -->
                        ${customAttributesHtml ? `
                        <div class="flex flex-wrap gap-2 pt-3 border-t border-white/20">
                            ${student.customAttributes ? Object.entries(student.customAttributes).filter(([key]) => key.toLowerCase() !== 'fathername' && key.toLowerCase() !== 'father name').map(([key, value]) => `
                                <div class="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-2">
                                    <span class="text-[10px] font-bold text-white/70 uppercase tracking-wider">${key}</span>
                                    <span class="text-sm font-bold text-white">${value}</span>
                                </div>
                            `).join('') : ''}
                        </div>
                        ` : ''}

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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden">
            
            <!-- Slot 1: School Programs (NEW - Replaces Category Chart) -->
            <div class="report-card rounded-3xl p-6 min-w-0">
                <div class="flex items-center gap-4 mb-4">
                    <img src="data:image/png;base64,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" alt="School Logo" class="w-20 h-20 object-contain rounded-xl bg-white p-1 border border-slate-100 shadow-sm" />
                    <div>
                         <h3 class="text-xl font-bold text-slate-800 leading-tight">MG GLOBAL<br/>SCHOOL PROGRAMS</h3>
                    </div>
                </div>
                <p class="text-sm text-slate-500 mb-4">Our commitment to holistic student development.</p>
                <div class="chart-container flex flex-col justify-center gap-3">
                    ${(() => {
            // Define all 5 programs with inline Lucide SVG icons and relevance keys
            const allPrograms = [
                {
                    id: 'growth',
                    title: 'Personalized Growth System',
                    description: 'Diagnostics, learning intelligence mapping, and skill-based tracking.',
                    icon: '<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
                    color: 'purple',
                    priority: 1
                },
                {
                    id: 'english',
                    title: 'English Communication Focus',
                    description: 'Spoken confidence + writing strength for clear expression.',
                    icon: '<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
                    color: 'blue',
                    priority: 1
                },
                {
                    id: 'concept',
                    title: 'Concept Clarity First',
                    description: 'Deep understanding before marks — building strong foundations.',
                    icon: '<svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
                    color: 'amber',
                    priority: 0
                },
                {
                    id: 'skillLabs',
                    title: 'Skill Labs & Hands-On Learning',
                    description: 'Math, Science & Tech-based activity learning culture.',
                    icon: '<svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>',
                    color: 'teal',
                    priority: 0
                },
                {
                    id: 'improvement',
                    title: '30-60-90 Day Improvement Plans',
                    description: 'Structured, measurable academic and behavioral growth.',
                    icon: '<svg class="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
                    color: 'rose',
                    priority: 0
                }
            ];

            // Calculate overall score percentage
            const totalMarks = numericSubjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
            const totalMaxMarks = numericSubjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
            const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 50;

            // Check for English/communication subjects
            const englishSubjects = student.subjects.filter(s =>
                /english|writing|communication|language/i.test(s.name)
            );
            const hasLowEnglish = englishSubjects.some(s => (Number(s.score) || 0) < 60);

            // Check for Math/Science/Tech subjects
            const stemSubjects = student.subjects.filter(s =>
                /math|science|physics|chemistry|biology|computer|tech|it/i.test(s.name)
            );
            const hasSTEM = stemSubjects.length > 0;

            // Check for subjects needing concept clarity (score < 50%)
            const lowScoreSubjects = numericSubjects.filter(s => (Number(s.score) || 0) < 50);
            const needsConceptClarity = lowScoreSubjects.length > 0;

            // Priority-based selection logic
            // 1. Growth System: Always relevant for diagnostic tracking
            allPrograms.find(p => p.id === 'growth')!.priority = 3;

            // 2. English Focus: High priority if English subjects exist and need improvement
            if (englishSubjects.length > 0) {
                allPrograms.find(p => p.id === 'english')!.priority = hasLowEnglish ? 5 : 2;
            }

            // 3. Concept Clarity: High priority if student has low scores in any subject
            allPrograms.find(p => p.id === 'concept')!.priority = needsConceptClarity ? 4 : 1;

            // 4. Skill Labs: High priority for students with STEM subjects
            allPrograms.find(p => p.id === 'skillLabs')!.priority = hasSTEM ? 4 : 1;

            // 5. Improvement Plans: High priority for lower overall performance
            allPrograms.find(p => p.id === 'improvement')!.priority = overallPercentage < 60 ? 5 : 2;

            // Class-based Filtering: Exclude 'Skill Labs' for very young students (Nursery to Class 1)
            // 'considers the class' requirement: Labs starting from Class 2.
            const studentClass = String(student.className || '').toLowerCase();
            const isLowerClass = /nursery|lkg|ukg|kg|pre|found/i.test(studentClass) ||
                (() => { const m = studentClass.match(/(\d+)/); return m ? parseInt(m[1]) < 2 : false; })();

            const validPrograms = isLowerClass ? allPrograms.filter(p => p.id !== 'skillLabs') : allPrograms;

            // Sort by priority (desc) and pick top 3
            const selectedPrograms = [...validPrograms]
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 3);

            return selectedPrograms.map(program => `
                            <div class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div class="shrink-0 w-12 h-12 rounded-lg bg-${program.color}-100 flex items-center justify-center border border-${program.color}-200">
                                    ${program.icon}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-slate-800 text-sm mb-0.5">${program.title}</h4>
                                    <p class="text-slate-500 text-xs leading-relaxed">${program.description}</p>
                                </div>
                            </div>
                        `).join('');
        })()}
                </div>
            </div>

            <!-- Slot 2: Subject Mastery Map (Radar) -->
            <div class="report-card rounded-3xl p-6 min-w-0">
                <h3 class="text-xl font-bold text-slate-800 mb-2">Subject Mastery Map</h3>
                <p class="text-sm text-slate-500 mb-4">Subject proficiency profile.</p>
                
                <div class="chart-container flex items-center justify-center">
                    <canvas id="radarChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Full Width: Subject Breakdown (COMMENTED OUT - Redundant with Marksheet)
        <div class="report-card rounded-3xl p-8">
            <h3 class="text-xl font-bold text-slate-800 mb-2">Subject-Wise Scoring Breakdown</h3>
            <p class="text-sm text-slate-500 mb-6">Detailed percentage comparison across all subjects.</p>
            <div class="chart-container-lg">
                <canvas id="subjectBarChart"></canvas>
            </div>
        </div>
        -->

        <!-- MARKSHEET TABLE -->
        <div class="report-card rounded-3xl overflow-hidden break-inside-avoid">
            <div class="bg-slate-800 p-6">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">📝</span>
                    <h3 class="text-2xl font-bold text-white">Complete Marksheet</h3>
                </div>
                <p class="text-sm text-white/80 mt-1">Detailed subject-wise marks breakdown</p>
            </div>
            
            <div class="p-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b-2 border-slate-200">
                            <th class="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                            <th class="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th class="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Max Marks</th>
                            <th class="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Marks Obtained</th>
                            <th class="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${student.subjects.map((s) => {
            const catColor = categories[s.category || 'General']?.color || '#64748b';
            const isGraded = s.maxMarks === 'Grade';

            return `
                            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td class="py-4 px-4">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full" style="background-color: ${catColor};"></span>
                                        <span class="font-semibold text-slate-700">${s.name}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="px-2 py-1 rounded-md text-xs font-medium" style="background-color: ${catColor}20; color: ${catColor};">${s.category || 'General'}</span>
                                </td>
                                <td class="py-4 px-4 text-center">
                                    <span class="font-medium text-slate-500">${isGraded ? 'Grade' : (s.maxMarks || 0)}</span>
                                </td>
                                <td class="py-4 px-4 text-center">
                                    <span class="font-bold text-slate-800 text-lg">${s.marks || '-'}</span>
                                </td>
                                <td class="py-4 px-4 text-center">
                                    ${isGraded ?
                    `<span class="text-slate-400 font-medium">—</span>` :
                    `<span class="font-black text-slate-900">
                                            ${s.score || 0}%
                                        </span>`
                }
                                </td>
                            </tr>`;
        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="bg-slate-100 border-t-2 border-slate-200">
                            <td class="py-4 px-4 font-bold text-slate-700" colspan="2">Total</td>
                            <td class="py-4 px-4 text-center font-bold text-slate-600">
                                ${student.subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0)}
                            </td>
                            <td class="py-4 px-4 text-center font-black text-slate-800 text-lg">
                                ${student.subjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0)}
                            </td>
                            <td class="py-4 px-4 text-center">
                                <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-black bg-slate-900 text-white shadow-sm">
                                    ${totalPercentage}%
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
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
            ${options?.footerText || 'Generated by MG Global School AI Engine'}
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


        // Radar Chart - Shows percentage for each subject
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
