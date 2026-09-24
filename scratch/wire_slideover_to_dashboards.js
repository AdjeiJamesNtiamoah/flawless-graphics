const fs = require('fs');
const path = require('path');

// 1. TEACHER DASHBOARD
const teacherDashPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
if (fs.existsSync(teacherDashPath)) {
  let tHtml = fs.readFileSync(teacherDashPath, 'utf8');
  if (!tHtml.includes('slide-over.css')) {
    tHtml = tHtml.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>');
  }
  if (!tHtml.includes('slide-over.js')) {
    tHtml = tHtml.replace('</body>', '  <script src="../../assets/js/slide-over.js"></script>\n</body>');
  }
  // Connect notif bell
  tHtml = tHtml.replace(
    'onclick="toggleNotificationPopover(event)"',
    'onclick="SlideOver.openNotifications()"'
  );
  // Connect profile row
  tHtml = tHtml.replace(
    '<div class="profile-row">',
    '<div class="profile-row" onclick="SlideOver.openProfile()" style="cursor: pointer;" title="Open Profile Drawer">'
  );
  fs.writeFileSync(teacherDashPath, tHtml, 'utf8');
  console.log('Teacher dashboard wired to SlideOver');
}

// 2. HR DASHBOARD
const hrDashPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
if (fs.existsSync(hrDashPath)) {
  let hrHtml = fs.readFileSync(hrDashPath, 'utf8');
  if (!hrHtml.includes('slide-over.css')) {
    hrHtml = hrHtml.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>');
  }
  if (!hrHtml.includes('slide-over.js')) {
    hrHtml = hrHtml.replace('</body>', '  <script src="../../assets/js/slide-over.js"></script>\n</body>');
  }
  // Add SlideOver triggers in topbar controls if not already added
  if (!hrHtml.includes('SlideOver.openNotifications()')) {
    hrHtml = hrHtml.replace(
      '<div id="topRightProfileContainer" class="fg-top-profile-container"></div>',
      `<button type="button" class="btn ghost" onclick="SlideOver.openNotifications()" title="Notifications" style="border: 1px solid var(--border); border-radius: 9999px; width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text);">
        <i class="fa-regular fa-bell" style="font-size: 14px;"></i>
      </button>
      <button type="button" class="btn ghost" onclick="SlideOver.openGuide('hr')" title="HR Portal Guide" style="border: 1px solid var(--border); border-radius: 9999px; width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text);">
        <i class="fa-solid fa-book-open" style="font-size: 14px;"></i>
      </button>
      <div id="topRightProfileContainer" class="fg-top-profile-container" onclick="SlideOver.openProfile()" style="cursor: pointer;" title="Profile Drawer"></div>`
    );
  }
  fs.writeFileSync(hrDashPath, hrHtml, 'utf8');
  console.log('HR dashboard wired to SlideOver');
}

// 3. ADMIN DASHBOARD
const adminDashPath = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');
if (fs.existsSync(adminDashPath)) {
  let adminHtml = fs.readFileSync(adminDashPath, 'utf8');
  if (!adminHtml.includes('slide-over.css')) {
    adminHtml = adminHtml.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>');
  }
  if (!adminHtml.includes('slide-over.js')) {
    adminHtml = adminHtml.replace('</body>', '  <script src="../../assets/js/slide-over.js"></script>\n</body>');
  }
  // Connect notif button to SlideOver
  adminHtml = adminHtml.replace(
    `onclick="if(window.QuickDock){window.QuickDock.openNotifications();}"`,
    `onclick="SlideOver.openNotifications()"`
  );
  // Add Guide button to admin topbar
  if (!adminHtml.includes("SlideOver.openGuide('admin')")) {
    adminHtml = adminHtml.replace(
      `<button type="button" class="btn-top ghost" onclick="openBackupExportModal()"`,
      `<button type="button" class="btn-top ghost" onclick="SlideOver.openGuide('admin')" title="Admin Operating Guide"><i class="fa-solid fa-book-open"></i> Guide</button>\n        <button type="button" class="btn-top ghost" onclick="openBackupExportModal()"`
    );
  }
  fs.writeFileSync(adminDashPath, adminHtml, 'utf8');
  console.log('Admin dashboard wired to SlideOver');
}

// 4. FINANCE DASHBOARD
const finDashPath = path.join(__dirname, '..', 'pages', 'finance', 'finance-dashboard.html');
if (fs.existsSync(finDashPath)) {
  let finHtml = fs.readFileSync(finDashPath, 'utf8');
  if (!finHtml.includes('slide-over.css')) {
    finHtml = finHtml.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>');
  }
  if (!finHtml.includes('slide-over.js')) {
    finHtml = finHtml.replace('</body>', '  <script src="../../assets/js/slide-over.js"></script>\n</body>');
  }
  // Add slide-over triggers to finance sidebar
  if (!finHtml.includes('SlideOver.openNotifications()')) {
    finHtml = finHtml.replace(
      '<div class="header-actions">',
      `<div class="header-actions">
        <button type="button" class="btn-action" onclick="SlideOver.openNotifications()"><i class="fa-solid fa-bell"></i> Audit &amp; Alerts</button>
        <button type="button" class="btn-action" onclick="SlideOver.openGuide('finance')"><i class="fa-solid fa-book-open"></i> Treasury Guide</button>
        <button type="button" class="btn-action" onclick="SlideOver.openWorkspaceDirectory()"><i class="fa-solid fa-building-columns"></i> Workspaces</button>`
    );
  }
  fs.writeFileSync(finDashPath, finHtml, 'utf8');
  console.log('Finance dashboard wired to SlideOver');
}

// 5. STUDENT DASHBOARD
const stuDashPath = path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html');
if (fs.existsSync(stuDashPath)) {
  let stuHtml = fs.readFileSync(stuDashPath, 'utf8');
  if (!stuHtml.includes('slide-over.css')) {
    stuHtml = stuHtml.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/slide-over.css">\n</head>');
  }
  if (!stuHtml.includes('slide-over.js')) {
    stuHtml = stuHtml.replace('</body>', '  <script src="../../assets/js/slide-over.js"></script>\n</body>');
  }
  // Connect notif bell
  if (!stuHtml.includes('SlideOver.openNotifications()')) {
    stuHtml = stuHtml.replace(
      'class="notif-bell-btn"',
      'class="notif-bell-btn" onclick="SlideOver.openNotifications()"'
    );
  }
  // Connect top badge to profile
  if (!stuHtml.includes('SlideOver.openProfile()')) {
    stuHtml = stuHtml.replace(
      'class="student-badge-top"',
      'class="student-badge-top" onclick="SlideOver.openProfile()" title="Open Profile Drawer"'
    );
  }
  fs.writeFileSync(stuDashPath, stuHtml, 'utf8');
  console.log('Student dashboard wired to SlideOver');
}
