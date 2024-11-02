const loginForm = document.getElementById('student-login-form');
const errorMessage = document.getElementById('student-error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {  // Ensure this URL is correct
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            
            // Redirect based on user role
            switch (data.role) {
                case 'student':
                    window.location.href = '/Dashboard/student-dashboard.html';
                    break;
                case 'parent':
                    window.location.href = '/Dashboard/parent-dashboard.html';
                    break;
                case 'teacher':
                    window.location.href = '/Dashboard/teacher-dashboard.html';
                    break;
                case 'admin':
                    window.location.href = '/Dashboard/admin-dashboard.html';
                    break;
                default:
                    throw new Error('Unknown role');
            }
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'An error occurred. Please try again later.';
    }
});
















// // Assuming this is in your studentlogin.js
// document.getElementById('student-login-form').addEventListener('submit', async function(event) {
//     event.preventDefault();

//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     try {
//         const response = await fetch('http://localhost:3000/api/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ username, password })
//         });

//         if (!response.ok) {
//             throw new Error('Login failed');
//         }

//         const data = await response.json();
//         const { token, role } = data; // Extract token and role from response

//         // Store token in local storage
//         localStorage.setItem('token', token);

//         // Redirect based on user role
//         switch (role) {
//             case 'admin':
//                 window.location.href = '/public/html/dashboard/admin-dashboard.html';
//                 break;
//             case 'teacher':
//                 window.location.href = '/public/html/dashboard/teacher-dashboard.html';
//                 break;
//             case 'parent':
//                 window.location.href = '/public/html/dashboard/parent-dashboard.html';
//                 break;
//             case 'student':
//                 window.location.href = '/public/html/dashboard/student-dashboard.html';
//                 break;
//             default:
//                 throw new Error('Invalid role');
//         }
//     } catch (error) {
//         document.getElementById('student-error-message').innerText = error.message;
//     }
// });
