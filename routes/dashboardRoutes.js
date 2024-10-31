const express = require('express');
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Add a new result (Teacher Only)
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
router.put('/:id', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    const { subject, grade, score } = req.body;
    const resultId = req.params.id;
    try {
        await db.query(
            "UPDATE Results SET subject = ?, grade = ?, score = ? WHERE result_id = ? AND teacher_id = ?",
            [subject, grade, score, resultId, req.user.id]
        );
        res.status(200).json({ message: "Result updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update result" });
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
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    const { role, id } = req.user;
    const studentId = req.params.studentId;

    if (role === 'student' && id !== parseInt(studentId)) {
        return res.status(403).json({ message: "Permission denied" });
    }

    try {
        const [results] = await db.query(
            "SELECT * FROM Results WHERE student_id = ? AND approved = 1",
            [studentId]
        );
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve results" });
    }
});

module.exports = router;
