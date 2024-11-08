// JavaScript functions

// Sidebar Toggle
document.addEventListener("DOMContentLoaded", function() {
    const body = document.querySelector("body");
    const sidebar = body.querySelector(".dashboard-sidebar-container");
    const sidebarToggle = body.querySelector(".sidebar-toggle");

    if (sidebar && sidebarToggle) {
        if (localStorage.getItem("sidebarStatus") === "closed") {
            sidebar.classList.add("close");
        }

        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("close");

            if (sidebar.classList.contains("close")) {
                localStorage.setItem("sidebarStatus", "closed");
            } else {
                localStorage.setItem("sidebarStatus", "open");
            }
        });
    } else {
        console.warn("Sidebar or sidebar toggle button not found.");
    }
});

// sidebar dropdown

document.querySelectorAll('.dropdown-title').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
        const dropdownContainer = e.currentTarget.closest('.dropdown-list-container');
        dropdownContainer.classList.toggle('open');
    });
});

// Logout Function
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout-button');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            fetch('http://localhost:5000/logout', {
                method: 'GET',
                credentials: 'include'
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                }
            })
            .catch(error => {
                console.error('Error logging out:', error);
            });
        });
    } else {
        console.warn('Logout button not found.');
    }
});



// Add User Function
// document.addEventListener('DOMContentLoaded', function() {
//     const addUserForm = document.getElementById('add-user-form');

//     if (addUserForm) {
//         addUserForm.addEventListener('submit', async function(event) {
//             event.preventDefault();

//             // Get the values from the form inputs
//             const username = document.getElementById('username').value;
//             const password = document.getElementById('password').value;
//             const email = document.getElementById('email').value;
//             const role_name = document.getElementById('role-name').value;
//             const admission_number = document.getElementById('admission_number').value;
//             const name = document.getElementById('name').value;
//             const studentClass = document.getElementById('class').value;
//             const stream = document.getElementById('stream').value;

//             // Get the token from localStorage (or wherever it's stored)
//             const token = localStorage.getItem('authToken');

//             // Prepare the data object to send in the request
//             const userData = {
//                 username,
//                 password,
//                 email,
//                 role: role_name,  // Make sure to use role_name here if this is what you meant
//                 admission_number,
//                 name,
//                 class: studentClass,
//                 stream
//             };

//             try {
//                 const response = await fetch('http://localhost:5000/api', {  
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`  
//                     },
//                     body: JSON.stringify(userData)
//                 });

//                 const result = await response.json();

//                 if (response.ok) {
//                     alert('User added successfully!');
//                     addUserForm.reset();
//                 } else {
//                     alert('Error: ' + result.message);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('An error occurred while adding the user');
//             }
//         });
//     } else {
//         console.warn('Add user form not found.');
//     }
// });

// Utility function to decode JWT token
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}

// Show and hide sections based on button clicks
document.getElementById('view-results-btn').addEventListener('click', () => {
    // Show the results container and hide the search results section
    document.getElementById('search-results-section').style.display = 'block';
    document.getElementById('results-container').style.display = 'block';
});


document.getElementById('download-result-btn').addEventListener('click', () => {
    const results = document.getElementById('results-container').querySelector('table tbody').rows;
    // Ensure the results data is extracted correctly
    if (results && results.length > 0) {
        const formattedResults = Array.from(results).map(row => ({
            subject: row.cells[0].innerText,
            marks: row.cells[1].innerText,
            grade: row.cells[2].innerText,
            term: row.cells[3].innerText,
            year: row.cells[4].innerText
        }));
        downloadResultsAsCSV(formattedResults);
    } else {
        alert("No results available to download.");
    }
});

document.getElementById('print-result-btn').addEventListener('click', printResults);

// Fetch results by admission number if logged in
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        const userData = decodeJwt(token);
        if (userData) {
            const admissionNumber = userData.admission_number;
            document.getElementById('welcome-message').textContent = `Welcome, ${userData.role} ${admissionNumber}`;
        }
    } else {
        console.log("User is not logged in.");
        window.location.href = '/login';
    }
}

// Function to handle searching results based on term, year, and admission number
async function searchResults(term, year, admissionNumber) {
    document.getElementById('loading-spinner').style.display = 'block';  

    try {
        const response = await fetch(`/api/results/${admissionNumber}/${term}/${year}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const results = await response.json();
            console.log("Fetched results:", results); 
            displayResults(results);
            return results;  
        } else {
            document.getElementById('results-container').innerHTML = 'No results found for this search.';
            return [];  
        }
    } catch (error) {
        document.getElementById('results-container').innerHTML = 'Error occurred while fetching results.';
        console.error(error);  
        return [];  
    } finally {
        document.getElementById('loading-spinner').style.display = 'none';  
    }
}


