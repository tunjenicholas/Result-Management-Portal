const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require('dotenv').config();


// middleware
app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5500' }));



// Importing Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const resultRoutes = require('./routes/resultRoutes');
const notificationRoutes = require('./routes/notificationRoutes');



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notifications', notificationRoutes);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Database Connection
// const db = mysql.createConnection({
    //     host: process.env.DB_HOST,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_NAME
    // });
    
    // db.connect((err) => {
    //     if (err) throw err;
    //     console.log('Database connected...');
    // });
// // Add Result (Admin or Teacher only)
// app.post('/results', (req, res) => {
//     const { student_id, subject_id, year, term, marks } = req.body;
//     const query = "INSERT INTO Results (student_id, subject_id, year, term, marks) VALUES (?, ?, ?, ?, ?)";

//     db.query(query, [student_id, subject_id, year, term, marks], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(201).json({ message: "Result added successfully" });
//     });
// });

// // Get Results (For Students and Parents)
// app.get('/results/:student_id', (req, res) => {
//     const { student_id } = req.params;
//     const query = "SELECT * FROM Results WHERE student_id = ?";

//     db.query(query, [student_id], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// // Send Notification (Admin only)
// app.post('/notifications', (req, res) => {
//     const { parent_id, message } = req.body;
//     const query = "INSERT INTO Notifications (parent_id, message) VALUES (?, ?)";

//     db.query(query, [parent_id, message], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(201).json({ message: "Notification sent successfully" });
//     });
// });

// // Get Notifications for Parent
// app.get('/notifications/:parent_id', (req, res) => {
//     const { parent_id } = req.params;
//     const query = "SELECT * FROM Notifications WHERE parent_id = ?";

//     db.query(query, [parent_id], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// // Hash passwords before storing them
// const saltRounds = 10;

// // User Registration (Admin only)
// app.post('/register', (req, res) => {
//     const { username, password, role, parent_contact, gender } = req.body;

//     bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
//         if (err) return res.status(500).json({ error: err.message });

//         const query = "INSERT INTO Users (username, password, role, parent_contact, gender) VALUES (?, ?, ?, ?, ?)";
//         db.query(query, [username, hashedPassword, role, parent_contact, gender], (err, results) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.status(201).json({ message: "User registered successfully" });
//         });
//     });
// });


// // Authorization middleware
// const authorize = (roles) => {
//     return (req, res, next) => {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) return res.status(403).json({ message: "Authorization token required" });

//         jwt.verify(token, JWT_SECRET, (err, decoded) => {
//             if (err) return res.status(401).json({ message: "Invalid token" });
//             if (!roles.includes(decoded.role)) return res.status(403).json({ message: "Access denied" });
//             req.user = decoded;
//             next();
//         });
//     };
// };

// // Register route - only accessible to admin
// app.post('/register', authorize(['admin']), (req, res) => { /* Registration Code */ });


// // Add result - accessible to admin and teacher only
// app.post('/results', authorize(['admin', 'teacher']), (req, res) => { /* Add Result Code */ });


// // Send Notification - only accessible to admin
// app.post('/notifications', authorize(['admin']), (req, res) => { /* Notification Code */ });


// // Mark notification as read
// app.put('/notifications/:id/read', authorize(['parent']), (req, res) => {
//     const { id } = req.params;
//     const query = "UPDATE Notifications SET is_read = TRUE WHERE id = ?";

//     db.query(query, [id], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: "Notification marked as read" });
//     });
// });


// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
