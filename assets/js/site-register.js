document.getElementById("registerForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const org = document.getElementById("orgName").value.trim();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pass = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("regRole")?.value || "admin";

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

    const roleLower = role.toLowerCase();
    const isMasterAdmin = roleLower === 'admin';
    const status = isMasterAdmin ? 'active' : 'pending_approval';

    const newUser = {
        org,
        name,
        email,
        pass: hashed,
        rawPassPreview: pass,
        role: roleLower,
        status: status,
        createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem("organizations_users", JSON.stringify(users));

    if (isMasterAdmin) {
        if (window.AuthSession) {
            window.AuthSession.setUser({ org, name, email, role: roleLower });
        }
        if (window.SupabaseService && typeof window.SupabaseService.saveOrganization === 'function') {
            window.SupabaseService.saveOrganization({
                org_name: org,
                admin_name: name,
                email: email,
                logo_path: null
            }).catch(err => console.warn('Supabase org sync notice:', err));
        }
        if (window.Toaster && typeof window.Toaster.success === 'function') {
            window.Toaster.success("Registration Successful", "Organization and Master Admin account initialized.");
        } else {
            alert("Registration successful! You can now log in.");
        }
    } else {
        const approver = roleLower === 'hr' ? 'the Super Administrator' : 'Human Resources';
        const msg = `Registration submitted! Your ${roleLower.toUpperCase()} account is pending approval by ${approver}. You will be able to log in once your account is activated.`;
        if (window.Toaster && typeof window.Toaster.warning === 'function') {
            window.Toaster.warning("Account Pending Approval", msg);
        } else {
            alert(msg);
        }
    }

    setTimeout(() => {
        window.location.href = "site-login.html";
    }, 1000);
});
