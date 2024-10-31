// Sidebar Toggle
const body = document.querySelector("body"),
sidebar = body.querySelector(".dashboard-sidebar-container");
sidebarToggle = body.querySelector(".sidebar-toggle");

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

// sidebar dropdown

document.querySelectorAll('.dropdown-title').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
        const dropdownContainer = e.currentTarget.closest('.dropdown-list-container');
        dropdownContainer.classList.toggle('open');
    });
});








// Student Login
//     document.getElementById("student-form").addEventListener("submit", async (event) => {
//         event.preventDefault();
        
//         const username = document.getElementById("username").value;
//         const password = document.getElementById("password").value;

//         const response = await fetch('/login/student', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, password })
//         });

//         const data = await response.json();
        
//         if (data.success) {
//             window.location.href = "/dashboard/student"; // Redirect to student dashboard
//         } else {
//             alert(data.message); // Display error message
//         }
//     });

//     // Function to handle login for different user types
// async function handleLogin(event, userType) {
//     event.preventDefault();

//     // Collect login credentials from form
//     const username = document.getElementById(`${userType}-username`).value;
//     const password = document.getElementById(`${userType}-password`).value;

//     try {
//         const response = await fetch(`/login/${userType}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, password })
//         });

//         const result = await response.json();
        
//         if (response.ok) {
//             // Redirect based on user type
//             window.location.href = `${userType}_dashboard.html`;
//         } else {
//             document.getElementById(`${userType}-error`).innerText = result.message || "Login failed";
//         }
//     } catch (error) {
//         document.getElementById(`${userType}-error`).innerText = "Error connecting to the server";
//     }
// }

// // Attach event listeners for each login form
// document.getElementById('student-login-form').addEventListener('submit', (e) => handleLogin(e, 'student'));
// document.getElementById('parent-login-form').addEventListener('submit', (e) => handleLogin(e, 'parent'));
// document.getElementById('teacher-login-form').addEventListener('submit', (e) => handleLogin(e, 'teacher'));
// document.getElementById('admin-login-form').addEventListener('submit', (e) => handleLogin(e, 'admin'));

// const express = require("express");
// const mysql = require("mysql2"); 
// const bodyParser = require("body-parser");
// const app = express();

// app.use(bodyParser.json());

// // Example login route for student
// app.post("/login/:role", async (req, res) => {
//     const { role } = req.params;
//     const { username, password } = req.body;

//     let table;
//     switch(role) {
//         case "student":
//             table = "students";
//             break;
//         case "parent":
//             table = "parents";
//             break;
//         case "teacher":
//             table = "teachers";
//             break;
//         case "admin":
//             table = "admins";
//             break;
//         default:
//             return res.status(400).json({ message: "Invalid user role" });
//     }

//     const db = mysql.createConnection({
//         host: "localhost",
//         user: "root",
//         password: "@Nico2015",
//         database: "highschool_result_portal"
//     });

//     db.query(
//         `SELECT * FROM ${table} WHERE username = ? AND password = ?`, [username, password],
//         (err, results) => {
//             if (err) {
//                 return res.status(500).json({ message: "Database error", error: err });
//             }
//             if (results.length > 0) {
//                 res.json({ message: `${role} login successful` });
//             } else {
//                 res.status(401).json({ message: "Invalid username or password" });
//             }
//         }
//     );
// });

// // Start the server
// const PORT = 3311;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // Add a basic validation check for empty username or password
// if (!username || !password) {
//     document.getElementById(`${userType}-error`).innerText = "Please enter both username and password.";
//     return;
// }

