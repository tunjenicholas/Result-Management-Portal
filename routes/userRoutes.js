const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Add a new user (admin only)
router.post('/', adminMiddleware, userController.addUser);

// Get all users (admin only)
router.get('/users', adminMiddleware, userController.getAllUsers);

// Get a specific user by username (admin only)
router.get('/:username', adminMiddleware, userController.getUserByUsername);

// Update a user's details (admin only)
router.put('/:username', adminMiddleware, userController.updateUser);

// Delete a user (admin only)
router.delete('/:username', adminMiddleware, userController.deleteUser);

// Assign a role to a user (admin only)
router.patch('/assign-role', adminMiddleware, userController.assignRole);

// Get student info (authenticated students only)
router.get('/student-info', authenticateToken, userController.getStudentInfo);

module.exports = router;
