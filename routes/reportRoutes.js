const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const {
    getStudentPerformanceSummary,
    getStudentTermPerformance,
    getOverallPerformanceSummary
} = require('../controllers/reportController');

// Retrieve performance summary for a specific student (Admin, Teacher, Parent)
router.get('/student/:admission_number',
    authenticateToken,
    authorizeRole('admin', 'teacher', 'parent'),
    getStudentPerformanceSummary
);

// Retrieve performance for a specific term and year for a student (Admin, Teacher, Parent)
router.get('/term/:admission_number/:term/:year',
    authenticateToken,
    authorizeRole('admin', 'teacher', 'parent'),
    getStudentTermPerformance
);

// Retrieve overall performance summary for a specific term and year (Admin, Teacher)
router.get('/summary/:term/:year',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    getOverallPerformanceSummary
);

module.exports = router;
