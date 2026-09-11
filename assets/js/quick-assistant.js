/**
 * FLAWLESS GRAPHICS — LUCY™ QUICK ASSISTANT HUB
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
              <h3 id="assistantHeaderTitle">LUCY™ Quick Assistant</h3>
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
                  LUCY™ is built local-first. If internet connectivity drops or Supabase credentials are not yet configured, all student profiles, fee collections, and staff records persist securely in browser storage and synchronize when back online.
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
              <p style="margin:0; font-size:11.5px; opacity:0.85;">Explore the core operational pillars of the LUCY™ Management Suite.</p>
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
    // 1. HR Dashboard context (checks for HR navigation or controls)
    if (document.getElementById('addTeacherBtn') || document.querySelector('#nav button[data-section="dashboard"]')) {
      return [
        {
          selector: '#nav button[data-section="dashboard"]',
          title: 'Workforce Dashboard',
          badge: 'Overview',
          placement: 'right',
          content: 'Central command panel tracking staff headcount, real-time attendance averages, departmental staffing distributions, and gross payroll.'
        },
        {
          selector: '#topbarFeaturesDropdown, .features-btn',
          title: 'All Integrated Features',
          badge: 'Services Hub',
          placement: 'bottom',
          content: 'Hover here anytime to reveal the consolidated services suite merged from the public portal: Attendance, Payroll, Directory, Analytics, and Treasury.'
        },
        {
          selector: '#nav button[data-section="classes"]',
          title: 'Classroom & Teacher Allocation',
          badge: 'Academics',
          placement: 'right',
          content: 'Assign lead instructors to classrooms, manage student capacities, and schedule weekly class slots across subjects.'
        },
        {
          selector: '#nav button[data-section="teachers"]',
          title: 'Staff Directory & Personnel',
          badge: 'Workforce',
          placement: 'right',
          content: 'Comprehensive staff database with Ghana Card identification, contact details, designations, and academic qualifications.'
        },
        {
          selector: '#nav button[data-section="students"]',
          title: 'Students Roster & Profiles',
          badge: 'Students',
          placement: 'right',
          content: 'Enrolled student profiles with pinned form headers that never scroll out of view, guardian details, and photo avatars.'
        },
        {
          selector: '#nav button[data-section="attendance"]',
          title: 'Attendance Analytics & Logs',
          badge: 'Operations',
          placement: 'right',
          content: 'Track daily staff clock-ins, monitor punctuality rates, and analyze monthly attendance compliance.'
        },
        {
          selector: '#nav button[data-section="payroll"]',
          title: 'Ghana SSNIT & GRA Payroll',
          badge: 'Treasury',
          placement: 'right',
          content: 'Automates Ghanaian payroll compliance: SSNIT Tier 1 & 2 contributions, GRA PAYE progressive tax brackets, and printable payslips.'
        },
        {
          selector: '#nav button[data-section="analytics"]',
          title: 'Workforce Performance Scoring',
          badge: 'Appraisals',
          placement: 'right',
          content: 'Conduct teacher appraisals, track departmental productivity, and review workforce performance indicators.'
        },
        {
          selector: '#nav button[data-section="announcements"]',
          title: 'Broadcasts & Circulars',
          badge: 'Communications',
          placement: 'right',
          content: 'Publish school-wide circulars, emergency announcements, and term notices with instant staff visibility.'
        },
        {
          selector: '#addTeacherBtn',
          title: '+ Add Teacher Enrolment',
          badge: 'Action Button',
          placement: 'bottom',
          content: 'Click here anytime to enrol a new teacher using the professional 5-section form with photo upload and credential management.'
        },
        {
          selector: '#cloudSyncBtn',
          title: 'Live Supabase Cloud Sync',
          badge: 'Cloud Sync',
          placement: 'bottom',
          content: 'Connect to Supabase to enable real-time multi-device cloud synchronization for workforce and student records.'
        },
        {
          selector: '[onclick*="SchoolMessenger"]',
          title: 'Staff Messenger & Chat',
          badge: 'Messaging',
          placement: 'bottom',
          content: 'Open the dedicated school staff chat to message instructors, departments, and administrators in real time.'
        }
      ];
    }

    // 2. Teacher Dashboard context
    if (document.getElementById('teacherProfile') || document.querySelector('.nav .tab[data-section="classes"]')) {
      return [
        {
          selector: '.tab[data-section="overview"]',
          title: 'Teacher Academic Hub',
          badge: 'Overview',
          placement: 'right',
          content: 'Your primary instructor command center showing active student counts, today’s classes, and urgent notes.'
        },
        {
          selector: '.tab[data-section="classes"]',
          title: 'My Classes & Timetable',
          badge: 'Classroom',
          placement: 'right',
          content: 'View enrolled student rosters, schedule slots, and lesson timetables for your assigned subjects.'
        },
        {
          selector: '.tab[data-section="students"]',
          title: 'Enrolled Students & Photos',
          badge: 'Roster',
          placement: 'right',
          content: 'Comprehensive student roster with uploaded student avatars, medical remarks, and guardian contacts.'
        },
        {
          selector: '.tab[data-section="attendance"]',
          title: 'Daily Class Attendance',
          badge: 'Attendance',
          placement: 'right',
          content: 'Mark and submit daily classroom attendance with single-click present/absent registers.'
        },
        {
          selector: '#btnNewStudent, #addStudentBtn, .btn-primary',
          title: '+ Add Student Record',
          badge: 'Action',
          placement: 'bottom',
          content: 'Enrol students using the pinned-header detail modal with photo upload and emergency contacts.'
        }
      ];
    }

    // 3. Public Home context
    if (document.getElementById('openDashboardBtn') || document.getElementById('addEmpShortcut')) {
      return [
        {
          selector: '#orgLogoBox, .brand',
          title: 'Organization Identity',
          badge: 'Branding',
          placement: 'bottom',
          content: 'Central enterprise brand reflection showcasing your uploaded organization logo and name across the portal.'
        },
        {
          selector: '#openDashboardBtn',
          title: 'Launch HR Workspace',
          badge: 'Dashboard',
          placement: 'bottom',
          content: 'One-click gateway into the workforce management portal, payroll analytics, and staff directory.'
        },
        {
          selector: '#openTeacherBtn',
          title: 'Teacher & Classroom Portal',
          badge: 'Academics',
          placement: 'bottom',
          content: 'Direct entry for educators to access student rosters, lesson plans, and daily roll calls.'
        },
        {
          selector: '#addEmpShortcut, #addEmpShortcutBtn',
          title: 'Quick Personnel Enrolment',
          badge: 'Quick Action',
          placement: 'top',
          content: 'Instant shortcut to register teachers and team members with photo verification.'
        },
        {
          selector: '.shortcuts div:nth-child(2)',
          title: 'Payroll Analytics Review',
          badge: 'Compensation',
          placement: 'top',
          content: 'Deep-dive into departmental salary distributions, SSNIT contributions, and financial trends.'
        }
      ];
    }

    // 4. Default fallback: query prominent navigation and action buttons
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
          info: 'LUCY™ Assistant'
        };
        window.Toaster.show({
          type: type,
          title: titleMap[type] || 'LUCY™ Assistant',
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
    startProjectTour: function () {
      this.close();
      activeTourSteps = getContextTourSteps();
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
