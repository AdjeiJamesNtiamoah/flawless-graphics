/**
 * supabase-client.js
 * Centralized Supabase Integration & Bi-Directional Cloud Sync Bridge
 * FLAWLESS GRAPHICS — LUCY™ Management System
 */

(function(window) {
  'use strict';

  // Ensure config is loaded
  const Config = window.SupabaseConfig || {
    getUrl: () => '',
    getAnonKey: () => '',
    isConfigured: () => false,
    isAutoSync: () => true
  };

  /**
   * Safe JSON parse helper
   */
  function safeParse(str, fallback = []) {
    try {
      const res = JSON.parse(str);
      return res !== null ? res : fallback;
    } catch (e) {
      return fallback;
    }
  }

  /**
   * Internal REST Client for Supabase PostgREST API
   * Works with zero external dependencies, or binds to window.supabase if loaded
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
          console.info('Supabase JS SDK initialized');
        } catch (e) {
          console.warn('Supabase SDK initialization failed, using REST fallback:', e);
          this.client = null;
        }
      }
    }

    /**
     * Standard REST fetch request to Supabase PostgREST endpoint
     */
    async query(endpoint, method = 'GET', body = null, extraHeaders = {}) {
      if (!Config.isConfigured()) {
        throw new Error('Supabase project is not configured. Please set your Supabase URL and Anon Key in Settings.');
      }

      const url = `${Config.getUrl().replace(/\/$/, '')}/rest/v1/${endpoint}`;
      const key = Config.getAnonKey();

      const headers = Object.assign({
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }, extraHeaders);

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

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

    /* -------------------------------------------------------------
       1. EMPLOYEES CLOUD SYNC
    ------------------------------------------------------------- */
    async getEmployees(orgId = 'FLAWLESS GRAPHICS') {
      const localKey = `${orgId}_employees`;
      const localData = safeParse(localStorage.getItem(localKey), []);

      if (!Config.isConfigured()) {
        return localData;
      }

      try {
        const cloudData = await this.query(`employees?org_id=eq.${encodeURIComponent(orgId)}&order=created_at.desc`);
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          // Normalize column names
          const normalized = cloudData.map(e => ({
            id: e.id,
            fullName: e.full_name || e.name,
            name: e.full_name || e.name,
            department: e.department,
            dept: e.department,
            position: e.position || e.role,
            role: e.position || e.role,
            email: e.email,
            phone: e.phone,
            salary: Number(e.salary || 0),
            status: e.status || 'Active',
            photo: e.photo_url || e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          }));

          // Cache in localStorage for offline availability
          localStorage.setItem(localKey, JSON.stringify(normalized));
          return normalized;
        } else if (localData.length > 0 && Config.isAutoSync()) {
          // Push initial local seed to cloud
          this.migrateEmployees(orgId, localData).catch(console.warn);
          return localData;
        }
        return localData;
      } catch (err) {
        console.warn('Could not fetch cloud employees, falling back to local storage:', err.message);
        return localData;
      }
    }

    async saveEmployee(orgId, employee) {
      const localKey = `${orgId}_employees`;
      let localData = safeParse(localStorage.getItem(localKey), []);
      
      const empName = employee.fullName || employee.name || '';
      const empRole = employee.position || employee.role || 'Staff';
      const empDept = employee.department || employee.dept || 'General';

      const payload = {
        id: String(employee.id || ('emp_' + Date.now())),
        org_id: orgId,
        full_name: empName,
        department: empDept,
        position: empRole,
        email: employee.email || '',
        phone: employee.phone || '',
        salary: Number(employee.salary || 0),
        status: employee.status || 'Active',
        photo_url: employee.photo || null
      };

      // 1. Update local cache immediately
      const existingIdx = localData.findIndex(e => e.id === payload.id);
      if (existingIdx >= 0) {
        localData[existingIdx] = Object.assign({}, localData[existingIdx], employee);
      } else {
        localData.unshift(employee);
      }
      localStorage.setItem(localKey, JSON.stringify(localData));

      // 2. Cloud sync if configured (with adaptive schema fallbacks)
      if (Config.isConfigured()) {
        try {
          await this.query('employees', 'POST', payload, {
            'Prefer': 'resolution=merge-duplicates,return=representation'
          });
        } catch (err) {
          const msg = (err.message || '').toLowerCase();
          // If the remote table requires legacy 'name' column or doesn't have 'full_name'
          if (msg.includes('name') || msg.includes('not-null') || msg.includes('full_name') || msg.includes('role')) {
            try {
              const legacyPayload = Object.assign({}, payload, {
                name: empName,
                role: empRole
              });
              await this.query('employees', 'POST', legacyPayload, {
                'Prefer': 'resolution=merge-duplicates,return=representation'
              });
            } catch (err2) {
              console.warn('Cloud sync error saving employee (retry failed):', err2.message);
            }
          } else {
            console.warn('Cloud sync error saving employee:', err.message);
          }
        }
      }

      return employee;
    }

    async deleteEmployee(orgId, employeeId) {
      const localKey = `${orgId}_employees`;
      let localData = safeParse(localStorage.getItem(localKey), []);
      localData = localData.filter(e => e.id !== employeeId);
      localStorage.setItem(localKey, JSON.stringify(localData));

      if (Config.isConfigured()) {
        try {
          await this.query(`employees?id=eq.${encodeURIComponent(employeeId)}&org_id=eq.${encodeURIComponent(orgId)}`, 'DELETE');
        } catch (err) {
          console.warn('Cloud sync error deleting employee:', err.message);
        }
      }
    }

    async migrateEmployees(orgId, employees) {
      if (!Config.isConfigured() || !Array.isArray(employees) || employees.length === 0) return;
      const rows = employees.map(e => ({
        id: String(e.id || ('emp_' + Date.now() + Math.random().toString(36).substring(2, 5))),
        org_id: orgId,
        full_name: e.fullName || e.name || '',
        department: e.department || e.dept || 'Staff',
        position: e.position || e.role || 'Personnel',
        email: e.email || '',
        phone: e.phone || '',
        salary: Number(e.salary || 0),
        status: e.status || 'Active',
        photo_url: e.photo || null
      }));

      try {
        await this.query('employees', 'POST', rows, {
          'Prefer': 'resolution=merge-duplicates'
        });
      } catch (err) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('name') || msg.includes('not-null') || msg.includes('full_name') || msg.includes('role')) {
          try {
            const legacyRows = rows.map(r => Object.assign({}, r, {
              name: r.full_name,
              role: r.position
            }));
            await this.query('employees', 'POST', legacyRows, {
              'Prefer': 'resolution=merge-duplicates'
            });
          } catch (err2) {
            console.warn('migrateEmployees retry failed:', err2.message);
          }
        } else {
          console.warn('migrateEmployees error:', err.message);
        }
      }
    }

    /* -------------------------------------------------------------
       2. ATTENDANCE CLOUD SYNC
    ------------------------------------------------------------- */
    async getAttendance(orgId = 'FLAWLESS GRAPHICS', date = null) {
      const localKey = `${orgId}_attendance_records`;
      const localData = safeParse(localStorage.getItem(localKey), []);

      if (!Config.isConfigured()) {
        return date ? localData.filter(r => r.date === date) : localData;
      }

      try {
        let endpoint = `attendance_records?org_id=eq.${encodeURIComponent(orgId)}&order=date.desc,check_in.desc`;
        if (date) endpoint += `&date=eq.${encodeURIComponent(date)}`;

        const cloudData = await this.query(endpoint);
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          const normalized = cloudData.map(r => ({
            id: r.id,
            employeeName: r.employee_name,
            department: r.department,
            date: r.date,
            checkIn: r.check_in,
            checkOut: r.check_out,
            hours: r.hours,
            status: r.status,
            remarks: r.remarks
          }));

          if (!date) {
            localStorage.setItem(localKey, JSON.stringify(normalized));
          }
          return normalized;
        }
        return date ? localData.filter(r => r.date === date) : localData;
      } catch (err) {
        console.warn('Could not fetch cloud attendance:', err.message);
        return date ? localData.filter(r => r.date === date) : localData;
      }
    }

    async saveAttendance(orgId, record) {
      const localKey = `${orgId}_attendance_records`;
      let localData = safeParse(localStorage.getItem(localKey), []);

      const payload = {
        id: record.id || ('att_' + Date.now()),
        org_id: orgId,
        employee_name: record.employeeName,
        department: record.department,
        date: record.date,
        check_in: record.checkIn,
        check_out: record.checkOut,
        hours: record.hours,
        status: record.status,
        remarks: record.remarks || ''
      };

      const idx = localData.findIndex(r => r.id === payload.id || (r.employeeName === payload.employee_name && r.date === payload.date));
      if (idx >= 0) {
        localData[idx] = Object.assign({}, localData[idx], record);
      } else {
        localData.unshift(record);
      }
      localStorage.setItem(localKey, JSON.stringify(localData));

      if (Config.isConfigured()) {
        try {
          await this.query('attendance_records', 'POST', payload, {
            'Prefer': 'resolution=merge-duplicates'
          });
        } catch (err) {
          console.warn('Cloud sync error saving attendance punch:', err.message);
        }
      }

      return record;
    }

    /* -------------------------------------------------------------
       3. BULK DATA MIGRATION TO SUPABASE
    ------------------------------------------------------------- */
    async migrateAllLocalToCloud(orgId = 'FLAWLESS GRAPHICS') {
      if (!Config.isConfigured()) {
        throw new Error('Supabase is not configured. Please enter your project credentials first.');
      }

      const results = { employees: 0, attendance: 0, performance: 0 };

      // 1. Employees
      const emps = safeParse(localStorage.getItem(`${orgId}_employees`), []);
      if (emps.length > 0) {
        await this.migrateEmployees(orgId, emps);
        results.employees = emps.length;
      }

      // 2. Attendance
      const atts = safeParse(localStorage.getItem(`${orgId}_attendance_records`), []);
      if (atts.length > 0) {
        const attRows = atts.map(r => ({
          id: r.id || ('att_' + Date.now() + Math.random().toString(36).substring(2, 5)),
          org_id: orgId,
          employee_name: r.employeeName,
          department: r.department || 'Staff',
          date: r.date,
          check_in: r.checkIn || null,
          check_out: r.checkOut || null,
          hours: r.hours || null,
          status: r.status || 'Present',
          remarks: r.remarks || null
        }));
        await this.query('attendance_records', 'POST', attRows, { 'Prefer': 'resolution=merge-duplicates' });
        results.attendance = atts.length;
      }

      // 3. Performance
      const perfs = safeParse(localStorage.getItem(`${orgId}_performance_reviews`), []);
      if (perfs.length > 0) {
        const perfRows = perfs.map(p => ({
          id: p.id || ('perf_' + Date.now() + Math.random().toString(36).substring(2, 5)),
          org_id: orgId,
          employee_name: p.employeeName,
          department: p.department || 'Staff',
          position: p.position || 'Staff',
          kpi: Number(p.kpi || 90),
          rating: p.rating || '4.8',
          grade: p.grade || 'Exceeds Standards',
          date: p.date || new Date().toISOString().split('T')[0]
        }));
        await this.query('performance_reviews', 'POST', perfRows, { 'Prefer': 'resolution=merge-duplicates' });
        results.performance = perfs.length;
      }

      return results;
    }

    /* -------------------------------------------------------------
       4. ORGANIZATIONS CLOUD SYNC & REGISTRATION
    ------------------------------------------------------------- */
    async getOrganizations() {
      if (!Config.isConfigured()) return [];
      try {
        const cloudData = await this.query('organizations?order=created_at.desc');
        return Array.isArray(cloudData) ? cloudData : [];
      } catch (err) {
        console.warn('Could not fetch organizations from Supabase:', err.message);
        return [];
      }
    }

    async saveOrganization(orgData) {
      if (!Config.isConfigured()) return null;

      const payload = {
        org_name: orgData.org_name || orgData.org || 'FLAWLESS GRAPHICS',
        admin_name: orgData.admin_name || orgData.name || orgData.fullName || 'Admin',
        email: (orgData.email || '').trim().toLowerCase(),
        logo_path: orgData.logo_path || orgData.logo || null,
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('organizations', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return res;
      } catch (err) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('name') || msg.includes('owner') || msg.includes('logo')) {
          try {
            const legacyPayload = {
              org_name: payload.org_name,
              name: payload.org_name,
              admin_name: payload.admin_name,
              owner_name: payload.admin_name,
              email: payload.email,
              owner_email: payload.email,
              logo_path: payload.logo_path,
              logo_url: payload.logo_path,
              updated_at: payload.updated_at
            };
            const res2 = await this.query('organizations', 'POST', legacyPayload, {
              'Prefer': 'resolution=merge-duplicates,return=representation'
            });
            return res2;
          } catch (err2) {
            console.warn('Cloud sync error saving organization (retry failed):', err2.message);
            return null;
          }
        }
        console.warn('Cloud sync error saving organization:', err.message);
        return null;
      }
    }

    /* -------------------------------------------------------------
       5. AUTHENTICATION & USER VERIFICATION
    ------------------------------------------------------------- */
    getClient() {
      if (!this.client && window.supabase && typeof window.supabase.createClient === 'function' && Config.isConfigured()) {
        this.initClient();
      }
      return this.client;
    }

    /**
     * Sign Up with Email & Password + metadata
     * Triggers Supabase Auth signup and verification email
     */
    async signUp(email, password, metadata = {}, redirectTo = null) {
      if (!Config.isConfigured()) {
        throw new Error('Supabase is not configured. Please enter project URL and Anon Key.');
      }

      const client = this.getClient();
      const cleanEmail = email.trim().toLowerCase();
      const redirect = redirectTo || (window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'site-login.html?verified=true');

      if (client) {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: metadata,
            emailRedirectTo: redirect
          }
        });

        if (error) throw error;

        const emailConfirmed = Boolean(data.user && data.user.email_confirmed_at);
        const requiresVerification = Boolean(data.user && !data.session && !emailConfirmed);

        return {
          user: data.user,
          session: data.session,
          requiresVerification,
          message: requiresVerification 
            ? `Verification email sent to ${cleanEmail}. Please check your inbox or spam folder.` 
            : 'Account registered successfully!'
        };
      }

      // REST Fallback if JS SDK is unavailable
      const authUrl = `${Config.getUrl().replace(/\/$/, '')}/auth/v1/signup`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'apikey': Config.getAnonKey(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          data: metadata
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.message || data.error_description || 'Signup failed');
      }

      const requiresVerification = !data.access_token;
      return {
        user: data.user || data,
        session: data.access_token ? data : null,
        requiresVerification,
        message: requiresVerification
          ? `Verification email sent to ${cleanEmail}. Please check your inbox.`
          : 'Account registered successfully!'
      };
    }

    /**
     * Sign In with Email & Password
     */
    async signIn(email, password) {
      if (!Config.isConfigured()) {
        throw new Error('Supabase is not configured.');
      }

      const client = this.getClient();
      const cleanEmail = email.trim().toLowerCase();

      if (client) {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) throw error;
        return { user: data.user, session: data.session };
      }

      // REST Fallback
      const authUrl = `${Config.getUrl().replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'apikey': Config.getAnonKey(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || data.message || 'Login failed');
      }

      return { user: data.user, session: data };
    }

    /**
     * Verify OTP token (6-digit numeric code sent to email)
     */
    async verifyOtp(email, token, type = 'signup') {
      if (!Config.isConfigured()) throw new Error('Supabase is not configured.');

      const client = this.getClient();
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      if (client) {
        const { data, error } = await client.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: type
        });

        if (error) throw error;
        return { user: data.user, session: data.session };
      }

      // REST Fallback
      const authUrl = `${Config.getUrl().replace(/\/$/, '')}/auth/v1/verify`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'apikey': Config.getAnonKey(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          token: cleanToken,
          email: cleanEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.message || data.error_description || 'OTP verification failed');
      }

      return { user: data.user, session: data };
    }

    /**
     * Resend verification email
     */
    async resendVerification(email) {
      if (!Config.isConfigured()) throw new Error('Supabase is not configured.');

      const client = this.getClient();
      const cleanEmail = email.trim().toLowerCase();

      if (client) {
        const { data, error } = await client.auth.resend({
          type: 'signup',
          email: cleanEmail
        });

        if (error) throw error;
        return { success: true, data };
      }

      // REST Fallback
      const authUrl = `${Config.getUrl().replace(/\/$/, '')}/auth/v1/resend`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'apikey': Config.getAnonKey(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'signup',
          email: cleanEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.message || data.error_description || 'Failed to resend confirmation email');
      }

      return { success: true, data };
    }

    /**
     * Sign Out
     */
    async signOut() {
      const client = this.getClient();
      if (client) {
        await client.auth.signOut().catch(() => {});
      }
    }

    /**
     * Get Current Active Session
     */
    async getSession() {
      const client = this.getClient();
      if (client) {
        const { data } = await client.auth.getSession();
        return data ? data.session : null;
      }
      return null;
    }

    /**
     * Get Current Authenticated User
     */
    async getCurrentUser() {
      const client = this.getClient();
      if (client) {
        const { data } = await client.auth.getUser();
        return data ? data.user : null;
      }
      return null;
    }

    /**
     * Listen to Auth State Changes
     */
    onAuthStateChange(callback) {
      const client = this.getClient();
      if (client && typeof client.auth.onAuthStateChange === 'function') {
        return client.auth.onAuthStateChange(callback);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }

  // Instantiate and export globally
  window.SupabaseService = new SupabaseRestClient();
})(window);
