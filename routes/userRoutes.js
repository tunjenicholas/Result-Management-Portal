// Create a new user
router.post('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.query(`INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role]);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update a user's role
router.put('/users/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        await db.query(`UPDATE Users SET role = ? WHERE id = ?`, [role, id]);
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Delete a user
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM Users WHERE id = ?`, [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
