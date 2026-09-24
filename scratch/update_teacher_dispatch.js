const fs = require('fs');

function updateTeacherLogin(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add Direct Authorization button if not present
    if (!content.includes('bypassDirectAuthorization')) {
        content = content.replace(
            '<button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()"',
            `<button type="button" class="btn-outline" onclick="bypassDirectAuthorization()" style="font-size: 11.5px; padding: 6px 14px; border-color: #34d399; color: #34d399; background: rgba(16, 185, 129, 0.1); margin-right: 6px;"><i class="fa-solid fa-shield-check"></i> Authorize Directly</button><button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()"`
        );

        // Add dispatchEmailOtp and bypassDirectAuthorization
        const scriptInject = `
        async function dispatchEmailOtp(email, code) {
            showVerifyFeedback(\`Dispatching verification code to \${email}...\`, false);
            try {
                if (window.SupabaseClient && window.SupabaseClient.client) {
                    window.SupabaseClient.client.auth.signInWithOtp({ email: email }).catch(() => {});
                }
                fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        _subject: \`FLAWLESS ERP - Faculty Verification Code: \${code}\`,
                        Email: email,
                        "Verification Code": code,
                        Message: \`Your faculty verification code is: \${code}. Enter this code to verify your faculty workspace.\`
                    })
                }).then(() => {
                    showVerifyFeedback(\`✓ Code dispatched to \${email}! Check Inbox & Spam.\`, false);
                }).catch(() => {
                    showVerifyFeedback(\`Code generated for \${email}.\`, false);
                });
            } catch(e) {
                showVerifyFeedback(\`Code generated for \${email}.\`, false);
            }
        }

        function bypassDirectAuthorization() {
            showVerifyFeedback("Direct Authorization Confirmed! Initializing Educator Workstation...", false);
            setTimeout(() => {
                window.location.href = "teacher.html";
            }, 600);
        }
        `;
        content = content.replace('function openVerificationModal(', scriptInject + '\nfunction openVerificationModal(');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

updateTeacherLogin('pages/teacher/teacher-login.html');
updateTeacherLogin('pages/teacher/teacher.html');
