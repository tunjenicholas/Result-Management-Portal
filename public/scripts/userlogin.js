document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('student-login-form');
    const errorMessage = document.getElementById('student-error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                errorMessage.textContent = 'Both fields are required.';
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.token && data.role) {
                    // Store both token and admission_number in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('admission_number', data.admission_number);

                    // Log the values for debugging
                    console.log("Token saved to localStorage:", localStorage.getItem("token"));
                    console.log("Logged in user role:", data.role);
                    
                    // Redirect based on role
                    const redirectToDashboard = {
                        'student': '/Dashboard/student-dashboard.html',
                        'parent': '/Dashboard/parent-dashboard.html',
                        'teacher': '/Dashboard/teacher-dashboard.html',
                        'admin': '/Dashboard/admin-dashboard.html',
                    };

                    const redirectUrl = redirectToDashboard[data.role];

                    if (redirectUrl) {
                        // Redirect after a small delay to ensure token is saved
                        setTimeout(() => {
                            window.location.href = redirectUrl;
                        }, 100);  
                    } else {
                        console.error('Unknown role:', data.role);
                        errorMessage.textContent = 'Role not recognized. Please contact support.';
                    }
                } else {
                    console.error('Login failed:', data.message || 'Invalid credentials');
                    errorMessage.textContent = 'Invalid credentials. Please try again.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                errorMessage.textContent = 'An error occurred. Please try again later.';
            }
        });
    }
});
