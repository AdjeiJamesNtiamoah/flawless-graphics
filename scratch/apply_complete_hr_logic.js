const fs = require('fs');
const path = require('path');

const hrFile = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
let content = fs.readFileSync(hrFile, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Locate SECTION 8: BROADCASTS & ANNOUNCEMENTS to the end of SECTION 9: SETTINGS & HR COPILOT
// In hr-dashboard.html, we saw:
// /* -------------------------------------------------------------
//    SECTION 8: BROADCASTS & ANNOUNCEMENTS
// ------------------------------------------------------------- */
// ... up to ...
// /* -------------------------------------------------------------
//    SUPABASE CLOUD SYNC UI CONTROLLERS
// ------------------------------------------------------------- */

const logicTargetStart = `/* -------------------------------------------------------------
   SECTION 8: BROADCASTS & ANNOUNCEMENTS
------------------------------------------------------------- */`;

const logicTargetEnd = `/* -------------------------------------------------------------
   SUPABASE CLOUD SYNC UI CONTROLLERS
------------------------------------------------------------- */`;

const startIdx = content.indexOf(logicTargetStart);
const endIdx = content.indexOf(logicTargetEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('FAIL: Could not locate Section 8/9 logic boundaries');
  process.exit(1);
}

const completeNewLogic = `/* -------------------------------------------------------------
   SECTION 8: CROSS-PORTAL BROADCASTS & DIRECTIVES HUB
------------------------------------------------------------- */
function renderAnnouncements() {
  const ann = read(ANNOUNCE_KEY);
  const container = document.getElementById('broadcastsCardsContainer');
  if (!container) return;
  container.innerHTML = '';

  const searchVal = (document.getElementById('searchBroadcasts')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('filterBcCategory')?.value || '';

  let filtered = ann.filter(a => {
    const title = (a.title || '').toLowerCase();
    const body = (a.body || a.text || '').toLowerCase();
    const author = (a.author || '').toLowerCase();
    const matchSearch = !searchVal || title.includes(searchVal) || body.includes(searchVal) || author.includes(searchVal);
    const matchCat = !catFilter || (a.category && a.category.toLowerCase() === catFilter.toLowerCase());
    return matchSearch && matchCat;
  });

  // Sort pinned first, then newest timestamp
  filtered.sort((x, y) => {
    if (x.pinned && !y.pinned) return -1;
    if (!x.pinned && y.pinned) return 1;
    return (y.timestamp || 0) - (x.timestamp || 0);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="color:var(--muted); text-align:center; padding:36px; background:var(--card); border:1px dashed var(--border); border-radius:12px;"><i class="fa-solid fa-bullhorn" style="font-size:24px; margin-bottom:8px; opacity:0.4;"></i><div>No matching broadcasts or directives found.</div></div>';
    return;
  }

  const catColors = {
    Urgent: { bg: '#fee2e2', text: '#dc2626', icon: 'fa-triangle-exclamation' },
    Academic: { bg: '#e0e7ff', text: '#4338ca', icon: 'fa-graduation-cap' },
    Policy: { bg: '#fef3c7', text: '#b45309', icon: 'fa-shield-halved' },
    General: { bg: '#f1f5f9', text: '#475569', icon: 'fa-circle-info' }
  };

  filtered.forEach(a => {
    const cat = a.category || 'General';
    const cStyle = catColors[cat] || catColors.General;
    const isSuperAdmin = a.role === 'admin' || (a.author && a.author.includes('Super Admin'));
    const isPinned = !!a.pinned;
    const isHighPriority = a.priority === 'High';

    const card = document.createElement('div');
    card.style.cssText = \`background:var(--card); border:1px solid \${isPinned ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)'}; border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); \${isPinned ? 'border-left:4px solid #f59e0b;' : ''}\`;
    card.innerHTML = \`
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          \${isSuperAdmin
            ? '<span class="badge-pill" style="background:#fef3c7; color:#b45309; border:1px solid rgba(245, 158, 11, 0.3); font-weight:800;"><i class="fa-solid fa-certificate"></i> [Super Admin Broadcast]</span>'
            : '<span class="badge-pill badge-purple"><i class="fa-solid fa-user-shield"></i> ' + escapeHtml(a.author || 'HR Administration') + '</span>'
          }
          <span class="badge-pill" style="background:\${cStyle.bg}; color:\${cStyle.text}; font-weight:700;">
            <i class="fa-solid \${cStyle.icon}"></i> \${escapeHtml(cat)}
          </span>
          \${isHighPriority ? '<span class="badge-pill badge-red"><i class="fa-solid fa-bell"></i> High Priority</span>' : ''}
          \${isPinned ? '<span class="badge-pill badge-orange"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : ''}
        </div>
        <div style="font-size:12px; color:var(--muted); font-weight:600;">
          <i class="fa-solid fa-clock"></i> \${escapeHtml(a.date || 'Today')}
        </div>
      </div>

      <div style="font-size:15.5px; font-weight:800; color:var(--text); margin-bottom:8px;">
        \${escapeHtml(a.title || 'Institutional Directive')}
      </div>
      <div style="font-size:13.5px; color:var(--text); line-height:1.6; margin-bottom:14px; white-space:pre-wrap;">
        \${escapeHtml(a.body || a.text || '')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:10px; font-size:12px; color:var(--muted);">
        <div>
          Target Audience: <strong>\${a.audience === 'teachers' ? 'Teaching Faculty' : a.audience === 'support' ? 'Support Staff' : 'All Personnel'}</strong>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn ghost" style="padding:4px 10px; font-size:11.5px;" onclick="togglePinAnnouncement('\${a.id}')" title="Toggle Pin">
            <i class="fa-solid fa-thumbtack"></i> \${isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button type="button" class="btn ghost" style="padding:4px 10px; font-size:11.5px; color:var(--accent-red);" onclick="deleteAnnouncement('\${a.id}')" title="Delete Broadcast">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    \`;
    container.appendChild(card);
  });
}

function handlePublishBroadcast(e) {
  if (e) e.preventDefault();
  const title = document.getElementById('bc_title')?.value.trim();
  const category = document.getElementById('bc_category')?.value || 'General';
  const priority = document.getElementById('bc_priority')?.value || 'Normal';
  const audience = document.getElementById('bc_audience')?.value || 'all';
  const body = document.getElementById('bc_body')?.value.trim();
  const pinned = document.getElementById('bc_pinned')?.checked || false;

  if (!title || !body) {
    alert('Please specify both broadcast subject and message body.');
    return;
  }

  const ann = read(ANNOUNCE_KEY);
  const hrName = (user && (user.name || user.fullName)) || 'HR Administration';
  const newBc = {
    id: 'bc_' + Date.now(),
    title: title,
    body: body,
    text: body, // backwards-compatible
    author: \`\${hrName} (HR Directorate)\`,
    role: 'hr',
    category: category,
    priority: priority,
    audience: audience,
    pinned: pinned,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  ann.unshift(newBc);
  save(ANNOUNCE_KEY, ann);

  document.getElementById('broadcastComposeForm')?.reset();
  renderAnnouncements();
  showToast('Official Broadcast Published Across Staff Portals');
}

function deleteAnnouncement(targetId) {
  let ann = read(ANNOUNCE_KEY);
  if (typeof targetId === 'number') {
    ann.splice(targetId, 1);
  } else {
    ann = ann.filter(a => String(a.id) !== String(targetId));
  }
  save(ANNOUNCE_KEY, ann);
  renderAnnouncements();
  showToast('Broadcast deleted from board');
}

function togglePinAnnouncement(targetId) {
  let ann = read(ANNOUNCE_KEY);
  const target = ann.find(a => String(a.id) === String(targetId));
  if (target) {
    target.pinned = !target.pinned;
    save(ANNOUNCE_KEY, ann);
    renderAnnouncements();
    showToast(target.pinned ? 'Broadcast pinned to top' : 'Broadcast unpinned');
  }
}

function filterBroadcasts() {
  renderAnnouncements();
}

/* -------------------------------------------------------------
   SECTION 9: ENTERPRISE PROJECT & DASHBOARD SETTINGS WORKSTATION
------------------------------------------------------------- */
const SETTING_KEY = \`\${ACTIVE_ORG}_portal_settings\`;

function switchSettingsTab(tabKey) {
  document.querySelectorAll('#settingsSubTabs .sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.settab === tabKey);
  });
  document.querySelectorAll('.settings-tab-panel').forEach(panel => {
    panel.style.display = panel.id === 'settab_' + tabKey ? 'block' : 'none';
  });
}

function renderSettingsSection() {
  const cfg = safeParse(localStorage.getItem(SETTING_KEY)) || {};
  
  // Tab 1: Profile
  const orgNameEl = document.getElementById('cfg_orgName');
  if (orgNameEl) orgNameEl.value = cfg.orgName || ACTIVE_ORG || 'FLAWLESS GRAPHICS';
  const taglineEl = document.getElementById('cfg_orgTagline');
  if (taglineEl) taglineEl.value = cfg.tagline || 'Excellence in Creative Design & Technology Education';
  const regNoEl = document.getElementById('cfg_regNo');
  if (regNoEl) regNoEl.value = cfg.regNo || 'GHA-729401928-3 / CS-2026-GH';
  const emailEl = document.getElementById('cfg_orgEmail');
  if (emailEl) emailEl.value = cfg.email || 'hr@flawlessgraphics.edu.gh';
  const phoneEl = document.getElementById('cfg_orgPhone');
  if (phoneEl) phoneEl.value = cfg.phone || '+233 24 123 4567';
  const addressEl = document.getElementById('cfg_orgAddress');
  if (addressEl) addressEl.value = cfg.address || 'Plot 14, Ring Road Central, Accra, Ghana';
  const logoUrlEl = document.getElementById('cfg_logoUrl');
  if (logoUrlEl) logoUrlEl.value = cfg.logoUrl || '';
  if (cfg.logoUrl) previewLogoFromUrl(cfg.logoUrl);

  // Tab 2: Standards
  const yearEl = document.getElementById('cfg_academicYear');
  if (yearEl) yearEl.value = cfg.academicYear || '2026/2027';
  const gradeEl = document.getElementById('cfg_gradingStandard');
  if (gradeEl) gradeEl.value = cfg.gradingStandard || 'waec';
  const shiftStartEl = document.getElementById('cfg_shiftStart');
  if (shiftStartEl) shiftStartEl.value = cfg.shiftStart || '08:00';
  const shiftEndEl = document.getElementById('cfg_shiftEnd');
  if (shiftEndEl) shiftEndEl.value = cfg.shiftEnd || '17:00';
  const graceEl = document.getElementById('cfg_gracePeriod');
  if (graceEl) graceEl.value = cfg.gracePeriod || 15;
  const hoursEl = document.getElementById('cfg_minHours');
  if (hoursEl) hoursEl.value = cfg.minHours || 35;

  // Tab 3: Localization
  const currEl = document.getElementById('cfg_currency');
  if (currEl) currEl.value = cfg.currency || 'GHS';
  const currFmtEl = document.getElementById('cfg_currencyFormat');
  if (currFmtEl) currFmtEl.value = cfg.currencyFormat || 'prefix';
  const dateFmtEl = document.getElementById('cfg_dateFormat');
  if (dateFmtEl) dateFmtEl.value = cfg.dateFormat || 'DD/MM/YYYY';
  const timeFmtEl = document.getElementById('cfg_timeFormat');
  if (timeFmtEl) timeFmtEl.value = cfg.timeFormat || '12h';

  // Tab 4: Security
  const idleSlider = document.getElementById('cfg_idleSlider');
  const idleDisplay = document.getElementById('cfg_idleDisplay');
  const savedIdle = localStorage.getItem('fg_idle_minutes') || cfg.idleMinutes || '15';
  if (idleSlider) idleSlider.value = savedIdle;
  if (idleDisplay) idleDisplay.textContent = \`\${savedIdle} Minutes\`;
  const mfaEl = document.getElementById('cfg_mfaToggle');
  if (mfaEl) mfaEl.checked = !!cfg.mfaRequired;
  const sessTimeEl = document.getElementById('cfg_sessionTimestamp');
  if (sessTimeEl) sessTimeEl.textContent = new Date().toLocaleTimeString();

  // Tab 5: Theme
  const savedColor = localStorage.getItem('fg_primary_color') || '#635bfc';
  selectThemeSwatch(savedColor, false);
}

function saveAllPortalSettings() {
  const cfg = {
    orgName: document.getElementById('cfg_orgName')?.value.trim() || ACTIVE_ORG,
    tagline: document.getElementById('cfg_orgTagline')?.value.trim() || '',
    regNo: document.getElementById('cfg_regNo')?.value.trim() || '',
    email: document.getElementById('cfg_orgEmail')?.value.trim() || '',
    phone: document.getElementById('cfg_orgPhone')?.value.trim() || '',
    address: document.getElementById('cfg_orgAddress')?.value.trim() || '',
    logoUrl: document.getElementById('cfg_logoUrl')?.value.trim() || '',
    academicYear: document.getElementById('cfg_academicYear')?.value.trim() || '2026/2027',
    gradingStandard: document.getElementById('cfg_gradingStandard')?.value || 'waec',
    shiftStart: document.getElementById('cfg_shiftStart')?.value || '08:00',
    shiftEnd: document.getElementById('cfg_shiftEnd')?.value || '17:00',
    gracePeriod: parseInt(document.getElementById('cfg_gracePeriod')?.value, 10) || 15,
    minHours: parseInt(document.getElementById('cfg_minHours')?.value, 10) || 35,
    currency: document.getElementById('cfg_currency')?.value || 'GHS',
    currencyFormat: document.getElementById('cfg_currencyFormat')?.value || 'prefix',
    dateFormat: document.getElementById('cfg_dateFormat')?.value || 'DD/MM/YYYY',
    timeFormat: document.getElementById('cfg_timeFormat')?.value || '12h',
    idleMinutes: document.getElementById('cfg_idleSlider')?.value || '15',
    mfaRequired: document.getElementById('cfg_mfaToggle')?.checked || false,
    updatedAt: Date.now()
  };

  localStorage.setItem(SETTING_KEY, JSON.stringify(cfg));
  localStorage.setItem('fg_idle_minutes', cfg.idleMinutes);

  // Update header branding immediately
  const brandTitle = document.getElementById('orgNameHeader');
  if (brandTitle) brandTitle.textContent = cfg.orgName;

  showToast('Enterprise Portal Configurations Saved');
}

function handleLogoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('cfg_logoUrl');
    if (urlInput) urlInput.value = dataUrl;
    previewLogoFromUrl(dataUrl);
    showToast('Institutional logo loaded');
  };
  reader.readAsDataURL(file);
}

function previewLogoFromUrl(url) {
  const box = document.getElementById('cfg_logoPreviewBox');
  if (!box) return;
  if (!url) {
    box.innerHTML = '<span style="font-weight:800; font-size:20px; color:var(--primary);">FG</span>';
    return;
  }
  box.innerHTML = \`<img src="\${url}" alt="Logo" style="width:100%; height:100%; object-fit:cover;">\`;
}

function selectThemeSwatch(color, triggerToast = true) {
  document.querySelectorAll('.color-swatch-box').forEach(b => {
    const swatch = b.querySelector('.color-swatch');
    const isActive = swatch && swatch.dataset.color === color;
    b.style.borderColor = isActive ? 'var(--primary)' : 'var(--border)';
    b.style.background = isActive ? 'var(--primary-light)' : 'var(--bg)';
  });
  document.documentElement.style.setProperty('--primary', color);
  localStorage.setItem('fg_primary_color', color);
  if (triggerToast) showToast('Executive accent theme applied');
}

function setDashboardThemeMode(mode) {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark-mode');
    document.documentElement.style.setProperty('--bg', '#0f172a');
    document.documentElement.style.setProperty('--card', '#1e293b');
    document.documentElement.style.setProperty('--text', '#f8fafc');
    document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.1)');
    document.getElementById('themeModeDark')?.classList.add('active');
    document.getElementById('themeModeLight')?.classList.remove('active');
  } else {
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.style.setProperty('--bg', '#FAF7F2');
    document.documentElement.style.setProperty('--card', '#ffffff');
    document.documentElement.style.setProperty('--text', '#0f172a');
    document.documentElement.style.setProperty('--border', '#e2ddd5');
    document.getElementById('themeModeLight')?.classList.add('active');
    document.getElementById('themeModeDark')?.classList.remove('active');
  }
  localStorage.setItem('fg_theme_mode', mode);
  showToast(\`Switched to \${mode === 'dark' ? 'Sleek Dark' : 'Warm Light'} theme\`);
}

function setDashboardDensity(density) {
  localStorage.setItem('fg_density', density);
  if (density === 'compact') {
    document.body.style.fontSize = '12.5px';
  } else {
    document.body.style.fontSize = '';
  }
  showToast(\`Interface spacing set to \${density}\`);
}

function exportFullDatabaseBackup() {
  const fullBackup = {
    app: 'FLAWLESS GRAPHICS HR PORTAL',
    version: '2.0-enterprise',
    org: ACTIVE_ORG,
    timestamp: Date.now(),
    exportedAt: new Date().toISOString(),
    teachers: read(EMP_KEY),
    departments: read(DEPT_KEY),
    attendance: read(ATT_KEY),
    students: read(STUD_KEY),
    calendar: read(CALENDAR_KEY),
    assessments: read(ASSESS_KEY),
    announcements: read(ANNOUNCE_KEY),
    settings: safeParse(localStorage.getItem(SETTING_KEY)) || {}
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`\${ACTIVE_ORG.replace(/\\s+/g, '_')}_Master_Database_Backup_\${Date.now()}.json\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Full Institutional Database Snapshot Exported');
}

function restoreFullDatabaseBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || (!data.teachers && !data.students && !data.announcements)) {
        throw new Error('Invalid snapshot schema. Required collections missing.');
      }
      if (Array.isArray(data.teachers)) save(EMP_KEY, data.teachers);
      if (Array.isArray(data.departments)) save(DEPT_KEY, data.departments);
      if (Array.isArray(data.attendance)) save(ATT_KEY, data.attendance);
      if (Array.isArray(data.students)) save(STUD_KEY, data.students);
      if (Array.isArray(data.calendar)) save(CALENDAR_KEY, data.calendar);
      if (Array.isArray(data.assessments)) save(ASSESS_KEY, data.assessments);
      if (Array.isArray(data.announcements)) save(ANNOUNCE_KEY, data.announcements);
      if (data.settings) localStorage.setItem(SETTING_KEY, JSON.stringify(data.settings));

      showToast('Database Snapshot Successfully Restored! Refreshing...', 'success');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      alert('Failed to restore backup: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetLocalCacheConfirm() {
  if (confirm('CAUTION: Are you sure you want to purge local cache and restore verified factory demo records? User accounts and cloud records remain safe.')) {
    localStorage.removeItem(EMP_KEY);
    localStorage.removeItem(ATT_KEY);
    localStorage.removeItem(ANNOUNCE_KEY);
    localStorage.removeItem(CALENDAR_KEY);
    localStorage.removeItem(ASSESS_KEY);
    initDefaultData();
    showToast('Local cache purged & factory records reloaded');
    setTimeout(() => window.location.reload(), 800);
  }
}

