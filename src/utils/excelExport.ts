import * as XLSX from 'xlsx';
import type { TemplateNode, StudentEntry } from '../components/ManualEntryForm';
import { prepareSheetData } from '../services/googleSheetsService';
import type { StudentData } from '../context/AppContext';
import { calculateStudentTotalPercentage } from './scoreUtils';

/**
 * Exports the current template and student data to an Excel file.
 * Reuses the same structure logic as Google Sheets sync for consistency.
 */
export const downloadAsExcel = (template: TemplateNode[], students: StudentEntry[], filename: string = 'student_data.xlsx') => {
    // 1. Get the flat data structure
    const { headerRow, dataRows } = prepareSheetData(template, students);

    // 2. Combine into a single array of arrays
    const worksheetData = [headerRow, ...dataRows];

    // 3. Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 4. Create Workbook and Append Sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // 5. Trigger Download
    XLSX.writeFile(wb, filename);
};

/**
 * Validates and exports the processed StudentData (from AppContext/Dashboard) to Excel.
 * Flattened format: Roll No | Name | Father Name | Subject 1 | Subject 2 ... | Total | Remarks
 */
export const exportProcessedDataToExcel = (students: StudentData[], filename: string = 'Final_Student_Report.xlsx') => {
    if (!students || students.length === 0) return;

    // 1. Identify all unique subjects & custom attribute keys
    const dynamicSubjects = students[0].subjects.map(s => s.name);

    // Get all unique custom attribute keys from all students
    const customAttrKeys = Array.from(new Set(
        students.flatMap(s => s.customAttributes ? Object.keys(s.customAttributes) : [])
    ));

    // 2. Build Header Row
    // Format: Roll No | Name | Father Name | Class | [Custom Attrs...] | Sub1 % | Sub2 % ... | Total % | AI Remarks
    const headers = [
        'Roll No',
        'Student Name',
        'Father Name',
        'Class',
        ...customAttrKeys,
        ...dynamicSubjects.map(s => `${s} %`),
        'Total Score %',
        'AI Remarks'
    ];

    // 3. Build Data Rows
    const dataRows = students.map(s => {
        // Map subjects
        const subjectScores = dynamicSubjects.map(subName => {
            const match = s.subjects.find(sub => sub.name === subName);
            return match ? match.score : '';
        });

        // Map custom attributes
        const customAttrValues = customAttrKeys.map(key =>
            (s.customAttributes && s.customAttributes[key]) ? s.customAttributes[key] : ''
        );

        // Use shared utility for accuracy
        const calculatedTotalPercent = calculateStudentTotalPercentage(s.subjects);

        return [
            s.rollNo,
            s.name,
            s.fatherName || '',
            s.className || '',
            ...customAttrValues,
            ...subjectScores,
            calculatedTotalPercent,
            s.remarks || ''
        ];
    });

    // 4. Create Workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Verified Data");

    // 5. Download
    XLSX.writeFile(wb, filename);
};
