const body = document.querySelector("body"),
sidebar = body.querySelector(".dashboard-sidebar-container");
sidebarToggle = body.querySelector(".sidebar-toggle");


sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});