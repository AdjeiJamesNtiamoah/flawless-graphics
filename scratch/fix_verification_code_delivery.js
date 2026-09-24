const fs = require('fs');
const path = require('path');

console.log('--- Starting Universal Verification Code Delivery Fix ---');

// =============================================================================
// 1. UPDATE register.html & registration.html
// =============================================================================
function updateRegisterFile(relPath) {
    const filePath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        return;
    }
    let html = fs.readFileSync(filePath, 'utf8');

    // 1. In modal HTML: Add the Dispatched Authorization Code Transmission card
    const targetModalBadge = `<div class="verify-badge" id="verifyEmailBadge" style="margin-bottom: 12px;">
                <i class="fa-regular fa-envelope"></i> <span id="verifyEmailText">admin@school.edu.gh</span>
            </div>`;

    const dispatchedCodeCard = `<div class="verify-badge" id="verifyEmailBadge" style="margin-bottom: 12px;">
                <i class="fa-regular fa-envelope"></i> <span id="verifyEmailText">admin@school.edu.gh</span>
            </div>

            <!-- Official Dispatched Authorization Code Card -->
            <div class="dispatched-code-card" style="background: #F0FDF4; border: 1.5px dashed #16A34A; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fa-solid fa-satellite-dish"></i> Dispatched Authorization Code:
                </div>
                <div id="dispatchedCodeDisplay" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #15803D; padding: 4px 0;">
                    ------
                </div>
                <div style="font-size: 11.5px; color: #166534; line-height: 1.4;">
                    Please enter the 6-digit code above into the verification field below to submit for approval.
                </div>
            </div>`;

    if (html.includes(targetModalBadge) && !html.includes('id="dispatchedCodeDisplay"')) {
        html = html.replace(targetModalBadge, dispatchedCodeCard);
    }

    // 2. In openVerificationModal: update dispatchedCodeDisplay and show toaster
    const oldOpenModal = `function openVerificationModal(email, orgName) {
            pendingRegistrationEmail = email;
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById("verifyEmailText").textContent = email;
            const otpInput = document.getElementById("otpInput");
            if (otpInput) otpInput.value = ''; // NO AUTO-FILL - MUST BE ENTERED MANUALLY

            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
            document.getElementById("verificationModal").classList.add("active");
            setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
        }`;

    const newOpenModal = `function openVerificationModal(email, orgName) {
            pendingRegistrationEmail = email;
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById("verifyEmailText").textContent = email;
            
            const codeDisplay = document.getElementById("dispatchedCodeDisplay");
            if (codeDisplay) codeDisplay.textContent = currentOtpCode;

            const otpInput = document.getElementById("otpInput");
            if (otpInput) otpInput.value = ''; // NO AUTO-FILL - MUST BE ENTERED MANUALLY

            if (window.Toaster && typeof window.Toaster.info === 'function') {
                window.Toaster.info('Authorization Code: ' + currentOtpCode, 'Please enter this 6-digit code below to submit.');
            }

            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
            document.getElementById("verificationModal").classList.add("active");
            setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
        }`;

    if (html.includes(oldOpenModal)) {
        html = html.replace(oldOpenModal, newOpenModal);
    }

    // 3. In resendVerificationEmail: update dispatchedCodeDisplay and show toaster
    const oldResend = `function resendVerificationEmail() {
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const email = pendingRegistrationEmail || document.getElementById("orgEmail")?.value || 'admin@school.com';
            const orgName = document.getElementById("orgName")?.value || 'Educational Institution';
            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
        }`;

    const newResend = `function resendVerificationEmail() {
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const email = pendingRegistrationEmail || document.getElementById("orgEmail")?.value || 'admin@school.com';
            const orgName = document.getElementById("orgName")?.value || 'Educational Institution';
            
            const codeDisplay = document.getElementById("dispatchedCodeDisplay");
            if (codeDisplay) codeDisplay.textContent = currentOtpCode;

            const otpInput = document.getElementById("otpInput");
            if (otpInput) otpInput.value = '';

            if (window.Toaster && typeof window.Toaster.info === 'function') {
                window.Toaster.info('Fresh Code Dispatched: ' + currentOtpCode, 'Enter the new 6-digit code below.');
            }

            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
            showVerifyFeedback(\`Fresh authorization code generated: \${currentOtpCode}\`, false);
        }`;

    if (html.includes(oldResend)) {
        html = html.replace(oldResend, newResend);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Updated ${relPath} successfully.`);
}

updateRegisterFile('register.html');
updateRegisterFile('registration.html');


// =============================================================================
// 2. UPDATE pages/teacher/teacher-login.html
// =============================================================================
const teacherPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');
if (fs.existsSync(teacherPath)) {
    let tHtml = fs.readFileSync(teacherPath, 'utf8');

    // Replace the old instant-code-card (which had Auto-fill button) with clean Dispatched Card (NO auto-fill)
    const oldTeacherInstantCard = `<!-- Instant Code Card -->
        <div class="instant-code-card" id="instantCodeCard">
            <div class="instant-code-header">
                <i class="fa-solid fa-envelope-open-text"></i>
                <span>Instant Authentication Security Pass:</span>
            </div>
            <div class="instant-code-display">
                <span class="instant-code-value" id="instantCodeValue">--------</span>
                <button type="button" class="btn-copy-code" id="btnAutoFillCode" onclick="autoFillOtpCode()">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-fill Code
                </button>
            </div>
        </div>`;

    const newTeacherInstantCard = `<!-- Dispatched Educator Security Code Card -->
        <div class="secure-transmission-card" style="background: #F0FDF4; border: 1.5px dashed #059669; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <i class="fa-solid fa-satellite-dish"></i> Dispatched Educator Security Code:
            </div>
            <div class="instant-code-value" id="instantCodeValue" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #059669; padding: 4px 0;">
                ------
            </div>
            <div style="font-size: 11.5px; color: #065f46; line-height: 1.4;">
                Please manually type the 6-digit security code above into the verification field below.
            </div>
        </div>`;

    if (tHtml.includes(oldTeacherInstantCard)) {
        tHtml = tHtml.replace(oldTeacherInstantCard, newTeacherInstantCard);
    }

    // Ensure openVerificationModal sets input to empty and notifies
    tHtml = tHtml.replace(
        `showVerifyFeedback(\`Verification code generated! Instant security code: \${currentOtpCode}\`, false);`,
        `showVerifyFeedback(\`Security code dispatched: \${currentOtpCode}. Please enter it below.\`, false);
    if (window.Toaster && typeof window.Toaster.info === 'function') {
        window.Toaster.info('Security Code: ' + currentOtpCode, 'Please enter the 6-digit code to verify.');
    }`
    );

    fs.writeFileSync(teacherPath, tHtml, 'utf8');
    console.log('Updated pages/teacher/teacher-login.html successfully.');
}


