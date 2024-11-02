// public/scripts/dashboard.js
async function fetchUserData() {
    const token = localStorage.getItem('token'); 

    try {
        const response = await fetch('/api/user/data', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User data:', data);
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Call fetchUserData when the dashboard loads
document.addEventListener('DOMContentLoaded', fetchUserData);



// logout 
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/public/html/login/studentlogin.html';
});
