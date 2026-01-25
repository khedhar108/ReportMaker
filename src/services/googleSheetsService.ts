import type { TemplateNode, StudentEntry } from '../components/ManualEntryForm';

// --- Types ---

interface ColumnMap {
    headerName: string;
    type: 'static' | 'dynamic';
    field?: keyof StudentEntry; // For static fields name, fatherName etc
    subjectId?: string;         // For dynamic subject marks
    isMaxMarks?: boolean;       // If true, this column is for Max Marks
}

// --- Logic ---

/**
 * Generates the header row and a mapping strategy based on the Template.
 * Flattens the hierarchy: Roll No, Name, [Custom], Subject A (Marks), Subject A (Max), Subject B...
 */
export const generateSheetStructure = (template: TemplateNode[], _customFields: { key: string }[] = []) => {
    const columns: ColumnMap[] = [
        { headerName: 'Roll No', type: 'static', field: 'rollNo' },
        { headerName: 'Student Name', type: 'static', field: 'name' },
        { headerName: 'Father Name', type: 'static', field: 'fatherName' },
        { headerName: 'Class', type: 'static', field: 'className' },
    ];

    // Add Custom Fields Columns (if any known global custom keys exist)
    // For now, we rely on what's passed or just append them dynamically if needed.
    // Let's assume common custom fields are consistent.

    // Recursive traversal to find all subjects
    const traverse = (nodes: TemplateNode[]) => {
        nodes.forEach(node => {
            if (node.type === 'subject') {
                columns.push({ headerName: `${node.name} (Marks)`, type: 'dynamic', subjectId: node.id, isMaxMarks: false });
                columns.push({ headerName: `${node.name} (Max)`, type: 'dynamic', subjectId: node.id, isMaxMarks: true });
            } else if (node.children) {
                traverse(node.children);
            }
        });
    };

    traverse(template);

    // Add Remarks column at the end
    columns.push({ headerName: 'Remarks', type: 'static', field: 'remarks' as any });

    return columns;
};

/**
 * Flattens a single student object into a row array based on the columns map.
 */
export const flattenStudentToRow = (student: StudentEntry, columns: ColumnMap[]): (string | number)[] => {
    return columns.map(col => {
        if (col.type === 'static' && col.field) {
            // Special handling for nested custom fields if we added them to static map, 
            // but for now accessing direct properties:
            // @ts-ignore
            const val = student[col.field];
            if (typeof val === 'string' || typeof val === 'number') return val;
            return '';
        }

        if (col.type === 'dynamic' && col.subjectId) {
            const marksData = student.marks[col.subjectId];
            if (!marksData) return ''; // No entry for this subject

            // In ManualEntryForm, 'marks' is stored as a string "obtained" 
            // OR sometimes we might want to lookup the max marks from the template node directly?
            // Actually, in ManualEntry state: marks is Record<string, string> (just obtained marks).
            // The MAX MARKS is in the TemplateNode.

            if (col.isMaxMarks) {
                // We need to find the max marks from the template. 
                // Since efficient lookup is needed, we ideally pass a lookup map.
                // But for the row generation, if we don't have the node handy, we might leave empty 
                // OR we have to pass the template structure to this function too.
                // OPTIMIZATION: The caller should pass the max marks value if possible, 
                // OR we assume the Sheet Header has it, OR we fetch it from template.
                return ''; // Placeholder, logic handled in batch processing
            }

            return marksData;
        }

        return '';
    });
};

/**
 * Prepares the full 2D array for the Sheet.
 */
export const prepareSheetData = (template: TemplateNode[], students: StudentEntry[]) => {

    // 1. Build Column Map and subject max-marks lookup
    const columns = generateSheetStructure(template);

    // Create a lookup for max marks: subjectId -> maxMarks
    const maxMarksLookup: Record<string, string> = {};
    const traverse = (nodes: TemplateNode[]) => {
        nodes.forEach(n => {
            if (n.type === 'subject') maxMarksLookup[n.id] = n.maxMarks || '100';
            if (n.children) traverse(n.children);
        });
    };
    traverse(template);

    // 2. Generate Header Row (Strings)
    const headerRow = columns.map(c => c.headerName);

    // 3. Generate Data Rows
    const dataRows = students.map(student => {
        return columns.map(col => {
            if (col.type === 'static') {
                // @ts-ignore
                return student[col.field] || '';
            }
            if (col.type === 'dynamic' && col.subjectId) {
                if (col.isMaxMarks) {
                    return maxMarksLookup[col.subjectId] || '';
                }
                return student.marks[col.subjectId] || '';
            }
            return '';
        });
    });

    return { headerRow, dataRows };
};

// --- API Calls ---

export async function exportToGoogleSheet(
    accessToken: string,
    spreadsheetId: string,
    template: TemplateNode[],
    students: StudentEntry[]
) {
    const { headerRow, dataRows } = prepareSheetData(template, students);

    // 1. First, check if sheet is empty to decide on headers
    // We'll read A1. If empty, we prepend headers.
    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1`;
    const checkResponse = await fetch(checkUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    let needsHeader = true;
    if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (data.values && data.values.length > 0) {
            needsHeader = false;
        }
    }

    const values = needsHeader ? [headerRow, ...dataRows] : dataRows;

    // 2. Append Data
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`;

    const response = await fetch(appendUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: values
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to sync with Google Sheet');
    }

    return { success: true, rowsAdded: values.length };
}
