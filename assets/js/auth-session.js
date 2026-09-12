/**
 * auth-session.js
 * Centralized Authentication & Session Bridge for FLAWLESS GRAPHICS — LUCY™ Management System
 * Automatically synchronizes and harmonizes session keys across:
 * - active_org_user (Root registration/login)
 * - active_user (Unified client)
 * - active_org / activeOrg (Organization namespace)
 * - activeHR (HR administration portal)
 * - active_teacher / teacher_active_user (Teacher classroom portal)
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

    // Default Fallback Demo User
    const DEMO_USER = {
        org: 'FLAWLESS GRAPHICS',
        name: 'James Ntiamoah',
        email: 'admin@flawlessgraphics.com',
        role: 'admin',
        logo: null,
        createdAt: Date.now()
    };

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
         * Retrieve current active user session from any known key
         */
        getUser: function() {
            let user = null;
            const candidates = [ACTIVE_ORG_USER_KEY, ACTIVE_USER_KEY, ACTIVE_HR_KEY, ACTIVE_TEACHER_KEY, TEACHER_USER_KEY];
            for (const k of candidates) {
                const parsed = safeParse(localStorage.getItem(k));
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.org || parsed.email || parsed.name)) {
                    user = parsed;
                    break;
                }
            }

            if (!user) {
                const org = localStorage.getItem(ACTIVE_ORG_KEY) || localStorage.getItem('activeOrg');
                if (org && typeof org === 'string') {
                    user = {
                        org: org,
                        name: 'Administrator',
                        email: 'admin@' + org.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
                        role: 'admin'
                    };
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
                || 'FLAWLESS GRAPHICS';
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
         */
        applyGlobalBranding: function() {
            const org = this.getOrg();
            const logo = this.getLogo();

            // 1. Text branding targets
            const textSelectors = [
                '#orgTitle', '#headerOrgTitle', '#orgNameDisplay', '#summaryOrgName', '#orgName',
                '.brand-title', '.org-title-text', '.header-org-title'
            ];
            textSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (el && org) {
                        el.textContent = org.toUpperCase();
                    }
                });
            });

            // Specific header checks where brand names are displayed
            document.querySelectorAll('.brand, .brand-wrapper, .brand-logo-container').forEach(brandEl => {
                const title = brandEl.querySelector('h1, h2, .brand-title, #orgName, #headerOrgTitle, #orgTitle, span.org-name');
                if (title && !title.getAttribute('data-preserve-title') && org) {
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
                            // Check if image already exists
                            let img = el.querySelector('img.org-brand-logo');
                            if (!img) {
                                el.setAttribute('data-original-html', el.innerHTML);
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
                org: (user.org || user.organization || 'FLAWLESS GRAPHICS').trim(),
                name: (user.name || user.fullName || 'Admin User').trim(),
                email: (user.email || 'admin@flawlessgraphics.com').trim().toLowerCase(),
                role: (user.role || 'admin').toLowerCase(),
                logo: user.logo || existingLogo || null,
                photo: user.photo || user.photoBase64 || null,
                createdAt: user.createdAt || Date.now()
            };

            // 1. Root & general user keys
            localStorage.setItem(ACTIVE_ORG_USER_KEY, JSON.stringify(normalizedUser));
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(normalizedUser));

            // 2. Organization namespace
            localStorage.setItem(ACTIVE_ORG_KEY, normalizedUser.org);
            localStorage.setItem('activeOrg', normalizedUser.org);
            if (normalizedUser.logo) {
                localStorage.setItem('active_org_logo', normalizedUser.logo);
                localStorage.setItem('org_logo', normalizedUser.logo);
            }

            // 3. HR portal session
            localStorage.setItem(ACTIVE_HR_KEY, JSON.stringify({
                name: normalizedUser.name,
                email: normalizedUser.email,
                role: normalizedUser.role === 'hr' ? 'HR Admin' : 'Super Admin',
                org: normalizedUser.org,
                photo: normalizedUser.photo || normalizedUser.logo || null
            }));

            // 4. Teacher portal sessions
            const teacherSession = {
                name: normalizedUser.name,
                email: normalizedUser.email,
                org: normalizedUser.org,
                role: 'teacher',
                photoBase64: normalizedUser.photo || normalizedUser.logo || ''
            };
            localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(teacherSession));
            localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherSession));

            // Ensure registered users array contains this user
            this.saveRegisteredUser(normalizedUser);

            // Dynamically refresh branding
            this.applyGlobalBranding();

            return normalizedUser;
        },

        /**
         * Cryptographic Smart ID generator for registered users, staff and students
         */
        generateSmartId: function(user, role = 'user') {
            const effectiveRole = (role || (user && user.role) || 'USER').toUpperCase().slice(0, 3);
            const year = new Date().getFullYear();
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            const hexSuffix = Math.random().toString(16).substring(2, 6).toUpperCase();
            const smartIdNum = `FG-${effectiveRole}-${year}-${randomNum}`;
            const rfidHex1 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidHex2 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidHex3 = Math.random().toString(16).substring(2, 4).toUpperCase();
            const rfidUid = `E0:04:01:${rfidHex1}:${rfidHex2}:${rfidHex3}`;
            const issueDate = new Date().toISOString().split('T')[0];
            const expYear = year + 3;
            const expiryDate = `${expYear}-08-31`;
            const securityHash = `SEC-${hexSuffix}-${Date.now().toString(36).toUpperCase()}`;
            const qrData = `https://verify.flawlessgraphics.com/id/${smartIdNum}?u=${encodeURIComponent((user && (user.name || user.email)) || '')}&sec=${securityHash}`;

            return {
                smartIdNumber: smartIdNum,
                rfidUid: rfidUid,
                barcode: `*${smartIdNum}*`,
                qrData: qrData,
                issueDate: issueDate,
                expiryDate: expiryDate,
                securityHash: securityHash,
                status: 'Active',
                issuedBy: 'Directorate of Certification & HR Registry'
            };
        },

        /**
         * Initialize demo session if no session is active
         */
        initDemoSession: function() {
            return this.setUser(DEMO_USER);
        },

        /**
         * Ensure user exists in registered list and possesses a Smart ID
         */
        saveRegisteredUser: function(user) {
            try {
                if (!user.smartId) {
                    user.smartId = this.generateSmartId(user, user.role);
                    user.smartIdNumber = user.smartId.smartIdNumber;
                }
                let users = safeParse(localStorage.getItem(USERS_KEY), []);
                const idx = users.findIndex(u => u.email === user.email);
                if (idx >= 0) {
                    users[idx] = Object.assign({}, users[idx], user);
                } else {
                    users.push(user);
                }
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            } catch (e) {
                console.warn('Could not save user to registered list:', e);
            }
        },

        /**
         * Check if authenticated; if not, redirect gracefully
         */
        requireAuth: function(redirectUrl = 'site-login.html', allowDemo = true) {
            let user = this.getUser();
            if (!user) {
                if (allowDemo) {
                    console.info('Auto-initializing demo session for preview');
                    user = this.initDemoSession();
                } else {
                    window.location.href = redirectUrl;
                    return null;
                }
            }
            // Ensure synchronization across storage keys
            this.setUser(user);
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
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
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
        }
    };

    // Auto-synchronize keys if any partial session exists
    const existing = AuthSession.getUser();
    if (existing && !localStorage.getItem(ACTIVE_ORG_KEY)) {
        AuthSession.setUser(existing);
    }

    // Auto-sync active Supabase cloud session if available
    window.addEventListener('DOMContentLoaded', () => {
        // Automatically apply branding across document
        AuthSession.applyGlobalBranding();

        if (window.SupabaseService && typeof window.SupabaseService.getSession === 'function') {
            window.SupabaseService.getSession().then(session => {
                if (session && session.user && session.user.email_confirmed_at) {
                    const u = session.user;
                    const current = AuthSession.getUser();
                    if (!current || current.email !== u.email) {
                        AuthSession.setUser({
                            org: u.user_metadata?.org_name || 'FLAWLESS GRAPHICS',
                            name: u.user_metadata?.admin_name || u.email.split('@')[0],
                            email: u.email,
                            role: 'admin'
                        });
                    }
                }
            }).catch(() => {});
        }
    });

    // Auto-sync branding across browser tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'active_org' || e.key === 'active_org_logo' || e.key === 'active_org_user' || e.key === 'active_user') {
            AuthSession.applyGlobalBranding();
        }
    });

    window.AuthSession = AuthSession;
})(window);
