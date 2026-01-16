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
                    // Checking for typical header keywords
                    if (rowStr.includes('name') || (rowStr.includes('roll') && rowStr.includes('no'))) {
                        headerRowIndex = i;
                        break;
                    }
                }

                // 2. Super Header Detection (Hierarchy support)
                // Check if the row above the header contains grouping labels (e.g. "Part A", "Scholastic")
                let finalHeaders: string[] = [];
                const mainHeaderRow = rawData[headerRowIndex].map(String);

                if (headerRowIndex > 0) {
                    const superHeaderRow = rawData[headerRowIndex - 1]; // Row above
                    // Check if superHeaderRow has *some* text content in it
                    const hasSuperHeader = superHeaderRow && superHeaderRow.some(cell => cell && String(cell).trim().length > 0);

                    if (hasSuperHeader) {
                        // Forward Fill Logic for Merged Cells:
                        // Excel export/parsing often leaves merged cells as [ "Value", null, null, "NextValue" ]
                        // We fill the nulls with the previous value.
                        const filledSuperHeaders: string[] = [];
                        let lastValue = "";

                        // We iterate up to the length of the main header row to match columns
                        for (let k = 0; k < mainHeaderRow.length; k++) {
                            const val = superHeaderRow[k];
                            // If we find a new non-empty string, update lastValue
                            if (val && String(val).trim()) {
                                lastValue = String(val).trim();
                            }
                            // Otherwise check if it's strictly empty/null to apply forward fill
                            // Note: standard parser puts null/undefined for merged gaps
                            filledSuperHeaders.push(lastValue);
                        }

                        // Merge super header with main header
                        finalHeaders = mainHeaderRow.map((h, idx) => {
                            const prefix = filledSuperHeaders[idx];
                            // Only prepend if prefix exists and isn't identical to the header (redundancy check)
                            // and avoid prepending for common ID columns like "Roll No" if the super header is just "Student Details" or something generic
                            if (prefix &&
                                !h.toLowerCase().includes('name') &&
                                !h.toLowerCase().includes('roll') &&
                                !h.includes(prefix)) {
                                return `${prefix} - ${h}`;
                            }
                            return h;
                        });
                    } else {
                        finalHeaders = mainHeaderRow;
                    }
                } else {
                    finalHeaders = mainHeaderRow;
                }

                // 3. Extract Data using the Custom Constructed Headers

                const resultData = [];
                // Start iterating from the row AFTER the header
                for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    if (!row || row.length === 0) continue;

                    const rowObj: Record<string, unknown> = {};
                    let hasData = false;

                    // Map row values to our finalHeaders
                    finalHeaders.forEach((header, colIdx) => {
                        const cellValue = row[colIdx];
                        if (header && cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
                            // Normalize key: keep it somewhat readable but clean
                            // We need to keep "Part A - Objective" intact for the AI
                            // So we just trim.
                            const cleanKey = header.trim();
                            rowObj[cleanKey] = cellValue;
                            hasData = true;
                        }
                    });

                    if (hasData) {
                        resultData.push(rowObj);
                    }
                }

                resolve(resultData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}
