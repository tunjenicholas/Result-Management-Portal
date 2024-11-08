document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content-here");

    // Function to load content into main-content-here (appending rather than replacing)
    function loadContent(content) {
        mainContent.innerHTML = content;  // Replace existing content to avoid duplicate loading
        setupEventListeners(); // Re-attach event listeners to any new elements
    }

    // Function to safely add event listeners after checking element existence
    function addEventListenerIfExists(elementId, eventType, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, callback);
        }
    }

    // Setup all event listeners (modular approach for cleaner code)
    function setupEventListeners() {
        // Add event listener to "viewStudentResults"
        addEventListenerIfExists("viewStudentResults", "click", (e) => {
            e.preventDefault();
            // Clear any existing content before loading new content
            loadContent(`
                <div id="result-management-container">
                    <h2>Search Student Results by Admission Number</h2>
                    <form id="result-search-form">
                        <label for="admissionNumber">Admission Number:</label>
                        <input type="text" id="admissionNumber" name="admissionNumber" required>
                        <button type="submit">Search</button>
                    </form>
                    <div id="results-container"></div>
                </div>
            `);
        });

        // Add event listener to the "result-search-form"
        addEventListenerIfExists("result-search-form", "submit", async (e) => {
            e.preventDefault();

            const admissionNumber = document.getElementById("admissionNumber").value;
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login to view results.");
                return;
            }

            const resultsContainer = document.getElementById("results-container");
            resultsContainer.innerHTML = "<p>Loading results...</p>";  // Show loading text

            try {
                const response = await fetch(`/api/results/student/${admissionNumber}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Clear any previous results and display new ones
                    resultsContainer.innerHTML = `
                        <h1>School Name: MALINDI HIGH SCHOOL</h1>
                        <p><strong>Student Name:</strong> ${data.student_name || 'N/A'}</p>
                        <p><strong>Admission Number:</strong> ${data.admission_number || 'N/A'}</p>
                        <p><strong>Class/Form:</strong> ${data.student_class || 'N/A'} | ${data.student_stream || 'N/A'}</p>
                        <h3>Student Results</h3>
                    `;

                    if (!data.results || data.results.length === 0) {
                        resultsContainer.innerHTML += "<p>No results found for this admission number.</p>";
                    } else {
                        let tableContent = `
                            <table>
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Marks</th>
                                        <th>Grade</th>
                                        <th>Points</th>
                                        <th>Term</th>
                                        <th>Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        data.results.forEach(result => {
                            tableContent += `
                                <tr>
                                    <td>${result.subject}</td>
                                    <td>${result.marks}</td>
                                    <td>${result.grade}</td>
                                    <td>${result.points}</td>
                                    <td>${result.term}</td>
                                    <td>${result.year}</td>
                                </tr>
                            `;
                        });

                        tableContent += `</tbody></table>`;
                        resultsContainer.innerHTML += tableContent;
                    }
                } else {
                    const error = await response.json();
                    alert(error.message || "Error fetching results.");
                    resultsContainer.innerHTML = "<p>Error retrieving results. Please try again later.</p>";
                }
            } catch (error) {
                console.error("Error fetching results:", error);
                resultsContainer.innerHTML = "<p>Failed to retrieve results. Please try again later.</p>";
            }
        });

        // Add event listener to "viewAllResults"
        addEventListenerIfExists("viewAllResults", "click", (e) => {
            e.preventDefault();
            loadContent("<h2>All Results</h2><p>Here you can view all results.</p>");
        });

        // Add event listener to "viewTermYearResults"
        addEventListenerIfExists("viewTermYearResults", "click", (e) => {
            e.preventDefault();
            loadContent(`
                <h2>View Term and Year Results</h2>
                <form id="termYearResultsForm">
                    <label for="term">Term:</label>
                    <select id="term">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    <label for="year">Year:</label>
                    <input type="number" id="year" required>
                    <button type="button" id="searchTermYearResults">Search</button>
                </form>
            `);
        });

        // Add event listener to "addNewResults"
        addEventListenerIfExists("addNewResults", "click", (e) => {
            e.preventDefault();
            loadContent(`
                <h2>Add New Results</h2>
                <form id="addResultsForm">
                    <label for="admissionNumber">Admission Number:</label>
                    <input type="text" id="admissionNumber" required>
                    <label for="subject">Subject:</label>
                    <input type="text" id="subject" required>
                    <label for="marks">Marks:</label>
                    <input type="number" id="marks" required>
                    <button type="button" id="addResultButton">Add Result</button>
                </form>
            `);
        });

        // Add event listener to "updateResult"
        addEventListenerIfExists("updateResult", "click", (e) => {
            e.preventDefault();
            loadContent("<h2>Update Result</h2><p>Form to update an existing result.</p>");
        });

        // Add event listener to "deleteResult"
        addEventListenerIfExists("deleteResult", "click", (e) => {
            e.preventDefault();
            loadContent("<h2>Delete Result</h2><p>Form to delete a result record.</p>");
        });
    }

    // Initialize event listeners setup
    setupEventListeners();
});
