const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');
let content = fs.readFileSync(filePath, 'utf8');

const marker = `            <div class="brand-logo">
                <div id="orgLogoBox" style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.1);">
                    <i class="fa-solid fa-chalkboard-user logo-icon" style="font-size: 20px;"></i>
                </div>
                <div>
                    <div class="brand-title" id="orgTitle">TEACHER PORTAL</div>
                    <div class="brand-subtitle">Classroom & Educator Network</div>
                </div>
            </div>`;

const middleSection = `

            <div class="hero-text">
                <h1 id="heroHeadline">Log in to access your <span>dashboard & active classrooms</span></h1>
            </div>

            <div class="hero-buttons">
                <button class="btn-outline" type="button">Teacher Guide</button>
                <a href="#" class="link-subtle">System Requirements</a>
            </div>
        </div>

        <!-- Right Form Section -->
        <div class="form-section">
            <div class="card">
                <!-- Dual-mode Auth Tabs -->
                <div class="auth-tabs">
                    <button class="tab-btn active" id="tabSignIn" onclick="switchTeacherTab('signin')">
                        <i class="fa-solid fa-right-to-bracket"></i> Sign In
                    </button>
                    <button class="tab-btn" id="tabSignUp" onclick="switchTeacherTab('signup')">
                        <i class="fa-solid fa-user-plus"></i> Register
                    </button>
                </div>

                <h2 id="formTitle">Teacher Login</h2>

                <div id="msg" class="msg"></div>

                <form id="teacherAuthForm" onsubmit="event.preventDefault(); handleTeacherAuth();">
                    <div class="form-group hidden" id="fullNameGroup">
                        <label for="fullName">Full Name</label>
                        <div class="input-wrapper">
                            <input type="text" id="fullName" placeholder="Sarah Jenkins">
                            <i class="fa-regular fa-user field-icon"></i>
                        </div>
                    </div>

                    <div class="form-group hidden" id="teacherPhotoGroup">
                        <label>Educator Profile Photo (Optional)</label>
                        <div style="display: flex; align-items: center; gap: 14px; margin-top: 6px; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px;">
                            <div id="teacherPhotoPreview" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(114, 239, 221, 0.15); border: 2px solid #72efdd; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                                <i class="fa-solid fa-user-tie" style="font-size: 20px; color: #72efdd;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; gap: 8px;">
                                    <button type="button" class="btn-outline" style="padding: 6px 12px; font-size: 11px; border-radius: 8px;" onclick="document.getElementById('teacherPhotoFile').click()">
                                        <i class="fa-solid fa-camera"></i> Choose Photo
                                    </button>
                                    <button type="button" id="removeTeacherPhotoBtn" class="btn-outline" style="padding: 6px 10px; font-size: 11px; border-radius: 8px; display: none; color: #ff9b9b; border-color: rgba(235,87,87,0.4);" onclick="removeTeacherPhoto()">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <input type="file" id="teacherPhotoFile" accept="image/*" style="display: none;" onchange="handleTeacherPhotoUpload(event)">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Institutional Email</label>
                        <div class="input-wrapper">
                            <input type="email" id="email" placeholder="sarah.jenkins@flawless.org" required>
                            <i class="fa-regular fa-envelope field-icon"></i>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <input type="password" id="password" placeholder="••••••••" required>
                            <i class="fa-regular fa-eye-slash field-icon" id="passToggle" onclick="togglePass('password', 'passToggle')"></i>
                        </div>
                    </div>

                    <div class="form-group hidden" id="confirmPassGroup">
                        <label for="confirmPassword">Confirm Password</label>
                        <div class="input-wrapper">
                            <input type="password" id="confirmPassword" placeholder="••••••••">
                            <i class="fa-regular fa-eye-slash field-icon" id="confirmPassToggle" onclick="togglePass('confirmPassword', 'confirmPassToggle')"></i>
                        </div>
                    </div>

                    <div class="remember-group" id="rememberContainer" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #a2e8dd;">
                            <input type="checkbox" id="rememberMe" style="accent-color: #72efdd;"> Remember me
                        </label>
                        <a href="#" style="color: #72efdd; text-decoration: none; font-weight: 500;" onclick="showMessage('Please contact your school administrator to reset credentials.')">Forgot Password?</a>
                    </div>

                    <button type="submit" class="btn-submit" id="submitBtn">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i>
                        <span id="submitLabel">Sign In</span>
                    </button>
                </form>

                <div class="card-footer" style="text-align: center; margin-top: 24px; font-size: 13px; color: #a0aec0;">
                    <span id="footerTogglePrompt">Don't have an account?</span>
                    <a href="javascript:void(0)" id="footerToggleLink" style="color: #72efdd; font-weight: 600; text-decoration: none; margin-left: 6px;" onclick="switchTeacherTab(currentMode === 'signin' ? 'signup' : 'signin')">Register Here</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Verification Modal -->
    <div class="modal-overlay" id="verificationModal">
        <div class="modal-container">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(114, 239, 221, 0.15); border: 2px solid #72efdd; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #72efdd; font-size: 24px;">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px;">Verify Institutional Email</h3>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px;">
                We sent a secure 6-digit authentication code to <strong id="verifyEmailText" style="color: #72efdd;"></strong>. Enter the code below to complete your educator registration.
            </p>

            <div id="verifyFeedback" class="verify-feedback" style="display: none;"></div>

            <!-- Instant Code Card -->
            <div class="instant-code-card" id="instantCodeCard">
                <div class="instant-code-header">
                    <i class="fa-solid fa-envelope-open-text"></i>
                    <span>Didn't receive code? Instant authentication code:</span>
                </div>
                <div class="instant-code-display">
                    <span class="instant-code-value" id="instantCodeValue">------</span>
                    <button type="button" class="btn-copy-code" id="btnAutoFillCode" onclick="autoFillOtpCode()">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-fill Code
                    </button>
                </div>
            </div>

            <!-- OTP Expiration Countdown Timer -->
            <div class="otp-timer-badge" id="otpTimerBadge">
                <i class="fa-regular fa-clock"></i> Code expires in: <span id="otpTimerText" style="font-weight: 700; font-family: monospace; font-size: 13.5px; margin-left: 4px;">05:00</span>
            </div>

            <div class="otp-box">
                <div style="font-size: 12px; font-weight: 600; color: #a2e8dd; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="fa-solid fa-key"></i> Enter 6-Digit Code
                </div>
                <input type="text" id="otpInput" class="otp-input" placeholder="------" maxlength="6" autocomplete="one-time-code">
                <button type="button" class="btn-submit" id="btnVerifyOtp" onclick="submitOtpVerification()" style="margin-top: 4px;">
                    <i class="fa-solid fa-check"></i> Verify & Submit Registration
                </button>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-top: 14px;">
                <button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()" style="font-size: 11.5px; padding: 6px 14px;">
                    <i class="fa-solid fa-rotate-right"></i> Resend Code
                </button>
                <button type="button" class="btn-outline" onclick="closeVerificationModal()" style="font-size: 11.5px; padding: 6px 14px;">
                    Cancel
                </button>
            </div>
        </div>
    </div>

<script src="../../assets/js/auth-session.js"></script>
<script>
const TEACHERS_KEY = "teachers";
let currentMode = "signin";
let pendingTeacherData = null;
let currentOtpCode = '';
let otpCountdownInterval = null;
let otpTimeRemaining = 300; // 5 minutes
let isOtpExpired = false;

function startOtpCountdown(duration = 300) {
    if (otpCountdownInterval) clearInterval(otpCountdownInterval);
    otpTimeRemaining = duration;
    isOtpExpired = false;
    const badge = document.getElementById("otpTimerBadge");
    const timerText = document.getElementById("otpTimerText");
    const btnVerify = document.getElementById("btnVerifyOtp");
    if (badge) badge.classList.remove("expired");
    if (btnVerify) btnVerify.disabled = false;

    function updateDisplay() {
        const mins = Math.floor(otpTimeRemaining / 60);
        const secs = otpTimeRemaining % 60;
        if (timerText) {
            timerText.textContent = \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
        }
        if (otpTimeRemaining <= 0) {
            clearInterval(otpCountdownInterval);
            isOtpExpired = true;
            if (badge) badge.classList.add("expired");
            if (timerText) timerText.textContent = "00:00 (Expired)";
            if (btnVerify) btnVerify.disabled = true;
            showVerifyFeedback("⚠️ Verification code has expired. Please click 'Resend Code' to generate a fresh one.", true);
        }
        otpTimeRemaining--;
    }

    updateDisplay();
    otpCountdownInterval = setInterval(updateDisplay, 1000);
}

function autoFillOtpCode() {
    if (isOtpExpired) {
        showVerifyFeedback("⚠️ This code has expired! Please click 'Resend Code' to get a fresh code.", true);
        return;
    }
    const input = document.getElementById("otpInput");
    if (input && currentOtpCode) {
        input.value = currentOtpCode;
        input.focus();
        showVerifyFeedback("Code auto-filled! Click 'Verify & Enter Classroom' to proceed.", false);
    }
}

function openVerificationModal(teacherData) {
    pendingTeacherData = teacherData;
    currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("verifyEmailText").textContent = teacherData.email;
    document.getElementById("otpInput").value = '';
    const instantEl = document.getElementById("instantCodeValue");
    if (instantEl) instantEl.textContent = currentOtpCode;
    showVerifyFeedback(\`Verification code generated! Instant access code: \${currentOtpCode}\`, false);
    startOtpCountdown(300);
    document.getElementById("verificationModal").classList.add("active");
    setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
}

function closeVerificationModal() {
    if (otpCountdownInterval) clearInterval(otpCountdownInterval);
    document.getElementById("verificationModal").classList.remove("active");
}
`;

const tailMarker = `function showVerifyFeedback(text, isError = true) {`;

const head = content.substring(0, content.indexOf(marker) + marker.length);
const tail = content.substring(content.indexOf(tailMarker));

// Also remove quickDemoTeacher from tail if present
const cleanTail = tail.replace(/function quickDemoTeacher\(\) \{[\s\S]*?\}\n/g, '');

const updated = head + middleSection + '\n' + cleanTail;
fs.writeFileSync(filePath, updated, 'utf8');
console.log('teacher-login.html successfully repaired and cleaned!');