// Function to display the results on the page
function displayResults(results) {
    console.log("Displaying results:", results); 
    
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; 

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found for this term and year.</p>';
        return;
    }

    // Build the HTML structure for displaying results
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>`;

    results.forEach(result => {
        html += `
            <tr>
                <td>${result.subject}</td>
                <td>${result.marks}</td>
                <td>${result.grade}</td>

            </tr>`;
    });

    html += `</tbody></table>`;
    resultsContainer.innerHTML = html; 
}




// Add an event listener to handle the form submission
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const year = document.getElementById('search-year').value;
    const term = document.getElementById('search-term').value;
    
    // Retrieve the admission number and token from local storage
    const admissionNumber = localStorage.getItem('admission_number'); 
    const token = localStorage.getItem('token');

    
    if (!token || !admissionNumber) {
        alert("You are not logged in or the required data is missing.");
        return;
    }
    
    // Prepare the request URL
    const url = `/api/results/${admissionNumber}/${term}/${year}`;
    
    document.getElementById('loading-spinner').style.display = 'block';
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch results");
        }
        
        const data = await response.json();
        console.log("Data fetched:", data);
        
        document.getElementById('loading-spinner').style.display = 'none';
        
        displayResults(data);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('loading-spinner').style.display = 'none';
        alert("An error occurred while fetching results. Please try again.");
    }
});


// Download results as CSV
function downloadResultsAsCSV(results) {
    console.log("Results being passed to CSV download:", results);  // Log the results

    // Check if results is a valid array and has data
    if (!Array.isArray(results) || results.length === 0) {
        alert("No results available to download.");
        return;
    }

    // Define the CSV content starting with the headers
    let csvContent = 'Subject,Marks,Grade\n';

    // Loop through the results and append to the CSV content
    results.forEach(result => {
        csvContent += `${result.subject},${result.marks},${result.grade}\n`;
    });

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create an anchor element and trigger a download
    const link = document.createElement('a');
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'results.csv');

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }
}



// Print results
function printResults() {
    const resultsContainer = document.getElementById('results-container');
    let printContent = `
    <html>
    <head><title>Print Results</title></head>
    <body>
        <h2>Student Results</h2>
        ${resultsContainer.innerHTML}
    </body>
    </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Check login status on page load
checkLoginStatus();



























































// document.getElementById('loadResultsForm').onclick = () => {
//     loadComponent('results-management.html');
// };

// async function loadComponent(component) {
//     const mainContent = document.getElementById('mainContent');
//     try {
//         const response = await fetch(`./components/${component}`);
//         if (!response.ok) throw new Error('Failed to load component');
//         const html = await response.text();
//         mainContent.innerHTML = html;
//     } catch (error) {
//         mainContent.innerHTML = `<p>Error loading content: ${error.message}</p>`;
//     }
// }

// document.getElementById('resultForm').onsubmit = async (event) => {
//     event.preventDefault();
//     const admissionNo = document.getElementById('admissionNo').value;
//     const examId = document.getElementById('examId').value;
//     const subjectId = document.getElementById('subjectId').value;
//     const marks = document.getElementById('marks').value;
//     const position = document.getElementById('position').value;

//     try {
//         const response = await fetch('http://localhost:5000/api/results', { // Update to match your server URL and port
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             },
//             body: JSON.stringify({ admission_no: admissionNo, exam_id: examId, subject_id: subjectId, marks, position })
//         });
//         const result = await response.json();
//         document.getElementById('resultMessage').innerText = result.message;
//     } catch (error) {
//         document.getElementById('resultMessage').innerText = 'Error: ' + error.message;
//     }
// };