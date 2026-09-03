/**
 * toaster.js
 * Centralized, Modern Pop-up Toaster Notification Engine
 * FLAWLESS GRAPHICS — LUCY™ Management System
 */

(function(window) {
  'use strict';

  let container = null;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.getElementById('toasterContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toasterContainer';
        container.className = 'toaster-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    info: 'fa-solid fa-circle-info',
    warning: 'fa-solid fa-triangle-exclamation'
  };

  const Toaster = {
    /**
     * Display a customized toast notification
     * @param {Object} options { type, title, message, duration, onClick }
     */
    show: function(options = {}) {
      const type = options.type || 'info';
      const title = options.title || (type.charAt(0).toUpperCase() + type.slice(1));
      const message = options.message || '';
      const duration = options.duration !== undefined ? options.duration : 4000;
      const iconClass = options.icon || ICONS[type] || ICONS.info;

      const parent = ensureContainer();

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;
      toast.setAttribute('role', 'alert');

      toast.innerHTML = `
        <div class="toast-body">
          <div class="toast-icon">
            <i class="${iconClass}"></i>
          </div>
          <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
          </div>
          <button class="toast-close" type="button" aria-label="Close notification">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        ${duration > 0 ? `
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

      // Optional toast click callback
      if (typeof options.onClick === 'function') {
        toast.addEventListener('click', () => {
          options.onClick();
          dismiss();
        });
      }

      startTimer();
      return { dismiss };
    },

    success: function(title, message, duration) {
      return this.show({ type: 'success', title, message, duration });
    },

    error: function(title, message, duration) {
      return this.show({ type: 'error', title, message, duration });
    },

    info: function(title, message, duration) {
      return this.show({ type: 'info', title, message, duration });
    },

    warning: function(title, message, duration) {
      return this.show({ type: 'warning', title, message, duration });
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
})(window);
