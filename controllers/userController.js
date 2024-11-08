const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Adjust this according to your database setup


// Add a new user
async function addUser(req, res) {
    const { admission_number, username, name, role, password, email, class: studentClass, stream } = req.body;

    if (!username || !password || !name || !role || !studentClass || !stream) {
        return res.status(400).json({ message: 'Username, password, name, role, class, and stream are required' });
    }

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult] = await pool.query(
            'INSERT INTO users (admission_number, username, name, role, password, email, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [admission_number || null, username, name, role, hashedPassword, email]
        );

        const userId = userResult.insertId;

        const [roleResult] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [role]);

        if (roleResult.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const roleId = roleResult[0].id;

        await pool.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
        );

        await pool.query(
            'INSERT INTO students (admission_number, class, stream) VALUES (?, ?, ?)',
            [admission_number, studentClass, stream]
        );

        // Ensure the stream exists in the streams table
        await pool.query(
            'INSERT IGNORE INTO streams (form, stream) VALUES (?, ?)',
            [studentClass, stream]
        );

        return res.status(201).json({ message: 'User added successfully', userId });
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Get all users
async function getAllUsers(req, res) {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        const safeUsers = users.map(({ password, admission_number, ...user }) => {
            if (admission_number !== null) {
                user.admission_number = admission_number;
            }
            return user;
        });
        return res.status(200).json({ data: safeUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Get a user by username
async function getUserByUsername(req, res) {
    const { username } = req.params;
    try {
        const [user] = await pool.query('SELECT id, admission_number, name, role, email, created_at, username FROM users WHERE username = ?', [username]);
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out fields that are null
        const filteredUser = Object.fromEntries(
            Object.entries(user[0]).filter(([_, value]) => value !== null)
        );

        res.json(filteredUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update user details
async function updateUser(req, res) {
    const { username } = req.params;
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE username = ?',
            [name, email, username]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Delete a user
async function deleteUser(req, res) {
    const { username } = req.params;

    try {
        console.log(`Attempting to delete user with username: ${username}`);

        const [result] = await pool.query('DELETE FROM users WHERE username = ?', [username]);

        if (result.affectedRows === 0) {
            console.log("No user found with the provided username.");
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("User deletion successful.");
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


// Assign role to a user
async function assignRole(req, res) { 
    const { username, role } = req.body;

    try {
        const [userResult] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult[0].id;

        const [roleResult] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [role]);
        if (roleResult.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        const roleId = roleResult[0].id;

        const result = await pool.query(
            'UPDATE users SET role = ? WHERE username = ?',
            [role, username]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [userRoleResult] = await pool.query(
            'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
            [userId, roleId]
        );

        if (userRoleResult.length === 0) {
            await pool.query(
                'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                [userId, roleId]
            );
        }

        res.status(200).json({ message: 'Role assigned successfully' });
    } catch (error) {
        console.error("Error assigning role:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get student info by username (student role only)
async function getStudentInfo(req, res) {
    const { username } = req.user; // Retrieve username from authenticated user

    try {
        const [user] = await pool.query(
            `SELECT name, admission_number, email, parent_contact, form, club, dormitory_name, school_name 
             FROM users 
             WHERE username = ? AND role = "student"`,
            [username]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        console.error("Error fetching student info:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
    addUser,
    getAllUsers,
    getUserByUsername,
    updateUser,
    deleteUser,
    assignRole,
    getStudentInfo
};
