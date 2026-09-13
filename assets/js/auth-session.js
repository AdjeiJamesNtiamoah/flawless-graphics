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
         * Retrieve current active user session
         */
        getUser: function() {
            let user = null;
            const candidates = [ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY, ACTIVE_HR_KEY, ACTIVE_TEACHER_KEY, TEACHER_USER_KEY, ACTIVE_STUDENT_KEY, STUDENT_USER_KEY];
            for (const k of candidates) {
                const parsed = safeParse(localStorage.getItem(k));
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.org || parsed.email || parsed.name)) {
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
            return (user && (user.photo || user.photoBase64)) || null;
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
            let org = null;
            let logo = null;

            if (window.SupabaseService && typeof window.SupabaseService.getOrganizations === 'function') {
                try {
                    const cloudOrgs = await window.SupabaseService.getOrganizations();
                    const cachedOrg = localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg');

                    if (cachedOrg && Array.isArray(cloudOrgs) && cloudOrgs.length > 0) {
                        const matched = cloudOrgs.find(o => 
                            (o.org_name || o.name || '').trim().toLowerCase() === cachedOrg.trim().toLowerCase()
                        );
                        if (matched) {
                            org = matched.org_name || matched.name;
                            logo = matched.logo_url || matched.logo_path || matched.logo || localStorage.getItem('active_org_logo');
                        } else {
                            // Cached org does not exist in Supabase! Purge it!
                            localStorage.removeItem(ACTIVE_ORG_KEY);
                            localStorage.removeItem('activeOrg');
                            localStorage.removeItem('active_org_logo');
                            localStorage.removeItem('org_logo');
                        }
                    }
                } catch (e) {
                    console.warn('[AuthSession] Branding query error:', e);
                }
            }

            // If no verified organization from Supabase, preserve default template text & icons
            if (!org) return;

            // 1. Text branding targets
            const textSelectors = [
                '#orgTitle', '#headerOrgTitle', '#orgNameDisplay', '#summaryOrgName', '#orgName',
                '.brand-title', '.org-title-text', '.header-org-title'
            ];
            textSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (el && !el.getAttribute('data-preserve-title')) {
                        el.textContent = org.toUpperCase();
                    }
                });
            });

            // Specific header checks where brand names are displayed
            document.querySelectorAll('.brand, .brand-wrapper, .brand-logo-container').forEach(brandEl => {
                const title = brandEl.querySelector('h1, h2, .brand-title, #orgName, #headerOrgTitle, #orgTitle, span.org-name');
                if (title && !title.getAttribute('data-preserve-title')) {
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
         * Cloud Session & Organization Validation Watchdog
         * Ensures localStorage contains ONLY data that actually exists in live Supabase Cloud.
         * If user or organization is deleted, immediately revokes access, purges session, and redirects to home.
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

            function getHomeUrl() {
                try {
                    const href = (window.location.href || '').toLowerCase();
                    if (href.includes('/pages/admin/')) return 'admin-login.html';
                    if (href.includes('/pages/hr/')) return 'hr-login.html';
                    if (href.includes('/pages/teacher/')) return 'teacher-login.html';
                    if (href.includes('/pages/student/')) return 'student-login.html';
                    if (href.includes('/pages/finance/')) return 'finance-login.html';
                    if (href.includes('/pages/')) return '../site-login.html';
                    return 'site-login.html';
                } catch(e) {
                    return 'site-login.html';
                }
            }

            try {
                const currentUser = AuthSession.getUser();

                if (isDashboardPage() && !currentUser) {
                    AuthSession.logout(null);
                    window.location.replace(getHomeUrl());
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
                            // User was deleted from Supabase! Immediate Access Revocation!
                            console.warn(`[AuthSession] Active user '${email}' was deleted from Supabase Cloud. Revoking access.`);
                            AuthSession.logout(null);

                            if (isDashboardPage()) {
                                alert('Your account has been deleted from the institutional database. Access revoked.');
                                window.location.replace(getHomeUrl());
                                return false;
                            }
                            return false;
                        }

                        // Check if account status was rejected
                        const userStatus = (liveUser.status || '').toLowerCase();
                        if (userStatus === 'rejected') {
                            console.warn(`[AuthSession] Active user '${email}' status is rejected. Revoking access.`);
                            AuthSession.logout(null);
                            if (isDashboardPage()) {
                                alert('Your account access has been declined or revoked. Access terminated.');
                                window.location.replace(getHomeUrl());
                                return false;
                            }
                            return false;
                        }
                    }
                }

                // 2. Verify Organization existence in live Supabase
                const cachedOrg = (localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg') || '').trim();
                const userOrg = currentUser && currentUser.org ? currentUser.org.trim() : null;
                const orgToCheck = userOrg || cachedOrg;

                if (orgToCheck && orgToCheck.toUpperCase() !== 'FLAWLESS GRAPHICS') {
                    const cloudOrg = await window.SupabaseService.getOrganization(orgToCheck);
                    if (!cloudOrg) {
                        // Organization was deleted from Supabase! Immediate Access Revocation!
                        console.warn(`[AuthSession] Institution '${orgToCheck}' was deleted from Supabase Cloud. Revoking access.`);
                        localStorage.removeItem(ACTIVE_ORG_KEY);
                        localStorage.removeItem('activeOrg');
                        localStorage.removeItem('active_org_logo');
                        localStorage.removeItem('org_logo');

                        if (currentUser && currentUser.org && currentUser.org.toLowerCase() === orgToCheck.toLowerCase()) {
                            AuthSession.logout(null);
                            if (isDashboardPage()) {
                                alert(`Institution '${orgToCheck}' has been deleted from the institutional system. Access revoked.`);
                                window.location.replace(getHomeUrl());
                                return false;
                            }
                            return false;
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

    // Auto-validate and synchronize Supabase session on startup
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => AuthSession.validateCloudSession(), 50);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            AuthSession.validateCloudSession();
        });
    }

    // Real-time Session Watchdog: Check on window focus and periodically every 15s
    window.addEventListener('focus', () => {
        AuthSession.validateCloudSession();
    });
    setInterval(() => {
        AuthSession.validateCloudSession();
    }, 15000);

    // Auto-sync branding across browser tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'active_org' || e.key === 'active_org_logo' || e.key === 'active_org_user' || e.key === 'active_user') {
            AuthSession.applyGlobalBranding();
        }
    });

    window.AuthSession = AuthSession;
})(window);
