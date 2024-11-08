const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
require('dotenv').config();

// Route to register a new user
router.post('/register', registerUser);

// Route to log in a user
router.post('/login', async (req, res) => {
    try {
        console.log("Login attempt:", req.body.username);
        await loginUser(req, res);
    } catch (error) {
        console.error("Error during login process:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route to retrieve user data
router.get('/user/data', authenticateToken, (req, res) => {
    res.json({
        message: 'User data retrieved successfully',
        userId: req.user.id,
        role: req.user.role
    });
});

// Dashboard route for different roles
router.get('/dashboard', authenticateToken, authorizeRole('admin', 'teacher', 'parent', 'student'), (req, res) => {
    res.json({ message: 'Welcome to the dashboard', user: req.user });
});

module.exports = router;
