/**
 * toaster.js
 * Centralized, Modern Pop-up Toaster Notification Engine
 * FLAWLESS GRAPHICS — LUCY™ Management System
 */

(function(window) {
  'use strict';

  const SETTINGS_KEY = 'lucy_toast_settings';

  const DEFAULT_SETTINGS = {
    enabled: true,
    position: 'top-center', // 'top-center' standard default matching user settings
    duration: 4000,        // ms, 0 means persistent
    sound: true,           // Web Audio synthesizer chime
    dnd: false,            // Do Not Disturb mode
    showProgress: true,    // Bottom countdown bar
    allowedTypes: {
      success: true,
      info: true,
      warning: true,
      error: true
    }
  };

  function loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically sync legacy 'top-right' default to 'top-center' matching user specification
        if (parsed.position === 'top-right') {
          parsed.position = 'top-center';
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(Object.assign({}, DEFAULT_SETTINGS, parsed)));
          } catch (e) {}
        }
        return Object.assign({}, DEFAULT_SETTINGS, parsed);
      } else {
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        } catch (e) {}
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  let settings = loadSettings();
  let container = null;

  function ensureStylesheet() {
    if (typeof document === 'undefined') return;
    if (!document.querySelector('link[href*="toaster.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const path = (window.location && window.location.pathname) ? window.location.pathname.replace(/\\/g, '/') : '';
      const isSub = path.includes('/pages/');
      link.href = isSub ? '../../assets/css/toaster.css' : 'assets/css/toaster.css';
      if (document.head) {
        document.head.appendChild(link);
      }
    }
  }

  function ensureContainer() {
    ensureStylesheet();
    settings = loadSettings();
    if (typeof document === 'undefined' || !document.body) return null;
    if (!container || !document.body.contains(container)) {
      container = document.getElementById('toasterContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toasterContainer';
        document.body.appendChild(container);
      }
    }
    // Sync position class
    const posClass = `pos-${settings.position || 'top-center'}`;
    container.className = `toaster-container ${posClass}`;
    return container;
  }

  const ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    troubleshoot: 'fa-solid fa-triangle-exclamation',
    solution: 'fa-solid fa-lightbulb',
    info: 'fa-solid fa-circle-info',
    warning: 'fa-solid fa-triangle-exclamation'
  };

  /**
   * Synthesize audio chime with Web Audio API (Zero external assets, works 100% offline)
   */
  function playChime(type = 'success') {
    if (!settings.sound || settings.dnd) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'error' || type === 'troubleshoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // High-end pleasant two-tone glass chime (D5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      // AudioContext blocked or unsupported
    }
  }

  // Storage and cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === SETTINGS_KEY) {
      settings = loadSettings();
      ensureContainer();
    }
  });

  window.addEventListener('lucy_toast_settings_changed', (e) => {
    if (e.detail) {
      settings = Object.assign({}, settings, e.detail);
      ensureContainer();
    }
  });

  const Toaster = {
    getSettings: function() {
      settings = loadSettings();
      return Object.assign({}, settings);
    },

    updateSettings: function(newConfig) {
      settings = Object.assign({}, loadSettings(), newConfig);
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {}
      ensureContainer();
      try {
        window.dispatchEvent(new CustomEvent('lucy_toast_settings_changed', { detail: settings }));
      } catch (e) {}
      return Object.assign({}, settings);
    },

    playChime: function(type = 'success') {
      settings = loadSettings();
      playChime(type);
    },

    clearAll: function() {
      const parent = ensureContainer();
      const items = parent.querySelectorAll('.toast-item');
      items.forEach(el => {
        el.classList.remove('show');
        el.classList.add('hide');
        setTimeout(() => el.remove(), 250);
      });
    },

    /**
     * Display a customized toast notification
     * @param {Object} options { type, title, message, duration, onClick, force }
     */
    show: function(options = {}) {
      settings = loadSettings();
      if (!settings.enabled && !options.force) return null;

      const type = options.type || 'info';

      // Check DND / Filter settings (allow errors and troubleshoot to bypass DND)
      if (settings.dnd && type !== 'error' && type !== 'troubleshoot' && !options.force) {
        return null;
      }
      if (settings.allowedTypes && settings.allowedTypes[type] === false && !options.force) {
        return null;
      }

      const isErrorLike = type === 'error' || type === 'troubleshoot';
      const isWarning = type === 'warning';
      const isSolution = type === 'solution';
      const hasTroubleshoot = !!(
        options.troubleshoot || 
        options.warningHint || 
        options.caution || 
        options.solution || 
        (options.steps && options.steps.length) || 
        options.error || 
        options.action || 
        type === 'troubleshoot' || 
        type === 'solution'
      );
      const troubleshootText = typeof options.troubleshoot === 'string' ? options.troubleshoot : '';
      const detailText = options.caution || options.warningHint || options.solution || troubleshootText;
      const steps = Array.isArray(options.steps) ? options.steps : (options.steps ? [options.steps] : []);
      const errorDetails = options.error || '';

      const defaultTitle = isWarning ? 'Attention Required' : (isErrorLike ? 'Action Error' : (type.charAt(0).toUpperCase() + type.slice(1)));
      const title = options.title || defaultTitle;
      const message = options.message || '';

      // Respect user's saved toast settings across all callers in the project
      let duration;
      if (options.forceDuration && options.duration !== undefined) {
        duration = options.duration;
      } else if (settings.duration === 0) {
        // User configured sticky mode (manual dismiss)
        duration = 0;
      } else if (hasTroubleshoot) {
        duration = Math.max(settings.duration || 4000, 7000);
      } else if (settings.duration !== undefined) {
        duration = settings.duration;
      } else {
        duration = options.duration !== undefined ? options.duration : (isWarning ? 5000 : 4000);
      }

      const showProgress = (settings.showProgress === false) ? false : (options.showProgress !== undefined ? options.showProgress : true);
      const iconClass = options.icon || ICONS[type] || (isErrorLike ? ICONS.troubleshoot : (isWarning ? ICONS.warning : ICONS.info));

      const parent = ensureContainer();
      const toast = document.createElement('div');

      toast.className = `toast-item toast-${type}${hasTroubleshoot ? (isSolution ? ' toast-solution' : (isWarning ? ' toast-warning-detailed' : ' toast-troubleshoot')) : ''}`;
      toast.setAttribute('role', 'alert');

      let actionsHtml = '';
      if (hasTroubleshoot) {
        let drawerTitle = 'Troubleshooting & Fix:';
        let drawerIcon = 'fa-wrench';
        let drawerBtnLabel = 'Troubleshoot';
        let actionBtnBg = '#2563eb';
        let actionBtnColor = '#ffffff';

        if (isSolution) {
          drawerTitle = 'Action Solution & Quick Fix:';
          drawerIcon = 'fa-lightbulb';
          drawerBtnLabel = 'Solution';
          actionBtnBg = '#f59e0b';
        } else if (isWarning) {
          drawerTitle = 'Advisory & Caution Notes:';
          drawerIcon = 'fa-triangle-exclamation';
          drawerBtnLabel = 'Advisory';
          actionBtnBg = '#d97706';
        }

        let customActionBtnHtml = '';
        if (options.action) {
          const btnLabel = options.action.label || (isWarning ? 'Review Warning' : 'Fix Now');
          const btnIcon = options.action.icon || (isWarning ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-arrow-pointer');
          customActionBtnHtml = `
            <button type="button" class="toast-action-btn toast-btn-custom-action" style="background:${actionBtnBg}; color:${actionBtnColor}; border-color:${actionBtnBg}; font-weight:800;">
              <i class="${btnIcon}"></i> <span>${escapeHtml(btnLabel)}</span>
            </button>
          `;
        }

        const hasDrawerContent = !!(detailText || steps.length || errorDetails);

        actionsHtml = `
          <div class="toast-actions-bar">
            ${customActionBtnHtml}
            ${hasDrawerContent ? `
              <button type="button" class="toast-action-btn toast-btn-troubleshoot" title="Click to toggle recommendations and details">
                <i class="fa-solid ${drawerIcon}"></i> <span>${drawerBtnLabel}</span>
              </button>
            ` : ''}
            ${options.onRetry ? `
              <button type="button" class="toast-action-btn toast-btn-retry" title="Retry operation">
                <i class="fa-solid fa-rotate-right"></i> <span>Retry</span>
              </button>
            ` : ''}
            ${options.copyable !== false && (errorDetails || detailText) ? `
              <button type="button" class="toast-action-btn toast-btn-copy" title="Copy diagnostic details to clipboard">
                <i class="fa-regular fa-copy"></i> <span>Copy Log</span>
              </button>
            ` : ''}
          </div>
          ${hasDrawerContent ? `
            <div class="toast-troubleshoot-drawer${(isSolution || (isWarning && (detailText || steps.length)) || options.autoOpenDrawer) ? ' open' : ''}">
              <div class="drawer-title"><i class="fa-solid ${drawerIcon}"></i> ${drawerTitle}</div>
              ${detailText ? `<div class="drawer-hint">${escapeHtml(detailText)}</div>` : ''}
              ${steps.length ? `
                <ul class="drawer-steps">
                  ${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              ` : ''}
              ${errorDetails ? `<div class="drawer-error-code">${escapeHtml(errorDetails)}</div>` : ''}
            </div>
          ` : ''}
        `;
      }

      toast.innerHTML = `
        <div class="toast-body">
          <div class="toast-icon">
            <i class="${iconClass}"></i>
          </div>
          <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
            ${actionsHtml}
          </div>
          <button class="toast-close" type="button" aria-label="Close notification">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        ${duration > 0 && showProgress ? `
          <div class="toast-progress">
            <div class="toast-progress-bar"></div>
          </div>
        ` : ''}
      `;

      parent.appendChild(toast);

      // Trigger entrance
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Sound chime
      playChime(type);

      let timeoutId = null;
      let startTime = Date.now();
      let remaining = duration;
      const progressBar = toast.querySelector('.toast-progress-bar');

      function startTimer() {
        if (duration <= 0) return;
        startTime = Date.now();
        if (progressBar) {
          progressBar.style.transition = `transform ${remaining}ms linear`;
          progressBar.style.transform = 'scaleX(0)';
        }
        timeoutId = setTimeout(() => {
          dismiss();
        }, remaining);
      }

      function pauseTimer() {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
          remaining -= (Date.now() - startTime);
          if (progressBar) {
            const computedWidth = window.getComputedStyle(progressBar).transform;
            progressBar.style.transition = 'none';
            progressBar.style.transform = computedWidth;
          }
        }
      }

      function dismiss() {
        if (timeoutId) clearTimeout(timeoutId);
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 360);
      }

      // Hover to pause
      toast.addEventListener('mouseenter', pauseTimer);
      toast.addEventListener('mouseleave', () => {
        if (remaining > 0) startTimer();
      });

      // Close button
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismiss();
        });
      }

      // Interactive Troubleshooting Actions
      if (hasTroubleshoot) {
        const customActionBtn = toast.querySelector('.toast-btn-custom-action');
        if (customActionBtn && options.action && typeof options.action.onClick === 'function') {
          customActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
              options.action.onClick(toast, dismiss);
            } catch (err) {
              console.warn('Error executing custom toast action:', err);
              dismiss();
            }
          });
        }

        const tbBtn = toast.querySelector('.toast-btn-troubleshoot');
        const drawer = toast.querySelector('.toast-troubleshoot-drawer');
        if (tbBtn && drawer) {
          tbBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = drawer.classList.toggle('open');
            pauseTimer(); // Keep open while user investigates
            if (isOpen) {
              tbBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> <span>Hide Steps</span>';
            } else {
              tbBtn.innerHTML = '<i class="fa-solid fa-wrench"></i> <span>Troubleshoot</span>';
            }
            if (typeof options.onTroubleshoot === 'function') {
              options.onTroubleshoot(drawer, isOpen);
            }
          });
        }

        const retryBtn = toast.querySelector('.toast-btn-retry');
        if (retryBtn && typeof options.onRetry === 'function') {
          retryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            retryBtn.disabled = true;
            retryBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Retrying...</span>';
            try {
              options.onRetry();
            } finally {
              dismiss();
            }
          });
        }

        const copyBtn = toast.querySelector('.toast-btn-copy');
        if (copyBtn) {
          copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const report = [
              `[ERROR REPORT - ${new Date().toISOString()}]`,
              `Title: ${title}`,
              `Message: ${message}`,
              troubleshootText ? `Troubleshoot: ${troubleshootText}` : '',
              steps.length ? `Steps:\n${steps.map((s, i) => `  ${i+1}. ${s}`).join('\n')}` : '',
              errorDetails ? `Details: ${errorDetails}` : ''
            ].filter(Boolean).join('\n');

            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(report).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
                setTimeout(() => {
                  copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Copy Log</span>';
                }, 1800);
              });
            } else {
              prompt('Diagnostic Report (Ctrl+C to copy):', report);
            }
          });
        }
      }

      // Optional toast click callback (only if click wasn't on an action button)
      if (typeof options.onClick === 'function') {
        toast.addEventListener('click', (e) => {
          if (e.target.closest('.toast-actions-bar, .toast-troubleshoot-drawer, .toast-close')) return;
          options.onClick();
          dismiss();
        });
      }

      startTimer();
      return { dismiss, el: toast };
    },

    success: function(title, message, duration) {
      return this.show({ type: 'success', title, message, duration });
    },

    error: function(title, message, durationOrOptions) {
      if (typeof durationOrOptions === 'object' && durationOrOptions !== null) {
        return this.show(Object.assign({ type: 'error', title, message }, durationOrOptions));
      }
      return this.show({ type: 'error', title, message, duration: durationOrOptions });
    },

    troubleshoot: function(titleOrOptions, message, troubleshootHint, steps) {
      if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
        return this.show(Object.assign({ type: 'troubleshoot' }, titleOrOptions));
      }
      return this.show({
        type: 'troubleshoot',
        title: titleOrOptions || 'System Malfunction',
        message: message || '',
        troubleshoot: troubleshootHint || '',
        steps: Array.isArray(steps) ? steps : (steps ? [steps] : []),
        duration: 8000
      });
    },

    info: function(title, message, duration) {
      return this.show({ type: 'info', title, message, duration });
    },

    warning: function(titleOrOptions, message, optionsOrDuration) {
      if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
        let opts = Object.assign({ type: 'warning' }, titleOrOptions);
        if (opts.target && !opts.action) {
          opts.action = {
            label: opts.actionLabel || 'Inspect Item',
            icon: 'fa-solid fa-arrow-pointer',
            onClick: (toastEl, dismiss) => {
              const el = document.querySelector(opts.target);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
                el.style.transition = 'all 0.3s ease';
                el.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 16px rgba(245, 158, 11, 0.25)';
                el.style.borderColor = '#f59e0b';
                setTimeout(() => {
                  el.style.boxShadow = '';
                  el.style.borderColor = '';
                }, 2500);
              }
              if (typeof dismiss === 'function') dismiss();
            }
          };
        }
        return this.show(opts);
      }

      let opts = {};
      if (typeof optionsOrDuration === 'number') {
        opts.duration = optionsOrDuration;
      } else if (typeof optionsOrDuration === 'object' && optionsOrDuration !== null) {
        opts = Object.assign({}, optionsOrDuration);
      }

      if (opts.target && !opts.action) {
        opts.action = {
          label: opts.actionLabel || 'Inspect Item',
          icon: 'fa-solid fa-arrow-pointer',
          onClick: (toastEl, dismiss) => {
            const el = document.querySelector(opts.target);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
              el.style.transition = 'all 0.3s ease';
              el.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 16px rgba(245, 158, 11, 0.25)';
              el.style.borderColor = '#f59e0b';
              setTimeout(() => {
                el.style.boxShadow = '';
                el.style.borderColor = '';
              }, 2500);
            }
            if (typeof dismiss === 'function') dismiss();
          }
        };
      }

      const defaultTitle = message ? (titleOrOptions || 'Attention Required') : 'Attention Required';
      const actualMessage = message !== undefined ? message : (titleOrOptions || '');

      return this.show(Object.assign({
        type: 'warning',
        title: defaultTitle,
        message: actualMessage,
        duration: opts.duration !== undefined ? opts.duration : 5000
      }, opts));
    },

    warn: function(titleOrOptions, message, optionsOrDuration) {
      return this.warning(titleOrOptions, message, optionsOrDuration);
    },

    solution: function(options = {}) {
      let opts = options;
      if (typeof options === 'string') {
        opts = { message: options };
      }
      const title = opts.title || 'Incomplete Action Detected';
      const message = opts.message || 'Please complete the required fields to proceed.';
      const solutionText = opts.solution || opts.troubleshoot || 'Fill in the required inputs and try again.';
      const steps = opts.steps || [];
      const target = opts.target || opts.fixTarget;

      let action = opts.action;
      if (!action && target) {
        action = {
          label: 'Fix Missing Field',
          icon: 'fa-solid fa-arrow-pointer',
          onClick: (toastEl, dismiss) => {
            const el = document.querySelector(target);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
              el.style.transition = 'all 0.3s ease';
              el.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.5), 0 0 16px rgba(245, 158, 11, 0.25)';
              el.style.borderColor = '#f59e0b';
              setTimeout(() => {
                el.style.boxShadow = '';
                el.style.borderColor = '';
              }, 2500);
            }
            if (typeof dismiss === 'function') dismiss();
          }
        };
      }

      return this.troubleshoot(Object.assign({
        type: 'solution',
        title: title,
        message: message,
        troubleshoot: solutionText,
        steps: steps,
        action: action,
        autoOpenDrawer: true,
        copyable: false,
        duration: opts.duration || 7000
      }, opts));
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Auto-init container when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureContainer);
  } else {
    ensureContainer();
  }

    window.Toaster = Toaster;

  // Universal Global Bridge for showToast across the entire system
  window.showToast = function(msg, type = 'success', options = {}) {
    if (typeof options !== 'object' || options === null) options = {};
    const t = typeof type === 'string' ? type.toLowerCase() : 'success';
    if (t === 'troubleshoot' || options.troubleshoot) {
      return Toaster.troubleshoot(Object.assign({ message: msg }, options));
    }
    const titles = {
      success: 'Action Saved',
      info: 'System Notice',
      warning: 'Attention',
      error: 'Operational Error'
    };
    return Toaster.show(Object.assign({
      type: t,
      title: options.title || titles[t] || 'Notification',
      message: msg
    }, options));
  };

  // Universal Global Bridge for error notifications with troubleshooting
  window.showErrorToast = function(title, msg, troubleshootHint, steps, error) {
    return Toaster.troubleshoot({
      title: title || 'Operational Error',
      message: msg || '',
      troubleshoot: troubleshootHint || 'An unexpected operational error occurred.',
      steps: steps || [],
      error: error || ''
    });
  };

  // Universal Global Bridge for solution / incomplete action notifications with easy fixing
  window.showActionSolutionToast = function(actionName, reason, solution, steps = [], target = null) {
    return Toaster.solution({
      title: `Incomplete Action: ${actionName}`,
      message: reason,
      solution: solution,
      steps: steps,
      target: target
    });
  };

  // Universal Global Bridge for warning notifications
  window.showWarningToast = function(titleOrMsg, messageOrOptions, options = {}) {
    if (typeof titleOrMsg === 'object' && titleOrMsg !== null) {
      return Toaster.warning(titleOrMsg);
    }
    if (messageOrOptions === undefined) {
      return Toaster.warning({ title: 'Attention Required', message: String(titleOrMsg || '') });
    }
    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      return Toaster.warning(Object.assign({ title: 'Attention Required', message: String(titleOrMsg || '') }, messageOrOptions));
    }
    if (typeof options === 'number') {
      options = { duration: options };
    }
    return Toaster.warning(Object.assign({
      title: titleOrMsg || 'Attention Required',
      message: messageOrOptions || ''
    }, options));
  };

  // Quick warning toast shorthand
  window.warnToast = function(msg, duration = 4000) {
    return window.showWarningToast('Attention Required', msg, { duration });
  };

  // Global toast helper alias
  window.toast = function(msg, duration = 3000, type = 'success') {
    return window.showToast(msg, type, { duration });
  };

  // Convert browser alerts on saved actions into stylish Toaster notifications
  if (typeof window !== 'undefined') {
    const _nativeAlert = window.alert;
    window.alert = function(msg) {
      const text = String(msg || '');
      if (window.Toaster && typeof window.Toaster.show === 'function') {
        const isSuccess = /saved|success|enrolled|completed|transmitted|admitted|updated|done|scheduled|recorded|approved|cleared/i.test(text);
        const isError = /error|invalid|failed|unauthorized|expired/i.test(text);
        const isWarn = /please|provide|fill|required|choose|under|exceed/i.test(text);
        if (isSuccess) {
          window.Toaster.success('Action Saved', text);
          return;
        } else if (isError) {
          window.Toaster.error('System Notice', text);
          return;
        } else if (isWarn) {
          window.Toaster.warning('Required Information', text);
          return;
        } else {
          window.Toaster.info('Notification', text);
          return;
        }
      }
      if (_nativeAlert) _nativeAlert(msg);
    };
  }
})(window);
