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
    }
  };

  window.SupabaseConfig = SupabaseConfig;
})(window);
