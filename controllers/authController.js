const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Registration function
async function registerUser(req, res) {
    const { username, password, role, email, contact_number } = req.body;
    
    try {
        const [existingUser] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO Users (username, password, role, email, contact_number) VALUES (?, ?, ?, ?, ?)', 
                       [username, hashedPassword, role, email, contact_number]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register user' });
    }
}

// Login function
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await db.query("SELECT * FROM Users WHERE username = ?", [username]);
        if (user.length === 0) return res.status(400).json({ message: 'User not found' });

        const validPass = await bcrypt.compare(password, user[0].password);
        if (!validPass) return res.status(400).json({ message: 'Invalid Password' });

        const token = jwt.sign({ id: user[0].user_id, role: user[0].role }, process.env.JWT_SECRET);
        res.json({ token, role: user[0].role });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser };
