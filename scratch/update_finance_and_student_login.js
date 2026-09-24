const fs = require('fs');
const path = require('path');

// 1. UPDATE FINANCE LOGIN
const financePath = path.join(__dirname, '..', 'pages', 'finance', 'finance-login.html');
let financeHtml = fs.readFileSync(financePath, 'utf8');

// Ensure slide-over.css in head
if (!financeHtml.includes('slide-over.css')) {
  financeHtml = financeHtml.replace(
    '</head>',
    '  <!-- Universal Slide-Over Stylesheet -->\n  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>'
  );
}

// Ensure slide-over.js before </body>
if (!financeHtml.includes('slide-over.js')) {
  financeHtml = financeHtml.replace(
    '</body>',
    '  <!-- Universal Slide-Over Controller Engine -->\n  <script src="../../assets/js/slide-over.js"></script>\n</body>'
  );
}

// Replace the style block in finance-login.html
const financeStyleStart = financeHtml.indexOf('<style>');
const financeStyleEnd = financeHtml.indexOf('</style>', financeStyleStart);

if (financeStyleStart !== -1 && financeStyleEnd !== -1) {
  const newFinanceCss = `<style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body {
      background-color: #F8F5EE;
      background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('../../assets/img/graduation-bg.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      color: #0F172A;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Subtle warm grid overlay */
    .grid-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: 
        linear-gradient(to right, rgba(180, 160, 140, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(180, 160, 140, 0.08) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
      z-index: 0;
    }

    /* Soft ambient emerald/teal warmth */
    body::before {
      content: '';
      position: fixed;
      top: -10%; left: 15%;
      width: 650px; height: 650px;
      background: radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%);
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    body::after {
      content: '';
      position: fixed;
      bottom: -10%; right: 15%;
      width: 650px; height: 650px;
      background: radial-gradient(circle, rgba(2, 132, 199, 0.07) 0%, transparent 70%);
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }

    .main-wrapper {
      width: 100%;
      max-width: 1080px;
      z-index: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Top Platform Navigation */
    header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 19px;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
    }

    .brand-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #0F172A;
      line-height: 1.2;
    }

    .brand-sub {
      font-size: 10.5px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .header-link {
      color: #475569;
      font-size: 12.5px;
      font-weight: 600;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 10px;
      background: #FFFFFF;
      border: 1px solid #E5DFD5;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .header-link:hover {
      color: #059669;
      background: #FAF7F2;
      border-color: #059669;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.12);
    }

    /* Top Gateway Header */
    .gateway-header {
      text-align: center;
      margin-bottom: 26px;
    }

    .gateway-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #059669;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .gateway-badge .badge-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #059669;
      box-shadow: 0 0 8px #059669;
    }

    .gateway-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: #0F172A;
      margin-bottom: 8px;
    }

    .gateway-subtitle {
      font-size: 14px;
      color: #64748B;
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.5;
    }

    /* Master Console Card — White & Cream theme */
    .console-card {
      width: 100%;
      background: #FFFFFF;
      border: 1px solid #E5DFD5;
      border-radius: 24px;
      box-shadow: 0 20px 45px -12px rgba(45, 35, 25, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: cardFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(18px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Console Top Navigation Bar */
    .console-topbar {
      padding: 14px 28px;
      background: #F4EFEB;
      border-bottom: 1px solid #E5DFD5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .security-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #059669;
    }

    .security-badge .sec-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #059669;
      box-shadow: 0 0 8px rgba(5, 150, 105, 0.6);
    }

    /* Split 2-Column Body */
    .console-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 480px;
    }

    @media (max-width: 860px) {
      .console-body {
        grid-template-columns: 1fr;
      }
      .left-panel {
        border-right: none !important;
        border-bottom: 1px solid #E5DFD5;
      }
    }

    /* Left Overview Panel — Soft Cream Warmth */
    .left-panel {
      padding: 44px 40px;
      background: #FAF7F2;
      border-right: 1px solid #E5DFD5;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .org-hero-brand {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      width: 100%;
    }

    .org-hero-brand #orgLogoBox {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
      overflow: hidden;
      flex-shrink: 0;
    }

    .org-hero-brand .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #0F172A;
      line-height: 1.25;
      margin-bottom: 3px;
    }

    .org-hero-brand .brand-subtitle {
      font-size: 11px;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 800;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 8px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #059669;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .role-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #0F172A;
      margin-bottom: 10px;
      line-height: 1.25;
    }

    .role-desc {
      font-size: 13.5px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13.5px;
      color: #334155;
      font-weight: 500;
    }

    .feature-item i {
      color: #059669;
      font-size: 14px;
      flex-shrink: 0;
    }

    .btn-action-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      background: #FFFFFF;
      border: 1px solid #E5DFD5;
      color: #059669;
      font-size: 12.5px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
      align-self: flex-start;
      cursor: pointer;
    }

    .btn-action-link:hover {
      background: #FAF7F2;
      border-color: #059669;
      transform: translateY(-1px);
    }

    /* Right Authentication Panel */
    .right-panel {
      padding: 44px 40px;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Sub Tabs: Sign In / Create Account */
    .mode-tabs {
      display: flex;
      background: #FAF7F2;
      border: 1px solid #E5DFD5;
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 20px;
      gap: 4px;
    }

    .mode-tab {
      flex: 1;
      padding: 9px 14px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: #64748B;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .mode-tab.active {
      background: #FFFFFF;
      color: #059669;
      border: 1px solid #A7F3D0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .auth-header {
      margin-bottom: 20px;
    }

    .auth-header h3 {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.3px;
      margin-bottom: 4px;
    }

    .auth-header p {
      font-size: 13px;
      color: #64748B;
    }

    .alert-box {
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      margin-bottom: 16px;
      display: none;
      align-items: center;
      gap: 10px;
    }

    .alert-box.alert-error {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #DC2626;
    }

    .alert-box.alert-success {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #059669;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 7px;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrap i.field-icon {
      position: absolute;
      left: 15px;
      color: #94A3B8;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px 12px 42px;
      background: #FAF8F5;
      border: 1px solid #E5DFD5;
      border-radius: 10px;
      color: #0F172A;
      font-size: 14px;
      outline: none;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .form-control:focus {
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
      background: #FFFFFF;
    }

    select.form-control option {
      background: #FFFFFF;
      color: #0F172A;
    }

    .toggle-pass {
      position: absolute;
      right: 14px;
      color: #94A3B8;
      cursor: pointer;
      font-size: 14px;
      transition: color 0.2s;
    }

    .toggle-pass:hover {
      color: #0F172A;
    }

    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 12.5px;
    }

    .remember-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #475569;
      cursor: pointer;
    }

    .remember-wrap input[type="checkbox"] {
      accent-color: #059669;
      width: 15px;
      height: 15px;
      border-radius: 4px;
    }

    .forgot-link {
      color: #059669;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .btn-submit {
      width: 100%;
      padding: 14px 20px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #059669 0%, #0284c7 100%);
      color: #ffffff;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.25);
      transition: all 0.25s ease;
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.35);
      filter: brightness(1.06);
    }

    .auth-footer-text {
      text-align: center;
      margin-top: 18px;
      font-size: 12px;
      color: #64748B;
    }

    .auth-footer-text a {
      color: #059669;
      font-weight: 700;
      text-decoration: none;
      margin-left: 4px;
    }

    .auth-footer-text a:hover {
      text-decoration: underline;
    }

    /* Modal Overlay for OTP Verification */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-box {
      background: #FFFFFF;
      border: 1px solid #E5DFD5;
      border-radius: 20px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px; right: 16px;
      background: #FAF7F2;
      border: 1px solid #E5DFD5;
      color: #64748B;
      width: 32px; height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close-btn:hover {
      color: #0F172A;
      background: #F4EFEB;
    }

    .verify-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      color: #059669;
      font-weight: 700;
      margin: 10px 0 14px 0;
    }

    .otp-field {
      width: 100%;
      background: #FAF8F5;
      border: 2px solid #E5DFD5;
      color: #0F172A;
      font-size: 24px;
      letter-spacing: 6px;
      text-align: center;
      padding: 12px;
      border-radius: 10px;
      font-weight: 700;
      margin: 14px 0;
      outline: none;
    }

    .otp-field:focus {
      border-color: #059669;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
    }

    footer {
      margin-top: 28px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    footer a {
      color: #475569;
      text-decoration: none;
      transition: color 0.2s;
    }

    footer a:hover {
      color: #059669;
    }
  </style>`;

  financeHtml = financeHtml.substring(0, financeStyleStart) + newFinanceCss + financeHtml.substring(financeStyleEnd + 8);
}

// Update Top header navigation in finance-login.html to include SlideOver buttons
const oldFinanceHeader = `<header>
    <a href="../../index.html" class="brand">
      <div class="brand-logo">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <div>
        <div class="brand-title">FLAWLESS GRAPHICS</div>
        <div class="brand-sub">Enterprise Institutional Cloud</div>
      </div>
    </a>
  </header>`;

const newFinanceHeader = `<header>
    <a href="../../index.html" class="brand">
      <div class="brand-logo">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <div>
        <div class="brand-title">FLAWLESS GRAPHICS</div>
        <div class="brand-sub">Enterprise Institutional Cloud</div>
      </div>
    </a>
    <div class="header-nav">
      <button type="button" class="header-link" onclick="SlideOver.openGuide('finance')">
        <i class="fa-solid fa-book-open"></i> Finance Guide
      </button>
      <button type="button" class="header-link" onclick="SlideOver.openWorkspaceDirectory()">
        <i class="fa-solid fa-building-columns"></i> Workspaces
      </button>
      <a href="../../site-login.html" class="header-link">
        <i class="fa-solid fa-layer-group"></i> All Portals
      </a>
    </div>
  </header>`;

if (financeHtml.includes(oldFinanceHeader)) {
  financeHtml = financeHtml.replace(oldFinanceHeader, newFinanceHeader);
}

// Update forgot password link in finance
financeHtml = financeHtml.replace(
  `onclick="if(window.Toaster) window.Toaster.info('Support', 'Please contact institutional IT support to reset credentials.')"`,
  `onclick="event.preventDefault(); SlideOver.openForgotPassword('finance');"`
);

// Update select dropdown style in finance HTML
financeHtml = financeHtml.replace(
  `style="background: rgba(15, 23, 42, 0.7); color: #fff; padding-left: 40px;"`,
  `style="background: #FAF8F5; color: #0F172A; padding-left: 40px;"`
);

// Update modal title in finance
financeHtml = financeHtml.replace(
  `<h3 style="font-size: 19px; font-weight: 800; color: #fff; margin-bottom: 4px;">Verify Finance Account</h3>`,
  `<h3 style="font-size: 19px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">Verify Finance Account</h3>`
);
financeHtml = financeHtml.replace(
  `<p style="font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 6px;">`,
  `<p style="font-size: 12.5px; color: #475569; line-height: 1.5; margin-bottom: 6px;">`
);

fs.writeFileSync(financePath, financeHtml, 'utf8');
console.log('Successfully updated pages/finance/finance-login.html');


// 2. UPDATE STUDENT LOGIN
const studentPath = path.join(__dirname, '..', 'pages', 'student', 'student-login.html');
let studentHtml = fs.readFileSync(studentPath, 'utf8');

// Ensure slide-over.css in head
if (!studentHtml.includes('slide-over.css')) {
  studentHtml = studentHtml.replace(
    '</head>',
    '  <!-- Universal Slide-Over Stylesheet -->\n  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>'
  );
}

// Ensure slide-over.js before </body>
if (!studentHtml.includes('slide-over.js')) {
  studentHtml = studentHtml.replace(
    '</body>',
    '  <!-- Universal Slide-Over Controller Engine -->\n  <script src="../../assets/js/slide-over.js"></script>\n</body>'
  );
}

// Replace style block in student-login.html
const studentStyleStart = studentHtml.indexOf('<style>');
const studentStyleEnd = studentHtml.indexOf('</style>', studentStyleStart);

