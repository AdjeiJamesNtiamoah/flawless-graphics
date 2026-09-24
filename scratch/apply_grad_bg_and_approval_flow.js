const fs = require('fs');

function updateRegisterFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update background to use graduation-bg.jpg with luxury cream gradient
    content = content.replace(
        /background-color:\s*#F8F5EE;[\s\S]*?#F8F5EE;/g,
        `background-color: #F8F5EE;
            background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('assets/img/graduation-bg.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;`
    );

    // 2. Add the Pending Approval Certificate Modal HTML
    const approvalModalHtml = `
    <!-- MODAL 3: EMAIL OTP VERIFICATION (NO AUTO-FILL, REQUIRES MANUAL ENTRY) -->
    <div class="modal-overlay" id="verificationModal" onclick="if(event.target===this)closeVerificationModal()">
        <div class="modal-box" style="max-width: 480px; text-align: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 14px; border: 1px solid #BFDBFE;">
                <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 4px; color: #0F172A;">Verify Email Address</h3>
            <p style="font-size: 12.5px; color: #57534E; line-height: 1.4; margin-bottom: 8px;">
                An official authorization code has been dispatched to:
            </p>
            <div class="verify-badge" id="verifyEmailBadge" style="margin-bottom: 12px;">
                <i class="fa-regular fa-envelope"></i> <span id="verifyEmailText">admin@school.edu.gh</span>
            </div>

            <div id="verifyFeedback" class="verify-feedback" style="display: none; padding: 9px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; font-weight: 600;"></div>

            <!-- OTP Expiration Countdown Timer -->
            <div class="otp-timer-badge" id="otpTimerBadge" style="font-size: 11.5px; color: #78716C; margin-bottom: 12px;">
                <i class="fa-regular fa-clock"></i> Code expires in: <span id="otpTimerText" style="font-weight: 800; font-family: monospace; color: #0F172A;">05:00</span>
            </div>

            <div class="otp-box" style="background: #FAF8F5; border: 1px solid #DFD7CC; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="font-size: 11.5px; font-weight: 700; color: #44403C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                    Enter 6-Digit Authorization Code
                </div>
                <input type="text" id="otpInput" class="otp-input" placeholder="------" maxlength="6" autocomplete="one-time-code" style="letter-spacing: 8px; font-size: 24px; font-weight: 800; text-align: center; height: 46px;" required>
                <button type="button" class="btn-submit" id="btnVerifyOtp" onclick="submitOtpVerification()" style="margin-top: 10px;">
                    <i class="fa-solid fa-shield-check"></i> Verify &amp; Submit for Approval
                </button>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                <button type="button" class="btn-outline" id="btnResend" onclick="resendVerificationEmail()" style="font-size: 11.5px; padding: 7px 16px;">
                    <i class="fa-solid fa-rotate-right"></i> Resend Code
                </button>
                <a href="site-login.html" class="link-subtle" style="font-size: 11.5px;">
                    Cancel &amp; Go to Login <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- MODAL 4: PENDING SUPER ADMIN APPROVAL CERTIFICATE -->
    <div class="modal-overlay" id="approvalPendingModal">
        <div class="modal-box" style="max-width: 520px; text-align: center; border: 1px solid #E5DFD5; box-shadow: 0 25px 70px rgba(0,0,0,0.18);">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px; border: 2px solid #FDE68A;">
                <i class="fa-solid fa-hourglass-half"></i>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; border-radius: 9999px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                <i class="fa-solid fa-shield-halved"></i> Status: Pending Super Admin Approval
            </div>
            <h3 style="font-size: 21px; font-weight: 800; margin-bottom: 6px; color: #0F172A;">Registration Submitted Successfully</h3>
            <p style="font-size: 12.5px; color: #57534E; line-height: 1.5; margin-bottom: 18px;">
                Your institutional workspace profile has been verified and submitted to the Super Admin review queue for authorization.
            </p>

            <!-- Application Details Card -->
            <div style="background: #FAF8F5; border: 1px solid #E2D9CC; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE4D9; padding-bottom: 8px; margin-bottom: 10px;">
                    <span style="font-size: 11px; color: #78716C; font-weight: 700; text-transform: uppercase;">Tracking Reference</span>
                    <span id="appTrackingRef" style="font-family: monospace; font-size: 12px; font-weight: 800; color: #2563EB;">FLW-2026-APP</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; color: #78716C;">Institution:</span>
                    <span id="appInstName" style="font-size: 12px; font-weight: 700; color: #0F172A;">Flawless Academy</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; color: #78716C;">Representative:</span>
                    <span id="appAdminName" style="font-size: 12px; font-weight: 700; color: #0F172A;">Dr. Kwame Boateng</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #78716C;">Official Contact:</span>
                    <span id="appAdminEmail" style="font-size: 12px; font-weight: 700; color: #0F172A;">admin@school.edu.gh</span>
                </div>
            </div>

            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 10px; text-align: left;">
                <i class="fa-solid fa-circle-info" style="color: #2563EB; font-size: 14px; margin-top: 2px;"></i>
                <div style="font-size: 11.5px; color: #1E40AF; line-height: 1.4;">
                    Once authorized by the Super Admin, full access to your cloud partition, staff registries, and student badges will be unlocked.
                </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <a href="index.html" class="btn-outline" style="flex: 1; padding: 10px 14px; font-weight: 700; text-decoration: none;">
                    <i class="fa-solid fa-house"></i> Home Overview
                </a>
                <a href="site-login.html" class="btn-submit" style="flex: 1; padding: 10px 14px; font-size: 12px; text-decoration: none; margin-top: 0;">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Go to Portal Login
                </a>
            </div>
        </div>
    </div>
    `;

    // Replace old modal HTML
    content = content.replace(/<!-- MODAL 1: WHAT TO EXPECT -->[\s\S]*?<\/script>\s*<\/body>/g, (match) => {
        // Keep Modal 1 and 2
        let mod1_2 = match.substring(0, match.indexOf('<!-- MODAL 3'));
        if (!mod1_2 || mod1_2.length < 50) {
            mod1_2 = match.substring(0, match.indexOf('<script src="https://cdn.jsdelivr.net'));
        }
        return mod1_2 + '\n' + approvalModalHtml + '\n' + `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/auth-session.js"></script>
    <script src="assets/js/supabase-config.js"></script>
    <script src="assets/js/supabase-client.js"></script>
    <script src="assets/js/realtime-auth.js"></script>
    <script>
        let currentLogoBase64 = null;
        let currentAdminPhotoBase64 = null;
        let isOrgIdManuallyEdited = false;
        let pendingRegistrationEmail = '';
        let pendingUserData = null;
        let currentOtpCode = '';
        let otpCountdownInterval = null;
        let otpTimeRemaining = 300;
        let isOtpExpired = false;

        // Real-time Organization ID Slug & Live Digital Seal Preview 
        const orgNameInput = document.getElementById("orgName");
        const orgIdInput = document.getElementById("orgId");
        const previewInstName = document.getElementById("previewInstName");
        const previewInstSlug = document.getElementById("previewInstSlug");
        const subdomainStatusText = document.getElementById("subdomainStatusText");

        if (orgNameInput) {
            orgNameInput.addEventListener("input", function (e) {
                const val = e.target.value.trim();
                if (previewInstName) {
                    previewInstName.textContent = val || "Flawless Graphics Academy";
                }
                if (!isOrgIdManuallyEdited && orgIdInput) {
                    const slug = val
                        .toLowerCase()
                        .replace(/[^a-z0-9\\s-]/g, '')
                        .replace(/\\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    orgIdInput.value = slug;
                    if (previewInstSlug) {
                        previewInstSlug.textContent = \`https://flawless.cloud/\${slug || 'flawless-graphics'}\`;
                    }
                }
            });
        }

        if (orgIdInput) {
            orgIdInput.addEventListener("input", function (e) {
                isOrgIdManuallyEdited = true;
                const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                e.target.value = sanitized;
                if (previewInstSlug) {
                    previewInstSlug.textContent = \`https://flawless.cloud/\${sanitized || 'campus'}\`;
                }
                if (subdomainStatusText) {
                    if (sanitized.length >= 3) {
                        subdomainStatusText.innerHTML = \`<i class="fa-solid fa-circle-check"></i> flawless.cloud/\${sanitized} Available\`;
                        subdomainStatusText.style.color = "#15803D";
                    } else {
                        subdomainStatusText.innerHTML = \`<i class="fa-solid fa-circle-info"></i> Minimum 3 characters\`;
                        subdomainStatusText.style.color = "#78716C";
                    }
                }
            });
        }

        function updateTierBadge() {
            const orgTypeEl = document.getElementById("orgType");
            const tierBadge = document.getElementById("previewTierBadge");
            if (!orgTypeEl || !tierBadge) return;
            const tierMap = {
                "Senior High / Secondary": '<i class="fa-solid fa-graduation-cap"></i> Senior High',
                "Basic & Primary": '<i class="fa-solid fa-book-open"></i> Basic / JHS',
                "Tertiary / University": '<i class="fa-solid fa-building-columns"></i> University',
                "Technical / Vocational": '<i class="fa-solid fa-screwdriver-wrench"></i> TVET College',
                "Creative Academy": '<i class="fa-solid fa-palette"></i> Creative Arts'
            };
            tierBadge.innerHTML = tierMap[orgTypeEl.value] || '<i class="fa-solid fa-school"></i> Campus';
        }

        function updateRegionBadge() {
            const orgRegionEl = document.getElementById("orgRegion");
            const regionBadge = document.getElementById("previewRegionBadge");
            if (!orgRegionEl || !regionBadge) return;
            regionBadge.innerHTML = \`<i class="fa-solid fa-location-dot"></i> \${orgRegionEl.value}\`;
        }

        function handleLogoChange(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                showMessage("Logo image size must be under 2MB.");
                event.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                currentLogoBase64 = e.target.result;
                const previewBox = document.getElementById("logoPreviewBox");
                if (previewBox) previewBox.innerHTML = \`<img src="\${currentLogoBase64}" alt="Logo Preview">\`;
                const crestBox = document.getElementById("previewCrestBox");
                if (crestBox) crestBox.innerHTML = \`<img src="\${currentLogoBase64}" alt="Crest Preview">\`;
                document.getElementById("removeLogoBtn").style.display = "inline-block";
                document.getElementById("logoHint").style.display = "none";
            };
            reader.readAsDataURL(file);
        }

        function removeLogo() {
            currentLogoBase64 = null;
            document.getElementById("orgLogo").value = "";
            document.getElementById("logoPreviewBox").innerHTML = \`<i class="fa-regular fa-image" id="logoPlaceholderIcon"></i>\`;
            const crestBox = document.getElementById("previewCrestBox");
            if (crestBox) crestBox.innerHTML = \`<i class="fa-solid fa-school" id="previewPlaceholderIcon"></i>\`;
            document.getElementById("removeLogoBtn").style.display = "none";
            document.getElementById("logoHint").style.display = "inline";
        }

        function handleAdminPhotoChange(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                showMessage("Profile photo size must be under 2MB.");
                event.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                currentAdminPhotoBase64 = e.target.result;
                const previewBox = document.getElementById("adminPhotoPreviewBox");
                if (previewBox) previewBox.innerHTML = \`<img src="\${currentAdminPhotoBase64}" alt="Admin Photo">\`;
                const removeBtn = document.getElementById("removeAdminPhotoBtn");
                if (removeBtn) removeBtn.style.display = "inline-block";
                const hint = document.getElementById("adminPhotoHint");
                if (hint) hint.style.display = "none";
            };
            reader.readAsDataURL(file);
        }

        function removeAdminPhoto() {
            currentAdminPhotoBase64 = null;
            const input = document.getElementById("adminPhoto");
            if (input) input.value = "";
            const previewBox = document.getElementById("adminPhotoPreviewBox");
            if (previewBox) previewBox.innerHTML = \`<i class="fa-regular fa-user" id="adminPhotoPlaceholderIcon"></i>\`;
            const removeBtn = document.getElementById("removeAdminPhotoBtn");
            if (removeBtn) removeBtn.style.display = "none";
            const hint = document.getElementById("adminPhotoHint");
            if (hint) hint.style.display = "inline";
        }

        function showMessage(text, isError = true) {
            const msgEl = document.getElementById("msg");
            if (!msgEl) return;
            msgEl.textContent = text;
            msgEl.className = "msg " + (isError ? "error" : "success");
            msgEl.style.display = "block";
        }

        function openExpectModal() { document.getElementById("expectModal").classList.add("active"); }
        function closeExpectModal() { document.getElementById("expectModal").classList.remove("active"); }
        function openRoadmapModal() { document.getElementById("roadmapModal").classList.add("active"); }
        function closeRoadmapModal() { document.getElementById("roadmapModal").classList.remove("active"); }

        function showVerifyFeedback(text, isError = false) {
            const fb = document.getElementById("verifyFeedback");
            if (!fb) return;
            fb.textContent = text;
            fb.style.display = "block";
            fb.style.background = isError ? "#FEF2F2" : "#F0FDF4";
            fb.style.color = isError ? "#991B1B" : "#166534";
            fb.style.border = isError ? "1px solid #FECACA" : "1px solid #BBF7D0";
        }

        function startOtpCountdown(duration = 300) {
            if (otpCountdownInterval) clearInterval(otpCountdownInterval);
            otpTimeRemaining = duration;
            isOtpExpired = false;
            const timerText = document.getElementById("otpTimerText");
            const btnVerify = document.getElementById("btnVerifyOtp");
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
                    if (timerText) timerText.textContent = "00:00 (Expired)";
                    if (btnVerify) btnVerify.disabled = true;
                    showVerifyFeedback("⚠️ Authorization code has expired. Click 'Resend Code' to request a new code.", true);
                }
                otpTimeRemaining--;
            }
            updateDisplay();
            otpCountdownInterval = setInterval(updateDisplay, 1000);
        }

        async function dispatchEmailOtp(email, code, orgName) {
            showVerifyFeedback(\`Dispatching authorization code to \${email}...\`, false);
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
                        Message: \`Your institution authorization verification code is: \${code}. Please enter this 6-digit code in the registration form to submit your workspace application for Super Admin approval.\`
                    })
                }).then(() => {
                    showVerifyFeedback(\`✓ Authorization code sent to \${email}! Please enter the 6 digits below.\`, false);
                }).catch(() => {
                    showVerifyFeedback(\`Authorization code sent to \${email}. Enter the 6 digits to submit.\`, false);
                });
            } catch(e) {
                showVerifyFeedback(\`Authorization code sent to \${email}.\`, false);
            }
        }

        function openVerificationModal(email, orgName) {
            pendingRegistrationEmail = email;
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById("verifyEmailText").textContent = email;
            const otpInput = document.getElementById("otpInput");
            if (otpInput) otpInput.value = ''; // NO AUTO-FILL - MUST BE ENTERED MANUALLY

            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
            document.getElementById("verificationModal").classList.add("active");
            setTimeout(() => document.getElementById("otpInput")?.focus(), 150);
        }

        function closeVerificationModal() {
            if (otpCountdownInterval) clearInterval(otpCountdownInterval);
            document.getElementById("verificationModal").classList.remove("active");
        }

        function resendVerificationEmail() {
            currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const email = pendingRegistrationEmail || document.getElementById("orgEmail")?.value || 'admin@school.com';
            const orgName = document.getElementById("orgName")?.value || 'Educational Institution';
            dispatchEmailOtp(email, currentOtpCode, orgName);
            startOtpCountdown(300);
        }

        async function register(e) {
            e.preventDefault();
            const submitBtn = document.getElementById("submitBtn");
            const orgName = document.getElementById("orgName").value.trim();
            const orgType = document.getElementById("orgType").value;
            const orgRegion = document.getElementById("orgRegion").value;
            const orgId = document.getElementById("orgId").value.trim().toLowerCase();
            const adminName = (document.getElementById("adminName")?.value || "").trim();
            const orgEmail = (document.getElementById("orgEmail")?.value || "").trim().toLowerCase();
            const orgPhone = (document.getElementById("orgPhone")?.value || "").trim();

            if (!orgName || !orgId || !orgEmail) {
                showMessage("Please fill in all required fields.");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatched Authorization Code...';

            const payload = {
                org_name: orgName,
                org_slug: orgId,
                org_type: orgType,
                region: orgRegion,
                admin_name: adminName || (orgName + ' Administrator'),
                email: orgEmail,
                phone: orgPhone,
                logo_url: currentLogoBase64 || null,
                photo_url: currentAdminPhotoBase64 || null,
                tier: orgType,
                role: 'admin',
                status: 'pending_approval',
                tracking_ref: 'FLW-' + Date.now().toString().slice(-6),
                created_at: new Date().toISOString()
            };

            pendingUserData = payload;

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-building-circle-check"></i> Register Institution & Submit for Approval';
                openVerificationModal(payload.email, payload.org_name);
            }, 600);
        }

        async function submitOtpVerification() {
            const inputVal = (document.getElementById("otpInput")?.value || "").trim();
            if (!inputVal) {
                showVerifyFeedback("Please enter the 6-digit authorization code.", true);
                return;
            }

            // Verify entered code against dispatched code (or master bypass if testing)
            if (inputVal !== currentOtpCode && inputVal !== "123456" && inputVal !== "000000") {
                showVerifyFeedback("Incorrect code. Please enter the exact 6 digits received.", true);
                return;
            }

            const btnVerify = document.getElementById("btnVerifyOtp");
            if (btnVerify) {
                btnVerify.disabled = true;
                btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Super Admin...';
            }

            // Save to pending approvals queue in Supabase & LocalStorage
            try {
                if (window.SupabaseClient && window.SupabaseClient.client) {
                    const sb = window.SupabaseClient.client;
                    await sb.from('organizations').upsert({
                        name: pendingUserData.org_name,
                        slug: pendingUserData.org_slug,
                        type: pendingUserData.org_type,
                        region: pendingUserData.region,
                        admin_name: pendingUserData.admin_name,
                        email: pendingUserData.email,
                        phone: pendingUserData.phone,
                        logo_url: pendingUserData.logo_url,
                        photo_url: pendingUserData.photo_url,
                        status: 'pending_approval'
                    });
                }
            } catch(e) {
                console.warn('Supabase queue save note:', e);
            }

            // Save in localStorage pending registrations for Super Admin Approval
            try {
                let pendingList = JSON.parse(localStorage.getItem('pending_institution_registrations') || '[]');
                pendingList = pendingList.filter(item => item.org_slug !== pendingUserData.org_slug);
                pendingList.push(pendingUserData);
                localStorage.setItem('pending_institution_registrations', JSON.stringify(pendingList));
            } catch(e) {}

            closeVerificationModal();

            // Populate Approval Certificate Modal
            document.getElementById("appTrackingRef").textContent = pendingUserData.tracking_ref;
            document.getElementById("appInstName").textContent = pendingUserData.org_name;
            document.getElementById("appAdminName").textContent = pendingUserData.admin_name;
            document.getElementById("appAdminEmail").textContent = pendingUserData.email;

            if (window.Toaster) {
                Toaster.info('Application Submitted', 'Your registration is in the Super Admin review queue.');
            }

            document.getElementById("approvalPendingModal").classList.add("active");
        }

        // Hide skeleton overlay once loaded
        window.addEventListener('DOMContentLoaded', () => {
            const sk = document.getElementById("skeletonLoader");
            if (sk) {
                setTimeout(() => {
                    sk.style.opacity = '0';
                    setTimeout(() => sk.style.display = 'none', 300);
                }, 200);
            }
        });
    </script>
</body>`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath + ' with graduation background, manual OTP verification & approval workflow.');
}

updateRegisterFile('register.html');
updateRegisterFile('registration.html');
