document.getElementById("loginForm")?.addEventListener("submit", function (e) {
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
        const user = orgUsers.find(u => (u.email || '').toLowerCase() === email && (u.pass === hashedPass || u.pass === pass || u.rawPassPreview === pass));

        if (!user) {
            if (window.Toaster && typeof window.Toaster.error === 'function') {
                window.Toaster.error("Invalid Credentials", "Email or password did not match.");
            } else {
                alert("Invalid login credentials");
            }
            return;
        }

        // Approval status gate
        const status = (user.status || 'active').toLowerCase();
        if (status === 'pending_approval' || status === 'pending') {
            const approver = user.role === 'hr' ? 'the Super Administrator' : 'Human Resources';
            const msg = `Your ${user.role.toUpperCase()} account is pending approval by ${approver}. Please wait for confirmation.`;
            if (window.Toaster && typeof window.Toaster.warning === 'function') {
                window.Toaster.warning("Account Pending Approval", msg);
            } else {
                alert(msg);
            }
            return;
        }

        if (status === 'suspended' || status === 'rejected') {
            const msg = status === 'suspended' 
                ? "Your account has been suspended. Please contact your organization administrator."
                : "Your registration request was not approved. Please contact administration.";
            if (window.Toaster && typeof window.Toaster.error === 'function') {
                window.Toaster.error("Access Restricted", msg);
            } else {
                alert(msg);
            }
            return;
        }

        // Save logged-in user and synchronize AuthSession
        localStorage.setItem("active_user", JSON.stringify(user));
        if (window.AuthSession) {
            window.AuthSession.setUser(user);
        }

        if (window.Toaster && typeof window.Toaster.success === 'function') {
            window.Toaster.success("Welcome", `Signed in successfully as ${user.name || user.email}`);
        }

        // Role-based redirects
        if (user.role === "admin") {
            window.location.href = "pages/admin/admin-dashboard.html";
        } else if (user.role === "hr") {
            window.location.href = "pages/hr/hr-dashboard.html";
        } else if (user.role === "teacher") {
            window.location.href = "pages/teacher/teacher-dashboard.html";
        } else if (user.role === "finance") {
            window.location.href = "pages/finance/finance-dashboard.html";
        } else {
            window.location.href = "welcome.html";
        }
    });
});
