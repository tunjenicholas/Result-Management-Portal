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

// Example dashboard route for different roles
router.get('/dashboard', authenticateToken, authorizeRole('admin', 'teacher', 'parent', 'student'), (req, res) => {
    res.json({ message: 'Welcome to the dashboard', user: req.user });
});

module.exports = router;



// router.get('/dashboard', authenticateToken, authorizeRole('admin', 'teacher', 'parent', 'student'), (req, res) => {
//     res.json({ message: 'Welcome to the dashboard', user: req.user });
// });

// module.exports = router;



// Registration Route
// router.post('/register', async (req, res) => {
//     const { username, password, role, email, contact_number } = req.body;
    
//     try {
//         // Check if user already exists
//         const [existingUser] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
//         if (existingUser.length > 0) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         await db.query('INSERT INTO Users (username, password, role, email, contact_number) VALUES (?, ?, ?, ?, ?)', 
//                        [username, hashedPassword, role, email, contact_number]);

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to register user' });
//     }
// });


// // Login Route
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const [user] = await db.query("SELECT * FROM Users WHERE username = ?", [username]);

//         if (user.length === 0) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         const validPass = await bcrypt.compare(password, user[0].password);
//         if (!validPass) {
//             return res.status(400).json({ message: 'Invalid Password' });
//         }

//         const token = jwt.sign({ id: user[0].user_id, role: user[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.json({ token, role: user[0].role }); // Send token and role in response
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