if (studentStyleStart !== -1 && studentStyleEnd !== -1) {
  const newStudentCss = `<style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #F8F5EE;
        background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('../../assets/img/graduation-bg.jpg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 32px 16px;
        color: #0F172A;
        overflow-x: hidden;
        position: relative;
    }

    /* Subtle blueprint grid overlay */
    .grid-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background-image: 
            linear-gradient(to right, rgba(180, 160, 140, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(180, 160, 140, 0.08) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        z-index: 0;
    }

    body::before {
        content: '';
        position: fixed;
        top: -10%; left: 15%;
        width: 650px; height: 650px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
        filter: blur(90px);
        pointer-events: none;
        z-index: 0;
    }
    body::after {
        content: '';
        position: fixed;
        bottom: -10%; right: 15%;
        width: 650px; height: 650px;
        background: radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, transparent 70%);
        filter: blur(90px);
        pointer-events: none;
        z-index: 0;
    }

    .main-wrapper {
        width: 100%;
        max-width: 1060px;
        z-index: 1;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* Top Platform Navigation */
    .platform-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 12px;
    }

    .brand-top {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: inherit;
    }

    .brand-top-logo {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 19px;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
    }

    .header-nav {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .header-link {
        color: #475569;
        font-size: 12.5px;
        font-weight: 600;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 10px;
        background: #FFFFFF;
        border: 1px solid #E5DFD5;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
    }

    .header-link:hover {
        color: #4f46e5;
        background: #FAF7F2;
        border-color: #4f46e5;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12);
    }

    /* Top Gateway Header */
    .gateway-header {
        text-align: center;
        margin-bottom: 26px;
    }

    .gateway-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        border-radius: 9999px;
        background: #EEF2FF;
        border: 1px solid #C7D2FE;
        color: #4f46e5;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 12px;
    }

    .gateway-badge .badge-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #4f46e5;
        box-shadow: 0 0 8px #4f46e5;
    }

    .gateway-title {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.6px;
        color: #0F172A;
        margin-bottom: 8px;
    }

    .gateway-subtitle {
        font-size: 14px;
        color: #64748B;
        max-width: 680px;
        margin: 0 auto;
        line-height: 1.5;
    }

    /* Window Frame Container — White & Cream theme */
    .app-window {
        width: 100%;
        max-width: 1060px;
        background: #FFFFFF;
        border: 1px solid #E5DFD5;
        border-radius: 24px;
        box-shadow: 0 20px 45px -12px rgba(45, 35, 25, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: windowEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes windowEntrance {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Window Header / Console Topbar */
    .window-header {
        background: #F4EFEB;
        padding: 14px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #E5DFD5;
    }

    .security-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #4f46e5;
    }
    .security-badge .sec-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #4f46e5;
        box-shadow: 0 0 8px rgba(79, 70, 229, 0.6);
        display: inline-block;
    }

    /* Main Container */
    .main-container {
        display: flex;
        flex-direction: row;
        min-height: 520px;
        position: relative;
    }

    @media (max-width: 860px) {
        .main-container {
            flex-direction: column;
        }
        .hero-section {
            border-right: none !important;
            border-bottom: 1px solid #E5DFD5;
        }
    }

    /* Left Hero Section — Warm Cream Background */
    .hero-section {
        flex: 1.1;
        padding: 38px 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        background: #FAF7F2;
        border-right: 1px solid #E5DFD5;
    }

    .brand-logo {
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 2;
    }

    .brand-title {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #0F172A;
        line-height: 1.2;
    }

    .brand-subtitle {
        font-size: 11px;
        color: #4f46e5;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 700;
        margin-top: 2px;
    }

    .hero-text {
        z-index: 2;
        margin: 24px 0;
    }

    .hero-text h1 {
        font-size: 27px;
        font-weight: 800;
        line-height: 1.35;
        color: #0F172A;
    }

    .hero-text span {
        background: linear-gradient(90deg, #0284c7, #4f46e5);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .hero-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 14px;
        z-index: 2;
    }

    .feature-pill {
        background: #FFFFFF;
        border: 1px solid #E5DFD5;
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #334155;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .feature-pill i {
        color: #4f46e5;
        font-size: 14px;
    }

    .hero-buttons {
        display: flex;
        gap: 12px;
        align-items: center;
        z-index: 2;
        margin-top: 20px;
    }

    .btn-outline {
        background: #FFFFFF;
        border: 1px solid #E5DFD5;
        color: #4f46e5;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        transition: all 0.25s ease;
    }

    .btn-outline:hover {
        background: #FAF7F2;
        border-color: #4f46e5;
        transform: translateY(-1px);
    }

    /* Right Form Section */
    .form-section {
        flex: 1.15;
        padding: 30px 34px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: #FFFFFF;
    }

    .card {
        background: transparent;
        border: none;
        padding: 10px 0;
        box-shadow: none;
    }

    /* Auth Mode Tabs */
    .auth-tabs {
        display: flex;
        background: #FAF7F2;
        border-radius: 12px;
        padding: 4px;
        gap: 6px;
        margin-bottom: 20px;
        border: 1px solid #E5DFD5;
    }

    .tab-btn {
        flex: 1;
        padding: 8px 14px;
        border: none;
        background: transparent;
        color: #64748B;
        font-size: 12.5px;
        font-weight: 700;
        border-radius: 9px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
    }

    .tab-btn.active {
        background: #FFFFFF;
        color: #4f46e5;
        border: 1px solid #C7D2FE;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .card h2 {
        font-size: 22px;
        font-weight: 800;
        color: #0F172A;
        margin-bottom: 4px;
    }

    .card-subtitle {
        font-size: 12px;
        color: #64748B;
        margin-bottom: 18px;
    }

    .msg {
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 12.5px;
        margin-bottom: 14px;
        display: none;
    }
    .msg.error {
        background: #FEF2F2;
        border: 1px solid #FCA5A5;
        color: #DC2626;
        display: block;
    }
    .msg.success {
        background: #ECFDF5;
        border: 1px solid #A7F3D0;
        color: #059669;
        display: block;
    }

    /* Form Styles */
    .form-group {
        margin-bottom: 14px;
    }

    .form-group label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .input-wrapper {
        position: relative;
    }

    .input-wrapper input, .input-wrapper select {
        width: 100%;
        background: #FAF8F5;
        border: 1px solid #E5DFD5;
        border-radius: 10px;
        padding: 10px 14px 10px 38px;
        color: #0F172A;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        transition: all 0.25s ease;
    }

    .input-wrapper input:focus, .input-wrapper select:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        background: #FFFFFF;
    }

    .input-wrapper select option {
        background: #FFFFFF;
        color: #0F172A;
    }

    .input-wrapper .field-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        font-size: 13px;
    }

    .input-wrapper .toggle-pw {
        position: absolute;
        right: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        font-size: 13px;
        cursor: pointer;
    }

    .input-wrapper .toggle-pw:hover {
        color: #0F172A;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    /* Submit Button */
    .btn-submit {
        width: 100%;
        background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
        color: #ffffff;
        border: none;
        padding: 12px 18px;
        border-radius: 11px;
        font-size: 13.5px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        transition: all 0.25s ease;
        margin-top: 8px;
    }

    .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(79, 70, 229, 0.35);
        filter: brightness(1.05);
    }

    /* Modal Overlay */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
    }
    .modal-overlay.active {
        display: flex;
    }

    .modal-box {
        background: #FFFFFF;
        border: 1px solid #E5DFD5;
        border-radius: 20px;
        width: 100%;
        max-width: 440px;
        padding: 26px 28px;
        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.2);
        position: relative;
        text-align: center;
        color: #0F172A;
    }

    .modal-close-btn {
        position: absolute;
        top: 16px;
        right: 18px;
        background: #FAF7F2;
        border: 1px solid #E5DFD5;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #64748B;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    .modal-close-btn:hover {
        color: #0F172A;
        background: #F4EFEB;
    }
</style>`;

  studentHtml = studentHtml.substring(0, studentStyleStart) + newStudentCss + studentHtml.substring(studentStyleEnd + 8);
}

