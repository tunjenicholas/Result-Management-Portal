const bcrypt = require('bcrypt');
const db = require('./config/db'); // Ensure your database configuration is properly required

const createAdminUser = async () => {
    const username = 'tunjenicholas';
    const password = '@tunje';
    const email = 'nm.tunje@gmail.com';
    const admissionNumber = null; // Set admission number to null since this is an admin
    const name = 'Nicholas Tunje'; // Admin's name

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new admin user into the Users table
        const [userResult] = await db.query(
            'INSERT INTO users (admission_number, username, password, email, role, name) VALUES (?, ?, ?, ?, ?, ?)', 
            [admissionNumber, username, hashedPassword, email, 'admin', name] // Assign 'admin' role to the user
        );

        // Check if the user was successfully inserted
        if (!userResult || !userResult.insertId) {
            console.error("Error: User insert failed.");
            return;
        }

        console.log("Admin user created successfully with ID:", userResult.insertId);
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

// Run the function
createAdminUser();
