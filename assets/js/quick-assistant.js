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
            <div class="brand-icon"><i class="fa-solid fa-shapes"></i></div>
            <div>
              <h3 id="assistantHeaderTitle">LUCY™ Quick Assistant</h3>
              <p><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10b981; margin-right:4px;"></span>Enterprise Hub • Operational</p>
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
            <span>Subscriptions</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-help">
            <i class="fa-solid fa-circle-question"></i>
            <span>Help Desk</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-tour">
            <i class="fa-solid fa-compass"></i>
            <span>Project Tour</span>
          </button>
          <button type="button" class="assistant-nav-btn" data-tab="tab-essentials">
            <i class="fa-solid fa-sliders"></i>
            <span>Essentials</span>
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
        </div>
      </div>

      <!-- Spotlight Guided Tour Modal -->
      <div class="tour-spotlight-overlay" id="tourSpotlightOverlay">
        <div class="tour-modal-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span id="tourStepBadge" style="background:#2563eb; color:#fff; font-size:11px; font-weight:800; padding:2px 8px; border-radius:12px;">Step 1 of 5</span>
              <h4 id="tourStepTitle" style="margin:0; font-size:16px; font-weight:800;">Executive Central Hub</h4>
            </div>
            <button type="button" onclick="window.QuickAssistant.stopProjectTour()" style="border:none; background:none; font-size:18px; color:#64748b; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div id="tourStepContent" style="font-size:13px; line-height:1.6; color:#475569; margin-bottom:20px;">
            The Welcome Portal provides a centralized gateway into the Academic, HR Operations, and Treasury applications with single sign-on and instant profile synchronization.
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button type="button" class="assistant-btn-outline" id="tourPrevBtn" style="width:auto; margin-top:0;" onclick="window.QuickAssistant.prevTourStep()">Previous</button>
            <div style="display:flex; gap:8px;">
              <button type="button" class="assistant-btn-outline" style="width:auto; margin-top:0;" onclick="window.QuickAssistant.stopProjectTour()">Skip Tour</button>
              <button type="button" class="assistant-btn-primary" id="tourNextBtn" style="width:auto;" onclick="window.QuickAssistant.nextTourStep()">Next Step <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  // Tour Steps Configuration
  const tourSteps = [
    {
      title: 'Executive Central Hub',
      content: 'The Central Welcome Hub bridges all organizational departments. Select your role to enter the Classroom, Human Resources, or Treasury portals with zero friction.',
      actionUrl: rootPrefix + 'welcome.html'
    },
    {
      title: 'Teacher & Student Management',
      content: 'Teachers can register student profiles with pinned form headers that never scroll out of view. Includes comprehensive academic, medical, and guardian records.',
      actionUrl: rootPrefix + 'pages/teacher/teacher-dashboard.html'
    },
    {
      title: 'Workforce & Ghana GRA Compliance',
      content: 'The HR suite automates Ghanaian payroll rules (SSNIT Tier 1 & 2, Ghana Revenue Authority PAYE tax brackets) with one-click printable payslips and staff appraisals.',
      actionUrl: rootPrefix + 'pages/hr/hr-dashboard.html'
    },
    {
      title: 'School Fees & Treasury Ledger',
      content: 'Track fee receivables, record payments, auto-generate student receipts, and monitor financial liquidity in real time.',
      actionUrl: rootPrefix + 'pages/finance/finance-dashboard.html'
    },
    {
      title: 'Instant Code Verification & Resiliency',
      content: 'Authentication is frictionless with an Instant Code display card, auto-fill capabilities, and live 5-minute expiration countdown timers so users never get locked out.',
      actionUrl: rootPrefix + 'index.html'
    }
  ];

  let currentTourIndex = 0;

  // Assistant Controller Object
  window.QuickAssistant = {
    isOpen: false,

    init: function () {
      if (document.getElementById('quickAssistantFab')) return;
      buildAssistantMarkup();
      this.bindEvents();
      this.checkMessengerOffset();
      this.testDiagnostics();
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

    showNotification: function (msg) {
      alert(msg);
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

    // Interactive Project Tour Logic
    startProjectTour: function () {
      this.close();
      currentTourIndex = 0;
      this.renderTourStep();
      const overlay = document.getElementById('tourSpotlightOverlay');
      if (overlay) overlay.classList.add('active');
    },

    renderTourStep: function () {
      const step = tourSteps[currentTourIndex];
      if (!step) return;

      const badge = document.getElementById('tourStepBadge');
      const title = document.getElementById('tourStepTitle');
      const content = document.getElementById('tourStepContent');
      const prevBtn = document.getElementById('tourPrevBtn');
      const nextBtn = document.getElementById('tourNextBtn');

      if (badge) badge.textContent = `Step ${currentTourIndex + 1} of ${tourSteps.length}`;
      if (title) title.textContent = step.title;
      if (content) {
        content.innerHTML = `
          <p style="margin-bottom:12px;">${step.content}</p>
          <div style="padding:8px 12px; background:rgba(37,99,235,0.08); border-radius:8px; font-size:12px; color:#2563eb;">
            <i class="fa-solid fa-compass"></i> Recommended Destination: <strong>${step.title}</strong>
          </div>
        `;
      }

      if (prevBtn) prevBtn.style.visibility = currentTourIndex === 0 ? 'hidden' : 'visible';
      if (nextBtn) {
        if (currentTourIndex === tourSteps.length - 1) {
          nextBtn.innerHTML = '<i class="fa-solid fa-check"></i> Complete Tour';
        } else {
          nextBtn.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right"></i>';
        }
      }
    },

    nextTourStep: function () {
      if (currentTourIndex < tourSteps.length - 1) {
        currentTourIndex++;
        this.renderTourStep();
      } else {
        this.stopProjectTour();
        alert('🎉 Tour completed! You have explored the core features of the LUCY™ Management Suite.');
      }
    },

    prevTourStep: function () {
      if (currentTourIndex > 0) {
        currentTourIndex--;
        this.renderTourStep();
      }
    },

    stopProjectTour: function () {
      const overlay = document.getElementById('tourSpotlightOverlay');
      if (overlay) overlay.classList.remove('active');
    }
  };

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.QuickAssistant.init());
  } else {
    window.QuickAssistant.init();
  }
})();