// =============================================================================
// 3. UPDATE pages/hr/hr-login.html
// =============================================================================
const hrPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-login.html');
if (fs.existsSync(hrPath)) {
    let hrHtml = fs.readFileSync(hrPath, 'utf8');

    // Add Dispatched Code Card inside #hrOtpModal
    const targetHrModalBox = `<div class="verify-badge" id="hrVerifyEmailBadge">
      <i class="fa-regular fa-envelope"></i> <span id="hrVerifyEmailText">hr@company.com</span>
    </div>`;

    const newHrCard = `<div class="verify-badge" id="hrVerifyEmailBadge">
      <i class="fa-regular fa-envelope"></i> <span id="hrVerifyEmailText">hr@company.com</span>
    </div>

    <div style="background: #FFF7ED; border: 1.5px dashed #EA580C; border-radius: 12px; padding: 12px 16px; margin: 12px 0 14px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #C2410C; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <i class="fa-solid fa-satellite-dish"></i> Dispatched HR Authorization Code:
      </div>
      <div id="hrDispatchedCodeDisplay" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #EA580C; padding: 4px 0;">
        ------
      </div>
      <div style="font-size: 11.5px; color: #9A3412; line-height: 1.4;">
        Please enter the 6-digit code above into the field below to verify HR credentials.
      </div>
    </div>`;

    if (hrHtml.includes(targetHrModalBox) && !hrHtml.includes('id="hrDispatchedCodeDisplay"')) {
        hrHtml = hrHtml.replace(targetHrModalBox, newHrCard);
    }

    // In openHrOtpModal: update hrDispatchedCodeDisplay and notify
    hrHtml = hrHtml.replace(
        `document.getElementById('hrVerifyEmailText').textContent = userData.email;
    document.getElementById('hrOtpInput').value = '';`,
        `document.getElementById('hrVerifyEmailText').textContent = userData.email;
    document.getElementById('hrOtpInput').value = '';
    const hrCodeDisp = document.getElementById('hrDispatchedCodeDisplay');
    if (hrCodeDisp) hrCodeDisp.textContent = currentHrOtpCode;
    if (window.Toaster && typeof window.Toaster.info === 'function') {
      window.Toaster.info('HR Authorization Code: ' + currentHrOtpCode, 'Please enter the 6 digits below.');
    }`
    );

    // In resendHrOtpEmail: update hrDispatchedCodeDisplay
    hrHtml = hrHtml.replace(
        `currentHrOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const feedback = document.getElementById('hrVerifyFeedback');`,
        `currentHrOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hrCodeDisp = document.getElementById('hrDispatchedCodeDisplay');
    if (hrCodeDisp) hrCodeDisp.textContent = currentHrOtpCode;
    document.getElementById('hrOtpInput').value = '';
    const feedback = document.getElementById('hrVerifyFeedback');`
    );

    fs.writeFileSync(hrPath, hrHtml, 'utf8');
    console.log('Updated pages/hr/hr-login.html successfully.');
}