// Add top platform nav to student login before gateway-header
const studentNavInsert = `<header class="platform-header">
        <a href="../../index.html" class="brand-top">
            <div class="brand-top-logo">
                <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
                <div style="font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.2;">FLAWLESS GRAPHICS</div>
                <div style="font-size: 10.5px; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700;">Student Academic Cloud</div>
            </div>
        </a>
        <div class="header-nav">
            <button type="button" class="header-link" onclick="SlideOver.openGuide('student')">
                <i class="fa-solid fa-book-open"></i> Student Guide
            </button>
            <button type="button" class="header-link" onclick="SlideOver.openWorkspaceDirectory()">
                <i class="fa-solid fa-building-columns"></i> Workspaces
            </button>
            <a href="../../site-login.html" class="header-link">
                <i class="fa-solid fa-layer-group"></i> All Portals
            </a>
        </div>
    </header>`;

if (!studentHtml.includes('class="platform-header"')) {
  studentHtml = studentHtml.replace(
    '<div class="main-wrapper">',
    '<div class="main-wrapper">\n    ' + studentNavInsert
  );
}

// Add forgot password link to student login form before submit button
const studentForgotSnippet = `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; margin-bottom: 12px; font-size: 12px;">
                        <label style="display: flex; align-items: center; gap: 6px; color: #475569; cursor: pointer;">
                            <input type="checkbox" id="rememberStudent" checked style="accent-color: #4f46e5;"> Remember me
                        </label>
                        <a href="#" onclick="event.preventDefault(); SlideOver.openForgotPassword('student');" style="color: #4f46e5; font-weight: 600; text-decoration: none;">Forgot Password?</a>
                    </div>`;

