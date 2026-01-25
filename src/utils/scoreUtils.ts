
export const calculateStudentTotalPercentage = (subjects: { score: number | string; maxMarks?: number | string; marks?: number | string }[]): number => {
    let totalObtained = 0;
    let totalMax = 0;

    subjects.forEach(sub => {
        const max = Number(sub.maxMarks) || 0;
        const scoreVal = Number(sub.score) || 0;

        // Exclude graded subjects or 0 max marks
        if (max > 0 && sub.maxMarks !== 'Grade') {
            // Assume sub.score is the Percentage obtained for that subject
            const rawMark = (scoreVal / 100) * max;
            totalObtained += rawMark;
            totalMax += max;
        }
    });

    if (totalMax === 0) return 0;

    // Return formatted percentage to 1 decimal place (as number)
    return Number(((totalObtained / totalMax) * 100).toFixed(1));
};
