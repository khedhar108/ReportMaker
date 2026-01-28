/**
 * @file excelAnalysisService.ts
 * @description Specialized AI service for analyzing RAW data from Excel uploads.
 * Input is messy, flat JSON with potentially complex keys (e.g., "Part A - Subject (50)").
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// --- Types ---

export interface AnalysisResult {
    summary: {
        totalStudents: number;
        topPerformer: string;
        avgScore: number;
    };
    gradeDistribution: Record<string, number>;
    subjectPerformance: Record<string, number>;
    students: {
        rollNo: string;
        name: string;
        fatherName?: string;
        className?: string;
        grade: string;
        totalScore: number;
        subjects: { name: string; score: number; maxMarks?: number }[];
        remarks: string;
        strengths: string[];
        growthPlan: { priority: string; description: string }[];
        objectiveScore?: number;
        subjectiveScore?: number;
    }[];
}

// --- Service ---

export async function analyzeExcelData(
    apiKey: string,
    model: string,
    excelData: Record<string, unknown>[],
    context?: string
): Promise<AnalysisResult> {

    const systemPrompt = `You are a Senior Academic Data Analyst specialized in parsing raw, messy data from Excel files.

**YOUR TASK:** Interpret the structure of the input data, extract scores, calculate percentages, and generate a report.

**INPUT FORMAT:**
An array of flat JSON objects. Each object represents a student row from a spreadsheet.
- Keys may be messy (e.g., " Student Name ", "Maths (50)", "Part A - Objective - Science").
- Max marks may be embedded in key names (e.g., "(50)" or "(Marks 30)").

**PHASE 1: KEY INTERPRETATION**
1.  **Identify Student Info**: Look for keys containing "Name", "Roll", "Class", "Student".
2.  **Identify Father/Parent Info**: Look for keys containing "Father", "Parent", "Guardian". Extract this as "fatherName".
3.  **Identify Subjects**: All other keys are likely subjects.
4.  **Extract Max Marks from Keys**: If a key contains a number in parentheses, that's the max marks.
    - "English (50)" → Subject: "English", Max Marks: 50.
    - "Part A - Grammar (20)" → Subject: "Grammar", Max Marks: 20, from "Objective" section (if "Part A" implies Objective).
5.  **Detect Objective/Subjective**: If keys contain "Objective", "Part A", "MCQ", map those subjects. If keys contain "Subjective", "Part B", "Descriptive", map those.

**PHASE 2: SCORE CALCULATION**
1.  **Percentage**: (obtained / maxMarks) * 100. If maxMarks is not found in key, assume 100.
2.  **Total Score**: Average percentage OR (sum of all marks / sum of all maxMarks) * 100.
3.  **Grade**: A >= 75%, B >= 60%, C >= 45%, D < 45%.

**PHASE 3: GENERATE INSIGHTS**
- **Remarks (CRITICAL: 70/30 Rule)**: Write a comprehensive qualitative overview (minimum 5 full sentences) strictly following the **70/30 Rule**:
    - **70% Improvement Focus**: strict alignment with the lowest-scoring subjects. First, identify the subjects where the student has the lowest percentage scores. Devote the majority of the text to these specific areas. For example, if the student scored low in English, address writing skills; if low in Science, address conceptual clarity. Do NOT make random assumptions—base every improvement point on an actual subject with lower performance data.
    - **30% Positive Reinforcement**: Use the remaining 30% to highlight genuine strengths and high achievements.
    - **Tone**: Diagnostic and constructive. Do not sugarcoat low performance; prioritize identifying specific areas for immediate improvement over general praise. Do not mention specific scores.
- **Strengths**: Generate 2-4 detailed, specific strength points. Each point should be a complete sentence that highlights a particular skill, subject mastery, or behavioral excellence with concrete observations.
- **Growth Plan**: Generate 2-4 actionable, specific recommendations for improvement. Each recommendation should include both the priority area and a concrete action plan.

${context ? `\n**TEACHER'S CONTEXT (Use for additional guidance):**\n"${context}"\n` : ''}

**OUTPUT RULES:**
- Output ONLY a valid JSON object. No text, markdown, or backticks.
- Use this schema:
{
  "summary": { "totalStudents": number, "topPerformer": string, "avgScore": number },
  "gradeDistribution": { "A": number, "B": number, "C": number, "D": number },
  "subjectPerformance": { "<SubjectName>": number (class average %) },
  "students": [
    {
      "rollNo": string,
      "name": string,
      "fatherName": string (optional, extract if present),
      "className": string (e.g. "10th", "Grade 5", or "N/A" if not found),
      "grade": string,
      "totalScore": number,
      "subjects": [{ "name": string (clean subject name), "score": number (percentage), "maxMarks": number }],
      "remarks": string (4-5 comprehensive sentences),
      "strengths": [string] (array of 3-5 detailed strength points),
      "growthPlan": [{ "priority": string, "description": string }] (array of 3-5 specific recommendations),
      "objectiveScore": number (optional, sum or avg of objective subjects if detected),
      "subjectiveScore": number (optional, sum or avg of subjective subjects if detected)
    }
  ]
}`;

    const userMessage = `Analyze the following raw Excel data and generate a comprehensive student report.
IMPORTANT: Perform all calculations. Output final numbers, NOT expressions like "5/10*100".
All "score" values should be percentages (0-100).
Include ALL subjects found in the data for each student.

Input Data:
${JSON.stringify(excelData, null, 2)}`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.4,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Excel Analysis failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Robust JSON Extraction
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
        console.error("Raw AI Response:", content);
        throw new Error('AI response did not contain valid JSON');
    }

    const jsonStr = content.substring(startIndex, endIndex + 1);

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Content:", content);
        throw new Error('Failed to parse AI response. See console for details.');
    }
}
