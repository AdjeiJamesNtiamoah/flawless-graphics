// ================================================================
//  TEACHER DASHBOARD AUTH FIX
// ================================================================

// 1. Read logged-in user
const activeUser = JSON.parse(localStorage.getItem("active_user") || "null");

// 2. Block access if not logged in
if (!activeUser) {
    alert("Session expired. Please login again.");
    window.location.href = "teacher.html";
}

// 3. Block access if user is NOT a teacher
if (activeUser.role !== "teacher") {
    alert("Unauthorized access!");
    window.location.href = "site-login.html";
}

// ================================================================
//  DISPLAY TEACHER DETAILS ON DASHBOARD
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("teacherName").textContent = activeUser.name;
    document.getElementById("teacherEmail").textContent = activeUser.email;
    document.getElementById("teacherOrg").textContent = activeUser.org;
});

// ================================================================
//  LOGOUT FUNCTION
// ================================================================
function logoutTeacher() {
    localStorage.removeItem("active_user");
    window.location.href = "teacher.html";
}
