document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPassword").value.trim();

    let orgUsers = JSON.parse(localStorage.getItem("organizations_users")) || [];

    // Hash password input
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    sha256(pass).then(hashedPass => {
        const user = orgUsers.find(u => u.email === email && u.pass === hashedPass);

        if (!user) {
            alert("Invalid login credentials");
            return;
        }

        // Save logged-in user
        localStorage.setItem("active_user", JSON.stringify(user));

        // 🔥 ROLE-BASED REDIRECTS (THIS WAS MISSING)
        if (user.role === "hr") {
            window.location.href = "hr-dashboard.html";
        }
        else if (user.role === "teacher") {
            window.location.href = "teacher-dashboard.html";  // FIXED
        }
        else if (user.role === "employee") {
            window.location.href = "employee-portal.html";
        }
        else {
            alert("Unknown role. Cannot continue.");
        }
    });
});
