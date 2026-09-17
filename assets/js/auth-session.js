/**
 * auth-session.js
 * Dynamic Multi-Tenant Authentication & Session Bridge
 * Exclusively driven by Supabase Cloud Database.
 * Non-Supabase organizations and users are automatically purged on boot.
 */

(function(window) {
    'use strict';

    const USERS_KEY = 'organizations_users';
    const ACTIVE_ORG_USER_KEY = 'active_org_user';
    const ACTIVE_USER_KEY = 'active_user';
    const ACTIVE_ORG_KEY = 'active_org';
    const ACTIVE_HR_KEY = 'activeHR';
    const ACTIVE_TEACHER_KEY = 'active_teacher';
    const TEACHER_USER_KEY = 'teacher_active_user';
    const ACTIVE_STUDENT_KEY = 'active_student';
    const STUDENT_USER_KEY = 'student_active_user';

    // 1. Immediate Purge of all legacy local-only data arrays
    const LEGACY_STORAGE_KEYS = [
        'organizations', 'organizations_users', 'fg_registered_schools', 
        'registered_users', 'schools', 'tenants', 'users', 'teachers',
        'FLAWLESS GRAPHICS_teachers', 'students', 'payroll', 'classes',
        'attendance_records', 'student_fees', 'transactions', 'announcements', 'audit_logs'
    ];
    try {
        LEGACY_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    } catch(e) {}

    function safeParse(item, fallback = null) {
        if (!item) return fallback;
        try {
            return JSON.parse(item);
        } catch (e) {
            return fallback;
        }
    }

    const AuthSession = {
        /**
         * Retrieve current active user session (Context & Portal Aware)
         */
        getUser: function() {
            let user = null;
            const path = (typeof window !== 'undefined' && window.location ? (window.location.pathname || '') : '').toLowerCase();

            let prioritizedKeys = [];
            if (path.includes('/student/')) {
                prioritizedKeys = [ACTIVE_STUDENT_KEY, STUDENT_USER_KEY, 'student_user', ACTIVE_USER_KEY, ACTIVE_ORG_USER_KEY];
            } else if (path.includes('/teacher/')) {
                prioritizedKeys = [ACTIVE_TEACHER_KEY, TEACHER_USER_KEY, 'teacher_user', ACTIVE_USER_KEY, ACTIVE_ORG_USER_KEY];
            } else if (path.includes('/hr/')) {
                prioritizedKeys = [ACTIVE_HR_KEY, 'hr_active_user', ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY];
            } else if (path.includes('/finance/')) {
                prioritizedKeys = ['active_finance', 'finance_active_user', 'finance_user', ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY];
            } else if (path.includes('/admin/')) {
                prioritizedKeys = [ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY];
            } else {
                prioritizedKeys = [ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY, ACTIVE_HR_KEY, ACTIVE_TEACHER_KEY, TEACHER_USER_KEY, ACTIVE_STUDENT_KEY, STUDENT_USER_KEY];
            }

            for (const k of prioritizedKeys) {
                const parsed = safeParse(localStorage.getItem(k));
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.org || parsed.email || parsed.name || parsed.fullName || parsed.firstName)) {
                    user = parsed;
                    break;
                }
            }
            return user;
        },

        /**
         * Get active organization name
         */
        getOrg: function() {
            const user = this.getUser();
            return (user && user.org) 
                || localStorage.getItem(ACTIVE_ORG_KEY) 
                || localStorage.getItem('activeOrg') 
                || null;
        },

        /**
         * Get active organization logo (Base64 or URL)
         */
        getLogo: function() {
            const user = this.getUser();
            return (user && user.logo)
                || localStorage.getItem('active_org_logo')
                || localStorage.getItem('org_logo')
                || null;
        },

        /**
         * Update and persist organization logo
         */
        setOrgLogo: function(logoBase64) {
            if (logoBase64) {
                localStorage.setItem('active_org_logo', logoBase64);
                localStorage.setItem('org_logo', logoBase64);
            } else {
                localStorage.removeItem('active_org_logo');
                localStorage.removeItem('org_logo');
            }
            const user = this.getUser();
            if (user) {
                user.logo = logoBase64 || null;
                this.setUser(user);
            }
            this.applyGlobalBranding();
        },

        /**
         * Update and persist organization name
         */
        setOrgName: function(orgName) {
            if (!orgName) return;
            const clean = orgName.trim();
            localStorage.setItem(ACTIVE_ORG_KEY, clean);
            localStorage.setItem('activeOrg', clean);
            const user = this.getUser();
            if (user) {
                user.org = clean;
                this.setUser(user);
            }
            this.applyGlobalBranding();
        },

        /**
         * Get user profile photo
         */
        getUserPhoto: function() {
            const user = this.getUser();
            return (user && (user.photo || user.photoBase64 || user.photo_url || user.avatar || user.avatar_url || user.profilePhoto)) || null;
        },

        /**
         * Set user profile photo
         */
        setUserPhoto: function(photoBase64) {
            const user = this.getUser();
            if (user) {
                user.photo = photoBase64 || null;
                user.photoBase64 = photoBase64 || null;
                this.setUser(user);
            }
        },

        /**
         * Dynamically apply organization branding across current page
         * ONLY applies if verified from Supabase Cloud
         */
        applyGlobalBranding: async function() {
            // Super Admin portal pages MUST NOT display any tenant organization branding
            if (typeof window !== 'undefined' && window.location) {
                const path = (window.location.pathname || '').toLowerCase();
                if (path.includes('admin-login') || path.includes('/admin/admin-login')) {
                    return;
                }
            }

            let org = null;
            let logo = null;

            if (window.SupabaseService && typeof window.SupabaseService.getOrganizations === 'function') {
                try {
                    const cloudOrgs = await window.SupabaseService.getOrganizations();
                    const cachedOrg = localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg');

                    if (cachedOrg && Array.isArray(cloudOrgs) && cloudOrgs.length > 0) {
                        const cleanCached = cachedOrg.trim().toLowerCase();
                        const matched = cloudOrgs.find(o => {
                            const oName = (o.org_name || o.name || '').trim().toLowerCase();
                            const oSlug = (o.slug || o.org_id || '').trim().toLowerCase();
                            return oName === cleanCached || oSlug === cleanCached || cleanCached.includes(oName) || (oName && oName.includes(cleanCached));
                        });
                        if (matched) {
                            org = matched.org_name || matched.name;
                            logo = matched.logo_url || matched.logo_path || matched.logo || localStorage.getItem('active_org_logo');
                        }
                    }
                } catch (e) {
                    console.warn('[AuthSession] Branding query error:', e);
                }
            }

            if (!org) {
                const user = this.getUser();
                org = (user && user.org) || localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg');
                logo = (user && user.logo) || localStorage.getItem('active_org_logo') || localStorage.getItem('org_logo');
            }

            // If no verified organization from Supabase or storage, preserve default template text & icons
            if (!org) return;

            // 1. Text branding targets (strictly exclude SELECT, INPUT, and TEXTAREA elements)
            const textSelectors = [
                '#orgTitle', '#headerOrgTitle', '#orgNameDisplay', '#summaryOrgName', '#orgName',
                '.brand-title', '.org-title-text', '.header-org-title'
            ];
            textSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (!el) return;
                    if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
                    if (!el.getAttribute('data-preserve-title')) {
                        el.textContent = org.toUpperCase();
                    }
                });
            });

            // Specific header checks where brand names are displayed
            document.querySelectorAll('.brand, .brand-wrapper, .brand-logo-container').forEach(brandEl => {
                const title = brandEl.querySelector('h1, h2, .brand-title, #orgName, #headerOrgTitle, #orgTitle, span.org-name');
                if (title && title.tagName !== 'SELECT' && title.tagName !== 'INPUT' && title.tagName !== 'TEXTAREA' && !title.getAttribute('data-preserve-title')) {
                    title.textContent = org.toUpperCase();
                }
            });

            // 2. Logo branding targets
            if (logo) {
                const logoSelectors = [
                    '#orgLogoBox', '#headerOrgLogo', '.logo-circle', '.org-logo-preview',
                    '.brand .logo', '.header-left .logo', '.brand-logo-container .org-logo-preview',
                    '.brand-icon', '.brand-badge'
                ];

                logoSelectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => {
                        if (!el) return;
                        if (el.id === 'orgLogoBox') {
                            el.innerHTML = `<img src="${logo}" alt="${org}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block;">`;
                        } else {
                            let img = el.querySelector('img.org-brand-logo');
                            if (!img) {
                                el.innerHTML = `<img src="${logo}" alt="${org}" class="org-brand-logo" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block; padding:2px;">`;
                            } else {
                                img.src = logo;
                            }
                        }
                    });
                });
            }

            // Universal Top-Right Profile Widget & Online Status render
            try {
                this.renderTopRightProfileWidget();
            } catch(e) {
                console.warn('[AuthSession] renderTopRightProfileWidget error:', e);
            }
        },

        /**
         * Set and synchronize session across all system portals
         */
        setUser: function(user) {
            if (!user || typeof user !== 'object') return;

            const existingLogo = this.getLogo();
            const normalizedUser = {
                org: (user.org || user.organization || '').trim(),
                name: (user.name || user.fullName || 'User').trim(),
                email: (user.email || '').trim().toLowerCase(),
                role: (user.role || 'user').toLowerCase(),
                logo: user.logo || existingLogo || null,
                photo: user.photo || user.photoBase64 || null,
                createdAt: user.createdAt || Date.now()
            };

            // 1. Root & general user keys
            localStorage.setItem(ACTIVE_ORG_USER_KEY, JSON.stringify(normalizedUser));
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(normalizedUser));

            // 2. Organization namespace
            if (normalizedUser.org) {
                localStorage.setItem(ACTIVE_ORG_KEY, normalizedUser.org);
                localStorage.setItem('activeOrg', normalizedUser.org);
            }
            if (normalizedUser.logo) {
                localStorage.setItem('active_org_logo', normalizedUser.logo);
                localStorage.setItem('org_logo', normalizedUser.logo);
            }

            // 3. Department specific sessions
            if (normalizedUser.role === 'admin' || normalizedUser.role === 'hr') {
                localStorage.setItem(ACTIVE_HR_KEY, JSON.stringify({
                    name: normalizedUser.name,
                    email: normalizedUser.email,
                    role: normalizedUser.role === 'hr' ? 'HR Admin' : 'Super Admin',
                    org: normalizedUser.org,
                    photo: normalizedUser.photo || normalizedUser.logo || null
                }));
            }

            if (normalizedUser.role === 'teacher') {
                const teacherSession = {
                    name: normalizedUser.name,
                    email: normalizedUser.email,
                    org: normalizedUser.org,
                    role: 'teacher',
                    photoBase64: normalizedUser.photo || normalizedUser.logo || ''
                };
                localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(teacherSession));
                localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherSession));
            }

            if (normalizedUser.role === 'student') {
                const studentSession = {
                    name: normalizedUser.name,
                    email: normalizedUser.email,
                    org: normalizedUser.org,
                    role: 'student',
                    photo: normalizedUser.photo || ''
                };
                localStorage.setItem(ACTIVE_STUDENT_KEY, JSON.stringify(studentSession));
                localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(studentSession));
            }

            // Dynamically refresh branding
            this.applyGlobalBranding();

            return normalizedUser;
        },

        /**
         * Cryptographic Smart ID generator for registered users, staff and students
         */
        generateSmartId: function(user, role = 'user') {
            const orgPrefix = (user && user.org ? user.org.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'ORG') || 'ORG';
            const effectiveRole = (role || (user && user.role) || 'USR').toUpperCase().slice(0, 3);
            const year = new Date().getFullYear();
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            const hexSuffix = Math.random().toString(16).substring(2, 6).toUpperCase();
            const smartIdNum = `${orgPrefix}-${effectiveRole}-${year}-${randomNum}`;
            const rfidHex1 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidHex2 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidHex3 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidUid = `E0:04:01:${rfidHex1}:${rfidHex2}:${rfidHex3}`;
            const issueDate = new Date().toISOString().split('T')[0];
            const expYear = year + 3;
            const expiryDate = `${expYear}-08-31`;
            const securityHash = `SEC-${hexSuffix}-${Date.now().toString(36).toUpperCase()}`;
            const qrData = `https://verify.cloud/id/${smartIdNum}?u=${encodeURIComponent((user && (user.name || user.email)) || '')}&sec=${securityHash}`;

            return {
                smartIdNumber: smartIdNum,
                rfidUid: rfidUid,
                barcode: `*${smartIdNum}*`,
                qrData: qrData,
                issueDate: issueDate,
                expiryDate: expiryDate,
                securityHash: securityHash,
                status: 'Active',
                issuedBy: 'Directorate of Certification & Registry'
            };
        },

        /**
         * Check if authenticated; if not, redirect gracefully
         */
        requireAuth: function(redirectUrl = 'site-login.html') {
            let user = this.getUser();
            if (!user) {
                window.location.href = redirectUrl;
                return null;
            }
            return user;
        },

        /**
         * Clear all session tokens
         */
        logout: function(redirectUrl = 'site-login.html') {
            localStorage.removeItem(ACTIVE_ORG_USER_KEY);
            localStorage.removeItem(ACTIVE_USER_KEY);
            localStorage.removeItem(ACTIVE_ORG_KEY);
            localStorage.removeItem('activeOrg');
            localStorage.removeItem(ACTIVE_HR_KEY);
            localStorage.removeItem(ACTIVE_TEACHER_KEY);
            localStorage.removeItem(TEACHER_USER_KEY);
            localStorage.removeItem(ACTIVE_STUDENT_KEY);
            localStorage.removeItem(STUDENT_USER_KEY);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        },

        /**
         * Complete purge of all stored items to reset the project as 100% brand new
         */
        resetProjectToFreshState: function() {
            localStorage.clear();
            sessionStorage.clear();
            console.log('All stored items purged. System is 100% fresh for new organization registration.');
        },

        /**
         * SHA-256 password hash utility
         */
        sha256: async function(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

        /**
         * Login alias for setUser compatibility
         */
        login: function(user) {
            return this.setUser(user);
        },

        /**
         * Dedicated Visual Cutout Notice for Deleted / Revoked Accounts
         * Replaces abrupt native browser alerts with a modern, informative cutout overlay.
         */
        showAccountCutoutNotice: function(options = {}) {
            const currentUser = this.getUser() || {};
            const userName = options.name || currentUser.name || 'User';
            const userEmail = options.email || currentUser.email || 'account@institution.com';
            const userOrg = options.org || currentUser.org || localStorage.getItem('active_org') || 'Institutional System';
            const userRole = options.role || currentUser.role || 'Member';
            const title = options.title || 'Account Access Revoked';
            const reason = options.reason || 'This account has been deleted from the institutional cloud database.';
            const redirectUrl = options.redirectUrl || this.getLoginUrlByRole(userRole);

            // 1. Immediately purge all local session storage credentials
            this.logout(null);

            // 2. Remove existing overlay if already present
            const existing = document.getElementById('fgAccountCutoutOverlay');
            if (existing) existing.remove();

            // 3. Construct the Cutout Overlay
            const overlay = document.createElement('div');
            overlay.id = 'fgAccountCutoutOverlay';
            overlay.setAttribute('role', 'alertdialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2147483647;
                background: rgba(7, 11, 20, 0.94);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: fgCutoutFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            `;

            function escapeHtml(str) {
                return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            overlay.innerHTML = `
                <style>
                    @keyframes fgCutoutFadeIn {
                        from { opacity: 0; transform: scale(0.96); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes fgPulseGlowRed {
                        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
                        70% { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                    }
                    .fg-cutout-card {
                        background: #0d1527;
                        border: 1px solid rgba(239, 68, 68, 0.35);
                        border-radius: 28px;
                        max-width: 520px;
                        width: 100%;
                        padding: 36px 32px;
                        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.2);
                        text-align: center;
                        color: #ffffff;
                        position: relative;
                        overflow: hidden;
                    }
                    .fg-cutout-badge-icon {
                        width: 72px;
                        height: 72px;
                        margin: 0 auto 20px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.4) 100%);
                        border: 2px solid rgba(239, 68, 68, 0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 30px;
                        color: #f87171;
                        animation: fgPulseGlowRed 2s infinite;
                    }
                    .fg-cutout-status-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 5px 14px;
                        background: rgba(239, 68, 68, 0.15);
                        border: 1px solid rgba(239, 68, 68, 0.4);
                        border-radius: 999px;
                        font-size: 11.5px;
                        font-weight: 800;
                        letter-spacing: 1.5px;
                        text-transform: uppercase;
                        color: #fca5a5;
                        margin-bottom: 14px;
                    }
                    .fg-cutout-title {
                        font-size: 22px;
                        font-weight: 800;
                        color: #ffffff;
                        margin: 0 0 10px 0;
                        letter-spacing: -0.5px;
                    }
                    .fg-cutout-desc {
                        font-size: 14px;
                        color: #94a3b8;
                        line-height: 1.55;
                        margin: 0 0 24px 0;
                    }
                    .fg-cutout-details-box {
                        background: rgba(15, 23, 42, 0.75);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 16px;
                        padding: 16px 18px;
                        text-align: left;
                        margin-bottom: 24px;
                    }
                    .fg-cutout-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 12.5px;
                        padding: 6px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    }
                    .fg-cutout-row:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }
                    .fg-cutout-row:first-child {
                        padding-top: 0;
                    }
                    .fg-cutout-label {
                        color: #64748b;
                        font-weight: 600;
                    }
                    .fg-cutout-val {
                        color: #e2e8f0;
                        font-weight: 700;
                        max-width: 60%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .fg-cutout-btn {
                        width: 100%;
                        padding: 14px 20px;
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                        color: #ffffff;
                        border: none;
                        border-radius: 14px;
                        font-size: 15px;
                        font-weight: 700;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
                        transition: all 0.2s ease;
                    }
                    .fg-cutout-btn:hover {
                        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                        transform: translateY(-1px);
                        box-shadow: 0 14px 28px -5px rgba(239, 68, 68, 0.5);
                    }
                </style>
                <div class="fg-cutout-card">
                    <div class="fg-cutout-badge-icon">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="17" y1="8" x2="22" y2="13"></line>
                            <line x1="22" y1="8" x2="17" y2="13"></line>
                        </svg>
                    </div>

                    <div class="fg-cutout-status-pill">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;"></span>
                        Account Deleted / Revoked
                    </div>

                    <h2 class="fg-cutout-title">${escapeHtml(title)}</h2>
                    <p class="fg-cutout-desc">${escapeHtml(reason)}</p>

                    <div class="fg-cutout-details-box">
                        <div class="fg-cutout-row">
                            <span class="fg-cutout-label">Account Name:</span>
                            <span class="fg-cutout-val">${escapeHtml(userName)}</span>
                        </div>
                        <div class="fg-cutout-row">
                            <span class="fg-cutout-label">Email ID:</span>
                            <span class="fg-cutout-val">${escapeHtml(userEmail)}</span>
                        </div>
                        <div class="fg-cutout-row">
                            <span class="fg-cutout-label">Institution:</span>
                            <span class="fg-cutout-val">${escapeHtml(userOrg)}</span>
                        </div>
                        <div class="fg-cutout-row">
                            <span class="fg-cutout-label">Session Status:</span>
                            <span class="fg-cutout-val" style="color:#f87171;">Terminated & Logged Out</span>
                        </div>
                        <div class="fg-cutout-row">
                            <span class="fg-cutout-label">Detected At:</span>
                            <span class="fg-cutout-val">${new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>

                    <button type="button" class="fg-cutout-btn" id="fgCutoutExitBtn">
                        <span>Return to Secure Login</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            `;

            document.body.appendChild(overlay);

            const exitBtn = document.getElementById('fgCutoutExitBtn');
            if (exitBtn) {
                exitBtn.addEventListener('click', () => {
                    window.location.replace(redirectUrl);
                });
            }
        },

        getLoginUrlByRole: function(role = 'user') {
            const r = String(role || '').toLowerCase();
            const href = (typeof window !== 'undefined' && window.location ? window.location.href : '').toLowerCase();
            if (href.includes('/pages/admin/') || r.includes('admin')) return 'admin-login.html';
            if (href.includes('/pages/hr/') || r.includes('hr')) return 'hr-login.html';
            if (href.includes('/pages/teacher/') || r.includes('teacher')) return 'teacher-login.html';
            if (href.includes('/pages/student/') || r.includes('student')) return 'student-login.html';
            if (href.includes('/pages/finance/') || r.includes('finance') || r.includes('bursar')) return 'finance-login.html';
            if (href.includes('/pages/')) return '../site-login.html';
            return 'site-login.html';
        },

        /**
         * Render Top-Right Profile Widget with Live Online Indicator
         * Universally injects a luxury glassmorphic profile pill & interactive card
         */
        renderTopRightProfileWidget: function() {
            if (typeof document === 'undefined') return;

            // Don't render on public login / splash / registration pages
            const path = (window.location.pathname || '').toLowerCase();
            if (path.includes('-login') || path.includes('register') || path.includes('signup') || path.includes('landing.html')) {
                return;
            }

            const currentUser = this.getUser();
            if (!currentUser && !path.includes('dashboard')) return;

            const name = (currentUser && (currentUser.name || currentUser.fullName)) || 'Authenticated User';
            const email = (currentUser && currentUser.email) || 'user@institution.com';
            const org = (currentUser && currentUser.org) || localStorage.getItem('active_org') || localStorage.getItem('activeOrg') || 'FLAWLESS GRAPHICS';
            const rawRole = (currentUser && currentUser.role) || (path.includes('/admin/') ? 'admin' : (path.includes('/hr/') ? 'hr' : (path.includes('/teacher/') ? 'teacher' : (path.includes('/student/') ? 'student' : (path.includes('/finance/') ? 'finance' : 'user')))));
            const photo = this.getUserPhoto();

            // Role formatting & styling tokens
            let roleLabel = 'Verified Member';
            let roleBadgeBg = 'rgba(99, 102, 241, 0.15)';
            let roleBadgeColor = '#818cf8';
            let roleBorder = 'rgba(99, 102, 241, 0.3)';
            let roleIcon = 'fa-user-check';

            const rLower = rawRole.toLowerCase();
            if (rLower.includes('admin') || rLower.includes('super')) {
                roleLabel = 'Super Admin';
                roleBadgeBg = 'rgba(245, 158, 11, 0.18)';
                roleBadgeColor = '#fbbf24';
                roleBorder = 'rgba(245, 158, 11, 0.4)';
                roleIcon = 'fa-crown';
            } else if (rLower.includes('hr')) {
                roleLabel = 'HR Manager';
                roleBadgeBg = 'rgba(168, 85, 247, 0.18)';
                roleBadgeColor = '#c084fc';
                roleBorder = 'rgba(168, 85, 247, 0.4)';
                roleIcon = 'fa-shield-halved';
            } else if (rLower.includes('teach') || rLower.includes('faculty')) {
                roleLabel = 'Faculty Educator';
                roleBadgeBg = 'rgba(16, 185, 129, 0.18)';
                roleBadgeColor = '#34d399';
                roleBorder = 'rgba(16, 185, 129, 0.4)';
                roleIcon = 'fa-chalkboard-user';
            } else if (rLower.includes('stud') || rLower.includes('scholar')) {
                roleLabel = 'Scholar / Student';
                roleBadgeBg = 'rgba(56, 189, 248, 0.18)';
                roleBadgeColor = '#38bdf8';
                roleBorder = 'rgba(56, 189, 248, 0.4)';
                roleIcon = 'fa-user-graduate';
            } else if (rLower.includes('finan') || rLower.includes('bursar')) {
                roleLabel = 'Finance Officer';
                roleBadgeBg = 'rgba(234, 179, 8, 0.18)';
                roleBadgeColor = '#fde047';
                roleBorder = 'rgba(234, 179, 8, 0.4)';
                roleIcon = 'fa-wallet';
            }

            // Fallback initials if no photo
            const nameParts = name.trim().split(/\s+/);
            const initials = nameParts.length >= 2 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : (name.substring(0, 2).toUpperCase() || 'US');

            // Inject CSS once into head
            if (!document.getElementById('fgTopProfileStyles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'fgTopProfileStyles';
                styleEl.textContent = `
                    @keyframes fgOnlineRadarPulse {
                        0% {
                            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8), 0 0 8px rgba(16, 185, 129, 0.5);
                        }
                        70% {
                            box-shadow: 0 0 0 7px rgba(16, 185, 129, 0), 0 0 12px rgba(16, 185, 129, 0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0), 0 0 0 rgba(16, 185, 129, 0);
                        }
                    }
                    @keyframes fgDropdownEntrance {
                        from {
                            opacity: 0;
                            transform: translateY(-8px) scale(0.96);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    .fg-top-profile-container {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                        z-index: 1000;
                    }
                    .fg-top-profile-pill {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 3px;
                        background: rgba(15, 23, 42, 0.75);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        border: 1.5px solid rgba(255, 255, 255, 0.16);
                        border-radius: 50%;
                        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                        cursor: pointer;
                        user-select: none;
                        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .fg-top-profile-pill:hover, .fg-top-profile-pill.active {
                        background: rgba(30, 41, 59, 0.95);
                        border-color: rgba(99, 102, 241, 0.7);
                        transform: scale(1.06);
                        box-shadow: 0 0 18px rgba(99, 102, 241, 0.4), 0 6px 20px rgba(0, 0, 0, 0.4);
                    }
                    .fg-avatar-wrap {
                        position: relative;
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }
                    .fg-avatar-img {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        object-fit: cover;
                        display: block;
                        border: 1.5px solid rgba(255, 255, 255, 0.25);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    }
                    .fg-avatar-initials {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 800;
                        color: #ffffff;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                        border: 1.5px solid rgba(255, 255, 255, 0.3);
                        letter-spacing: 0.5px;
                        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
                    }
                    .fg-online-dot {
                        position: absolute;
                        bottom: -1px;
                        right: -1px;
                        width: 11px;
                        height: 11px;
                        background: #10b981;
                        border: 2px solid #0b1120;
                        border-radius: 50%;
                        animation: fgOnlineRadarPulse 2.2s infinite ease-out;
                        z-index: 2;
                    }

                    /* Interactive Luxury Dropdown Card */
                    .fg-profile-dropdown {
                        position: absolute;
                        top: calc(100% + 10px);
                        right: 0;
                        width: 290px;
                        background: rgba(15, 23, 42, 0.94);
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        border: 1px solid rgba(255, 255, 255, 0.14);
                        border-radius: 18px;
                        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
                        padding: 16px;
                        display: none;
                        flex-direction: column;
                        gap: 12px;
                        z-index: 10001;
                        animation: fgDropdownEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .fg-profile-dropdown.open {
                        display: flex;
                    }
                    .fg-dropdown-header {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }
                    .fg-dropdown-avatar {
                        position: relative;
                        width: 46px;
                        height: 46px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }
                    .fg-dropdown-details {
                        display: flex;
                        flex-direction: column;
                        gap: 3px;
                        overflow: hidden;
                    }
                    .fg-dropdown-name {
                        font-size: 14px;
                        font-weight: 800;
                        color: #ffffff;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .fg-dropdown-email {
                        font-size: 11px;
                        color: #94a3b8;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .fg-dropdown-org-pill {
                        font-size: 10px;
                        font-weight: 700;
                        color: #cbd5e1;
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 2px 7px;
                        border-radius: 6px;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        margin-top: 2px;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .fg-dropdown-telemetry {
                        background: rgba(16, 185, 129, 0.08);
                        border: 1px solid rgba(16, 185, 129, 0.25);
                        border-radius: 10px;
                        padding: 8px 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 11px;
                        color: #10b981;
                        font-weight: 700;
                    }
                    .fg-dropdown-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .fg-dropdown-btn {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        width: 100%;
                        padding: 9px 12px;
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        border-radius: 10px;
                        color: #e2e8f0;
                        font-size: 12px;
                        font-weight: 600;
                        text-decoration: none;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        box-sizing: border-box;
                    }
                    .fg-dropdown-btn:hover {
                        background: rgba(255, 255, 255, 0.09);
                        border-color: rgba(255, 255, 255, 0.15);
                        color: #ffffff;
                        transform: translateX(2px);
                    }
                    .fg-dropdown-btn.logout {
                        background: rgba(239, 68, 68, 0.1);
                        border-color: rgba(239, 68, 68, 0.25);
                        color: #f87171;
                    }
                    .fg-dropdown-btn.logout:hover {
                        background: rgba(239, 68, 68, 0.2);
                        border-color: rgba(239, 68, 68, 0.4);
                        color: #ffffff;
                    }
                `;
                document.head.appendChild(styleEl);
            }

            // Build HTML
            const avatarHtml = photo
                ? `<img src="${photo}" alt="${this.escapeHtml(name)}" class="fg-avatar-img">`
                : `<div class="fg-avatar-initials">${initials}</div>`;

            const dropdownAvatarHtml = photo
                ? `<img src="${photo}" alt="${this.escapeHtml(name)}" class="fg-avatar-img" style="border-width:2.5px;">`
                : `<div class="fg-avatar-initials" style="font-size:16px;">${initials}</div>`;

            const widgetHtml = `
                <div class="fg-top-profile-pill standalone" id="fgTopProfilePill" title="Active Session: ${this.escapeHtml(name)} (${roleLabel})">
                    <div class="fg-avatar-wrap">
                        ${avatarHtml}
                        <span class="fg-online-dot" title="Online & Connected to Cloud"></span>
                    </div>
                </div>

                <div class="fg-profile-dropdown" id="fgProfileDropdown">
                    <div class="fg-dropdown-header">
                        <div class="fg-dropdown-avatar">
                            ${dropdownAvatarHtml}
                            <span class="fg-online-dot" style="bottom:1px; right:1px;"></span>
                        </div>
                        <div class="fg-dropdown-details">
                            <div class="fg-dropdown-name">${this.escapeHtml(name)}</div>
                            <div class="fg-dropdown-email">${this.escapeHtml(email)}</div>
                            <div class="fg-dropdown-org-pill">
                                <i class="fa-solid fa-building-columns"></i> ${this.escapeHtml(org)}
                            </div>
                        </div>
                    </div>

                    <div class="fg-dropdown-telemetry">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="width:7px; height:7px; border-radius:50%; background:#10b981;"></span>
                            <span>Online • Cloud Live</span>
                        </div>
                        <span style="font-size:10px; color:#6ee7b7; background:rgba(16,185,129,0.15); padding:2px 6px; border-radius:4px;">⚡ 24ms</span>
                    </div>

                    <div class="fg-dropdown-actions">
                        <a href="${this.getProfilePathByRole(rawRole)}" class="fg-dropdown-btn">
                            <i class="fa-solid fa-id-card" style="color:#60a5fa;"></i>
                            <span>View Digital ID & Profile</span>
                        </a>
                        <button type="button" class="fg-dropdown-btn" onclick="if(window.QuickDock){window.QuickDock.openNotifications();} else if(window.toggleNotificationPopover){window.toggleNotificationPopover();}">
                            <i class="fa-solid fa-bell" style="color:#fbbf24;"></i>
                            <span>Notifications Hub</span>
                        </button>
                        <a href="../../welcome.html" class="fg-dropdown-btn">
                            <i class="fa-solid fa-grip" style="color:#a78bfa;"></i>
                            <span>Workspace Hub</span>
                        </a>
                        <button type="button" class="fg-dropdown-btn logout" onclick="AuthSession.logout('${this.getLoginUrlByRole(rawRole)}')">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Secure Sign Out</span>
                        </button>
                    </div>
                </div>
            `;

            // Locate target mounting slot
            let container = document.getElementById('topRightProfileContainer');
            if (!container) {
                const candidateSelectors = [
                    '.topbar-right', '.controls', '.header-actions-group', 
                    '.nav-right', '.header-actions', '.top-nav', '#headerRight'
                ];
                for (const sel of candidateSelectors) {
                    const el = document.querySelector(sel);
                    if (el) {
                        container = document.createElement('div');
                        container.id = 'topRightProfileContainer';
                        container.className = 'fg-top-profile-container';
                        el.appendChild(container);
                        break;
                    }
                }
            } else {
                container.className = 'fg-top-profile-container';
            }

            if (!container) {
                // If page has no topbar container, place floating in top-right corner
                container = document.createElement('div');
                container.id = 'topRightProfileContainer';
                container.className = 'fg-top-profile-container';
                container.style.cssText = 'position:fixed; top:14px; right:20px; z-index:99999;';
                document.body.appendChild(container);
            }

            container.innerHTML = widgetHtml;

            // Wire dropdown toggle
            const pill = document.getElementById('fgTopProfilePill');
            const dropdown = document.getElementById('fgProfileDropdown');
            if (pill && dropdown) {
                pill.onclick = function(e) {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.contains('open');
                    if (isOpen) {
                        dropdown.classList.remove('open');
                        pill.classList.remove('active');
                    } else {
                        dropdown.classList.add('open');
                        pill.classList.add('active');
                    }
                };

                // Close on click outside
                document.addEventListener('click', function(e) {
                    if (!container.contains(e.target)) {
                        dropdown.classList.remove('open');
                        pill.classList.remove('active');
                    }
                });
            }
        },

        getProfilePathByRole: function(role = 'user') {
            const r = String(role || '').toLowerCase();
            const href = (typeof window !== 'undefined' && window.location ? window.location.href : '').toLowerCase();
            if (href.includes('/pages/teacher/') || r.includes('teacher')) return 'teacher-profile.html';
            if (href.includes('/pages/student/') || r.includes('student')) return 'javascript:if(window.showSection){showSection("profile");}';
            if (href.includes('/pages/admin/') || r.includes('admin')) return 'javascript:if(window.switchSection){switchSection("superAdminsSection");}';
            if (href.includes('/pages/hr/') || r.includes('hr')) return 'javascript:if(window.switchSection){switchSection("directorySection");}';
            if (href.includes('/pages/finance/') || r.includes('finance')) return 'javascript:if(window.switchTab){switchTab("settings");}';
            return 'javascript:void(0);';
        },

        escapeHtml: function(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        /**
         * Cloud Session & Organization Validation Watchdog
         * Ensures localStorage contains ONLY data that actually exists in live Supabase Cloud.
         * If user or organization is deleted, immediately revokes access, purges session, and displays the Cutout Notice.
         */
        validateCloudSession: async function() {
            if (!window.SupabaseService) return;

            function isDashboardPage() {
                try {
                    const href = (window.location.href || '').toLowerCase();
                    if (href.includes('-login.html') || href.includes('landing.html') || href.endsWith('index.html') || href.endsWith('/')) {
                        return false;
                    }
                    return href.includes('/pages/') || href.includes('welcome.html');
                } catch(e) {
                    return false;
                }
            }

            try {
                const currentUser = AuthSession.getUser();

                if (isDashboardPage() && !currentUser) {
                    AuthSession.logout(null);
                    window.location.replace(AuthSession.getLoginUrlByRole('user'));
                    return false;
                }

                // 1. Verify User existence & status in live Supabase
                if (currentUser && currentUser.email) {
                    const email = currentUser.email.trim().toLowerCase();
                    const isRootSuperAdmin = email === 'admin@flawlessgraphics.com';

                    if (!isRootSuperAdmin) {
                        let liveUser = await window.SupabaseService.getUserByEmail(email);

                        // If not found in users table, also check teachers and students
                        if (!liveUser) {
                            try {
                                const teacherRows = await window.SupabaseService.query(`teachers?email=eq.${encodeURIComponent(email)}&limit=1`);
                                if (Array.isArray(teacherRows) && teacherRows.length > 0) {
                                    liveUser = teacherRows[0];
                                }
                            } catch(e) {}
                        }

                        if (!liveUser) {
                            try {
                                const studentRows = await window.SupabaseService.query(`students?or=(email.eq.${encodeURIComponent(email)},parent_email.eq.${encodeURIComponent(email)},guardian_email.eq.${encodeURIComponent(email)})&limit=1`);
                                if (Array.isArray(studentRows) && studentRows.length > 0) {
                                    liveUser = studentRows[0];
                                }
                            } catch(e) {}
                        }

                        if (!liveUser) {
                            // User was deleted from Supabase! Immediate Access Revocation with Cutout Notice!
                            console.warn(`[AuthSession] Active user '${email}' was deleted from Supabase Cloud. Displaying Cutout Notice.`);
                            
                            if (isDashboardPage()) {
                                AuthSession.showAccountCutoutNotice({
                                    title: 'Account Deleted from Institutional Cloud',
                                    reason: 'Your account has been deleted from the active institutional database by administrators. Access is permanently terminated.',
                                    user: currentUser,
                                    email: email,
                                    name: currentUser.name,
                                    org: currentUser.org,
                                    role: currentUser.role,
                                    redirectUrl: AuthSession.getLoginUrlByRole(currentUser.role)
                                });
                                return false;
                            }
                            AuthSession.logout(null);
                            return false;
                        }

                        // Check if account status was rejected
                        const userStatus = (liveUser.status || '').toLowerCase();
                        if (userStatus === 'rejected') {
                            console.warn(`[AuthSession] Active user '${email}' status is rejected. Displaying Cutout Notice.`);
                            if (isDashboardPage()) {
                                AuthSession.showAccountCutoutNotice({
                                    title: 'Account Access Declined / Rejected',
                                    reason: 'Your institutional access request has been declined or revoked by the administration.',
                                    user: currentUser,
                                    email: email,
                                    name: currentUser.name,
                                    org: currentUser.org,
                                    role: currentUser.role,
                                    redirectUrl: AuthSession.getLoginUrlByRole(currentUser.role)
                                });
                                return false;
                            }
                            AuthSession.logout(null);
                            return false;
                        }
                    }
                }

                // 2. Verify Organization existence in live Supabase (for active dashboard sessions)
                if (isDashboardPage() && currentUser) {
                    const userOrg = currentUser && currentUser.org ? currentUser.org.trim() : null;
                    const cachedOrg = (localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg') || '').trim();
                    const orgToCheck = userOrg || cachedOrg;

                    if (orgToCheck && orgToCheck.toUpperCase() !== 'FLAWLESS GRAPHICS') {
                        const cloudOrg = await window.SupabaseService.getOrganization(orgToCheck);
                        if (!cloudOrg) {
                            console.warn(`[AuthSession] Institution '${orgToCheck}' was not verified in Supabase Cloud.`);
                            if (currentUser && currentUser.org && currentUser.org.toLowerCase() === orgToCheck.toLowerCase()) {
                                AuthSession.showAccountCutoutNotice({
                                    title: 'Institution Workspace Deleted',
                                    reason: `Institution '${orgToCheck}' has been removed from the cloud platform. Access to this workspace has ended.`,
                                    user: currentUser,
                                    email: currentUser.email,
                                    name: currentUser.name,
                                    org: orgToCheck,
                                    role: currentUser.role,
                                    redirectUrl: AuthSession.getLoginUrlByRole(currentUser.role)
                                });
                                return false;
                            }
                        }
                    }
                }

                // 3. Re-synchronize branding for active cloud organization
                await AuthSession.applyGlobalBranding();
                return true;
            } catch (err) {
                console.warn('[AuthSession] Cloud validation error:', err);
                return false;
            }
        }
    };

    // Optimized Watchdog & Instant Startup Synchronization
    let lastValidationTime = 0;
    const VALIDATION_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes throttle for tab focus

    function triggerThrottledValidation(force = false) {
        const now = Date.now();
        if (force || (now - lastValidationTime) > VALIDATION_THROTTLE_MS) {
            lastValidationTime = now;
            AuthSession.validateCloudSession();
        }
    }

    // Auto-validate and synchronize Supabase session once on startup
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
            triggerThrottledValidation(true);
            AuthSession.renderTopRightProfileWidget();
        }, 10);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            triggerThrottledValidation(true);
            AuthSession.renderTopRightProfileWidget();
        }, { once: true });
    }

    // Passive tab focus check with 5-min throttle (zero background battery / CPU drain)
    window.addEventListener('focus', () => {
        triggerThrottledValidation(false);
    });

    // Auto-sync branding across browser tabs with debounce
    let storageBrandingDebounce = null;
    window.addEventListener('storage', (e) => {
        if (e.key === 'active_org' || e.key === 'active_org_logo' || e.key === 'active_org_user' || e.key === 'active_user') {
            if (storageBrandingDebounce) clearTimeout(storageBrandingDebounce);
            storageBrandingDebounce = setTimeout(() => {
                AuthSession.applyGlobalBranding();
            }, 50);
        }
    });

    window.AuthSession = AuthSession;
})(window);
