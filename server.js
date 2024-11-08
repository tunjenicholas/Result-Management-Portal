const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');  // Import jwt here
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5500',
    methods: 'GET,POST',  
    allowedHeaders: 'Content-Type, Authorization',
}));


app.use(session({
    secret: process.env.SESSION_SECRET,       
    resave: false,                            
    saveUninitialized: true,                  
    cookie: { secure: false }                  
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Dashboard', express.static(path.join(__dirname, 'Dashboard')));

// Serve index.html from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashboard', 'admin-dashboard.html'));
});

// Importing Routes
const authRoutes = require('./routes/authRoutes');
const resultsRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/results', resultsRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', userRoutes);

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }
        res.redirect('/');
    });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
