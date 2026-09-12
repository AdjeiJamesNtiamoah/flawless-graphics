/**
 * FLAWLESS GRAPHICS — FLOATING QUICK DOCK & NOTIFICATIONS COMPONENT
 * Self-contained floating bottom quick actions navigation & notification hub.
 * Serves Super Admin, Teacher, Finance, HR and Workspace portals.
 */

(function () {
  'use strict';

  // Determine relative root prefix based on URL path
  function getRootPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (
      p.includes('/pages/teacher/') ||
      p.includes('/pages/student/') ||
      p.includes('/pages/hr/') ||
      p.includes('/pages/finance/') ||
      p.includes('/pages/public/') ||
      p.includes('/pages/admin/')
    ) {
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

  // Get storage key for marked read notification IDs based on active role
  function getReadNotifStorageKey(role) {
    if (role === 'Super Admin') return 'admin_read_notif_ids';
    if (role === 'Teacher') return 'teacher_read_notif_ids';
    if (role === 'Finance') return 'finance_read_notif_ids';
    if (role === 'Student') return 'student_read_notif_ids';
    return 'hr_read_notif_ids';
  }

  // Detect context, role, and actions
  function getContextConfig() {
    let role = 'HR';
    let roleDesc = 'End HR session securely';
    let loginTarget = 'hr-login.html';
    let panelSub = 'Real-time Staff & System Telemetry';
    let tab1Filter = 'approvals';
    let tab1Label = 'Approvals';
    let tab2Filter = 'staff';
    let tab2Label = 'Staff Alerts';
    let footerLinkText = 'Manage Staff Accounts';
    let footerAction = function () {
      if (typeof window.showSection === 'function') {
        window.showSection('users');
        if (typeof window.filterHrPendingStaff === 'function') {
          window.filterHrPendingStaff();
        } else if (typeof window.filterPendingUsers === 'function') {
          window.filterPendingUsers();
        }
      } else {
        window.location.href = 'hr-dashboard.html';
      }
    };
    let messagesAction = function () {
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

    if (currentPath.includes('/pages/admin/')) {
      role = 'Super Admin';
      roleDesc = 'End Super Admin session securely';
      loginTarget = 'admin-login.html';
      panelSub = 'Super Admin Telemetry & User Governance';
      tab1Filter = 'approvals';
      tab1Label = 'Approvals';
      tab2Filter = 'system';
      tab2Label = 'System & Logs';
      footerLinkText = 'Manage Global Users (RBAC)';
      footerAction = function () {
        if (typeof window.switchSection === 'function') {
          window.switchSection('users');
          if (typeof window.filterPendingUsers === 'function') window.filterPendingUsers();
        } else {
          window.location.href = 'admin-dashboard.html';
        }
      };
      messagesAction = function () {
        if (typeof window.switchSection === 'function') {
          window.switchSection('broadcasts');
        } else {
          window.location.href = 'admin-dashboard.html';
        }
      };
    } else if (currentPath.includes('/pages/teacher/')) {
      role = 'Teacher';
      roleDesc = 'End Teacher session securely';
      loginTarget = 'teacher-login.html';
      panelSub = 'Teacher Directives, Submissions & Calendar';
      tab1Filter = 'directives';
      tab1Label = 'Directives';
      tab2Filter = 'classes';
      tab2Label = 'Class Alerts';
      footerLinkText = 'View Timetable & Calendar';
      footerAction = function () {
        const tab = document.querySelector('[data-section="timetable"]') || document.querySelector('[data-section="broadcasts"]');
        if (tab) {
          tab.click();
        } else {
          window.location.href = 'teacher-dashboard.html';
        }
      };
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
      panelSub = 'Disbursements, Collections & Ledger Alerts';
      tab1Filter = 'disbursements';
      tab1Label = 'Disbursements';
      tab2Filter = 'collections';
      tab2Label = 'Fee Collections';
      footerLinkText = 'Open Financial Ledger & Approvals';
      footerAction = function () {
        if (typeof window.switchTab === 'function') {
          window.switchTab('approval');
        } else {
          window.location.href = 'finance-dashboard.html';
        }
      };
      messagesAction = function () {
        if (typeof window.switchTab === 'function') {
          window.switchTab('messaging');
        } else {
          window.location.href = 'finance-dashboard.html';
        }
      };
    } else if (currentPath.includes('/pages/student/')) {
      role = 'Student';
      roleDesc = 'End Student session securely';
      loginTarget = 'student-login.html';
      panelSub = 'Academic Directives, Coursework & Results';
      tab1Filter = 'coursework';
      tab1Label = 'Coursework';
      tab2Filter = 'grades';
      tab2Label = 'Grades & Alerts';
      footerLinkText = 'Open WAEC Broadsheet';
      footerAction = function () {
        if (typeof window.openTranscriptModal === 'function') {
          window.openTranscriptModal();
        } else if (typeof window.showSection === 'function') {
          window.showSection('grades');
        } else {
          window.location.href = 'student-dashboard.html';
        }
      };
      messagesAction = function () {
        if (typeof window.showSection === 'function') {
          window.showSection('overview');
        } else {
          window.location.href = 'student-dashboard.html';
        }
      };
    } else if (currentPath.includes('/pages/hr/')) {
      // HR defaults already assigned above
    } else if (currentPath.includes('welcome.html')) {
      role = 'Workspace';
      roleDesc = 'Sign out of all portals';
      loginTarget = 'site-login.html';
      panelSub = 'Institutional Hub & Portals Telemetry';
      tab1Filter = 'approvals';
      tab1Label = 'Approvals';
      tab2Filter = 'staff';
      tab2Label = 'System Alerts';
      footerLinkText = 'Open Master Portal Hub';
      footerAction = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      messagesAction = function () {
        if (localStorage.getItem('active_org_user')) {
          window.location.href = 'pages/admin/admin-dashboard.html';
        } else if (localStorage.getItem('active_teacher')) {
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
      panelSub = 'Institutional Real-time Telemetry';
      tab1Filter = 'approvals';
      tab1Label = 'Approvals';
      tab2Filter = 'staff';
      tab2Label = 'Alerts';
      footerLinkText = 'Return to Workspace Hub';
      footerAction = function () {
        window.location.href = rootPrefix + 'welcome.html';
      };
      messagesAction = function () {
        window.location.href = rootPrefix + 'welcome.html';
      };
    }

    return {
      role,
      roleDesc,
      loginTarget,
      panelSub,
      tab1Filter,
      tab1Label,
      tab2Filter,
      tab2Label,
      footerLinkText,
      footerAction,
      messagesAction
    };
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
                <div class="notif-header-sub" id="quickDockNotifSub">${config.panelSub}</div>
              </div>
            </div>
            <button type="button" class="notif-action-btn" id="quickDockMarkAllReadBtn">
              <i class="fa-solid fa-check-double"></i> Mark read
            </button>
          </div>

          <div class="notif-panel-filter-tabs" id="quickDockNotifTabs">
            <button type="button" class="notif-tab active" data-filter="all">All (<span id="notifCountAll">0</span>)</button>
            <button type="button" class="notif-tab" data-filter="${config.tab1Filter}">${config.tab1Label} (<span id="notifCountTab1">0</span>)</button>
            <button type="button" class="notif-tab" data-filter="${config.tab2Filter}">${config.tab2Label} (<span id="notifCountTab2">0</span>)</button>
          </div>

          <div class="notif-panel-body" id="quickDockNotifList">
            <!-- Dynamic notifications injected here -->
          </div>

          <div class="notif-panel-footer">
            <span class="notif-footer-status"><span class="live-dot"></span> System Live</span>
            <a href="javascript:void(0)" class="notif-footer-link" id="quickDockFooterLink">${config.footerLinkText} &rarr;</a>
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
            <span class="notif-arrived-badge empty" id="quickDockNotifBadge">0</span>
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
          localStorage.removeItem('active_org_user');
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
        if (typeof config.footerAction === 'function') {
          config.footerAction();
        }
      });
    }

    // Section navigation router
    function navigateToSection(sec) {
      if (!sec) return;
      toggleNotif(false);
      if (typeof window.switchSection === 'function') {
        window.switchSection(sec);
      } else if (typeof window.switchTab === 'function') {
        window.switchTab(sec);
      } else if (typeof window.showSection === 'function') {
        window.showSection(sec);
      } else {
        const tab = document.querySelector(`[data-section="${sec}"]`);
        if (tab) tab.click();
      }
    }

    // Get notifications tailored for portal context
    function getNotifications() {
      const list = [];
      const storageKey = getReadNotifStorageKey(config.role);
      const readIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

      // -------------------------------------------------------------
      // 1. SUPER ADMIN NOTIFICATIONS
      // -------------------------------------------------------------
      if (config.role === 'Super Admin') {
        // Pending registration approvals from organizations_users
        try {
          const users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
          const pendingUsers = users.filter(u => {
            const s = (u.status || '').toLowerCase();
            return s === 'pending_approval' || s === 'pending';
          });
          pendingUsers.forEach(u => {
            list.push({
              id: 'admin_user_' + (u.id || u.email),
              category: 'approvals',
              icon: 'fa-solid fa-user-clock',
              iconTheme: 'amber',
              title: 'User Registration Arrived',
              msg: `${u.name || u.email} requested access as ${(u.role || 'Staff').toUpperCase()} (${u.org || 'All Orgs'}) & awaits approval.`,
              time: u.registeredAt ? formatNotifTime(u.registeredAt) : 'Pending',
              actionLabel: 'Approve Now',
              actionType: 'approve_user',
              userEmail: u.email,
              unread: true
            });
          });
        } catch (err) {
          console.warn('Error reading pending users for admin:', err);
        }

        // Operational & Health Telemetry
        const adminAlerts = [
          {
            id: 'admin_alert_cloud_sync',
            category: 'system',
            icon: 'fa-solid fa-cloud-arrow-up',
            iconTheme: 'green',
            title: 'Cloud DB Sync Telemetry',
            msg: 'Continuous cloud sync active across all tenants. 0 errors detected in last 24 hours.',
            time: 'Live',
            actionLabel: 'Check Health',
            actionType: 'navigate',
            section: 'health'
          },
          {
            id: 'admin_alert_backup',
            category: 'system',
            icon: 'fa-solid fa-database',
            iconTheme: 'purple',
            title: 'Disaster Recovery Snapshot',
            msg: 'Automated disaster recovery backup verified and encrypted in secure storage.',
            time: '1h ago',
            actionLabel: 'Inspect Backup',
            actionType: 'navigate',
            section: 'backup'
          },
          {
            id: 'admin_alert_broadcast',
            category: 'system',
            icon: 'fa-solid fa-bullhorn',
            iconTheme: 'blue',
            title: 'Broadcast Console Telemetry',
            msg: 'Super Admin institutional directive delivered across Teacher, HR & Finance channels.',
            time: '2h ago',
            actionLabel: 'Open Console',
            actionType: 'navigate',
            section: 'broadcasts'
          }
        ];

        adminAlerts.forEach(item => {
          const isRead = readIds.includes(item.id);
          list.push(Object.assign({}, item, { unread: !isRead }));
        });
      }

      // -------------------------------------------------------------
      // 2. TEACHER NOTIFICATIONS
      // -------------------------------------------------------------
      else if (config.role === 'Teacher') {
        // Broadcasts / Directives published by HR or Super Admin
        let activeOrg = localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
        try {
          const activeTeacher = JSON.parse(localStorage.getItem('active_teacher') || '{}');
          if (activeTeacher.org) activeOrg = activeTeacher.org;
        } catch (e) {}

        const annKey = `${activeOrg}_announcements`;
        const announcements = JSON.parse(localStorage.getItem(annKey) || localStorage.getItem('FLAWLESS_GRAPHICS_announcements') || '[]');
        if (Array.isArray(announcements) && announcements.length > 0) {
          announcements.slice(0, 3).forEach(b => {
            const bId = 'teacher_bc_' + (b.id || b.title);
            const isRead = readIds.includes(bId);
            list.push({
              id: bId,
              category: 'directives',
              icon: 'fa-solid fa-bullhorn',
              iconTheme: 'amber',
              title: 'Directive: ' + (b.title || 'Official Directive'),
              msg: b.message || b.content || 'Executive directive published for academic staff review.',
              time: b.date ? formatNotifTime(b.date) : 'Recent',
              actionLabel: 'Read Directive',
              actionType: 'navigate',
              section: 'broadcasts',
              unread: !isRead
            });
          });
        } else {
          const isRead = readIds.includes('teacher_directive_default');
          list.push({
            id: 'teacher_directive_default',
            category: 'directives',
            icon: 'fa-solid fa-bullhorn',
            iconTheme: 'amber',
            title: 'Executive Directive Arrived',
            msg: 'Official Academic Calendar & Assessment Schedules published for staff review.',
            time: 'Today',
            actionLabel: 'Read Directive',
            actionType: 'navigate',
            section: 'broadcasts',
            unread: !isRead
          });
        }

        // Teacher Class & Assessment alerts
        const teacherAlerts = [
          {
            id: 'teacher_alert_submissions',
            category: 'classes',
            icon: 'fa-solid fa-book-open',
            iconTheme: 'green',
            title: 'Student Coursework Arrived',
            msg: '8 new student assignment submissions uploaded in Visual Arts 101 awaiting grading.',
            time: '45m ago',
            actionLabel: 'Grade Submissions',
            actionType: 'navigate',
            section: 'assignments'
          },
          {
            id: 'teacher_alert_calendar',
            category: 'classes',
            icon: 'fa-solid fa-calendar-days',
            iconTheme: 'purple',
            title: 'Academic Schedule Update',
            msg: 'Mid-term student assessment window opens next Monday. Verify assessment rubrics.',
            time: '2h ago',
            actionLabel: 'View Timetable',
            actionType: 'navigate',
            section: 'timetable'
          }
        ];

        teacherAlerts.forEach(item => {
          const isRead = readIds.includes(item.id);
          list.push(Object.assign({}, item, { unread: !isRead }));
        });
      }

      // -------------------------------------------------------------
      // 3. FINANCE NOTIFICATIONS
      // -------------------------------------------------------------
      else if (config.role === 'Finance') {
        const financeAlerts = [
          {
            id: 'finance_alert_tuition_pay',
            category: 'collections',
            icon: 'fa-solid fa-graduation-cap',
            iconTheme: 'green',
            title: 'Tuition Fee Payment Arrived',
            msg: 'Student tuition receipt of GHS 1,450.00 confirmed and posted to student receivables.',
            time: '20m ago',
            actionLabel: 'View Collections',
            actionType: 'navigate',
            section: 'dashboard'
          },
          {
            id: 'finance_alert_payroll_disb',
            category: 'disbursements',
            icon: 'fa-solid fa-hand-holding-dollar',
            iconTheme: 'blue',
            title: 'Payroll Disbursement Clearance',
            msg: 'Monthly staff compensation batch computed by HR awaits bursar authorization.',
            time: '1h ago',
            actionLabel: 'Disburse Payroll',
            actionType: 'navigate',
            section: 'approval'
          },
          {
            id: 'finance_alert_invoice',
            category: 'disbursements',
            icon: 'fa-solid fa-file-invoice-dollar',
            iconTheme: 'purple',
            title: 'Departmental Invoice Arrived',
            msg: 'Campus equipment maintenance invoice (GHS 850.00) submitted for payment clearance.',
            time: '3h ago',
            actionLabel: 'Review Invoice',
            actionType: 'navigate',
            section: 'approval'
          }
        ];

        financeAlerts.forEach(item => {
          const isRead = readIds.includes(item.id);
          list.push(Object.assign({}, item, { unread: !isRead }));
        });
      }

      // -------------------------------------------------------------
      // 4. STUDENT NOTIFICATIONS
      // -------------------------------------------------------------
      else if (config.role === 'Student') {
        const studentAlerts = [
          {
            id: 'stu_alert_assignment_1',
            category: 'coursework',
            icon: 'fa-solid fa-clock-rotate-left',
            iconTheme: 'amber',
            title: 'Upcoming Coursework Deadline',
            msg: 'Responsive Web Architecture Project due tomorrow at 11:59 PM.',
            time: 'Due Soon',
            actionLabel: 'Submit Now',
            actionType: 'navigate',
            section: 'assignments'
          },
          {
            id: 'stu_alert_waec_grades',
            category: 'grades',
            icon: 'fa-solid fa-award',
            iconTheme: 'green',
            title: 'Continuous Assessment Certified',
            msg: 'Mid-term CA marks approved by HR Directorate. Current average: 88% (A1).',
            time: 'Today',
            actionLabel: 'View Grades',
            actionType: 'navigate',
            section: 'grades'
          },
          {
            id: 'stu_alert_directive',
            category: 'grades',
            icon: 'fa-solid fa-bullhorn',
            iconTheme: 'blue',
            title: 'WAEC Examination Window Published',
            msg: 'Final exam schedule and revision milestones released by faculty office.',
            time: '2h ago',
            actionLabel: 'View Timetable',
            actionType: 'navigate',
            section: 'timetable'
          }
        ];

        studentAlerts.forEach(item => {
          const isRead = readIds.includes(item.id);
          list.push(Object.assign({}, item, { unread: !isRead }));
        });
      }

      // -------------------------------------------------------------
      // 5. HR & WORKSPACE NOTIFICATIONS (DEFAULT)
      // -------------------------------------------------------------
      else {
        // Pending registration approvals from organizations_users
        try {
          const users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
          const pendingUsers = users.filter(u => {
            const s = (u.status || '').toLowerCase();
            return s === 'pending_approval' || s === 'pending';
          });
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

        // Operational notifications for HR
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
      }

      return list;
    }

    // Render notifications inside the panel and update badges
    function renderNotifications() {
      const allNotifs = getNotifications();
      const unreadCount = allNotifs.filter(n => n.unread).length;
      const tab1Count = allNotifs.filter(n => n.category === config.tab1Filter && n.unread).length;
      const tab2Count = allNotifs.filter(n => n.category === config.tab2Filter && n.unread).length;

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

      // Sync any topbar notification badges on page
      const adminBadge = document.getElementById('adminTopbarNotifBadge');
      if (adminBadge) adminBadge.textContent = unreadCount;
      const teacherBadge = document.getElementById('teacherTopbarNotifBadge');
      if (teacherBadge) teacherBadge.textContent = unreadCount;
      const financeBadge = document.getElementById('financeTopbarNotifBadge');
      if (financeBadge) financeBadge.textContent = unreadCount;
      const teacherBellCount = document.getElementById('notifCount');
      if (teacherBellCount) {
        teacherBellCount.textContent = unreadCount;
        teacherBellCount.style.display = unreadCount > 0 ? 'flex' : 'none';
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
      const countTab1El = dock.querySelector('#notifCountTab1');
      const countTab2El = dock.querySelector('#notifCountTab2');
      if (countAllEl) countAllEl.textContent = unreadCount;
      if (countTab1El) countTab1El.textContent = tab1Count;
      if (countTab2El) countTab2El.textContent = tab2Count;

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
            <div class="notif-panel-empty-sub">No unread notifications arrived in your ${config.role} queue.</div>
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
            navigateToSection(section);
          }
        });
      });

      // Bind clicking whole notification row
      notifList.querySelectorAll('.notif-item').forEach(row => {
        row.addEventListener('click', () => {
          const actionType = row.dataset.actionType;
          const email = row.dataset.email;
          const section = row.dataset.section;

          if (actionType === 'approve_user' && email) {
            approveUserFromDock(email);
          } else if (section) {
            navigateToSection(section);
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
          window.showToast(`You have pending ${config.role} notifications awaiting your review.`, 'info', {
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
        if (typeof window.approveUserAccount === 'function') {
          window.approveUserAccount(email);
          renderNotifications();
          return;
        }
        if (typeof window.approveStaffUser === 'function') {
          window.approveStaffUser(email);
          renderNotifications();
          return;
        }

        let users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
        const u = users.find(x => (x.email || '').toLowerCase() === email.toLowerCase());
        if (u) {
          u.status = 'active';
          u.approvedAt = Date.now();
          localStorage.setItem('organizations_users', JSON.stringify(users));

          // Also activate in org teachers roster if teacher
          const org = u.org || 'FLAWLESS GRAPHICS';
          try {
            let staff = JSON.parse(localStorage.getItem(`${org}_teachers`) || '[]');
            const sIdx = staff.findIndex(s => (s.email || '').toLowerCase() === email.toLowerCase());
            if (sIdx >= 0) {
              staff[sIdx].status = 'Active';
              localStorage.setItem(`${org}_teachers`, JSON.stringify(staff));
            }
          } catch(e) {}

          if (typeof window.showToast === 'function') {
            window.showToast(`Account approved for ${u.name || email}. Access granted!`, 'success');
          } else if (window.Toaster && typeof window.Toaster.success === 'function') {
            window.Toaster.success(`Account approved for ${u.name || email}. Access granted!`);
          }

          if (typeof window.renderUsers === 'function') window.renderUsers();
          if (typeof window.renderMasterUsersTable === 'function') window.renderMasterUsersTable();
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
        const itemIds = all.map(n => n.id);
        const storageKey = getReadNotifStorageKey(config.role);
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const merged = Array.from(new Set([...existing, ...itemIds]));
        localStorage.setItem(storageKey, JSON.stringify(merged));

        if (typeof window.showToast === 'function') {
          window.showToast(`${config.role} notifications marked as read.`, 'info');
        } else if (window.Toaster && typeof window.Toaster.info === 'function') {
          window.Toaster.info(`${config.role} notifications marked as read.`);
        }
        renderNotifications();
      });
    }

    // Storage listener to detect notification arrivals from other tabs
    window.addEventListener('storage', (e) => {
      if (
        e.key === 'organizations_users' ||
        (e.key && e.key.includes('_read_notif_ids')) ||
        (e.key && e.key.includes('_announcements')) ||
        e.key === 'hr_leave_requests' ||
        (e.key && e.key.includes('_teachers'))
      ) {
        renderNotifications();
        if (typeof window.updatePendingBanners === 'function') window.updatePendingBanners();
        if (typeof window.refreshAllStats === 'function') window.refreshAllStats();
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
