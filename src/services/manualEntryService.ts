/**
 * @file manualEntryService.ts
 * @description Specialized AI service for analyzing STRUCTURED data from the Manual Entry Form.
 * Input is a well-defined JSON with studentProfile & academicPerformance nested by categories.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// --- Types ---

interface ManualEntryStudent {
    studentProfile: {
        name: string;
        rollNo: string;
        Class?: string;
        [key: string]: unknown; // Custom fields
    };
    academicPerformance: Record<string, unknown>; // Hierarchical category -> subject data
}

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
        className?: string;
        grade: string;
        totalScore: number;
        subjects: { name: string; score: number; maxMarks?: number }[];
        remarks: string;
        strengths: string[];
        growthPlan: { priority: string; description: string }[];
    }[];
}

// --- Service ---

export async function analyzeManualEntry(
    apiKey: string,
    model: string,
    studentsData: ManualEntryStudent[]
): Promise<AnalysisResult> {

    const systemPrompt = `You are an AI Academic Report Generator. Your input is PRE-STRUCTURED JSON data from a manual entry form.

**INPUT FORMAT:**
An array of student objects. Each object has:
- \`studentProfile\`: { name, rollNo, Class, ...customFields }
- \`academicPerformance\`: A hierarchy of Categories -> Subjects.
    - Each category (e.g., "Scholastic", "Objective") contains subjects.
    - Each subject has: { name: string, marks: string|number, maxMarks: string|number }.
    - Categories may have a "totalMaxMarks" field for the sum of their child subjects.

**YOUR TASK:**
1.  **Flatten all subjects** from all categories into a single list for each student.
2.  **Calculate Percentage** for each subject: (marks / maxMarks) * 100. Round to 1 decimal.
3.  **Calculate Total Score**: (Sum of all marks / Sum of all maxMarks) * 100. Round to 1 decimal.
4.  **Assign Grade**: A >= 75%, B >= 60%, C >= 45%, D < 45%.
5.  **Generate Remarks**: A 2-3 line constructive summary mentioning specific subject performance.
6.  **Generate Strengths**: 1-2 detailed sentences (15-20 words each) on their strong areas.
7.  **Generate Growth Plan**: 1-2 specific, actionable recommendations.

**OUTPUT RULES:**
- Output ONLY a valid JSON object. No text, markdown, or backticks.
- Use this exact schema:
{
  "summary": { "totalStudents": number, "topPerformer": string, "avgScore": number },
  "gradeDistribution": { "A": number, "B": number, "C": number, "D": number },
  "subjectPerformance": { "<SubjectName>": number (class average %) },
  "students": [
    {
      "rollNo": string,
      "name": string,
      "className": string,
      "grade": string,
      "totalScore": number,
      "subjects": [{ "name": string, "score": number, "maxMarks": number }],
      "remarks": string,
      "strengths": [string],
      "growthPlan": [{ "priority": string, "description": string }]
    }
  ]
}`;

    const userMessage = `Analyze the following pre-structured student data and generate the report JSON.
IMPORTANT: Perform all calculations. Output final numbers, NOT expressions.
All "score" values in the subjects array should be percentages (0-100).
Include ALL subjects from ALL categories for each student.

Input Data:
${JSON.stringify(studentsData, null, 2)}`;

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
            temperature: 0.5, // Lower temperature for more deterministic calculations
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Manual Entry Analysis failed');
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
