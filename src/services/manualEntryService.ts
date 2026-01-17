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

**YOUR TASK:**
1.  **Extract Custom Attributes**: Any unknown fields in \`studentProfile\` (excluding name, rollNo, Class) must be moved to a \`customAttributes\` object (key-value strings).
2.  **Flatten Subjects with Hierarchy**: Create a single list of subjects. For each subject, include:
    - \`name\`: Subject name
    - \`category\`: Parent category name (e.g., "Objective")
    - \`marks\`: The RAW marks obtained (number)
    - \`maxMarks\`: The maximum possible marks (number)
    - \`score\`: PERCENTAGE calculated as (marks / maxMarks) * 100, rounded to 1 decimal. MUST be 0-100.
3.  **Calculate Total Score**: (Sum of all marks / Sum of all maxMarks) * 100. Round to 1 decimal. MUST be 0-100.
4.  **Assign Grade**: A >= 75%, B >= 60%, C >= 45%, D < 45%.
5.  **Generate Remarks**: A comprehensive 4-5 line performance analysis. Focus on a qualitative assessment of subject proficiency (e.g., "demonstrates mastery in Mathematics", "shows strong conceptual understanding in Science"). DO NOT cite specific raw marks in this summary. Adopt a CRISP, professional, and constructive tone. Highlight performance patterns across different categories and suggest general areas for development.
6.  **Generate Strengths**: 1-2 detailed sentences.
7.  **Generate Growth Plan**: 1-2 actionable recommendations.

**CRITICAL OUTPUT RULES:**
- \`score\` in subjects array MUST ALWAYS be a percentage (0-100), NOT raw marks.
- \`marks\` in subjects array MUST be the raw marks obtained.
- \`maxMarks\` in subjects array MUST be the maximum possible marks.
- Output ONLY a valid JSON object. No text, markdown, or backticks.
- Use this schema:
{
  "summary": { "totalStudents": number, "topPerformer": string, "avgScore": number },
  "gradeDistribution": { "A": number, "B": number, "C": number, "D": number },
  "subjectPerformance": { "<SubjectName>": number },
  "students": [
    {
      "rollNo": string,
      "name": string,
      "className": string,
      "customAttributes": { "key": "value" },
      "grade": string,
      "totalScore": number,
      "subjects": [{ "name": string, "score": number, "marks": number, "maxMarks": number, "category": string }],
      "remarks": string,
      "strengths": [string],
      "growthPlan": [{ "priority": string, "description": string }]
    }
  ]
}`;

    const userMessage = `Analyze the following pre-structured student data and generate the report JSON.
CRITICAL REMINDERS:
- "score" in subjects MUST be a PERCENTAGE (0-100), calculated as (marks/maxMarks)*100.
- "marks" MUST be the raw marks obtained.
- "maxMarks" MUST be the maximum possible marks for that subject.
- Map any extra fields in studentProfile (like Phone, Father Name) to "customAttributes".
- Ensure every subject object in the output has a "category" field deriving from its parent in "academicPerformance".

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
