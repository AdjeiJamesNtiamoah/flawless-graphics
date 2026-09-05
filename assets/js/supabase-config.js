/**
 * supabase-config.js
 * Supabase Project Configuration for FLAWLESS GRAPHICS — LUCY™ Management System
 * Account / Project: AdjeiJamesNtiamoah
 */

(function(window) {
  'use strict';

  // Storage keys for dynamic in-browser credential overrides
  const STORAGE_KEY_URL = 'fg_supabase_url';
  const STORAGE_KEY_ANON = 'fg_supabase_anon_key';
  const STORAGE_KEY_SYNC = 'fg_supabase_auto_sync';

  // Default / Template Credentials for AdjeiJamesNtiamoah
  // Users can also enter or override these directly from the Cloud Sync UI modal
  const DEFAULT_CONFIG = {
    // Replace with your actual project URL from: https://supabase.com/dashboard/project/_/settings/api
    projectUrl: '', 
    // Replace with your anon public key from: https://supabase.com/dashboard/project/_/settings/api
    anonKey: '',
    projectOwner: 'AdjeiJamesNtiamoah',
    autoSync: true
  };

  const SupabaseConfig = {
    /**
     * Get the active Supabase Project URL
     */
    getUrl: function() {
      return (localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_CONFIG.projectUrl || '').trim();
    },

    /**
     * Get the active Supabase Anon Key
     */
    getAnonKey: function() {
      return (localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_CONFIG.anonKey || '').trim();
    },

    /**
     * Check if auto sync is enabled
     */
    isAutoSync: function() {
      const val = localStorage.getItem(STORAGE_KEY_SYNC);
      return val === null ? DEFAULT_CONFIG.autoSync : val === 'true';
    },

    /**
     * Check if valid Supabase credentials have been configured
     */
    isConfigured: function() {
      const url = this.getUrl();
      const key = this.getAnonKey();
      return Boolean(url && key && url.includes('supabase.co') && key.length > 20);
    },

    /**
     * Save / override Supabase credentials in localStorage
     */
    saveCredentials: function(url, anonKey, autoSync = true) {
      if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
      if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
      localStorage.setItem(STORAGE_KEY_SYNC, String(autoSync));
      
      // Dispatch event to notify all listening components
      window.dispatchEvent(new CustomEvent('fg:supabase-config-changed', {
        detail: { url: this.getUrl(), configured: this.isConfigured() }
      }));

      return this.isConfigured();
    },

    /**
     * Clear custom credentials
     */
    resetCredentials: function() {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_ANON);
      localStorage.removeItem(STORAGE_KEY_SYNC);

      window.dispatchEvent(new CustomEvent('fg:supabase-config-changed', {
        detail: { configured: false }
      }));
    },

    /**
     * Test connection to the configured Supabase endpoint
     */
    testConnection: async function(testUrl = null, testKey = null) {
      const url = (testUrl || this.getUrl()).replace(/\/$/, '');
      const key = testKey || this.getAnonKey();

      if (!url || !key) {
        return { success: false, error: 'Please enter both the Supabase Project URL and Anon Public Key.' };
      }

      if (!url.startsWith('https://') || !url.includes('supabase.co')) {
        return { success: false, error: 'Project URL must start with "https://" and end with ".supabase.co"' };
      }

      try {
        // Query the root REST OpenAPI schema to verify URL and API key validity
        const res = await fetch(`${url}/rest/v1/?apikey=${key}`, {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });

        if (res.ok) {
          return { success: true, status: res.status, message: 'Successfully connected to Supabase project!' };
        } else if (res.status === 401 || res.status === 403) {
          return { success: false, status: res.status, error: 'Invalid API Key or unauthorized access.' };
        } else {
          return { success: false, status: res.status, error: `Supabase server responded with status: ${res.status} ${res.statusText}` };
        }
      } catch (err) {
        return { success: false, error: `Network error connecting to Supabase: ${err.message}` };
      }
    },

    /**
     * Open Global Supabase Configuration Modal (Accessible anywhere)
     */
    openConfigModal: function() {
      let modal = document.getElementById('fgSupabaseConfigModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fgSupabaseConfigModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;';
        
        modal.innerHTML = `
          <div style="background:#1e1b4b;border:1px solid rgba(114,239,221,0.3);border-radius:18px;max-width:520px;width:100%;padding:28px;color:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);box-sizing:border-box;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:42px;height:42px;border-radius:12px;background:rgba(114,239,221,0.15);color:#72efdd;display:flex;align-items:center;justify-content:center;font-size:20px;">
                  ⚡
                </div>
                <div>
                  <h3 style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Supabase Project Settings</h3>
                  <div style="font-size:12px;color:rgba(255,255,255,0.6);">Configure remote database & auth connection</div>
                </div>
              </div>
              <button type="button" id="fgCloseModalBtn" style="background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:22px;cursor:pointer;line-height:1;padding:4px;">&times;</button>
            </div>

            <div id="fgStatusBadge" style="margin-bottom:16px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;"></div>

            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:#a2e8dd;">Project URL</label>
              <input type="text" id="fgModalUrl" placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;outline:none;">
            </div>

            <div style="margin-bottom:18px;">
              <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:#a2e8dd;">Anon Public Key</label>
              <input type="password" id="fgModalKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;outline:none;">
            </div>

            <div id="fgTestFeedback" style="display:none;padding:10px 12px;border-radius:8px;font-size:12px;margin-bottom:16px;"></div>

            <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap;">
              <button type="button" id="fgResetBtn" style="background:rgba(239,68,68,0.15);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;margin-right:auto;">Reset / Disconnect</button>
              <button type="button" id="fgTestBtn" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;">Test Connection</button>
              <button type="button" id="fgSaveBtn" style="background:#72efdd;color:#0f172a;border:none;padding:8px 18px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:700;">Save & Connect</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        document.getElementById('fgCloseModalBtn').onclick = () => {
          modal.style.display = 'none';
        };
        modal.onclick = (e) => {
          if (e.target === modal) modal.style.display = 'none';
        };

        const testFeedback = document.getElementById('fgTestFeedback');

        document.getElementById('fgTestBtn').onclick = async () => {
          const u = document.getElementById('fgModalUrl').value.trim();
          const k = document.getElementById('fgModalKey').value.trim();
          testFeedback.style.display = 'block';
          testFeedback.style.background = 'rgba(255,255,255,0.08)';
          testFeedback.style.color = '#fff';
          testFeedback.innerHTML = 'Testing connection to Supabase...';

          const res = await SupabaseConfig.testConnection(u, k);
          if (res.success) {
            testFeedback.style.background = 'rgba(16,185,129,0.2)';
            testFeedback.style.color = '#6ee7b7';
            testFeedback.innerHTML = '✓ ' + res.message;
          } else {
            testFeedback.style.background = 'rgba(239,68,68,0.2)';
            testFeedback.style.color = '#fca5a5';
            testFeedback.innerHTML = '✕ ' + (res.error || 'Connection failed');
          }
        };

        document.getElementById('fgSaveBtn').onclick = () => {
          const u = document.getElementById('fgModalUrl').value.trim();
          const k = document.getElementById('fgModalKey').value.trim();
          if (!u || !k) {
            alert('Please enter both Supabase URL and Anon Key.');
            return;
          }
          SupabaseConfig.saveCredentials(u, k, true);
          testFeedback.style.display = 'block';
          testFeedback.style.background = 'rgba(16,185,129,0.2)';
          testFeedback.style.color = '#6ee7b7';
          testFeedback.innerHTML = '✓ Credentials saved! Supabase connected.';
          setTimeout(() => {
            modal.style.display = 'none';
          }, 1000);
        };

        document.getElementById('fgResetBtn').onclick = () => {
          if (confirm('Disconnect Supabase and revert to local storage?')) {
            SupabaseConfig.resetCredentials();
            document.getElementById('fgModalUrl').value = '';
            document.getElementById('fgModalKey').value = '';
            SupabaseConfig.openConfigModal();
          }
        };
      }

      // Populate current values
      document.getElementById('fgModalUrl').value = SupabaseConfig.getUrl();
      document.getElementById('fgModalKey').value = SupabaseConfig.getAnonKey();

      const badge = document.getElementById('fgStatusBadge');
      if (SupabaseConfig.isConfigured()) {
        badge.style.background = 'rgba(16,185,129,0.15)';
        badge.style.color = '#6ee7b7';
        badge.style.border = '1px solid rgba(16,185,129,0.3)';
        badge.innerHTML = '● Supabase Cloud Active (' + SupabaseConfig.getUrl().replace('https://', '').split('.')[0] + ')';
      } else {
        badge.style.background = 'rgba(245,158,11,0.15)';
        badge.style.color = '#fcd34d';
        badge.style.border = '1px solid rgba(245,158,11,0.3)';
        badge.innerHTML = '○ Offline / Local Storage Mode (Supabase not configured)';
      }

      document.getElementById('fgTestFeedback').style.display = 'none';
      modal.style.display = 'flex';
    }
  };

  window.SupabaseConfig = SupabaseConfig;
})(window);

