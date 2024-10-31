const body = document.querySelector("body"),
sidebar = body.querySelector(".dashboard-sidebar-container");
sidebarToggle = body.querySelector(".sidebar-toggle");


sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("sidebarStatus", "closed");
    } else {
        localStorage.setItem("sidebarStatus", "open");
    }
});





