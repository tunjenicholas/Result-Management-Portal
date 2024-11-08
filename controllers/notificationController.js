const db = require('../config/db');
require('dotenv').config();


// Create a new notification
exports.createNotification = async (req, res) => {
    const { title, message, recipient } = req.body;

    if (!title || !message || !recipient) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await db.execute(
            'INSERT INTO notifications (title, message, recipient, created_at) VALUES (?, ?, ?, NOW())',
            [title, message, recipient]
        );
        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute('DELETE FROM notifications WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};
