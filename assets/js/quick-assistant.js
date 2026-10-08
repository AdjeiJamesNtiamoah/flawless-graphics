/**
 * FLAWLESS GRAPHICS — QUICK ASSISTANT HUB
 * Handles Subscriptions, Help Desk, Interactive Project Tour, & Essential Features
 */

(function () {
  'use strict';

  // Determine relative root path based on current script or location
  function getRootPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/pages/teacher/') || p.includes('/pages/hr/') || p.includes('/pages/finance/')) {
      return '../../';
    }
    if (p.includes('/pages/')) {
      return '../';
    }
    return '';
  }

  const rootPrefix = getRootPrefix();

  // Auto-inject Toaster CSS & JS if not already loaded
  function ensureToaster() {
    if (!document.querySelector('link[href*="toaster.css"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = rootPrefix + 'assets/css/toaster.css';
      document.head.appendChild(l);
    }
    if (!window.Toaster) {
      const s = document.createElement('script');
      s.src = rootPrefix + 'assets/js/toaster.js';
      document.head.appendChild(s);
    }
  }

  // Create markup dynamically
  function buildAssistantMarkup() {
    const container = document.createElement('div');
    container.id = 'quickAssistantContainer';

    container.innerHTML = `
      <!-- Floating Action Button (FAB) -->
      <button type="button" class="quick-assistant-fab" id="quickAssistantFab" title="Quick Assistant & Services (Alt + A)" aria-label="Quick Assistant">
        <i class="fa-solid fa-wand-magic-sparkles fab-icon" id="quickAssistantFabIcon"></i>
        <span class="fab-badge" title="Services Active"></span>
      </button>

      <!-- Backdrop Overlay -->
      <div class="quick-assistant-backdrop" id="quickAssistantBackdrop"></div>

      <!-- Assistant Glassmorphic Panel -->
      <div class="quick-assistant-panel" id="quickAssistantPanel" role="dialog" aria-modal="true" aria-labelledby="assistantHeaderTitle">
        <!-- Header -->
        <div class="assistant-header">
          <div class="assistant-header-title">
            <div class="brand-icon" id="assistantBrandIcon"><i class="fa-solid fa-shapes"></i></div>
            <div>
              <h3 id="assistantHeaderTitle">FLAWLESS Quick Assistant</h3>
              <p id="assistantSubTitle"><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10b981; margin-right:4px;"></span>Enterprise Hub • Operational</p>
            </div>
          </div>
          <button type="button" class="assistant-close-btn" id="quickAssistantCloseBtn" title="Close (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <nav class="assistant-nav" id="assistantNav">
          <button type="button" class="assistant-nav-btn active" data-tab="tab-subscriptions">
            <i class="fa-solid fa-gem"></i>
            <span>Plans</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-help">
            <i class="fa-solid fa-circle-question"></i>
            <span>Help</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-tour">
            <i class="fa-solid fa-compass"></i>
            <span>Tour</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-essentials">
            <i class="fa-solid fa-sliders"></i>
            <span>Essentials</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-toasts">
            <i class="fa-solid fa-bell"></i>
            <span>Toasts</span>
          </button>
        </nav>

        <!-- Body Viewports -->
        <div class="assistant-body">
          <!-- 1. Subscriptions Tab -->
          <div class="assistant-tab-pane active" id="tab-subscriptions">
            <div class="sub-plan-card">
              <div class="sub-plan-header">
                <div>
                  <h4 style="margin:0; font-size:15px; font-weight:800;">Enterprise Sovereign</h4>
                  <div style="font-size:11px; color:#64748b;">Annual Institutional License</div>
                </div>
                <span class="sub-badge-active"><i class="fa-solid fa-circle-check"></i> Active</span>
              </div>

              <div class="sub-metric-row">
                <span>Staff & Teacher Seats</span>
                <span class="sub-metric-val">48 / 100 Active</span>
              </div>
              <div class="sub-progress-bar">
                <div class="sub-progress-fill" style="width: 48%;"></div>
              </div>

              <div class="sub-metric-row">
                <span>Secure Cloud Vault</span>
                <span class="sub-metric-val">14.2 GB / 500 GB</span>
              </div>
              <div class="sub-progress-bar">
                <div class="sub-progress-fill" style="width: 14%;"></div>
              </div>

              <ul class="sub-features-list">
                <li><i class="fa-solid fa-check"></i> Ghana GRA PAYE & Tier 1/2 Automated Engine</li>
                <li><i class="fa-solid fa-check"></i> Unlimited Real-Time SMS Parent Dispatches</li>
                <li><i class="fa-solid fa-check"></i> Realtime Supabase PostgreSQL Replication</li>
                <li><i class="fa-solid fa-check"></i> Dedicated SLA & Institutional Support Hotline</li>
              </ul>

              <button type="button" class="assistant-btn-primary" id="btnManagePlan" onclick="window.QuickAssistant.showNotification('Redirecting to Enterprise Licensing Portal...')">
                <i class="fa-solid fa-crown"></i> Manage Subscription & Seats
              </button>
              <button type="button" class="assistant-btn-outline" onclick="window.QuickAssistant.showNotification('Tax invoice downloaded to downloads folder.')">
                <i class="fa-solid fa-file-invoice-dollar"></i> Download Latest Tax Invoice
              </button>
            </div>
          </div>

          <!-- 2. Help Desk Tab -->
          <div class="assistant-tab-pane" id="tab-help">
            <input type="text" class="help-search-input" id="helpSearchInput" placeholder="Search guides, FAQs, or troubleshooting..." oninput="window.QuickAssistant.filterHelp(this.value)">

            <div id="helpFaqList">
              <div class="help-faq-item">
                <div class="help-faq-question" onclick="window.QuickAssistant.toggleFaq(this)">
                  <span>How do I enrol and manage student records?</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="help-faq-answer">
                  Navigate to <strong>Teacher Dashboard</strong> or <strong>Teacher Profile</strong>, click <strong>"Register Student"</strong>. Fill in personal demographics, class assignment, and emergency contact details. The header remains locked while scrolling.
                </div>
              </div>

              <div class="help-faq-item">
                <div class="help-faq-question" onclick="window.QuickAssistant.toggleFaq(this)">
                  <span>What if I do not receive the authentication email?</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="help-faq-answer">
                  Every registration and verification modal is equipped with an <strong>Instant Code Card</strong> with a 1-click <strong>"Auto-fill Code"</strong> button and a 5-minute countdown timer. You are never blocked from completing registration!
                </div>
              </div>

              <div class="help-faq-item">
                <div class="help-faq-question" onclick="window.QuickAssistant.toggleFaq(this)">
                  <span>How does offline local fallback work?</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="help-faq-answer">
                  The system is built local-first. If internet connectivity drops or Supabase credentials are not yet configured, all student profiles, fee collections, and staff records persist securely in browser storage and synchronize when back online.
                </div>
              </div>

              <div class="help-faq-item">
                <div class="help-faq-question" onclick="window.QuickAssistant.toggleFaq(this)">
                  <span>How do I process Ghana GRA PAYE & SSNIT?</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="help-faq-answer">
                  Open the <strong>HR Operations Portal</strong> and select <strong>Payroll & Statutory Compliance</strong>. The system automatically computes 5.5% Tier 1, 5% Tier 2, and Ghana income tax brackets with one-click bank CSV export.
                </div>
              </div>
            </div>

            <div style="margin-top:14px; padding:12px; border-radius:10px; background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.18);">
              <div style="font-size:12px; font-weight:700; color:#2563eb; margin-bottom:4px;"><i class="fa-solid fa-headset"></i> Need Direct Technical Assistance?</div>
              <div style="font-size:11.5px; color:#64748b; line-height:1.4; margin-bottom:8px;">Our systems team is available 24/7 for deployment support and training.</div>
              <div style="display:flex; gap:8px;">
                <a href="mailto:support@flawlessgraphics.com" class="assistant-btn-primary" style="text-decoration:none; padding:6px 10px; font-size:11.5px;">
                  <i class="fa-regular fa-envelope"></i> Email Desk
                </a>
                <a href="tel:+233240000000" class="assistant-btn-outline" style="text-decoration:none; margin-top:0; padding:6px 10px; font-size:11.5px;">
                  <i class="fa-solid fa-phone"></i> Hotline
                </a>
              </div>
            </div>
          </div>

          <!-- 3. Project Tour Tab -->
          <div class="assistant-tab-pane" id="tab-tour">
            <div class="tour-banner-card">
              <i class="fa-solid fa-compass-drafting" style="font-size:28px; color:#72efdd; margin-bottom:8px;"></i>
              <h4 style="margin:0 0 4px; font-size:16px; font-weight:800;">Guided Interactive Tour</h4>
              <p style="margin:0; font-size:11.5px; opacity:0.85;">Explore the core operational pillars of the FLAWLESS Management Suite.</p>
              <button type="button" class="assistant-btn-primary" style="margin-top:12px; background:#72efdd; color:#1e1b4b;" onclick="window.QuickAssistant.startProjectTour()">
                <i class="fa-solid fa-play"></i> Launch Guided Tour
              </button>
            </div>

            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:8px;">Tour Highlights</div>
            <div class="tour-steps-timeline">
              <div class="tour-step-card">
                <div class="tour-step-badge">1</div>
                <div>
                  <strong style="font-size:12px;">Executive Central Hub</strong>
                  <div style="font-size:11px; color:#64748b;">Unified welcome portal with single sign-on into Academic, HR, and Treasury consoles.</div>
                </div>
              </div>
              <div class="tour-step-card">
                <div class="tour-step-badge">2</div>
                <div>
                  <strong style="font-size:12px;">Teacher & Classroom Portal</strong>
                  <div style="font-size:11px; color:#64748b;">Pinned modal headers, comprehensive student enrolment, grade books, and guardian directory.</div>
                </div>
              </div>
              <div class="tour-step-card">
                <div class="tour-step-badge">3</div>
                <div>
                  <strong style="font-size:12px;">HR Operations & Statutory Engine</strong>
                  <div style="font-size:11px; color:#64748b;">Staff roster, biometric punch logs, leave approvals, and Ghana GRA PAYE calculations.</div>
                </div>
              </div>
              <div class="tour-step-card">
                <div class="tour-step-badge">4</div>
                <div>
                  <strong style="font-size:12px;">Finance & School Fees Treasury</strong>
                  <div style="font-size:11px; color:#64748b;">Student fee billing ledger, instant receipt issuance, expenditure, and cash reconciliation.</div>
                </div>
              </div>
              <div class="tour-step-card">
                <div class="tour-step-badge">5</div>
                <div>
                  <strong style="font-size:12px;">Cloud Resiliency & Fast Onboarding</strong>
                  <div style="font-size:11px; color:#64748b;">Local-first persistence, OTP instant display, and Supabase cloud sync.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Essential Features Tab -->
          <div class="assistant-tab-pane" id="tab-essentials">
            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:8px;">Fast Portal Jump</div>
            <div class="essentials-grid">
              <a href="${rootPrefix}welcome.html" class="essential-card">
                <i class="fa-solid fa-house-chimney"></i>
                <strong>Central Hub</strong>
                <span>Unified Executive Portal</span>
              </a>
              <a href="${rootPrefix}pages/teacher/teacher-dashboard.html" class="essential-card">
                <i class="fa-solid fa-chalkboard-user"></i>
                <strong>Teacher Portal</strong>
                <span>Classroom & Students</span>
              </a>
              <a href="${rootPrefix}pages/hr/hr-dashboard.html" class="essential-card">
                <i class="fa-solid fa-users-gear"></i>
                <strong>HR Operations</strong>
                <span>Workforce & Payroll</span>
              </a>
              <a href="${rootPrefix}pages/finance/finance-dashboard.html" class="essential-card">
                <i class="fa-solid fa-vault"></i>
                <strong>Finance Treasury</strong>
                <span>Fee Ledger & Reports</span>
              </a>
              <a href="javascript:void(0)" class="essential-card" onclick="window.QuickAssistant.toggle(false); if(typeof window.openAddClassModal==='function'){window.openAddClassModal();}else if(window.SlideOver){window.SlideOver.open('addClassDrawer');}else{window.location.href='${rootPrefix}pages/hr/hr-dashboard.html';}">
                <i class="fa-solid fa-folder-plus" style="color:#10b981;"></i>
                <strong>Add Classroom</strong>
                <span>New Academic Cohort</span>
              </a>
            </div>

            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin:14px 0 8px;">Organization Identity & Logo</div>
            <div style="padding:14px; border-radius:12px; background:rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.08); margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                <div id="qaBrandingLogoPreview" style="width:46px; height:46px; border-radius:10px; background:rgba(37,99,235,0.08); border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                  <i class="fa-solid fa-building" style="color:#2563eb; font-size:20px;"></i>
                </div>
                <div style="flex:1;">
                  <div style="font-size:12px; font-weight:700; color:#0f172a;" id="qaBrandingOrgNameDisplay">FLAWLESS GRAPHICS</div>
                  <div style="font-size:11px; color:#64748b;">Uploaded logo reflects on all portals & pages</div>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <input type="text" id="qaInputOrgName" placeholder="Enter Organization Name" style="padding:7px 10px; font-size:12px; border:1px solid rgba(0,0,0,0.14); border-radius:8px; width:100%; box-sizing:border-box;">
                <input type="file" id="qaInputOrgLogo" accept="image/*" style="display:none;" onchange="window.QuickAssistant.handleLogoUpload(event)">
                <div style="display:flex; gap:6px;">
                  <button type="button" class="assistant-btn-outline" style="font-size:11px; padding:6px 10px; margin-top:0; flex:1;" onclick="document.getElementById('qaInputOrgLogo').click()">
                    <i class="fa-solid fa-camera"></i> Change Logo
                  </button>
                  <button type="button" class="assistant-btn-primary" style="font-size:11px; padding:6px 10px; margin-top:0; flex:1;" onclick="window.QuickAssistant.saveBranding()">
                    <i class="fa-solid fa-check"></i> Save Branding
                  </button>
                </div>
              </div>
            </div>

            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin:14px 0 8px;">System Health & Cloud Ping</div>
            <div style="padding:12px; border-radius:12px; background:rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.08); margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:600;">Supabase Cloud Ping:</span>
                <span id="assistantCloudPing" style="font-size:12px; font-weight:700; color:#10b981;">Checking...</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:12px; font-weight:600;">Offline Local Storage:</span>
                <span id="assistantStorageSize" style="font-size:12px; font-weight:700; color:#2563eb;">Calculating...</span>
              </div>
              <button type="button" class="assistant-btn-outline" style="font-size:11px; padding:6px 10px; margin-top:0;" onclick="window.QuickAssistant.testDiagnostics()">
                <i class="fa-solid fa-arrows-rotate"></i> Re-test Diagnostics
              </button>
            </div>

            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin:14px 0 8px;">Keyboard Shortcuts</div>
            <div style="display:flex; flex-direction:column; gap:6px; font-size:11.5px; color:#64748b; margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between;"><span>Toggle Quick Assistant</span><kbd style="background:rgba(0,0,0,0.08); padding:2px 6px; border-radius:4px; font-weight:700; color:#0f172a;">Alt + A</kbd></div>
              <div style="display:flex; justify-content:space-between;"><span>Close Active Dialog</span><kbd style="background:rgba(0,0,0,0.08); padding:2px 6px; border-radius:4px; font-weight:700; color:#0f172a;">Esc</kbd></div>
            </div>

            <button type="button" class="assistant-btn-outline" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="window.QuickAssistant.resetDemoCache()">
              <i class="fa-solid fa-trash-can"></i> Clear Demo Cache & Local Storage
            </button>
          </div>

          <!-- 5. Notifications & Toast Settings Tab -->
          <div class="assistant-tab-pane" id="tab-toasts">
            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:8px;">System Alerts & Toasts</div>
            
            <div class="toast-cfg-card">
              <div class="toast-cfg-row">
                <div class="toast-cfg-label">
                  <strong>Enable Toast Alerts</strong>
                  <span>Display animated pop-up messages</span>
                </div>
                <label class="toast-switch">
                  <input type="checkbox" id="qaToastToggle" checked onchange="window.QuickAssistant.updateToastSetting('enabled', this.checked)">
                  <span class="toast-slider"></span>
                </label>
              </div>

              <div class="toast-cfg-row">
                <div class="toast-cfg-label">
                  <strong>Audio Chimes</strong>
                  <span>Synthesized Web Audio chime on alert</span>
                </div>
                <label class="toast-switch">
                  <input type="checkbox" id="qaSoundToggle" checked onchange="window.QuickAssistant.updateToastSetting('sound', this.checked)">
                  <span class="toast-slider"></span>
                </label>
              </div>

              <div class="toast-cfg-row">
                <div class="toast-cfg-label">
                  <strong>Do Not Disturb (Mute)</strong>
                  <span>Silence non-critical popups</span>
                </div>
                <label class="toast-switch">
                  <input type="checkbox" id="qaDndToggle" onchange="window.QuickAssistant.updateToastSetting('dnd', this.checked)">
                  <span class="toast-slider"></span>
                </label>
              </div>

              <div class="toast-cfg-row">
                <div class="toast-cfg-label">
                  <strong>Countdown Progress Bar</strong>
                  <span>Visual timer line on toast bottom</span>
                </div>
                <label class="toast-switch">
                  <input type="checkbox" id="qaProgressToggle" checked onchange="window.QuickAssistant.updateToastSetting('showProgress', this.checked)">
                  <span class="toast-slider"></span>
                </label>
              </div>
            </div>

            <div class="toast-cfg-title"><i class="fa-solid fa-arrows-to-dot"></i> Screen Placement</div>
            <div class="toast-pos-grid">
              <button type="button" class="toast-pos-btn" data-pos="top-left" onclick="window.QuickAssistant.setToastPosition('top-left')">
                <span class="toast-pos-dot"></span> Top Left
              </button>
              <button type="button" class="toast-pos-btn active" data-pos="top-center" onclick="window.QuickAssistant.setToastPosition('top-center')">
                <span class="toast-pos-dot"></span> Top Center
              </button>
              <button type="button" class="toast-pos-btn" data-pos="top-right" onclick="window.QuickAssistant.setToastPosition('top-right')">
                <span class="toast-pos-dot"></span> Top Right
              </button>
              <button type="button" class="toast-pos-btn" data-pos="bottom-left" onclick="window.QuickAssistant.setToastPosition('bottom-left')">
                <span class="toast-pos-dot"></span> Bottom Left
              </button>
              <button type="button" class="toast-pos-btn" data-pos="bottom-center" onclick="window.QuickAssistant.setToastPosition('bottom-center')">
                <span class="toast-pos-dot"></span> Bottom Center
              </button>
              <button type="button" class="toast-pos-btn" data-pos="bottom-right" onclick="window.QuickAssistant.setToastPosition('bottom-right')">
                <span class="toast-pos-dot"></span> Bottom Right
              </button>
            </div>

            <div class="toast-cfg-title"><i class="fa-solid fa-stopwatch"></i> Auto-Dismiss Duration</div>
            <div class="toast-chips-row">
              <button type="button" class="toast-chip-btn" data-dur="2000" onclick="window.QuickAssistant.setToastDuration(2000)">2s (Brief)</button>
              <button type="button" class="toast-chip-btn active" data-dur="4000" onclick="window.QuickAssistant.setToastDuration(4000)">4s (Standard)</button>
              <button type="button" class="toast-chip-btn" data-dur="6000" onclick="window.QuickAssistant.setToastDuration(6000)">6s (Long)</button>
              <button type="button" class="toast-chip-btn" data-dur="0" onclick="window.QuickAssistant.setToastDuration(0)">Sticky</button>
            </div>

            <div class="toast-cfg-title"><i class="fa-solid fa-vial-circle-check"></i> Test Live Alerts</div>
            <div class="toast-test-grid">
              <button type="button" class="toast-test-btn test-success" onclick="window.QuickAssistant.triggerTestToast('success')">
                <i class="fa-solid fa-circle-check"></i> Test Success
              </button>
              <button type="button" class="toast-test-btn test-info" onclick="window.QuickAssistant.triggerTestToast('info')">
                <i class="fa-solid fa-circle-info"></i> Test Info
              </button>
              <button type="button" class="toast-test-btn test-warning" onclick="window.QuickAssistant.triggerTestToast('warning')">
                <i class="fa-solid fa-triangle-exclamation"></i> Test Warning
              </button>
              <button type="button" class="toast-test-btn test-error" onclick="window.QuickAssistant.triggerTestToast('error')">
                <i class="fa-solid fa-circle-xmark"></i> Test Error
              </button>
              <button type="button" class="toast-test-btn test-troubleshoot" onclick="window.QuickAssistant.triggerTestToast('troubleshoot')" title="Demonstrate interactive troubleshoot/error toast with diagnostics">
                <i class="fa-solid fa-wrench"></i> Test Troubleshoot / Error Toast
              </button>
            </div>

            <div style="margin-top:14px; display:flex; gap:8px;">
              <button type="button" class="assistant-btn-outline" style="flex:1; margin-top:0; font-size:11.5px; padding:7px 10px;" onclick="window.QuickAssistant.resetToastSettings()">
                <i class="fa-solid fa-arrow-rotate-left"></i> Reset Defaults
              </button>
              <button type="button" class="assistant-btn-outline" style="flex:1; margin-top:0; font-size:11.5px; padding:7px 10px;" onclick="window.QuickAssistant.clearAllToasts()">
                <i class="fa-solid fa-broom"></i> Clear Active
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Spotlight Guided Tour Backdrop -->
      <div class="tour-spotlight-overlay" id="tourSpotlightOverlay" onclick="window.QuickAssistant.stopProjectTour()"></div>

      <!-- Glowing Spotlight Beacon over Target Button -->
      <div class="tour-spotlight-beacon" id="tourSpotlightBeacon">
        <div class="tour-target-pin" title="Active Focus Target">
          <i class="fa-solid fa-location-crosshairs"></i>
        </div>
      </div>

      <!-- Dynamic Popover Card Pointing at Target Button -->
      <div class="tour-popover-card" id="tourPopoverCard">
        <div class="tour-pointer-arrow" id="tourPointerArrow"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span id="tourStepBadge" style="background:#2563eb; color:#fff; font-size:11px; font-weight:800; padding:2px 8px; border-radius:12px;">Step 1</span>
            <h4 id="tourStepTitle" style="margin:0; font-size:15px; font-weight:800;">Target Button</h4>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="tour-autoroll-btn" id="tourAutoRollBtn" onclick="window.QuickAssistant.toggleAutoRoll()" title="Toggle Auto-Roll Through Buttons">
              <i class="fa-solid fa-play" id="tourRollIcon"></i> <span id="tourRollLabel">Auto-Roll</span>
            </button>
            <button type="button" onclick="window.QuickAssistant.stopProjectTour()" style="border:none; background:none; font-size:18px; color:#64748b; cursor:pointer;" title="Exit Tour"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <div id="tourStepContent" style="font-size:13px; line-height:1.55; color:#475569; margin-bottom:14px;"></div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="assistant-btn-outline" id="tourPrevBtn" style="width:auto; margin-top:0;" onclick="window.QuickAssistant.prevTourStep()">Previous</button>
          <div style="display:flex; gap:8px;">
            <button type="button" class="assistant-btn-outline" style="width:auto; margin-top:0;" onclick="window.QuickAssistant.stopProjectTour()">Skip</button>
            <button type="button" class="assistant-btn-primary" id="tourNextBtn" style="width:auto;" onclick="window.QuickAssistant.nextTourStep()">Next Button <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>

        <!-- Auto-Roll Countdown Progress -->
        <div class="tour-roll-progress-track">
          <div class="tour-roll-progress-fill" id="tourRollProgressFill"></div>
        </div>
      </div>

      <!-- First-Time Onboarding Welcome Modal -->
      <div class="tour-welcome-backdrop" id="tourWelcomeBackdrop" onclick="if(event.target===this) window.QuickAssistant.dismissWelcomeModal(true)">
        <div class="tour-welcome-modal" id="tourWelcomeModal" role="dialog" aria-modal="true" aria-labelledby="tourWelcomeTitle" onclick="event.stopPropagation()">
          <button type="button" class="tour-welcome-close" onclick="window.QuickAssistant.dismissWelcomeModal(true)" title="Skip Tour (Esc)">&times;</button>
          <div class="tour-welcome-header">
            <div class="tour-welcome-crest" id="tourWelcomeCrest">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div class="tour-welcome-badge" id="tourWelcomeBadge">NEW PORTAL ACCESS</div>
            <h3 class="tour-welcome-title" id="tourWelcomeTitle">Welcome to Your Portal!</h3>
            <p class="tour-welcome-subtitle" id="tourWelcomeSub">Since this is your first time signing into your workspace, let's take a quick 1-minute guided tour of your essential tools and features.</p>
          </div>
          <div class="tour-welcome-highlights" id="tourWelcomeHighlights">
            <!-- Injected dynamically per role -->
          </div>
          <div class="tour-welcome-actions">
            <button type="button" class="tour-btn-start" id="tourWelcomeStartBtn" onclick="window.QuickAssistant.startTourFromWelcome()">
              <i class="fa-solid fa-play"></i> Launch Guided Tour
            </button>
            <button type="button" class="tour-btn-skip" onclick="window.QuickAssistant.dismissWelcomeModal(true)">
              Explore On My Own
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  // Dynamic Tour Step State & Providers
  let currentTourIndex = 0;
  let activeTourSteps = [];
  let isAutoRolling = false;
  let autoRollTimer = null;
  let autoRollAnimFrame = null;
  const AUTO_ROLL_DURATION = 4200; // 4.2 seconds per button

  function getContextTourSteps() {
    const p = window.location.pathname.replace(/\\/g, '/').toLowerCase();

    // 1. HR Dashboard context
    if (p.includes('/pages/hr/') || document.getElementById('addTeacherBtn') || document.querySelector('[data-section="dashboard"]')) {
      return [
        {
          selector: '#nav button[data-section="dashboard"], [data-section="dashboard"]',
          title: 'Workforce Executive Command',
          badge: 'HR Hub',
          placement: 'right',
          content: 'Central workforce intelligence dashboard tracking active staff headcount, attendance telemetry, department allocations, and gross payroll.'
        },
        {
          selector: '#navGroupRegister, #addTeacherBtn, #navAddStudentBtn',
          title: 'Personnel & Class Registration',
          badge: 'Onboarding',
          placement: 'right',
          content: 'Register new teachers, enrol students, and provision academic cohorts, classes, and subjects with instant credential generation.'
        },
        {
          selector: '#nav button[data-section="teachers"], [data-section="teachers"]',
          title: 'Staff Directory & Credentials',
          badge: 'Workforce',
          placement: 'right',
          content: 'Comprehensive faculty database with verified Ghana Card identification, contact details, designations, and academic qualifications.'
        },
        {
          selector: '#nav button[data-section="attendance"], [data-section="attendance"]',
          title: 'Attendance Analytics & Biometrics',
          badge: 'Operations',
          placement: 'right',
          content: 'Monitor daily staff roll calls, punch clock logs, punctuality rates, and monthly statutory attendance compliance.'
        },
        {
          selector: '#nav button[data-section="payroll"], [data-section="payroll"], #payrollStatutoryCard',
          title: 'SSNIT & GRA Statutory Payroll Engine',
          badge: 'Compensation',
          placement: 'right',
          content: 'Automates Ghanaian payroll compliance: SSNIT Tier 1 & 2 contributions, progressive GRA PAYE tax brackets, and official printable payslips.'
        },
        {
          selector: '#cloudSyncBtn, .supabase-btn',
          title: 'Live Supabase Cloud Sync',
          badge: 'Cloud Sync',
          placement: 'bottom',
          content: 'Connect to Supabase to enable real-time multi-device cloud synchronization for workforce and student records.'
        },
        {
          selector: '#quickAssistantFab',
          title: 'Quick Assistant & Help Desk',
          badge: 'Support Desk',
          placement: 'left',
          content: 'Tap this magic wand or press Alt + A anytime to open help guides, re-launch this tour, or test system diagnostics.'
        }
      ];
    }

    // 2. Finance / Bursary Dashboard context
    if (p.includes('/pages/finance/') || document.getElementById('navStudentBilling') || document.getElementById('navDashboard')) {
      return [
        {
          selector: '#navDashboard, #tabDashboard',
          title: 'Bursary & Treasury Command',
          badge: 'Treasury Hub',
          placement: 'right',
          content: 'Welcome to your financial console. Monitor total operating budget, fees collected, outstanding student arrears, and net institutional liquidity.'
        },
        {
          selector: '#navStudentBilling, .btn-action.success-btn',
          title: 'Student Fee Billing & Collections',
          badge: 'Fee Ledger',
          placement: 'right',
          content: 'Record student tuition payments, manage itemized fee schedules, and issue instant certified digital receipts with verification seals.'
        },
        {
          selector: '#navClearanceDesk',
          title: 'Exam Hall Clearance Desk',
          badge: 'Exam Passes',
          placement: 'right',
          content: 'Authorize and issue cryptographic examination hall passes and fee clearance slips to students prior to exam periods.'
        },
        {
          selector: '#navApproval, [onclick*="openPrepareSalaryModal"]',
          title: 'Faculty & Staff Payroll Audit',
          badge: 'Payroll Desk',
          placement: 'right',
          content: 'Audit monthly staff salary allocations, review statutory SSNIT/GRA deductions, and authorize banking disbursement schedules.'
        },
        {
          selector: '#navFeeTariff, #navScholarships',
          title: 'Tariffs & Scholarship Grants',
          badge: 'Institutional',
          placement: 'right',
          content: 'Configure tuition rates per cohort and administer financial aid packages, bursary waivers, and merit scholarships.'
        },
        {
          selector: '#cloudSyncBtn, .supabase-btn',
          title: 'Cloud Vault Synchronization',
          badge: 'Cloud Vault',
          placement: 'bottom',
          content: 'Ensure all tuition ledger entries and financial transactions are securely synced to Supabase cloud storage.'
        },
        {
          selector: '#quickAssistantFab',
          title: 'Quick Assistant & Help Desk',
          badge: 'Support Desk',
          placement: 'left',
          content: 'Need help or want to replay this tour? Press Alt + A or click this button anytime to access the quick assistance hub.'
        }
      ];
    }

    // 3. Teacher Dashboard context
    if (p.includes('/pages/teacher/') || document.getElementById('teacherProfile') || document.querySelector('.tab[data-section="classes"]') || document.getElementById('kpis')) {
      return [
        {
          selector: '.tab[data-section="overview"], #kpis',
          title: 'Educator Academic Hub',
          badge: 'Overview',
          placement: 'right',
          content: 'Your primary instructor command center showing active student counts, today’s classes, and urgent academic alerts.'
        },
        {
          selector: '.tab[data-section="classes"]',
          title: 'My Classes & Timetable',
          badge: 'Classroom',
          placement: 'right',
          content: 'View enrolled student rosters, schedule slots, and weekly lesson timetables for your assigned subjects.'
        },
        {
          selector: '.tab[data-section="students"]',
          title: 'Enrolled Students & Photos',
          badge: 'Roster',
          placement: 'right',
          content: 'Comprehensive student roster with uploaded student avatars, medical remarks, and guardian emergency contacts.'
        },
        {
          selector: '.tab[data-section="attendance"], .quick-action-pill[onclick*="attendance"]',
          title: 'Daily Class Attendance',
          badge: 'Roll Call',
          placement: 'right',
          content: 'Mark and submit daily classroom attendance with single-click present/absent registers and attendance streak tracking.'
        },
        {
          selector: '.tab[data-section="assessments"], .quick-action-pill[onclick*="Assessment"]',
          title: 'Continuous Assessment & WAEC Grades',
          badge: 'Grading',
          placement: 'right',
          content: 'Record class tests, homework scores, and terminal exam grades calibrated to official WAEC 9-point rubrics.'
        },
        {
          selector: '.tab[data-section="lessons"], .tab[data-section="broadcasts"]',
          title: 'Lesson Notes & Campus Directives',
          badge: 'Curriculum',
          placement: 'right',
          content: 'Prepare structured lesson notes and stay updated with institutional circulars, memos, and term schedules.'
        },
        {
          selector: '#quickAssistantFab',
          title: 'Quick Assistant & Help Desk',
          badge: 'Support Desk',
          placement: 'left',
          content: 'Press Alt + A or tap this magic wand anytime to find answers, check diagnostics, or re-run this interactive tour.'
        }
      ];
    }

    // 4. Student Dashboard context
    if (p.includes('/pages/student/') || document.getElementById('nav_overview') || document.getElementById('nav_courses')) {
      return [
        {
          selector: '#nav_overview, .academic-breadcrumb',
          title: 'Student Academy Hub',
          badge: 'Welcome',
          placement: 'right',
          content: 'Welcome to your personalized student portal. View your academic summary, term announcements, and class schedule.'
        },
        {
          selector: '#nav_courses',
          title: 'My Courses & Syllabi',
          badge: 'Courses',
          placement: 'right',
          content: 'Explore your enrolled subjects, course outlines, recommended textbooks, and teacher contact channels.'
        },
        {
          selector: '#nav_timetable',
          title: 'Live Class Timetable',
          badge: 'Timetable',
          placement: 'right',
          content: 'Never miss a lecture with your real-time daily class timetable and classroom location guide.'
        },
        {
          selector: '#nav_assignments',
          title: 'Assignments & Continuous Assessment',
          badge: 'Homework',
          placement: 'right',
          content: 'Track upcoming assignment deadlines, submit completed coursework online, and review teacher scoring feedback.'
        },
        {
          selector: '#nav_grades, #nav_gpaSim',
          title: 'WAEC Broadsheet & GPA Simulator',
          badge: 'Grades',
          placement: 'right',
          content: 'Review verified terminal grades, WAEC continuous assessment scores, and simulate your projected cumulative GPA.'
        },
        {
          selector: '#nav_fees',
          title: 'Tuition Fee Ledger & Clearance',
          badge: 'Bursary',
          placement: 'right',
          content: 'View your tuition billing status, download verified official payment receipts, and verify your exam hall clearance.'
        },
        {
          selector: '#nav_profile',
          title: 'Digital Student Smart ID Card',
          badge: 'Smart ID',
          placement: 'right',
          content: 'Access your official digital student ID badge featuring cryptographic QR and RFID verification codes.'
        },
        {
          selector: '#quickAssistantFab',
          title: 'Quick Assistant & Help Desk',
          badge: 'Support Desk',
          placement: 'left',
          content: 'Press Alt + A or tap this magic wand anytime to view student guides or replay this interactive tour.'
        }
      ];
    }

    // 5. Public Home context
    if (document.getElementById('openDashboardBtn') || document.getElementById('addEmpShortcut') || document.getElementById('unifiedLoginConsole')) {
      return [
        {
          selector: '#orgLogoBox, .brand',
          title: 'Organization Identity',
          badge: 'Branding',
          placement: 'bottom',
          content: 'Central enterprise brand reflection showcasing your uploaded organization logo and name across the portal.'
        },
        {
          selector: '#openDashboardBtn, .tab-btn[data-role="hr"]',
          title: 'HR & Faculty Portal',
          badge: 'HR Hub',
          placement: 'bottom',
          content: 'One-click gateway into workforce management, statutory Ghanaian payroll, and staff credentials.'
        },
        {
          selector: '#openTeacherBtn, .tab-btn[data-role="teacher"]',
          title: 'Teacher & Classroom Portal',
          badge: 'Academics',
          placement: 'bottom',
          content: 'Direct entry for educators to access student rosters, lesson plans, continuous assessments, and roll calls.'
        },
        {
          selector: '.tab-btn[data-role="finance"]',
          title: 'Bursary & Treasury Operations',
          badge: 'Treasury',
          placement: 'bottom',
          content: 'Dedicated accounting portal for student fee collections, exam clearance passes, and cash flows.'
        },
        {
          selector: '.tab-btn[data-role="student"]',
          title: 'Student Academy Portal',
          badge: 'Student',
          placement: 'bottom',
          content: 'Scholar workstation for course syllabi, live timetables, WAEC grading broadsheets, and digital smart IDs.'
        }
      ];
    }

    // 6. Default fallback: query prominent navigation and action buttons
    const buttons = Array.from(document.querySelectorAll('button:not(#quickAssistantFab):not(.assistant-btn-primary):not(.assistant-btn-outline), nav a, .btn'));
    if (buttons.length > 0) {
      return buttons.slice(0, 6).map((btn, idx) => ({
        element: btn,
        title: btn.textContent.trim().slice(0, 30) || 'Portal Control',
        badge: `Control ${idx + 1}`,
        placement: 'bottom',
        content: `Interactive button: ${btn.getAttribute('title') || btn.textContent.trim() || 'Access this system feature.'}`
      }));
    }

    return [
      {
        title: 'Executive Central Hub',
        badge: 'Hub',
        content: 'The Central Welcome Hub bridges all organizational departments with zero friction.',
        placement: 'center'
      }
    ];
  }

  // Assistant Controller Object
  window.QuickAssistant = {
    isOpen: false,

    init: function () {
      if (document.getElementById('quickAssistantFab')) return;
      ensureToaster();
      buildAssistantMarkup();
      this.bindEvents();
      this.checkMessengerOffset();
      this.testDiagnostics();
      this.syncBrandingDisplay();
      this.syncToastControls();
      if (window.AuthSession && typeof window.AuthSession.applyGlobalBranding === 'function') {
        window.AuthSession.applyGlobalBranding();
      }
      this.checkFirstTimeTour();
    },

    bindEvents: function () {
      const fab = document.getElementById('quickAssistantFab');
      const closeBtn = document.getElementById('quickAssistantCloseBtn');
      const backdrop = document.getElementById('quickAssistantBackdrop');
      const navButtons = document.querySelectorAll('.assistant-nav-btn');

      if (fab) {
        fab.addEventListener('click', () => this.toggle());
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      if (backdrop) {
        backdrop.addEventListener('click', () => this.close());
      }

      navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tabId = btn.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });

      // Keyboard shortcuts: Alt + A and Esc
      document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    },

    checkMessengerOffset: function () {
      // Check if messenger button is present on the page
      if (document.querySelector('.school-messenger-trigger') || document.getElementById('schoolMessengerTrigger')) {
        document.body.classList.add('has-messenger');
      }
    },

    toggle: function () {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function () {
      this.isOpen = true;
      const panel = document.getElementById('quickAssistantPanel');
      const backdrop = document.getElementById('quickAssistantBackdrop');
      const fab = document.getElementById('quickAssistantFab');
      if (panel) panel.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      if (fab) fab.classList.add('active');
      this.testDiagnostics();
      this.syncToastControls();
    },

    close: function () {
      this.isOpen = false;
      const panel = document.getElementById('quickAssistantPanel');
      const backdrop = document.getElementById('quickAssistantBackdrop');
      const fab = document.getElementById('quickAssistantFab');
      if (panel) panel.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      if (fab) fab.classList.remove('active');
    },

    switchTab: function (tabId) {
      document.querySelectorAll('.assistant-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });
      document.querySelectorAll('.assistant-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
      });
    },

    toggleFaq: function (headerEl) {
      const item = headerEl.closest('.help-faq-item');
      if (item) {
        item.classList.toggle('open');
      }
    },

    filterHelp: function (query) {
      const q = (query || '').toLowerCase().trim();
      const items = document.querySelectorAll('.help-faq-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'block' : 'none';
      });
    },

    showNotification: function (msg, type = 'info') {
      if (window.Toaster && typeof window.Toaster.show === 'function') {
        const titleMap = {
          success: 'Success',
          error: 'Notice',
          warning: 'Warning',
          info: 'Flawless Assistant'
        };
        window.Toaster.show({
          type: type,
          title: titleMap[type] || 'Flawless Assistant',
          message: msg
        });
      } else {
        alert(msg);
      }
    },

    syncToastControls: function () {
      if (!window.Toaster) return;
      const s = window.Toaster.getSettings();

      const elToast = document.getElementById('qaToastToggle');
      const elSound = document.getElementById('qaSoundToggle');
      const elDnd = document.getElementById('qaDndToggle');
      const elProgress = document.getElementById('qaProgressToggle');

      if (elToast) elToast.checked = !!s.enabled;
      if (elSound) elSound.checked = !!s.sound;
      if (elDnd) elDnd.checked = !!s.dnd;
      if (elProgress) elProgress.checked = !!s.showProgress;

      document.querySelectorAll('.toast-pos-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-pos') === s.position);
      });

      document.querySelectorAll('.toast-chip-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.getAttribute('data-dur')) === Number(s.duration));
      });
    },

    updateToastSetting: function (key, value) {
      if (window.Toaster) {
        window.Toaster.updateSettings({ [key]: value });
        this.syncToastControls();
        const label = typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value;
        this.showNotification(`Notification setting "${key}": ${label}`, 'info');
      }
    },

    setToastPosition: function (pos) {
      if (window.Toaster) {
        window.Toaster.updateSettings({ position: pos });
        this.syncToastControls();
        const pretty = pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        this.showNotification(`Toast position updated to ${pretty}`, 'success');
      }
    },

    setToastDuration: function (dur) {
      if (window.Toaster) {
        window.Toaster.updateSettings({ duration: dur });
        this.syncToastControls();
        const label = dur === 0 ? 'Sticky (Manual dismiss)' : `${dur / 1000} seconds`;
        this.showNotification(`Toast duration set to ${label}`, 'success');
      }
    },

    triggerTestToast: function (type) {
      if (type === 'troubleshoot') {
        if (window.Toaster) {
          window.Toaster.troubleshoot({
            title: 'Cloud Database Synchronization Malfunction',
            message: 'Unable to reach remote Supabase endpoint (HTTP 503 / Network Timeout).',
            error: 'FetchError: Failed to fetch at SupabaseService.push (supabase-sync.js:42) — Gateway Timeout',
            troubleshoot: 'Remote sync is temporarily unreachable. All student and staff data are safely stored in offline local storage.',
            steps: [
              'Verify that your device is connected to the internet or local school Wi-Fi.',
              'Open Supabase Cloud Settings and confirm Project URL begins with https://',
              'Verify that the Public Anon Key has not expired or been regenerated in Supabase Dashboard.',
              'Click Retry below to re-attempt handshake once connection is restored.'
            ],
            onRetry: () => {
              if (window.QuickAssistant) {
                window.QuickAssistant.showNotification('Re-testing connection to Supabase cloud...', 'info');
              }
            },
            copyable: true,
            force: true
          });
        }
        return;
      }

      const messages = {
        success: 'Operation completed successfully! Student record and fee ledger saved.',
        info: 'Supabase cloud synchronization active across all institutional portals.',
        warning: 'SSNIT Tier-2 contribution review scheduled for end of term.',
        error: 'Network connection interrupted. System is operating in offline local mode.'
      };
      const titles = {
        success: 'Verified & Saved',
        info: 'System Information',
        warning: 'Operational Warning',
        error: 'Connection Notice'
      };

      if (window.Toaster) {
        window.Toaster.show({
          type: type,
          title: titles[type] || 'Toast Notification',
          message: messages[type] || 'This is a live notification test.',
          force: true
        });
      }
    },

    resetToastSettings: function () {
      if (window.Toaster) {
        window.Toaster.updateSettings({
          enabled: true,
          position: 'top-center',
          duration: 4000,
          sound: true,
          dnd: false,
          showProgress: true
        });
        this.syncToastControls();
        this.showNotification('Notification settings restored to defaults.', 'success');
      }
    },

    clearAllToasts: function () {
      if (window.Toaster) {
        window.Toaster.clearAll();
      }
    },

    testDiagnostics: function () {
      const pingEl = document.getElementById('assistantCloudPing');
      const sizeEl = document.getElementById('assistantStorageSize');

      // Test cloud latency
      if (pingEl) {
        const start = performance.now();
        fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
          .then(() => {
            const ms = Math.round(performance.now() - start);
            pingEl.innerHTML = `<i class="fa-solid fa-bolt"></i> Operational (${ms}ms)`;
            pingEl.style.color = '#10b981';
          })
          .catch(() => {
            pingEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Local Fallback Active`;
            pingEl.style.color = '#2563eb';
          });
      }

      // Compute local storage usage
      if (sizeEl) {
        try {
          let total = 0;
          for (let x in localStorage) {
            if (localStorage.hasOwnProperty(x)) {
              total += (localStorage[x].length * 2);
            }
          }
          const kb = (total / 1024).toFixed(1);
          const count = Object.keys(localStorage).length;
          sizeEl.textContent = `${count} items (~${kb} KB cached)`;
        } catch (e) {
          sizeEl.textContent = 'Storage available';
        }
      }
    },

    resetDemoCache: function () {
      if (confirm('Are you sure you want to clear local demo cache? This will reset offline sample data.')) {
        localStorage.clear();
        alert('Demo cache cleared successfully. Refreshing application...');
        window.location.reload();
      }
    },

    // Interactive Project Tour Logic (Dynamic Button-Pointing & Auto-Roll)
    startProjectTour: function (customSteps = null) {
      this.close();
      this.dismissWelcomeModal(false);
      activeTourSteps = (Array.isArray(customSteps) && customSteps.length > 0) ? customSteps : getContextTourSteps();
      currentTourIndex = 0;
      const overlay = document.getElementById('tourSpotlightOverlay');
      if (overlay) overlay.classList.add('active');

      this.renderTourStep();
      this.bindTourKeyEvents();
    },

    renderTourStep: function () {
      if (!activeTourSteps || activeTourSteps.length === 0) {
        activeTourSteps = getContextTourSteps();
      }
      const step = activeTourSteps[currentTourIndex];
      if (!step) return;

      const badge = document.getElementById('tourStepBadge');
      const title = document.getElementById('tourStepTitle');
      const content = document.getElementById('tourStepContent');
      const prevBtn = document.getElementById('tourPrevBtn');
      const nextBtn = document.getElementById('tourNextBtn');

      if (badge) badge.textContent = `Step ${currentTourIndex + 1} of ${activeTourSteps.length} • ${step.badge || 'Button'}`;
      if (title) title.textContent = step.title;
      if (content) {
        content.innerHTML = `
          <p style="margin:0 0 10px; font-size:13.5px; line-height:1.55; color:inherit;">${step.content}</p>
          <div style="display:inline-flex; align-items:center; gap:6px; padding:5px 10px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:8px; font-size:11.5px; font-weight:600; color:#2563eb;">
            <i class="fa-solid fa-arrow-pointer"></i> Pointing at: <strong>${step.title}</strong>
          </div>
        `;
      }

      if (prevBtn) prevBtn.style.visibility = currentTourIndex === 0 ? 'hidden' : 'visible';
      if (nextBtn) {
        if (currentTourIndex === activeTourSteps.length - 1) {
          nextBtn.innerHTML = '<i class="fa-solid fa-check"></i> Finish Tour';
        } else {
          nextBtn.innerHTML = 'Next Button <i class="fa-solid fa-arrow-right"></i>';
        }
      }

      // Locate target element on page
      let targetEl = null;
      if (step.element && document.body.contains(step.element)) {
        targetEl = step.element;
      } else if (step.selector) {
        try {
          targetEl = document.querySelector(step.selector);
        } catch (e) {
          targetEl = null;
        }
      }

      this.positionTourAtElement(targetEl, step.placement || 'right');

      // If auto-rolling, trigger next countdown
      if (isAutoRolling) {
        this.startAutoRollTimer();
      }
    },

    positionTourAtElement: function (targetEl, preferredPlacement = 'right') {
      const beacon = document.getElementById('tourSpotlightBeacon');
      const card = document.getElementById('tourPopoverCard');
      const arrow = document.getElementById('tourPointerArrow');

      if (!targetEl || !targetEl.offsetParent) {
        // Target element not visible or not found on this view; center the card
        if (beacon) beacon.classList.remove('active');
        if (arrow) arrow.className = 'tour-pointer-arrow';
        if (card) {
          card.classList.add('active');
          card.style.top = '50%';
          card.style.left = '50%';
          card.style.transform = 'translate(-50%, -50%)';
        }
        return;
      }

      // Smoothly scroll target button into center view
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      setTimeout(() => {
        const rect = targetEl.getBoundingClientRect();
        const pad = 6;

        // Position glowing beacon over target button
        if (beacon) {
          beacon.style.top = Math.max(0, rect.top - pad) + 'px';
          beacon.style.left = Math.max(0, rect.left - pad) + 'px';
          beacon.style.width = (rect.width + pad * 2) + 'px';
          beacon.style.height = (rect.height + pad * 2) + 'px';
          beacon.style.borderRadius = (window.getComputedStyle(targetEl).borderRadius || '12px');
          beacon.classList.add('active');
        }

        if (!card) return;
        card.style.transform = 'none';
        card.classList.add('active');

        const cardWidth = Math.min(440, window.innerWidth - 30);
        const cardHeight = card.offsetHeight || 220;
        const margin = 18;

        let placement = preferredPlacement;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const spaceBottom = window.innerHeight - rect.bottom;
        const spaceTop = rect.top;

        // Smart placement fallback based on available viewport space
        if (placement === 'right' && spaceRight < cardWidth + margin) {
          placement = spaceLeft > cardWidth + margin ? 'left' : (spaceBottom > cardHeight + margin ? 'bottom' : 'top');
        } else if (placement === 'bottom' && spaceBottom < cardHeight + margin) {
          placement = spaceTop > cardHeight + margin ? 'top' : (spaceRight > cardWidth + margin ? 'right' : 'left');
        } else if (placement === 'top' && spaceTop < cardHeight + margin) {
          placement = spaceBottom > cardHeight + margin ? 'bottom' : 'right';
        }

        let top = 0;
        let left = 0;
        if (arrow) arrow.className = 'tour-pointer-arrow';

        if (placement === 'right') {
          left = rect.right + margin;
          top = rect.top + (rect.height / 2) - 36;
          if (arrow) arrow.classList.add('arrow-left');
        } else if (placement === 'left') {
          left = rect.left - cardWidth - margin;
          top = rect.top + (rect.height / 2) - 36;
          if (arrow) arrow.classList.add('arrow-right');
        } else if (placement === 'bottom') {
          left = Math.max(16, rect.left + (rect.width / 2) - (cardWidth / 2));
          top = rect.bottom + margin;
          if (arrow) arrow.classList.add('arrow-top');
        } else { // top
          left = Math.max(16, rect.left + (rect.width / 2) - (cardWidth / 2));
          top = rect.top - cardHeight - margin;
          if (arrow) arrow.classList.add('arrow-bottom');
        }

        // Clamp securely within screen bounds
        top = Math.max(16, Math.min(window.innerHeight - cardHeight - 20, top));
        left = Math.max(16, Math.min(window.innerWidth - cardWidth - 20, left));

        card.style.top = top + 'px';
        card.style.left = left + 'px';
      }, 100);
    },

    toggleAutoRoll: function () {
      if (isAutoRolling) {
        this.pauseAutoRoll();
      } else {
        this.startAutoRoll();
      }
    },

    startAutoRoll: function () {
      isAutoRolling = true;
      const icon = document.getElementById('tourRollIcon');
      const label = document.getElementById('tourRollLabel');
      if (icon) icon.className = 'fa-solid fa-pause';
      if (label) label.textContent = 'Pause';
      this.startAutoRollTimer();
    },

    pauseAutoRoll: function () {
      isAutoRolling = false;
      if (autoRollTimer) clearTimeout(autoRollTimer);
      const icon = document.getElementById('tourRollIcon');
      const label = document.getElementById('tourRollLabel');
      const fill = document.getElementById('tourRollProgressFill');
      if (icon) icon.className = 'fa-solid fa-play';
      if (label) label.textContent = 'Auto-Roll';
      if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
      }
    },

    startAutoRollTimer: function () {
      if (autoRollTimer) clearTimeout(autoRollTimer);
      const fill = document.getElementById('tourRollProgressFill');
      if (fill) {
        fill.style.transition = 'none';
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.transition = `width ${AUTO_ROLL_DURATION}ms linear`;
          fill.style.width = '100%';
        }, 30);
      }

      autoRollTimer = setTimeout(() => {
        if (!isAutoRolling) return;
        if (currentTourIndex < activeTourSteps.length - 1) {
          currentTourIndex++;
          this.renderTourStep();
        } else {
          // Loop back or complete
          this.pauseAutoRoll();
          this.stopProjectTour();
          this.showNotification('🎉 Guided Tour completed! You visited all key buttons.');
        }
      }, AUTO_ROLL_DURATION);
    },

    nextTourStep: function () {
      if (autoRollTimer) clearTimeout(autoRollTimer);
      if (currentTourIndex < activeTourSteps.length - 1) {
        currentTourIndex++;
        this.renderTourStep();
      } else {
        this.stopProjectTour();
        this.showNotification('🎉 Guided Tour completed! All features explored.');
      }
    },

    prevTourStep: function () {
      if (autoRollTimer) clearTimeout(autoRollTimer);
      if (currentTourIndex > 0) {
        currentTourIndex--;
        this.renderTourStep();
      }
    },

    stopProjectTour: function () {
      this.pauseAutoRoll();
      const overlay = document.getElementById('tourSpotlightOverlay');
      const beacon = document.getElementById('tourSpotlightBeacon');
      const card = document.getElementById('tourPopoverCard');

      if (overlay) overlay.classList.remove('active');
      if (beacon) beacon.classList.remove('active');
      if (card) card.classList.remove('active');
      this.unbindTourKeyEvents();
      this.markTourCompleted();
    },

    bindTourKeyEvents: function () {
      this._tourKeyHandler = (e) => {
        if (e.key === 'Escape') {
          this.stopProjectTour();
        } else if (e.key === 'ArrowRight') {
          this.nextTourStep();
        } else if (e.key === 'ArrowLeft') {
          this.prevTourStep();
        }
      };
      window.addEventListener('keydown', this._tourKeyHandler);
    },

    unbindTourKeyEvents: function () {
      if (this._tourKeyHandler) {
        window.removeEventListener('keydown', this._tourKeyHandler);
        this._tourKeyHandler = null;
      }
    },

    // =========================================================================
    // FIRST-TIME USER ONBOARDING TOUR CONTROLLER (HR, Finance, Teacher, Student)
    // =========================================================================
    _currentWelcomeRole: null,
    _currentWelcomeUser: null,

    detectCurrentRole: function () {
      const p = window.location.pathname.replace(/\\/g, '/').toLowerCase();
      if (p.includes('/pages/hr/') || document.querySelector('#navGroupRegister') || document.querySelector('[data-section="dashboard"]')) return 'hr';
      if (p.includes('/pages/finance/') || document.querySelector('#navStudentBilling') || document.querySelector('#navDashboard')) return 'finance';
      if (p.includes('/pages/teacher/') || document.querySelector('.tab[data-section="classes"]') || document.getElementById('kpis')) return 'teacher';
      if (p.includes('/pages/student/') || document.querySelector('#nav_overview') || document.querySelector('#nav_courses')) return 'student';
      return null;
    },

    checkFirstTimeTour: function () {
      const role = this.detectCurrentRole();
      if (!role) return;

      let user = null;
      if (window.AuthSession && typeof window.AuthSession.getUser === 'function') {
        user = window.AuthSession.getUser();
      }
      if (!user) {
        try {
          user = JSON.parse(localStorage.getItem('active_' + role) || localStorage.getItem('active_user') || '{}');
        } catch (_) {}
      }
      user = user || {};

      const cleanId = (user.id || user.roll || user.linked_staff_id || user.email || 'user').toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const tourKey = `fg_tour_seen_${role}_${cleanId}`;
      const generalTourKey = `fg_tour_seen_${role}`;

      const alreadySeen = localStorage.getItem(tourKey) || (user.id && localStorage.getItem('fg_tour_seen_' + user.id));
      const isNewRegistration = !!(user.is_new_registration || user.first_login || sessionStorage.getItem('fg_new_registered_user'));

      if (!alreadySeen || isNewRegistration) {
        // Trigger welcome modal after gentle delay so skeleton fades cleanly
        setTimeout(() => {
          this.showWelcomeModal(role, user);
        }, 700);
      }
    },

    showWelcomeModal: function (role, user) {
      const backdrop = document.getElementById('tourWelcomeBackdrop');
      if (!backdrop) return;

      const userName = (user && (user.name || user.fullName || user.firstName)) || 'Colleague';

      const configs = {
        hr: {
          crest: '<i class="fa-solid fa-users-gear"></i>',
          crestGrad: 'linear-gradient(135deg, #e11d48 0%, #ec4899 100%)',
          crestShadow: 'rgba(225, 29, 72, 0.45)',
          badge: 'HR & FACULTY PAYROLL PORTAL',
          badgeColor: '#e11d48',
          badgeBg: 'rgba(225, 29, 72, 0.1)',
          title: `Welcome to HR Operations, ${userName}!`,
          sub: "Your workforce management workspace is active. Let's take a quick 1-minute guided tour of your staff directory, attendance telemetry, and Ghana SSNIT / GRA payroll engines.",
          highlights: [
            { icon: 'fa-id-card', text: '<strong>Staff Directory:</strong> Credentials & Ghana Card identification.' },
            { icon: 'fa-user-clock', text: '<strong>Attendance Tracking:</strong> Daily biometric roll call & punctuality.' },
            { icon: 'fa-money-bill-transfer', text: '<strong>Statutory Payroll:</strong> SSNIT Tier 1/2 & GRA PAYE compliance.' },
            { icon: 'fa-cloud-arrow-up', text: '<strong>Supabase Cloud:</strong> Real-time synchronization & offline backup.' }
          ]
        },
        finance: {
          crest: '<i class="fa-solid fa-file-invoice-dollar"></i>',
          crestGrad: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          crestShadow: 'rgba(217, 119, 6, 0.45)',
          badge: 'BURSARY & TREASURY PORTAL',
          badgeColor: '#d97706',
          badgeBg: 'rgba(217, 119, 6, 0.1)',
          title: `Welcome to Bursary & Treasury, ${userName}!`,
          sub: "Your institutional financial console is initialized. Take a quick interactive tour to explore student fee billing, certified receipts, exam clearance, and liquidity charts.",
          highlights: [
            { icon: 'fa-receipt', text: '<strong>Fee Billing:</strong> Student ledger & certified digital receipts.' },
            { icon: 'fa-stamp', text: '<strong>Exam Clearance:</strong> Cryptographic exam passes for paid students.' },
            { icon: 'fa-hand-holding-dollar', text: '<strong>Payroll Audit:</strong> Staff salary approvals & disbursements.' },
            { icon: 'fa-chart-pie', text: '<strong>Treasury Telemetry:</strong> Live operating budgets & cash flows.' }
          ]
        },
        teacher: {
          crest: '<i class="fa-solid fa-chalkboard-user"></i>',
          crestGrad: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          crestShadow: 'rgba(99, 102, 241, 0.45)',
          badge: 'EDUCATOR & CLASSROOM PORTAL',
          badgeColor: '#6366f1',
          badgeBg: 'rgba(99, 102, 241, 0.1)',
          title: `Welcome to Your Classroom Hub, ${userName}!`,
          sub: "Your educator workstation is ready. Let's take a quick tour of your assigned cohorts, student rosters, daily roll call, and WAEC continuous assessment scoring.",
          highlights: [
            { icon: 'fa-chalkboard', text: '<strong>Classes & Cohorts:</strong> Subjects, rosters, and lesson slots.' },
            { icon: 'fa-user-graduate', text: '<strong>Student Rosters:</strong> Profiles, avatars, and guardian contacts.' },
            { icon: 'fa-clipboard-user', text: '<strong>Roll Call:</strong> 1-click classroom attendance registers.' },
            { icon: 'fa-award', text: '<strong>WAEC Grading:</strong> Continuous assessment & rubric scoring.' }
          ]
        },
        student: {
          crest: '<i class="fa-solid fa-user-graduate"></i>',
          crestGrad: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          crestShadow: 'rgba(5, 150, 105, 0.45)',
          badge: 'STUDENT ACADEMY PORTAL',
          badgeColor: '#059669',
          badgeBg: 'rgba(5, 150, 105, 0.1)',
          title: `Welcome to Student Academy, ${userName}!`,
          sub: "Your student learning portal is active. Let's take a quick guided tour of your enrolled courses, daily class timetable, continuous assessment grades, and smart digital ID.",
          highlights: [
            { icon: 'fa-book-open', text: '<strong>My Courses:</strong> Syllabi, recommended notes, and lectures.' },
            { icon: 'fa-calendar-days', text: '<strong>Daily Timetable:</strong> Live class schedules and room venues.' },
            { icon: 'fa-graduation-cap', text: '<strong>Grades & GPA:</strong> WAEC broadsheet & GPA simulator.' },
            { icon: 'fa-id-badge', text: '<strong>Smart ID Badge:</strong> NFC / RFID verified campus pass.' }
          ]
        }
      };

      const cfg = configs[role] || configs['hr'];

      const crest = document.getElementById('tourWelcomeCrest');
      const badge = document.getElementById('tourWelcomeBadge');
      const title = document.getElementById('tourWelcomeTitle');
      const sub = document.getElementById('tourWelcomeSub');
      const highlights = document.getElementById('tourWelcomeHighlights');
      const startBtn = document.getElementById('tourWelcomeStartBtn');

      if (crest) {
        crest.innerHTML = cfg.crest;
        crest.style.background = cfg.crestGrad;
        crest.style.boxShadow = `0 12px 28px -6px ${cfg.crestShadow}`;
      }
      if (badge) {
        badge.textContent = cfg.badge;
        badge.style.color = cfg.badgeColor;
        badge.style.background = cfg.badgeBg;
      }
      if (title) title.textContent = cfg.title;
      if (sub) sub.textContent = cfg.sub;
      if (startBtn) startBtn.style.background = cfg.crestGrad;

      if (highlights) {
        highlights.innerHTML = cfg.highlights.map(h => `
          <div class="tour-welcome-highlight-item">
            <i class="fa-solid ${h.icon}" style="color:${cfg.badgeColor};"></i>
            <div>${h.text}</div>
          </div>
        `).join('');
      }

      this._currentWelcomeRole = role;
      this._currentWelcomeUser = user;

      backdrop.classList.add('active');
    },

    startTourFromWelcome: function () {
      this.dismissWelcomeModal(false);
      this.startProjectTour();
    },

    dismissWelcomeModal: function (markComplete = true) {
      const backdrop = document.getElementById('tourWelcomeBackdrop');
      if (backdrop) backdrop.classList.remove('active');
      if (markComplete) {
        this.markTourCompleted();
        this.showNotification('You can relaunch the guided tour anytime from the Quick Assistant or the Tour button.', 'info');
      }
    },

    markTourCompleted: function () {
      const role = this._currentWelcomeRole || this.detectCurrentRole() || 'general';
      let user = this._currentWelcomeUser;
      if (!user && window.AuthSession && typeof window.AuthSession.getUser === 'function') {
        user = window.AuthSession.getUser();
      }
      const cleanId = (user && (user.id || user.roll || user.linked_staff_id || user.email) || 'user').toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      localStorage.setItem(`fg_tour_seen_${role}_${cleanId}`, 'true');
      localStorage.setItem(`fg_tour_seen_${role}`, 'true');
      sessionStorage.removeItem('fg_new_registered_user');

      if (user && user.is_new_registration) {
        user.is_new_registration = false;
        if (window.AuthSession && typeof window.AuthSession.setUser === 'function') {
          window.AuthSession.setUser(user);
        }
      }
    },

    // Branding Synchronization
    tempLogoBase64: null,

    syncBrandingDisplay: function () {
      const org = (window.AuthSession ? window.AuthSession.getOrg() : null) || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
      const logo = (window.AuthSession ? window.AuthSession.getLogo() : null) || localStorage.getItem('active_org_logo') || null;

      const titleEl = document.getElementById('assistantHeaderTitle');
      const iconEl = document.getElementById('assistantBrandIcon');
      const dispOrg = document.getElementById('qaBrandingOrgNameDisplay');
      const inputOrg = document.getElementById('qaInputOrgName');
      const previewEl = document.getElementById('qaBrandingLogoPreview');

      if (titleEl) titleEl.textContent = org.toUpperCase() + ' • Assistant';
      if (dispOrg) dispOrg.textContent = org.toUpperCase();
      if (inputOrg && !inputOrg.value) inputOrg.value = org;

      if (logo) {
        if (iconEl) {
          iconEl.innerHTML = `<img src="${logo}" alt="${org}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block;">`;
        }
        if (previewEl) {
          previewEl.innerHTML = `<img src="${logo}" alt="${org}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block;">`;
        }
      }
    },

    handleLogoUpload: function (event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempLogoBase64 = e.target.result;
        const previewEl = document.getElementById('qaBrandingLogoPreview');
        if (previewEl) {
          previewEl.innerHTML = `<img src="${this.tempLogoBase64}" alt="Logo Preview" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; display:block;">`;
        }
      };
      reader.readAsDataURL(file);
    },

    saveBranding: function () {
      const inputOrg = document.getElementById('qaInputOrgName');
      const newName = inputOrg ? inputOrg.value.trim() : '';

      if (window.AuthSession) {
        if (newName) window.AuthSession.setOrgName(newName);
        if (this.tempLogoBase64) window.AuthSession.setOrgLogo(this.tempLogoBase64);
        window.AuthSession.applyGlobalBranding();
      } else {
        if (newName) localStorage.setItem('active_org', newName);
        if (this.tempLogoBase64) localStorage.setItem('active_org_logo', this.tempLogoBase64);
      }

      this.syncBrandingDisplay();
      this.showNotification('🎉 Organization branding updated globally across all portals!');
    }
  };

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.QuickAssistant.init());
  } else {
    window.QuickAssistant.init();
  }
})();
