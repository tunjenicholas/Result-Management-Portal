const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from headers
    if (!token) {
        return res.status(403).json({ message: 'Access denied: no token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
    
        console.log('Decoded token:', decoded); // Log the decoded token
    
        // Check if the user role is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
    
        req.userId = decoded.id; // Store user ID for later use
        next(); // Proceed to the next middleware or route handler
    });
    
};

module.exports = adminMiddleware;
