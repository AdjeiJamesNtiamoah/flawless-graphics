/**
 * realtime-auth.js
 * Universal Real-Time Authentication (Time-Limited OTP) & Strong Password Security Engine
 * Flawless Graphics Enterprise Cloud System
 */

(function (window) {
    'use strict';

    /* ==========================================================================
       1. UNIVERSAL STRONG PASSWORD SECURITY ENGINE
       ========================================================================== */
    const StrongPassword = {
        /**
         * Minimum security criteria
         */
        CRITERIA: {
            minLength: 8,
            hasUpper: /[A-Z]/,
            hasLower: /[a-z]/,
            hasNumber: /[0-9]/,
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/
        },

        /**
         * Evaluate password and return detailed scoring and checklist
         */
        evaluate: function (password) {
            const pass = password || '';
            const checks = {
                length: pass.length >= this.CRITERIA.minLength,
                upper: this.CRITERIA.hasUpper.test(pass),
                lower: this.CRITERIA.hasLower.test(pass),
                number: this.CRITERIA.hasNumber.test(pass),
                special: this.CRITERIA.hasSpecial.test(pass)
            };

            let score = 0;
            if (checks.length) score++;
            if (checks.upper && checks.lower) score++;
            if (checks.number) score++;
            if (checks.special) score++;

            // Must satisfy all criteria to be truly valid
            const isValid = checks.length && checks.upper && checks.lower && checks.number && checks.special;

            let strengthText = 'Enter password';
            let color = 'rgba(255,255,255,0.4)';

            if (pass.length > 0) {
                if (score <= 1) {
                    strengthText = 'Weak (8+ chars, upper, lower, num, symbol needed)';
                    color = '#f87171';
                } else if (score === 2) {
                    strengthText = 'Fair (Add capital letters, numbers or symbols)';
                    color = '#fbbf24';
                } else if (score === 3) {
                    strengthText = 'Good (Almost secure, add missing requirements)';
                    color = '#38bdf8';
                } else if (score >= 4 && isValid) {
                    strengthText = 'Enterprise Grade 🔒 (Strong)';
                    color = '#34d399';
                } else {
                    strengthText = 'Good (Requirements almost met)';
                    color = '#38bdf8';
                }
            }

            return {
                isValid: isValid,
                score: score,
                strengthText: strengthText,
                color: color,
                checks: checks
            };
        },

        /**
         * Form submission validation helper
         */
        validate: function (password) {
            const evalResult = this.evaluate(password);
            if (evalResult.isValid) {
                return { valid: true, error: null };
            }

            const missing = [];
            if (!evalResult.checks.length) missing.push('At least 8 characters');
            if (!evalResult.checks.upper) missing.push('An uppercase letter (A-Z)');
            if (!evalResult.checks.lower) missing.push('A lowercase letter (a-z)');
            if (!evalResult.checks.number) missing.push('A number (0-9)');
            if (!evalResult.checks.special) missing.push('A special symbol (!@#$%^&*)');

            return {
                valid: false,
                error: 'Password does not meet enterprise security requirements: ' + missing.join(', ') + '.'
            };
        },

        /**
         * Attach real-time interactive meter to a password input element
         */
        attach: function (inputElOrId, containerElOrId) {
            const input = typeof inputElOrId === 'string' ? document.getElementById(inputElOrId) : inputElOrId;
            const container = typeof containerElOrId === 'string' ? document.getElementById(containerElOrId) : containerElOrId;

            if (!input || !container) return;

            // Render modern styling & meter bars
            container.innerHTML = `
                <div class="sp-meter-wrapper" style="margin-top: 8px; margin-bottom: 12px; font-family: inherit;">
                    <div class="sp-bars" style="display: flex; gap: 4px; margin-bottom: 6px;">
                        <div class="sp-bar" id="${input.id}_bar1" style="flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: background 0.25s ease;"></div>
                        <div class="sp-bar" id="${input.id}_bar2" style="flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: background 0.25s ease;"></div>
                        <div class="sp-bar" id="${input.id}_bar3" style="flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: background 0.25s ease;"></div>
                        <div class="sp-bar" id="${input.id}_bar4" style="flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: background 0.25s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 6px;">
                        <span style="color: rgba(255,255,255,0.5);">Security Level:</span>
                        <span id="${input.id}_text" style="color: rgba(255,255,255,0.4); font-weight: 600;">Enter password</span>
                    </div>
                    <div class="sp-checklist" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10.5px; color: rgba(255,255,255,0.45); padding: 6px 10px; background: rgba(15,23,42,0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                        <span id="${input.id}_chk_len"><i class="fa-solid fa-circle-xmark"></i> 8+ Characters</span>
                        <span id="${input.id}_chk_case"><i class="fa-solid fa-circle-xmark"></i> Upper & Lower</span>
                        <span id="${input.id}_chk_num"><i class="fa-solid fa-circle-xmark"></i> Number (0-9)</span>
                        <span id="${input.id}_chk_sym"><i class="fa-solid fa-circle-xmark"></i> Symbol (!@#$)</span>
                    </div>
                </div>
            `;

            const b1 = document.getElementById(`${input.id}_bar1`);
            const b2 = document.getElementById(`${input.id}_bar2`);
            const b3 = document.getElementById(`${input.id}_bar3`);
            const b4 = document.getElementById(`${input.id}_bar4`);
            const label = document.getElementById(`${input.id}_text`);
            const chkLen = document.getElementById(`${input.id}_chk_len`);
            const chkCase = document.getElementById(`${input.id}_chk_case`);
            const chkNum = document.getElementById(`${input.id}_chk_num`);
            const chkSym = document.getElementById(`${input.id}_chk_sym`);

            function updateUI() {
                const res = StrongPassword.evaluate(input.value);

                // Reset bars
                [b1, b2, b3, b4].forEach(b => {
                    if (b) b.style.background = 'rgba(255,255,255,0.12)';
                });

                if (label) {
                    label.textContent = res.strengthText;
                    label.style.color = res.color;
                }

                if (input.value) {
                    if (res.score >= 1 && b1) b1.style.background = res.color;
                    if (res.score >= 2 && b2) b2.style.background = res.color;
                    if (res.score >= 3 && b3) b3.style.background = res.color;
                    if (res.score >= 4 && b4) b4.style.background = res.color;
                }

                // Checklist state updates
                function setChk(el, ok, text) {
                    if (!el) return;
                    el.innerHTML = ok
                        ? `<i class="fa-solid fa-circle-check" style="color: #34d399;"></i> <span style="color: #6ee7b7;">${text}</span>`
                        : `<i class="fa-solid fa-circle-xmark" style="color: rgba(255,255,255,0.3);"></i> <span style="color: rgba(255,255,255,0.45);">${text}</span>`;
                }

                setChk(chkLen, res.checks.length, '8+ Characters');
                setChk(chkCase, res.checks.upper && res.checks.lower, 'Upper & Lower');
                setChk(chkNum, res.checks.number, 'Number (0-9)');
                setChk(chkSym, res.checks.special, 'Symbol (!@#$)');
            }

            input.addEventListener('input', updateUI);
            updateUI();
        }
    };


    /* ==========================================================================
       2. REAL-TIME EMAIL AUTHENTICATION (TIME-LIMITED OTP) ENGINE
       ========================================================================== */
    const RealtimeAuth = {
        DEFAULT_DURATION_SECONDS: 300, // 5 minutes standard timeout
        activeSessions: {},            // in-memory active OTP sessions keyed by email
        currentModalSession: null,
        timerInterval: null,

        /**
         * Request and generate a real-time OTP challenge for any email entered
         */
        requestOtp: function (email, purpose = 'authentication', durationSeconds = 300) {
            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail || !cleanEmail.includes('@')) {
                throw new Error('A valid email address is required for real-time authentication.');
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const now = Date.now();
            const expiresAt = now + (durationSeconds * 1000);

            const session = {
                email: cleanEmail,
                code: code,
                purpose: purpose,
                createdAt: now,
                durationSeconds: durationSeconds,
                expiresAt: expiresAt,
                isExpired: false
            };

            this.activeSessions[cleanEmail] = session;

            // Trigger cloud email delivery if Supabase Service is active
            if (window.SupabaseService && typeof window.SupabaseService.sendEmailOtp === 'function') {
                window.SupabaseService.sendEmailOtp(cleanEmail, code, purpose).then(res => {
                    if (res && res.supabaseError && window.Toaster) {
                        window.Toaster.warning('SMTP Dispatch Notice', `Supabase Email Notice: ${res.supabaseError}. Check your SMTP credentials in Supabase Settings.`);
                    }
                }).catch(err => {
                    console.warn('[RealtimeAuth] Supabase direct email dispatch notice:', err.message);
                });
            }

            // Real-time broadcast
            if (window.RealtimeBus && typeof window.RealtimeBus.emit === 'function') {
                window.RealtimeBus.emit('auth:otp_sent', {
                    email: cleanEmail,
                    purpose: purpose,
                    expiresAt: expiresAt
                });
            }

            return session;
        },

        /**
         * Verify an entered OTP against active sessions with strict time limit enforcement
         */
        verifyOtp: function (email, enteredCode) {
            const cleanEmail = (email || '').trim().toLowerCase();
            const session = this.activeSessions[cleanEmail];

            if (!session) {
                return {
                    success: false,
                    expired: false,
                    error: 'No active authentication session found for this email. Please request a new code.'
                };
            }

            // Check Time Limit
            if (Date.now() > session.expiresAt || session.isExpired) {
                session.isExpired = true;
                return {
                    success: false,
                    expired: true,
                    error: '⚠️ Verification code has expired. Security time limit exceeded. Please click "Resend Code".'
                };
            }

            const entered = (enteredCode || '').toString().trim();
            if (!entered || entered.length < 6 || entered.length > 10) {
                return {
                    success: false,
                    expired: false,
                    error: 'Please enter a valid authentication code.'
                };
            }

            // Check if entered code matches local active session code
            if (entered === session.code) {
                delete this.activeSessions[cleanEmail];
                return {
                    success: true,
                    email: cleanEmail,
                    purpose: session.purpose
                };
            }

            return {
                success: false,
                expired: false,
                error: 'Invalid authentication code. Please check your email and re-enter.'
            };
        },

        /**
         * Asynchronous OTP verification checking local session and Supabase Cloud Auth OTP
         */
        verifyOtpAsync: async function (email, enteredCode) {
            const cleanEmail = (email || '').trim().toLowerCase();
            const session = this.activeSessions[cleanEmail];

            // 1. Check local session
            const localRes = this.verifyOtp(cleanEmail, enteredCode);
            if (localRes.success || localRes.expired) return localRes;

            // 2. Check Supabase GoTrue Auth OTP endpoint if active
            const entered = (enteredCode || '').toString().trim();
            if (window.SupabaseService && typeof window.SupabaseService.verifyEmailOtp === 'function') {
                try {
                    const cloudRes = await window.SupabaseService.verifyEmailOtp(cleanEmail, entered);
                    if (cloudRes && cloudRes.success) {
                        delete this.activeSessions[cleanEmail];
                        return {
                            success: true,
                            email: cleanEmail,
                            purpose: session ? session.purpose : 'Identity Verification'
                        };
                    }
                    if (cloudRes && cloudRes.error) {
                        return {
                            success: false,
                            expired: (cloudRes.error || '').toLowerCase().includes('expired'),
                            error: cloudRes.error
                        };
                    }
                } catch (_) {}
            }

            return localRes;
        },

        /**
         * Open unified cyber-security styled Real-Time Authentication Modal
         */
        openAuthModal: function (options) {
            const {
                email,
                purpose = 'Identity Verification',
                onVerified,
                onCancel,
                durationSeconds = this.DEFAULT_DURATION_SECONDS
            } = options;

            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail) {
                if (window.Toaster) window.Toaster.error('Email Required', 'Please enter a valid email address.');
                return;
            }

            // Generate initial OTP challenge
            const session = this.requestOtp(cleanEmail, purpose, durationSeconds);
            this.currentModalSession = { ...session, onVerified, onCancel };

            this._ensureModalDOM();

            const modal = document.getElementById('flawlessRealtimeAuthModal');
            const emailText = document.getElementById('rtaEmailText');
            const otpInput = document.getElementById('rtaOtpInput');
            const feedback = document.getElementById('rtaFeedback');
            const verifyBtn = document.getElementById('rtaBtnVerify');
            const resendBtn = document.getElementById('rtaBtnResend');

            if (emailText) emailText.textContent = cleanEmail;
            if (otpInput) {
                otpInput.value = '';
                otpInput.disabled = false;
            }
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verify &amp; Proceed';
            }
            if (feedback) {
                feedback.textContent = `An authentication code has been dispatched to ${cleanEmail}. Please check your inbox.`;
                feedback.className = 'rta-feedback info';
                feedback.style.display = 'block';
            }

            // Start countdown
            this._startTimer(session.durationSeconds);

            modal.classList.add('active');
            setTimeout(() => {
                if (otpInput) otpInput.focus();
            }, 180);

            if (window.Toaster && typeof window.Toaster.info === 'function') {
                window.Toaster.info('Authentication Code Sent', `Security verification code sent to ${cleanEmail}. Check your inbox.`);
            }
        },

        /**
         * Close modal and clear timers
         */
        closeAuthModal: function () {
            if (this.timerInterval) clearInterval(this.timerInterval);
            const modal = document.getElementById('flawlessRealtimeAuthModal');
            if (modal) modal.classList.remove('active');

            if (this.currentModalSession && typeof this.currentModalSession.onCancel === 'function') {
                this.currentModalSession.onCancel();
            }
            this.currentModalSession = null;
        },

        /**
         * Resend fresh OTP and reset countdown timer
         */
        resendOtp: function () {
            const sess = this.currentModalSession;
            if (!sess) return;

            const resendBtn = document.getElementById('rtaBtnResend');
            if (resendBtn && resendBtn.disabled) return;

            const newSession = this.requestOtp(sess.email, sess.purpose, sess.durationSeconds || this.DEFAULT_DURATION_SECONDS);
            this.currentModalSession.code = newSession.code;
            this.currentModalSession.expiresAt = newSession.expiresAt;
            this.currentModalSession.isExpired = false;

            const otpInput = document.getElementById('rtaOtpInput');
            if (otpInput) {
                otpInput.value = '';
                otpInput.disabled = false;
                otpInput.focus();
            }

            const verifyBtn = document.getElementById('rtaBtnVerify');
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verify &amp; Proceed';
            }

            const feedback = document.getElementById('rtaFeedback');
            if (feedback) {
                feedback.textContent = `Fresh verification code dispatched to ${sess.email}!`;
                feedback.className = 'rta-feedback info';
                feedback.style.display = 'block';
            }

            // Restart 5-minute countdown
            this._startTimer(newSession.durationSeconds);

            // Rate-limit resend button for 30s
            if (resendBtn) {
                resendBtn.disabled = true;
                let cd = 30;
                resendBtn.innerHTML = `<i class="fa-solid fa-clock"></i> Resend (${cd}s)`;
                const cdTimer = setInterval(() => {
                    cd--;
                    if (cd > 0) {
                        resendBtn.innerHTML = `<i class="fa-solid fa-clock"></i> Resend (${cd}s)`;
                    } else {
                        clearInterval(cdTimer);
                        resendBtn.disabled = false;
                        resendBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Resend Code';
                    }
                }, 1000);
            }
        },

        /**
         * Submit verification from modal (supports asynchronous cloud OTP verification)
         */
        submitModalVerification: async function () {
            const sess = this.currentModalSession;
            if (!sess) return;

            const input = document.getElementById('rtaOtpInput');
            const entered = (input ? input.value : '').trim();
            const verifyBtn = document.getElementById('rtaBtnVerify');
            const feedback = document.getElementById('rtaFeedback');

            if (verifyBtn) {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...';
            }

            const result = await this.verifyOtpAsync(sess.email, entered);

            if (!result.success) {
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verify &amp; Proceed';
                }
                if (feedback) {
                    feedback.textContent = result.error;
                    feedback.className = 'rta-feedback error';
                    feedback.style.display = 'block';
                }
                if (window.Toaster) window.Toaster.error('Verification Failed', result.error);
                return;
            }

            // Verification Successful!
            if (this.timerInterval) clearInterval(this.timerInterval);
            if (verifyBtn) {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Identity Verified!';
            }
            if (feedback) {
                feedback.textContent = '✓ Real-time verification confirmed! Redirecting...';
                feedback.className = 'rta-feedback success';
                feedback.style.display = 'block';
            }

            setTimeout(() => {
                const callback = sess.onVerified;
                this.closeAuthModal();
                if (typeof callback === 'function') {
                    callback(sess.email);
                }
            }, 600);
        },

        /**
         * Internal Countdown Timer implementation
         */
        _startTimer: function (durationSeconds) {
            if (this.timerInterval) clearInterval(this.timerInterval);

            let remaining = durationSeconds;
            const timerText = document.getElementById('rtaTimerText');
            const timerBadge = document.getElementById('rtaTimerBadge');
            const verifyBtn = document.getElementById('rtaBtnVerify');
            const otpInput = document.getElementById('rtaOtpInput');
            const feedback = document.getElementById('rtaFeedback');

            function updateDisplay() {
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                const fmt = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

                if (timerText) timerText.textContent = fmt;

                if (remaining <= 60 && timerBadge) {
                    timerBadge.style.borderColor = '#ef4444';
                    timerBadge.style.color = '#f87171';
                } else if (timerBadge) {
                    timerBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                    timerBadge.style.color = '#38bdf8';
                }

                if (remaining <= 0) {
                    clearInterval(RealtimeAuth.timerInterval);
                    if (timerText) timerText.textContent = '00:00 (Expired)';
                    if (verifyBtn) {
                        verifyBtn.disabled = true;
                        verifyBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Code Expired';
                    }
                    if (otpInput) otpInput.disabled = true;
                    if (feedback) {
                        feedback.textContent = '⚠️ Security code has expired! Please click "Resend Code" to generate a fresh one.';
                        feedback.className = 'rta-feedback error';
                        feedback.style.display = 'block';
                    }
                    if (RealtimeAuth.currentModalSession) {
                        RealtimeAuth.currentModalSession.isExpired = true;
                    }
                }
                remaining--;
            }

            updateDisplay();
            this.timerInterval = setInterval(updateDisplay, 1000);
        },

        /**
         * Lazily inject modal DOM if not already present on page
         */
        _ensureModalDOM: function () {
            if (document.getElementById('flawlessRealtimeAuthModal')) return;

            const modalHtml = `
            <div class="rta-modal-overlay" id="flawlessRealtimeAuthModal" onclick="if(event.target===this)window.RealtimeAuth.closeAuthModal()">
                <div class="rta-modal-box">
                    <button class="rta-modal-close" type="button" onclick="window.RealtimeAuth.closeAuthModal()"><i class="fa-solid fa-xmark"></i></button>
                    
                    <div class="rta-modal-icon">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>

                    <h3 class="rta-modal-title">Real-Time Authentication</h3>
                    <p class="rta-modal-sub">
                        A real-time security verification challenge has been dispatched to:
                    </p>

                    <div class="rta-email-badge">
                        <i class="fa-regular fa-envelope"></i> <span id="rtaEmailText">user@example.com</span>
                    </div>

                    <!-- Live Countdown Timer Badge -->
                    <div class="rta-timer-wrap">
                        <div class="rta-timer-badge" id="rtaTimerBadge">
                            <i class="fa-solid fa-stopwatch fa-spin-pulse"></i> Time Limit: <span id="rtaTimerText">05:00</span>
                        </div>
                    </div>

                    <div class="rta-inbox-alert">
                        <i class="fa-solid fa-envelope-circle-check" style="color: #38bdf8; font-size: 15px;"></i>
                        <span>Please check your email inbox for your verification code.</span>
                    </div>

                    <div id="rtaFeedback" class="rta-feedback" style="display: none;"></div>

                    <div class="rta-input-wrap">
                        <input type="text" id="rtaOtpInput" class="rta-otp-input" placeholder="--------" maxlength="10" autocomplete="one-time-code"
                               onkeydown="if(event.key==='Enter'){event.preventDefault();window.RealtimeAuth.submitModalVerification();}">
                    </div>

                    <button type="button" class="rta-btn-submit" id="rtaBtnVerify" onclick="window.RealtimeAuth.submitModalVerification()">
                        <i class="fa-solid fa-shield-check"></i> Verify &amp; Proceed
                    </button>

                    <div class="rta-actions">
                        <button type="button" class="rta-btn-resend" id="rtaBtnResend" onclick="window.RealtimeAuth.resendOtp()">
                            <i class="fa-solid fa-rotate-right"></i> Resend Code
                        </button>
                        <button type="button" class="rta-btn-cancel" onclick="window.RealtimeAuth.closeAuthModal()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            `;

            const styleHtml = `
            <style id="flawlessRealtimeAuthStyles">
                .rta-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(4, 9, 20, 0.82);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    padding: 16px;
                }
                .rta-modal-overlay.active { display: flex; animation: rtaFadeIn 0.25s ease-out forwards; }
                @keyframes rtaFadeIn { from { opacity: 0; } to { opacity: 1; } }
                .rta-modal-box {
                    background: linear-gradient(180deg, #0f172a 0%, #0b1120 100%);
                    border: 1px solid rgba(56, 189, 248, 0.25);
                    border-radius: 20px;
                    padding: 30px 28px;
                    max-width: 440px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 25px 60px -10px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.12);
                    animation: rtaPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes rtaPopIn { from { transform: scale(0.94) translateY(10px); } to { transform: scale(1) translateY(0); } }
                .rta-modal-close {
                    position: absolute;
                    top: 16px; right: 16px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8;
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .rta-modal-close:hover { color: #fff; background: rgba(255,255,255,0.15); }
                .rta-modal-icon {
                    width: 54px; height: 54px;
                    border-radius: 50%;
                    background: rgba(56, 189, 248, 0.15);
                    border: 1px solid rgba(56, 189, 248, 0.35);
                    color: #38bdf8;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px;
                    margin: 0 auto 14px;
                }
                .rta-modal-title { font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 6px; letter-spacing: -0.3px; }
                .rta-modal-sub { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; }
                .rta-email-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(255,255,255,0.15);
                    padding: 6px 14px; border-radius: 8px;
                    font-size: 13px; color: #f1f5f9; font-weight: 600;
                    margin-bottom: 12px;
                }
                .rta-timer-wrap { margin-bottom: 12px; }
                .rta-timer-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 12px; font-weight: 700;
                    color: #38bdf8;
                    background: rgba(56, 189, 248, 0.08);
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    padding: 5px 12px; border-radius: 9999px;
                    letter-spacing: 0.5px;
                }
                .rta-inbox-alert {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    background: rgba(56, 189, 248, 0.06);
                    border: 1px solid rgba(56, 189, 248, 0.2);
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 12px;
                    color: #94a3b8;
                    margin-bottom: 14px;
                    line-height: 1.4;
                }
                .rta-input-wrap { margin-bottom: 14px; }
                .rta-otp-input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.9);
                    border: 1.5px solid rgba(255,255,255,0.2);
                    border-radius: 10px;
                    padding: 12px;
                    font-size: 24px;
                    font-weight: 700;
                    text-align: center;
                    letter-spacing: 6px;
                    color: #ffffff;
                    outline: none;
                    transition: all 0.2s;
                }
                .rta-otp-input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25); }
                .rta-feedback {
                    font-size: 12px; padding: 6px 10px; border-radius: 8px; margin-bottom: 12px;
                }
                .rta-feedback.info { background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); color: #38bdf8; }
                .rta-feedback.error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
                .rta-feedback.success { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
                .rta-btn-submit {
                    width: 100%; padding: 13px;
                    background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
                    color: #ffffff; font-weight: 700; font-size: 14.5px;
                    border: none; border-radius: 10px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);
                    transition: all 0.2s;
                }
                .rta-btn-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
                .rta-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .rta-actions {
                    display: flex; justify-content: center; gap: 10px; margin-top: 14px;
                }
                .rta-btn-resend, .rta-btn-cancel {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; font-size: 12px; font-weight: 600;
                    padding: 6px 14px; border-radius: 8px; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 6px;
                    transition: all 0.2s;
                }
                .rta-btn-resend:hover:not(:disabled), .rta-btn-cancel:hover {
                    color: #ffffff; background: rgba(255,255,255,0.12);
                }
                .rta-btn-resend:disabled { opacity: 0.5; cursor: not-allowed; }
                .rta-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .rta-actions {
                    display: flex; justify-content: center; gap: 10px; margin-top: 14px;
                }
                .rta-btn-resend, .rta-btn-cancel {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; font-size: 12px; font-weight: 600;
                    padding: 6px 14px; border-radius: 8px; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 6px;
                    transition: all 0.2s;
                }
                .rta-btn-resend:hover:not(:disabled), .rta-btn-cancel:hover {
                    color: #ffffff; background: rgba(255,255,255,0.12);
                }
                .rta-btn-resend:disabled { opacity: 0.5; cursor: not-allowed; }
            </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styleHtml);
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        /**
         * Helper to dynamically populate any <select> element with saved & approved organizations
         */
        populateApprovedOrgDropdown: async function (selectElement, selectedValue = null) {
            if (!selectElement) return;
            try {
                // Determine preferred active organization from parameters or storage
                const preferredOrg = (selectedValue || 
                    (window.AuthSession && typeof window.AuthSession.getOrg === 'function' ? window.AuthSession.getOrg() : null) || 
                    localStorage.getItem('active_org') || 
                    localStorage.getItem('activeOrg') || 
                    '').trim();

                let orgs = [];
                if (window.SupabaseService && typeof window.SupabaseService.getApprovedOrganizations === 'function') {
                    orgs = await window.SupabaseService.getApprovedOrganizations();
                }

                // Ensure clean array
                if (!Array.isArray(orgs)) orgs = [];

                // Root organization FLAWLESS GRAPHICS (fg-main) must ALWAYS exist as headquarters option
                const hasRoot = orgs.some(o => ((o.org_name || o.name || '').toUpperCase() === 'FLAWLESS GRAPHICS') || ((o.org_id || o.slug || '') === 'fg-main'));
                if (!hasRoot) {
                    orgs.unshift({ org_name: 'FLAWLESS GRAPHICS', name: 'FLAWLESS GRAPHICS', org_id: 'fg-main', status: 'Active' });
                }

                // Validate preferred organization against active cloud approved list
                const prefClean = preferredOrg.toLowerCase();
                const isRootPref = prefClean === 'flawless graphics' || prefClean === 'fg-main' || !prefClean;
                const matchedOrg = isRootPref ? null : orgs.find(o => {
                    const n = (o.org_name || o.name || '').toLowerCase();
                    const s = (o.org_id || o.slug || '').toLowerCase();
                    return n === prefClean || s === prefClean;
                });

                // If a non-root organization was cached but does NOT exist in cloud orgs, it was DELETED!
                if (preferredOrg && !isRootPref && !matchedOrg) {
                    localStorage.removeItem('active_org');
                    localStorage.removeItem('activeOrg');
                    localStorage.removeItem('active_org_logo');
                    localStorage.removeItem('org_logo');
                    if (window.AuthSession && typeof window.AuthSession.setOrgName === 'function') {
                        window.AuthSession.setOrgName('FLAWLESS GRAPHICS');
                    }
                }

                selectElement.innerHTML = '<option value="">-- Select Approved Institution Workspace --</option>';
                let matchedIndex = -1;

                orgs.forEach((org, idx) => {
                    const name = org.org_name || org.name || 'Educational Institution';
                    const slug = org.org_id || org.slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'workspace');
                    const opt = document.createElement('option');
                    opt.value = slug;
                    opt.dataset.name = name;
                    opt.dataset.slug = slug;
                    const logoUrl = org.logo_url || org.logo || org.logo_path || '';
                    if (logoUrl) {
                        opt.dataset.logo = logoUrl;
                    }
                    opt.textContent = `${name} (${slug})`;

                    if (matchedOrg) {
                        const nameClean = name.toLowerCase();
                        const slugClean = slug.toLowerCase();
                        if (slugClean === (matchedOrg.org_id || matchedOrg.slug || '').toLowerCase() || nameClean === (matchedOrg.org_name || matchedOrg.name || '').toLowerCase()) {
                            opt.selected = true;
                            matchedIndex = idx + 1;
                        }
                    } else if (isRootPref && (slug === 'fg-main' || name.toUpperCase() === 'FLAWLESS GRAPHICS')) {
                        opt.selected = true;
                        matchedIndex = idx + 1;
                    }

                    selectElement.appendChild(opt);
                });

                // Auto-select matched active organization or default to fg-main
                if (matchedIndex > 0) {
                    selectElement.selectedIndex = matchedIndex;
                } else if (orgs.length > 0) {
                    selectElement.selectedIndex = 1;
                }

                // Immediately apply branding for the initially selected option
                const initOpt = selectElement.selectedOptions && selectElement.selectedOptions[0];
                if (initOpt && initOpt.value) {
                    const initName = initOpt.dataset.name || initOpt.textContent.replace(/\s*\([^)]*\)$/, '').trim();
                    const initLogo = initOpt.dataset.logo || '';
                    this.applyOrgBranding(initName, initLogo);
                }

                // Listen to dropdown changes to sync active institution workspace
                if (!selectElement._hasOrgChangeListener) {
                    selectElement._hasOrgChangeListener = true;
                    selectElement.addEventListener('change', async () => {
                        const selOpt = selectElement.selectedOptions && selectElement.selectedOptions[0];
                        if (selOpt && selOpt.value) {
                            const newOrgName = selOpt.dataset.name || selOpt.textContent.replace(/\s*\([^)]*\)$/, '').trim();
                            let newOrgLogo = selOpt.dataset.logo || '';
                            
                            // If logo was not in option dataset, try resolving from cloud
                            if (!newOrgLogo && window.SupabaseService && typeof window.SupabaseService.getOrganizations === 'function') {
                                try {
                                    const orgs = await window.SupabaseService.getOrganizations();
                                    const cleanName = newOrgName.toLowerCase();
                                    const matched = (orgs || []).find(o => {
                                        const oName = (o.org_name || o.name || '').toLowerCase();
                                        const oSlug = (o.slug || o.id || o.org_id || '').toLowerCase();
                                        return oName === cleanName || oSlug === cleanName;
                                    });
                                    if (matched && (matched.logo_url || matched.logo_path || matched.logo)) {
                                        newOrgLogo = matched.logo_url || matched.logo_path || matched.logo;
                                        selOpt.dataset.logo = newOrgLogo;
                                    }
                                } catch(e) {}
                            }

                            if (newOrgName && !newOrgName.includes('-- Select Approved')) {
                                this.applyOrgBranding(newOrgName, newOrgLogo);
                            }
                        } else {
                            this.applyOrgBranding('FLAWLESS GRAPHICS', null);
                        }
                    });
                }
            } catch (err) {
                console.warn('[RealtimeAuth] Error populating org dropdown:', err);
                if (!selectElement.options || selectElement.options.length <= 1) {
                    selectElement.innerHTML = '<option value="fg-main" selected>FLAWLESS GRAPHICS (fg-main)</option>';
                }
            }
        },

        /**
         * Helper to immediately reflect selected organization branding (Name and Logo) across the UI
         */
        applyOrgBranding: function (orgName, logoUrl = null) {
            // Super Admin portal pages MUST NOT display any tenant organization branding
            if (typeof window !== 'undefined' && window.location) {
                const path = (window.location.pathname || '').toLowerCase();
                if (path.includes('admin-login') || path.includes('/admin/admin-login')) {
                    return;
                }
            }

            if (!orgName) return;
            const cleanOrg = orgName.replace(/\s*\([^)]*\)$/, '').trim();
            if (!cleanOrg || cleanOrg.includes('-- Select Approved')) return;

            localStorage.setItem('active_org', cleanOrg);
            localStorage.setItem('activeOrg', cleanOrg);
            if (logoUrl) {
                localStorage.setItem('active_org_logo', logoUrl);
                localStorage.setItem('org_logo', logoUrl);
            } else {
                localStorage.removeItem('active_org_logo');
                localStorage.removeItem('org_logo');
            }
            if (window.AuthSession && typeof window.AuthSession.setOrgName === 'function') {
                window.AuthSession.setOrgName(cleanOrg);
            }

            // 1. Update text elements: #orgTitle, #headerOrgTitle, .brand-title, .nav-brand-title, #sideOrgName
            document.querySelectorAll('#orgTitle, #headerOrgTitle, .brand-title, .header-org-title, .nav-brand-title, #sideOrgName, #sideOrg, #sideOrgTitle').forEach(el => {
                if (el && el.tagName !== 'SELECT' && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                    if (el.getAttribute('data-preserve-title') === 'true') return;
                    el.textContent = cleanOrg.toUpperCase();
                }
            });

            // 2. Update logo elements: switches to uploaded logo when present, or main project logo when absent/default
            const mainLogo = (window.STORAGE_ASSETS && window.STORAGE_ASSETS.logos && window.STORAGE_ASSETS.logos.primaryPng)
                || 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/logos/flawless-logo.png';
            let effectiveLogo = logoUrl || localStorage.getItem('active_org_logo') || localStorage.getItem('org_logo');
            if (!effectiveLogo || cleanOrg.toUpperCase() === 'FLAWLESS GRAPHICS') {
                effectiveLogo = mainLogo;
            }

            const logoTargets = [
                '#orgLogoBox', '#headerOrgLogo', '.brand-logo-badge', '.brand .logo',
                '.org-logo-preview', '.brand-logo', '.logo-circle', '.nav-brand-logo',
                '.brand-icon', '.brand-badge', '#brandingPreviewBox', '.sidebar .brand .logo'
            ];

            document.querySelectorAll(logoTargets.join(', ')).forEach(el => {
                if (el) {
                    if (el.getAttribute('data-preserve-logo') === 'true') return;
                    el.innerHTML = '<img src="' + effectiveLogo + '" alt="' + cleanOrg + '" class="org-brand-logo" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block; padding:2px;">';
                }
            });

            if (window.AuthSession && typeof window.AuthSession.applyGlobalBranding === 'function') {
                window.AuthSession.applyGlobalBranding();
            }
        },

        verifyUserOrgMembership: function (user, selectedOrgVal) {
            if (!user) return false;
            if (!selectedOrgVal) return true;
            const val = selectedOrgVal.toLowerCase().trim();
            const userOrg = (user.org || user.org_id || user.organization || '').toLowerCase().trim();
            const userOrgName = (user.org_name || '').toLowerCase().trim();
            return userOrg === val || userOrgName === val || val === 'all' || val === 'fg-main';
        },

        /**
         * Universal Real-Time Pending Approval Watchdog
         * Automatically detects when an account/organization is approved and signs the user in
         * with ZERO page refresh.
         */
        watchPendingApproval: function (options) {
            const email = (options.email || '').trim().toLowerCase();
            const role = (options.role || '').toLowerCase();
            const org = options.org || null;
            const targetUrl = options.targetUrl || null;
            const onApproved = typeof options.onApproved === 'function' ? options.onApproved : null;
            const onRejected = typeof options.onRejected === 'function' ? options.onRejected : null;
            const container = options.containerId ? document.getElementById(options.containerId) : null;

            if (!email) return null;

            // Stop any existing watcher for this email
            if (this._activeWatchers && this._activeWatchers[email]) {
                clearInterval(this._activeWatchers[email].interval);
                window.removeEventListener('fg:realtime-change', this._activeWatchers[email].listener);
            }
            if (!this._activeWatchers) this._activeWatchers = {};

            // Render live waiting indicator if container provided
            if (container) {
                container.innerHTML = `
                    <div class="pending-approval-card" style="margin-top: 14px; padding: 14px 18px; border-radius: 14px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; display: flex; align-items: center; justify-content: space-between; gap: 12px; animation: pulseGlow 2s infinite ease-in-out;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); border: 1.5px solid #f59e0b; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fa-solid fa-clock-rotate-left" style="font-size: 16px; color: #fbbf24;"></i>
                            </div>
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: #fff; letter-spacing: -0.2px;">Awaiting Authorization</div>
                                <div style="font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399;"></span>
                                    <span>Live connection active &bull; Auto-login when approved</span>
                                </div>
                            </div>
                        </div>
                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; background: rgba(15, 23, 42, 0.6); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); white-space: nowrap;">
                            <i class="fa-solid fa-bolt" style="color: #38bdf8;"></i> No refresh needed
                        </div>
                    </div>
                `;
            }

            let isResolved = false;

            const handleSuccess = (user) => {
                if (isResolved) return;
                isResolved = true;
                if (this._activeWatchers && this._activeWatchers[email]) {
                    clearInterval(this._activeWatchers[email].interval);
                    window.removeEventListener('fg:realtime-change', this._activeWatchers[email].listener);
                    delete this._activeWatchers[email];
                }

                if (container) {
                    container.innerHTML = `
                        <div style="margin-top: 14px; padding: 14px 18px; border-radius: 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; display: flex; align-items: center; gap: 12px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fa-solid fa-circle-check" style="font-size: 18px; color: #34d399;"></i>
                            </div>
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: #fff;">Authorization Granted!</div>
                                <div style="font-size: 11.5px; color: #6ee7b7;">Signing you into your workspace...</div>
                            </div>
                        </div>
                    `;
                }

                if (window.LucyBus && typeof window.LucyBus.emit === 'function') {
                    window.LucyBus.emit('USER_APPROVED', {
                        name: user.name || user.fullName || email,
                        email: email,
                        role: user.role || role
                    }, { role: user.role || role, sound: true, toast: true });
                }

                if (window.Toaster) {
                    window.Toaster.success('Access Granted!', `Your account has been authorized. Entering dashboard...`);
                }

                // Auto-set session
                if (window.AuthSession) {
                    window.AuthSession.setUser(user);
                } else {
                    localStorage.setItem('active_user', JSON.stringify(user));
                    localStorage.setItem('active_org_user', JSON.stringify(user));
                }

                if (onApproved) {
                    onApproved(user);
                } else if (targetUrl) {
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 800);
                }
            };

            const handleRejection = (user) => {
                if (isResolved) return;
                isResolved = true;
                if (this._activeWatchers && this._activeWatchers[email]) {
                    clearInterval(this._activeWatchers[email].interval);
                    window.removeEventListener('fg:realtime-change', this._activeWatchers[email].listener);
                    delete this._activeWatchers[email];
                }

                if (container) {
                    container.innerHTML = `
                        <div style="margin-top: 14px; padding: 14px 18px; border-radius: 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; display: flex; align-items: center; gap: 12px;">
                            <i class="fa-solid fa-circle-xmark" style="font-size: 20px; color: #ef4444;"></i>
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: #fff;">Registration Declined</div>
                                <div style="font-size: 11.5px; color: #fca5a5;">Please contact your institutional administrator.</div>
                            </div>
                        </div>
                    `;
                }

                if (window.Toaster) {
                    window.Toaster.error('Registration Declined', 'Your access request was declined.');
                }

                if (onRejected) onRejected(user);
            };

            // 1. Direct Realtime Event listener
            const realtimeListener = (e) => {
                const detail = e.detail || {};
                const dData = detail.data || {};
                const matchEmail = (dData.email || dData.id || '').toString().toLowerCase() === email;
                
                if (matchEmail || detail.table === 'users' || detail.action === 'USER_APPROVED' || detail.action === 'USER_REJECTED') {
                    // Check Supabase immediately
                    checkStatus();
                }
            };

            // 2. Direct Polling Check
            const checkStatus = async () => {
                if (isResolved || !window.SupabaseService) return;
                try {
                    const u = await window.SupabaseService.getUserByEmail(email);
                    if (u) {
                        const st = (u.status || '').toLowerCase().trim();
                        if (st === 'active' || st === 'approved') {
                            handleSuccess(u);
                        } else if (st === 'rejected' || st === 'declined') {
                            handleRejection(u);
                        }
                    }
                } catch (_) {}
            };

            window.addEventListener('fg:realtime-change', realtimeListener);
            const interval = setInterval(checkStatus, 2500);

            this._activeWatchers[email] = {
                interval: interval,
                listener: realtimeListener
            };

            // Initial immediate check
            checkStatus();

            return {
                stop: () => {
                    clearInterval(interval);
                    window.removeEventListener('fg:realtime-change', realtimeListener);
                    if (this._activeWatchers) delete this._activeWatchers[email];
                }
            };
        },

        /**
         * Initialize Global Cross-Tab & Realtime Sync for Deleted Organizations
         */
        initRealtimeSync: function() {
            if (this._realtimeSyncInitialized) return;
            this._realtimeSyncInitialized = true;

            const handleOrgDeleted = (deletedName) => {
                const cleanDel = (deletedName || '').toLowerCase().trim();
                const active = (localStorage.getItem('active_org') || localStorage.getItem('activeOrg') || '').toLowerCase().trim();
                if (!cleanDel || active === cleanDel || active.includes(cleanDel) || cleanDel.includes(active)) {
                    localStorage.removeItem('active_org');
                    localStorage.removeItem('activeOrg');
                    localStorage.removeItem('active_org_logo');
                    localStorage.removeItem('org_logo');
                    if (window.AuthSession && typeof window.AuthSession.setOrgName === 'function') {
                        window.AuthSession.setOrgName('FLAWLESS GRAPHICS');
                    }
                    if (typeof this.applyOrgBranding === 'function') {
                        this.applyOrgBranding('FLAWLESS GRAPHICS', null);
                    }
                }
                // Refresh all organization dropdowns on page
                document.querySelectorAll('select#orgSelect, select#org, select.org-select, select[name="organization"]').forEach(sel => {
                    RealtimeAuth.populateApprovedOrgDropdown(sel);
                });
            };

            // 1. In-tab custom event
            window.addEventListener('fg:realtime-change', (e) => {
                const detail = e.detail || {};
                if (detail.action === 'ORG_DELETED') {
                    const data = detail.data || {};
                    handleOrgDeleted(data.name || data.org_name || data.slug || data.id);
                }
            });

            // 2. Cross-tab storage ping
            window.addEventListener('storage', (e) => {
                if (e.key === 'fg_realtime_sync_ping' && e.newValue) {
                    try {
                        const ping = JSON.parse(e.newValue);
                        if (ping.action === 'ORG_DELETED') {
                            const data = ping.data || {};
                            handleOrgDeleted(data.name || data.org_name || data.slug || data.id);
                        }
                    } catch (_) {}
                }
            });
        }
    };

    // Attach to global window and AuthSession
    window.StrongPassword = StrongPassword;
    window.RealtimeAuth = RealtimeAuth;

    try {
        RealtimeAuth.initRealtimeSync();
    } catch (_) {}

    if (window.AuthSession) {
        window.AuthSession.StrongPassword = StrongPassword;
        window.AuthSession.RealtimeAuth = RealtimeAuth;
    }

})(typeof window !== 'undefined' ? window : globalThis);