// =============================================================================
// 4. UPDATE pages/finance/finance-login.html
// =============================================================================
const finPath = path.join(__dirname, '..', 'pages', 'finance', 'finance-login.html');
if (fs.existsSync(finPath)) {
    let finHtml = fs.readFileSync(finPath, 'utf8');

    // Add Dispatched Code Card inside #financeOtpModal
    const targetFinModalBox = `<div class="verify-badge" id="financeVerifyEmailBadge">
      <i class="fa-regular fa-envelope"></i> <span id="financeVerifyEmailText">finance@company.com</span>
    </div>`;

    const newFinCard = `<div class="verify-badge" id="financeVerifyEmailBadge">
      <i class="fa-regular fa-envelope"></i> <span id="financeVerifyEmailText">finance@company.com</span>
    </div>

    <div style="background: #ECFDF5; border: 1.5px dashed #059669; border-radius: 12px; padding: 12px 16px; margin: 12px 0 14px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <i class="fa-solid fa-satellite-dish"></i> Dispatched Finance Treasury Code:
      </div>
      <div id="financeDispatchedCodeDisplay" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #059669; padding: 4px 0;">
        ------
      </div>
      <div style="font-size: 11.5px; color: #065F46; line-height: 1.4;">
        Please enter the 6-digit code above into the field below to confirm finance authorization.
      </div>
    </div>`;

    if (finHtml.includes(targetFinModalBox) && !finHtml.includes('id="financeDispatchedCodeDisplay"')) {
        finHtml = finHtml.replace(targetFinModalBox, newFinCard);
    }

    // In openFinanceOtpModal: update financeDispatchedCodeDisplay and notify
    finHtml = finHtml.replace(
        `document.getElementById('financeVerifyEmailText').textContent = userData.email;
    document.getElementById('financeOtpInput').value = '';`,
        `document.getElementById('financeVerifyEmailText').textContent = userData.email;
    document.getElementById('financeOtpInput').value = '';
    const finCodeDisp = document.getElementById('financeDispatchedCodeDisplay');
    if (finCodeDisp) finCodeDisp.textContent = currentFinanceOtpCode;
    if (window.Toaster && typeof window.Toaster.info === 'function') {
      window.Toaster.info('Finance Code: ' + currentFinanceOtpCode, 'Please enter the 6 digits below.');
    }`
    );

    // In resendFinanceOtpEmail: update financeDispatchedCodeDisplay
    finHtml = finHtml.replace(
        `currentFinanceOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const feedback = document.getElementById('financeVerifyFeedback');`,
        `currentFinanceOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const finCodeDisp = document.getElementById('financeDispatchedCodeDisplay');
    if (finCodeDisp) finCodeDisp.textContent = currentFinanceOtpCode;
    document.getElementById('financeOtpInput').value = '';
    const feedback = document.getElementById('financeVerifyFeedback');`
    );

    fs.writeFileSync(finPath, finHtml, 'utf8');
    console.log('Updated pages/finance/finance-login.html successfully.');
}


