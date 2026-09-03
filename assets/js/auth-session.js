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
         * Set and synchronize session across all system portals
         */
        setUser: function(user) {
            if (!user || typeof user !== 'object') return;

            const normalizedUser = {
                org: (user.org || user.organization || 'FLAWLESS GRAPHICS').trim(),
                name: (user.name || user.fullName || 'Admin User').trim(),
                email: (user.email || 'admin@flawlessgraphics.com').trim().toLowerCase(),
                role: (user.role || 'admin').toLowerCase(),
                logo: user.logo || null,
                createdAt: user.createdAt || Date.now()
            };

            // 1. Root & general user keys
            localStorage.setItem(ACTIVE_ORG_USER_KEY, JSON.stringify(normalizedUser));
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(normalizedUser));

            // 2. Organization namespace
            localStorage.setItem(ACTIVE_ORG_KEY, normalizedUser.org);
            localStorage.setItem('activeOrg', normalizedUser.org);

            // 3. HR portal session
            localStorage.setItem(ACTIVE_HR_KEY, JSON.stringify({
                name: normalizedUser.name,
                email: normalizedUser.email,
                role: normalizedUser.role === 'hr' ? 'HR Admin' : 'Super Admin',
                org: normalizedUser.org
            }));

            // 4. Teacher portal sessions
            const teacherSession = {
                name: normalizedUser.name,
                email: normalizedUser.email,
                org: normalizedUser.org,
                role: 'teacher',
                photoBase64: normalizedUser.logo || ''
            };
            localStorage.setItem(ACTIVE_TEACHER_KEY, JSON.stringify(teacherSession));
            localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherSession));

            // Ensure registered users array contains this user
            this.saveRegisteredUser(normalizedUser);

            return normalizedUser;
        },

        /**
         * Initialize demo session if no session is active
         */
        initDemoSession: function() {
            return this.setUser(DEMO_USER);
        },

        /**
         * Ensure user exists in registered list
         */
        saveRegisteredUser: function(user) {
            try {
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

    window.AuthSession = AuthSession;
})(window);
