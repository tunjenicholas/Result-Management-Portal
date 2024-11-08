const db = require('../config/db'); 
require('dotenv').config();


// Retrieve performance summary for a specific student
exports.getStudentPerformanceSummary = async (req, res) => {
    const { admission_number } = req.params;
    
    try {
        const [results] = await db.execute(
            'SELECT term, year, subject, marks, grade FROM results WHERE admission_number = ? ORDER BY year, term',
            [admission_number]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No results found for this student' });
        }

        // Group results by term and year to create a summary report
        const summary = {};
        results.forEach(result => {
            const key = `${result.term}-${result.year}`;
            if (!summary[key]) {
                summary[key] = { term: result.term, year: result.year, subjects: [] };
            }
            summary[key].subjects.push({
                subject: result.subject,
                marks: result.marks,
                grade: result.grade
            });
        });

        res.status(200).json({ admission_number, summary });
    } catch (error) {
        console.error('Error retrieving performance summary:', error);
        res.status(500).json({ message: 'Error retrieving performance summary', error });
    }
};

// Retrieve performance for a specific term and year for a student
exports.getStudentTermPerformance = async (req, res) => {
    const { admission_number, term, year } = req.params;

    try {
        const [results] = await db.execute(
            'SELECT subject, marks, grade FROM results WHERE admission_number = ? AND term = ? AND year = ?',
            [admission_number, term, year]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No results found for this term and year' });
        }

        const subjects = results.map(result => ({
            subject: result.subject,
            marks: result.marks,
            grade: result.grade
        }));

        res.status(200).json({ admission_number, term, year, subjects });
    } catch (error) {
        console.error('Error retrieving term performance:', error);
        res.status(500).json({ message: 'Error retrieving term performance', error });
    }
};

// Retrieve overall performance summary for a specific term and year (all students)
exports.getOverallPerformanceSummary = async (req, res) => {
    const { term, year } = req.params;

    try {
        const [results] = await db.execute(
            'SELECT admission_number, subject, marks, grade FROM results WHERE term = ? AND year = ? ORDER BY admission_number',
            [term, year]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No results found for this term and year' });
        }

        // Group by student
        const performanceSummary = {};
        results.forEach(result => {
            const student = result.admission_number;
            if (!performanceSummary[student]) {
                performanceSummary[student] = { admission_number: student, subjects: [] };
            }
            performanceSummary[student].subjects.push({
                subject: result.subject,
                marks: result.marks,
                grade: result.grade
            });
        });

        res.status(200).json({ term, year, performanceSummary });
    } catch (error) {
        console.error('Error retrieving overall performance summary:', error);
        res.status(500).json({ message: 'Error retrieving overall performance summary', error });
    }
};
