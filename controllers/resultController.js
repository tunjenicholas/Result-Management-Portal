const db = require('../config/db');
const { calculateGrade } = require('../helpers/gradeHelper');
const { authorizeRole } = require('../middlewares/authMiddleware');
require('dotenv').config();

// Retrieve all results
exports.getAllResults = async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM results');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving results', error });
    }
};

// Retrieve results by admission number
exports.getResultsByAdmissionNumber = async (req, res) => {
    const { admission_number } = req.params;

    try {
        const [results] = await db.execute(
            'SELECT * FROM results WHERE admission_number = ?',
            [admission_number]
        );
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving results', error });
    }
};

// Retrieve results by admission number, term, and year
exports.getResultsByTermAndYear = async (req, res) => {
    const { admission_number, term, year } = req.params;

    console.log("Received:", admission_number, term, year); // Debugging

    // Format the term to match the database naming convention
    const formattedTerm = `Term ${term}`; // Converts 1 to 'Term 1', 2 to 'Term 2', etc.

    try {
        const [results] = await db.execute(
            'SELECT * FROM results WHERE admission_number = ? AND term = ? AND year = ?',
            [admission_number, formattedTerm, year] // Use formattedTerm here
        );
        console.log("Database query results:", results); // Debugging

        res.status(200).json(results);
    } catch (error) {
        console.error("Error retrieving results:", error);  // More detailed error logs
        res.status(500).json({ message: 'Error retrieving results', error });
    }
};


// Add results and update class positions
exports.addResults = async (req, res) => {
    console.log('Request body received:', req.body);
    const { admission_number, results } = req.body;

    // Debugging log to check the structure of the request
    console.log('Request Body:', req.body);

    const term = results && results[0] ? results[0].term : undefined;
    const year = results && results[0] ? results[0].year : undefined;

    // Validate that all required fields are provided
    console.log('Admission Number:', admission_number);
    console.log('Results:', results);
    console.log('Term:', term);
    console.log('Year:', year);
    if (!admission_number || !results || !term || !year) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let resultsToInsert = [];
    let totalMarks = 0;
    let gradePoints = 0;

    // Ensure results is an array and process each result
    if (Array.isArray(results)) {
        // Process each result in the results array
        resultsToInsert = results.map(result => {
            if (!result.marks || result.marks === undefined || result.marks === null) {
                return res.status(400).json({ message: 'Marks are required for each result' });
            }

            const { grade, points } = calculateGrade(result.marks);

            if (!grade || !points) {
                return res.status(400).json({ message: 'Grade and points could not be calculated for marks: ' + result.marks });
            }

            totalMarks += result.marks;
            gradePoints += points;

            return [admission_number, result.subject, result.marks, grade, points, result.term, result.year];
        });
    } else {
        // If results is not an array, process it as a single result
        if (!results.marks || results.marks === undefined || results.marks === null) {
            return res.status(400).json({ message: 'Marks are required for the result' });
        }

        const { grade, points } = calculateGrade(results.marks);

        if (!grade || !points) {
            return res.status(400).json({ message: 'Grade and points could not be calculated for marks: ' + results.marks });
        }

        totalMarks += results.marks;
        gradePoints += points;

        resultsToInsert = [
            [admission_number, results.subject, results.marks, grade, points, results.term, results.year]
        ];
    }

    // Debugging log to check the results being inserted
    console.log('Results to Insert:', resultsToInsert);

    try {
        const query = 'INSERT INTO results (admission_number, subject, marks, grade, points, term, year) VALUES ' +
            resultsToInsert.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

        const flattenedValues = resultsToInsert.flat();

        // Log query and values to debug
        console.log('Query:', query);
        console.log('Flattened Values:', flattenedValues);

        // Insert the results into the results table
        await db.execute(query, flattenedValues);

        // Retrieve the stream ID from the students' stream and class info
        const [stream] = await db.execute(
            'SELECT s.id FROM streams s JOIN students st ON s.form = st.class AND s.stream = st.stream WHERE st.admission_number = ?',
            [admission_number]
        );

        // Check if the student’s stream exists
        if (stream.length === 0) {
            return res.status(404).json({ message: 'Stream not found for the student' });
        }

        // Insert the student's class position (total marks and grade points) into the class_positions table
        await db.execute(
            'INSERT INTO class_positions (admission_number, stream_id, term, year, total_marks, grade_points) VALUES (?, ?, ?, ?, ?, ?)',
            [admission_number, stream[0].id, term, year, totalMarks, gradePoints]
        );

        // Calculate and update positions of all students in the class based on total marks
        const updatePositionQuery = `
            UPDATE class_positions cp
            JOIN (
                SELECT admission_number, RANK() OVER (PARTITION BY term, year ORDER BY total_marks DESC) AS position
                FROM class_positions
                WHERE term = ? AND year = ?
            ) ranked
            ON cp.admission_number = ranked.admission_number
            SET cp.position = ranked.position
            WHERE cp.term = ? AND cp.year = ?;
        `;

        // Update positions of all students
        await db.execute(updatePositionQuery, [term, year, term, year]);

        // Send success response
        res.status(201).json({ message: 'Results added and class positions updated successfully' });
    } catch (error) {
        console.error('Error adding results:', error);
        res.status(500).json({ message: 'Error adding results and updating class positions', error: error.message });
    }
};

// Update a specific result
exports.updateResult = async (req, res) => {
    const { id } = req.params;
    const { subject, marks, term, year } = req.body;
    const { grade, points } = calculateGrade(marks);

    try {
        const [result] = await db.execute(
            'UPDATE results SET subject = ?, marks = ?, grade = ?, points = ?, term = ?, year = ? WHERE id = ?',
            [subject, marks, grade, points, term, year, id]
        );
        res.status(200).json({ message: 'Result updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating result', error });
    }
};

// Delete a specific result
exports.deleteResult = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute('DELETE FROM results WHERE id = ?', [id]);
        res.status(200).json({ message: 'Result deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting result', error });
    }
};
