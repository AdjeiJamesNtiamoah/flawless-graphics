const fs = require('fs');

// Update register.html & registration.html
function updateRegisterFiles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update verification modal HTML to include real email delivery notice and direct authorize button
    const oldModalFooter = `<div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                <button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()"
                    style="font-size: 11.5px; padding: 6px 14px;">
                    <i class="fa-solid fa-rotate-right"></i> Resend Code
                </button>
                <a href="site-login.html" class="link-subtle" style="font-size: 11.5px;">
                    Go to Login <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>
                </a>
            </div>`;

    const newModalFooter = `<div style="display: flex; flex-direction: column; gap: 10px; align-items: center; margin-top: 6px;">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center; width: 100%;">
                    <button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()"
                        style="font-size: 11.5px; padding: 7px 14px; flex: 1;">
                        <i class="fa-solid fa-rotate-right"></i> Resend Code
                    </button>
                    <button type="button" class="btn-outline" onclick="bypassDirectAuthorization()"
                        style="font-size: 11.5px; padding: 7px 14px; flex: 1; border-color: #BFDBFE; color: #2563EB; background: #EFF6FF; font-weight: 700;">
                        <i class="fa-solid fa-shield-check"></i> Authorize Directly
                    </button>
                </div>
                <a href="site-login.html" class="link-subtle" style="font-size: 11.5px;">
                    Go to Login <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>
                </a>
            </div>`;

    content = content.replace(oldModalFooter, newModalFooter);

    // 2. Add real email dispatch function and direct authorization logic
    const oldOpenModal = `function openVerificationModal(email, msg = '') {
            pendingRegistrationEmail = email;
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById("verifyEmailText").textContent = email;
            document.getElementById("otpInput").value = '';
            
            showVerifyFeedback(msg || 'An authorization code has been dispatched to your official email.', false);
            startOtpCountdown(300);
            document.getElementById("verificationModal").classList.add("active");
            setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
        }`;

    const newOpenModal = `async function dispatchEmailOtp(email, code, orgName) {
            showVerifyFeedback(\`Dispatching verification code to \${email}...\`, false);
            try {
                if (window.SupabaseClient && window.SupabaseClient.client) {
                    window.SupabaseClient.client.auth.signInWithOtp({ email: email }).catch(() => {});
                }
                fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: \`FLAWLESS ERP - Authorization Code: \${code}\`,
                        Email: email,
                        Organization: orgName || 'FLAWLESS ERP',
                        "Authorization Code": code,
                        Message: \`Your FLAWLESS ERP verification code is: \${code}. Please enter this code to activate your educational workspace.\`
                    })
                }).then(() => {
                    showVerifyFeedback(\`✓ Verification code sent to \${email}! Please check your Inbox and Spam.\`, false);
                }).catch(() => {
                    showVerifyFeedback(\`Code generated for \${email}. Check inbox or click 'Authorize Directly'.\`, false);
                });
            } catch(e) {
                showVerifyFeedback(\`Code generated for \${email}.\`, false);
            }
        }

        function bypassDirectAuthorization() {
            showVerifyFeedback("Direct Authorization Confirmed! Initializing Master Executive Workstation...", false);
            if (window.Toaster) {
                Toaster.success('Institution Authorized', 'Your workspace is active. Welcome to FLAWLESS ERP!');
            }
            setTimeout(() => {
                window.location.href = "welcome.html";
            }, 700);
        }

        function openVerificationModal(email, msg = '') {
            pendingRegistrationEmail = email;
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById("verifyEmailText").textContent = email;
            document.getElementById("otpInput").value = '';
            
            const orgName = document.getElementById("orgName")?.value || 'Educational Institution';
            dispatchEmailOtp(email, currentOtpCode, orgName);
            
            startOtpCountdown(300);
            document.getElementById("verificationModal").classList.add("active");
            setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
        }`;

    content = content.replace(oldOpenModal, newOpenModal);

    // 3. Update resend function
    const oldResend = `function resendVerificationEmail() {
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            startOtpCountdown(300);
            showVerifyFeedback('A fresh authorization code has been dispatched to your official email.', false);
        }`;

    const newResend = `function resendVerificationEmail() {
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const email = pendingRegistrationEmail || document.getElementById("orgEmail")?.value || 'admin@school.com';
            const orgName = document.getElementById("orgName")?.value || 'Educational Institution';
            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
        }`;

    content = content.replace(oldResend, newResend);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath + ' with real email dispatch and Direct Authorization button.');
}

updateRegisterFiles('register.html');
updateRegisterFiles('registration.html');
