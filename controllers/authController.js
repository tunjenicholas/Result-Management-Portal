const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

// Controller for user registration
async function registerUser(req, res) {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the role exists in the roles table
        const [roleExists] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [role]);
        if (roleExists.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Hash password before inserting user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the 'users' table
        const [insertUserResult] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        const userId = insertUserResult.insertId;

        // Insert into user_roles table with correct role_id
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleExists[0].id]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Controller for user login
async function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the user exists
        const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || user.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const foundUser = user[0];
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Get the role for the user
        const [roleResult] = await pool.query(`
            SELECT r.role_name FROM roles r 
            JOIN user_roles ur ON r.id = ur.role_id 
            WHERE ur.user_id = ?`, [foundUser.id]);

        if (!roleResult || roleResult.length === 0) {
            console.error(`No role found for user ID: ${foundUser.id}`);
            return res.status(500).json({ message: 'Role not found' });
        }

        // Generate JWT token including role and admission number (if available)
        const token = jwt.sign({
            id: foundUser.id,
            role: roleResult[0].role_name,
            admission_number: foundUser.admission_number || null
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        return res.status(200).json({
            token,
            role: roleResult[0].role_name,
            admission_number: foundUser.admission_number || null,
            username: foundUser.username  // Optionally return username as well
        });

    } catch (error) {
        console.error("Error during login process:", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { registerUser, loginUser };
