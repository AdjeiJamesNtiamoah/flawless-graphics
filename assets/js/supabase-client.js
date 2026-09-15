/**
 * supabase-client.js
 * Centralized Supabase Direct Cloud Integration Layer
 * FLAWLESS GRAPHICS Enterprise School Management System
 * 
 * Direct cloud persistence engine: all portals, dashboards, and auth flows
 * call and persist data exclusively to Supabase PostgREST tables.
 */

(function(window) {
  'use strict';

  // Ensure SupabaseConfig is available
  const Config = window.SupabaseConfig || {
    getUrl: () => 'https://wmvsujwgvlosfjdlhadu.supabase.co',
    getAnonKey: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg',
    isConfigured: () => true,
    isAutoSync: () => true
  };

  /**
   * Internal REST Client for Supabase PostgREST API
   * Direct cloud system of record with zero reliance on localStorage for entity data.
   */
  class SupabaseRestClient {
    constructor() {
      this.client = null;
      this.initClient();

      window.addEventListener('fg:supabase-config-changed', () => {
        this.initClient();
      });
    }

    initClient() {
      if (window.supabase && typeof window.supabase.createClient === 'function' && Config.isConfigured()) {
        try {
          this.client = window.supabase.createClient(Config.getUrl(), Config.getAnonKey());
          console.info('Supabase JS SDK initialized successfully');
        } catch (e) {
          console.warn('Supabase SDK initialization notice, using REST API:', e.message);
          this.client = null;
        }
      }
    }

    getClient() {
      if (!this.client && window.supabase && typeof window.supabase.createClient === 'function' && Config.isConfigured()) {
        this.initClient();
      }
      return this.client;
    }

    /**
     * Standard REST fetch request to Supabase PostgREST endpoint
     */
    async query(endpoint, method = 'GET', body = null, extraHeaders = {}) {
      if (!Config.isConfigured()) {
        throw new Error('Supabase project is not configured. Please check your Supabase credentials.');
      }

      const baseUrl = Config.getUrl().replace(/\/$/, '');
      const url = `${baseUrl}/rest/v1/${endpoint}`;
      const key = Config.getAnonKey();

      const headers = Object.assign({
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }, extraHeaders);

      const options = { method, headers };
      if (body !== null && body !== undefined) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        let errText = res.statusText;
        try {
          const errJson = await res.json();
          errText = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch (_) {}
        throw new Error(`Supabase Error (${res.status}): ${errText}`);
      }

      if (res.status === 204) return [];
      return await res.json();
    }

    /* =============================================================
       1. ORGANIZATIONS (TENANTS)
    ============================================================= */
    async getOrganizations() {
      try {
        const data = await this.query('organizations?order=created_at.desc');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch organizations:', err.message);
        return [];
      }
    }

    async getOrganization(orgId) {
      if (!orgId) return null;
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId);
        if (isUuid) {
          const data = await this.query(`organizations?id=eq.${encodeURIComponent(orgId)}&limit=1`);
          if (Array.isArray(data) && data.length > 0) return data[0];
        }
        // Try query by org_name
        const byName = await this.query(`organizations?org_name=eq.${encodeURIComponent(orgId)}&limit=1`);
        if (Array.isArray(byName) && byName.length > 0) return byName[0];

        // Search through all organizations with normalized comparison
        const all = await this.getOrganizations();
        if (Array.isArray(all) && all.length > 0) {
          const target = String(orgId).trim().toLowerCase();
          const match = all.find(o => {
            const n = (o.org_name || o.name || '').trim().toLowerCase();
            const s = (o.slug || o.org_id || '').trim().toLowerCase();
            const id = (o.id || '').trim().toLowerCase();
            return n === target || s === target || id === target || (n && target && (n.includes(target) || target.includes(n)));
          });
          if (match) return match;
        }
        return null;
      } catch (err) {
        console.error('[Supabase] Failed to fetch organization:', err.message);
        return null;
      }
    }

    async saveOrganization(orgData) {
      const payload = {
        id: orgData.id || undefined,
        org_name: orgData.org_name || orgData.org || orgData.name || 'FLAWLESS GRAPHICS',
        name: orgData.name || orgData.org_name || 'FLAWLESS GRAPHICS',
        admin_name: orgData.admin_name || orgData.name || orgData.fullName || 'Admin',
        email: (orgData.email || '').trim().toLowerCase(),
        phone: orgData.phone || null,
        address: orgData.address || null,
        logo_path: orgData.logo_path || orgData.logo || null,
        status: orgData.status || 'pending_approval',
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('organizations', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save organization:', err.message);
        throw err;
      }
    }

    async getPendingOrganizations() {
      try {
        const data = await this.query('organizations?status=eq.pending_approval&order=created_at.desc');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending organizations:', err.message);
        return [];
      }
    }

    async getApprovedOrganizations() {
      try {
        const data = await this.query('organizations?order=org_name.asc');
        if (!Array.isArray(data)) return [];
        return data.filter(org => {
          const st = (org.status || '').toLowerCase().trim();
          return st === 'approved' || st === 'active' || st === '';
        });
      } catch (err) {
        console.warn('[Supabase] Failed to fetch approved organizations:', err.message);
        return [];
      }
    }

    async approveOrganization(orgIdOrName) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgIdOrName);
        const endpoint = isUuid ? `organizations?id=eq.${encodeURIComponent(orgIdOrName)}` : `organizations?org_name=eq.${encodeURIComponent(orgIdOrName)}`;
        const res = await this.query(endpoint, 'PATCH', {
          status: 'Active',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve organization:', err.message);
        throw err;
      }
    }

    async rejectOrganization(orgIdOrName) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgIdOrName);
        const endpoint = isUuid ? `organizations?id=eq.${encodeURIComponent(orgIdOrName)}` : `organizations?org_name=eq.${encodeURIComponent(orgIdOrName)}`;
        const res = await this.query(endpoint, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject organization:', err.message);
        throw err;
      }
    }

    async deleteOrganization(orgIdOrName) {
      if (!orgIdOrName) return false;
      const cleanName = orgIdOrName.trim();
      if (cleanName.toUpperCase() === 'FLAWLESS GRAPHICS') {
        throw new Error('Root organization cannot be deleted.');
      }

      try {
        // Find org record to get both name and id
        const org = await this.getOrganization(cleanName);
        const orgName = org ? org.org_name : cleanName;
        const orgId = org ? org.id : cleanName;

        // 1. Cascade delete all domain records for this organization in Supabase
        await this.query(`students?org_id=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});
        await this.query(`teachers?org_id=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});
        await this.query(`classes?org_id=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});
        await this.query(`payroll?org_id=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});
        await this.query(`announcements?org_id=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});
        await this.query(`users?org=eq.${encodeURIComponent(orgName)}`, 'DELETE').catch(() => {});

        // 2. Delete the organization row itself
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId);
        const endpoint = isUuid ? `organizations?id=eq.${encodeURIComponent(orgId)}` : `organizations?org_name=eq.${encodeURIComponent(orgName)}`;
        await this.query(endpoint, 'DELETE');

        // 3. Purge corresponding localStorage keys
        try {
          const keysToPurge = [
            `${orgName}_academic_registration_approvals`,
            `${orgName}_teachers`,
            `${orgName}_classes`,
            `${orgName}_students`,
            `${orgName}_announcements`,
            `${orgName}_payroll`
          ];
          keysToPurge.forEach(k => localStorage.removeItem(k));

          const activeOrg = localStorage.getItem('active_org') || localStorage.getItem('activeOrg');
          if (activeOrg && activeOrg.toLowerCase() === orgName.toLowerCase()) {
            localStorage.removeItem('active_org');
            localStorage.removeItem('activeOrg');
            localStorage.removeItem('active_org_logo');
            localStorage.removeItem('org_logo');
          }
        } catch(e) {}

        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete organization:', err.message);
        throw err;
      }
    }

    /* =============================================================
       2. USERS & ACCESS CONTROL (AUTH / ROLES)
    ============================================================= */
    async getUsers(orgId = null) {
      try {
        let endpoint = 'users?order=created_at.desc';
        if (orgId) {
          endpoint += `&org=eq.${encodeURIComponent(orgId)}`;
        }
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch users:', err.message);
        return [];
      }
    }

    async getUserByEmail(email, orgId = null) {
      if (!email) return null;
      try {
        let endpoint = `users?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&limit=1`;
        if (orgId) {
          endpoint += `&org=eq.${encodeURIComponent(orgId)}`;
        }
        const data = await this.query(endpoint);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
      } catch (err) {
        console.error('[Supabase] Failed to fetch user by email:', err.message);
        return null;
      }
    }

    async saveUser(userData) {
      const email = (userData.email || '').trim().toLowerCase();
      const rawPass = userData.pass_hash || userData.password || userData.pass || undefined;
      const payload = {
        id: userData.id || ('u_' + Date.now()),
        org: userData.org || userData.org_id || 'FLAWLESS GRAPHICS',
        name: userData.name || userData.fullName || email.split('@')[0],
        email: email,
        pass_hash: rawPass,
        role: (userData.role || 'teacher').toLowerCase(),
        status: userData.status || 'pending_approval',
        designation: userData.designation || userData.position || '',
        department: userData.department || userData.dept || '',
        phone: userData.phone || '',
        photo_url: userData.photo_url || userData.photo || null,
        approved_at: userData.approved_at || null,
        approved_by: userData.approved_by || null,
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('users', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save user:', err.message);
        throw err;
      }
    }

    async deleteUser(userIdOrEmail) {
      if (!userIdOrEmail) return false;
      const cleanVal = String(userIdOrEmail).trim();
      if (cleanVal.toLowerCase() === 'admin@flawlessgraphics.com') {
        throw new Error('Root Super Administrator account cannot be deleted.');
      }

      try {
        let email = null;
        let endpoint = `users?id=eq.${encodeURIComponent(cleanVal)}`;

        if (cleanVal.includes('@')) {
          email = cleanVal.toLowerCase();
          endpoint = `users?email=eq.${encodeURIComponent(email)}`;
        } else {
          // Look up user to get email for cascading deletes
          const uData = await this.query(`users?id=eq.${encodeURIComponent(cleanVal)}&limit=1`).catch(() => []);
          if (Array.isArray(uData) && uData.length > 0 && uData[0].email) {
            email = uData[0].email.trim().toLowerCase();
          }
        }

        // 1. Delete user login row in Supabase
        await this.query(endpoint, 'DELETE');

        // 2. Cascade delete from teachers and students tables if linked by email
        if (email) {
          await this.query(`teachers?email=eq.${encodeURIComponent(email)}`, 'DELETE').catch(() => {});
          await this.query(`students?parent_email=eq.${encodeURIComponent(email)}`, 'DELETE').catch(() => {});
        }

        // 3. If currently logged in as this user in this browser, purge session immediately
        try {
          const activeUserStr = localStorage.getItem('active_user') || localStorage.getItem('active_org_user');
          if (activeUserStr) {
            const activeUser = JSON.parse(activeUserStr);
            if (activeUser && ((email && (activeUser.email || '').toLowerCase() === email) || activeUser.id === cleanVal)) {
              if (window.AuthSession && typeof window.AuthSession.logout === 'function') {
                window.AuthSession.logout(null);
              } else {
                ['active_org_user', 'active_user', 'activeHR', 'active_teacher', 'teacher_active_user', 'active_student', 'student_active_user'].forEach(k => localStorage.removeItem(k));
              }
            }
          }
        } catch(e) {}

        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete user:', err.message);
        throw err;
      }
    }

    async getPendingUsers(role = null, orgId = null) {
      try {
        let endpoint = 'users?status=eq.pending_approval&order=created_at.desc';
        if (role) endpoint += `&role=eq.${encodeURIComponent(role)}`;
        if (orgId) endpoint += `&org=eq.${encodeURIComponent(orgId)}`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending users:', err.message);
        return [];
      }
    }

    async approveUser(userIdOrEmail, approvedBy = 'Super Admin') {
      try {
        let endpoint = `users?id=eq.${encodeURIComponent(userIdOrEmail)}`;
        if (typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')) {
          endpoint = `users?email=eq.${encodeURIComponent(userIdOrEmail.trim().toLowerCase())}`;
        }
        const res = await this.query(endpoint, 'PATCH', {
          status: 'active',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0) {
          const u = res[0];
          if (u.role === 'teacher') {
            await this.query(`teachers?email=eq.${encodeURIComponent(u.email)}`, 'PATCH', {
              status: 'Active',
              updated_at: new Date().toISOString()
            }).catch(() => {});
          } else if (u.role === 'student') {
            await this.query(`students?email=eq.${encodeURIComponent(u.email)}`, 'PATCH', {
              status: 'Active',
              updated_at: new Date().toISOString()
            }).catch(() => {});
          }
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve user:', err.message);
        throw err;
      }
    }

    async rejectUser(userIdOrEmail, rejectedBy = 'Super Admin') {
      try {
        let endpoint = `users?id=eq.${encodeURIComponent(userIdOrEmail)}`;
        if (typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')) {
          endpoint = `users?email=eq.${encodeURIComponent(userIdOrEmail.trim().toLowerCase())}`;
        }
        const res = await this.query(endpoint, 'PATCH', {
          status: 'rejected',
          approved_by: rejectedBy,
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject user:', err.message);
        throw err;
      }
    }

    /**
     * Authenticate user directly against Supabase users table with full institutional approval checks
     */
    async authenticate(email, password, orgId = null, role = null) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) return { success: false, error: 'Email is required' };

      try {
        let endpoint = `users?email=eq.${encodeURIComponent(cleanEmail)}`;
        if (orgId) {
          endpoint += `&org=eq.${encodeURIComponent(orgId)}`;
        }
        const users = await this.query(endpoint);
        if (!Array.isArray(users) || users.length === 0) {
          return { success: false, error: 'Account not found in institutional database. Please register.' };
        }

        const user = users[0];

        // 1. Password check
        const storedPass = user.pass_hash || user.password;
        if (storedPass && storedPass !== password) {
          return { success: false, error: 'Invalid password. Please re-enter.' };
        }

        // 2. Role check
        if (role && user.role && user.role.toLowerCase() !== role.toLowerCase() && user.role.toLowerCase() !== 'superadmin' && user.role.toLowerCase() !== 'admin') {
          return { success: false, error: `Account role mismatch: expected ${role}, found ${user.role}.` };
        }

        // 3. Organization Approval check (Super Admin approves organisations)
        if (user.role !== 'admin' && user.org && user.org !== 'FLAWLESS GRAPHICS') {
          const orgData = await this.getOrganization(user.org);
          if (orgData) {
            const orgStatus = (orgData.status || '').toLowerCase();
            if (orgStatus === 'pending_approval' || orgStatus === 'pending') {
              return {
                success: false,
                status: 'pending_org',
                error: `Organisation '${orgData.org_name || orgData.name}' is pending approval by Super Admin Command.`
              };
            }
            if (orgStatus === 'rejected') {
              return {
                success: false,
                status: 'rejected_org',
                error: `Organisation '${orgData.org_name || orgData.name}' registration was declined.`
              };
            }
          }
        }

        // 4. User Status Approval check
        const userStatus = (user.status || 'pending_approval').toLowerCase();
        if (userStatus === 'pending_approval' || userStatus === 'pending') {
          if (user.role === 'hr') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Super Admin',
              error: 'HR Account is awaiting Super Admin authorization. You will be able to sign in once approved.'
            };
          } else if (user.role === 'teacher') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Teacher account is awaiting approval by Human Resources. Please contact your HR Directorate.'
            };
          } else if (user.role === 'finance' || user.role === 'bursar') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Finance account is awaiting approval by Human Resources. Please contact your HR Directorate.'
            };
          } else if (user.role === 'student') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Student admission is awaiting approval by Human Resources.'
            };
          } else {
            return {
              success: false,
              status: 'pending_approval',
              error: 'Account is pending administrative authorization.'
            };
          }
        }

        if (userStatus === 'rejected') {
          return {
            success: false,
            status: 'rejected',
            error: 'This account registration was declined.'
          };
        }

        return { success: true, user };
      } catch (err) {
        console.error('[Supabase] Authentication error:', err.message);
        return { success: false, error: err.message };
      }
    }

    /**
     * Sign up administrative or institutional account
     * Super admin seed is active, all others default to pending_approval
     */
    async signUp(email, password, metadata = {}) {
      const cleanEmail = (email || '').trim().toLowerCase();
      try {
        const role = (metadata.role || 'admin').toLowerCase();
        const isSuperAdminSeed = role === 'admin' && cleanEmail === 'admin@flawlessgraphics.com';
        const initialStatus = isSuperAdminSeed ? 'active' : 'pending_approval';

        const userRecord = await this.saveUser({
          email: cleanEmail,
          pass_hash: password,
          password: password,
          name: metadata.admin_name || metadata.name || cleanEmail.split('@')[0],
          org: metadata.org_name || 'FLAWLESS GRAPHICS',
          role: role,
          status: initialStatus
        });

        if (metadata.org_name) {
          await this.saveOrganization({
            org_name: metadata.org_name,
            name: metadata.org_name,
            admin_name: metadata.admin_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            logo_path: metadata.logo_path || null,
            status: isSuperAdminSeed ? 'Active' : 'pending_approval'
          }).catch(console.warn);
        }

        return {
          success: true,
          requiresVerification: false,
          user: userRecord,
          status: initialStatus,
          message: isSuperAdminSeed
            ? 'Root Super Admin account active.'
            : 'Registration submitted! Awaiting institutional approval.'
        };
      } catch (err) {
        console.error('[Supabase] Sign up error:', err.message);
        throw err;
      }
    }

    async signIn(email, password, orgId = null, role = null) {
      return this.authenticate(email, password, orgId, role);
    }

    async signOut() {
      if (window.AuthSession) {
        window.AuthSession.logout();
      }
      return { success: true };
    }

    async getSession() {
      const user = window.AuthSession ? window.AuthSession.getUser() : null;
      return user ? { user } : null;
    }

    /**
     * Real-time Email Authentication Dispatch
     * Sends official OTP to the user's email via Supabase GoTrue Auth OTP endpoint.
     */
    async sendEmailOtp(email, code, purpose = 'Two-Factor Authentication') {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) return { success: false, error: 'Email is required' };

      const baseUrl = Config.getUrl().replace(/\/$/, '');
      const key = Config.getAnonKey();

      let supabaseSent = false;
      let supabaseError = null;
      let directSent = false;

      // 1. Supabase GoTrue Auth OTP dispatch
      try {
        const res = await fetch(`${baseUrl}/auth/v1/otp`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: cleanEmail,
            create_user: true
          })
        });
        if (res.ok) {
          supabaseSent = true;
          console.info('[SupabaseService] Real-time Auth OTP email dispatched to:', cleanEmail);
        } else {
          const errData = await res.json().catch(() => ({}));
          supabaseError = errData.msg || errData.message || res.statusText;
          console.warn('[SupabaseService] Auth OTP dispatch notice:', supabaseError);
        }
      } catch (e) {
        supabaseError = e.message;
        console.warn('[SupabaseService] Supabase Auth OTP network exception:', e.message);
      }

      // 2. Direct Mailer Broadcast (for attached listeners and real-time event bus)
      try {
        if (window.RealtimeBus && typeof window.RealtimeBus.emit === 'function') {
          window.RealtimeBus.emit('auth:email_dispatched', {
            email: cleanEmail,
            code: code,
            purpose: purpose,
            timestamp: new Date().toISOString()
          });
        }
        directSent = true;
      } catch (_) {}

      return {
        success: supabaseSent || directSent,
        supabaseSent,
        supabaseError,
        email: cleanEmail
      };
    }

    /**
     * Verify OTP token against Supabase Auth GoTrue endpoint
     */
    async verifyEmailOtp(email, token, type = null) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanToken = (token || '').toString().trim().replace(/\s+/g, '');
      if (!cleanEmail || !cleanToken) return { success: false, error: 'Email and code are required' };

      const baseUrl = Config.getUrl().replace(/\/$/, '');
      const key = Config.getAnonKey();

      // In Supabase GoTrue Auth:
      // For existing users, /auth/v1/otp generates 'recovery' tokens ("User recovery requested")
      // For passwordless magic link / email OTP it generates 'email'
      // For unconfirmed signups it generates 'signup'
      const isNumericOtp = /^\d{6,10}$/.test(cleanToken);
      const types = isNumericOtp ? ['recovery', 'email', 'signup'] : ['recovery', 'email', 'signup', 'magiclink'];
      let lastError = null;

      for (const t of types) {
        try {
          const res = await fetch(`${baseUrl}/auth/v1/verify`, {
            method: 'POST',
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: cleanEmail,
              token: cleanToken,
              type: t
            })
          });
          const data = await res.json().catch(() => ({}));
          console.info(`[SupabaseAuth] Verification attempt (type: ${t}):`, res.status, data);
          if (res.ok) {
            if (data && data.access_token) {
              try {
                localStorage.setItem('fg_supabase_session', JSON.stringify(data));
                localStorage.setItem('fg_supabase_token', data.access_token);
              } catch (_) {}
            }
            return { success: true, data: data };
          } else {
            lastError = data.msg || data.message || data.error_description || null;
          }
        } catch (e) {
          lastError = e.message;
        }
      }

      return { success: false, error: lastError || 'Invalid or expired verification code.' };
    }

    /**
     * Alias for verifyEmailOtp to ensure compatibility with all auth callers
     */
    async verifyOtp(email, token, type = null) {
      return this.verifyEmailOtp(email, token, type);
    }

    /* =============================================================
       3. TEACHERS & FACULTY STAFF
    ============================================================= */
    async getPendingTeachers(orgId = null) {
      try {
        let endpoint = 'teachers?status=eq.pending_approval&order=created_at.desc';
        if (orgId) endpoint += `&org_id=eq.${encodeURIComponent(orgId)}`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending teachers:', err.message);
        return [];
      }
    }

    async approveTeacher(teacherId, approvedBy = 'Human Resources') {
      try {
        const res = await this.query(`teachers?id=eq.${encodeURIComponent(teacherId)}`, 'PATCH', {
          status: 'Active',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0 && res[0].email) {
          await this.query(`users?email=eq.${encodeURIComponent(res[0].email)}`, 'PATCH', {
            status: 'active',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
          }).catch(() => {});
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve teacher:', err.message);
        throw err;
      }
    }

    async rejectTeacher(teacherId) {
      try {
        const res = await this.query(`teachers?id=eq.${encodeURIComponent(teacherId)}`, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject teacher:', err.message);
        throw err;
      }
    }

    async getPendingStudents(orgId = null) {
      try {
        let endpoint = 'students?status=eq.pending_approval&order=created_at.desc';
        if (orgId) endpoint += `&org_id=eq.${encodeURIComponent(orgId)}`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending students:', err.message);
        return [];
      }
    }

    async approveStudent(studentIdOrEmailOrRoll, approvedBy = 'Human Resources') {
      try {
        let endpoint = `students?id=eq.${encodeURIComponent(studentIdOrEmailOrRoll)}`;
        if (typeof studentIdOrEmailOrRoll === 'string' && studentIdOrEmailOrRoll.includes('@')) {
          endpoint = `students?email=eq.${encodeURIComponent(studentIdOrEmailOrRoll.trim().toLowerCase())}`;
        } else if (typeof studentIdOrEmailOrRoll === 'string' && !studentIdOrEmailOrRoll.startsWith('s_') && !studentIdOrEmailOrRoll.startsWith('std_')) {
          endpoint = `students?roll=eq.${encodeURIComponent(studentIdOrEmailOrRoll)}`;
        }
        const res = await this.query(endpoint, 'PATCH', {
          status: 'Active',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0 && res[0].email) {
          await this.query(`users?email=eq.${encodeURIComponent(res[0].email)}`, 'PATCH', {
            status: 'active',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
          }).catch(() => {});
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve student:', err.message);
        throw err;
      }
    }

    async rejectStudent(studentIdOrEmailOrRoll) {
      try {
        let endpoint = `students?id=eq.${encodeURIComponent(studentIdOrEmailOrRoll)}`;
        if (typeof studentIdOrEmailOrRoll === 'string' && studentIdOrEmailOrRoll.includes('@')) {
          endpoint = `students?email=eq.${encodeURIComponent(studentIdOrEmailOrRoll.trim().toLowerCase())}`;
        } else if (typeof studentIdOrEmailOrRoll === 'string' && !studentIdOrEmailOrRoll.startsWith('s_') && !studentIdOrEmailOrRoll.startsWith('std_')) {
          endpoint = `students?roll=eq.${encodeURIComponent(studentIdOrEmailOrRoll)}`;
        }
        const res = await this.query(endpoint, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject student:', err.message);
        throw err;
      }
    }

    async getTeachers(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`teachers?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(e => ({
          id: e.id,
          fullName: e.full_name || e.name || 'Faculty Member',
          name: e.full_name || e.name || 'Faculty Member',
          department: e.department || 'General',
          dept: e.department || 'General',
          position: e.position || e.role || 'Educator',
          role: e.position || e.role || 'Educator',
          email: e.email || '',
          phone: e.phone || '',
          salary: Number(e.salary || 0),
          status: e.status || 'Active',
          photo: e.photo_url || e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          created_at: e.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch teachers:', err.message);
        return [];
      }
    }

    async saveTeacher(orgId, teacher) {
      const empName = teacher.fullName || teacher.name || 'Faculty Member';
      const empRole = teacher.position || teacher.role || 'Staff';
      const empDept = teacher.department || teacher.dept || 'General';

      const payload = {
        id: String(teacher.id || ('emp_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        full_name: empName,
        name: empName,
        department: empDept,
        position: empRole,
        role: empRole,
        email: teacher.email || '',
        phone: teacher.phone || '',
        salary: Number(teacher.salary || 0),
        status: teacher.status || 'Active',
        photo_url: teacher.photo || teacher.photo_url || null
      };

      try {
        const res = await this.query('teachers', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save teacher:', err.message);
        throw err;
      }
    }

    async deleteTeacher(orgId, teacherId) {
      try {
        let email = null;
        if (typeof teacherId === 'string' && teacherId.includes('@')) {
          email = teacherId.trim().toLowerCase();
        } else {
          const tRows = await this.query(`teachers?id=eq.${encodeURIComponent(teacherId)}&limit=1`).catch(() => []);
          if (Array.isArray(tRows) && tRows.length > 0 && tRows[0].email) {
            email = tRows[0].email.trim().toLowerCase();
          }
        }

        let endpoint = `teachers?id=eq.${encodeURIComponent(teacherId)}`;
        if (orgId) endpoint += `&org_id=eq.${encodeURIComponent(orgId)}`;
        await this.query(endpoint, 'DELETE');

        // Cascade delete linked user credentials from users table
        if (email) {
          await this.query(`users?email=eq.${encodeURIComponent(email)}`, 'DELETE').catch(() => {});
        }

        // Purge local cached teacher list
        try {
          if (orgId) {
            const raw = localStorage.getItem(`${orgId}_teachers`);
            if (raw) {
              const list = JSON.parse(raw).filter(t => t.id !== teacherId && (t.email || '').toLowerCase() !== (email || ''));
              localStorage.setItem(`${orgId}_teachers`, JSON.stringify(list));
            }
          }
        } catch(e) {}

        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete teacher:', err.message);
        throw err;
      }
    }

    /* =============================================================
       4. STUDENTS & COHORTS
    ============================================================= */
    async getStudents(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`students?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(s => ({
          id: s.id,
          roll: s.roll || s.roll_number || s.enrollment_code || 'STU-2026',
          name: s.full_name || s.student_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student',
          fullName: s.full_name || s.student_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student',
          firstName: s.first_name || (s.full_name || '').split(' ')[0] || '',
          lastName: s.last_name || (s.full_name || '').split(' ').slice(1).join(' ') || '',
          classId: s.class_id || '',
          className: s.class_name || '',
          grade: s.grade || s.grade_level || 'Level 100',
          gender: s.gender || 'Not Specified',
          status: s.status || 'Active',
          clearanceStatus: s.clearance_status || 'Cleared',
          approvalStatus: s.approval_status || 'approved',
          guardianName: s.guardian_name || s.parent_name || '',
          guardianPhone: s.guardian_phone || s.parent_phone || '',
          guardianEmail: s.guardian_email || s.parent_email || '',
          photo: s.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          created_at: s.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch students:', err.message);
        return [];
      }
    }

    async saveStudent(orgId, studentData) {
      const fullName = studentData.fullName || studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Student';
      const firstName = studentData.firstName || fullName.split(' ')[0] || '';
      const lastName = studentData.lastName || fullName.split(' ').slice(1).join(' ') || '';

      const payload = {
        id: (studentData.id && !isNaN(Number(studentData.id))) ? Number(studentData.id) : undefined,
        org_id: orgId || 'FLAWLESS GRAPHICS',
        roll: studentData.roll || studentData.roll_number || studentData.enrollment_code || ('STU-' + Math.floor(1000 + Math.random() * 9000)),
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        student_name: fullName,
        class_id: studentData.classId || studentData.class_id || null,
        class_name: studentData.className || studentData.class_name || null,
        grade: studentData.grade || studentData.grade_level || 'Level 100',
        gender: studentData.gender || null,
        guardian_name: studentData.guardianName || studentData.parent_name || null,
        guardian_phone: studentData.guardianPhone || studentData.parent_phone || null,
        guardian_email: studentData.guardianEmail || studentData.parent_email || null,
        clearance_status: studentData.clearanceStatus || studentData.clearance_status || 'Cleared',
        status: studentData.status || 'Active',
        approval_status: studentData.approvalStatus || studentData.approval_status || 'approved',
        photo_url: studentData.photo || studentData.photo_url || null,
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('students', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save student:', err.message);
        throw err;
      }
    }

    async deleteStudent(orgId, studentId) {
      try {
        let email = null;
        let endpoint = `students?id=eq.${encodeURIComponent(studentId)}`;
        if (typeof studentId === 'string' && studentId.includes('@')) {
          email = studentId.trim().toLowerCase();
          endpoint = `students?email=eq.${encodeURIComponent(email)}`;
        } else if (typeof studentId === 'string' && !studentId.startsWith('s_') && !studentId.startsWith('std_') && isNaN(Number(studentId))) {
          endpoint = `students?roll=eq.${encodeURIComponent(studentId)}`;
        }
        if (orgId) endpoint += `&org_id=eq.${encodeURIComponent(orgId)}`;

        const sRows = await this.query(endpoint + '&limit=1').catch(() => []);
        if (Array.isArray(sRows) && sRows.length > 0) {
          email = (sRows[0].email || sRows[0].parent_email || '').trim().toLowerCase();
        }

        await this.query(endpoint, 'DELETE');

        // Cascade delete linked user login credentials if exists
        if (email) {
          await this.query(`users?email=eq.${encodeURIComponent(email)}`, 'DELETE').catch(() => {});
        }

        // Purge local storage cached student list
        try {
          if (orgId) {
            const raw = localStorage.getItem(`${orgId}_students`);
            if (raw) {
              const list = JSON.parse(raw).filter(s => s.id !== studentId && s.roll !== studentId && (s.guardianEmail || s.parent_email || s.email || '').toLowerCase() !== (email || ''));
              localStorage.setItem(`${orgId}_students`, JSON.stringify(list));
            }
          }
        } catch(e) {}

        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete student:', err.message);
        throw err;
      }
    }

    /* =============================================================
       5. CLASSES & COHORTS
    ============================================================= */
    async getClasses(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`classes?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(c => ({
          id: c.id,
          name: c.name || c.class_name || 'Class Cohort',
          className: c.name || c.class_name || 'Class Cohort',
          code: c.code || '',
          gradeLevel: c.grade_level || '',
          section: c.section || 'A',
          room: c.room || 'Room 101',
          teacherId: c.teacher_id || '',
          teacherName: c.teacher_name || 'Assigned Instructor',
          capacity: Number(c.capacity || 35),
          academicYear: c.academic_year || '2026/2027',
          status: c.status || 'Active'
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch classes:', err.message);
        return [];
      }
    }

    async saveClass(orgId, classData) {
      const name = classData.name || classData.className || 'Class Cohort';
      const payload = {
        id: String(classData.id || ('cls_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        name: name,
        class_name: name,
        code: classData.code || ('CLS-' + Math.floor(100 + Math.random() * 900)),
        grade_level: classData.gradeLevel || classData.grade_level || classData.grade || 'Level 100',
        section: classData.section || 'A',
        room: classData.room || 'Room 101',
        teacher_id: classData.teacherId || classData.teacher_id || null,
        teacher_name: classData.teacherName || classData.teacher_name || null,
        capacity: Number(classData.capacity || 35),
        academic_year: classData.academicYear || classData.academic_year || '2026/2027',
        status: classData.status || 'Active',
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('classes', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save class:', err.message);
        throw err;
      }
    }

    async deleteClass(orgId, classId) {
      try {
        await this.query(`classes?id=eq.${encodeURIComponent(classId)}&org_id=eq.${encodeURIComponent(orgId)}`, 'DELETE');

        try {
          if (orgId) {
            const raw = localStorage.getItem(`${orgId}_classes`);
            if (raw) {
              const list = JSON.parse(raw).filter(c => c.id !== classId);
              localStorage.setItem(`${orgId}_classes`, JSON.stringify(list));
            }
          }
        } catch(e) {}

        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete class:', err.message);
        throw err;
      }
    }

    /* =============================================================
       6. ATTENDANCE & BIOMETRIC PUNCHES
    ============================================================= */
    async getAttendance(orgId = 'FLAWLESS GRAPHICS', date = null, classId = null) {
      try {
        let endpoint = `attendance_records?org_id=eq.${encodeURIComponent(orgId)}&order=date.desc,created_at.desc`;
        if (date) endpoint += `&date=eq.${encodeURIComponent(date)}`;
        if (classId) endpoint += `&class_id=eq.${encodeURIComponent(classId)}`;

        const data = await this.query(endpoint);
        if (!Array.isArray(data)) return [];

        return data.map(r => ({
          id: r.id,
          teacherName: r.teacher_name,
          teacherId: r.teacher_id,
          studentName: r.student_name,
          studentId: r.student_id,
          className: r.class_name,
          classId: r.class_id,
          department: r.department,
          date: r.date,
          checkIn: r.check_in || r.in_time,
          checkOut: r.check_out || r.out_time,
          hours: r.hours || r.duration,
          status: r.status || 'Present',
          remarks: r.remarks || '',
          recordsJson: r.records_json
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch attendance:', err.message);
        return [];
      }
    }

    async saveAttendance(orgId, record) {
      const payload = {
        id: String(record.id || ('att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5))),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        teacher_name: record.teacherName || record.teacher_name || null,
        teacher_id: record.teacherId || record.teacher_id || null,
        student_name: record.studentName || record.student_name || null,
        student_id: record.studentId || record.student_id || null,
        class_name: record.className || record.class_name || null,
        class_id: record.classId || record.class_id || null,
        department: record.department || null,
        date: record.date || new Date().toISOString().split('T')[0],
        check_in: record.checkIn || record.check_in || record.in_time || null,
        check_out: record.checkOut || record.check_out || record.out_time || null,
        hours: record.hours || record.duration || null,
        status: record.status || 'Present',
        remarks: record.remarks || '',
        records_json: record.recordsJson || record.records_json || null
      };

      try {
        const res = await this.query('attendance_records', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save attendance:', err.message);
        throw err;
      }
    }

    /* =============================================================
       7. BURSARY, FEES & FINANCIAL TRANSACTIONS
    ============================================================= */
    async getStudentFees(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`student_fees?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(f => ({
          id: f.id,
          studentId: f.student_id,
          name: f.student_name,
          studentName: f.student_name,
          grade: f.grade || 'Level 100',
          cat: f.category || f.cat || 'Tuition Fee',
          category: f.category || f.cat || 'Tuition Fee',
          billed: Number(f.billed_amount || f.billed || 0),
          amount: Number(f.paid_amount || f.amount || 0),
          paid: Number(f.paid_amount || f.amount || 0),
          balance: Number(f.balance_amount || 0),
          status: f.status || 'Cleared',
          academicTerm: f.academic_term || 'Term 2',
          academicYear: f.academic_year || '2026/2027',
          date: f.date || new Date().toISOString().split('T')[0]
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch student fees:', err.message);
        return [];
      }
    }

    async saveStudentFee(orgId, feeData) {
      const billed = Number(feeData.billed || feeData.billed_amount || feeData.amount || 0);
      const paid = Number(feeData.amount || feeData.paid_amount || feeData.paid || 0);
      const balance = Math.max(0, billed - paid);

      const payload = {
        id: String(feeData.id || ('fee_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        student_id: feeData.studentId || feeData.student_id || null,
        student_name: feeData.name || feeData.studentName || feeData.student_name || 'Student',
        grade: feeData.grade || 'Level 100',
        category: feeData.cat || feeData.category || 'Tuition Fee',
        cat: feeData.cat || feeData.category || 'Tuition Fee',
        billed_amount: billed,
        billed: billed,
        paid_amount: paid,
        amount: paid,
        balance_amount: balance,
        status: feeData.status || (balance === 0 ? 'Cleared' : 'Pending'),
        academic_term: feeData.academicTerm || feeData.academic_term || 'Term 2',
        academic_year: feeData.academicYear || feeData.academic_year || '2026/2027',
        date: feeData.date || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('student_fees', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save student fee:', err.message);
        throw err;
      }
    }

    async getTransactions(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`transactions?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(t => ({
          id: t.id,
          studentId: t.student_id,
          studentName: t.student_name,
          category: t.category || 'Tuition Payment',
          amount: Number(t.amount || 0),
          paymentMethod: t.payment_method || 'Mobile Money',
          receiptNumber: t.receipt_number || ('RCT-' + Math.floor(100000 + Math.random() * 900000)),
          phone: t.phone || '',
          notes: t.notes || '',
          status: t.status || 'Certified Paid',
          createdAt: t.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch transactions:', err.message);
        return [];
      }
    }

    async saveTransaction(orgId, txData) {
      const payload = {
        id: String(txData.id || ('txn_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        student_id: txData.studentId || txData.student_id || null,
        student_name: txData.studentName || txData.student_name || 'Payer',
        category: txData.category || 'Tuition Payment',
        amount: Number(txData.amount || 0),
        payment_method: txData.paymentMethod || txData.payment_method || 'Mobile Money',
        receipt_number: txData.receiptNumber || txData.receipt_number || ('RCT-' + Math.floor(100000 + Math.random() * 900000)),
        phone: txData.phone || '',
        notes: txData.notes || '',
        status: txData.status || 'Certified Paid'
      };

      try {
        const res = await this.query('transactions', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save transaction:', err.message);
        throw err;
      }
    }

    /* =============================================================
       8. FACULTY & STAFF PAYROLL
    ============================================================= */
    async getPayroll(orgId = 'FLAWLESS GRAPHICS', payPeriod = null) {
      try {
        let endpoint = `payroll?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`;
        if (payPeriod) endpoint += `&pay_period=eq.${encodeURIComponent(payPeriod)}`;

        const data = await this.query(endpoint);
        if (!Array.isArray(data)) return [];

        return data.map(p => ({
          id: p.id,
          staffId: p.staff_id,
          name: p.staff_name || p.name || 'Faculty Member',
          staffName: p.staff_name || p.name || 'Faculty Member',
          role: p.role || 'Educator',
          dept: p.department || p.dept || 'Academic',
          department: p.department || p.dept || 'Academic',
          gross: Number(p.gross_salary || p.gross || 0),
          grossSalary: Number(p.gross_salary || p.gross || 0),
          allowance: Number(p.teaching_allowance || 450),
          ssnit: Number(p.ssnit_deduction || 0),
          tax: Number(p.tax_deduction || 0),
          net: Number(p.net_salary || 0),
          payPeriod: p.pay_period || 'Current Month',
          status: p.status || 'Pending Approval',
          approved: Boolean(p.approved),
          created_at: p.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch payroll:', err.message);
        return [];
      }
    }

    async savePayroll(orgId, payrollData) {
      const gross = Number(payrollData.gross || payrollData.grossSalary || payrollData.gross_salary || 0);
      const allowance = Number(payrollData.allowance || payrollData.teaching_allowance || 450);
      const ssnit = Number(payrollData.ssnit || payrollData.ssnit_deduction || (gross * 0.055));
      const tax = Number(payrollData.tax || payrollData.tax_deduction || (gross * 0.1));
      const net = gross + allowance - (ssnit + tax);

      const payload = {
        id: String(payrollData.id || ('pay_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        staff_id: payrollData.staffId || payrollData.staff_id || null,
        staff_name: payrollData.name || payrollData.staffName || payrollData.staff_name || 'Faculty Member',
        name: payrollData.name || payrollData.staffName || payrollData.staff_name || 'Faculty Member',
        role: payrollData.role || 'Educator',
        department: payrollData.department || payrollData.dept || 'Academic',
        dept: payrollData.department || payrollData.dept || 'Academic',
        gross_salary: gross,
        gross: gross,
        teaching_allowance: allowance,
        ssnit_deduction: ssnit,
        tax_deduction: tax,
        net_salary: net,
        pay_period: payrollData.payPeriod || payrollData.pay_period || 'Current Month',
        status: payrollData.status || 'Pending Approval',
        approved: Boolean(payrollData.approved)
      };

      try {
        const res = await this.query('payroll', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save payroll:', err.message);
        throw err;
      }
    }

    /* =============================================================
       9. ANNOUNCEMENTS & OFFICIAL DIRECTIVES
    ============================================================= */
    async getAnnouncements(orgId = 'FLAWLESS GRAPHICS') {
      try {
        const data = await this.query(`announcements?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (!Array.isArray(data)) return [];

        return data.map(a => ({
          id: a.id,
          title: a.title,
          body: a.body || a.text || '',
          text: a.body || a.text || '',
          author: a.author || 'Administrator',
          role: a.role || 'admin',
          category: a.category || 'General',
          priority: a.priority || 'Normal',
          pinned: Boolean(a.pinned),
          targetAudience: a.target_audience || 'all',
          date: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          created_at: a.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch announcements:', err.message);
        return [];
      }
    }

    async saveAnnouncement(orgId, annData) {
      const payload = {
        id: String(annData.id || ('ann_' + Date.now())),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        title: annData.title || 'Institutional Announcement',
        body: annData.body || annData.text || '',
        text: annData.body || annData.text || '',
        author: annData.author || 'Administrator',
        role: annData.role || 'admin',
        category: annData.category || 'General',
        priority: annData.priority || 'Normal',
        pinned: Boolean(annData.pinned),
        target_audience: annData.targetAudience || annData.target_audience || 'all'
      };

      try {
        const res = await this.query('announcements', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save announcement:', err.message);
        throw err;
      }
    }

    async deleteAnnouncement(orgId, annId) {
      try {
        await this.query(`announcements?id=eq.${encodeURIComponent(annId)}&org_id=eq.${encodeURIComponent(orgId)}`, 'DELETE');
        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete announcement:', err.message);
        throw err;
      }
    }

    /* =============================================================
       10. ACTIVITY STREAM & AUDIT LOGS
    ============================================================= */
    async getActivityStream(orgId = 'FLAWLESS GRAPHICS', limit = 50) {
      try {
        const data = await this.query(`activity_stream?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc&limit=${limit}`);
        if (!Array.isArray(data)) return [];

        return data.map(act => ({
          id: act.id,
          type: act.event_type,
          text: act.description || act.text,
          description: act.description || act.text,
          author: act.author,
          role: act.role,
          severity: act.severity || 'INFO',
          time: act.created_at,
          created_at: act.created_at
        }));
      } catch (err) {
        console.error('[Supabase] Failed to fetch activity stream:', err.message);
        return [];
      }
    }

    async logActivity(orgId, activity) {
      const payload = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        org_id: orgId || 'FLAWLESS GRAPHICS',
        event_type: activity.type || activity.event_type || 'ACTIVITY',
        description: activity.text || activity.description || 'System event',
        text: activity.text || activity.description || 'System event',
        author: activity.author || activity.teacher || activity.student || 'System',
        role: activity.role || 'user',
        severity: activity.severity || 'INFO',
        payload: activity.payload || null
      };

      try {
        await this.query('activity_stream', 'POST', payload);
      } catch (err) {
        console.warn('[Supabase] Could not log activity stream:', err.message);
      }

      return payload;
    }

    /* =============================================================
       11. SUPABASE STORAGE (IMAGE & ASSET UPLOADS)
    ============================================================= */
    getPublicUrl(bucket, path) {
      if (!Config.isConfigured() || !bucket || !path) return '';
      const baseUrl = Config.getUrl().replace(/\/$/, '');
      const cleanPath = path.replace(/^\//, '');
      return `${baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
    }

    async uploadImage(bucket, fileOrBase64, customPath = null) {
      if (!Config.isConfigured()) {
        return { success: false, url: (typeof fileOrBase64 === 'string' ? fileOrBase64 : '') };
      }

      try {
        const client = this.getClient();
        const fileName = customPath || (`img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`);

        if (client && client.storage) {
          let fileData = fileOrBase64;
          if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
            const arr = fileOrBase64.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            fileData = new Blob([u8arr], { type: mime });
          }

          const { data, error } = await client.storage
            .from(bucket)
            .upload(fileName, fileData, { upsert: true });

          if (error) throw error;
          const { data: urlData } = client.storage.from(bucket).getPublicUrl(fileName);
          return { success: true, path: fileName, url: urlData?.publicUrl || this.getPublicUrl(bucket, fileName) };
        }

        // REST API Fallback
        const baseUrl = Config.getUrl().replace(/\/$/, '');
        const key = Config.getAnonKey();
        let bodyData = fileOrBase64;
        let contentType = 'image/jpeg';

        if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
          const arr = fileOrBase64.split(',');
          contentType = arr[0].match(/:(.*?);/)[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          bodyData = u8arr.buffer;
        }

        const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${fileName}`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': contentType,
            'x-upsert': 'true'
          },
          body: bodyData
        });

        if (res.ok) {
          const pubUrl = this.getPublicUrl(bucket, fileName);
          return { success: true, path: fileName, url: pubUrl };
        } else {
          return { success: false, url: typeof fileOrBase64 === 'string' ? fileOrBase64 : '' };
        }
      } catch (err) {
        console.warn('Storage upload error:', err.message);
        return { success: false, error: err.message, url: typeof fileOrBase64 === 'string' ? fileOrBase64 : '' };
      }
    }
  }

  // Instantiate and export as global singleton
  window.SupabaseService = new SupabaseRestClient();
})(window);