// =============================================================================
// 5. UPDATE pages/student/student-login.html
// =============================================================================
const stuPath = path.join(__dirname, '..', 'pages', 'student', 'student-login.html');
if (fs.existsSync(stuPath)) {
    let stuHtml = fs.readFileSync(stuPath, 'utf8');

    // Replace demoOtpDisplay with dynamic studentDispatchedCodeDisplay card
    const oldStuDisplay = `<div style="font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; background: #FAF8F5; padding: 8px 16px; border-radius: 10px; border: 1px solid #C7D2FE; display: inline-block; margin-bottom: 14px;" id="demoOtpDisplay">
            724819
        </div>`;

    const newStuDisplay = `<div style="background: #EEF2FF; border: 1.5px dashed #4F46E5; border-radius: 12px; padding: 12px 16px; margin: 12px 0 14px 0; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #4338CA; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <i class="fa-solid fa-satellite-dish"></i> Dispatched Student Security Code:
            </div>
            <div id="demoOtpDisplay" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #4F46E5; padding: 4px 0;">
                724819
            </div>
            <div style="font-size: 11.5px; color: #3730A3; line-height: 1.4;">
                Please enter the 6-digit code above into the field below to launch your workspace.
            </div>
        </div>`;

    if (stuHtml.includes(oldStuDisplay)) {
        stuHtml = stuHtml.replace(oldStuDisplay, newStuDisplay);
    }

    fs.writeFileSync(stuPath, stuHtml, 'utf8');
    console.log('Updated pages/student/student-login.html successfully.');
}


// =============================================================================
// 6. UPDATE assets/js/realtime-auth.js (Unified Portal Auth)
// =============================================================================
const rtaPath = path.join(__dirname, '..', 'assets', 'js', 'realtime-auth.js');
if (fs.existsSync(rtaPath)) {
    let rta = fs.readFileSync(rtaPath, 'utf8');

    // In modal DOM: replace inbox alert with Dispatched Authorization Code Card
    const oldRtaAlert = `<div class="rta-inbox-alert">
                        <i class="fa-solid fa-envelope-circle-check" style="color: #38bdf8; font-size: 15px;"></i>
                        <span>Please check your email inbox for your verification code.</span>
                    </div>`;

    const newRtaAlert = `<div style="background: rgba(56, 189, 248, 0.08); border: 1.5px dashed rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 16px; margin: 12px 0 14px 0; text-align: center;">
                        <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <i class="fa-solid fa-satellite-dish"></i> Dispatched Authorization Code:
                        </div>
                        <div id="rtaDispatchedCodeDisplay" style="font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; padding: 4px 0;">
                            ------
                        </div>
                        <div style="font-size: 11.5px; color: #94a3b8; line-height: 1.4;">
                            Please enter the 6-digit code above into the field below to confirm your session.
                        </div>
                    </div>`;

    if (rta.includes(oldRtaAlert)) {
        rta = rta.replace(oldRtaAlert, newRtaAlert);
    }

    // In openAuthModal: set rtaDispatchedCodeDisplay
    rta = rta.replace(
        `const emailText = document.getElementById('rtaEmailText');`,
        `const emailText = document.getElementById('rtaEmailText');
            const codeDisp = document.getElementById('rtaDispatchedCodeDisplay');
            if (codeDisp) codeDisp.textContent = session.code;`
    );

    // In resendOtp: update rtaDispatchedCodeDisplay
    rta = rta.replace(
        `this.currentModalSession.expiresAt = newSession.expiresAt;
            this.currentModalSession.isExpired = false;`,
        `this.currentModalSession.expiresAt = newSession.expiresAt;
            this.currentModalSession.isExpired = false;
            const codeDisp = document.getElementById('rtaDispatchedCodeDisplay');
            if (codeDisp) codeDisp.textContent = newSession.code;`
    );

    fs.writeFileSync(rtaPath, rta, 'utf8');
    console.log('Updated assets/js/realtime-auth.js successfully.');
}

console.log('--- Universal Verification Code Delivery Fix Complete ---');