/* -------------------------------------------------------------
   SECTION 13: NATIVE ATTENDANCE LOG & PUNCTUALITY DESK
------------------------------------------------------------- */
function openAttendanceLogPanel() {
  showSection('attendance-log');
}

function renderAttendanceLogSection() {
  const records = read(ATT_KEY);
  const teachers = read(EMP_KEY);
  const tbody = document.getElementById('attendanceLogTableBody');
  if (!tbody) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('attLogDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = todayStr;
  }
  const selectedDate = dateInput ? dateInput.value : todayStr;
  const searchVal = (document.getElementById('attLogSearch')?.value || '').toLowerCase().trim();
  const deptFilter = document.getElementById('attLogDept')?.value || '';
  const statusFilter = document.getElementById('attLogStatus')?.value || '';

  // Populate department filter dropdown
  const deptSelect = document.getElementById('attLogDept');
  if (deptSelect && deptSelect.options.length <= 1) {
    const depts = [...new Set(teachers.map(t => t.department).filter(Boolean))];
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
  }

  // Populate punch staff select modal dropdown
  const punchSelect = document.getElementById('punchStaffSelect');
  if (punchSelect && punchSelect.options.length === 0) {
    teachers.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id || t.staffId || t.name;
      opt.textContent = \`\${t.name} (\${t.department || 'Faculty'})\`;
      punchSelect.appendChild(opt);
    });
  }

  // Compute KPIs for selected date
  const totalEmps = teachers.length || 1;
  const dateRecords = records.filter(r => (r.date === selectedDate));
  const presentCount = dateRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const onTimeCount = dateRecords.filter(r => r.status === 'Present').length;
  const lateCount = dateRecords.filter(r => r.status === 'Late').length;
  const leaveCount = dateRecords.filter(r => r.status === 'On Leave').length;

  const presentRate = Math.round((presentCount / totalEmps) * 100);
  const onTimeRate = presentCount > 0 ? Math.round((onTimeCount / presentCount) * 100) : 0;

  const kpiPresRate = document.getElementById('attKpiPresentRate');
  if (kpiPresRate) kpiPresRate.textContent = \`\${presentRate}%\`;
  const kpiPresCount = document.getElementById('attKpiPresentCount');
  if (kpiPresCount) kpiPresCount.textContent = \`\${presentCount} of \${totalEmps} Staff\`;
  const kpiOnTime = document.getElementById('attKpiOnTimeRate');
  if (kpiOnTime) kpiOnTime.textContent = \`\${onTimeRate}%\`;
  const kpiLate = document.getElementById('attKpiLateCount');
  if (kpiLate) kpiLate.textContent = lateCount;
  const kpiLeave = document.getElementById('attKpiLeaveCount');
  if (kpiLeave) kpiLeave.textContent = leaveCount;

  // Render Table
  tbody.innerHTML = '';
  
  // Combine existing records with employees
  let displayList = [];
  if (dateRecords.length > 0) {
    displayList = dateRecords.map(r => {
      const emp = teachers.find(t => (t.id === r.teacherId || t.name === r.teacherName)) || {};
      return {
        id: r.id,
        name: r.teacherName || emp.name || 'Personnel',
        dept: r.department || emp.department || 'General Faculty',
        staffId: emp.id || r.teacherId || 'STAFF',
        shift: '08:00 AM — 05:00 PM',
        inTime: r.inTime || '08:00',
        outTime: r.outTime || '17:00',
        duration: r.duration || '9.0 hrs',
        status: r.status || 'Present',
        remarks: r.remarks || 'Standard duty biometric check'
      };
    });
  } else {
    // Generate virtual view from roster
    displayList = teachers.map((t, idx) => ({
      id: 'att_' + t.id,
      name: t.name,
      dept: t.department || 'Academic',
      staffId: t.id || ('FG-STAFF-' + (idx + 1)),
      shift: '08:00 AM — 05:00 PM',
      inTime: idx % 4 === 1 ? '08:25' : '07:55',
      outTime: '17:00',
      duration: idx % 4 === 1 ? '8.5 hrs' : '9.0 hrs',
      status: idx % 4 === 1 ? 'Late' : (idx % 7 === 0 ? 'On Leave' : 'Present'),
      remarks: idx % 4 === 1 ? 'Traffic delay on Ring Road' : 'Duty shift verified'
    }));
  }

  // Filter
  const filtered = displayList.filter(item => {
    const matchSearch = !searchVal || item.name.toLowerCase().includes(searchVal) || item.staffId.toLowerCase().includes(searchVal);
    const matchDept = !deptFilter || item.dept.toLowerCase() === deptFilter.toLowerCase();
    const matchStatus = !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchDept && matchStatus;
  });

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--muted);">No attendance entries matching criteria for this date.</td></tr>';
    return;
  }

  filtered.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    
    let badgeHtml = '';
    if (r.status === 'Present') {
      badgeHtml = '<span class="badge-pill badge-green"><i class="fa-solid fa-circle-check"></i> On Time</span>';
    } else if (r.status === 'Late') {
      badgeHtml = '<span class="badge-pill badge-orange"><i class="fa-solid fa-clock"></i> Late Arrival</span>';
    } else if (r.status === 'On Leave') {
      badgeHtml = '<span class="badge-pill badge-purple"><i class="fa-solid fa-plane-departure"></i> Approved Leave</span>';
    } else {
      badgeHtml = '<span class="badge-pill badge-red"><i class="fa-solid fa-circle-xmark"></i> Absent</span>';
    }

    tr.innerHTML = \`
      <td style="padding:12px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
      <td style="padding:12px 16px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:10px; background:var(--primary-light); color:var(--primary); font-weight:800; font-size:12px; display:flex; align-items:center; justify-content:center;">
            \${escapeHtml(r.name.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <div style="font-weight:800; font-size:13.5px; color:var(--text);">\${escapeHtml(r.name)}</div>
            <div style="font-size:11.5px; color:var(--muted);">ID: \${escapeHtml(r.staffId)}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px 16px; font-size:13px; font-weight:600;">\${escapeHtml(r.dept)}</td>
      <td style="padding:12px 16px; font-size:12px; color:var(--muted);">\${escapeHtml(r.shift)}</td>
      <td style="padding:12px 16px; font-weight:700; font-size:13px; color:\${r.status === 'Late' ? 'var(--accent-orange)' : 'var(--text)'};">\${escapeHtml(r.inTime)}</td>
      <td style="padding:12px 16px; font-weight:700; font-size:13px;">\${escapeHtml(r.outTime)}</td>
      <td style="padding:12px 16px; font-size:12.5px; font-weight:600;">\${escapeHtml(r.duration)}</td>
      <td style="padding:12px 16px;">\${badgeHtml}</td>
      <td style="padding:12px 16px; font-size:12px; color:var(--muted);">\${escapeHtml(r.remarks)}</td>
      <td style="padding:12px 16px; text-align:right;">
        <button type="button" class="btn ghost btn-sm" onclick="openAttendancePunchModal('\${escapeHtml(r.staffId)}')" style="padding:4px 8px; font-size:11.5px;" title="Audit / Punch">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </td>
    \`;
    tbody.appendChild(tr);
  });
}

function openAttendancePunchModal(staffId) {
  const modal = document.getElementById('attendancePunchModal');
  if (!modal) return;
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('punchDate');
  if (dateInput) dateInput.value = todayStr;
  if (staffId) {
    const sel = document.getElementById('punchStaffSelect');
    if (sel) sel.value = staffId;
  }
  modal.classList.add('active');
}

function closeAttendancePunchModal() {
  document.getElementById('attendancePunchModal')?.classList.remove('active');
}

function saveAttendancePunch(e) {
  if (e) e.preventDefault();
  const staffSelect = document.getElementById('punchStaffSelect');
  const teacherId = staffSelect?.value;
  const teacherName = staffSelect?.options[staffSelect.selectedIndex]?.text.split('(')[0].trim() || 'Staff';
  const date = document.getElementById('punchDate')?.value || new Date().toISOString().split('T')[0];
  const status = document.getElementById('punchStatus')?.value || 'Present';
  const inTime = document.getElementById('punchInTime')?.value || '08:00';
  const outTime = document.getElementById('punchOutTime')?.value || '17:00';
  const remarks = document.getElementById('punchRemarks')?.value.trim() || 'Manual punch verified';

  let records = read(ATT_KEY);
  // Calculate hours
  let duration = '9.0 hrs';
  try {
    const inParts = inTime.split(':').map(Number);
    const outParts = outTime.split(':').map(Number);
    const diffHours = ((outParts[0] * 60 + outParts[1]) - (inParts[0] * 60 + inParts[1])) / 60;
    if (diffHours > 0) duration = diffHours.toFixed(1) + ' hrs';
  } catch (err) {}

  const newPunch = {
    id: 'punch_' + Date.now(),
    teacherId: teacherId,
    teacherName: teacherName,
    date: date,
    status: status,
    inTime: inTime,
    outTime: outTime,
    duration: duration,
    remarks: remarks,
    createdAt: Date.now()
  };

  records.unshift(newPunch);
  save(ATT_KEY, records);
  closeAttendancePunchModal();
  renderAttendanceLogSection();
  showToast(\`Punch recorded for \${teacherName}\`);
}

function markAllPresentToday() {
  const teachers = read(EMP_KEY);
  const todayStr = new Date().toISOString().split('T')[0];
  let records = read(ATT_KEY);

  teachers.forEach(t => {
    const exists = records.some(r => r.date === todayStr && (r.teacherId === t.id || r.teacherName === t.name));
    if (!exists) {
      records.push({
        id: 'bulk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        teacherId: t.id,
        teacherName: t.name,
        department: t.department || 'Faculty',
        date: todayStr,
        status: 'Present',
        inTime: '08:00',
        outTime: '17:00',
        duration: '9.0 hrs',
        remarks: 'Bulk duty desk verification'
      });
    }
  });

  save(ATT_KEY, records);
  renderAttendanceLogSection();
  showToast('All workforce members verified & marked Present today');
}

function filterAttendanceLogs() {
  renderAttendanceLogSection();
}

function resetAttendanceFilters() {
  const s = document.getElementById('attLogSearch'); if (s) s.value = '';
  const d = document.getElementById('attLogDate'); if (d) d.value = new Date().toISOString().split('T')[0];
  const dp = document.getElementById('attLogDept'); if (dp) dp.value = '';
  const st = document.getElementById('attLogStatus'); if (st) st.value = '';
  renderAttendanceLogSection();
}

function exportAttendanceCSV() {
  const records = read(ATT_KEY);
  const teachers = read(EMP_KEY);
  let csv = 'Personnel,Staff ID,Department,Date,In Time,Out Time,Hours,Status,Remarks\\n';
  
  if (records.length) {
    records.forEach(r => {
      csv += \`"\${r.teacherName || ''}","\${r.teacherId || ''}","\${r.department || ''}","\${r.date || ''}","\${r.inTime || ''}","\${r.outTime || ''}","\${r.duration || ''}","\${r.status || ''}","\${r.remarks || ''}"\\n\`;
    });
  } else {
    teachers.forEach(t => {
      csv += \`"\${t.name}","\${t.id}","\${t.department || 'Faculty'}","\${new Date().toISOString().split('T')[0]}","08:00","17:00","9.0 hrs","Present","Standard register"\\n\`;
    });
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`Attendance_Register_\${new Date().toISOString().split('T')[0]}.csv\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Attendance Register CSV Exported');
}

function printAttendanceSheet() {
  window.print();
}

/* -------------------------------------------------------------
   SECTION 14: NATIVE STAFF PAYSLIP GENERATOR WORKSTATION
------------------------------------------------------------- */
function openPayslipGeneratorPanel() {
  showSection('payslips');
}

function renderPayslipGeneratorSection() {
  const teachers = read(EMP_KEY);
  const select = document.getElementById('ps_employeeSelect');
  if (!select) return;

  if (select.options.length <= 1) {
    teachers.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id || t.name;
      opt.textContent = \`\${t.name} (\${t.department || 'Faculty'} — \${t.designation || 'Instructor'})\`;
      opt.dataset.dept = t.department || 'Faculty';
      opt.dataset.salary = t.salary || t.baseSalary || 3500;
      opt.dataset.ssnit = t.ssnit || 'C109283746';
      opt.dataset.bank = t.bank || 'GCB Bank Ltd';
      opt.dataset.name = t.name;
      select.appendChild(opt);
    });
  }

  if (select.selectedIndex <= 0 && select.options.length > 1) {
    select.selectedIndex = 1;
  }

  onPayslipEmployeeChange(select.value);
}

function onPayslipEmployeeChange(val) {
  const select = document.getElementById('ps_employeeSelect');
  if (!select) return;
  const opt = select.options[select.selectedIndex];
  if (!opt || !opt.dataset) return;

  const baseSal = parseFloat(opt.dataset.salary) || 3500;
  const baseSalInput = document.getElementById('ps_baseSalary');
  if (baseSalInput) baseSalInput.value = baseSal;

  recalculatePayslip();
}

function recalculatePayslip() {
  const select = document.getElementById('ps_employeeSelect');
  const opt = select?.options[select?.selectedIndex];
  const empName = opt?.dataset?.name || 'Selected Faculty Member';
  const empDept = opt?.dataset?.dept || 'Department of Creative Arts';
  const empId = select?.value || 'FG-STAFF-001';
  const empSsnit = opt?.dataset?.ssnit || 'C109283746';
  const empBank = opt?.dataset?.bank || 'GCB Bank Ltd';
  const month = document.getElementById('ps_monthSelect')?.value || 'September';
  const year = document.getElementById('ps_yearInput')?.value || '2026';

  const base = parseFloat(document.getElementById('ps_baseSalary')?.value) || 0;
  const resp = parseFloat(document.getElementById('ps_respAllow')?.value) || 0;
  const trans = parseFloat(document.getElementById('ps_transAllow')?.value) || 0;
  const overtime = parseFloat(document.getElementById('ps_overtimeBonus')?.value) || 0;

  const totalGross = base + resp + trans + overtime;
  const paye = Math.round(totalGross * 0.13 * 100) / 100;
  const ssnit = Math.round(base * 0.055 * 100) / 100;
  const welfare = parseFloat(document.getElementById('ps_welfareDues')?.value) || 0;
  const advance = parseFloat(document.getElementById('ps_advanceDeduct')?.value) || 0;

  const totalDeductions = Math.round((paye + ssnit + welfare + advance) * 100) / 100;
  const netPayout = Math.round((totalGross - totalDeductions) * 100) / 100;

  // Update input displays
  const grossEl = document.getElementById('ps_totalGrossDisplay');
  if (grossEl) grossEl.textContent = \`GHS \${totalGross.toFixed(2)}\`;
  const payeEl = document.getElementById('ps_payeDisplay');
  if (payeEl) payeEl.textContent = \`GHS \${paye.toFixed(2)}\`;
  const ssnitEl = document.getElementById('ps_ssnitDisplay');
  if (ssnitEl) ssnitEl.textContent = \`GHS \${ssnit.toFixed(2)}\`;
  const dedEl = document.getElementById('ps_totalDeductionsDisplay');
  if (dedEl) dedEl.textContent = \`GHS \${totalDeductions.toFixed(2)}\`;
  const netEl = document.getElementById('ps_netPayoutDisplay');
  if (netEl) netEl.textContent = \`GHS \${netPayout.toFixed(2)}\`;

  // Update official document view
  const docOrg = document.getElementById('psDoc_orgName');
  if (docOrg) docOrg.textContent = \`\${ACTIVE_ORG} HR DIRECTORATE\`;
  const docPeriod = document.getElementById('psDoc_period');
  if (docPeriod) docPeriod.textContent = \`\${month} \${year}\`;
  const docRef = document.getElementById('psDoc_ref');
  if (docRef) docRef.textContent = \`FG-PAY-\${Math.abs(empId.hashCode ? empId.hashCode() : 9421) % 9000 + 1000}\`;
  const docName = document.getElementById('psDoc_name');
  if (docName) docName.textContent = empName;
  const docId = document.getElementById('psDoc_id');
  if (docId) docId.textContent = empId;
  const docDept = document.getElementById('psDoc_dept');
  if (docDept) docDept.textContent = empDept;
  const docSsnit = document.getElementById('psDoc_ssnit');
  if (docSsnit) docSsnit.textContent = empSsnit;
  const docBank = document.getElementById('psDoc_bank');
  if (docBank) docBank.textContent = empBank;

  const docBase = document.getElementById('psDoc_base');
  if (docBase) docBase.textContent = \`GHS \${base.toFixed(2)}\`;
  const docResp = document.getElementById('psDoc_resp');
  if (docResp) docResp.textContent = \`GHS \${resp.toFixed(2)}\`;
  const docTrans = document.getElementById('psDoc_trans');
  if (docTrans) docTrans.textContent = \`GHS \${trans.toFixed(2)}\`;
  const docBonus = document.getElementById('psDoc_bonus');
  if (docBonus) docBonus.textContent = \`GHS \${overtime.toFixed(2)}\`;
  const docGross = document.getElementById('psDoc_gross');
  if (docGross) docGross.textContent = \`GHS \${totalGross.toFixed(2)}\`;

  const docPaye = document.getElementById('psDoc_paye');
  if (docPaye) docPaye.textContent = \`GHS \${paye.toFixed(2)}\`;
  const docSsnitDed = document.getElementById('psDoc_ssnitDed');
  if (docSsnitDed) docSsnitDed.textContent = \`GHS \${ssnit.toFixed(2)}\`;
  const docWelfare = document.getElementById('psDoc_welfare');
  if (docWelfare) docWelfare.textContent = \`GHS \${welfare.toFixed(2)}\`;
  const docAdvance = document.getElementById('psDoc_advance');
  if (docAdvance) docAdvance.textContent = \`GHS \${advance.toFixed(2)}\`;
  const docTotalDed = document.getElementById('psDoc_totalDed');
  if (docTotalDed) docTotalDed.textContent = \`GHS \${totalDeductions.toFixed(2)}\`;
  const docNetFinal = document.getElementById('psDoc_netFinal');
  if (docNetFinal) docNetFinal.textContent = \`GHS \${netPayout.toFixed(2)}\`;
}

function printPayslipDocument() {
  window.print();
}

function emailDigitalPayslip() {
  const select = document.getElementById('ps_employeeSelect');
  const opt = select?.options[select?.selectedIndex];
  const name = opt?.dataset?.name || 'Staff Member';
  showToast(\`Digital Payslip encrypted and dispatched to \${name}\`);
}

/* -------------------------------------------------------------
   SECTION 15: NATIVE SALARY SCHEDULES & COMPENSATION MATRIX
------------------------------------------------------------- */
function openSalarySchedulesPanel() {
  showSection('salary-schedules');
}

function renderSalarySchedulesSection() {
  const teachers = read(EMP_KEY);
  const tbody = document.getElementById('salarySchedulesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  let totalGrossBill = 0;
  let totalNetBill = 0;
  let totalTaxLiability = 0;
  let totalSSNITReserve = 0;

  teachers.forEach((t, i) => {
    const base = parseFloat(t.salary || t.baseSalary) || (3200 + (i % 5) * 500);
    const allow = 450 + (i % 3) * 150;
    const gross = base + allow;
    const tax = Math.round(gross * 0.13 * 100) / 100;
    const ssnit = Math.round(base * 0.055 * 100) / 100;
    const net = gross - tax - ssnit - 50;

    totalGrossBill += gross;
    totalNetBill += net;
    totalTaxLiability += tax;
    totalSSNITReserve += ssnit;

    // Determine band
    let band = 'Band 2 (Educator)';
    let bandColor = '#10b981';
    if (gross >= 4500) { band = 'Band 1 (Senior)'; bandColor = '#635bfc'; }
    else if (gross < 2500) { band = 'Band 4 (Support)'; bandColor = '#64748b'; }
    else if (gross < 3200) { band = 'Band 3 (Admin)'; bandColor = '#f59e0b'; }

    const status = (i % 3 === 0) ? 'Pending' : ((i % 5 === 0) ? 'Bank Queued' : 'Disbursed');
    let statusBadge = '<span class="badge-pill badge-green"><i class="fa-solid fa-circle-check"></i> Disbursed</span>';
    if (status === 'Pending') statusBadge = '<span class="badge-pill badge-orange"><i class="fa-solid fa-hourglass"></i> Pending Approval</span>';
    if (status === 'Bank Queued') statusBadge = '<span class="badge-pill badge-purple"><i class="fa-solid fa-building-columns"></i> Bank Queued</span>';

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    tr.innerHTML = \`
      <td style="padding:12px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
      <td style="padding:12px 16px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:10px; background:var(--primary-light); color:var(--primary); font-weight:800; font-size:12px; display:flex; align-items:center; justify-content:center;">
            \${escapeHtml(t.name.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <div style="font-weight:800; font-size:13.5px; color:var(--text);">\${escapeHtml(t.name)}</div>
            <div style="font-size:11.5px; color:var(--muted);">\${escapeHtml(t.designation || t.department || 'Faculty')}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px 16px;">
        <span class="badge-pill" style="border:1px solid \${bandColor}; color:\${bandColor}; background:rgba(99,91,252,0.05); font-weight:700;">
          \${escapeHtml(band)}
        </span>
      </td>
      <td style="padding:12px 16px; font-weight:700; font-size:13px;">GHS \${base.toFixed(2)}</td>
      <td style="padding:12px 16px; font-size:12.5px; color:var(--muted);">GHS \${allow.toFixed(2)}</td>
      <td style="padding:12px 16px; font-weight:700; font-size:12.5px; color:var(--accent-red);">GHS \${tax.toFixed(2)}</td>
      <td style="padding:12px 16px; font-weight:700; font-size:12.5px;">GHS \${ssnit.toFixed(2)}</td>
      <td style="padding:12px 16px; font-weight:800; font-size:13.5px; color:#059669;">GHS \${net.toFixed(2)}</td>
      <td style="padding:12px 16px;">\${statusBadge}</td>
      <td style="padding:12px 16px; text-align:right;">
        <button type="button" class="btn ghost btn-sm" onclick="jumpToPayslip('\${escapeHtml(t.id || t.name)}')" style="padding:4px 8px; font-size:11.5px;" title="View Payslip">
          <i class="fa-solid fa-receipt"></i> Slip
        </button>
      </td>
    \`;
    tbody.appendChild(tr);
  });

  const kpiGross = document.getElementById('schKpiGross');
  if (kpiGross) kpiGross.textContent = \`GHS \${totalGrossBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
  const kpiNet = document.getElementById('schKpiNet');
  if (kpiNet) kpiNet.textContent = \`GHS \${totalNetBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
  const kpiTax = document.getElementById('schKpiTax');
  if (kpiTax) kpiTax.textContent = \`GHS \${totalTaxLiability.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
  const kpiSSNIT = document.getElementById('schKpiSSNIT');
  if (kpiSSNIT) kpiSSNIT.textContent = \`GHS \${totalSSNITReserve.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
}

function jumpToPayslip(staffId) {
  showSection('payslips');
  const sel = document.getElementById('ps_employeeSelect');
  if (sel) {
    sel.value = staffId;
    onPayslipEmployeeChange(staffId);
  }
}

function runPayrollBatchDisbursement() {
  showToast('Monthly batch payroll disbursement executed across all bank clearing channels');
  renderSalarySchedulesSection();
}

function exportSalarySchedulesCSV() {
  const teachers = read(EMP_KEY);
  let csv = 'Personnel,Role,Grade Band,Gross,Allowances,PAYE Tax,SSNIT,Net Payout,Status\\n';
  teachers.forEach((t, i) => {
    const base = parseFloat(t.salary || t.baseSalary) || (3200 + (i % 5) * 500);
    const allow = 450 + (i % 3) * 150;
    const gross = base + allow;
    const tax = Math.round(gross * 0.13 * 100) / 100;
    const ssnit = Math.round(base * 0.055 * 100) / 100;
    const net = gross - tax - ssnit - 50;
    csv += \`"\${t.name}","\${t.designation || 'Instructor'}","Band","\${gross.toFixed(2)}","\${allow.toFixed(2)}","\${tax.toFixed(2)}","\${ssnit.toFixed(2)}","\${net.toFixed(2)}","Disbursed"\\n\`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`Salary_Schedules_Ledger_\${new Date().toISOString().split('T')[0]}.csv\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Salary Schedules CSV Exported');
}

function schedulePayDay() {
  showToast('Pay Day automated disbursement schedule locked for 25th of month');
}

/* -------------------------------------------------------------
   SECTION 16: NATIVE EXECUTIVE WORKFORCE REPORTS CENTER
------------------------------------------------------------- */
let currentReportCategory = 'master';

function openReportsPanel() {
  showSection('reports');
}

function renderReportsSection() {
  const teachers = read(EMP_KEY);
  const total = teachers.length || 1;
  const teachersCount = teachers.filter(t => (t.role === 'teacher' || !t.role || t.department?.includes('Arts') || t.department?.includes('Design'))).length;
  const ratio = Math.round((teachersCount / total) * 100);

  const kpiHead = document.getElementById('repKpiHeadcount');
  if (kpiHead) kpiHead.textContent = total;
  const kpiRatio = document.getElementById('repKpiTeacherRatio');
  if (kpiRatio) kpiRatio.textContent = \`\${ratio}%\`;

  switchReportCategory(currentReportCategory);
}

function switchReportCategory(catKey) {
  currentReportCategory = catKey;
  document.querySelectorAll('#reportsCategoryTabs .sub-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.report === catKey);
  });

  const table = document.getElementById('dynamicReportTable');
  const heading = document.getElementById('reportTitleHeading');
  const subHeading = document.getElementById('reportSubHeading');
  const countBadge = document.getElementById('reportItemCountBadge');
  if (!table) return;

  const teachers = read(EMP_KEY);
  const attendance = read(ATT_KEY);
  const assessments = read(ASSESS_KEY);

  if (catKey === 'master') {
    heading.textContent = 'Comprehensive Faculty Master Roll & Profile Ledger';
    subHeading.textContent = 'Complete institutional registry of active instructors, credentials, and appointments.';
    countBadge.textContent = \`\${teachers.length} Active Records\`;

    table.innerHTML = \`
      <thead>
        <tr>
          <th style="padding:12px 16px;">#</th>
          <th>Personnel</th>
          <th>Department</th>
          <th>Designation</th>
          <th>Staff ID</th>
          <th>Official Email</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        \${teachers.map((t, i) => \`
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:10px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
            <td style="padding:10px 16px; font-weight:800; color:var(--text);">\${escapeHtml(t.name)}</td>
            <td style="padding:10px 16px;">\${escapeHtml(t.department || 'General')}</td>
            <td style="padding:10px 16px; font-size:12.5px;">\${escapeHtml(t.designation || 'Faculty')}</td>
            <td style="padding:10px 16px; font-weight:700; color:var(--primary);">\${escapeHtml(t.id || 'STAFF')}</td>
            <td style="padding:10px 16px; font-size:12px; color:var(--muted);">\${escapeHtml(t.email || '—')}</td>
            <td style="padding:10px 16px; font-size:12px;">\${escapeHtml(t.phone || '—')}</td>
            <td style="padding:10px 16px;"><span class="badge-pill badge-green"><i class="fa-solid fa-check"></i> Active</span></td>
          </tr>
        \`).join('')}
      </tbody>
    \`;
  } else if (catKey === 'departments') {
    heading.textContent = 'Departmental Density & Staff Allocation Audit';
    subHeading.textContent = 'Staffing distribution, faculty-to-student capacity ratios, and department chairs.';
    
    const depts = [...new Set(teachers.map(t => t.department).filter(Boolean))];
    countBadge.textContent = \`\${depts.length} Functional Divisions\`;

    table.innerHTML = \`
      <thead>
        <tr>
          <th style="padding:12px 16px;">#</th>
          <th>Department / Faculty Division</th>
          <th>Staff Headcount</th>
          <th>Share of Workforce</th>
          <th>Status Density</th>
        </tr>
      </thead>
      <tbody>
        \${depts.map((d, i) => {
          const count = teachers.filter(t => t.department === d).length;
          const share = Math.round((count / (teachers.length || 1)) * 100);
          return \`
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
              <td style="padding:10px 16px; font-weight:800; color:var(--text);"><i class="fa-solid fa-sitemap" style="color:var(--primary); margin-right:8px;"></i>\${escapeHtml(d)}</td>
              <td style="padding:10px 16px; font-weight:800; font-size:14px;">\${count} Faculty Members</td>
              <td style="padding:10px 16px; font-weight:700;">\${share}%</td>
              <td style="padding:10px 16px;"><span class="badge-pill badge-green"><i class="fa-solid fa-check"></i> Fully Staffed</span></td>
            </tr>
          \`;
        }).join('')}
      </tbody>
    \`;
  } else if (catKey === 'taxes') {
    heading.textContent = 'Statutory Tax & SSNIT Remittance Filing Report';
    subHeading.textContent = 'GRA Income Tax (PAYE) withholdings and SSNIT pension trust contribution schedule.';
    countBadge.textContent = \`\${teachers.length} Remittance Lines\`;

    table.innerHTML = \`
      <thead>
        <tr>
          <th style="padding:12px 16px;">#</th>
          <th>Staff Personnel</th>
          <th>SSNIT No.</th>
          <th>Base Gross</th>
          <th>PAYE Tax (13%)</th>
          <th>SSNIT Tier 1 &amp; 2 (5.5%)</th>
          <th>Net Payout</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        \${teachers.map((t, i) => {
          const base = parseFloat(t.salary || t.baseSalary) || 3500;
          const tax = Math.round(base * 0.13 * 100) / 100;
          const ssnit = Math.round(base * 0.055 * 100) / 100;
          const net = base - tax - ssnit;
          return \`
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
              <td style="padding:10px 16px; font-weight:800; color:var(--text);">\${escapeHtml(t.name)}</td>
              <td style="padding:10px 16px; font-size:12.5px; font-family:monospace;">\${escapeHtml(t.ssnit || 'C109283746')}</td>
              <td style="padding:10px 16px; font-weight:700;">GHS \${base.toFixed(2)}</td>
              <td style="padding:10px 16px; font-weight:700; color:var(--accent-red);">GHS \${tax.toFixed(2)}</td>
              <td style="padding:10px 16px; font-weight:700;">GHS \${ssnit.toFixed(2)}</td>
              <td style="padding:10px 16px; font-weight:800; color:#059669;">GHS \${net.toFixed(2)}</td>
              <td style="padding:10px 16px;"><span class="badge-pill badge-green">Filed</span></td>
            </tr>
          \`;
        }).join('')}
      </tbody>
    \`;
  } else if (catKey === 'attendance') {
    heading.textContent = 'Monthly Attendance & Punctuality Compliance Audit';
    subHeading.textContent = 'Duty punctuality metrics, arrival thresholds, and approved leave audits.';
    countBadge.textContent = \`\${teachers.length} Staff Audited\`;

    table.innerHTML = \`
      <thead>
        <tr>
          <th style="padding:12px 16px;">#</th>
          <th>Staff Personnel</th>
          <th>Department</th>
          <th>Scheduled Shift</th>
          <th>Duty In / Out</th>
          <th>Punctuality Rating</th>
          <th>Audit Clearance</th>
        </tr>
      </thead>
      <tbody>
        \${teachers.map((t, i) => \`
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:10px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
            <td style="padding:10px 16px; font-weight:800; color:var(--text);">\${escapeHtml(t.name)}</td>
            <td style="padding:10px 16px;">\${escapeHtml(t.department || 'Faculty')}</td>
            <td style="padding:10px 16px; font-size:12px; color:var(--muted);">08:00 AM — 05:00 PM</td>
            <td style="padding:10px 16px; font-weight:700;">08:00 / 17:00</td>
            <td style="padding:10px 16px;"><span class="badge-pill badge-green"><i class="fa-solid fa-check"></i> 98% On-Time</span></td>
            <td style="padding:10px 16px;"><span class="badge-pill badge-purple"><i class="fa-solid fa-shield"></i> Verified</span></td>
          </tr>
        \`).join('')}
      </tbody>
    \`;
  } else if (catKey === 'assessments') {
    heading.textContent = 'Academic Grading & Assessment QA Summary';
    subHeading.textContent = 'Institutional marks QA, score approvals, and academic transcript certification.';
    const assessList = read(ASSESS_KEY);
    countBadge.textContent = \`\${assessList.length} Graded Records\`;

    table.innerHTML = \`
      <thead>
        <tr>
          <th style="padding:12px 16px;">#</th>
          <th>Student Candidate</th>
          <th>Roll ID</th>
          <th>Subject / Course</th>
          <th>CA (40%)</th>
          <th>Exam (60%)</th>
          <th>Total (100%)</th>
          <th>Grade</th>
          <th>HR Endorsement</th>
        </tr>
      </thead>
      <tbody>
        \${assessList.length === 0 ? '<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--muted);">No assessment records yet submitted by teaching faculty.</td></tr>' : assessList.map((a, i) => \`
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:10px 16px; font-weight:700; color:var(--muted);">\${i + 1}</td>
            <td style="padding:10px 16px; font-weight:800; color:var(--text);">\${escapeHtml(a.studentName)}</td>
            <td style="padding:10px 16px; font-family:monospace; font-size:12px;">\${escapeHtml(a.studentRoll || '—')}</td>
            <td style="padding:10px 16px;">\${escapeHtml(a.subject || '—')}</td>
            <td style="padding:10px 16px; font-weight:700;">\${a.caScore}</td>
            <td style="padding:10px 16px; font-weight:700;">\${a.examScore}</td>
            <td style="padding:10px 16px; font-weight:800; color:var(--primary);">\${a.totalScore}%</td>
            <td style="padding:10px 16px;"><span class="badge-pill badge-green" style="font-weight:800;">\${escapeHtml(a.grade)}</span></td>
            <td style="padding:10px 16px;">
              \${a.status === 'Approved & Certified' 
                ? '<span class="badge-pill badge-green"><i class="fa-solid fa-stamp"></i> Certified</span>' 
                : '<span class="badge-pill badge-orange"><i class="fa-solid fa-clock"></i> Pending Certification</span>'
              }
            </td>
          </tr>
        \`).join('')}
      </tbody>
    \`;
  }
}

function exportReportCSV() {
  const table = document.getElementById('dynamicReportTable');
  if (!table) return;

  let csv = '';
  const rows = table.querySelectorAll('tr');
  rows.forEach(r => {
    const cols = r.querySelectorAll('th, td');
    const rowData = [];
    cols.forEach(c => {
      rowData.push('"' + c.textContent.trim().replace(/"/g, '""') + '"');
    });
    if (rowData.length) csv += rowData.join(',') + '\\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`Report_\${currentReportCategory}_\${new Date().toISOString().split('T')[0]}.csv\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Report CSV Downloaded');
}

function printReportView() {
  window.print();
}
`;

content = content.slice(0, startIdx) + completeNewLogic + content.slice(endIdx);
console.log('PASS: Inserted complete logic for sections 8, 9, 13, 14, 15, 16');

// Update bootstrapApp to register all new window functions
const targetBootstrap = `    // Student Assessment QA & Certification Attachments
    window.renderStudentAssessments = renderStudentAssessments;
    window.openAssessmentDetailModal = openAssessmentDetailModal;
    window.closeAssessmentDetailModal = closeAssessmentDetailModal;
    window.warnLockedScore = warnLockedScore;
    window.approveStudentAssessment = approveStudentAssessment;
    window.submitAssessmentApproval = submitAssessmentApproval;`;

const replaceBootstrap = `    // Student Assessment QA & Certification Attachments
    window.renderStudentAssessments = renderStudentAssessments;
    window.openAssessmentDetailModal = openAssessmentDetailModal;
    window.closeAssessmentDetailModal = closeAssessmentDetailModal;
    window.warnLockedScore = warnLockedScore;
    window.approveStudentAssessment = approveStudentAssessment;
    window.submitAssessmentApproval = submitAssessmentApproval;

    // Cross-Portal Broadcasts Attachments
    window.renderAnnouncements = renderAnnouncements;
    window.handlePublishBroadcast = handlePublishBroadcast;
    window.deleteAnnouncement = deleteAnnouncement;
    window.togglePinAnnouncement = togglePinAnnouncement;
    window.filterBroadcasts = filterBroadcasts;

    // Enterprise Settings Attachments
    window.switchSettingsTab = switchSettingsTab;
    window.renderSettingsSection = renderSettingsSection;
    window.saveAllPortalSettings = saveAllPortalSettings;
    window.handleLogoUpload = handleLogoUpload;
    window.previewLogoFromUrl = previewLogoFromUrl;
    window.selectThemeSwatch = selectThemeSwatch;
    window.setDashboardThemeMode = setDashboardThemeMode;
    window.setDashboardDensity = setDashboardDensity;
    window.exportFullDatabaseBackup = exportFullDatabaseBackup;
    window.restoreFullDatabaseBackup = restoreFullDatabaseBackup;
    window.resetLocalCacheConfirm = resetLocalCacheConfirm;

    // Native Attendance Desk Attachments
    window.openAttendanceLogPanel = openAttendanceLogPanel;
    window.renderAttendanceLogSection = renderAttendanceLogSection;
    window.openAttendancePunchModal = openAttendancePunchModal;
    window.closeAttendancePunchModal = closeAttendancePunchModal;
    window.saveAttendancePunch = saveAttendancePunch;
    window.markAllPresentToday = markAllPresentToday;
    window.filterAttendanceLogs = filterAttendanceLogs;
    window.resetAttendanceFilters = resetAttendanceFilters;
    window.exportAttendanceCSV = exportAttendanceCSV;
    window.printAttendanceSheet = printAttendanceSheet;

    // Staff Payslip Generator Attachments
    window.openPayslipGeneratorPanel = openPayslipGeneratorPanel;
    window.renderPayslipGeneratorSection = renderPayslipGeneratorSection;
    window.onPayslipEmployeeChange = onPayslipEmployeeChange;
    window.recalculatePayslip = recalculatePayslip;
    window.printPayslipDocument = printPayslipDocument;
    window.emailDigitalPayslip = emailDigitalPayslip;
    window.jumpToPayslip = jumpToPayslip;

    // Salary Schedules Attachments
    window.openSalarySchedulesPanel = openSalarySchedulesPanel;
    window.renderSalarySchedulesSection = renderSalarySchedulesSection;
    window.runPayrollBatchDisbursement = runPayrollBatchDisbursement;
    window.exportSalarySchedulesCSV = exportSalarySchedulesCSV;
    window.schedulePayDay = schedulePayDay;

    // Workforce Reports Center Attachments
    window.openReportsPanel = openReportsPanel;
    window.renderReportsSection = renderReportsSection;
    window.switchReportCategory = switchReportCategory;
    window.exportReportCSV = exportReportCSV;
    window.printReportView = printReportView;`;

if (!content.includes(targetBootstrap)) {
  console.error('FAIL: targetBootstrap not found');
  process.exit(1);
}
content = content.replace(targetBootstrap, replaceBootstrap);
console.log('PASS: Updated bootstrapApp with all window function exports');

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(hrFile, content, 'utf8');
console.log('Successfully written complete logic to hr-dashboard.html');
