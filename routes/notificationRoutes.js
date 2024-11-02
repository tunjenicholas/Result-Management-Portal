const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const { sendEmailNotification } = require('../notificationService');

// Admin sends general school update
router.post('/sendUpdate', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { message } = req.body;

    try {
        const [parents] = await db.query(`SELECT email FROM Users WHERE role = 'parent'`);

        await Promise.all(parents.map(async (parent) => {
            await sendEmailNotification(parent.email, 'School Update', message);
        }));

        res.status(200).json({ message: 'School update sent successfully' });
    } catch (error) {
        console.error('Error sending school update:', error);
        res.status(500).json({ error: 'Failed to send school update' });
    }
});

module.exports = router;
