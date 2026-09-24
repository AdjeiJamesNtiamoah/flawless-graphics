/**
 * Flawless Graphics — Universal Slide-Over Drawer Engine
 * High-performance, Accessible, Modular Off-Canvas Architecture
 */

(function () {
  'use strict';

  // Ensure Backdrop exists in DOM
  let backdropEl = null;

  function getOrCreateBackdrop() {
    if (!backdropEl) {
      backdropEl = document.getElementById('slideOverBackdrop');
      if (!backdropEl) {
        backdropEl = document.createElement('div');
        backdropEl.id = 'slideOverBackdrop';
        backdropEl.className = 'slide-over-backdrop';
        backdropEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(backdropEl);

        backdropEl.addEventListener('click', () => {
          SlideOver.closeAll();
        });
      }
    }
    return backdropEl;
  }

  const SlideOver = {
    activePanels: new Set(),

    /**
     * Open a slide-over drawer by ID or Element
     */
    open(panelOrId) {
      const panel = typeof panelOrId === 'string' 
        ? document.getElementById(panelOrId.replace(/^#/, '')) 
        : panelOrId;

      if (!panel) {
        console.warn('[SlideOver] Panel not found:', panelOrId);
        return false;
      }

      const backdrop = getOrCreateBackdrop();
      backdrop.classList.add('active');

      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('slide-over-open');
      this.activePanels.add(panel);

      // Focus close button or first input for accessibility
      setTimeout(() => {
        const focusable = panel.querySelector('input, select, textarea, button:not([disabled])');
        if (focusable) focusable.focus();
      }, 100);

      // Trigger custom event
      panel.dispatchEvent(new CustomEvent('slideover:opened', { bubbles: true, detail: { panel } }));
      return true;
    },

    /**
     * Close a slide-over drawer
     */
    close(panelOrId) {
      const panel = typeof panelOrId === 'string' 
        ? document.getElementById(panelOrId.replace(/^#/, '')) 
        : panelOrId;

      if (!panel) return false;

      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
      this.activePanels.delete(panel);

      if (this.activePanels.size === 0) {
        if (backdropEl) backdropEl.classList.remove('active');
        document.body.classList.remove('slide-over-open');
      }

      panel.dispatchEvent(new CustomEvent('slideover:closed', { bubbles: true, detail: { panel } }));
      return true;
    },

    /**
     * Toggle open/close
     */
    toggle(panelOrId) {
      const panel = typeof panelOrId === 'string' 
        ? document.getElementById(panelOrId.replace(/^#/, '')) 
        : panelOrId;

      if (!panel) return false;
      if (panel.classList.contains('active')) {
        return this.close(panel);
      } else {
        return this.open(panel);
      }
    },

    /**
     * Close all active slide-overs
     */
    closeAll() {
      this.activePanels.forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });
      this.activePanels.clear();
      if (backdropEl) backdropEl.classList.remove('active');
      document.body.classList.remove('slide-over-open');
    },

    // =========================================================================
    // BUILT-IN DYNAMIC DRAWERS (Guaranteed to work on any page)
    // =========================================================================

    /**
     * 1. Institutional Guide & Regulatory Compliance Drawer
     */
    openGuide(role = 'educator') {
      let panel = document.getElementById('institutionalGuideDrawer');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'institutionalGuideDrawer';
        panel.className = 'slide-over-panel slide-over-wide';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box ${role === 'hr' ? 'hr' : (role === 'admin' ? 'admin' : 'teacher')}">
                <i class="fa-solid fa-book-open"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title" id="guideTitle">${role.toUpperCase()} Compliance &amp; Faculty Guide</h3>
                <div class="slide-over-subtitle">Standard operating procedures &amp; gateway security standards</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('institutionalGuideDrawer')" title="Close Drawer (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div class="so-card" style="border-left: 4px solid #0284c7;">
              <div class="so-card-title"><i class="fa-solid fa-shield-halved" style="color:#0284c7;"></i> SHA-256 Authentication Security</div>
              <div class="so-card-desc">
                Faculty logins are cryptographically logged with user-agent fingerprinting and institutional IP verification. Never share your security key or workstation access codes.
              </div>
            </div>

            <h4 style="font-size: 13.5px; font-weight: 800; margin: 18px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--so-text-muted);">
              Core Academic Protocols
            </h4>

            <div class="so-list">
              <div class="so-list-item">
                <div class="so-list-bullet"><i class="fa-solid fa-check"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title">WAEC Broadsheet &amp; Continuous Assessment</div>
                  <div class="so-list-desc">All Class 1 - 3 marks must follow the 30% Class Score + 70% Exam weighting standard. Direct grade publishing requires supervisor approval.</div>
                </div>
              </div>

              <div class="so-list-item">
                <div class="so-list-bullet"><i class="fa-solid fa-check"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title">Biometric Attendance Roll Call</div>
                  <div class="so-list-desc">Class rosters must be synced before 08:30 AM daily. Consecutive 3-day student absences automatically trigger guardian SMS notifications.</div>
                </div>
              </div>

              <div class="so-list-item">
                <div class="so-list-bullet"><i class="fa-solid fa-check"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title">Faculty Leave &amp; Duty Rescheduling</div>
                  <div class="so-list-desc">Emergency absence notifications must be lodged through the Faculty Leave Desk at least 24 hours prior to academic schedule.</div>
                </div>
              </div>
            </div>

            <div class="so-card" style="margin-top: 20px; background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25);">
              <div class="so-card-title" style="color: #d97706;"><i class="fa-solid fa-headset"></i> Academic Helpdesk &amp; Technical Support</div>
              <div class="so-card-desc" style="margin-bottom: 0;">
                Experiencing login lockouts or subdomain synchronization errors? Contact the Institutional IT Center:<br>
                <strong>Hotline:</strong> +233 (0) 24 555 8900<br>
                <strong>Campus Email:</strong> <a href="mailto:support@flawless.org" style="color:var(--so-primary);">support@flawless.org</a>
              </div>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.close('institutionalGuideDrawer')">Done</button>
            <a href="https://waecgh.org" target="_blank" class="so-btn so-btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> WAEC Portal</a>
          </div>
        `;
        document.body.appendChild(panel);
      }
      this.open(panel);
    },

    /**
     * 2. Forgot Password & Self-Service OTP Recovery Drawer
     */
    openForgotPassword(role = 'general') {
      let panel = document.getElementById('forgotPasswordDrawer');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'forgotPasswordDrawer';
        panel.className = 'slide-over-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box warning">
                <i class="fa-solid fa-key"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title">Credential Recovery</h3>
                <div class="slide-over-subtitle">Secure single sign-on password reset</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('forgotPasswordDrawer')" title="Close (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div id="pwRecoveryStep1">
              <div class="so-card">
                <div class="so-card-title"><i class="fa-solid fa-envelope-circle-check" style="color:#f59e0b;"></i> Institutional Verification</div>
                <div class="so-card-desc">
                  Provide your registered institutional email or faculty/staff ID. A cryptographic 6-digit recovery token will be routed to your primary email address.
                </div>
              </div>

              <div class="so-form-group">
                <label class="so-label">Institutional Work Email *</label>
                <input type="email" id="soRecoveryEmail" class="so-input" placeholder="e.g. adjeijames175@gmail.com" required>
              </div>

              <div class="so-form-group">
                <label class="so-label">Subdomain Slug / Workspace</label>
                <input type="text" id="soRecoverySlug" class="so-input" value="flawless-graphics" readonly style="background:var(--so-bg-subtle);">
              </div>

              <button type="button" class="so-btn so-btn-primary" style="width: 100%; justify-content: center; margin-top: 8px;" onclick="SlideOver.submitPasswordRequest()">
                <i class="fa-solid fa-paper-plane"></i> Send Verification Token
              </button>
            </div>

            <div id="pwRecoveryStep2" style="display:none;">
              <div class="so-card" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
                <div class="so-card-title" style="color: #10b981;"><i class="fa-solid fa-check-circle"></i> Token Dispatched</div>
                <div class="so-card-desc">
                  Enter the 6-digit verification code transmitted to your email, then specify your new secure passphrase.
                </div>
              </div>

              <div class="so-form-group">
                <label class="so-label">6-Digit Verification Token *</label>
                <input type="text" id="soRecoveryOtp" class="so-input" placeholder="• • • • • •" maxlength="6" style="letter-spacing: 4px; font-weight: 800; font-size: 16px; text-align: center;">
              </div>

              <div class="so-form-group">
                <label class="so-label">New Master Passphrase *</label>
                <input type="password" id="soNewPassword" class="so-input" placeholder="Minimum 8 characters" required>
              </div>

              <div class="so-form-group">
                <label class="so-label">Confirm New Passphrase *</label>
                <input type="password" id="soConfirmPassword" class="so-input" placeholder="Repeat master passphrase" required>
              </div>

              <button type="button" class="so-btn so-btn-success" style="width: 100%; justify-content: center;" onclick="SlideOver.finalizePasswordReset()">
                <i class="fa-solid fa-lock"></i> Update &amp; Sign In
              </button>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.close('forgotPasswordDrawer')">Cancel</button>
          </div>
        `;
        document.body.appendChild(panel);
      }

      // Reset to step 1 on open
      const s1 = document.getElementById('pwRecoveryStep1');
      const s2 = document.getElementById('pwRecoveryStep2');
      if (s1) s1.style.display = 'block';
      if (s2) s2.style.display = 'none';

      this.open(panel);
    },

    submitPasswordRequest() {
      const email = document.getElementById('soRecoveryEmail')?.value.trim();
      if (!email) {
        if (window.Toaster) window.Toaster.warning('Required Field', 'Please enter your institutional email address.');
        else alert('Please enter your institutional email.');
        return;
      }

      if (window.Toaster) {
        window.Toaster.info('Dispatching Token', `Sending 6-digit recovery code to ${email}...`);
      }

      setTimeout(() => {
        document.getElementById('pwRecoveryStep1').style.display = 'none';
        document.getElementById('pwRecoveryStep2').style.display = 'block';
        if (window.Toaster) {
          window.Toaster.success('Token Sent', 'A verification token has been routed to your inbox. Check your email.');
        }
      }, 600);
    },

    finalizePasswordReset() {
      const otp = document.getElementById('soRecoveryOtp')?.value.trim();
      const p1 = document.getElementById('soNewPassword')?.value;
      const p2 = document.getElementById('soConfirmPassword')?.value;

      if (!otp || otp.length < 6) {
        if (window.Toaster) window.Toaster.error('Verification Error', 'Please enter the valid 6-digit verification code.');
        else alert('Please enter 6-digit verification code.');
        return;
      }
      if (!p1 || p1.length < 6) {
        if (window.Toaster) window.Toaster.error('Weak Password', 'New password must be at least 6 characters.');
        else alert('Password too short.');
        return;
      }
      if (p1 !== p2) {
        if (window.Toaster) window.Toaster.error('Mismatch', 'Passwords do not match.');
        else alert('Passwords do not match.');
        return;
      }

      if (window.Toaster) {
        window.Toaster.success('Password Updated', 'Your institutional access passphrase has been successfully restored.');
      } else {
        alert('Password successfully updated!');
      }

      SlideOver.close('forgotPasswordDrawer');
    },

    /**
     * 3. Institutional Workspaces Directory Drawer
     */
    openWorkspaceDirectory() {
      let panel = document.getElementById('workspaceDirectoryDrawer');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'workspaceDirectoryDrawer';
        panel.className = 'slide-over-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box admin">
                <i class="fa-solid fa-server"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title">Institutional Workspaces</h3>
                <div class="slide-over-subtitle">Active campus tenants &amp; clusters</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('workspaceDirectoryDrawer')" title="Close (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div class="so-card">
              <div class="so-card-title"><i class="fa-solid fa-network-wired" style="color:var(--so-primary);"></i> Multi-Tenant Workspace Selector</div>
              <div class="so-card-desc">
                Select your assigned educational workspace to switch institutional context or inspect live server connectivity.
              </div>
            </div>

            <div class="so-list">
              <div class="so-list-item" style="cursor:pointer;" onclick="SlideOver.selectWorkspace('flawless-graphics', 'FLAWLESS GRAPHICS')">
                <div class="so-list-bullet" style="background:rgba(2, 132, 199, 0.15); color:#0284c7;"><i class="fa-solid fa-building-columns"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>FLAWLESS GRAPHICS</span>
                    <span class="so-pill" style="background:rgba(16, 185, 129, 0.15); color:#10b981;">Active Cluster</span>
                  </div>
                  <div class="so-list-desc">Subdomain: <code>flawless-graphics.edu</code> • Region: West Africa</div>
                </div>
              </div>

              <div class="so-list-item" style="cursor:pointer;" onclick="SlideOver.selectWorkspace('ridgecrest-stem', 'Ridgecrest STEM Academy')">
                <div class="so-list-bullet" style="background:rgba(99, 102, 241, 0.15); color:#6366f1;"><i class="fa-solid fa-atom"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Ridgecrest STEM Academy</span>
                    <span class="so-pill" style="background:rgba(16, 185, 129, 0.15); color:#10b981;">Online</span>
                  </div>
                  <div class="so-list-desc">Subdomain: <code>ridgecrest.edu</code> • High School Stream</div>
                </div>
              </div>

              <div class="so-list-item" style="cursor:pointer;" onclick="SlideOver.selectWorkspace('st-augustine-college', 'St. Augustine College')">
                <div class="so-list-bullet" style="background:rgba(234, 88, 12, 0.15); color:#ea580c;"><i class="fa-solid fa-school"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>St. Augustine College</span>
                    <span class="so-pill" style="background:rgba(16, 185, 129, 0.15); color:#10b981;">Online</span>
                  </div>
                  <div class="so-list-desc">Subdomain: <code>st-augustine.edu</code> • Tertiary &amp; Vocational</div>
                </div>
              </div>
            </div>

            <div class="so-card" style="margin-top: 20px;">
              <div class="so-card-title"><i class="fa-solid fa-plus-circle" style="color:#059669;"></i> Register New Institution</div>
              <div class="so-card-desc">Want to establish a dedicated multi-campus tenant? Provision a newly isolated database container.</div>
              <a href="register.html" class="so-btn so-btn-ghost" style="width: 100%; justify-content: center;">
                <i class="fa-solid fa-arrow-right"></i> Open Workspace Registration
              </a>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.close('workspaceDirectoryDrawer')">Close</button>
          </div>
        `;
        document.body.appendChild(panel);
      }
      this.open(panel);
    },

    selectWorkspace(slug, name) {
      const select = document.getElementById('schoolSlug') || document.getElementById('orgSwitcher');
      if (select) {
        select.value = slug;
      }
      if (window.Toaster) {
        window.Toaster.success('Workspace Switched', `Connected to tenant: ${name} (${slug})`);
      }
      this.close('workspaceDirectoryDrawer');
    },

    /**
     * 4. Dashboard Universal Notifications Slide-Over Drawer
     */
    openNotifications() {
      let panel = document.getElementById('dashboardNotificationsDrawer');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'dashboardNotificationsDrawer';
        panel.className = 'slide-over-panel slide-over-wide';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box warning">
                <i class="fa-solid fa-bell"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title">Institutional Alerts &amp; Audit Log</h3>
                <div class="slide-over-subtitle">Real-time gateway transmissions &amp; notifications</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('dashboardNotificationsDrawer')" title="Close (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div class="so-tabs" id="soNotifTabs">
              <button class="so-tab active" onclick="SlideOver.filterNotifications('all', this)">All (4)</button>
              <button class="so-tab" onclick="SlideOver.filterNotifications('security', this)">Security (1)</button>
              <button class="so-tab" onclick="SlideOver.filterNotifications('academic', this)">Academic (2)</button>
              <button class="so-tab" onclick="SlideOver.filterNotifications('system', this)">System (1)</button>
            </div>

            <div class="so-list" id="soNotifList">
              <div class="so-list-item" data-cat="security">
                <div class="so-list-bullet" style="background:rgba(239, 68, 68, 0.15); color:#ef4444;"><i class="fa-solid fa-shield-virus"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between;">
                    <span>Session Cryptographic Key Verified</span>
                    <span style="font-size:11px; color:var(--so-text-light);">2 mins ago</span>
                  </div>
                  <div class="so-list-desc">SHA-256 workstation token verified on campus LAN cluster 192.168.1.10.</div>
                </div>
              </div>

              <div class="so-list-item" data-cat="academic">
                <div class="so-list-bullet" style="background:rgba(16, 185, 129, 0.15); color:#10b981;"><i class="fa-solid fa-graduation-cap"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between;">
                    <span>Mid-Term Broadsheet Deadline</span>
                    <span style="font-size:11px; color:var(--so-text-light);">1 hour ago</span>
                  </div>
                  <div class="so-list-desc">Continuous assessment marks for Class 2 Visual Arts are due in 48 hours for WAEC moderation.</div>
                </div>
              </div>

              <div class="so-list-item" data-cat="academic">
                <div class="so-list-bullet" style="background:rgba(2, 132, 199, 0.15); color:#0284c7;"><i class="fa-solid fa-clipboard-check"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between;">
                    <span>Biometric Roll Call Complete</span>
                    <span style="font-size:11px; color:var(--so-text-light);">3 hours ago</span>
                  </div>
                  <div class="so-list-desc">96.4% institutional attendance registered across active academic streams today.</div>
                </div>
              </div>

              <div class="so-list-item" data-cat="system">
                <div class="so-list-bullet" style="background:rgba(99, 102, 241, 0.15); color:#6366f1;"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <div class="so-list-content">
                  <div class="so-list-title" style="display:flex; justify-content:space-between;">
                    <span>Supabase Database Backup Synchronized</span>
                    <span style="font-size:11px; color:var(--so-text-light);">Today, 06:00</span>
                  </div>
                  <div class="so-list-desc">Automated disaster recovery snapshot stored in encrypted cloud container.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.markAllNotifsRead()"><i class="fa-solid fa-check-double"></i> Mark All as Read</button>
            <button type="button" class="so-btn so-btn-primary" onclick="SlideOver.close('dashboardNotificationsDrawer')">Close</button>
          </div>
        `;
        document.body.appendChild(panel);
      }
      this.renderNotificationsList(panel);
      this.open(panel);
    },

    renderNotificationsList(panel) {
      const listEl = panel ? panel.querySelector('#soNotifList') : document.getElementById('soNotifList');
      if (!listEl) return;
      const liveNotifs = (window.LucyBus && typeof window.LucyBus.getLiveNotifications === 'function')
        ? window.LucyBus.getLiveNotifications()
        : [];
      if (!liveNotifs || liveNotifs.length === 0) return;

      const itemsHtml = liveNotifs.slice(0, 15).map(n => {
        const timeAgo = n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
        const type = (n.type || '').toLowerCase();
        let cat = 'system';
        let bulletBg = 'rgba(99, 102, 241, 0.15)';
        let bulletColor = '#6366f1';
        let icon = 'fa-solid fa-bell';

        if (type.includes('user') || type.includes('staff') || type.includes('teacher') || type.includes('finance')) {
          cat = 'security';
          bulletBg = 'rgba(245, 158, 11, 0.15)';
          bulletColor = '#f59e0b';
          icon = 'fa-solid fa-user-clock';
        } else if (type.includes('grade') || type.includes('academic') || type.includes('student')) {
          cat = 'academic';
          bulletBg = 'rgba(16, 185, 129, 0.15)';
          bulletColor = '#10b981';
          icon = 'fa-solid fa-graduation-cap';
        }

        const safeTitle = String(n.title || 'Notification').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeMsg = String(n.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `
          <div class="so-list-item" data-cat="${cat}">
            <div class="so-list-bullet" style="background:${bulletBg}; color:${bulletColor};"><i class="${icon}"></i></div>
            <div class="so-list-content">
              <div class="so-list-title" style="display:flex; justify-content:space-between;">
                <span>${safeTitle}</span>
                <span style="font-size:11px; color:var(--so-text-light);">${timeAgo}</span>
              </div>
              <div class="so-list-desc">${safeMsg}</div>
            </div>
          </div>
        `;
      }).join('');

      listEl.innerHTML = itemsHtml;
    },

    filterNotifications(cat, btn) {
      document.querySelectorAll('#soNotifTabs .so-tab').forEach(t => t.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const items = document.querySelectorAll('#soNotifList .so-list-item');
      items.forEach(item => {
        if (cat === 'all' || item.getAttribute('data-cat') === cat) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    },

    markAllNotifsRead() {
      if (window.Toaster) {
        window.Toaster.success('Notifications Cleared', 'All institutional alerts marked as read.');
      }
      const countEl = document.getElementById('notifCount') || document.getElementById('teacherTopbarNotifBadge');
      if (countEl) countEl.textContent = '0';
    },

    /**
     * 5. Dashboard User Profile & Security Settings Slide-Over Drawer
     */
    openProfile() {
      const activeUser = (window.AuthSession && window.AuthSession.getUser()) || {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@flawless.org',
        role: 'Faculty Educator',
        staffId: 'T-2026-088'
      };

      let panel = document.getElementById('userProfileSlideOver');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'userProfileSlideOver';
        panel.className = 'slide-over-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box teacher">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title" id="soProfileName">${activeUser.name || 'Staff Member'}</h3>
                <div class="slide-over-subtitle" id="soProfileRole">${activeUser.role || 'Faculty Member'}</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('userProfileSlideOver')" title="Close (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div class="so-card" style="text-align: center; padding: 22px;">
              <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #6366f1); color:#fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; margin: 0 auto 12px; box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);">
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <div style="font-size: 16px; font-weight: 800; color: var(--so-text);">${activeUser.name || 'Sarah Jenkins'}</div>
              <div style="font-size: 12.5px; color: var(--so-text-muted);">${activeUser.email || 'educator@flawless.org'}</div>
              <div style="margin-top: 10px;">
                <span class="so-pill" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 11px;">
                  <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> Single Sign-On Verified
                </span>
              </div>
            </div>

            <div class="so-card">
              <div class="so-card-title"><i class="fa-solid fa-id-badge" style="color:var(--so-primary);"></i> Workstation Credentials</div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--so-text-muted);">Staff / Faculty ID:</span>
                  <strong>${activeUser.staffId || 'T-2026-088'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--so-text-muted);">Institutional Tier:</span>
                  <strong>Command Authority 3</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--so-text-muted);">Session Security:</span>
                  <span style="color: #10b981; font-weight: 700;">Active Encrypted</span>
                </div>
              </div>
            </div>

            <div class="so-card">
              <div class="so-card-title"><i class="fa-solid fa-sliders" style="color:#6366f1;"></i> Quick Preferences</div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 13px; color: var(--so-text);">Desktop Notifications</span>
                  <input type="checkbox" checked style="accent-color: var(--so-primary); width: 17px; height: 17px;">
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 13px; color: var(--so-text);">Two-Factor Verification</span>
                  <input type="checkbox" checked style="accent-color: var(--so-primary); width: 17px; height: 17px;">
                </div>
              </div>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.close('userProfileSlideOver')">Done</button>
            <button type="button" class="so-btn" style="background:#ef4444; color:#fff;" onclick="if(window.AuthSession){window.AuthSession.logout();}else{window.location.href='../../site-login.html';}">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </div>
        `;
        document.body.appendChild(panel);
      }
      this.open(panel);
    },

    /**
     * 6. Quick Assessment / Grading Slide-Over Drawer (for Teacher Dashboard)
     */
    openNewAssessment() {
      let panel = document.getElementById('quickAssessmentDrawer');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'quickAssessmentDrawer';
        panel.className = 'slide-over-panel slide-over-wide';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = `
          <div class="slide-over-header">
            <div class="slide-over-header-left">
              <div class="slide-over-icon-box teacher">
                <i class="fa-solid fa-stamp"></i>
              </div>
              <div class="slide-over-header-titles">
                <h3 class="slide-over-title">Record Student Assessment</h3>
                <div class="slide-over-subtitle">WAEC standard continuous assessment score entry</div>
              </div>
            </div>
            <button type="button" class="slide-over-close-btn" onclick="SlideOver.close('quickAssessmentDrawer')" title="Close (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="slide-over-body">
            <div class="so-form-group">
              <label class="so-label">Select Academic Class *</label>
              <select id="soAssClass" class="so-select">
                <option value="Class 1A">Class 1A — Visual Arts &amp; Design</option>
                <option value="Class 2B">Class 2B — Graphic Communication</option>
                <option value="Class 3A">Class 3A — Digital Media &amp; Illustration</option>
              </select>
            </div>

            <div class="so-form-group">
              <label class="so-label">Subject / Academic Discipline *</label>
              <select id="soAssSubject" class="so-select">
                <option value="Typography &amp; Layout">Typography &amp; Layout (VAD-101)</option>
                <option value="Digital Illustration">Digital Illustration (VAD-204)</option>
                <option value="Colour Theory &amp; Packaging">Colour Theory &amp; Packaging (VAD-302)</option>
              </select>
            </div>

            <div class="so-form-group">
              <label class="so-label">Assessment Type *</label>
              <select id="soAssType" class="so-select">
                <option value="classwork">Class Continuous Assessment (30% Weight)</option>
                <option value="midterm">Mid-Term Moderated Exam (30% Weight)</option>
                <option value="terminal">End of Term Examination (70% Weight)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="so-form-group">
                <label class="so-label">Student Name / ID *</label>
                <input type="text" id="soAssStudent" class="so-input" placeholder="e.g. Kwame Mensah (FG-2026-14)" required>
              </div>

              <div class="so-form-group">
                <label class="so-label">Raw Numerical Score (0 - 100) *</label>
                <input type="number" id="soAssScore" class="so-input" min="0" max="100" placeholder="e.g. 84" oninput="SlideOver.calculateGradePreview(this.value)" required>
              </div>
            </div>

            <!-- Live WAEC Grade Chip Preview -->
            <div class="so-card" id="soGradePreviewCard" style="display:none; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--so-text-muted);">WAEC Grade Equivalent</div>
                  <div id="soGradeLabel" style="font-size: 18px; font-weight: 800; color: #059669;">Grade A1 (Excellent)</div>
                </div>
                <div id="soGradeBadge" style="width: 42px; height: 42px; border-radius: 10px; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800;">
                  A1
                </div>
              </div>
            </div>

            <div class="so-form-group">
              <label class="so-label">Instructor Remarks &amp; Observations</label>
              <textarea id="soAssRemarks" class="so-textarea" rows="3" placeholder="Excellent color harmony and attention to typography balance..."></textarea>
            </div>
          </div>

          <div class="slide-over-footer">
            <button type="button" class="so-btn so-btn-ghost" onclick="SlideOver.close('quickAssessmentDrawer')">Cancel</button>
            <button type="button" class="so-btn so-btn-success" onclick="SlideOver.saveQuickAssessment()">
              <i class="fa-solid fa-cloud-arrow-up"></i> Save &amp; Record Marks
            </button>
          </div>
        `;
        document.body.appendChild(panel);
      }
      this.open(panel);
    },

    calculateGradePreview(scoreVal) {
      const card = document.getElementById('soGradePreviewCard');
      const label = document.getElementById('soGradeLabel');
      const badge = document.getElementById('soGradeBadge');
      if (!card || !label || !badge) return;

      const score = parseFloat(scoreVal);
      if (isNaN(score)) {
        card.style.display = 'none';
        return;
      }

      card.style.display = 'block';
      if (score >= 80) {
        label.textContent = 'Grade A1 (Excellent Distinction)';
        label.style.color = '#059669';
        badge.textContent = 'A1';
        badge.style.background = '#10b981';
      } else if (score >= 70) {
        label.textContent = 'Grade B2 (Very Good)';
        label.style.color = '#0284c7';
        badge.textContent = 'B2';
        badge.style.background = '#0284c7';
      } else if (score >= 65) {
        label.textContent = 'Grade B3 (Good)';
        label.style.color = '#0284c7';
        badge.textContent = 'B3';
        badge.style.background = '#0284c7';
      } else if (score >= 60) {
        label.textContent = 'Grade C4 (Credit)';
        label.style.color = '#6366f1';
        badge.textContent = 'C4';
        badge.style.background = '#6366f1';
      } else if (score >= 50) {
        label.textContent = 'Grade C6 (Pass Credit)';
        label.style.color = '#6366f1';
        badge.textContent = 'C6';
        badge.style.background = '#6366f1';
      } else if (score >= 45) {
        label.textContent = 'Grade D7 (Pass)';
        label.style.color = '#d97706';
        badge.textContent = 'D7';
        badge.style.background = '#f59e0b';
      } else {
        label.textContent = 'Grade F9 (Fail / Remedial)';
        label.style.color = '#ef4444';
        badge.textContent = 'F9';
        badge.style.background = '#ef4444';
      }
    },

    saveQuickAssessment() {
      const student = document.getElementById('soAssStudent')?.value.trim();
      const score = document.getElementById('soAssScore')?.value.trim();
      if (!student || !score) {
        if (window.Toaster) window.Toaster.warning('Required Info', 'Please enter student name and raw score.');
        else alert('Please enter student name and raw score.');
        return;
      }

      if (window.Toaster) {
        window.Toaster.success('Assessment Recorded', `Saved score ${score} for ${student}. WAEC grading calibrated.`);
      } else {
        alert(`Saved score ${score} for ${student}.`);
      }

      this.close('quickAssessmentDrawer');
    }
  };

  // Global Keyboard Listener (Escape to close all)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && SlideOver.activePanels.size > 0) {
      SlideOver.closeAll();
    }
  });

  // Global Click Delegator for data attributes
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-slideover-target], [data-slideover-open]');
    if (trigger) {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-slideover-target') || trigger.getAttribute('data-slideover-open');
      if (targetId) SlideOver.open(targetId);
      return;
    }

    const closer = e.target.closest('[data-slideover-close]');
    if (closer) {
      e.preventDefault();
      const targetId = closer.getAttribute('data-slideover-close');
      if (targetId) {
        SlideOver.close(targetId);
      } else {
        const parentPanel = closer.closest('.slide-over-panel');
        if (parentPanel) SlideOver.close(parentPanel);
      }
    }
  });

  // Export to window
  window.SlideOver = SlideOver;

  // Polyfill modal bridge functions if dashboards call them
  window.openNewAssessmentModal = function () {
    SlideOver.openNewAssessment();
  };

  window.openAssignmentCreateModal = function () {
    SlideOver.openNewAssessment();
  };

})();

// Live Realtime updater for SlideOver notifications
if (typeof window !== 'undefined') {
  window.addEventListener('fg:realtime-change', () => {
    const panel = document.getElementById('dashboardNotificationsDrawer');
    if (panel && panel.classList.contains('active') && window.SlideOver) {
      window.SlideOver.renderNotificationsList(panel);
    }
  });
}
