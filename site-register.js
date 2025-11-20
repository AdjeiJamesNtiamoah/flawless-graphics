document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const org = document.getElementById("orgName").value.trim();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pass = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("regRole").value;  // hr / teacher / employee

    if (!org || !name || !email || !pass) {
        alert("All fields are required.");
        return;
    }

    // Encrypt password
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const hashed = await sha256(pass);

    let users = JSON.parse(localStorage.getItem("organizations_users")) || [];

    // Prevent duplicate email
    if (users.some(u => u.email === email)) {
        alert("Email already registered.");
        return;
    }

    users.push({
        org,
        name,
        email,
        pass: hashed,
        role: role.toLowerCase(),
        createdAt: Date.now()
    });

    localStorage.setItem("organizations_users", JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
});
