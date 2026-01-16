import * as XLSX from 'xlsx';

export function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to array of arrays first to find the header
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                if (rawData.length === 0) {
                    throw new Error("Sheet is empty");
                }

                // 1. Smart Header Detection
                // Look for a row that looks like a header (contains "name", "roll", "student", or has multiple string columns)
                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(rawData.length, 10); i++) {
                    const row = rawData[i];
                    const rowStr = row.join(' ').toLowerCase();
                    if (rowStr.includes('name') || rowStr.includes('student') || rowStr.includes('roll')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                // 2. Extract Data with found header
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: headerRowIndex === 0 ? undefined : rawData[headerRowIndex], // If found, use as keys
                    range: headerRowIndex // Start parsing from header row
                });

                // 3. Post-Processing & Sanitization
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sanitizedData = (jsonData as any[]).filter(row => {
                    // Filter empty rows
                    return Object.keys(row).length > 0;
                }).map(row => {
                    // Normalize keys: " Student Name " -> "student_name"
                    const newRow: Record<string, unknown> = {};
                    Object.keys(row).forEach(key => {
                        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                        // Skip mostly empty keys or internal Excel artifacts
                        if (cleanKey && cleanKey !== '__empty') {
                            newRow[cleanKey] = row[key];
                        }
                    });
                    return newRow;
                });

                resolve(sanitizedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}
