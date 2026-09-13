const fs = require('fs');

function updateReg(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  const target = `                // 1. If Supabase is configured
                if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.SupabaseService) {
                    try {
                        const authResult = await window.SupabaseService.signUp(email, pw, {
                            org_name: org,
                            org_id: orgId,
                            org_tier: orgTier,
                            admin_name: name,
                            logo_path: currentLogoBase64 || null
                        });

                        window.SupabaseService.saveOrganization({
                            org_name: org,
                            org_id: orgId,
                            admin_name: name,
                            email: email,
                            logo_path: currentLogoBase64 || null
                        }).catch(e => console.warn("Supabase organization sync warning:", e));

                        window.SupabaseService.saveUser(newUser).catch(e => console.warn("Supabase user sync warning:", e));

                        AuthSession.setUser(newUser);

                        if (authResult.requiresVerification) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Complete Institutional Registration';
                            openVerificationModal(email, authResult.message);
                            return;
                        }

                        showMessage("Institution registered successfully! Launching workspace...", false);
                        setTimeout(() => {
                            window.location.href = "welcome.html";
                        }, 1000);
                        return;
                    } catch (supaErr) {
                        console.warn("Supabase Auth error:", supaErr);
                        if (supaErr.message && supaErr.message.toLowerCase().includes("already registered")) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Complete Institutional Registration';
                            return showMessage("This email is already registered. Please go to Login.");
                        }
                        throw supaErr;
                    }
                }

                // 2. LocalStorage offline fallback
                let users = [];
                try {
                    users = JSON.parse(localStorage.getItem("organizations_users") || "[]");
                } catch (e) { users = []; }

                if (users.some(u => u.email === email)) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Complete Institutional Registration';
                    return showMessage("Email address is already registered.");
                }

                if (users.some(u => u.orgId === orgId)) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Complete Institutional Registration';
                    return showMessage("Institution slug is already taken. Please choose another.");
                }

                users.push(newUser);
                localStorage.setItem("organizations_users", JSON.stringify(users));

                AuthSession.setUser(newUser);
                showMessage("Institution registered successfully! Launching workspace...", false);
                setTimeout(() => {
                    window.location.href = "welcome.html";
                }, 1000);`;

  const replacement = `                // 1. Direct Supabase Cloud Registration
                if (window.SupabaseService) {
                    try {
                        const authResult = await window.SupabaseService.signUp(email, pw, {
                            org_name: org,
                            org_id: orgId,
                            org_tier: orgTier,
                            admin_name: name,
                            logo_path: currentLogoBase64 || null
                        });

                        await window.SupabaseService.saveOrganization({
                            org_name: org,
                            name: org,
                            org_id: orgId,
                            admin_name: name,
                            email: email,
                            logo_path: currentLogoBase64 || null
                        }).catch(e => console.warn("Supabase organization sync warning:", e));

                        await window.SupabaseService.saveUser(newUser).catch(e => console.warn("Supabase user sync warning:", e));

                        AuthSession.setUser(newUser);

                        if (authResult.requiresVerification) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Complete Institutional Registration';
                            openVerificationModal(email, authResult.message);
                            return;
                        }

                        showMessage("Institution registered successfully in Supabase Cloud! Launching workspace...", false);
                        setTimeout(() => {
                            window.location.href = "welcome.html";
                        }, 1000);
                        return;
                    } catch (supaErr) {
                        console.warn("Supabase Auth error:", supaErr);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Complete Institutional Registration';
                        if (supaErr.message && supaErr.message.toLowerCase().includes("already registered")) {
                            return showMessage("This email is already registered. Please go to Login.");
                        }
                        return showMessage("Supabase registration notice: " + (supaErr.message || "Failed to register in cloud database."));
                    }
                }`;

  if (!content.includes(target)) {
    console.error('Target not found in ' + filePath);
    process.exit(1);
  }

  content = content.replace(target, replacement);

  if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated ' + filePath);
}

updateReg('register.html');
updateReg('registration.html');
