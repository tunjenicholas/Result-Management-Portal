const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }
};
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        const { role } = req.user;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
}

// const authorizeRole = (role) => {
//     return (req, res, next) => {
//         if (req.user && req.user.role === role) {
//             next();
//         } else {
//             res.status(403).json({ message: 'Access Denied: Unauthorized Role' });
//         }
//     };
// };

module.exports = { authenticateToken, authorizeRole };


