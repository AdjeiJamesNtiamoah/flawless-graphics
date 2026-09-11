/**
 * FLAWLESS GRAPHICS — FLOATING 3-DOTS QUICK DOCK COMPONENT
 * Self-contained floating bottom quick actions navigation hub.
 */

(function () {
  'use strict';

  // Determine relative root prefix based on URL path
  function getRootPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/pages/teacher/') || p.includes('/pages/hr/') || p.includes('/pages/finance/') || p.includes('/pages/public/')) {
      return '../../';
    }
    if (p.includes('/pages/')) {
      return '../';
    }
    return '';
  }

  const rootPrefix = getRootPrefix();
  const currentPath = window.location.pathname.replace(/\\/g, '/');

  // Auto-inject CSS if not loaded
  function ensureStylesheet() {
    const href = rootPrefix + 'assets/css/quick-dock.css';
    const existing = document.querySelector('link[href*="quick-dock.css"]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  // Detect context, role, and actions
  function getContextConfig() {
    let role = 'HR';
    let roleDesc = 'End session securely';
    let loginTarget = rootPrefix + 'site-login.html';
    let messagesAction = null;

    if (currentPath.includes('/pages/hr/')) {
      role = 'HR';
      roleDesc = 'End HR session securely';
      loginTarget = 'hr-login.html';
      messagesAction = function () {
        if (typeof window.showSection === 'function') {
          window.showSection('messages');
        } else if (window.parent && typeof window.parent.showSection === 'function') {
          window.parent.showSection('messages');
        } else if (currentPath.includes('hr-dashboard.html')) {
          const mTab = document.querySelector('[data-section="messages"]') || document.querySelector('#nav-messages');
          if (mTab) mTab.click();
        } else {
          window.location.href = 'hr-dashboard.html';
        }
      };
    } else if (currentPath.includes('/pages/teacher/')) {
      role = 'Teacher';
      roleDesc = 'End Teacher session securely';
      loginTarget = 'teacher-login.html';
      messagesAction = function () {
        const tab = document.querySelector('[data-section="messages"]');
        if (tab) {
          tab.click();
        } else if (currentPath.includes('teacher-messaging-leave.html')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.location.href = 'teacher-dashboard.html';
        }
      };
    } else if (currentPath.includes('/pages/finance/')) {
      role = 'Finance';
      roleDesc = 'End Finance session securely';
      loginTarget = 'finance-login.html';
      messagesAction = function () {
        if (typeof window.switchTab === 'function') {
          window.switchTab('messaging');
        } else {
          window.location.href = 'finance-dashboard.html';
        }
      };
    } else if (currentPath.includes('welcome.html')) {
      role = 'Workspace';
      roleDesc = 'Sign out of all portals';
      loginTarget = 'site-login.html';
      messagesAction = function () {
        // If an active session is known, route to that portal's messaging
        if (localStorage.getItem('active_teacher')) {
          window.location.href = 'pages/teacher/teacher-dashboard.html';
        } else if (localStorage.getItem('activeFinance')) {
          window.location.href = 'pages/finance/finance-dashboard.html';
        } else {
          window.location.href = 'pages/hr/hr-dashboard.html';
        }
      };
    } else {
      role = 'Workspace';
      roleDesc = 'End session securely';
      loginTarget = rootPrefix + 'site-login.html';
      messagesAction = function () {
        window.location.href = rootPrefix + 'welcome.html';
      };
    }

    return { role, roleDesc, loginTarget, messagesAction };
  }

  // Time formatting helper
  function formatNotifTime(ts) {
    if (!ts) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (isNaN(diff) || diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function initQuickDock() {
    ensureStylesheet();
    const config = getContextConfig();

    let dock = document.getElementById('floatingQuickDock');

    // If dock does not exist, build and inject it
    if (!dock) {
      dock = document.createElement('div');
      dock.className = 'floating-quick-dock';
      dock.id = 'floatingQuickDock';

      dock.innerHTML = `
        <!-- Notifications Arrived Floating Panel -->
        <div class="quick-dock-notif-panel" id="quickDockNotifPanel" aria-label="Notifications Arrived Panel">
          <div class="notif-panel-header">
            <div class="notif-header-left">
              <div class="notif-header-icon"><i class="fa-solid fa-bell"></i></div>
              <div>
                <div class="notif-header-title">Notifications Arrived</div>
                <div class="notif-header-sub" id="quickDockNotifSub">Real-time Staff & System Telemetry</div>
              </div>
            </div>
            <button type="button" class="notif-action-btn" id="quickDockMarkAllReadBtn">
              <i class="fa-solid fa-check-double"></i> Mark read
            </button>
          </div>

          <div class="notif-panel-filter-tabs" id="quickDockNotifTabs">
            <button type="button" class="notif-tab active" data-filter="all">All (<span id="notifCountAll">0</span>)</button>
            <button type="button" class="notif-tab" data-filter="approvals">Approvals (<span id="notifCountApprovals">0</span>)</button>
            <button type="button" class="notif-tab" data-filter="staff">Staff Alerts (<span id="notifCountStaff">0</span>)</button>
          </div>

          <div class="notif-panel-body" id="quickDockNotifList">
            <!-- Dynamic notifications injected here -->
          </div>

          <div class="notif-panel-footer">
            <span class="notif-footer-status"><span class="live-dot"></span> System Live</span>
            <a href="javascript:void(0)" class="notif-footer-link" id="quickDockFooterLink">Manage Staff Accounts &rarr;</a>
          </div>
        </div>

        <!-- 3-Dots Quick Actions Menu -->
        <div class="quick-dock-menu" id="quickDockMenu">
          <div class="quick-dock-header">
            <span class="quick-dock-title">Quick Actions</span>
            <span class="quick-dock-sub">Workspace Navigation</span>
          </div>
          <div class="quick-dock-divider"></div>
          <button type="button" class="quick-dock-item" id="quickDockHubBtn">
            <div class="dock-item-icon hub-icon"><i class="fa-solid fa-house"></i></div>
            <div>
              <div class="dock-item-title">Workspace Hub</div>
              <div class="dock-item-desc">Return to central portal hub</div>
            </div>
          </button>
          <button type="button" class="quick-dock-item" id="quickDockChatBtn">
            <div class="dock-item-icon chat-icon"><i class="fa-solid fa-comment-dots"></i></div>
            <div>
              <div class="dock-item-title">Staff Messages</div>
              <div class="dock-item-desc">Open internal messaging</div>
            </div>
          </button>
          <div class="quick-dock-divider"></div>
          <button type="button" class="quick-dock-item logout" id="quickDockLogoutBtn">
            <div class="dock-item-icon logout-icon"><i class="fa-solid fa-power-off"></i></div>
            <div>
              <div class="dock-item-title">Sign Out</div>
              <div class="dock-item-desc">${config.roleDesc}</div>
            </div>
          </button>
        </div>

        <!-- Floating Dock Trigger Bar (Notifications Arrived & 3-Dots Pill) -->
        <div class="quick-dock-bar" id="quickDockBar">
          <button type="button" class="quick-dock-notif-trigger" id="quickDockNotifTrigger" title="Notifications Arrived" aria-label="Notifications Arrived">
            <span class="notif-icon-wrap">
              <i class="fa-solid fa-bell"></i>
              <span class="notif-pulse-dot" id="quickDockPulseDot"></span>
            </span>
            <span class="quick-dock-notif-text">Notifications Arrived</span>
            <span class="notif-arrived-badge" id="quickDockNotifBadge">0</span>
          </button>

          <button type="button" class="quick-dock-trigger" id="quickDockTrigger" title="Quick Actions Menu" aria-label="Toggle Quick Actions Menu">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </button>
        </div>
      `;

      document.body.appendChild(dock);
    }

    const trigger = dock.querySelector('#quickDockTrigger');
    const notifTrigger = dock.querySelector('#quickDockNotifTrigger');
    const notifBadge = dock.querySelector('#quickDockNotifBadge');
    const pulseDot = dock.querySelector('#quickDockPulseDot');
    const notifList = dock.querySelector('#quickDockNotifList');
    const markReadBtn = dock.querySelector('#quickDockMarkAllReadBtn');
    const notifTabs = dock.querySelectorAll('.notif-tab');
    const footerLink = dock.querySelector('#quickDockFooterLink');

    const hubBtn = dock.querySelector('#quickDockHubBtn');
    const chatBtn = dock.querySelector('#quickDockChatBtn');
    const logoutBtn = dock.querySelector('#quickDockLogoutBtn');

    let currentFilter = 'all';

    function toggleMenu(force) {
      const open = typeof force === 'boolean' ? force : !dock.classList.contains('open');
      dock.classList.toggle('open', open);
      if (open) dock.classList.remove('notif-open');
    }

    function toggleNotif(force) {
      const open = typeof force === 'boolean' ? force : !dock.classList.contains('notif-open');
      dock.classList.toggle('notif-open', open);
      if (open) {
        dock.classList.remove('open');
        renderNotifications();
      }
    }

    // Bind triggers
    if (trigger && !trigger.dataset.dockBound) {
      trigger.dataset.dockBound = 'true';
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    }

    if (notifTrigger && !notifTrigger.dataset.dockBound) {
      notifTrigger.dataset.dockBound = 'true';
      notifTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotif();
      });
    }

    if (hubBtn && !hubBtn.dataset.dockBound) {
      hubBtn.dataset.dockBound = 'true';
      hubBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu(false);
        window.location.href = rootPrefix + 'welcome.html';
      });
    }

    if (chatBtn && !chatBtn.dataset.dockBound) {
      chatBtn.dataset.dockBound = 'true';
      chatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu(false);
        if (typeof config.messagesAction === 'function') {
          config.messagesAction();
        }
      });
    }

    if (logoutBtn && !logoutBtn.dataset.dockBound) {
      logoutBtn.dataset.dockBound = 'true';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu(false);
        if (window.AuthSession && typeof window.AuthSession.logout === 'function') {
          window.AuthSession.logout(config.loginTarget);
        } else if (typeof window.logout === 'function') {
          window.logout();
        } else {
          localStorage.removeItem('activeHR');
          localStorage.removeItem('active_teacher');
          localStorage.removeItem('activeFinance');
          window.location.href = config.loginTarget;
        }
      });
    }

    // Dismiss listeners
    document.addEventListener('click', (e) => {
      if (dock && (dock.classList.contains('open') || dock.classList.contains('notif-open')) && !dock.contains(e.target)) {
        dock.classList.remove('open', 'notif-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dock) {
        dock.classList.remove('open', 'notif-open');
      }
    });

    // Notification tabs filtering
    notifTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        notifTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter || 'all';
        renderNotifications();
      });
    });

    if (footerLink) {
      footerLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleNotif(false);
        if (typeof window.showSection === 'function') {
          window.showSection('users');
          if (typeof window.filterPendingUsers === 'function') {
            window.filterPendingUsers();
          } else if (typeof window.filterHrPendingStaff === 'function') {
            window.filterHrPendingStaff();
          }
        }
      });
    }

    // Get notifications tailored for portal context
    function getNotifications() {
      const list = [];
      const readIds = JSON.parse(localStorage.getItem('hr_read_notif_ids') || '[]');

      // 1. Pending registration approvals from organizations_users
      try {
        const users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
        const pendingUsers = users.filter(u => u.status === 'pending_approval');
        pendingUsers.forEach(u => {
          list.push({
            id: 'user_' + (u.id || u.email),
            category: 'approvals',
            icon: 'fa-solid fa-user-clock',
            iconTheme: 'amber',
            title: 'Staff Registration Arrived',
            msg: `${u.name || u.email} registered as ${u.role ? u.role.toUpperCase() : 'Staff'} & awaits your approval.`,
            time: u.registeredAt ? formatNotifTime(u.registeredAt) : 'Pending',
            actionLabel: 'Approve Now',
            actionType: 'approve_user',
            userEmail: u.email,
            unread: true
          });
        });
      } catch (err) {
        console.warn('Error reading pending users:', err);
      }

      // 2. Default operational notifications for HR
      const defaultAlerts = [
        {
          id: 'alert_att_today',
          category: 'staff',
          icon: 'fa-solid fa-clipboard-user',
          iconTheme: 'green',
          title: 'Daily Staff Attendance',
          msg: 'Morning check-in sheet finalized with 96% staff presence recorded.',
          time: '30m ago',
          actionLabel: 'View Attendance',
          actionType: 'navigate',
          section: 'teachers'
        },
        {
          id: 'alert_leave_req',
          category: 'staff',
          icon: 'fa-solid fa-calendar-check',
          iconTheme: 'purple',
          title: 'Staff Leave Request',
          msg: 'Academic leave application submitted for review (3 days medical).',
          time: '1h ago',
          actionLabel: 'Inspect Request',
          actionType: 'navigate',
          section: 'teachers'
        },
        {
          id: 'alert_payroll_batch',
          category: 'staff',
          icon: 'fa-solid fa-file-invoice-dollar',
          iconTheme: 'blue',
          title: 'Payroll Computation Batch',
          msg: 'Monthly salary disbursements ready for HR verification and sign-off.',
          time: '3h ago',
          actionLabel: 'Open Payroll',
          actionType: 'navigate',
          section: 'payroll'
        }
      ];

      defaultAlerts.forEach(item => {
        const isRead = readIds.includes(item.id);
        list.push(Object.assign({}, item, { unread: !isRead }));
      });

      return list;
    }

    // Render notifications inside the panel and update badges
    function renderNotifications() {
      const allNotifs = getNotifications();
      const unreadCount = allNotifs.filter(n => n.unread).length;
      const approvalCount = allNotifs.filter(n => n.category === 'approvals' && n.unread).length;
      const staffCount = allNotifs.filter(n => n.category === 'staff' && n.unread).length;

      // Update badge and pulse indicator
      if (notifBadge) {
        notifBadge.textContent = unreadCount;
        if (unreadCount > 0) {
          notifBadge.classList.remove('empty');
          if (pulseDot) pulseDot.classList.add('active');
        } else {
          notifBadge.classList.add('empty');
          if (pulseDot) pulseDot.classList.remove('active');
        }
      }

      // Ring the bell anytime a new notification arrives
      if (lastKnownUnreadCount !== -1 && unreadCount > lastKnownUnreadCount) {
        ringBell('arrival');
      } else if (lastKnownUnreadCount === -1 && unreadCount > 0) {
        setTimeout(() => { ringBell('arrival'); }, 1500);
      }
      lastKnownUnreadCount = unreadCount;

      // Update tab counts
      const countAllEl = dock.querySelector('#notifCountAll');
      const countApprEl = dock.querySelector('#notifCountApprovals');
      const countStaffEl = dock.querySelector('#notifCountStaff');
      if (countAllEl) countAllEl.textContent = unreadCount;
      if (countApprEl) countApprEl.textContent = approvalCount;
      if (countStaffEl) countStaffEl.textContent = staffCount;

      if (!notifList) return;

      const filtered = allNotifs.filter(n => {
        if (currentFilter === 'all') return true;
        return n.category === currentFilter;
      });

      if (filtered.length === 0) {
        notifList.innerHTML = `
          <div class="notif-panel-empty">
            <i class="fa-solid fa-circle-check"></i>
            <div class="notif-panel-empty-text">All Caught Up!</div>
            <div class="notif-panel-empty-sub">No unread notifications arrived in your queue.</div>
          </div>
        `;
        return;
      }

      notifList.innerHTML = filtered.map(item => `
        <div class="notif-item ${item.unread ? 'unread' : ''}" data-id="${item.id}" data-action-type="${item.actionType || ''}" data-section="${item.section || ''}" data-email="${item.userEmail || ''}">
          <div class="notif-item-icon ${item.iconTheme || 'amber'}">
            <i class="${item.icon}"></i>
          </div>
          <div class="notif-item-content">
            <div class="notif-item-top">
              <span class="notif-item-title">${item.title}</span>
              <span class="notif-item-time">${item.time}</span>
            </div>
            <div class="notif-item-msg">${item.msg}</div>
            ${item.actionLabel ? `
              <div class="notif-item-actions">
                <button type="button" class="notif-btn-sm ${item.actionType === 'approve_user' ? 'approve' : 'ghost'} btn-notif-action" data-id="${item.id}" data-action-type="${item.actionType}" data-email="${item.userEmail || ''}" data-section="${item.section || ''}">
                  ${item.actionType === 'approve_user' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-arrow-right"></i>'}
                  ${item.actionLabel}
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');

      // Bind action buttons inside notification items
      notifList.querySelectorAll('.btn-notif-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const actionType = btn.dataset.actionType;
          const email = btn.dataset.email;
          const section = btn.dataset.section;

          if (actionType === 'approve_user' && email) {
            approveUserFromDock(email);
          } else if (actionType === 'navigate' && section) {
            toggleNotif(false);
            if (typeof window.showSection === 'function') {
              window.showSection(section);
            }
          }
        });
      });

      // Bind clicking whole notification row
      notifList.querySelectorAll('.notif-item').forEach(row => {
        row.addEventListener('click', () => {
          const actionType = row.dataset.actionType;
          const email = row.dataset.email;
          const section = row.dataset.section;

          if (actionType === 'approve_user') {
            toggleNotif(false);
            if (typeof window.showSection === 'function') {
              window.showSection('users');
              if (typeof window.filterHrPendingStaff === 'function') window.filterHrPendingStaff();
              else if (typeof window.filterPendingUsers === 'function') window.filterPendingUsers();
            }
          } else if (section) {
            toggleNotif(false);
            if (typeof window.showSection === 'function') window.showSection(section);
          }
        });
      });
    }

    // --- Audio Chime Synth & Snooze Notification Engine ---
    let audioCtx = null;
    let audioUnlocked = false;

    function getAudioContext() {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      } catch (e) {
        console.warn('AudioContext init notice:', e);
      }
      return audioCtx;
    }

    // Unlock audio context on user interaction
    function unlockAudio() {
      if (audioUnlocked) return;
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => { audioUnlocked = true; }).catch(() => {});
        } else {
          audioUnlocked = true;
        }
      }
    }
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    // Synthesize an acoustic 4-tone chime (E5, G#5, B5, E6)
    function playChimeSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const notes = [
          { freq: 659.25, time: 0.0, dur: 0.55 },
          { freq: 830.61, time: 0.12, dur: 0.65 },
          { freq: 987.77, time: 0.24, dur: 0.8 },
          { freq: 1318.51, time: 0.36, dur: 1.1 }
        ];

        notes.forEach(n => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.freq, now + n.time);

          gain.gain.setValueAtTime(0, now + n.time);
          gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + n.time);
          osc.stop(now + n.time + n.dur);
        });
      } catch (err) {
        console.warn('Could not play notification chime:', err);
      }
    }

    // Ring bell with visual oscillation and audio chime
    function ringBell(reason = 'arrival') {
      const bellIcon = dock.querySelector('#quickDockNotifTrigger .fa-bell');
      if (bellIcon) {
        bellIcon.classList.remove('bell-ringing');
        void bellIcon.offsetWidth; // reflow
        bellIcon.classList.add('bell-ringing');
        setTimeout(() => {
          bellIcon.classList.remove('bell-ringing');
        }, 3200);
      }

      playChimeSound();

      if (reason === 'snooze') {
        if (typeof window.showToast === 'function') {
          window.showToast('You have pending notifications awaiting your review.', 'info', {
            title: '2-Min Notification Snooze',
            duration: 3500
          });
        }
      }
    }

    // 2-Minute Snooze Interval: rings every 120,000ms until all notifications are read
    const SNOOZE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
    let snoozeTimer = null;
    let lastKnownUnreadCount = -1;

    function checkSnooze() {
      const allNotifs = getNotifications();
      const unreads = allNotifs.filter(n => n.unread);
      if (unreads.length > 0) {
        ringBell('snooze');
      }
    }

    function initSnoozeTimer() {
      if (snoozeTimer) clearInterval(snoozeTimer);
      snoozeTimer = setInterval(checkSnooze, SNOOZE_INTERVAL_MS);
    }

    // Direct 1-click approve from notification card
    function approveUserFromDock(email) {
      try {
        let users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
        const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
        if (u) {
          u.status = 'active';
          localStorage.setItem('organizations_users', JSON.stringify(users));

          if (typeof window.showToast === 'function') {
            window.showToast(`Account approved for ${u.name || email}. Access granted!`, 'success');
          }

          // Trigger dashboard reactive refreshes if active
          if (typeof window.renderUsers === 'function') window.renderUsers();
          if (typeof window.refreshAllStats === 'function') window.refreshAllStats();
          if (typeof window.updatePendingBanners === 'function') window.updatePendingBanners();

          renderNotifications();
        }
      } catch (err) {
        console.error('Error approving user from dock:', err);
      }
    }

    // Mark all notifications as read
    if (markReadBtn && !markReadBtn.dataset.bound) {
      markReadBtn.dataset.bound = 'true';
      markReadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const all = getNotifications();
        const staffIds = all.filter(n => n.category === 'staff').map(n => n.id);
        const existing = JSON.parse(localStorage.getItem('hr_read_notif_ids') || '[]');
        const merged = Array.from(new Set([...existing, ...staffIds]));
        localStorage.setItem('hr_read_notif_ids', JSON.stringify(merged));

        if (typeof window.showToast === 'function') {
          window.showToast('Staff notifications marked as read.', 'info');
        }
        renderNotifications();
      });
    }

    // Storage listener to detect notification arrivals from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'organizations_users' || e.key === 'hr_read_notif_ids' || e.key === 'hr_leave_requests') {
        renderNotifications();
        if (typeof window.updatePendingBanners === 'function') window.updatePendingBanners();
      }
    });

    // Initial render of notifications & start snooze loop
    renderNotifications();
    initSnoozeTimer();

    // Export global controller
    window.QuickDock = {
      refreshNotifications: renderNotifications,
      ringBell: ringBell,
      playChime: playChimeSound,
      triggerSnooze: checkSnooze,
      openNotifications: () => toggleNotif(true),
      closeNotifications: () => toggleNotif(false),
      openMenu: () => toggleMenu(true),
      closeMenu: () => toggleMenu(false)
    };
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickDock);
  } else {
    initQuickDock();
  }
})();
