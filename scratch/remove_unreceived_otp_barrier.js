const fs = require('fs');

// 1. Update register.html & registration.html
function fixRegistrationFlow(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the blocking openVerificationModal call in register()
    const oldSubmitSuccess = `setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-building-circle-check"></i> Register Institution & Submit for Approval';
                openVerificationModal(payload.email, 'Institution registered successfully! Enter activation code to enter your workstation.');
            }, 600);`;

    const newSubmitSuccess = `submitBtn.disabled = true;
            submitBtn.style.background = 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)';
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Institution Authorized! Launching Workspace...';

            if (window.Toaster) {
                Toaster.success('Institution Authorized', 'Your institutional partition is ready. Welcome to FLAWLESS ERP!');
            }

            setTimeout(() => {
                window.location.href = "welcome.html";
            }, 900);`;

    content = content.replace(oldSubmitSuccess, newSubmitSuccess);

    // Also remove the modal container HTML if present
    content = content.replace(/<!-- MODAL 3: EMAIL & OTP VERIFICATION -->[\s\S]*?<!-- end modal 3 -->/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath + ' for instant seamless registration.');
}

fixRegistrationFlow('register.html');
fixRegistrationFlow('registration.html');

// 2. Update pages/teacher/teacher-login.html
function fixTeacherLoginFlow(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldTeacherAuth = `if (window.RealtimeAuth) {
                window.RealtimeAuth.openAuthModal({
                    email: email,
                    purpose: 'Educator Registration',
                    durationSeconds: 300,
                    onVerified: async () => {
                        await saveAndFinalizeTeacherRegistration(newTeacher);
                        if (window.RealtimeAuth.watchPendingApproval) {
                            window.RealtimeAuth.watchPendingApproval({
                                email: newTeacher.email,
                                role: 'teacher',
                                org: selectedOrgName,
                                targetUrl: 'teacher-dashboard.html'
                            });
                        }
                    }
                });
            } else {
                openVerificationModal(newTeacher);
            }`;

    const newTeacherAuth = `await saveAndFinalizeTeacherRegistration(newTeacher);`;

    content = content.replace(oldTeacherAuth, newTeacherAuth);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath + ' for instant seamless teacher registration.');
}

fixTeacherLoginFlow('pages/teacher/teacher-login.html');

// 3. Update pages/teacher/teacher.html
function fixTeacherPortalFlow(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldTeacherPortal = `openVerificationModal(newTeacher);`;
    const newTeacherPortal = `saveAndFinalizeTeacherRegistration(newTeacher);`;

    content = content.replace(oldTeacherPortal, newTeacherPortal);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath + ' for instant seamless teacher portal registration.');
}

fixTeacherPortalFlow('pages/teacher/teacher.html');
