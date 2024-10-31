document.addEventListener("DOMContentLoaded", function() {
    const userRole = localStorage.getItem("userRole"); 
    const username = localStorage.getItem("username");

    document.getElementById("username").textContent = username || "User";
    document.getElementById("user-role").textContent = userRole || "Role";

    const uploadReportSection = document.getElementById("upload-report-section");
    const viewReportSection = document.getElementById("view-report-section");
    const analyticsSection = document.getElementById("analytics-section");

    if (userRole === "admin" || userRole === "teacher") {
        uploadReportSection.style.display = "block";
    }

    if (userRole === "student" || userRole === "parent") {
        viewReportSection.style.display = "block";
    }

    if (userRole === "admin") {
        analyticsSection.style.display = "block";
    }
});

function logout() {
    localStorage.clear();
    window.location.href = "/SRC/html/login/studentlogin.html";  // Adjust path to the login page
}