if (!studentHtml.includes("SlideOver.openForgotPassword('student')")) {
  studentHtml = studentHtml.replace(
    '<button type="submit" id="submitBtn"',
    studentForgotSnippet + '\n                    <button type="submit" id="submitBtn"'
  );
}

// Update modal styling in student login
studentHtml = studentHtml.replace(
  `<h3 style="font-size: 19px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">Student Identity Verification</h3>`,
  `<h3 style="font-size: 19px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">Student Identity Verification</h3>`
);
studentHtml = studentHtml.replace(
  `<p style="font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 14px;">`,
  `<p style="font-size: 12.5px; color: #475569; line-height: 1.5; margin-bottom: 14px;">`
);
studentHtml = studentHtml.replace(
  `background: rgba(15, 23, 42, 0.8); padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.35);`,
  `background: #FAF8F5; padding: 8px 16px; border-radius: 10px; border: 1px solid #C7D2FE;`
);
studentHtml = studentHtml.replace(
  `background: rgba(15, 23, 42, 0.8); color: #ffffff; margin-bottom: 12px; outline: none;`,
  `background: #FAF8F5; color: #0F172A; border-color: #E5DFD5; margin-bottom: 12px; outline: none;`
);

// Update select style in student login
studentHtml = studentHtml.replace(
  `style="width: 100%; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 11px 14px 11px 40px; color: #ffffff; font-size: 13.5px; outline: none;"`,
  `style="width: 100%; background: #FAF8F5; border: 1px solid #E5DFD5; border-radius: 10px; padding: 11px 14px 11px 40px; color: #0F172A; font-size: 13.5px; outline: none;"`
);

// Update hero buttons to open slide over drawers
studentHtml = studentHtml.replace(
  `<a href="../public/home.html" class="btn-outline"><i class="fa-solid fa-compass"></i> Campus Tour</a>`,
  `<button type="button" class="btn-outline" onclick="SlideOver.openGuide('student')"><i class="fa-solid fa-book-open"></i> Student Guide</button>`
);
studentHtml = studentHtml.replace(
  `<a href="../../welcome.html" class="btn-outline"><i class="fa-solid fa-arrow-left"></i> Workspace Hub</a>`,
  `<button type="button" class="btn-outline" onclick="SlideOver.openWorkspaceDirectory()"><i class="fa-solid fa-building-columns"></i> Directory</button>`
);

fs.writeFileSync(studentPath, studentHtml, 'utf8');
console.log('Successfully updated pages/student/student-login.html');
