/**
 * realtime-bus.js
 * Universal Real-Time Event Bus, Cross-Portal Communication, Activity Logger & Haptic Audio Dispatcher
 * FLAWLESS GRAPHICS Enterprise Academic Management System
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_ACTIVITY = 'lucy_activity_stream';
  const STORAGE_KEY_NOTIFS = 'lucy_live_notifications';
  const MAX_LOG_ENTRIES = 120;

  // Web Audio Synthesizer Engine (100% offline, zero audio assets needed)
  function playHapticTone(toneType = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (toneType === 'success' || toneType === 'save') {
        // High-fidelity luxury two-tone chime (Major 3rd)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (toneType === 'coins' || toneType === 'payment') {
        // Cash register / coin sparkle
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (toneType === 'alert' || toneType === 'warning') {
        // Soft alert tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(349.23, now + 0.15); // F4
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (toneType === 'info' || toneType === 'click') {
        // Subtle haptic pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio context may be restricted by autoplay policy before user interaction
    }
  }

  const LucyBus = {
    /**
     * Dispatch an institutional event across all portals, toasters, notification panels, and audit logs.
     * @param {string} eventType - e.g. 'FEE_PAID', 'STUDENT_CLEARED', 'GRADE_SAVED', 'STAFF_APPROVED'
     * @param {object} payload - Event payload metadata
     * @param {object} [options] - Options { toast: true, notify: true, sound: true, role: 'all' }
     */
    emit(eventType, payload = {}, options = {}) {
      const opts = Object.assign({
        toast: true,
        notify: true,
        sound: true,
        tone: 'success',
        type: 'success',
        role: 'all'
      }, options);

      const timestamp = Date.now();
      const activityId = 'act_' + timestamp + '_' + Math.floor(Math.random() * 1000);

      const activity = {
        id: activityId,
        type: eventType,
        title: payload.title || this.getEventDefaultTitle(eventType),
        message: payload.message || payload.msg || this.formatEventMessage(eventType, payload),
        module: payload.module || this.detectModule(eventType),
        user: payload.user || payload.operator || this.getCurrentUserName(),
        role: payload.role || opts.role || 'System',
        targetRole: payload.targetRole || opts.role || 'all',
        data: payload,
        timestamp: timestamp
      };

      // 1. Save to global institutional activity log
      this.logActivity(activity);

      // 2. Dispatch live In-App Notification entry for QuickDock
      if (opts.notify) {
        this.addLiveNotification(activity);
      }

      // 3. Play haptic synthesizer audio chime
      if (opts.sound) {
        playHapticTone(opts.tone || (activity.type.includes('ERROR') ? 'alert' : 'success'));
      }

      // 4. Pop-up modern rich Toaster
      if (opts.toast && window.Toaster) {
        const toastType = opts.type || (eventType.includes('ERROR') ? 'error' : (eventType.includes('WARNING') ? 'warning' : 'success'));
        window.Toaster.show({
          type: toastType,
          title: activity.title,
          message: activity.message,
          duration: opts.duration || 4500
        });
      }

      try {
        window.dispatchEvent(new CustomEvent('lucy:activity', { detail: activity }));
        window.dispatchEvent(new CustomEvent('flawless:activity', { detail: activity }));
      } catch (e) {}

      // 6. Broadcast across tabs via localStorage ping
      try {
        localStorage.setItem('lucy_last_event_ping', JSON.stringify({
          id: activityId,
          type: eventType,
          time: timestamp
        }));
      } catch (e) {}

      return activity;
    },

    /**
     * Helper to log activity entry
     */
    logActivity(activity) {
      try {
        let stream = JSON.parse(localStorage.getItem(STORAGE_KEY_ACTIVITY) || '[]');
        stream.unshift(activity);
        if (stream.length > MAX_LOG_ENTRIES) {
          stream = stream.slice(0, MAX_LOG_ENTRIES);
        }
        localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(stream));
      } catch (e) {
        console.warn('LucyBus activity log error:', e);
      }
    },

    /**
     * Add notification to live notification queue
     */
    addLiveNotification(activity) {
      try {
        let notifs = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFS) || '[]');
        const notifItem = {
          id: activity.id,
          category: activity.module.toLowerCase(),
          icon: this.getEventIcon(activity.type),
          iconTheme: this.getIconTheme(activity.type),
          title: activity.title,
          msg: activity.message,
          time: 'Just now',
          timestamp: activity.timestamp,
          targetRole: activity.targetRole,
          unread: true,
          actionLabel: activity.data && activity.data.actionLabel ? activity.data.actionLabel : 'View Record',
          section: activity.data && activity.data.section ? activity.data.section : activity.module.toLowerCase()
        };
        notifs.unshift(notifItem);
        if (notifs.length > 50) {
          notifs = notifs.slice(0, 50);
        }
        localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));

        // Trigger QuickDock badge refresh if active
        if (window.QuickDock && typeof window.QuickDock.refreshNotifications === 'function') {
          window.QuickDock.refreshNotifications();
        }
      } catch (e) {
        console.warn('LucyBus notification queue error:', e);
      }
    },

    /**
     * Retrieve recent activities from audit log
     */
    getRecentActivities(limit = 20, filterModule = null) {
      try {
        const stream = JSON.parse(localStorage.getItem(STORAGE_KEY_ACTIVITY) || '[]');
        if (filterModule) {
          return stream.filter(a => a.module === filterModule).slice(0, limit);
        }
        return stream.slice(0, limit);
      } catch (e) {
        return [];
      }
    },

    /**
     * Retrieve live notifications
     */
    getLiveNotifications(role = 'all') {
      try {
        const notifs = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFS) || '[]');
        if (!role || role === 'all') return notifs;
        return notifs.filter(n => n.targetRole === 'all' || n.targetRole.toLowerCase() === role.toLowerCase());
      } catch (e) {
        return [];
      }
    },

    /**
     * Get active logged in user name
     */
    getCurrentUserName() {
      try {
        if (window.AuthSession && window.AuthSession.getUser()) {
          return window.AuthSession.getUser().name || 'System Operator';
        }
        const teacher = JSON.parse(localStorage.getItem('active_teacher') || '{}');
        if (teacher.name) return teacher.name;
        const hr = JSON.parse(localStorage.getItem('activeHR') || '{}');
        if (hr.name) return hr.name;
        const finance = JSON.parse(localStorage.getItem('activeFinance') || '{}');
        if (finance.name) return finance.name;
        const student = JSON.parse(localStorage.getItem('active_student') || '{}');
        if (student.name) return student.name;
      } catch (e) {}
      return 'Institutional Administrator';
    },

    /**
     * Determine module from event type
     */
    detectModule(eventType) {
      if (eventType.includes('FEE') || eventType.includes('PAYROLL') || eventType.includes('CLEARANCE') || eventType.includes('DISBURSEMENT') || eventType.includes('TARIFF') || eventType.includes('SCHOLARSHIP')) {
        return 'Bursary & Finance';
      }
      if (eventType.includes('GRADE') || eventType.includes('ATTENDANCE') || eventType.includes('LESSON') || eventType.includes('CLASS')) {
        return 'Faculty & Teacher';
      }
      if (eventType.includes('STUDENT') || eventType.includes('GPA') || eventType.includes('SMART_ID') || eventType.includes('COURSEWORK') || eventType.includes('BROADSHEET')) {
        return 'Student Academy';
      }
      if (eventType.includes('STAFF') || eventType.includes('LEAVE') || eventType.includes('KPI') || eventType.includes('HR')) {
        return 'Staff & HR';
      }
      return 'Super Admin Core';
    },

    /**
     * Default title builder
     */
    getEventDefaultTitle(eventType) {
      const titles = {
        'FEE_PAID': 'Bursary Payment Recorded',
        'TUITION_PAID': 'Tuition Payment Confirmed',
        'EXAM_CLEARED': 'Exam Clearance Status Updated',
        'CLEARANCE_TOGGLED': 'Clearance Desk Status Changed',
        'PAYROLL_APPROVED': 'Faculty Salaries Authorized',
        'SCHOLARSHIP_AWARDED': 'Scholarship Grant Awarded',
        'DISBURSEMENT_RECORDED': 'Operational Disbursement Logged',
        'TARIFF_UPDATED': 'Fee Tariff Matrix Saved',
        'HALL_PASS_ISSUED': 'Certified Exam Hall Pass Printed',
        'HALL_PASS_PRINTED': 'Exam Hall Pass Generated',
        'ATTENDANCE_LOGGED': 'Daily Class Attendance Saved',
        'GRADE_SAVED': 'Continuous Assessment Grade Recorded',
        'LESSON_UPLOADED': 'Curriculum Lesson Vault Updated',
        'BROADCAST_SENT': 'Official Campus Directive Published',
        'ANNOUNCEMENT_POSTED': 'Staff Announcement Dispatched',
        'SMART_ID_VERIFIED': 'Smart RFID Digital ID Verified',
        'SMART_ID_LOOKUP': 'Smart ID Security Scan Passed',
        'GPA_CALCULATED': 'WAEC / GPA Simulation Calculated',
        'BROADSHEET_EXPORTED': 'Official Academic Broadsheet Exported',
        'STAFF_SAVED': 'Staff Member Profile Saved',
        'LEAVE_APPROVED': 'Faculty Leave Request Approved',
        'USER_APPROVED': 'New User Access Approved',
        'INSTITUTION_REGISTERED': 'Institutional Workspace Provisioned',
        'SETTINGS_SAVED': 'Configuration Settings Saved'
      };
      return titles[eventType] || eventType.replace(/_/g, ' ');
    },

    /**
     * Message formatting helper
     */
    formatEventMessage(eventType, p) {
      if (eventType === 'FEE_PAID' || eventType === 'TUITION_PAID') {
        return `Payment of ${p.amount || 'GHS 0.00'} confirmed for ${p.studentName || p.student || 'Student'} (Ref: ${p.txnId || p.reference || 'TXN-LUCY'}).`;
      }
      if (eventType === 'CLEARANCE_TOGGLED' || eventType === 'EXAM_CLEARED') {
        return `Exam clearance for ${p.studentName || p.student || 'Student'} set to [${(p.status || 'Cleared').toUpperCase()}].`;
      }
      if (eventType === 'PAYROLL_APPROVED') {
        return `All faculty and staff payroll batches approved for electronic wire transfer.`;
      }
      if (eventType === 'SCHOLARSHIP_AWARDED') {
        return `Scholarship award of ${p.amount || 'GHS 1,500.00'} assigned to ${p.scholarName || p.student || 'Scholar'}.`;
      }
      if (eventType === 'GRADE_SAVED') {
        return `Assessment grade [${p.grade || 'A1'}] entered for ${p.student || 'Student'} in ${p.subject || 'Course'}.`;
      }
      if (eventType === 'ATTENDANCE_LOGGED') {
        return `Attendance record logged: ${p.presentCount || '28'} Present, ${p.absentCount || '2'} Absent.`;
      }
      if (eventType === 'SMART_ID_VERIFIED' || eventType === 'SMART_ID_LOOKUP') {
        return `Digital credential authenticated for ${p.name || 'Scholar'} (${p.studentId || p.id || 'Active ID'}).`;
      }
      if (eventType === 'STAFF_SAVED' || eventType === 'USER_APPROVED') {
        return `Account privileges granted to ${p.name || p.staffName || 'Staff Member'} as ${p.role || 'Educator'}.`;
      }
      if (eventType === 'BROADSHEET_EXPORTED') {
        return `Official academic records broadsheet compiled and downloaded as CSV.`;
      }
      return p.details || p.desc || 'Operation completed and synchronized with cloud database.';
    },

    /**
     * Icon mapping helper
     */
    getEventIcon(eventType) {
      if (eventType.includes('FEE') || eventType.includes('PAYROLL') || eventType.includes('DISBURSEMENT')) return 'fa-solid fa-wallet';
      if (eventType.includes('CLEARANCE') || eventType.includes('HALL_PASS')) return 'fa-solid fa-id-card-clip';
      if (eventType.includes('GRADE') || eventType.includes('GPA')) return 'fa-solid fa-chart-line';
      if (eventType.includes('ATTENDANCE')) return 'fa-solid fa-clipboard-user';
      if (eventType.includes('SMART_ID')) return 'fa-solid fa-fingerprint';
      if (eventType.includes('BROADCAST') || eventType.includes('ANNOUNCEMENT')) return 'fa-solid fa-bullhorn';
      if (eventType.includes('STAFF') || eventType.includes('USER')) return 'fa-solid fa-user-check';
      return 'fa-solid fa-circle-check';
    },

    /**
     * Icon color theme helper
     */
    getIconTheme(eventType) {
      if (eventType.includes('FEE') || eventType.includes('PAYROLL')) return 'amber';
      if (eventType.includes('CLEARANCE') || eventType.includes('GRADE')) return 'green';
      if (eventType.includes('SMART_ID') || eventType.includes('ATTENDANCE')) return 'blue';
      return 'purple';
    },

    /**
     * Manually trigger tone
     */
    playTone(toneName) {
      playHapticTone(toneName);
    }
  };

  // Cross-tab Synchronization Listener
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function (e) {
      if (e.key === 'lucy_last_event_ping' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          // Refresh QuickDock notification counter if present
          if (window.QuickDock && typeof window.QuickDock.refreshNotifications === 'function') {
            window.QuickDock.refreshNotifications();
          }
        } catch (err) {}
      }
    });

    window.LucyBus = LucyBus;
    window.FlawlessBus = LucyBus;
  }

})(typeof window !== 'undefined' ? window : this);
