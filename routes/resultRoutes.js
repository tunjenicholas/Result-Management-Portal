const express = require('express');
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');



// Add a new result (Teacher Only)
// router.post('/results', authenticateToken, authorizeRole('teacher'), async (req, res) => {
//     const { student_id, subject, grade, score } = req.body;
    
//     try {
//         const [result] = await db.query(
//             `INSERT INTO Results (student_id, subject, grade, score) VALUES (?, ?, ?, ?)`,
//             [student_id, subject, grade, score]
//         );

//         const [parentInfo] = await db.query(
//             `SELECT email FROM Users WHERE role = 'parent' AND associated_student_id = ?`,
//             [student_id]
//         );

//         if (parentInfo.length > 0) {
//             await Promise.all(parentInfo.map(async (parent) => {
//                 await sendEmailNotification(
//                     parent.email,
//                     'New Result Posted',
//                     `A new result for ${subject} has been posted. Check the portal for details.`
//                 );
//             }));
//         }

//         res.status(201).json({ message: 'Result posted and notification sent' });
//     } catch (error) {
//         console.error('Error posting result:', error);
//         res.status(500).json({ error: 'Failed to post result' });
//     }
// });
router.post('/', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const { student_id, subject, grade, score } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO Results (student_id, subject, grade, score, teacher_id) VALUES (?, ?, ?, ?, ?)",
            [student_id, subject, grade, score, req.user.id]
        );
        res.status(201).json({ message: "Result added successfully", resultId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Failed to add result" });
    }
});

// Edit a result (Teacher Only)
router.put('/api/results/:id', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const resultId = req.params.id;
    const { student_id, subject, grade, score } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE Results 
             SET student_id = ?, subject = ?, grade = ?, score = ?
             WHERE id = ?`, 
            [student_id, subject, grade, score, resultId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.status(200).json({ message: 'Result updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update result' });
    }
});
router.put('/:id', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const resultId = req.params.id;
    const { student_id, subject, grade, score } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE Results 
             SET student_id = ?, subject = ?, grade = ?, score = ?
             WHERE result_id = ?`,
            [student_id, subject, grade, score, resultId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.status(200).json({ message: 'Result updated successfully' });
    } catch (error) {
        console.error('Update error:', error); 
        res.status(500).json({ error: 'Failed to update result', details: error.message });
    }
});

// Approve and lock result (Teacher/Admin Only)
router.put('/:id/approve', authenticateToken, (req, res, next) => {
    const { role } = req.user;
    if (role !== 'teacher' && role !== 'admin') {
        return res.status(403).json({ message: "Permission denied" });
    }
    next();
}, async (req, res) => {
    const resultId = req.params.id;
    try {
        await db.query(
            "UPDATE Results SET approved = 1, locked = 1 WHERE result_id = ?",
            [resultId]
        );
        res.status(200).json({ message: "Result approved and locked successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to approve result" });
    }
});

// View results for a specific student (Student and Parent)
router.get('/:student_id', authenticateToken, authorizeRole('student', 'parent'), async (req, res) => {
    const studentId = req.params.student_id;

    try {
        const [results] = await db.query(
            `SELECT * FROM Results WHERE student_id = ?`, [studentId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'No results found for this student' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Get performance metrics for a student
router.get('/performance/:student_id', authenticateToken, authorizeRole('student', 'parent'), async (req, res) => {
    const studentId = req.params.student_id;

    try {
        const [performance] = await db.query(
            `SELECT subject, AVG(score) as average_score
             FROM Results
             WHERE student_id = ?
             GROUP BY subject`,
            [studentId]
        );

        if (performance.length === 0) {
            return res.status(404).json({ message: 'No performance data found' });
        }

        res.status(200).json(performance);
    } catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});

// Generate Report for Student
router.get('/generateReport/:student_id', authenticateToken, authorizeRole('student', 'parent', 'teacher'), async (req, res) => {
    const studentId = req.params.student_id;

    try {
        const [performance] = await db.query(
            `SELECT subject, score, grade
             FROM Results
             WHERE student_id = ?`,
            [studentId]
        );

        if (performance.length === 0) {
            return res.status(404).json({ message: 'No results found for this student' });
        }

        const doc = new PDFDocument();
        const fileName = `Student_Report_${studentId}.pdf`;
        const filePath = `/mnt/data/${fileName}`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Generate PDF
        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(18).text(`Performance Report for Student ID: ${studentId}`, { align: 'center' });
        doc.moveDown();

        performance.forEach((result) => {
            doc.fontSize(14).text(`Subject: ${result.subject}`);
            doc.fontSize(12).text(`Score: ${result.score}`);
            doc.fontSize(12).text(`Grade: ${result.grade}`);
            doc.moveDown();
        });

        doc.end();
        res.download(filePath, fileName);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});




// router.get('/results/:studentId', authenticateToken, async (req, res) => {
//     const { role, id } = req.user;
//     const studentId = req.params.studentId;

//     if (role === 'student' && id !== parseInt(studentId)) {
//         return res.status(403).json({ message: "Permission denied" });
//     }

//     try {
//         const [results] = await db.query(
//             "SELECT * FROM Results WHERE student_id = ? AND approved = 1",
//             [studentId]
//         );
//         res.status(200).json(results);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to retrieve results" });
//     }
// });

module.exports = router;
