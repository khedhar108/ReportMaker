const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
    summary: {
        totalStudents: number;
        // passRate removed
        topPerformer: string;
        avgScore: number;
    };
    gradeDistribution: Record<string, number>;
    subjectPerformance: Record<string, number>;
    students: {
        rollNo: string;
        name: string;
        grade: string;
        totalScore: number;
        // status removed
        subjects: { name: string; score: number }[];
        remarks: string;
        strengths: string[];
        growthPlan: { priority: string; description: string }[];
        objectiveScore: number;
        subjectiveScore: number;
    }[];
}

export async function analyzeWithGroq(
    apiKey: string,
    model: string,
    excelData: Record<string, unknown>[],
    context?: string
): Promise<GroqResponse> {
    const systemPrompt = `You are a Senior Academic Data Analyst specialized in parsing complex, hierarchical data.

**YOUR PRIMARY TASK: Understand the structure of this data BEFORE analyzing scores.**

**INPUT CONTEXT:**
The input is either:
1.  **Raw JSON from Excel**: Nested objects with messy keys ("Part A - Marks 70").
2.  **Structured JSON**: Clean hierarchical objects (Student -> Category -> Subject).

**PHASE 1: STRUCTURAL ANALYSIS**
Analyze the input structure:
- **Hierarchies**: Identify Parent -> Child relationships.
- **Max Marks**: Look for "maxMarks" fields OR numbers in keys (e.g. "Maths (50)").
- **Pre-structured Data**: If the input already contains "children", "subjects", or clear "marksObtained"/"maxMarks" fields, US THEM DIRECTLY. No guessing needed.
- **Look for Parent-Child Hierarchies**: Keys may contain patterns like:
    - "Part A - Objective Questions (Marks 70)" is a PARENT category.
    - "Mathematics (Marks 25)", "Science (Marks 15)" under Part A are CHILDREN with their own max marks.
- **Merged Header Patterns**: If keys like "part_b_subjective_article_writing_marks_10" or "spelling_accuracy_marks_2" exist, recognize the hierarchy:
    - Part B (Parent, 30 total marks) → Article Writing (Child, 10 marks) → Spelling Accuracy (Sub-child, 2 marks).
- **Extract Max Marks from Keys**: Always look for numbers in parentheses or after underscores (e.g., "English (Marks 15)" → maxMarks = 15).

**PHASE 2: SCORE CALCULATION**
1.  **DO NOT ASSUME 100**: Each subject's score is out of its OWN max marks as identified from the key.
2.  **Calculate Percentages**: For each leaf subject, calculate percentage = (obtained / maxMarks) * 100.
3.  **Aggregate by Section**:
    - Sum all obtained marks in "Part A" type keys → objectiveScore.
    - Sum all obtained marks in "Part B" type keys → subjectiveScore.
4.  **Total Score**: Sum ALL obtained marks / Sum of ALL max marks * 100.

${context ? `\n**TEACHER'S CONTEXT (Use this as override or additional info):**\n"${context}"\n` : ''}

**OUTPUT RULES:**
- **Output ONLY a valid JSON object.** No text before or after. No markdown.
- Use this exact schema:
{
  "summary": { "totalStudents": number, "topPerformer": string (name), "avgScore": number (avg overall %) },
  "gradeDistribution": { "A": number, "B": number, "C": number, "D": number },
  "subjectPerformance": { "<SubjectName>": number (class average %) },
  "students": [
    { 
      "rollNo": string, 
      "name": string, 
      "className": string (e.g. "10", "10th", "Grade 5"). Extract if available, else "N/A",
      "grade": string (A>=75%, B>=60%, C>=45%, D<45%), 
      "totalScore": number (overall %), 
      "subjects": [{"name": string, "score": number (%), "maxMarks": number}], 
      "remarks": "Write a detailed 3-4 line summary in simple words, highlighting performance in specific subjects, key strengths, and specific areas for growth. Avoid generic statements.",
      "strengths": ["Area 1", "Area 2", "Area 3"],
      "growthPlan": [{ "priority": string, "description": string }],
      "objectiveScore": number (sum of Part A obtained marks),
      "subjectiveScore": number (sum of Part B obtained marks)
    }
  ]
}`;

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
                {
                    role: 'user', content: "Provide the response in pure, valid JSON format without any markdown formatting, comments, or backticks. " +
                        "IMPORTANT: Perform all calculations. Do NOT return arithmetic expressions like '5/10*100'. Return only the final calculated number (e.g., 50). " +
                        "Ensure all scores are normalized to a percentage (0-100). " +
                        "The structure must follow the JSON schema provided in the System Instructions. \n" +
                        "Here is the Input Data to analyze: " + JSON.stringify(excelData)
                },
            ],
            temperature: 0.4, // Lower temperature for more deterministic output
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Robust JSON Extraction: Find first '{' and last '}'
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('AI response did not contain valid JSON object');
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
