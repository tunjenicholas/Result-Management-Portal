const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const {
    getAllResults,
    getResultsByAdmissionNumber,
    addResults,
    updateResult,
    deleteResult,
    getResultsByTermAndYear
} = require('../controllers/resultController');

// Route to get all results (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), getAllResults);

// Route to get results by admission number (accessible by student, parent, admin, and teacher)
// Result Management Route (updated for correct route)
router.get('/student/:admission_number', authenticateToken, authorizeRole
    ('student', 'parent', 'admin', 'teacher'), 
    getResultsByAdmissionNumber);


// Route to add a new result (admin and teacher only)
router.post('/', authenticateToken, authorizeRole('admin', 'teacher'), addResults);

// Route to update a specific result (admin and teacher only)
router.put('/:id', authenticateToken, authorizeRole('admin', 'teacher'), updateResult);

// Route to delete a result (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteResult);

// Route to get results by term and year for performance reporting (student, parent, admin, and teacher)
router.get('/:admission_number/:term/:year', authenticateToken, authorizeRole('student', 'parent', 'admin', 'teacher'), getResultsByTermAndYear);


// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// // Route to generate PDF result slip
// router.get('/student/:admission_number/pdf/:term/:year', authenticateToken, authorizeRole('student', 'parent'), async (req, res) => {
//     const { admission_number, term, year } = req.params;

//     try {
//         // Fetch the results and student details from the database (use existing route logic)
//         const [results] = await db.execute(
//             'SELECT * FROM results WHERE admission_number = ? AND term = ? AND year = ?',
//             [admission_number, term, year]
//         );

//         const [studentInfo] = await db.execute(
//             'SELECT name, class, stream FROM students WHERE admission_number = ?',
//             [admission_number]
//         );

//         const student = studentInfo[0];

//         // Create a new PDF document
//         const doc = new PDFDocument();

//         // Stream the PDF to the response
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'inline; filename="result.pdf"');
        
//         doc.pipe(res);

//         // Add header information
//         doc.fontSize(16).text('School Name', { align: 'center' });
//         doc.fontSize(14).text(`Student Name: ${student.name}`, { align: 'left' });
//         doc.text(`Adm No: ${admission_number} | Class: ${student.class} | Exam: Term ${term} Year ${year}`, { align: 'left' });

//         // Add results table
//         doc.moveDown();
//         doc.text('Subjects | Grade', { underline: true });

//         results.forEach(result => {
//             doc.text(`${result.subject} | ${result.grade}`);
//         });

//         // Add footer information
//         doc.moveDown();
//         doc.text(`Total Marks: ${results.reduce((acc, result) => acc + result.marks, 0)}`);
//         doc.text(`Position in Class: 1`); // Adjust as needed
//         doc.text(`Overall Grade: ${calculateGrade(results.reduce((acc, result) => acc + result.marks, 0) / results.length).grade}`);
//         doc.text(`Grade Points: ${results.reduce((acc, result) => acc + result.points, 0)}`);

//         // Finalize the document and send the response
//         doc.end();

//     } catch (error) {
//         res.status(500).json({ message: 'Error generating PDF', error });
//     }
// });


module.exports = router;
