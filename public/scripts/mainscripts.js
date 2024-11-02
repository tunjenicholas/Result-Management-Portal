document.getElementById('student-login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Handle successful login, e.g., store the token and redirect
            localStorage.setItem('auth-token', result.token);
            document.getElementById('student-error-message').innerText = 'Login successful!';
            // Redirect to a different page, if needed
            // window.location.href = 'dashboard.html';
        } else {
            // Handle errors (user not found, invalid password, etc.)
            document.getElementById('student-error-message').innerText = result.error || 'Login failed';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('student-error-message').innerText = 'Server error';
    }
});