const express = require('express');
const router = express.Router();
const {
    createNotification,
    getNotifications,
    deleteNotification
} = require('../controllers/notificationController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Create a new notification (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), createNotification);

// Get all notifications (for admin, teachers, and parents)
router.get('/', authenticateToken, authorizeRole('admin', 'teacher', 'parent'), getNotifications);

// Delete a notification (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteNotification);

module.exports = router;
