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
                <h3 class="text-xl font-bold text-slate-800 mb-2">🏫 MG GLOBAL SCHOOL PROGRAMS</h3>
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
                    priority: 0
                },
                {
                    id: 'english',
                    title: 'English Communication Focus',
                    description: 'Spoken confidence + writing strength for clear expression.',
                    icon: '<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
                    color: 'blue',
                    priority: 0
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

            // Sort by priority (desc) and pick top 3
            const selectedPrograms = [...allPrograms]
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
