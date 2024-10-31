const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)', 
                       [username, hashedPassword, role]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await db.query("SELECT * FROM Users WHERE username = ?", [username]);
        if (user.length === 0) return res.status(400).send('User not found');

        const validPass = await bcrypt.compare(password, user[0].password);
        if (!validPass) return res.status(400).send('Invalid Password');

        const token = jwt.sign({ id: user[0].user_id, role: user[0].role }, process.env.JWT_SECRET);
        res.header('auth-token', token).send({ token });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
