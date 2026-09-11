/* -------------------------------------------------------------
   CORE STORAGE & UTILITY ENGINE
------------------------------------------------------------- */
function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
function read(k) { return safeParse(localStorage.getItem(k)) || []; }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function escapeHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Global chart instances (declared early to prevent TDZ ReferenceErrors)
let overviewChartInstance = null;
let deptChartInstance = null;
let attChartInstance = null;

function showToast(msg, type = 'success', options = {}) {
  if (window.Toaster && typeof window.Toaster.show === 'function') {
    if (type === 'troubleshoot' || options.troubleshoot) {
      window.Toaster.troubleshoot(Object.assign({
        title: options.title || 'HR Operational Notice',
        message: msg,
        troubleshoot: options.troubleshoot || 'Please review inputs and system connectivity.',
        steps: options.steps || []
      }, options));
      return;
    }
    const titleMap = {
      success: 'Action Confirmed',
      info: 'HR Management',
      warning: 'Attention',
      error: 'Operational Error',
      troubleshoot: 'Troubleshoot / Error'
    };
    window.Toaster.show(Object.assign({
      type: type,
      title: options.title || titleMap[type] || 'HR Portal',
      message: msg
    }, options));
  } else {
    const t = document.getElementById('toast');
    if (t) {
      const el = document.getElementById('toastText');
      if (el) el.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2800);
    }
  }
}

function showErrorToast(title, msg, troubleshootHint, steps, error) {
  if (window.Toaster && typeof window.Toaster.troubleshoot === 'function') {
    window.Toaster.troubleshoot({
      title: title || 'System Operation Error',
      message: msg || '',
      troubleshoot: troubleshootHint || 'An unexpected operation error occurred. Local data remains safe.',
      steps: steps || [
        'Check network connectivity.',
        'Verify required input fields are populated.',
        'Review Cloud and Supabase configurations in Settings.'
      ],
      error: error || '',
      copyable: true
    });
  } else {
    showToast((title ? title + ': ' : '') + msg, 'error');
  }
}
window.showErrorToast = showErrorToast;

// Route Guard & Session Init
const user = window.AuthSession ? window.AuthSession.requireAuth('hr-login.html', true) : null;
const ACTIVE_ORG = (user && user.org) || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';

// Canonical Storage Keys
const EMP_KEY = `${ACTIVE_ORG}_teachers`;
const DEPT_KEY = `${ACTIVE_ORG}_departments`;
const MSG_KEY = `${ACTIVE_ORG}_messages`;
const ATT_KEY = `${ACTIVE_ORG}_attendance_records`;
const ANNOUNCE_KEY = `${ACTIVE_ORG}_announcements`;
const STUD_KEY = `${ACTIVE_ORG}_students`;
const PERF_KEY = `${ACTIVE_ORG}_performance_reviews`;
const CALENDAR_KEY = `${ACTIVE_ORG}_academic_calendar`;
const ASSESS_KEY = `${ACTIVE_ORG}_student_assessments`;

/* -------------------------------------------------------------
   DEFAULT SEED DATA
------------------------------------------------------------- */
function initDefaultData() {
  let emps = read(EMP_KEY);
  if (!emps || emps.length === 0) {
    emps = [
      { id: 'e1', name: 'James Ntiamoah', fullName: 'James Ntiamoah', role: 'Creative Director', position: 'Creative Director', dept: 'Executive & Design', department: 'Executive & Design', email: 'james@flawless.org', salary: 8500, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
      { id: 'e2', name: 'Ama Serwaa', fullName: 'Ama Serwaa', role: 'HR Manager', position: 'HR Manager', dept: 'Operations', department: 'Operations', email: 'ama@flawless.org', salary: 6200, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
      { id: 'e3', name: 'Kwame Boateng', fullName: 'Kwame Boateng', role: 'Lead Instructor', position: 'Lead Instructor', dept: 'Academic Staff', department: 'Academic Staff', email: 'kwame@flawless.org', salary: 5400, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
      { id: 'e4', name: 'Abena Mansa', fullName: 'Abena Mansa', role: 'Chief Accountant', position: 'Chief Accountant', dept: 'Finance', department: 'Finance', email: 'abena@flawless.org', salary: 7100, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' },
      { id: 'e5', name: 'Kofi Owusu', fullName: 'Kofi Owusu', role: 'Senior Designer', position: 'Senior Designer', dept: 'Digital Media', department: 'Digital Media', email: 'kofi@flawless.org', salary: 5000, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80' },
      { id: 'e6', name: 'Esi Badu', fullName: 'Esi Badu', role: 'Science Educator', position: 'Science Educator', dept: 'Academic Staff', department: 'Academic Staff', email: 'esi@flawless.org', salary: 4800, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80' }
    ];
    save(EMP_KEY, emps);
  } else {
    // Normalize properties for backwards compatibility
    emps.forEach((e, idx) => {
      if (!e.id) e.id = 'e' + (idx + 1);
      if (!e.name && e.fullName) e.name = e.fullName;
      if (!e.fullName && e.name) e.fullName = e.name;
      if (!e.role && e.position) e.role = e.position;
      if (!e.dept && e.department) e.dept = e.department;
      if (!e.photo) e.photo = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
    });
    save(EMP_KEY, emps);
  }

  // Initial Announcements
  let ann = read(ANNOUNCE_KEY);
  if (!ann || ann.length === 0) {
    ann = [
      { id: 'a1', title: 'Q3 Enterprise Performance Reviews', text: 'All department managers must finalize Q3 appraisals before the upcoming payroll deadline.', date: 'Today, 09:30 AM', author: 'HR Director' },
      { id: 'a2', title: 'Campus IT Infrastructure Upgrade', text: 'Cloud workstations and classroom media servers will undergo scheduled maintenance this Friday at 10:00 PM.', date: 'Yesterday', author: 'IT Support' }
    ];
    save(ANNOUNCE_KEY, ann);
  }
}
initDefaultData();

/* -------------------------------------------------------------
   SIDEBAR & PROFILE BINDINGS
------------------------------------------------------------- */
const orgDisplay = (typeof ACTIVE_ORG === 'string' ? ACTIVE_ORG : 'FLAWLESS GRAPHICS').toUpperCase();
document.getElementById('sideOrg').textContent = orgDisplay;
if (user && user.name) {
  document.getElementById('sideName').textContent = user.name;
  document.getElementById('sideEmail').textContent = user.email || 'hr@flawless.org';
}

// Org Switcher
const orgSwitcher = document.getElementById('orgSwitcher');
const orgList = [ACTIVE_ORG, 'FLAWLESS GRAPHICS', 'CREATIVE CAMPUS', 'ENTERPRISE TECH'];
const uniqueOrgs = [...new Set(orgList)];
uniqueOrgs.forEach(o => {
  const opt = document.createElement('option');
  opt.value = o;
  opt.textContent = o;
  if (o === ACTIVE_ORG) opt.selected = true;
  orgSwitcher.appendChild(opt);
});
orgSwitcher.addEventListener('change', () => {
  if (window.AuthSession) {
    const curr = window.AuthSession.getUser() || {};
    curr.org = orgSwitcher.value;
    window.AuthSession.setUser(curr);
  }
  localStorage.setItem('active_org', orgSwitcher.value);
  location.reload();
});

// Sidebar Collapse
// Sidebar Auto-Collapse & Responsive Controls
const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
let isCollapsed = localStorage.getItem('hr_sidebar_collapsed') === 'true';

function setSidebarCollapsed(collapsed) {
  isCollapsed = collapsed;
  sidebar.classList.toggle('collapsed', isCollapsed);
  if (collapseBtn) {
    collapseBtn.innerHTML = isCollapsed ? '<i class="fa-solid fa-angle-right"></i>' : '<i class="fa-solid fa-angle-left"></i>';
  }
  localStorage.setItem('hr_sidebar_collapsed', isCollapsed);
}

if (isCollapsed) setSidebarCollapsed(true);

collapseBtn?.addEventListener('click', () => {
  setSidebarCollapsed(!isCollapsed);
});

function handleAutoCollapse() {
  if (window.innerWidth < 1024) {
    if (!isCollapsed) setSidebarCollapsed(true);
  }
}
window.addEventListener('resize', handleAutoCollapse);
handleAutoCollapse();

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  if (window.AuthSession && typeof window.AuthSession.logout === 'function') {
    window.AuthSession.logout('hr-login.html');
  } else {
    localStorage.removeItem('activeHR');
    window.location.href = 'hr-login.html';
  }
});

// Global Quick Search (Ctrl+K)
const quickSearchEl = document.getElementById('globalQuickSearch');
if (quickSearchEl) {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      quickSearchEl.focus();
    }
  });

  quickSearchEl.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;

    if (q.includes('class') || q.includes('teach') || q.includes('assign') || q.includes('room')) {
      showSection('classes');
      const ci = document.getElementById('searchClassInput');
      if (ci) { ci.value = q; renderClassesSection(); }
    } else if (q.includes('student') || q.includes('enroll') || q.includes('grade')) {
      showSection('students');
    } else if (q.includes('emp') || q.includes('staff')) {
      showSection('teachers');
    } else if (q.includes('pay') || q.includes('salary')) {
      showSection('payroll');
    } else if (q.includes('chat') || q.includes('msg')) {
      if (window.SchoolMessenger) window.SchoolMessenger.open();
    }
  });
}

/* -------------------------------------------------------------
   NAVIGATION & SECTION SWAPPING (All pages remain directly inside)
------------------------------------------------------------- */
const sections = {
  dashboard: document.getElementById('dashboardSection'),
  classes: document.getElementById('classesSection'),
  teachers: document.getElementById('teachersSection'),
  users: document.getElementById('usersSection'),
  appraisals: document.getElementById('appraisalsSectionPanel'),
  students: document.getElementById('studentsSection'),
  messages: document.getElementById('messagesSection'),
  attendance: document.getElementById('attendanceSectionPanel'),
  payroll: document.getElementById('payrollSection'),
  analytics: document.getElementById('analyticsSection'),
  announcements: document.getElementById('announcementsSection'),
  settings: document.getElementById('settingsSectionPanel'),
  embedded: document.getElementById('embeddedFrameSection'),
  calendar: document.getElementById('academicCalendarSection'),
  assessments: document.getElementById('studentAssessmentsSection')
};

let lastActiveSection = 'dashboard';

function openAppraisalsPanel() {
  showSection('appraisals');
}

function openAttendanceLogPanel() {
  openEmbeddedPage('attendance-summary.html?embedded=true', 'Attendance Logs & Summary', 'fa-calendar-check');
}

function openReportsPanel() {
  openEmbeddedPage('teacher-reports.html?embedded=true', 'Teacher Reports & Workforce Analytics', 'fa-file-lines');
}

function openPayslipGeneratorPanel() {
  openEmbeddedPage('payslip.html?embedded=true', 'Staff Payslip Generator', 'fa-receipt');
}

function openSalarySchedulesPanel() {
  openEmbeddedPage('payroll.html?embedded=true', 'Salary Schedules & Review', 'fa-money-bill-wave');
}

function openEmbeddedPage(url, title = 'Workspace View', iconClass = 'fa-window-maximize') {
  if (!url) return;

  let finalUrl = url;
  if (!finalUrl.includes('embedded=true') && !finalUrl.includes('welcome.html') && !finalUrl.startsWith('http')) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'embedded=true';
  }

  const currentActiveBtn = document.querySelector('#nav button.active, #nav .nav-sub-item.active');
  if (currentActiveBtn && currentActiveBtn.dataset.section && currentActiveBtn.dataset.section !== 'embedded') {
    lastActiveSection = currentActiveBtn.dataset.section;
  }

  // Hide all sections
  Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });

  const frameSection = document.getElementById('embeddedFrameSection');
  const frame = document.getElementById('embeddedPageFrame');
  const titleEl = document.getElementById('embeddedFrameTitle');
  const iconEl = document.getElementById('embeddedFrameIcon');
  const pageTitleEl = document.getElementById('pageTitle');

  if (frameSection && frame) {
    frameSection.style.display = 'flex';
    frame.src = finalUrl;
    if (titleEl) titleEl.textContent = title;
    if (pageTitleEl) pageTitleEl.textContent = title;
    if (iconEl) iconEl.className = `fa-solid ${iconClass}`;

    // Deselect sidebar nav active highlights
    document.querySelectorAll('#nav .nav-sub-item, #nav button, #nav a').forEach(b => b.classList.remove('active'));

    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }
}

function openEmbeddedPayslip(employeeName) {
  const safeName = employeeName || 'Staff';
  openEmbeddedPage(`payslip.html?name=${encodeURIComponent(safeName)}`, `Payslip — ${safeName}`, 'fa-receipt');
}

function closeEmbeddedFrame() {
  const frameSection = document.getElementById('embeddedFrameSection');
  const frame = document.getElementById('embeddedPageFrame');
  if (frameSection) frameSection.style.display = 'none';
  if (frame) frame.src = 'about:blank';
  showSection(lastActiveSection || 'dashboard');
}

function refreshEmbeddedFrame() {
  const frame = document.getElementById('embeddedPageFrame');
  if (frame && frame.src && frame.src !== 'about:blank') {
    try {
      frame.contentWindow.location.reload();
    } catch(e) {
      frame.src = frame.src;
    }
  }
}

function showSection(name) {
  if (name !== 'embedded') {
    const frameSection = document.getElementById('embeddedFrameSection');
    const frame = document.getElementById('embeddedPageFrame');
    if (frameSection) frameSection.style.display = 'none';
    if (frame) frame.src = 'about:blank';
    lastActiveSection = name;
  }

  Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });
  if (sections[name]) {
    sections[name].style.display = (name === 'embedded') ? 'flex' : 'block';
  }

  document.querySelectorAll('#nav .nav-sub-item, #nav button, #nav a').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`#nav [data-section="${name}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    const spanText = activeBtn.querySelector('.nav-label')?.textContent || activeBtn.querySelector('span')?.textContent;
    document.getElementById('pageTitle').textContent = spanText || 'HR Portal';
    const parentGroup = activeBtn.closest('.nav-group');
    if (parentGroup) parentGroup.classList.add('open');
  }

  // Section-specific activation triggers
  if (name === 'appraisals') {
    renderAppraisalsSection();
    return;
  }
  if (name === 'attendance-log' || name === 'attendance-summary') {
    openAttendanceLogPanel();
    return;
  }
  if (name === 'reports' || name === 'teacher-reports') {
    openReportsPanel();
    return;
  }
  if (name === 'payslips' || name === 'payslip-generator') {
    openPayslipGeneratorPanel();
    return;
  }
  if (name === 'salary-schedules') {
    openSalarySchedulesPanel();
    return;
  }
  if (name === 'calendar') {
    renderAcademicCalendar();
    return;
  }
  if (name === 'assessments') {
    renderStudentAssessments();
    return;
  }
  if (name === 'dashboard') { renderDashboard(); renderCharts(); }
  if (name === 'classes') renderClassesSection();
  if (name === 'teachers') renderTeachers();
  if (name === 'users') renderUsers();
  if (name === 'students') loadHRStudents();
  if (name === 'messages') renderMsgUsers();
  if (name === 'attendance') renderAttendance();
  if (name === 'payroll') initPayrollSection();
  if (name === 'analytics') renderAnalytics();
  if (name === 'announcements') renderAnnouncements();
}

window.toggleNavGroup = function(headerBtn) {
  const group = headerBtn.closest('.nav-group');
  if (group) {
    group.classList.toggle('open');
  }
};

document.querySelectorAll('#nav [data-section]').forEach(b => {
  b.addEventListener('click', () => showSection(b.dataset.section));
});

// Intercept all link clicks inside hr-dashboard.html to ensure NO new tab or page reload occurs
document.addEventListener('click', function(e) {
  const anchor = e.target.closest('a');
  if (!anchor) return;

  if (anchor.target === '_blank') {
    anchor.removeAttribute('target');
  }

  const href = anchor.getAttribute('href');
  if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return;
  }

  // Do not open Hub directly inside embedded frame; navigate normally
  if (href.includes('welcome.html')) {
    return;
  }

  e.preventDefault();
  const linkTitle = anchor.getAttribute('title') || anchor.textContent.trim() || 'Internal Workspace View';
  openEmbeddedPage(href, linkTitle);
}, true);

// Failsafe: intercept window.open to keep everything inside embedded frame
window.open = function(url, target, features) {
  if (url && typeof url === 'string') {
    openEmbeddedPage(url, 'Internal Workspace View');
    return window;
  }
  return null;
};

/* -------------------------------------------------------------
   CLASSROOM & TEACHER ASSIGNMENT ENGINE
------------------------------------------------------------- */
const CLASSES_STORAGE_KEY = `${ACTIVE_ORG}_classes`;

function getClassesList() {
  let classes = read(CLASSES_STORAGE_KEY);
  if (!classes || classes.length === 0) {
    classes = [
      { id: 'cls_1', code: 'CLS-10A', name: 'Grade 10 - Graphic Arts & Visual Identity', subject: 'Graphic Design', grade: 'Grade 10', teacherName: 'Sarah Jenkins', teacherEmail: 's.jenkins@flawless.org', room: 'Media Studio 201', schedule: 'Mon, Wed, Fri • 08:30 AM', capacity: 30, enrolled: 28, status: 'Assigned' },
      { id: 'cls_2', code: 'CLS-11B', name: 'Grade 11 - Web Systems & Client Architecture', subject: 'Frontend Dev', grade: 'Grade 11', teacherName: 'Kwame Boateng', teacherEmail: 'k.boateng@flawless.org', room: 'Computer Lab 3', schedule: 'Tue, Thu • 10:00 AM', capacity: 25, enrolled: 24, status: 'Assigned' },
      { id: 'cls_3', code: 'CLS-12A', name: 'Grade 12 - Digital Animation & 3D Modeling', subject: '3D & VFX', grade: 'Grade 12', teacherName: 'Kofi Owusu', teacherEmail: 'k.owusu@flawless.org', room: 'Studio 105', schedule: 'Mon, Thu • 01:00 PM', capacity: 20, enrolled: 18, status: 'Assigned' },
      { id: 'cls_4', code: 'CLS-09C', name: 'Grade 9 - Fundamental Design Principles', subject: 'Art Fundamentals', grade: 'Grade 9', teacherName: 'James Ntiamoah', teacherEmail: 'admin@flawlessgraphics.com', room: 'Room 102', schedule: 'Wed, Fri • 11:15 AM', capacity: 32, enrolled: 30, status: 'Assigned' },
      { id: 'cls_5', code: 'CLS-10B', name: 'Grade 10 - UI/UX Interactive Prototyping', subject: 'User Experience', grade: 'Grade 10', teacherName: '', teacherEmail: '', room: 'Design Lab 4', schedule: 'Tue, Fri • 02:00 PM', capacity: 25, enrolled: 22, status: 'Unassigned' }
    ];
    save(CLASSES_STORAGE_KEY, classes);
  }
  return classes;
}

function saveClassesList(list) {
  save(CLASSES_STORAGE_KEY, list);
}

function getAvailableTeachers() {
  const registeredTeachers = read('teachers');
  const defaults = [
    { name: 'Sarah Jenkins', email: 's.jenkins@flawless.org', role: 'Teacher • Graphic Arts' },
    { name: 'James Ntiamoah', email: 'admin@flawlessgraphics.com', role: 'HR Lead & Instructor' },
    { name: 'Kwame Boateng', email: 'k.boateng@flawless.org', role: 'Teacher • Web Systems' },
    { name: 'Kofi Owusu', email: 'k.owusu@flawless.org', role: 'Teacher • 3D Animation' }
  ];

  const map = new Map();
  defaults.forEach(t => map.set(t.email.toLowerCase(), t));
  if (Array.isArray(registeredTeachers)) {
    registeredTeachers.forEach(t => {
      if (t && t.email) {
        map.set(t.email.toLowerCase(), {
          name: t.name || t.fullName || t.email.split('@')[0],
          email: t.email,
          role: t.role ? `Teacher • ${t.role}` : 'Certified Educator'
        });
      }
    });
  }
  return Array.from(map.values());
}

function renderClassesSection() {
  const classes = getClassesList();
  const search = (document.getElementById('searchClassInput')?.value || '').toLowerCase();
  const gradeFilter = document.getElementById('filterClassGrade')?.value || '';
  const teacherFilter = document.getElementById('filterClassTeacher')?.value || '';

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + Number(c.enrolled || 0), 0);
  const assignedCount = classes.filter(c => c.teacherName && c.teacherName.trim() !== '').length;
  const unassignedCount = totalClasses - assignedCount;

  const summaryEl = document.getElementById('classMetricsSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="class-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="small" style="font-weight:700;">TOTAL CLASSROOMS</span>
          <i class="fa-solid fa-chalkboard" style="color:var(--primary);"></i>
        </div>
        <div style="font-size:26px;font-weight:800;">${totalClasses}</div>
        <div class="small" style="color:var(--muted);">Active curriculum modules</div>
      </div>
      <div class="class-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="small" style="font-weight:700;">STUDENTS ENROLLED</span>
          <i class="fa-solid fa-user-graduate" style="color:#10b981;"></i>
        </div>
        <div style="font-size:26px;font-weight:800;color:#10b981;">${totalStudents}</div>
        <div class="small" style="color:var(--muted);">Total student seats occupied</div>
      </div>
      <div class="class-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="small" style="font-weight:700;">FACULTY ALLOCATED</span>
          <i class="fa-solid fa-user-check" style="color:var(--primary);"></i>
        </div>
        <div style="font-size:26px;font-weight:800;">${assignedCount} / ${totalClasses}</div>
        <div class="small" style="color:var(--muted);">${Math.round((assignedCount/Math.max(1,totalClasses))*100)}% coverage rate</div>
      </div>
      <div class="class-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="small" style="font-weight:700;">PENDING ASSIGNMENT</span>
          <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i>
        </div>
        <div style="font-size:26px;font-weight:800;color:${unassignedCount > 0 ? '#f59e0b' : '#10b981'};">${unassignedCount}</div>
        <div class="small" style="color:var(--muted);">${unassignedCount > 0 ? 'Requires teacher allocation' : 'All classes staffed'}</div>
      </div>
    `;
  }

  const gradeSelect = document.getElementById('filterClassGrade');
  if (gradeSelect && gradeSelect.options.length <= 1) {
    const grades = [...new Set(classes.map(c => c.grade).filter(Boolean))];
    grades.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      gradeSelect.appendChild(opt);
    });
  }

  const teacherSelect = document.getElementById('filterClassTeacher');
  if (teacherSelect && teacherSelect.options.length <= 1) {
    const teachers = [...new Set(classes.map(c => c.teacherName).filter(Boolean))];
    teachers.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      teacherSelect.appendChild(opt);
    });
  }

  const filtered = classes.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search) || (c.subject && c.subject.toLowerCase().includes(search)) || (c.teacherName && c.teacherName.toLowerCase().includes(search));
    const matchGrade = !gradeFilter || c.grade === gradeFilter;
    const matchTeacher = !teacherFilter || c.teacherName === teacherFilter;
    return matchSearch && matchGrade && matchTeacher;
  });

  const tbody = document.getElementById('classesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--muted);">No matching classrooms found. Click <strong>Assign Teacher</strong> or <strong>New Class</strong> above.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const isAssigned = Boolean(c.teacherName && c.teacherName.trim() !== '');
    const enrolled = Number(c.enrolled || 0);
    const capacity = Number(c.capacity || 30);
    const pct = Math.min(100, Math.round((enrolled / capacity) * 100));

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight:700;font-size:13.5px;">${escapeHtml(c.name)}</div>
        <div class="small" style="color:var(--muted);"><span class="badge-pill badge-purple" style="font-size:10px;padding:2px 6px;">${escapeHtml(c.code)}</span></div>
      </td>
      <td><strong>${escapeHtml(c.subject || 'General')}</strong></td>
      <td><span class="badge-pill" style="background:rgba(99,91,252,0.1);color:var(--primary);">${escapeHtml(c.grade || 'Grade 10')}</span></td>
      <td>
        ${isAssigned ? `
          <div class="teacher-badge-wrap">
            <div class="teacher-avatar-sm">${escapeHtml((c.teacherName || 'T').substring(0,2).toUpperCase())}</div>
            <div>
              <div style="font-weight:700;font-size:13px;">${escapeHtml(c.teacherName)}</div>
              <div class="small" style="color:var(--muted);">${escapeHtml(c.teacherEmail || '')}</div>
            </div>
          </div>
        ` : `
          <button class="btn" style="padding:6px 12px;font-size:11px;" onclick="openAssignModal('${c.id}')">
            <i class="fa-solid fa-user-plus"></i> Assign Now
          </button>
        `}
      </td>
      <td>
        <div style="font-weight:600;font-size:12.5px;"><i class="fa-solid fa-door-open" style="color:var(--muted);margin-right:4px;"></i> ${escapeHtml(c.room || 'TBD')}</div>
        <div class="small" style="color:var(--muted);">${escapeHtml(c.schedule || 'Schedule pending')}</div>
      </td>
      <td style="min-width:120px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
          <span>${enrolled} / ${capacity}</span>
          <span>${pct}%</span>
        </div>
        <div class="capacity-bar">
          <div class="capacity-fill" style="width:${pct}%"></div>
        </div>
      </td>
      <td>
        <span class="badge-pill ${isAssigned ? 'badge-green' : 'badge-orange'}">
          <i class="fa-solid ${isAssigned ? 'fa-circle-check' : 'fa-clock'}"></i>
          ${isAssigned ? 'Assigned' : 'Unassigned'}
        </span>
      </td>
      <td style="text-align:right;">
        <div style="display:inline-flex;gap:6px;">
          <button class="btn ghost" style="padding:6px 10px;font-size:11px;" title="Reassign / Change Teacher" onclick="openAssignModal('${c.id}')">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn ghost" style="padding:6px 10px;font-size:11px;color:var(--accent-red);" title="Remove Class" onclick="deleteClassroom('${c.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAssignModal(preselectedClassId = null) {
  const classes = getClassesList();
  const teachers = getAvailableTeachers();

  const classSelect = document.getElementById('assign_class_select');
  const teacherSelect = document.getElementById('assign_teacher_select');
  if (!classSelect || !teacherSelect) return;

  classSelect.innerHTML = '';
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.code} — ${c.name} (${c.teacherName ? 'Assigned: ' + c.teacherName : 'Unassigned'})`;
    if (preselectedClassId && c.id === preselectedClassId) opt.selected = true;
    classSelect.appendChild(opt);
  });

  teacherSelect.innerHTML = '';
  teachers.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.email;
    opt.dataset.name = t.name;
    opt.textContent = `${t.name} (${t.role})`;
    teacherSelect.appendChild(opt);
  });

  const activeClass = classes.find(c => c.id === (preselectedClassId || classSelect.value));
  if (activeClass) {
    document.getElementById('assign_room').value = activeClass.room || 'Room 101';
    document.getElementById('assign_schedule').value = activeClass.schedule || 'Mon, Wed, Fri 09:00 AM';
    if (activeClass.teacherEmail) {
      teacherSelect.value = activeClass.teacherEmail;
    }
  }

  classSelect.onchange = () => {
    const selClass = classes.find(c => c.id === classSelect.value);
    if (selClass) {
      document.getElementById('assign_room').value = selClass.room || 'Room 101';
      document.getElementById('assign_schedule').value = selClass.schedule || 'Mon, Wed, Fri 09:00 AM';
      if (selClass.teacherEmail) teacherSelect.value = selClass.teacherEmail;
    }
  };

  document.getElementById('assignTeacherModalBackdrop').classList.add('show');
}

function closeAssignModal() {
  document.getElementById('assignTeacherModalBackdrop')?.classList.remove('show');
}

function submitTeacherAssignment() {
  const classId = document.getElementById('assign_class_select').value;
  const teacherSelect = document.getElementById('assign_teacher_select');
  const teacherEmail = teacherSelect.value;
  const teacherName = teacherSelect.options[teacherSelect.selectedIndex]?.dataset.name || teacherSelect.options[teacherSelect.selectedIndex]?.text.split('(')[0].trim();
  const room = document.getElementById('assign_room').value.trim();
  const schedule = document.getElementById('assign_schedule').value.trim();
  const notes = document.getElementById('assign_notes').value.trim();

  const classes = getClassesList();
  const idx = classes.findIndex(c => c.id === classId);
  if (idx === -1) return;

  classes[idx].teacherName = teacherName;
  classes[idx].teacherEmail = teacherEmail;
  classes[idx].room = room;
  classes[idx].schedule = schedule;
  classes[idx].status = 'Assigned';
  classes[idx].assignmentNotes = notes;
  classes[idx].assignedAt = Date.now();

  saveClassesList(classes);
  closeAssignModal();
  renderClassesSection();

  if (window.Toaster) {
    window.Toaster.success(
      'Teacher Assigned Successfully!',
      `${teacherName} has been assigned to ${classes[idx].name} (${room}).`,
      5000
    );
  } else {
    showToast(`Assigned ${teacherName} to ${classes[idx].name}`);
  }

  if (window.SchoolMessenger) {
    window.SchoolMessenger.sendSystemNotification(
      'chan-teachers',
      `Official HR Notice: ${teacherName} has been assigned to teach ${classes[idx].name} in ${room} (${schedule}).`
    );
  }
}

function openAddClassModal() {
  document.getElementById('addClassModalBackdrop')?.classList.add('show');
}

function closeAddClassModal() {
  document.getElementById('addClassModalBackdrop')?.classList.remove('show');
}

function submitAddClass() {
  const code = document.getElementById('new_class_code').value.trim().toUpperCase();
  const name = document.getElementById('new_class_name').value.trim();
  const subject = document.getElementById('new_class_subject').value.trim();
  const grade = document.getElementById('new_class_grade').value;
  const room = document.getElementById('new_class_room').value.trim() || 'Room 101';
  const schedule = document.getElementById('new_class_schedule').value.trim() || 'Mon, Wed 10:00 AM';
  const capacity = Number(document.getElementById('new_class_capacity').value) || 30;

  const classes = getClassesList();
  const newClass = {
    id: 'cls_' + Date.now(),
    code: code,
    name: name,
    subject: subject,
    grade: grade,
    room: room,
    schedule: schedule,
    capacity: capacity,
    enrolled: 0,
    teacherName: '',
    teacherEmail: '',
    status: 'Unassigned',
    createdAt: Date.now()
  };

  classes.push(newClass);
  saveClassesList(classes);
  closeAddClassModal();
  renderClassesSection();

  if (window.Toaster) {
    window.Toaster.success('New Classroom Created!', `${name} (${code}) added to active curriculum.`, 4000);
  }
}

function deleteClassroom(classId) {
  if (confirm('Are you sure you want to remove this classroom module?')) {
    let classes = getClassesList();
    classes = classes.filter(c => c.id !== classId);
    saveClassesList(classes);
    renderClassesSection();
    if (window.Toaster) {
      window.Toaster.info('Class Removed', 'Classroom has been decommissioned.', 3000);
    }
  }
}

/* -------------------------------------------------------------
   SECTION 1: DASHBOARD & CHARTS
------------------------------------------------------------- */
function renderDashboard() {
  const teachers = read(EMP_KEY);
  const headcount = teachers.length;
  document.getElementById('totalTeachers').textContent = headcount;

  // Compute absent
  const attDate = document.getElementById('attDate')?.value || new Date().toISOString().split('T')[0];
  const allAtt = read(ATT_KEY);
  const todayAtt = allAtt.filter(r => r.date === attDate);
  const absentCount = todayAtt.filter(r => r.status === 'Absent').length;
  document.getElementById('absentToday').textContent = absentCount;

  // Monthly Payroll Commitment
  const payrollSum = teachers.reduce((acc, curr) => acc + Number(curr.salary || 0), 0);
  document.getElementById('payrollTotal').textContent = `GHS ${payrollSum.toLocaleString()}`;

  // Update Live Features Dropdown Mini-Metrics (Merged from pages/public/home.html)
  const depts = new Set(teachers.map(t => t.department || t.dept).filter(Boolean));
  const deptCount = Math.max(depts.size, 4);
  const presentCount = Math.max(0, headcount - absentCount);
  const attRate = headcount > 0 ? Math.round((presentCount / headcount) * 100) : 96;

  document.querySelectorAll('.f-metric-teachers').forEach(el => { el.textContent = headcount; });
  document.querySelectorAll('.f-metric-depts').forEach(el => { el.textContent = deptCount; });
  document.querySelectorAll('.f-metric-attendance').forEach(el => { el.textContent = `${attRate}%`; });
  document.querySelectorAll('.f-metric-payroll').forEach(el => { el.textContent = `GHS ${payrollSum.toLocaleString()}`; });

  // Populate Activity Feed
  const feed = document.getElementById('activityFeed');
  feed.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
      <i class="fa-solid fa-circle-check" style="color:var(--accent-green)"></i>
      <div style="flex:1;font-size:13px"><strong>HR Workspace Active:</strong> Session authenticated for ${escapeHtml(ACTIVE_ORG)}</div>
      <div class="small">Just now</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
      <i class="fa-solid fa-users" style="color:var(--primary)"></i>
      <div style="flex:1;font-size:13px"><strong>Workforce Synced:</strong> ${headcount} active personnel registered in ledger</div>
      <div class="small">Live</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
      <i class="fa-solid fa-money-bill-wave" style="color:var(--accent-orange)"></i>
      <div style="flex:1;font-size:13px"><strong>Payroll Calculated:</strong> GHS ${payrollSum.toLocaleString()} total gross commitment</div>
      <div class="small">Verified</div>
    </div>
  `;

  if (typeof updatePendingBanners === 'function') {
    updatePendingBanners();
  }
}

function renderCharts() {
  if (!window.Chart) return;
  const textColor = '#64748B';
  const gridColor = 'rgba(0,0,0,0.06)';


  // 1. Weekly Attendance Chart
  const ctx1 = document.getElementById('overviewChart');
  if (ctx1) {
    if (overviewChartInstance) overviewChartInstance.destroy();
    overviewChartInstance = new Chart(ctx1.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
          label: 'Present Staff %',
          data: [98, 96, 100, 94, 95],
          backgroundColor: '#635bfc',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { min: 80, max: 100, grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // 2. Department Allocation Chart
  const ctx2 = document.getElementById('deptChart');
  if (ctx2) {
    if (deptChartInstance) deptChartInstance.destroy();
    const teachers = read(EMP_KEY);
    const deptCounts = {};
    teachers.forEach(e => {
      const d = e.dept || e.department || 'General';
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    deptChartInstance = new Chart(ctx2.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptCounts),
        datasets: [{
          data: Object.values(deptCounts),
          backgroundColor: ['#635bfc', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#a855f7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor, font: { size: 11 } } }
        },
        cutout: '70%'
      }
    });
  }
}

/* -------------------------------------------------------------
   SECTION 2: EMPLOYEES DIRECTORY & MODAL
------------------------------------------------------------- */
async function renderTeachers() {
  let teachers = read(EMP_KEY);
  if (window.SupabaseService && window.SupabaseConfig && window.SupabaseConfig.isConfigured()) {
    try {
      teachers = await window.SupabaseService.getTeachers(ACTIVE_ORG);
    } catch (_) {}
  }
  const tbody = document.getElementById('teacherTable');
  tbody.innerHTML = '';

  const query = (document.getElementById('searchTeacher')?.value || '').toLowerCase().trim();
  const deptFilter = document.getElementById('filterDept')?.value || '';
  const roleFilter = document.getElementById('filterRole')?.value || '';

  // Collect unique depts & roles for filters
  const deptSet = new Set();
  const roleSet = new Set();

  teachers.forEach(e => {
    if (e.dept) deptSet.add(e.dept);
    if (e.role) roleSet.add(e.role);
  });

  // Populate filter dropdowns if needed
  const deptSelect = document.getElementById('filterDept');
  if (deptSelect && deptSelect.options.length <= 1) {
    deptSet.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
  }

  const roleSelect = document.getElementById('filterRole');
  if (roleSelect && roleSelect.options.length <= 1) {
    roleSet.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      roleSelect.appendChild(opt);
    });
  }

  const filtered = teachers.filter(e => {
    const matchQ = (e.name || '').toLowerCase().includes(query) || (e.role || '').toLowerCase().includes(query) || (e.email || '').toLowerCase().includes(query);
    const matchD = !deptFilter || e.dept === deptFilter;
    const matchR = !roleFilter || e.role === roleFilter;
    return matchQ && matchD && matchR;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">No matching personnel found.</td></tr>`;
    return;
  }

  filtered.forEach(e => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.ondblclick = () => openEmpModalById(e.id);
    tr.innerHTML = `
      <td style="display:flex;align-items:center;gap:12px">
        <img src="${e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" class="profile-thumb" style="width:34px;height:34px;border-radius:8px">
        <div>
          <span style="font-weight:700">${escapeHtml(e.name)}</span>
        </div>
      </td>
      <td><strong>${escapeHtml(e.role)}</strong></td>
      <td><span class="badge-pill badge-purple">${escapeHtml(e.dept)}</span></td>
      <td style="color:var(--muted)">${escapeHtml(e.email)}</td>
      <td style="font-weight:700">GHS ${Number(e.salary || 0).toLocaleString()}</td>
      <td><span class="badge-pill badge-green"><i class="fa-solid fa-circle" style="font-size:7px"></i> Active</span></td>
      <td style="text-align:right">
        <button class="btn ghost" style="padding:5px 9px" onclick="openEmpModalById('${e.id}')" title="Edit Profile"><i class="fa-solid fa-pen"></i></button>
        <button class="btn ghost" style="padding:5px 9px" onclick="openChatWith('${e.id}')" title="Send Message"><i class="fa-solid fa-comment" style="color:var(--primary)"></i></button>
        <button class="btn ghost" style="padding:5px 9px;color:var(--accent-red)" onclick="deleteEmp('${e.id}')" title="Remove"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Live Search & Filter Handlers
document.getElementById('searchTeacher')?.addEventListener('input', renderTeachers);
document.getElementById('filterDept')?.addEventListener('change', renderTeachers);
document.getElementById('filterRole')?.addEventListener('change', renderTeachers);

// ── FULL TEACHER MODAL CONTROLS (from teacher.html) ──
document.getElementById('addTeacherBtn')?.addEventListener('click', () => openTeacherModal());

let currentTeacherModalPhoto = null;
const DEFAULT_TEACHER_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

function handleTeacherModalPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('Staff photo size must be under 2MB');
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentTeacherModalPhoto = ev.target.result;
    document.getElementById('m_avatarPreview').src = currentTeacherModalPhoto;
    const remBtn = document.getElementById('m_removePhotoBtn');
    if (remBtn) remBtn.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

function removeTeacherModalPhoto() {
  currentTeacherModalPhoto = null;
  const fileInput = document.getElementById('m_avatarFile');
  if (fileInput) fileInput.value = '';
  document.getElementById('m_avatarPreview').src = DEFAULT_TEACHER_PHOTO;
  const remBtn = document.getElementById('m_removePhotoBtn');
  if (remBtn) remBtn.style.display = 'none';
}

function openTeacherModal(emp) {
  document.getElementById('modalHeading').textContent = emp ? 'Edit Teacher Record' : 'Add New Teacher';
  document.getElementById('editTeacherId').value = emp ? emp.id : '';
  document.getElementById('teacherForm').reset();
  const fileInput = document.getElementById('m_avatarFile');
  if (fileInput) fileInput.value = '';
  const remBtn = document.getElementById('m_removePhotoBtn');

  if (emp) {
    document.getElementById('m_name').value = emp.fullName || emp.name || '';
    document.getElementById('m_dob').value = emp.dob || '';
    document.getElementById('m_gender').value = emp.gender || '';
    document.getElementById('m_nationality').value = emp.nationality || '';
    document.getElementById('m_nationalId').value = emp.nationalId || '';
    document.getElementById('m_email').value = emp.email || '';
    document.getElementById('m_phone').value = emp.phone || '';
    document.getElementById('m_address').value = emp.address || '';
    document.getElementById('m_dept').value = emp.department || emp.dept || '';
    document.getElementById('m_pos').value = emp.position || emp.role || '';
    document.getElementById('m_empType').value = emp.empType || 'Full-Time';
    document.getElementById('m_status').value = emp.status || 'Active';
    document.getElementById('m_hireDate').value = emp.hireDate || '';
    document.getElementById('m_salary').value = emp.salary || '';
    document.getElementById('m_ssnit').value = emp.ssnit || '';
    document.getElementById('m_qualification').value = emp.qualification || '';
    document.getElementById('m_subjects').value = emp.subjects || '';
    document.getElementById('m_licenseNo').value = emp.licenseNo || '';
    document.getElementById('m_experience').value = emp.experience || '';
    document.getElementById('m_emergencyName').value = emp.emergencyName || '';
    document.getElementById('m_emergencyRel').value = emp.emergencyRel || '';
    document.getElementById('m_emergencyPhone').value = emp.emergencyPhone || '';
    document.getElementById('m_notes').value = emp.notes || '';
    currentTeacherModalPhoto = emp.photo || null;
    document.getElementById('m_avatarPreview').src = emp.photo || DEFAULT_TEACHER_PHOTO;
    if (remBtn) remBtn.style.display = emp.photo ? 'inline-block' : 'none';
  } else {
    currentTeacherModalPhoto = null;
    document.getElementById('m_avatarPreview').src = DEFAULT_TEACHER_PHOTO;
    if (remBtn) remBtn.style.display = 'none';
  }
  document.getElementById('teacherModal').classList.add('active');
}

function closeTeacherModal() {
  document.getElementById('teacherModal').classList.remove('active');
}

function handleSaveTeacherFull(e) {
  e.preventDefault();
  const editId = document.getElementById('editTeacherId').value;
  let teachers = read(EMP_KEY);

  const newRecord = {
    fullName: document.getElementById('m_name').value.trim(),
    name: document.getElementById('m_name').value.trim(),
    dob: document.getElementById('m_dob').value,
    gender: document.getElementById('m_gender').value,
    nationality: document.getElementById('m_nationality').value.trim(),
    nationalId: document.getElementById('m_nationalId').value.trim(),
    email: document.getElementById('m_email').value.trim(),
    phone: document.getElementById('m_phone').value.trim(),
    address: document.getElementById('m_address').value.trim(),
    department: document.getElementById('m_dept').value.trim(),
    dept: document.getElementById('m_dept').value.trim(),
    position: document.getElementById('m_pos').value.trim(),
    role: document.getElementById('m_pos').value.trim(),
    empType: document.getElementById('m_empType').value,
    status: document.getElementById('m_status').value,
    hireDate: document.getElementById('m_hireDate').value,
    salary: Number(document.getElementById('m_salary').value) || 0,
    ssnit: document.getElementById('m_ssnit').value.trim(),
    qualification: document.getElementById('m_qualification').value,
    subjects: document.getElementById('m_subjects').value.trim(),
    licenseNo: document.getElementById('m_licenseNo').value.trim(),
    experience: document.getElementById('m_experience').value,
    emergencyName: document.getElementById('m_emergencyName').value.trim(),
    emergencyRel: document.getElementById('m_emergencyRel').value.trim(),
    emergencyPhone: document.getElementById('m_emergencyPhone').value.trim(),
    notes: document.getElementById('m_notes').value.trim(),
    photo: currentTeacherModalPhoto || document.getElementById('m_avatarPreview').src
  };

  if (editId) {
    const idx = teachers.findIndex(x => x.id === editId);
    if (idx >= 0) {
      teachers[idx] = Object.assign({}, teachers[idx], newRecord);
    }
    showToast('Teacher updated successfully');
  } else {
    newRecord.id = 'emp_' + Date.now();
    teachers.unshift(newRecord);
    showToast('New teacher enrolled successfully');
  }

  save(EMP_KEY, teachers);

  if (window.SupabaseService && window.SupabaseConfig && window.SupabaseConfig.isConfigured()) {
    window.SupabaseService.saveTeacher(ACTIVE_ORG, newRecord).catch(console.warn);
  }

  closeTeacherModal();
  renderTeachers();
  renderDashboard();
  renderCharts();
  initPayrollSection();
}

function openEmpModalById(id) {
  const teachers = read(EMP_KEY);
  const emp = teachers.find(e => e.id === id);
  if (emp) openTeacherModal(emp);
}

function deleteEmp(id) {
  if (!confirm('Are you sure you want to remove this teacher from the directory?')) return;

  if (window.SupabaseService && window.SupabaseConfig && window.SupabaseConfig.isConfigured()) {
    window.SupabaseService.deleteTeacher(ACTIVE_ORG, id).catch(console.warn);
  }

  let teachers = read(EMP_KEY);
  teachers = teachers.filter(e => e.id !== id);
  save(EMP_KEY, teachers);
  renderTeachers();
  renderDashboard();
  renderCharts();
  initPayrollSection();
  showToast('Teacher record deleted');
}

/* -------------------------------------------------------------
   SECTION 3: COMPREHENSIVE STUDENT REGISTRATION & ENROLLMENT
   (Synced with Teacher Dashboard Form & Institutional Roster)
------------------------------------------------------------- */
const DEFAULT_STUDENT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
let currentStudentPhotoBase64 = null;

function handleStudentPhotoChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Photo Too Large', 'Student photo size must be under 2MB.');
    } else {
      showToast('Student photo size must be under 2MB', 'warning');
    }
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentStudentPhotoBase64 = evt.target.result;
    const preview = document.getElementById('sm_photoPreview');
    if (preview) {
      preview.innerHTML = `<img src="${currentStudentPhotoBase64}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (removeBtn) removeBtn.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

function removeStudentPhoto() {
  currentStudentPhotoBase64 = null;
  const fileInput = document.getElementById('sm_photoFile');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('sm_photoPreview');
  if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
  const removeBtn = document.getElementById('sm_removePhotoBtn');
  if (removeBtn) removeBtn.style.display = 'none';
}

function closeStudentModal() {
  const modal = document.getElementById('studentModal');
  if (modal) modal.classList.remove('active');
  const form = document.getElementById('studentDetailForm');
  if (form) form.reset();
  removeStudentPhoto();
}

function getEnrolledStudentsList() {
  let studs = read(STUD_KEY);
  if (!Array.isArray(studs)) studs = [];

  // Also harvest any students stored inside classes
  const classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
  let merged = [...studs];
  classes.forEach(c => {
    if (Array.isArray(c.students)) {
      c.students.forEach(cs => {
        const rollId = cs.roll || cs.id || cs.enrollment_code;
        const existingIdx = merged.findIndex(s => (s.roll || s.id || s.enrollment_code) === rollId);
        if (existingIdx === -1) {
          merged.push(Object.assign({
            id: cs.id || rollId,
            enrollment_code: rollId,
            roll: rollId,
            class_name: c.name,
            classId: c.id
          }, cs));
        }
      });
    }
  });

  if (merged.length === 0) {
    merged = [
      { id: 's_101', enrollment_code: 'STU-2026-001', roll: 'STU-2026-001', firstName: 'Samuel', middleName: 'Kofi', lastName: 'Mensah', student_name: 'Samuel Kofi Mensah', class_name: 'Grade 11 - Web Systems & Client Architecture', classId: 'cls_2', gender: 'Male', dob: '2008-04-12', bloodGroup: 'O+', status: 'Active', term: '2026 - Term 1', enrollmentDate: '2026-01-15', guardianName: 'Mary Mensah', guardianRel: 'Mother', phone: '+233 24 123 4567', guardianEmail: 'mary.mensah@example.com', address: 'House No. 24, Ring Road, Accra', emergencyPhone: '+233 20 987 6543', medicalNotes: 'None', notes: 'Prefers front seat; excellent in web architecture', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80' },
      { id: 's_102', enrollment_code: 'STU-2026-002', roll: 'STU-2026-002', firstName: 'Yaa', middleName: '', lastName: 'Asantewaa', student_name: 'Yaa Asantewaa', class_name: 'Grade 10 - Graphic Arts & Visual Identity', classId: 'cls_1', gender: 'Female', dob: '2009-02-18', bloodGroup: 'A+', status: 'Active', term: '2026 - Term 1', enrollmentDate: '2026-01-15', guardianName: 'Nana Asantewaa', guardianRel: 'Mother', phone: '+233 24 222 3344', guardianEmail: 'nana.asantewaa@example.com', address: 'Plot 12, Airport Residential Area', emergencyPhone: '+233 24 888 2233', medicalNotes: 'Mild asthma (inhaler with student)', notes: 'Art competition first place winner', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' },
      { id: 's_103', enrollment_code: 'STU-2026-003', roll: 'STU-2026-003', firstName: 'Kwabena', middleName: 'J.', lastName: 'Darko', student_name: 'Kwabena J. Darko', class_name: 'Grade 12 - Digital Animation & 3D Modeling', classId: 'cls_3', gender: 'Male', dob: '2007-11-20', bloodGroup: 'B+', status: 'Active', term: '2026 - Term 1', enrollmentDate: '2026-01-15', guardianName: 'Samuel Darko', guardianRel: 'Father', phone: '+233 55 333 4455', guardianEmail: 'samuel.darko@example.com', address: 'Block 4, Cantonments, Accra', emergencyPhone: '+233 27 777 3344', medicalNotes: 'None', notes: 'Lead 3D animator student club', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
      { id: 's_104', enrollment_code: 'STU-2026-004', roll: 'STU-2026-004', firstName: 'Akua', middleName: 'Serwaa', lastName: 'Donkor', student_name: 'Akua Serwaa Donkor', class_name: 'Grade 10 - UI/UX Interactive Prototyping', classId: 'cls_5', gender: 'Female', dob: '2008-08-30', bloodGroup: 'O+', status: 'Scholarship', term: '2026 - Term 1', enrollmentDate: '2026-01-16', guardianName: 'Mercy Donkor', guardianRel: 'Mother', phone: '+233 26 444 5566', guardianEmail: 'mercy.donkor@example.com', address: 'Spintex Road, Community 18', emergencyPhone: '+233 26 666 4455', medicalNotes: 'Penicillin allergy', notes: 'Full institutional scholarship recipient', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80' }
    ];
    save(STUD_KEY, merged);
  }
  return merged;
}

function loadHRStudents() {
  const studs = getEnrolledStudentsList();
  const tbody = document.getElementById('studentTableBody');
  if (tbody) {
    if (studs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">No students registered yet. Click "Add Student" to register a student profile.</td></tr>`;
    } else {
      tbody.innerHTML = studs.map(s => {
        const code = escapeHtml(s.roll || s.enrollment_code || s.id || 'STU-2026-001');
        const name = escapeHtml(s.student_name || [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || 'Unnamed Student');
        const className = escapeHtml(s.class_name || s.className || 'General Studies');
        const status = s.status || 'Active';
        const statusClass = status === 'Active' ? 'badge-green' : (status === 'Probation' ? 'badge-amber' : (status === 'Scholarship' ? 'badge-blue' : 'badge-purple'));
        const statusLabel = status === 'Active' ? 'Active Student' : status;
        const photo = s.photo || DEFAULT_STUDENT_AVATAR;
        const guardianPhone = escapeHtml(s.phone || s.guardian_phone || s.guardianPhone || 'No Phone');
        const guardianName = escapeHtml(s.guardianName || s.guardian_name || 'Guardian');

        return `
          <tr>
            <td><strong style="color:var(--primary); font-family:monospace; font-size:13px;">${code}</strong></td>
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${photo}" alt="${name}" style="width:38px; height:38px; border-radius:10px; object-fit:cover; border:1px solid var(--border); flex-shrink:0;">
                <div>
                  <div style="font-weight:700; color:var(--text);">${name}</div>
                  <div class="small" style="color:var(--muted); font-size:11px;"><i class="fa-solid fa-user-shield" style="font-size:10px;"></i> ${guardianName} • ${guardianPhone}</div>
                </div>
              </div>
            </td>
            <td><span class="badge-pill badge-purple">${className}</span></td>
            <td>
              <div style="font-size:12.5px; font-weight:600; color:var(--text);"><i class="fa-solid fa-calendar-day" style="color:var(--muted); margin-right:4px;"></i>${escapeHtml(s.term || '2026 - Term 1')}</div>
            </td>
            <td><span class="badge-pill ${statusClass}"><i class="fa-solid fa-circle" style="font-size:6.5px"></i> ${escapeHtml(statusLabel)}</span></td>
            <td style="text-align:right">
              <div style="display:inline-flex; gap:6px;">
                <button class="btn ghost" style="padding:5px 9px; font-size:12px; color:var(--primary);" title="Edit Student Profile" onclick="editHRStudent('${code}')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn ghost" style="padding:5px 9px; font-size:12px; color:var(--accent-red);" title="Delete Student Record" onclick="deleteHRStudent('${code}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  const countEl = document.getElementById('totalStudents');
  if (countEl) countEl.textContent = studs.length;
}

function openAddStudentModal(studentOrCode = null) {
  const modal = document.getElementById('studentModal');
  if (!modal) return;

  const form = document.getElementById('studentDetailForm');
  if (form) form.reset();

  const titleEl = document.getElementById('studentModalTitle');
  const saveBtn = document.getElementById('sm_saveBtn');
  const classSelect = document.getElementById('sm_classId');

  // Populate Classes dropdown from classes store
  if (classSelect) {
    const classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
    if (classes.length > 0) {
      classSelect.innerHTML = classes.map(c => `
        <option value="${c.id}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)} (${escapeHtml(c.grade || c.code || 'Class')})</option>
      `).join('');
    } else {
      classSelect.innerHTML = `
        <option value="cls_1" data-name="Grade 10 - Graphic Arts & Visual Identity">Grade 10 - Graphic Arts & Visual Identity</option>
        <option value="cls_2" data-name="Grade 11 - Web Systems & Client Architecture">Grade 11 - Web Systems & Client Architecture</option>
        <option value="cls_3" data-name="Grade 12 - Digital Animation & 3D Modeling">Grade 12 - Digital Animation & 3D Modeling</option>
        <option value="cls_4" data-name="Grade 9 - Fundamental Design Principles">Grade 9 - Fundamental Design Principles</option>
        <option value="cls_5" data-name="Grade 10 - UI/UX Interactive Prototyping">Grade 10 - UI/UX Interactive Prototyping</option>
      `;
    }
  }

  let student = null;
  if (studentOrCode) {
    if (typeof studentOrCode === 'object') {
      student = studentOrCode;
    } else {
      const allStuds = getEnrolledStudentsList();
      student = allStuds.find(s => (s.roll || s.id || s.enrollment_code) === studentOrCode);
    }
  }

  if (student) {
    // Edit Mode
    if (titleEl) titleEl.textContent = 'Edit Student Profile';
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Student Profile';

    document.getElementById('sm_studentId').value = student.id || student.roll || '';
    document.getElementById('sm_firstName').value = student.firstName || student.student_name?.split(' ')[0] || '';
    document.getElementById('sm_middleName').value = student.middleName || '';
    document.getElementById('sm_lastName').value = student.lastName || student.student_name?.split(' ').slice(1).join(' ') || '';
    document.getElementById('sm_gender').value = student.gender || 'Male';
    document.getElementById('sm_dob').value = student.dob || '';
    document.getElementById('sm_bloodGroup').value = student.bloodGroup || 'Not Specified';
    document.getElementById('sm_roll').value = student.roll || student.enrollment_code || student.id || '';
    
    if (student.classId && classSelect) {
      classSelect.value = student.classId;
    } else if (student.class_name && classSelect) {
      for (let i = 0; i < classSelect.options.length; i++) {
        if (classSelect.options[i].text.includes(student.class_name) || classSelect.options[i].getAttribute('data-name') === student.class_name) {
          classSelect.selectedIndex = i;
          break;
        }
      }
    }

    document.getElementById('sm_status').value = student.status || 'Active';
    document.getElementById('sm_term').value = student.term || (new Date().getFullYear() + ' - Term 1');
    document.getElementById('sm_enrollmentDate').value = student.enrollmentDate || student.enrolledAt?.split('T')[0] || new Date().toISOString().split('T')[0];

    document.getElementById('sm_guardianName').value = student.guardianName || student.guardian_name || '';
    document.getElementById('sm_guardianRel').value = student.guardianRel || student.guardian_rel || 'Mother';
    document.getElementById('sm_phone').value = student.phone || student.guardian_phone || '';
    document.getElementById('sm_guardianEmail').value = student.guardianEmail || student.guardian_email || '';
    document.getElementById('sm_address').value = student.address || '';

    document.getElementById('sm_emergencyPhone').value = student.emergencyPhone || '';
    document.getElementById('sm_medicalNotes').value = student.medicalNotes || '';
    document.getElementById('sm_notes').value = student.notes || '';

    currentStudentPhotoBase64 = student.photo || null;
    const preview = document.getElementById('sm_photoPreview');
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (student.photo) {
      if (preview) preview.innerHTML = `<img src="${student.photo}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
      if (removeBtn) removeBtn.style.display = 'none';
    }
  } else {
    // Add Mode
    if (titleEl) titleEl.textContent = 'Register Student Profile';
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Student Record';

    document.getElementById('sm_studentId').value = '';
    const allStuds = getEnrolledStudentsList();
    const nextNum = String(allStuds.length + 1).padStart(3, '0');
    document.getElementById('sm_roll').value = 'STU-' + new Date().getFullYear() + '-' + nextNum;
    document.getElementById('sm_term').value = new Date().getFullYear() + ' - Term 1';
    document.getElementById('sm_enrollmentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('sm_status').value = 'Active';

    currentStudentPhotoBase64 = null;
    const fileInput = document.getElementById('sm_photoFile');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('sm_photoPreview');
    if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (removeBtn) removeBtn.style.display = 'none';
  }

  modal.classList.add('active');
  setTimeout(() => {
    document.getElementById('sm_firstName')?.focus();
  }, 100);
}

function editHRStudent(code) {
  openAddStudentModal(code);
}

function saveStudentDetailForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const classSelect = document.getElementById('sm_classId');
  const classId = classSelect ? classSelect.value : '';
  const selectedOption = classSelect ? classSelect.options[classSelect.selectedIndex] : null;
  const className = selectedOption ? (selectedOption.getAttribute('data-name') || selectedOption.text.split(' (')[0]) : 'General Studies';

  const studentId = document.getElementById('sm_studentId')?.value.trim();
  const firstName = document.getElementById('sm_firstName')?.value.trim();
  const middleName = document.getElementById('sm_middleName')?.value.trim();
  const lastName = document.getElementById('sm_lastName')?.value.trim();
  const gender = document.getElementById('sm_gender')?.value || 'Male';
  const dob = document.getElementById('sm_dob')?.value || '';
  const bloodGroup = document.getElementById('sm_bloodGroup')?.value || 'Not Specified';
  const roll = document.getElementById('sm_roll')?.value.trim();
  const status = document.getElementById('sm_status')?.value || 'Active';
  const term = document.getElementById('sm_term')?.value.trim() || (new Date().getFullYear() + ' - Term 1');
  const enrollmentDate = document.getElementById('sm_enrollmentDate')?.value || new Date().toISOString().split('T')[0];
  const guardianName = document.getElementById('sm_guardianName')?.value.trim();
  const guardianRel = document.getElementById('sm_guardianRel')?.value || 'Mother';
  const phone = document.getElementById('sm_phone')?.value.trim();
  const guardianEmail = document.getElementById('sm_guardianEmail')?.value.trim();
  const address = document.getElementById('sm_address')?.value.trim();
  const emergencyPhone = document.getElementById('sm_emergencyPhone')?.value.trim();
  const medicalNotes = document.getElementById('sm_medicalNotes')?.value.trim();
  const notes = document.getElementById('sm_notes')?.value.trim();

  if (!firstName || !lastName) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Required Information Missing', 'First Name and Last Name / Surname are mandatory.');
    } else {
      showToast('First and Last names are required', 'warning');
    }
    return;
  }
  if (!roll) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Student ID Missing', 'Student ID / Roll No is required.');
    } else {
      showToast('Student ID / Roll No is required', 'warning');
    }
    return;
  }
  if (!guardianName || !phone) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Guardian Information Missing', 'Guardian Full Name and Primary Phone are required for enrollment.');
    } else {
      showToast('Guardian name and primary phone are required', 'warning');
    }
    return;
  }

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const recordId = studentId || ('s_' + Date.now());

  const studentRecord = {
    id: recordId,
    enrollment_code: roll,
    roll: roll,
    student_name: fullName,
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    gender: gender,
    dob: dob,
    bloodGroup: bloodGroup,
    classId: classId,
    class_name: className,
    status: status,
    term: term,
    enrollmentDate: enrollmentDate,
    enrolledAt: enrollmentDate ? new Date(enrollmentDate).toISOString() : new Date().toISOString(),
    guardianName: guardianName,
    guardian_name: guardianName,
    guardianRel: guardianRel,
    guardian_rel: guardianRel,
    phone: phone,
    guardian_phone: phone,
    guardianEmail: guardianEmail,
    guardian_email: guardianEmail,
    address: address,
    emergencyPhone: emergencyPhone,
    medicalNotes: medicalNotes,
    notes: notes,
    photo: currentStudentPhotoBase64 || DEFAULT_STUDENT_AVATAR,
    updatedAt: Date.now()
  };

  // 1. Update in STUD_KEY
  let studs = read(STUD_KEY);
  if (!Array.isArray(studs)) studs = [];
  const existingIdx = studs.findIndex(s => (s.id === recordId || (s.roll && s.roll === roll) || (s.enrollment_code && s.enrollment_code === roll)));
  if (existingIdx !== -1) {
    studs[existingIdx] = Object.assign({}, studs[existingIdx], studentRecord);
  } else {
    studentRecord.createdAt = Date.now();
    studs.unshift(studentRecord);
  }
  save(STUD_KEY, studs);

  // 2. Cross-portal sync: Update into target class in CLASSES_STORAGE_KEY
  let classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
  if (Array.isArray(classes)) {
    let targetClass = classes.find(c => c.id === classId || c.name === className);
    if (targetClass) {
      targetClass.students = targetClass.students || [];
      const cIdx = targetClass.students.findIndex(s => s.id === recordId || s.roll === roll);
      if (cIdx !== -1) {
        targetClass.students[cIdx] = Object.assign({}, targetClass.students[cIdx], studentRecord);
      } else {
        targetClass.students.push(studentRecord);
      }
      targetClass.enrolled = targetClass.students.length;
      save(CLASSES_STORAGE_KEY, classes);
    }
  }

  // Toast confirmation
  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success(
      studentId ? 'Student Profile Updated' : 'Student Enrolled Successfully',
      `${fullName} (${roll}) registered into ${className}.`
    );
  } else {
    showToast(`Student ${fullName} (${roll}) saved successfully!`);
  }

  closeStudentModal();
  loadHRStudents();
  renderDashboard();
}

function submitStudentAdmission() {
  saveStudentDetailForm();
}

function deleteHRStudent(code) {
  if (!confirm(`Are you sure you want to remove student profile (${code}) from institutional rosters?`)) return;

  let studs = read(STUD_KEY);
  if (Array.isArray(studs)) {
    studs = studs.filter(s => (s.roll || s.enrollment_code || s.id) !== code);
    save(STUD_KEY, studs);
  }

  // Also remove from class rosters
  let classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
  if (Array.isArray(classes)) {
    classes.forEach(c => {
      if (Array.isArray(c.students)) {
        c.students = c.students.filter(s => (s.roll || s.enrollment_code || s.id) !== code);
        c.enrolled = c.students.length;
      }
    });
    save(CLASSES_STORAGE_KEY, classes);
  }

  loadHRStudents();
  renderDashboard();

  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Student Record Removed', `Student (${code}) has been unenrolled.`);
  } else {
    showToast(`Student record ${code} removed.`);
  }
}

// Student Modal backdrop & escape dismiss handlers
document.getElementById('studentModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'studentModal') closeStudentModal();
});

/* -------------------------------------------------------------
   SECTION 3B: USER ACCOUNTS & ACCESS CONTROL MANAGEMENT
   (Super Admin & HR Access Control for Portal Logins)
------------------------------------------------------------- */
const USERS_STORAGE_KEY = 'organizations_users';

function getSystemUsers() {
  let users = read(USERS_STORAGE_KEY);
  if (!Array.isArray(users) || users.length === 0) {
    users = [
      { org: ACTIVE_ORG, name: 'James Ntiamoah', email: 'admin@flawlessgraphics.com', role: 'admin', status: 'active', pass: 'Flawless@2026', createdAt: Date.now() - 86400000 * 30 },
      { org: ACTIVE_ORG, name: 'Ama Serwaa', email: 'ama@flawless.org', role: 'hr', status: 'active', pass: 'Flawless@2026', linkedStaffId: 'e2', createdAt: Date.now() - 86400000 * 20 },
      { org: ACTIVE_ORG, name: 'Kwame Boateng', email: 'kwame@flawless.org', role: 'teacher', status: 'active', pass: 'Flawless@2026', linkedStaffId: 'e3', createdAt: Date.now() - 86400000 * 15 },
      { org: ACTIVE_ORG, name: 'Abena Mansa', email: 'abena@flawless.org', role: 'finance', status: 'active', pass: 'Flawless@2026', linkedStaffId: 'e4', createdAt: Date.now() - 86400000 * 10 },
      { org: ACTIVE_ORG, name: 'Kofi Owusu', email: 'kofi@flawless.org', role: 'teacher', status: 'active', pass: 'Flawless@2026', linkedStaffId: 'e5', createdAt: Date.now() - 86400000 * 5 },
      { org: ACTIVE_ORG, name: 'Daniel K. Mensah', email: 'daniel.mensah@flawless.org', role: 'teacher', status: 'pending_approval', pass: 'Teacher@2026', createdAt: Date.now() - 3600000 * 3, department: 'Academic Staff', designation: 'Senior Mathematics Instructor', phone: '+233 24 456 7890' }
    ];
    save(USERS_STORAGE_KEY, users);
  } else {
    // If no user has pending_approval and pending demo was not explicitly resolved, seed Daniel K. Mensah so actions are immediately available
    const orgUsers = users.filter(u => !u.org || u.org === ACTIVE_ORG || u.org === 'FLAWLESS GRAPHICS');
    const hasPending = orgUsers.some(u => {
      const s = (u.status || '').toLowerCase();
      return s === 'pending_approval' || s === 'pending';
    });
    const hasDaniel = users.some(u => (u.email || '').toLowerCase() === 'daniel.mensah@flawless.org');
    if (!hasPending && !hasDaniel && !localStorage.getItem('hr_pending_resolved')) {
      users.push({
        org: ACTIVE_ORG,
        name: 'Daniel K. Mensah',
        email: 'daniel.mensah@flawless.org',
        role: 'teacher',
        status: 'pending_approval',
        pass: 'Teacher@2026',
        createdAt: Date.now() - 3600000 * 3,
        department: 'Academic Staff',
        designation: 'Senior Mathematics Instructor',
        phone: '+233 24 456 7890'
      });
      save(USERS_STORAGE_KEY, users);
    }
  }
  return users;
}

function renderUsers() {
  const users = getSystemUsers();
  const orgUsers = users.filter(u => !u.org || u.org === ACTIVE_ORG || u.org === 'FLAWLESS GRAPHICS');

  // Metrics
  const total = orgUsers.length;
  const active = orgUsers.filter(u => {
    const s = (u.status || 'active').toLowerCase();
    return s === 'active';
  }).length;
  const pending = orgUsers.filter(u => {
    const s = (u.status || 'active').toLowerCase();
    return s === 'pending_approval' || s === 'pending';
  }).length;
  const teachers = orgUsers.filter(u => (u.role || '').toLowerCase() === 'teacher').length;
  const adminFinance = orgUsers.filter(u => ['admin', 'hr', 'finance'].includes((u.role || '').toLowerCase())).length;

  const totalEl = document.getElementById('metricTotalUsers');
  const activeEl = document.getElementById('metricActiveUsers');
  const pendingEl = document.getElementById('metricPendingUsers');
  const teacherEl = document.getElementById('metricTeacherUsers');
  const adminEl = document.getElementById('metricAdminUsers');
  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (pendingEl) pendingEl.textContent = pending;
  if (teacherEl) teacherEl.textContent = teachers;
  if (adminEl) adminEl.textContent = adminFinance;

  // Pending Approvals Banner
  const banner = document.getElementById('hrPendingApprovalsBanner');
  const bannerDesc = document.getElementById('hrPendingBannerDesc');
  if (pending > 0) {
    if (banner) banner.style.display = 'flex';
    if (bannerDesc) bannerDesc.textContent = `${pending} staff registration request(s) awaiting HR review and authorization.`;
  } else {
    if (banner) banner.style.display = 'none';
  }

  // Pending Registration Action Queue Card (Dedicated 1-Click Action Hub)
  const queueCard = document.getElementById('pendingActionQueueCard');
  const queueList = document.getElementById('pendingActionQueueList');
  const queueCount = document.getElementById('pendingQueueCountText');
  const pendingUsers = orgUsers.filter(u => {
    const s = (u.status || 'active').toLowerCase();
    return s === 'pending_approval' || s === 'pending';
  });

  if (queueCard) {
    if (pendingUsers.length > 0) {
      queueCard.style.display = 'block';
      if (queueCount) queueCount.textContent = `${pendingUsers.length} user registration request(s) awaiting administrative review and approval`;
      if (queueList) {
        queueList.innerHTML = pendingUsers.map(u => {
          const email = escapeHtml(u.email || '');
          const name = escapeHtml(u.name || email.split('@')[0] || 'Staff Applicant');
          const role = (u.role || 'teacher').toLowerCase();
          const roleLabel = role === 'admin' ? 'Super Admin' : (role === 'hr' ? 'HR Manager' : (role === 'finance' ? 'Finance Officer' : 'Teacher / Academic'));
          const dept = escapeHtml(u.department || 'Academic Staff');
          const designation = escapeHtml(u.designation || 'Staff Instructor');
          const initial = (u.name || email).charAt(0).toUpperCase();
          const timeStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent';

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px 18px; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; align-items:center; gap:14px;">
                <div class="user-avatar-badge" style="background:#f59e0b; width:44px; height:44px; font-size:16px; font-weight:800; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:12px;">${initial}</div>
                <div>
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="font-weight:800; color:var(--text); font-size:15px;">${name}</span>
                    <span class="role-badge role-teacher" style="font-size:11px;">${roleLabel}</span>
                    <span style="background:rgba(245,158,11,0.15); color:#d97706; font-size:11px; font-weight:700; padding:2px 8px; border-radius:9999px;"><i class="fa-solid fa-clock" style="font-size:9px; margin-right:3px;"></i> Awaiting Review</span>
                  </div>
                  <div style="font-size:12.5px; color:var(--muted); margin-top:3px;">
                    <span><i class="fa-solid fa-envelope" style="margin-right:4px;"></i>${email}</span>
                    <span style="margin:0 8px;">•</span>
                    <span><i class="fa-solid fa-building" style="margin-right:4px;"></i>${dept} (${designation})</span>
                    <span style="margin:0 8px;">•</span>
                    <span><i class="fa-solid fa-calendar-day" style="margin-right:4px;"></i>Requested: ${timeStr}</span>
                  </div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <button type="button" class="btn" style="background:#10b981; border-color:#059669; color:#ffffff; font-weight:800; padding:9px 20px; border-radius:10px; font-size:13px; display:inline-flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 3px 12px rgba(16,185,129,0.35);" onclick="approveStaffUser('${email}')">
                  <i class="fa-solid fa-check"></i> Approve Account
                </button>
                <button type="button" class="btn" style="background:#fee2e2; border-color:#fca5a5; color:#dc2626; font-weight:800; padding:9px 18px; border-radius:10px; font-size:13px; display:inline-flex; align-items:center; gap:8px; cursor:pointer;" onclick="rejectStaffUser('${email}')">
                  <i class="fa-solid fa-xmark"></i> Decline
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    } else {
      queueCard.style.display = 'none';
    }
  }

  // Filter & Search
  const q = (document.getElementById('searchUser')?.value || '').trim().toLowerCase();
  const rFilter = (document.getElementById('filterUserRole')?.value || '').toLowerCase();
  const sFilter = (document.getElementById('filterUserStatus')?.value || '').toLowerCase();

  const filtered = orgUsers.filter(u => {
    const matchQ = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchR = !rFilter || (u.role || '').toLowerCase() === rFilter;
    const uStat = (u.status || 'active').toLowerCase();
    const isPending = uStat === 'pending_approval' || uStat === 'pending';
    const isSusp = uStat === 'suspended';
    const isRej = uStat === 'rejected';

    let matchS = true;
    if (sFilter === 'active') matchS = uStat === 'active' && !isSusp && !isPending && !isRej;
    else if (sFilter === 'pending_approval') matchS = isPending;
    else if (sFilter === 'suspended') matchS = isSusp;
    else if (sFilter === 'rejected') matchS = isRej;

    return matchQ && matchR && matchS;
  });

  const tbody = document.getElementById('usersTableBody');
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">No matching user accounts found.</td></tr>`;
    } else {
      const staffList = read(EMP_KEY) || [];
      tbody.innerHTML = filtered.map(u => {
        const email = escapeHtml(u.email || '');
        const name = escapeHtml(u.name || email.split('@')[0] || 'User');
        const role = (u.role || 'teacher').toLowerCase();
        const roleClass = role === 'admin' ? 'role-admin' : (role === 'hr' ? 'role-hr' : (role === 'finance' ? 'role-finance' : 'role-teacher'));
        const roleLabel = role === 'admin' ? 'Super Admin' : (role === 'hr' ? 'HR Manager' : (role === 'finance' ? 'Finance Officer' : 'Teacher / Academic'));
        
        const uStat = (u.status || 'active').toLowerCase();
        const isPending = uStat === 'pending_approval' || uStat === 'pending';
        const isSusp = uStat === 'suspended';
        const isRej = uStat === 'rejected';

        let statusClass = 'status-badge-active';
        let statusLabel = 'Active';
        if (isPending) {
          statusClass = 'status-badge-pending';
          statusLabel = 'Pending Approval';
        } else if (isSusp) {
          statusClass = 'status-badge-suspended';
          statusLabel = 'Suspended';
        } else if (isRej) {
          statusClass = 'status-badge-suspended';
          statusLabel = 'Rejected';
        }

        // Avatar Initial
        const initial = (u.name || email).charAt(0).toUpperCase();
        const avatarBg = role === 'admin' ? '#635bfc' : (role === 'hr' ? '#10b981' : (role === 'finance' ? '#f59e0b' : '#0284c7'));

        // Linked Staff
        let linkedText = '<span style="color:var(--muted); font-size:11.5px;">Standalone Account</span>';
        if (u.linkedStaffId) {
          const emp = staffList.find(e => e.id === u.linkedStaffId);
          if (emp) {
            linkedText = `<span style="font-size:12px; font-weight:600; color:var(--text);"><i class="fa-solid fa-link" style="color:var(--primary); margin-right:4px;"></i>${escapeHtml(emp.name || emp.fullName)}</span>`;
          }
        }

        const isSuperAdmin = role === 'admin' || email.toLowerCase() === 'admin@flawlessgraphics.com';
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active';

        return `
          <tr style="${isPending ? 'background:rgba(245, 158, 11, 0.05);' : ''}">
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="user-avatar-badge" style="background:${avatarBg};">${initial}</div>
                <div>
                  <div style="font-weight:700; color:var(--text); font-size:13.5px;">${name}</div>
                  <div class="small" style="color:var(--muted); font-size:11.5px;">${email}</div>
                </div>
              </div>
            </td>
            <td><span class="role-badge ${roleClass}">${roleLabel}</span></td>
            <td>
              ${isPending ? `
                <span style="background:rgba(245, 158, 11, 0.15); color:#d97706; border:1px solid rgba(245, 158, 11, 0.35); padding:3px 10px; border-radius:12px; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:5px;"><i class="fa-solid fa-clock" style="font-size:10px;"></i> Pending Approval</span>
              ` : (isRej ? `
                <span style="background:rgba(239, 68, 68, 0.15); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.35); padding:3px 10px; border-radius:12px; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:5px;"><i class="fa-solid fa-xmark" style="font-size:10px;"></i> Rejected</span>
              ` : `
                <span class="${statusClass}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${statusLabel}</span>
              `)}
            </td>
            <td>${linkedText}</td>
            <td><span class="small" style="color:var(--muted);">${dateStr}</span></td>
            <td style="text-align:right">
              ${isSuperAdmin ? `
                <div style="display:inline-flex; gap:6px; align-items:center;">
                  <span style="background:rgba(99,91,252,0.12); color:#635bfc; font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:8px; display:inline-flex; align-items:center; gap:5px;"><i class="fa-solid fa-crown" style="font-size:10px;"></i> Root Admin</span>
                  <a href="../admin/admin-dashboard.html" class="btn ghost btn-sm" style="padding:5px 10px; font-size:11.5px; color:#635bfc; text-decoration:none; font-weight:700; border:1px solid rgba(99,91,252,0.3); border-radius:8px; display:inline-flex; align-items:center; gap:5px;" title="Manage via dedicated Super Admin Portal">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Admin Portal
                  </a>
                </div>
              ` : `
                <div style="display:inline-flex; gap:6px; align-items:center;">
                  ${isPending ? `
                    <button class="btn" style="background:#10b981; border-color:#059669; color:#fff; padding:6px 12px; font-size:12px; font-weight:800; border-radius:8px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(16,185,129,0.3);" title="Approve Staff Account" onclick="approveStaffUser('${email}')">
                      <i class="fa-solid fa-check"></i> Approve
                    </button>
                    <button class="btn" style="background:#fee2e2; border-color:#fca5a5; color:#dc2626; padding:6px 10px; font-size:12px; font-weight:800; border-radius:8px; display:inline-flex; align-items:center; gap:4px;" title="Reject Registration" onclick="rejectStaffUser('${email}')">
                      <i class="fa-solid fa-xmark"></i> Decline
                    </button>
                  ` : (isRej ? `
                    <button class="btn ghost" style="padding:4px 8px; font-size:11.5px; color:var(--accent-green);" title="Restore Account" onclick="approveStaffUser('${email}')">
                      <i class="fa-solid fa-check"></i> Restore
                    </button>
                  ` : `
                    <button class="btn ghost" style="padding:5px 9px; font-size:12px; color:${isSusp ? '#10b981' : '#f59e0b'};" title="${isSusp ? 'Activate Account' : 'Suspend Account'}" onclick="toggleUserStatus('${email}')">
                      <i class="fa-solid ${isSusp ? 'fa-unlock' : 'fa-ban'}"></i>
                    </button>
                  `)}
                  <button class="btn ghost" style="padding:5px 9px; font-size:12px; color:var(--primary);" title="Edit User Account" onclick="editUser('${email}')">
                    <i class="fa-solid fa-user-pen"></i>
                  </button>
                  <button class="btn ghost" style="padding:5px 9px; font-size:12px; color:var(--accent-red);" title="Delete User Account" onclick="deleteUserAccount('${email}')">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Refresh quick dock notifications arrived badge & list
  if (window.QuickDock && typeof window.QuickDock.refreshNotifications === 'function') {
    window.QuickDock.refreshNotifications();
  }
  if (typeof updatePendingBanners === 'function') {
    updatePendingBanners();
  }
}

function approveStaffUser(email) {
  let users = getSystemUsers();
  const target = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!target) return;
  target.status = 'active';
  target.approvedAt = Date.now();
  save(USERS_STORAGE_KEY, users);

  // Sync to employee roster if teacher
  const staffList = read(EMP_KEY) || [];
  let emp = staffList.find(e => (e.email || '').toLowerCase() === email.toLowerCase());
  if (emp) {
    emp.status = 'Active';
  } else if ((target.role || '').toLowerCase() === 'teacher') {
    staffList.push({
      id: 'e' + (staffList.length + 1),
      name: target.name,
      fullName: target.name,
      role: target.designation || 'Mathematics Instructor',
      position: target.designation || 'Mathematics Instructor',
      dept: target.department || 'Academic Staff',
      department: target.department || 'Academic Staff',
      email: target.email,
      salary: 4900,
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    });
  }
  save(EMP_KEY, staffList);

  const remainingPending = users.filter(u => u.status === 'pending_approval' || u.status === 'pending');
  if (remainingPending.length === 0) {
    localStorage.setItem('hr_pending_resolved', 'true');
  }

  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success('Account Approved', `Granted active access for ${target.name} [${(target.role || '').toUpperCase()}].`);
  } else {
    showToast(`Account approved for ${target.name}`);
  }
  renderUsers();
}

function rejectStaffUser(email) {
  if (!confirm(`Are you sure you want to decline registration for (${email})?`)) return;
  let users = getSystemUsers();
  const target = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!target) return;
  target.status = 'rejected';
  target.rejectedAt = Date.now();
  save(USERS_STORAGE_KEY, users);

  // Sync to employee roster
  const staffList = read(EMP_KEY) || [];
  const emp = staffList.find(e => (e.email || '').toLowerCase() === email.toLowerCase());
  if (emp) {
    emp.status = 'Rejected';
    save(EMP_KEY, staffList);
  }

  const remainingPending = users.filter(u => u.status === 'pending_approval' || u.status === 'pending');
  if (remainingPending.length === 0) {
    localStorage.setItem('hr_pending_resolved', 'true');
  }

  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Registration Declined', `Registration for ${target.name} has been rejected.`);
  } else {
    showToast(`Registration declined for ${target.name}`);
  }
  renderUsers();
}

function filterHrPendingStaff() {
  if (typeof showSection === 'function') {
    showSection('users');
  }
  const statSelect = document.getElementById('filterUserStatus');
  if (statSelect) {
    statSelect.value = 'pending_approval';
  }
  renderUsers();

  const queueCard = document.getElementById('pendingActionQueueCard');
  if (queueCard && queueCard.style.display !== 'none') {
    queueCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    const userTable = document.getElementById('userTable');
    if (userTable) {
      userTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function seedSamplePendingUser() {
  let users = getSystemUsers();
  const seedCandidates = [
    { name: 'Daniel K. Mensah', email: 'daniel.mensah@flawless.org', role: 'teacher', dept: 'Academic Staff', desig: 'Senior Mathematics Instructor' },
    { name: 'Akosua Agyeman', email: 'akosua.agyeman@flawless.org', role: 'teacher', dept: 'Academic Staff', desig: 'English Literature Instructor' },
    { name: 'Emmanuel Osei', email: 'emmanuel.osei@flawless.org', role: 'teacher', dept: 'Digital Media', desig: 'Graphics & Media Instructor' },
    { name: 'Grace Addo', email: 'grace.addo@flawless.org', role: 'finance', dept: 'Finance', desig: 'Assistant Bursar' }
  ];
  
  let candidate = seedCandidates.find(c => !users.some(u => (u.email || '').toLowerCase() === c.email.toLowerCase() && (u.status === 'pending_approval' || u.status === 'pending')));
  if (!candidate) {
    const rNum = Math.floor(100 + Math.random() * 900);
    candidate = {
      name: `Applicant ${rNum}`,
      email: `applicant${rNum}@flawless.org`,
      role: 'teacher',
      dept: 'Academic Staff',
      desig: 'Staff Instructor'
    };
  }

  const existingIdx = users.findIndex(u => (u.email || '').toLowerCase() === candidate.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx].status = 'pending_approval';
    users[existingIdx].createdAt = Date.now();
  } else {
    users.unshift({
      org: ACTIVE_ORG,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      status: 'pending_approval',
      pass: 'Staff@2026',
      createdAt: Date.now(),
      department: candidate.dept,
      designation: candidate.desig,
      phone: '+233 24 456 7890'
    });
  }
  save(USERS_STORAGE_KEY, users);
  localStorage.removeItem('hr_pending_resolved');
  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Registration Simulated', `Pending request for ${candidate.name} created.`);
  } else {
    showToast(`Pending request created for ${candidate.name}`);
  }
  renderUsers();
}
window.seedSamplePendingUser = seedSamplePendingUser;

function updatePendingBanners() {
  try {
    const users = getSystemUsers();
    const pending = users.filter(u => u.status === 'pending_approval' || u.status === 'pending');
    const pendingCount = pending.length;
    const subText = `${pendingCount} registration request(s) awaiting administrative review and approval.`;

    const oBanner = document.getElementById('hrOverviewPendingBanner');
    const oSub = document.getElementById('hrOverviewPendingSub');
    if (oBanner) {
      oBanner.style.display = pendingCount > 0 ? 'flex' : 'none';
      if (oSub) oSub.textContent = subText;
    }

    const metricEl = document.getElementById('metricPendingUsers');
    if (metricEl) metricEl.textContent = pendingCount;
  } catch(e) {
    console.warn('Error updating pending banners:', e);
  }
}
window.updatePendingBanners = updatePendingBanners;

/* -------------------------------------------------------------
   SECTION: NATIVE STAFF APPRAISALS & PERFORMANCE SCORECARD
------------------------------------------------------------- */
function getAppraisalReviews() {
  try {
    let revs = read(PERF_KEY);
    if (!Array.isArray(revs) || revs.length === 0) {
      revs = [
        { teacherName: "James Ntiamoah", department: "Executive & Design", position: "Creative Director", kpi: 98, rating: "4.9", grade: "Exceptional", date: "2026-08-15", notes: "Exemplary creative direction and brand leadership across enterprise campaigns." },
        { teacherName: "Ama Serwaa", department: "Operations", position: "HR Manager", kpi: 95, rating: "4.8", grade: "Exceeds Standards", date: "2026-08-18", notes: "Exceptional personnel management and streamlined onboarding workflow." },
        { teacherName: "Kwame Boateng", department: "Academic Staff", position: "Lead Instructor", kpi: 94, rating: "4.7", grade: "Exceeds Standards", date: "2026-08-20", notes: "Curriculum delivery benchmarks exceeded; consistently high student engagement." },
        { teacherName: "Abena Mansa", department: "Finance", position: "Chief Accountant", kpi: 96, rating: "4.8", grade: "Exceeds Standards", date: "2026-08-22", notes: "Flawless audit reconciliation and timely payroll disbursements." },
        { teacherName: "Kofi Owusu", department: "Digital Media", position: "Senior Designer", kpi: 91, rating: "4.6", grade: "Strong Delivery", date: "2026-08-25", notes: "High creative throughput across institutional media projects." },
        { teacherName: "Esi Badu", department: "Academic Staff", position: "Science Educator", kpi: 92, rating: "4.7", grade: "Strong Delivery", date: "2026-08-28", notes: "Positive student satisfaction and excellent lab course evaluations." }
      ];
      save(PERF_KEY, revs);
    }
    return revs;
  } catch(e) {
    return [];
  }
}

function renderAppraisalsSection() {
  const revs = getAppraisalReviews();
  const staffList = read(EMP_KEY) || [];

  // Compute metrics
  const totalReviews = revs.length;
  let avgRating = "4.8";
  let avgKpi = "94.2";
  if (totalReviews > 0) {
    const sumRating = revs.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0);
    const sumKpi = revs.reduce((acc, r) => acc + (parseFloat(r.kpi) || 0), 0);
    avgRating = (sumRating / totalReviews).toFixed(1);
    avgKpi = (sumKpi / totalReviews).toFixed(1);
  }

  const avgEl = document.getElementById('apprKpiAvg');
  const compEl = document.getElementById('apprKpiCompliance');
  const countEl = document.getElementById('apprKpiCompleted');
  const deptEl = document.getElementById('apprKpiTopDept');

  if (avgEl) avgEl.textContent = `${avgRating} / 5.0`;
  if (compEl) compEl.textContent = `${avgKpi}%`;
  if (countEl) countEl.textContent = `${totalReviews} / ${Math.max(totalReviews, staffList.length)}`;
  if (deptEl && revs.length > 0) {
    const top = [...revs].sort((a,b) => (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0))[0];
    if (top) deptEl.textContent = top.department;
  }

  renderAppraisalsTable();
}

function renderAppraisalsTable() {
  const revs = getAppraisalReviews();
  const search = (document.getElementById('searchAppraisal')?.value || '').trim().toLowerCase();
  const gradeFilter = document.getElementById('filterAppraisalGrade')?.value || '';

  const filtered = revs.filter(r => {
    const matchSearch = !search ||
      (r.teacherName || '').toLowerCase().includes(search) ||
      (r.department || '').toLowerCase().includes(search) ||
      (r.position || '').toLowerCase().includes(search);
    const matchGrade = !gradeFilter || (r.grade || '').toLowerCase() === gradeFilter.toLowerCase();
    return matchSearch && matchGrade;
  });

  const tbody = document.getElementById('appraisalsTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--muted);">No matching appraisal records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((r, i) => {
    const teacherName = escapeHtml(r.teacherName || 'Staff Member');
    const department = escapeHtml(r.department || 'General');
    const position = escapeHtml(r.position || 'Instructor');
    const kpi = Math.min(100, Math.max(0, parseInt(r.kpi) || 90));
    const rating = r.rating || '4.5';
    const grade = r.grade || 'Strong Delivery';
    const date = r.date || 'Recent';
    const origIdx = revs.indexOf(r);

    let gradeClass = 'grade-strong';
    if (grade.includes('Exceptional')) gradeClass = 'grade-exceptional';
    else if (grade.includes('Exceeds')) gradeClass = 'grade-exceeds';
    else if (grade.includes('Meets')) gradeClass = 'grade-meets';

    // Star icon rendering
    const starCount = Math.floor(parseFloat(rating));
    const hasHalf = parseFloat(rating) % 1 >= 0.5;
    let starsHtml = '';
    for (let s = 0; s < 5; s++) {
      if (s < starCount) starsHtml += '<i class="fa-solid fa-star"></i>';
      else if (s === starCount && hasHalf) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
      else starsHtml += '<i class="fa-regular fa-star" style="opacity:0.35;"></i>';
    }

    return `
      <tr>
        <td style="color:var(--muted); font-weight:600;">${i + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="user-avatar-badge" style="width:36px; height:36px; border-radius:10px; background:rgba(99,91,252,0.12); color:var(--primary); font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <div style="font-weight:700; color:var(--text); font-size:13.5px;">${teacherName}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12px; color:var(--muted);">${department}</span></td>
        <td><span style="font-weight:600; font-size:13px;">${position}</span></td>
        <td style="min-width:160px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px;">
            <span>${kpi}%</span>
          </div>
          <div class="progress-track">
            <div style="height:100%; width:${kpi}%; background:linear-gradient(90deg, #635bfc, #10b981); border-radius:9999px;"></div>
          </div>
        </td>
        <td>
          <div class="stars">
            ${starsHtml}
            <span style="font-size:12px; font-weight:800; color:var(--text); margin-left:6px;">${rating}</span>
          </div>
        </td>
        <td><span class="appraisal-grade-pill ${gradeClass}">${grade}</span></td>
        <td><span style="color:var(--muted); font-size:12px;">${date}</span></td>
        <td style="text-align:right;">
          <button type="button" class="btn ghost btn-sm" onclick="openAppraisalModal(${origIdx})" style="padding:4px 10px; font-size:11.5px; font-weight:700; color:var(--primary);">
            <i class="fa-solid fa-pen-to-square"></i> Review
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateAppraisalStaffPreview() {
  const teacherSelect = document.getElementById('apprTeacher');
  if (!teacherSelect) return;
  const staffName = teacherSelect.value;
  const staffList = read(EMP_KEY) || [];
  const emp = staffList.find(s => (s.name || s.fullName) === staffName);

  const previewName = document.getElementById('apprPreviewName');
  const previewDept = document.getElementById('apprPreviewDept');
  const previewRole = document.getElementById('apprPreviewRole');
  const previewAvatar = document.getElementById('apprPreviewAvatar');

  if (previewName) previewName.textContent = staffName || 'Staff Member';
  if (previewDept) previewDept.textContent = emp ? (emp.dept || emp.department || 'Academic Staff') : 'Executive & Design';
  if (previewRole) previewRole.textContent = emp ? (emp.role || emp.position || 'Staff Instructor') : 'Creative Director';
  if (previewAvatar) {
    const initials = (staffName || 'Staff Member').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    previewAvatar.textContent = initials || 'HR';
  }
}

function updateAppraisalKpiVisual(val) {
  let num = parseInt(val);
  if (isNaN(num)) num = 0;
  if (num < 0) num = 0;
  if (num > 100) num = 100;

  const badge = document.getElementById('apprKpiBadge');
  const bar = document.getElementById('apprKpiProgressBar');
  if (badge) badge.textContent = `${num}%`;
  if (bar) {
    bar.style.width = `${num}%`;
    if (num >= 90) {
      bar.style.background = 'linear-gradient(90deg, #635bfc, #10b981)';
    } else if (num >= 75) {
      bar.style.background = 'linear-gradient(90deg, #3b82f6, #635bfc)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }
  }
}

function setAppraisalKpi(val) {
  const input = document.getElementById('apprKpi');
  if (input) {
    input.value = val;
    updateAppraisalKpiVisual(val);
  }
}

function updateAppraisalRatingVisual(val) {
  const num = parseFloat(val) || 4.0;
  const pill = document.getElementById('apprGradePill');
  const starsEl = document.getElementById('apprRatingStars');
  const textEl = document.getElementById('apprRatingText');

  let gradeText = 'MEETS STANDARDS';
  let gradeClass = 'grade-meets';
  if (num >= 4.9) {
    gradeText = 'EXCEPTIONAL';
    gradeClass = 'grade-exceptional';
  } else if (num >= 4.5) {
    gradeText = 'EXCEEDS STANDARDS';
    gradeClass = 'grade-exceeds';
  } else if (num >= 4.0) {
    gradeText = 'STRONG DELIVERY';
    gradeClass = 'grade-strong';
  } else {
    gradeText = 'DEVELOPING';
    gradeClass = 'grade-developing';
  }

  if (pill) {
    pill.textContent = gradeText;
    pill.className = `appraisal-grade-pill ${gradeClass}`;
  }

  if (textEl) textEl.textContent = `${num.toFixed(1)} / 5.0`;

  if (starsEl) {
    const starCount = Math.floor(num);
    const hasHalf = (num % 1) >= 0.5;
    let starsHtml = '';
    for (let s = 0; s < 5; s++) {
      if (s < starCount) starsHtml += '<i class="fa-solid fa-star"></i>';
      else if (s === starCount && hasHalf) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
      else starsHtml += '<i class="fa-regular fa-star" style="opacity:0.35;"></i>';
    }
    starsEl.innerHTML = starsHtml;
  }
}

function openAppraisalModal(idx = null) {
  const staffList = read(EMP_KEY) || [];
  const teacherSelect = document.getElementById('apprTeacher');
  if (teacherSelect) {
    teacherSelect.innerHTML = '';
    if (staffList.length === 0) {
      teacherSelect.innerHTML = '<option value="James Ntiamoah">James Ntiamoah (Executive & Design)</option>';
    } else {
      staffList.forEach(e => {
        const name = e.name || e.fullName || 'Staff Member';
        const dept = e.dept || e.department || 'Academic';
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = `${name} (${dept})`;
        teacherSelect.appendChild(opt);
      });
    }
  }

  const form = document.getElementById('appraisalForm');
  const title = document.getElementById('appraisalModalTitle');

  if (idx !== null && idx !== undefined) {
    const revs = getAppraisalReviews();
    const r = revs[idx];
    if (r) {
      if (title) title.textContent = `Update Appraisal: ${r.teacherName}`;
      if (teacherSelect) teacherSelect.value = r.teacherName;
      document.getElementById('apprKpi').value = r.kpi || 90;
      document.getElementById('apprRating').value = r.rating || '4.8';
      document.getElementById('apprNotes').value = r.notes || '';
      const goalsEl = document.getElementById('apprGoals');
      if (goalsEl) goalsEl.value = r.goals || '';
      if (form) form.dataset.editIndex = idx;
      updateAppraisalKpiVisual(r.kpi || 90);
      updateAppraisalRatingVisual(r.rating || '4.8');
      updateAppraisalStaffPreview();
    }
  } else {
    if (title) title.textContent = 'Staff Appraisal Entry';
    if (form) {
      form.reset();
      delete form.dataset.editIndex;
    }
    document.getElementById('apprKpi').value = 95;
    document.getElementById('apprRating').value = '4.8';
    const goalsEl = document.getElementById('apprGoals');
    if (goalsEl) goalsEl.value = '';
    updateAppraisalKpiVisual(95);
    updateAppraisalRatingVisual('4.8');
    updateAppraisalStaffPreview();
  }

  const modal = document.getElementById('appraisalModal');
  if (modal) modal.style.display = 'flex';
}

function closeAppraisalModal() {
  const modal = document.getElementById('appraisalModal');
  if (modal) modal.style.display = 'none';
}

function handleSaveAppraisal(e) {
  if (e && e.preventDefault) e.preventDefault();
  const revs = getAppraisalReviews();
  const staffList = read(EMP_KEY) || [];

  const teacherSelect = document.getElementById('apprTeacher');
  const teacherName = teacherSelect ? teacherSelect.value.trim() : '';
  const kpiVal = document.getElementById('apprKpi')?.value.trim();
  const kpi = parseInt(kpiVal);
  const rating = document.getElementById('apprRating')?.value || '4.8';
  const notes = (document.getElementById('apprNotes')?.value || '').trim();
  const goals = (document.getElementById('apprGoals')?.value || '').trim();

  // VALIDATION 1: Staff Selection
  if (!teacherName) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'Staff Appraisal Certification',
        'No personnel member was selected for this evaluation scorecard.',
        'Please select a staff member from the authorized roster to certify their performance.',
        [
          '1. Click on the "Personnel / Staff Member" dropdown.',
          '2. Select an active personnel profile.',
          '3. Review the live identity card before saving.'
        ],
        '#apprTeacher'
      );
    } else {
      showToast('Please select a staff member to evaluate', 'warning');
    }
    return;
  }

  // VALIDATION 2: KPI Goal Completion Index
  if (isNaN(kpi) || kpi < 0 || kpi > 100) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'KPI Metric Incomplete',
        'KPI completion index must be a valid percentage between 0% and 100%.',
        'Enter an achievement percentage or click one of the quick benchmark presets (75%, 85%, 95%, 100%).',
        [
          '1. Focus the KPI Goal Completion field or click a preset badge.',
          '2. Verify the progress meter reflects your benchmark.',
          '3. Ensure the value does not exceed 100%.'
        ],
        '#apprKpi'
      );
    } else {
      showToast('KPI Completion % must be between 0 and 100', 'warning');
    }
    return;
  }

  // VALIDATION 3: Qualitative Appraisal Highlights
  if (!notes) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'Appraisal Summary Missing',
        'Qualitative justification and performance highlights are required for certification.',
        'Provide a concise summary of the staff member\'s key contributions and accomplishments.',
        [
          '1. Click the "Key Strengths & High-Impact Contributions" text area.',
          '2. Enter 1 to 2 sentences summarizing project delivery or pedagogical impact.',
          '3. Click "Certify & Save Appraisal" to finalize.'
        ],
        '#apprNotes'
      );
    } else {
      showToast('Please enter appraisal key highlights', 'warning');
    }
    return;
  }

  const matched = staffList.find(s => (s.name || s.fullName) === teacherName);
  const numRating = parseFloat(rating);

  let grade = 'Strong Delivery';
  if (numRating >= 4.9) grade = 'Exceptional';
  else if (numRating >= 4.5) grade = 'Exceeds Standards';
  else if (numRating >= 4.0) grade = 'Strong Delivery';
  else grade = 'Meets Standards';

  const form = document.getElementById('appraisalForm');
  const editIdx = form && form.dataset.editIndex;
  const today = new Date().toISOString().split('T')[0];

  const entry = {
    teacherName: teacherName,
    department: matched ? (matched.dept || matched.department || 'Academic Staff') : 'Executive & Design',
    position: matched ? (matched.role || matched.position || 'Staff Instructor') : 'Instructor',
    kpi: kpi,
    rating: rating,
    grade: grade,
    date: today,
    notes: notes,
    goals: goals
  };

  if (editIdx !== undefined && editIdx !== null && editIdx !== '') {
    revs[parseInt(editIdx)] = entry;
  } else {
    const existingIdx = revs.findIndex(r => r.teacherName === teacherName);
    if (existingIdx >= 0) {
      revs[existingIdx] = entry;
    } else {
      revs.unshift(entry);
    }
  }

  save(PERF_KEY, revs);
  closeAppraisalModal();
  renderAppraisalsSection();

  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success('Appraisal Certified & Saved', `Official performance evaluation record certified for ${teacherName}.`);
  } else {
    showToast(`Appraisal recorded for ${teacherName}`);
  }
}
window.renderAppraisalsSection = renderAppraisalsSection;
window.renderAppraisalsTable = renderAppraisalsTable;
window.openAppraisalModal = openAppraisalModal;
window.closeAppraisalModal = closeAppraisalModal;
window.handleSaveAppraisal = handleSaveAppraisal;
window.updateAppraisalStaffPreview = updateAppraisalStaffPreview;
window.updateAppraisalKpiVisual = updateAppraisalKpiVisual;
window.setAppraisalKpi = setAppraisalKpi;
window.updateAppraisalRatingVisual = updateAppraisalRatingVisual;
window.updatePendingBanners = updatePendingBanners;

function openUserModal(userEmail = null) {
  const modal = document.getElementById('userModal');
  if (!modal) return;

  const form = document.getElementById('userAccountForm');
  if (form) form.reset();

  const titleEl = document.getElementById('userModalTitle');
  const staffSelect = document.getElementById('um_linkedStaff');
  const passReq = document.getElementById('um_passReq');
  const passHint = document.getElementById('um_passHint');

  // Populate staff select
  if (staffSelect) {
    const staffList = read(EMP_KEY) || [];
    staffSelect.innerHTML = '<option value="">-- Standalone User (No Linked Staff) --</option>' + 
      staffList.map(emp => `<option value="${emp.id}">${escapeHtml(emp.name || emp.fullName)} (${escapeHtml(emp.role || emp.position || 'Staff')})</option>`).join('');
  }

  let user = null;
  if (userEmail) {
    const allUsers = getSystemUsers();
    user = allUsers.find(u => (u.email || '').toLowerCase() === userEmail.toLowerCase());
  }

  if (user) {
    if (titleEl) titleEl.textContent = 'Edit User Account & Access';
    document.getElementById('editUserOriginalEmail').value = user.email;
    document.getElementById('um_name').value = user.name || '';
    document.getElementById('um_email').value = user.email || '';
    document.getElementById('um_role').value = (user.role || 'teacher').toLowerCase();
    document.getElementById('um_status').value = user.status || 'active';
    document.getElementById('um_password').value = '';
    if (user.linkedStaffId && staffSelect) staffSelect.value = user.linkedStaffId;
    if (passReq) passReq.style.display = 'none';
    if (passHint) passHint.textContent = 'Leave password blank to preserve current password.';
  } else {
    if (titleEl) titleEl.textContent = 'Create New User Account';
    document.getElementById('editUserOriginalEmail').value = '';
    document.getElementById('um_name').value = '';
    document.getElementById('um_email').value = '';
    document.getElementById('um_role').value = 'teacher';
    document.getElementById('um_status').value = 'active';
    document.getElementById('um_password').value = 'Flawless@' + Math.floor(1000 + Math.random() * 9000);
    if (passReq) passReq.style.display = 'inline';
    if (passHint) passHint.textContent = 'Auto-generated secure initial password. Staff can change upon login.';
  }

  modal.classList.add('active');
  setTimeout(() => document.getElementById('um_name')?.focus(), 100);
}

function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (modal) modal.classList.remove('active');
  const form = document.getElementById('userAccountForm');
  if (form) form.reset();
}

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'Flawless@';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const el = document.getElementById('um_password');
  if (el) el.value = pass;
  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Password Generated', `Initial password: ${pass}`);
  }
}

function handleUserStaffLinkChange(staffId) {
  if (!staffId) return;
  const staffList = read(EMP_KEY) || [];
  const emp = staffList.find(e => e.id === staffId);
  if (emp) {
    const nameEl = document.getElementById('um_name');
    const emailEl = document.getElementById('um_email');
    const roleEl = document.getElementById('um_role');
    if (nameEl && !nameEl.value) nameEl.value = emp.name || emp.fullName || '';
    if (emailEl && !emailEl.value) emailEl.value = emp.email || '';
    
    // Auto-detect matching role
    if (roleEl) {
      const pos = (emp.position || emp.role || emp.department || '').toLowerCase();
      if (pos.includes('director') || pos.includes('admin') || pos.includes('head')) roleEl.value = 'admin';
      else if (pos.includes('hr') || pos.includes('human')) roleEl.value = 'hr';
      else if (pos.includes('account') || pos.includes('finance') || pos.includes('bursar')) roleEl.value = 'finance';
      else roleEl.value = 'teacher';
    }
  }
}

async function saveUserAccountForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const originalEmail = document.getElementById('editUserOriginalEmail')?.value.trim().toLowerCase();
  const name = document.getElementById('um_name')?.value.trim();
  const email = document.getElementById('um_email')?.value.trim().toLowerCase();
  const role = document.getElementById('um_role')?.value || 'teacher';
  const pass = document.getElementById('um_password')?.value.trim();
  const status = document.getElementById('um_status')?.value || 'active';
  const linkedStaffId = document.getElementById('um_linkedStaff')?.value || null;

  if (!name) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'User Account Profile',
        'Full Name is required to establish user identity.',
        'Enter the personnel member\'s formal name or link a staff profile to auto-fill.',
        [
          '1. Focus the "Full Name" input field.',
          '2. Enter the personnel member\'s name.',
          '3. Or choose an employee from "Link to Staff Member".'
        ],
        '#um_name'
      );
    } else {
      showToast('Full Name is required', 'warning');
    }
    return;
  }

  if (!email) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'User Account Security',
        'A valid email address is mandatory for authentication access.',
        'Enter an official school or institutional email address.',
        [
          '1. Click into the "Email Address" field.',
          '2. Type the user\'s login email address.',
          '3. Save the account credentials.'
        ],
        '#um_email'
      );
    } else {
      showToast('Email address is required', 'warning');
    }
    return;
  }

  if (!originalEmail && !pass) {
    if (typeof window.showActionSolutionToast === 'function') {
      window.showActionSolutionToast(
        'Account Credentials',
        'An initial temporary password is required for newly created accounts.',
        'Enter a password or click the Auto-Generate button to produce a strong password.',
        [
          '1. Focus the password field or click "Auto-Generate".',
          '2. Confirm the initial credentials.',
          '3. Save the account.'
        ],
        '#um_password'
      );
    } else {
      showToast('Password is required for new accounts', 'warning');
    }
    return;
  }

  let users = getSystemUsers();

  // Check email uniqueness if new or email changed
  if (originalEmail !== email && users.some(u => (u.email || '').toLowerCase() === email)) {
    if (window.Toaster && typeof window.Toaster.error === 'function') {
      window.Toaster.error('Email Conflict', `An account with ${email} already exists.`);
    } else {
      showToast(`User with ${email} already exists`, 'error');
    }
    return;
  }

  // Hash password with SHA-256 (compatible with login.js)
  async function sha256(message) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch(err) {
      return message;
    }
  }

  let hashedPass = null;
  if (pass) {
    hashedPass = await sha256(pass);
  }

  if (originalEmail) {
    // Edit existing user
    const idx = users.findIndex(u => (u.email || '').toLowerCase() === originalEmail);
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].email = email;
      users[idx].role = role;
      users[idx].status = status;
      users[idx].linkedStaffId = linkedStaffId;
      users[idx].updatedAt = Date.now();
      if (hashedPass) {
        users[idx].pass = hashedPass;
        users[idx].rawPassPreview = pass;
      }
    }
    if (window.Toaster && typeof window.Toaster.success === 'function') {
      window.Toaster.success('User Account Updated', `Profile and permissions for ${name} (${email}) saved.`);
    } else {
      showToast(`User ${name} updated successfully!`);
    }
  } else {
    // New user
    users.unshift({
      id: 'u_' + Date.now(),
      org: ACTIVE_ORG,
      name: name,
      email: email,
      role: role,
      status: status,
      pass: hashedPass,
      rawPassPreview: pass,
      linkedStaffId: linkedStaffId,
      createdAt: Date.now()
    });
    if (window.Toaster && typeof window.Toaster.success === 'function') {
      window.Toaster.success('User Account Created', `New portal account created for ${name} [${role.toUpperCase()}].`);
    } else {
      showToast(`User ${name} created successfully!`);
    }
  }

  save(USERS_STORAGE_KEY, users);
  closeUserModal();
  renderUsers();
}

function editUser(email) {
  let users = getSystemUsers();
  const target = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (target && (target.role === 'admin' || (target.email || '').toLowerCase() === 'admin@flawlessgraphics.com')) {
    if (typeof window.showWarningToast === 'function') {
      window.showWarningToast(
        'Super Administrator Protected',
        'Root Super Administrator accounts cannot be modified from the HR Dashboard. Please sign in to the dedicated Super Admin Portal (pages/admin/admin-dashboard.html).',
        { target: '#usersSection' }
      );
    } else {
      showToast('Super Admin accounts must be managed from the Super Admin Portal', 'warning');
    }
    return;
  }
  openUserModal(email);
}

function toggleUserStatus(email) {
  let users = getSystemUsers();
  const user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!user) return;

  if (user.role === 'admin' || (user.email || '').toLowerCase() === 'admin@flawlessgraphics.com') {
    if (typeof window.showWarningToast === 'function') {
      window.showWarningToast(
        'Super Administrator Protected',
        'Root Super Administrator status is locked and cannot be suspended from the HR Dashboard.',
        { target: '#usersSection' }
      );
    } else {
      showToast('Cannot suspend Super Admin account', 'warning');
    }
    return;
  }

  const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
  user.status = newStatus;
  save(USERS_STORAGE_KEY, users);
  renderUsers();

  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Access Status Changed', `${user.name}'s account is now ${newStatus.toUpperCase()}.`);
  } else {
    showToast(`Account status set to ${newStatus}`);
  }
}

function deleteUserAccount(email) {
  let users = getSystemUsers();
  const target = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (target && (target.role === 'admin' || (target.email || '').toLowerCase() === 'admin@flawlessgraphics.com')) {
    if (typeof window.showWarningToast === 'function') {
      window.showWarningToast(
        'Super Administrator Protected',
        'Root Super Administrator accounts cannot be deleted by HR. Super Admin access must be managed via pages/admin/admin-dashboard.html.',
        { target: '#usersSection' }
      );
    } else {
      showToast('Cannot delete Super Admin account', 'warning');
    }
    return;
  }

  if (!confirm(`Are you sure you want to delete portal access account for (${email})?`)) return;
  users = users.filter(u => (u.email || '').toLowerCase() !== email.toLowerCase());
  save(USERS_STORAGE_KEY, users);
  renderUsers();

  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('User Removed', `Account ${email} has been permanently deleted.`);
  } else {
    showToast(`User ${email} deleted.`);
  }
}

function syncStaffToUsers() {
  const staffList = read(EMP_KEY) || [];
  let users = getSystemUsers();
  let addedCount = 0;

  staffList.forEach(emp => {
    if (!emp.email) return;
    const empEmail = emp.email.trim().toLowerCase();
    const exists = users.some(u => (u.email || '').toLowerCase() === empEmail);
    if (!exists) {
      const pos = (emp.position || emp.role || emp.department || '').toLowerCase();
      let assignedRole = 'teacher';
      if (pos.includes('director') || pos.includes('head') || pos.includes('admin')) assignedRole = 'admin';
      else if (pos.includes('hr') || pos.includes('human')) assignedRole = 'hr';
      else if (pos.includes('finance') || pos.includes('account') || pos.includes('bursar')) assignedRole = 'finance';

      users.push({
        id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        org: ACTIVE_ORG,
        name: emp.name || emp.fullName || empEmail.split('@')[0],
        email: empEmail,
        role: assignedRole,
        status: 'active',
        pass: 'Flawless@2026',
        linkedStaffId: emp.id,
        createdAt: Date.now()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    save(USERS_STORAGE_KEY, users);
    renderUsers();
    if (window.Toaster && typeof window.Toaster.success === 'function') {
      window.Toaster.success('Staff Accounts Provisioned', `${addedCount} new staff members now have portal login access.`);
    } else {
      showToast(`${addedCount} staff accounts provisioned!`);
    }
  } else {
    if (window.Toaster && typeof window.Toaster.info === 'function') {
      window.Toaster.info('Already Synchronized', 'All registered staff members already have portal user accounts.');
    } else {
      showToast('All staff already have portal accounts.');
    }
  }
}

function provisionUserForStaff(staffId) {
  const staffList = read(EMP_KEY) || [];
  const emp = staffList.find(e => e.id === staffId);
  if (!emp) return;

  const users = getSystemUsers();
  const existingUser = users.find(u => (u.email || '').toLowerCase() === (emp.email || '').toLowerCase());
  if (existingUser) {
    openUserModal(existingUser.email);
  } else {
    openUserModal();
    const nameEl = document.getElementById('um_name');
    const emailEl = document.getElementById('um_email');
    const roleEl = document.getElementById('um_role');
    const staffSelect = document.getElementById('um_linkedStaff');
    if (nameEl) nameEl.value = emp.name || emp.fullName || '';
    if (emailEl) emailEl.value = emp.email || '';
    if (staffSelect) staffSelect.value = emp.id;
    if (roleEl) {
      const pos = (emp.position || emp.role || emp.department || '').toLowerCase();
      if (pos.includes('director') || pos.includes('head') || pos.includes('admin')) roleEl.value = 'admin';
      else if (pos.includes('hr') || pos.includes('human')) roleEl.value = 'hr';
      else if (pos.includes('finance') || pos.includes('account') || pos.includes('bursar')) roleEl.value = 'finance';
      else roleEl.value = 'teacher';
    }
  }
}

// User Modal backdrop dismiss
document.getElementById('userModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'userModal') closeUserModal();
});

/* -------------------------------------------------------------
   SECTION 4: DIRECT MESSAGING
------------------------------------------------------------- */
let activeChatEmpId = null;

function renderMsgUsers() {
  const teachers = read(EMP_KEY);
  const filter = (document.getElementById('msgSearchInput')?.value || '').toLowerCase();
  const list = document.getElementById('msgUserList');
  list.innerHTML = '';

  const filtered = teachers.filter(e =>
    (e.name || '').toLowerCase().includes(filter) || (e.role || '').toLowerCase().includes(filter)
  );

  filtered.forEach(e => {
    const item = document.createElement('div');
    item.className = `msg-user-item ${e.id === activeChatEmpId ? 'active' : ''}`;
    item.onclick = () => selectChatUser(e.id);
    item.innerHTML = `
      <img src="${e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" class="avatar">
      <div class="msg-user-info">
        <div class="msg-user-name">${escapeHtml(e.name)}</div>
        <div class="msg-user-role">${escapeHtml(e.role)}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function selectChatUser(empId) {
  activeChatEmpId = empId;
  const teachers = read(EMP_KEY);
  const emp = teachers.find(e => e.id === empId);
  if (!emp) return;

  renderMsgUsers();

  const header = document.getElementById('msgChatHeader');
  header.innerHTML = `
    <img src="${emp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" class="profile-thumb" style="width:34px;height:34px;border-radius:50%">
    <div>
      <div style="font-size:14px;font-weight:700">${escapeHtml(emp.name)}</div>
      <div class="small">${escapeHtml(emp.role)} • ${escapeHtml(emp.dept)}</div>
    </div>
  `;

  document.getElementById('msgInputArea').style.display = 'flex';
  renderChatHistory();
}

function openChatWith(empId) {
  showSection('messages');
  selectChatUser(empId);
}

function getChatKey(empId) {
  return `${MSG_KEY}_chat_${empId}`;
}

function renderChatHistory() {
  if (!activeChatEmpId) return;
  let history = read(getChatKey(activeChatEmpId));
  const container = document.getElementById('msgChatHistory');
  container.innerHTML = '';

  if (history.length === 0) {
    history = [
      { sender: 'user', text: `Hello HR Desk! Hope you are having a productive week.`, time: '09:15 AM' }
    ];
    save(getChatKey(activeChatEmpId), history);
  }

  history.forEach(m => {
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${m.sender === 'hr' ? 'sent' : 'received'}`;
    bubble.innerHTML = `
      <div>${escapeHtml(m.text)}</div>
      <div class="msg-time">${m.time}</div>
    `;
    container.appendChild(bubble);
  });
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !activeChatEmpId) return;

  const chatKey = getChatKey(activeChatEmpId);
  const history = read(chatKey);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  history.push({ sender: 'hr', text, time });
  save(chatKey, history);
  input.value = '';
  renderChatHistory();

  // Simulated auto-reply
  setTimeout(() => {
    const updated = read(chatKey);
    updated.push({
      sender: 'user',
      text: `Thank you for reaching out. Acknowledging your note and updating our schedule accordingly.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    save(chatKey, updated);
    if (activeChatEmpId) renderChatHistory();
  }, 1000);
}

/* -------------------------------------------------------------
   SECTION 5: ATTENDANCE OPERATIONS
------------------------------------------------------------- */
const attDateInput = document.getElementById('attDate');
if (attDateInput && !attDateInput.value) {
  attDateInput.value = new Date().toISOString().split('T')[0];
}
attDateInput?.addEventListener('change', renderAttendance);

function renderAttendance() {
  const dateVal = attDateInput.value || new Date().toISOString().split('T')[0];
  const teachers = read(EMP_KEY);
  let records = read(ATT_KEY);
  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = '';

  teachers.forEach(emp => {
    let rec = records.find(r => r.empId === emp.id && r.date === dateVal);
    if (!rec) {
      rec = { empId: emp.id, date: dateVal, status: 'Present', time: '08:00 AM' };
      records.push(rec);
    }

    const badgeClass = rec.status === 'Present' ? 'badge-green' : rec.status === 'Late' ? 'badge-orange' : 'badge-red';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:700">${escapeHtml(emp.name)}</td>
      <td><span class="badge-pill badge-purple">${escapeHtml(emp.dept)}</span></td>
      <td><span class="badge-pill ${badgeClass}">${rec.status}</span></td>
      <td style="color:var(--muted)">${rec.time || '—'}</td>
      <td>
        <button class="btn ghost" style="padding:4px 8px;font-size:11px" onclick="toggleAttendanceStatus('${emp.id}')">
          <i class="fa-solid fa-arrows-rotate"></i> Change Status
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  save(ATT_KEY, records);
  renderDashboard();
}

function toggleAttendanceStatus(empId) {
  const dateVal = attDateInput.value;
  let records = read(ATT_KEY);
  const idx = records.findIndex(r => r.empId === empId && r.date === dateVal);
  if (idx !== -1) {
    const states = ['Present', 'Late', 'Absent'];
    const currentIdx = states.indexOf(records[idx].status);
    records[idx].status = states[(currentIdx + 1) % states.length];
    save(ATT_KEY, records);
    renderAttendance();
    showToast(`Status updated to ${records[idx].status}`);
  }
}

document.getElementById('markAllPresentBtn')?.addEventListener('click', () => {
  const dateVal = attDateInput.value;
  const teachers = read(EMP_KEY);
  let records = read(ATT_KEY);

  teachers.forEach(emp => {
    const idx = records.findIndex(r => r.empId === emp.id && r.date === dateVal);
    if (idx !== -1) {
      records[idx].status = 'Present';
      records[idx].time = '08:00 AM';
    } else {
      records.push({ empId: emp.id, date: dateVal, status: 'Present', time: '08:00 AM' });
    }
  });

  save(ATT_KEY, records);
  renderAttendance();
  showToast('All personnel marked Present');
});

/* -------------------------------------------------------------
   SECTION 6: PAYROLL SIMULATOR
------------------------------------------------------------- */
/* ─── PAYROLL SECTION (merged from payroll.html) ─── */
let payChartInstance = null;

function initPayrollSection() {
  // Set active month label
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date();
  const el = document.getElementById('pay_activeMonthStr');
  if (el) el.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  renderPayrollLedger();
}

function renderPayrollLedger() {
  const teachers = read(EMP_KEY);
  const tbody = document.getElementById('pay_payrollTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totalGross = 0, totalTax = 0, totalPension = 0, totalNet = 0;
  const deptSums = {};

  teachers.forEach((emp, i) => {
    const gross   = Number(emp.salary || emp.fullSalary || 0);
    const tax     = Math.round(gross * 0.13);
    const pension = Math.round(gross * 0.055);
    const net     = gross - tax - pension;

    totalGross   += gross;
    totalTax     += tax;
    totalPension += pension;
    totalNet     += net;

    const dept = emp.department || emp.dept || 'General';
    deptSums[dept] = (deptSums[dept] || 0) + gross;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--muted);font-weight:600">${i + 1}</td>
      <td>
        <div style="font-weight:700;color:var(--text)">${escapeHtml(emp.fullName || emp.name || '—')}</div>
        <div style="font-size:11px;color:var(--muted)">${escapeHtml(emp.email || '')}</div>
      </td>
      <td><span class="badge-pill badge-info">${escapeHtml(dept)}</span></td>
      <td style="font-weight:700;color:var(--text)">GHS ${gross.toLocaleString()}</td>
      <td style="color:#ef4444;font-weight:600">- GHS ${tax.toLocaleString()}</td>
      <td style="color:#f59e0b;font-weight:600">- GHS ${pension.toLocaleString()}</td>
      <td style="font-weight:800;color:#10b981">GHS ${net.toLocaleString()}</td>
      <td><span class="badge-pill badge-success"><i class="fa-solid fa-check"></i> Approved</span></td>
      <td style="text-align:right">
        <button type="button" onclick="openEmbeddedPayslip('${escapeHtml(emp.fullName || emp.name || '').replace(/'/g, "\\'")}')" class="btn-modern btn-secondary btn-sm">
          <i class="fa-solid fa-receipt"></i> Payslip
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update KPIs
  const kpis = { pay_kpiGross: totalGross, pay_kpiTax: totalTax, pay_kpiPension: totalPension, pay_kpiNet: totalNet };
  Object.entries(kpis).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `GHS ${val.toLocaleString()}`;
  });

  // Render chart
  renderPayrollChart(deptSums);
}

function renderPayrollChart(deptSums) {
  if (!window.Chart) return;
  const canvas = document.getElementById('pay_payrollChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (payChartInstance) payChartInstance.destroy();

  const textColor = '#64748B';


  payChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(deptSums),
      datasets: [{
        label: 'Department Expenditure (GHS)',
        data: Object.values(deptSums),
        backgroundColor: ['#635bfc','#06B6D4','#8B5CF6','#10B981','#F59E0B','#EF4444'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } } },
        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
      }
    }
  });
}

function runPayrollBatch() {
  const btn = document.getElementById('pay_batchBtn');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Wire Transfers...';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check-double"></i> Batch Successfully Disbursed';
    showToast('All teacher net payrolls wired successfully!');
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Process Batch Disbursement';
    }, 4000);
  }, 1400);
}

function exportPayrollLedgerCSV() {
  const teachers = read(EMP_KEY);
  let csv = 'Full Name,Email,Department,Gross Salary,Tax (PAYE),Pension (SSNIT),Net Payout,Status\n';
  teachers.forEach(emp => {
    const gross = Number(emp.salary || 0);
    const tax   = Math.round(gross * 0.13);
    const pen   = Math.round(gross * 0.055);
    const net   = gross - tax - pen;
    const q = v => `"${String(v || '').replace(/"/g, '""')}"`;
    csv += [emp.fullName||emp.name, emp.email, emp.department||emp.dept, gross, tax, pen, net, 'Disbursed'].map(q).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `payroll_${ACTIVE_ORG.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ledger.csv`;
  a.click();
  showToast('Payroll ledger CSV exported');
}

/* -------------------------------------------------------------
   SECTION 7: ADVANCED ANALYTICS
------------------------------------------------------------- */
function renderAnalytics() {
  if (!window.Chart) return;
  const ctx = document.getElementById('attChart');
  if (!ctx) return;
  if (attChartInstance) attChartInstance.destroy();

  const textColor = '#64748B';
  const gridColor = 'rgba(0,0,0,0.06)';


  attChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      datasets: [
        {
          label: 'Workforce Retention %',
          data: [94, 95, 96, 95, 97, 98, 98, 99, 99],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.35,
          fill: true
        },
        {
          label: 'Attendance Compliance %',
          data: [91, 92, 90, 93, 94, 96, 95, 96, 97],
          borderColor: '#635bfc',
          backgroundColor: 'rgba(99, 91, 252, 0.1)',
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { min: 80, max: 100, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });
}

/* -------------------------------------------------------------
   SECTION 8: BROADCASTS & ANNOUNCEMENTS
------------------------------------------------------------- */
function renderAnnouncements() {
  const ann = read(ANNOUNCE_KEY);
  const container = document.getElementById('announcementList');
  container.innerHTML = '';

  if (ann.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:24px">No broadcasts on the notice board.</div>';
    return;
  }

  ann.forEach((a, i) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:16px;background:var(--bg);border-radius:12px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:12px';
    card.innerHTML = `
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="badge-pill badge-purple"><i class="fa-solid fa-bullhorn"></i> ${escapeHtml(a.author || 'HR Desk')}</span>
          <span class="small">${a.date || 'Today'}</span>
        </div>
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(a.title || 'Notice')}</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5">${escapeHtml(a.text)}</div>
      </div>
      <button class="btn ghost" style="padding:4px 8px;color:var(--accent-red)" onclick="deleteAnnouncement(${i})" title="Delete"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(card);
  });
}

document.getElementById('postAnnouncement')?.addEventListener('click', () => {
  const input = document.getElementById('announcementInput');
  const text = input.value.trim();
  if (!text) return alert('Please draft announcement text.');

  const ann = read(ANNOUNCE_KEY);
  ann.unshift({
    id: 'a' + Date.now(),
    title: 'Workforce Notice',
    text: text,
    date: 'Just now',
    author: user ? user.name : 'HR Administration'
  });
  save(ANNOUNCE_KEY, ann);
  input.value = '';
  renderAnnouncements();
  showToast('Broadcast published to all staff');
});

function deleteAnnouncement(idx) {
  const ann = read(ANNOUNCE_KEY);
  ann.splice(idx, 1);
  save(ANNOUNCE_KEY, ann);
  renderAnnouncements();
  showToast('Broadcast removed');
}

/* -------------------------------------------------------------
   SECTION 9: SETTINGS & HR COPILOT
------------------------------------------------------------- */
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    const color = swatch.dataset.color;
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('fg_primary_color', color);
    showToast(`Accent color updated`);
  });
});

const savedColor = localStorage.getItem('fg_primary_color');
if (savedColor) {
  document.documentElement.style.setProperty('--primary', savedColor);
  document.querySelectorAll('.color-swatch').forEach(s => {
    if (s.dataset.color === savedColor) s.classList.add('active');
  });
}

function saveIdleSetting() {
  const val = document.getElementById('idleMinutes').value;
  localStorage.setItem('fg_idle_minutes', val);
  showToast(`Auto-lock set to ${val} minutes`);
}

document.getElementById('askAiBtn')?.addEventListener('click', () => {
  const q = (document.getElementById('aiQuery').value || '').toLowerCase().trim();
  const answerDiv = document.getElementById('aiAnswer');
  answerDiv.style.display = 'block';

  if (!q) {
    answerDiv.innerHTML = '<strong>Copilot:</strong> Please type a query into the field above.';
    return;
  }

  let response = '';
  if (q.includes('leave') || q.includes('vacation')) {
    response = '<strong>Standard Leave Policy:</strong> Full-time staff members are entitled to 21 working days of paid annual leave, 10 certified medical leave days, and standard statutory public holidays upon formal submission via the portal.';
  } else if (q.includes('payroll') || q.includes('salary') || q.includes('pay')) {
    response = '<strong>Payroll Processing Cycle:</strong> Monthly salary runs are finalized on the 25th of every month. Standard statutory PAYE tax (~13%) and teacher pension contributions (5.5% Tier 1/2) are automatically withheld.';
  } else if (q.includes('overtime') || q.includes('extra')) {
    response = '<strong>Overtime Standards:</strong> Authorized hours worked in excess of standard 40-hour workweeks are remunerated at 1.5x regular base hourly rate, or 2.0x on designated public holidays.';
  } else if (q.includes('probation')) {
    response = '<strong>Probationary Framework:</strong> New staff onboarding undergoes a standard 3-month evaluation period, concluding with a comprehensive KPI scorecard review.';
  } else {
    response = `<strong>HR Policy Insight:</strong> For "${escapeHtml(q)}", company protocol mandates direct review with the Executive HR Desk. Standard procedures adhere to national labor guidelines and organizational governance.`;
  }

  answerDiv.innerHTML = response;
  showToast('Copilot insight retrieved');
});

/* -------------------------------------------------------------
   SUPABASE CLOUD SYNC UI CONTROLLERS
------------------------------------------------------------- */
function updateCloudSyncStatus() {
  const isConn = window.SupabaseConfig && window.SupabaseConfig.isConfigured();
  const label = document.getElementById('cloudSyncLabel');
  const icon = document.getElementById('cloudSyncIcon');
  const btn = document.getElementById('cloudSyncBtn');

  if (isConn) {
    label.textContent = 'Supabase Cloud: Active';
    icon.className = 'fa-solid fa-cloud-check';
    btn.style.color = '#10b981';
    btn.style.borderColor = '#10b981';
    btn.style.background = 'rgba(16, 185, 129, 0.15)';
  } else {
    label.textContent = 'Connect Supabase';
    icon.className = 'fa-solid fa-cloud';
    btn.style.color = '#10b981';
    btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    btn.style.background = 'rgba(16, 185, 129, 0.08)';
  }
}

function openCloudModal() {
  const modal = document.getElementById('cloudModalBackdrop');
  if (window.SupabaseConfig) {
    document.getElementById('sb_url').value = window.SupabaseConfig.getUrl();
    document.getElementById('sb_key').value = window.SupabaseConfig.getAnonKey();
    document.getElementById('sb_autosync').checked = window.SupabaseConfig.isAutoSync();
  }
  document.getElementById('cloudStatusMsg').style.display = 'none';
  modal.classList.add('show');
}

function closeCloudModal() {
  document.getElementById('cloudModalBackdrop').classList.remove('show');
}

async function handleTestCloud() {
  const url = document.getElementById('sb_url').value.trim();
  const key = document.getElementById('sb_key').value.trim();
  const statusEl = document.getElementById('cloudStatusMsg');
  const btn = document.getElementById('testConnBtn');

  statusEl.style.display = 'block';
  statusEl.style.color = 'var(--primary)';
  statusEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Testing connection to Supabase...';
  btn.disabled = true;

  const result = await window.SupabaseConfig.testConnection(url, key);
  btn.disabled = false;

  if (result.success) {
    statusEl.style.color = 'var(--accent-green)';
    statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + result.message;
    showToast('Supabase connection verified successfully!');
  } else {
    statusEl.style.color = 'var(--accent-red)';
    statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + (result.error || 'Connection failed');
    showErrorToast(
      'Supabase Handshake Failed',
      result.error || 'Connection timed out or failed to reach remote host.',
      'Check URL format, anonymous public API key, and network connectivity.',
      [
        'Verify your device has an active internet or local Wi-Fi connection.',
        'Confirm your Project URL starts with https:// (e.g. https://xyz.supabase.co).',
        'Verify your public anon API key is correctly copied from the Supabase API dashboard.',
        'Confirm your Supabase database instance is active.'
      ],
      result.error
    );
  }
}

async function handleSaveCloudConfig(e) {
  e.preventDefault();
  const url = document.getElementById('sb_url').value.trim();
  const key = document.getElementById('sb_key').value.trim();
  const autoSync = document.getElementById('sb_autosync').checked;

  window.SupabaseConfig.saveCredentials(url, key, autoSync);
  updateCloudSyncStatus();
  closeCloudModal();
  showToast('Supabase cloud configuration saved!');

  // Refresh live teachers and dashboard
  renderTeachers();
  renderDashboard();
}

function handleResetCloud() {
  if (confirm('Disconnect Supabase and revert to local storage?')) {
    window.SupabaseConfig.resetCredentials();
    document.getElementById('sb_url').value = '';
    document.getElementById('sb_key').value = '';
    updateCloudSyncStatus();
    showToast('Supabase credentials reset');
  }
}

async function handleMigrateCloud() {
  if (!window.SupabaseConfig.isConfigured()) {
    return alert('Please save a valid Supabase Project URL and Key first.');
  }

  const btn = document.getElementById('migrateBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Uploading...';

  try {
    const res = await window.SupabaseService.migrateAllLocalToCloud(ACTIVE_ORG);
    showToast(`Uploaded ${res.teachers} teachers & ${res.attendance} attendance records to Supabase!`);
    document.getElementById('cloudStatusMsg').style.display = 'block';
    document.getElementById('cloudStatusMsg').style.color = 'var(--accent-green)';
    document.getElementById('cloudStatusMsg').innerHTML = `<i class="fa-solid fa-circle-check"></i> Sync Complete: ${res.teachers} teachers, ${res.attendance} attendance logs saved to cloud.`;
  } catch (err) {
    showErrorToast(
      'Cloud Data Migration Failed',
      err.message || 'Unable to push local records to Supabase tables.',
      'Data migration encountered an operational error. Local cache remains safe and intact.',
      [
        'Check your internet connection.',
        'Verify the target tables ("teachers", "attendance") exist in your Supabase schema.',
        'Verify Row Level Security (RLS) policies permit INSERT operations.',
        'Re-test Cloud handshake in settings before pushing data.'
      ],
      err.stack || err.message
    );
  }
}

/* -------------------------------------------------------------
   SECTION 11: ACADEMIC CALENDAR & STAFF REVIEW MANAGEMENT
------------------------------------------------------------- */
function getAcademicCalendar() {
  let cal = read(CALENDAR_KEY);
  if (!Array.isArray(cal) || cal.length === 0) {
    cal = [
      {
        id: 'term_2026_1',
        title: 'Term 1 — Creative Foundations & Systems Architecture',
        year: '2026',
        startDate: '2026-01-12',
        endDate: '2026-04-10',
        caWindow: 'Feb 16 - Feb 27, 2026',
        caDeadline: '2026-02-27',
        examWindow: 'Mar 23 - Apr 03, 2026',
        examStart: '2026-03-23',
        examEnd: '2026-04-03',
        staffReviewWindow: 'Apr 06 - Apr 10, 2026',
        staffReviewStart: '2026-04-06',
        staffReviewEnd: '2026-04-10',
        directives: 'All faculty instructors must audit and finalize continuous assessment scores. Student assessment reviews open for certification.',
        status: 'Published for Staff Review',
        publishedAt: Date.now() - 86400000 * 2,
        publishedBy: 'HR Administration'
      },
      {
        id: 'term_2026_2',
        title: 'Term 2 — Advanced Engineering & Interactive Media',
        year: '2026',
        startDate: '2026-05-04',
        endDate: '2026-08-07',
        caWindow: 'Jun 08 - Jun 19, 2026',
        caDeadline: '2026-06-19',
        examWindow: 'Jul 20 - Jul 31, 2026',
        examStart: '2026-07-20',
        examEnd: '2026-07-31',
        staffReviewWindow: 'Aug 03 - Aug 07, 2026',
        staffReviewStart: '2026-08-03',
        staffReviewEnd: '2026-08-07',
        directives: 'Mid-year faculty alignment. Course progression audit and instructional review window.',
        status: 'Draft',
        publishedAt: null,
        publishedBy: null
      },
      {
        id: 'term_2026_3',
        title: 'Term 3 — Industry Capstone & Portfolio Certification',
        year: '2026',
        startDate: '2026-09-07',
        endDate: '2026-12-11',
        caWindow: 'Oct 12 - Oct 23, 2026',
        caDeadline: '2026-10-23',
        examWindow: 'Nov 23 - Dec 04, 2026',
        examStart: '2026-11-23',
        examEnd: '2026-12-04',
        staffReviewWindow: 'Dec 07 - Dec 11, 2026',
        staffReviewStart: '2026-12-07',
        staffReviewEnd: '2026-12-11',
        directives: 'Senior student exhibition jury, portfolio grading verification, and final annual graduation sign-off.',
        status: 'Draft',
        publishedAt: null,
        publishedBy: null
      }
    ];
    save(CALENDAR_KEY, cal);
  }
  return cal;
}

function renderAcademicCalendar() {
  const terms = getAcademicCalendar();
  
  // KPIs
  const totalTerms = terms.length;
  const publishedCount = terms.filter(t => t.status === 'Published for Staff Review').length;
  const activeTerm = terms.find(t => t.status === 'Published for Staff Review') || terms[0];

  const yearEl = document.getElementById('calKpiYear');
  const activeTermEl = document.getElementById('calKpiActiveTerm');
  const reviewStatusEl = document.getElementById('calKpiReviewStatus');
  const totalTermsEl = document.getElementById('calKpiTotalTerms');
  const noticeEl = document.getElementById('calendarStaffReviewNotice');
  const noticeTextEl = document.getElementById('calendarStaffReviewNoticeText');

  if (yearEl) yearEl.textContent = (activeTerm && activeTerm.year) ? `${activeTerm.year} / ${parseInt(activeTerm.year)+1}` : '2026 / 2027';
  if (activeTermEl) activeTermEl.textContent = activeTerm ? activeTerm.title.split('—')[0].trim() : 'Term 1';
  if (reviewStatusEl) reviewStatusEl.textContent = publishedCount > 0 ? 'Published' : 'Draft Mode';
  if (totalTermsEl) totalTermsEl.textContent = `${totalTerms} Terms`;

  if (noticeEl) {
    if (publishedCount > 0) {
      noticeEl.style.display = 'flex';
      if (noticeTextEl) {
        noticeTextEl.textContent = `The ${activeTerm ? activeTerm.title : 'academic'} calendar is published for staff review. Teaching faculty can access assessment deadlines and examination milestones.`;
      }
    } else {
      noticeEl.style.display = 'none';
    }
  }

  // Filter & Search
  const q = (document.getElementById('searchAcademicCal')?.value || '').trim().toLowerCase();
  const sFilter = document.getElementById('filterCalStatus')?.value || '';

  const filtered = terms.filter(t => {
    const matchQ = !q || (t.title || '').toLowerCase().includes(q) || (t.directives || '').toLowerCase().includes(q) || (t.year || '').includes(q);
    const matchS = !sFilter || t.status === sFilter;
    return matchQ && matchS;
  });

  const tbody = document.getElementById('academicCalendarTableBody');
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--muted);">No academic terms found. Click "Create Academic Term" to map a new term.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map((t, idx) => {
        const id = escapeHtml(t.id || ('term_' + idx));
        const title = escapeHtml(t.title || 'Academic Term');
        const year = escapeHtml(t.year || '2026');
        const dates = `${t.startDate || 'TBD'} → ${t.endDate || 'TBD'}`;
        const caDate = t.caDeadline ? `CA: ${t.caDeadline}` : (t.caWindow || 'Continuous');
        const examDate = t.examStart ? `Exams: ${t.examStart}` : (t.examWindow || 'Exams Scheduled');
        const reviewDate = (t.staffReviewStart && t.staffReviewEnd) ? `${t.staffReviewStart} → ${t.staffReviewEnd}` : (t.staffReviewWindow || 'Window Open');
        
        let statusBadge = 'badge-orange';
        if (t.status === 'Published for Staff Review') statusBadge = 'badge-green';
        else if (t.status === 'Certified') statusBadge = 'badge-purple';

        const isPublished = t.status === 'Published for Staff Review';

        return `
          <tr>
            <td style="font-weight:700; color:var(--muted);">${idx + 1}</td>
            <td>
              <div style="font-weight:800; color:var(--text); font-size:13.5px;">${title}</div>
              <div class="small" style="color:var(--muted); font-size:11.5px; margin-top:2px;">
                <i class="fa-solid fa-circle-info" style="font-size:10px;"></i> ${escapeHtml(t.directives || 'Standard academic session guidelines')}
              </div>
            </td>
            <td><span class="badge-pill badge-purple">${year}</span></td>
            <td><span style="font-size:12.5px; font-weight:600; color:var(--text);"><i class="fa-regular fa-calendar" style="color:var(--primary); margin-right:4px;"></i>${dates}</span></td>
            <td>
              <div style="font-size:12px; font-weight:600; color:var(--text);">${caDate}</div>
              <div class="small" style="color:var(--muted); font-size:11px;">${examDate}</div>
            </td>
            <td>
              <span style="background:rgba(16, 185, 129, 0.12); color:#059669; font-size:11.5px; font-weight:700; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
                <i class="fa-solid fa-users-viewfinder" style="font-size:10px;"></i> ${reviewDate}
              </span>
            </td>
            <td><span class="badge-pill ${statusBadge}"><i class="fa-solid fa-circle" style="font-size:6px;"></i> ${escapeHtml(t.status)}</span></td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:6px; align-items:center;">
                ${!isPublished ? `
                  <button type="button" class="btn btn-sm" style="background:#10b981; border-color:#059669; color:#fff; padding:5px 10px; font-size:11.5px; font-weight:800; border-radius:8px; display:inline-flex; align-items:center; gap:4px;" onclick="publishCalendarForStaffReview('${id}')" title="Publish term for faculty review">
                    <i class="fa-solid fa-bullhorn"></i> Publish
                  </button>
                ` : `
                  <span style="color:#059669; font-size:11px; font-weight:700; margin-right:4px;"><i class="fa-solid fa-check"></i> Live</span>
                `}
                <button type="button" class="btn ghost btn-sm" style="padding:5px 9px; font-size:12px; color:var(--primary);" onclick="openAcademicCalendarModal('${id}')" title="Edit Term Details">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn ghost btn-sm" style="padding:5px 9px; font-size:12px; color:var(--accent-red);" onclick="deleteAcademicCalendarTerm('${id}')" title="Delete Term">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Milestone Cards
  const gridEl = document.getElementById('calendarMilestonesGrid');
  if (gridEl) {
    const milestones = [
      { icon: 'fa-chalkboard-user', color: '#635bfc', title: 'Curriculum & Faculty Alignment', term: activeTerm ? activeTerm.title.split('—')[0].trim() : 'Term 1', date: activeTerm ? activeTerm.startDate : '2026-01-12', desc: 'Department heads conduct syllabus distribution and instructional alignment.' },
      { icon: 'fa-pen-ruler', color: '#0284c7', title: 'Continuous Assessment (CA) Week', term: activeTerm ? activeTerm.title.split('—')[0].trim() : 'Term 1', date: activeTerm ? (activeTerm.caDeadline || '2026-02-27') : '2026-02-27', desc: 'Practical projects, continuous quizzes, and prototype critiques submitted.' },
      { icon: 'fa-clipboard-check', color: '#d97706', title: 'Mid-Term Faculty Progress Review', term: activeTerm ? activeTerm.title.split('—')[0].trim() : 'Term 1', date: activeTerm ? (activeTerm.staffReviewStart || '2026-04-06') : '2026-04-06', desc: 'Staff review portal opens for faculty grade audit and peer feedback.' },
      { icon: 'fa-certificate', color: '#10b981', title: 'Semester Final Examinations', term: activeTerm ? activeTerm.title.split('—')[0].trim() : 'Term 1', date: activeTerm ? (activeTerm.examStart || '2026-03-23') : '2026-03-23', desc: 'Final exams and institutional grade certification by HR administration.' }
    ];

    gridEl.innerHTML = milestones.map(m => `
      <div style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px; display:flex; gap:14px; align-items:flex-start;">
        <div style="width:42px; height:42px; border-radius:10px; background:${m.color}18; color:${m.color}; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
          <i class="fa-solid ${m.icon}"></i>
        </div>
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:800; color:${m.color}; text-transform:uppercase;">${m.term}</span>
            <span style="font-size:11px; color:var(--muted);"><i class="fa-regular fa-clock"></i> ${m.date}</span>
          </div>
          <div style="font-weight:800; font-size:13.5px; color:var(--text); margin-top:2px;">${m.title}</div>
          <div style="font-size:12px; color:var(--muted); margin-top:4px; line-height:1.4;">${m.desc}</div>
        </div>
      </div>
    `).join('');
  }
}

function openAcademicCalendarModal(termId = null) {
  const modal = document.getElementById('academicCalendarModal');
  if (!modal) return;
  const form = document.getElementById('academicCalendarForm');
  if (form) form.reset();

  const titleEl = document.getElementById('calModalTitle');
  const editIdEl = document.getElementById('cal_editId');

  if (termId) {
    const terms = getAcademicCalendar();
    const t = terms.find(item => item.id === termId);
    if (t) {
      if (titleEl) titleEl.textContent = 'Edit Academic Term & Schedule';
      if (editIdEl) editIdEl.value = t.id;
      document.getElementById('cal_title').value = t.title || '';
      document.getElementById('cal_year').value = t.year || '2026';
      document.getElementById('cal_startDate').value = t.startDate || '';
      document.getElementById('cal_endDate').value = t.endDate || '';
      document.getElementById('cal_caDeadline').value = t.caDeadline || '';
      document.getElementById('cal_examStart').value = t.examStart || '';
      document.getElementById('cal_staffReviewStart').value = t.staffReviewStart || '';
      document.getElementById('cal_staffReviewEnd').value = t.staffReviewEnd || '';
      document.getElementById('cal_directives').value = t.directives || '';
      document.getElementById('cal_status').value = t.status || 'Draft';
    }
  } else {
    if (titleEl) titleEl.textContent = 'Create Academic Term & Milestones';
    if (editIdEl) editIdEl.value = '';
    document.getElementById('cal_year').value = '2026';
    document.getElementById('cal_status').value = 'Published for Staff Review';
  }

  modal.classList.add('active');
}

function closeAcademicCalendarModal() {
  const modal = document.getElementById('academicCalendarModal');
  if (modal) modal.classList.remove('active');
}

function saveAcademicCalendarTerm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const editId = document.getElementById('cal_editId')?.value;
  const title = document.getElementById('cal_title')?.value.trim();
  const year = document.getElementById('cal_year')?.value.trim() || '2026';
  const startDate = document.getElementById('cal_startDate')?.value;
  const endDate = document.getElementById('cal_endDate')?.value;
  const caDeadline = document.getElementById('cal_caDeadline')?.value;
  const examStart = document.getElementById('cal_examStart')?.value;
  const staffReviewStart = document.getElementById('cal_staffReviewStart')?.value;
  const staffReviewEnd = document.getElementById('cal_staffReviewEnd')?.value;
  const directives = document.getElementById('cal_directives')?.value.trim();
  const status = document.getElementById('cal_status')?.value || 'Published for Staff Review';

  if (!title || !startDate || !endDate) {
    if (typeof window.showWarningToast === 'function') {
      window.showWarningToast('Required Fields Missing', 'Please provide Term Title, Start Date, and End Date.', { target: '#academicCalendarModal' });
    } else {
      showToast('Term Title, Start Date, and End Date are mandatory', 'warning');
    }
    return;
  }

  let terms = getAcademicCalendar();
  const termRecord = {
    id: editId || ('term_' + Date.now()),
    title: title,
    year: year,
    startDate: startDate,
    endDate: endDate,
    caDeadline: caDeadline,
    caWindow: caDeadline ? `Deadline: ${caDeadline}` : 'Continuous',
    examStart: examStart,
    examWindow: examStart ? `Starts: ${examStart}` : 'Scheduled',
    staffReviewStart: staffReviewStart,
    staffReviewEnd: staffReviewEnd,
    staffReviewWindow: (staffReviewStart && staffReviewEnd) ? `${staffReviewStart} → ${staffReviewEnd}` : 'Open for Feedback',
    directives: directives || 'Standard faculty academic guidelines.',
    status: status,
    updatedAt: Date.now()
  };

  if (status === 'Published for Staff Review') {
    termRecord.publishedAt = Date.now();
    termRecord.publishedBy = (user && user.name) || 'HR Administration';
  }

  if (editId) {
    const idx = terms.findIndex(t => t.id === editId);
    if (idx !== -1) terms[idx] = Object.assign({}, terms[idx], termRecord);
  } else {
    terms.unshift(termRecord);
  }

  save(CALENDAR_KEY, terms);
  closeAcademicCalendarModal();
  renderAcademicCalendar();

  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success('Academic Term Saved', `${title} (${year}) scheduled and saved successfully.`);
  } else {
    showToast(`Term ${title} saved!`);
  }
}

function publishCalendarForStaffReview(termId = null) {
  let terms = getAcademicCalendar();
  if (termId) {
    const target = terms.find(t => t.id === termId);
    if (target) {
      target.status = 'Published for Staff Review';
      target.publishedAt = Date.now();
      target.publishedBy = (user && user.name) || 'HR Administration';
    }
  } else {
    if (terms.length > 0) {
      terms[0].status = 'Published for Staff Review';
      terms[0].publishedAt = Date.now();
      terms[0].publishedBy = (user && user.name) || 'HR Administration';
    }
  }

  save(CALENDAR_KEY, terms);
  renderAcademicCalendar();

  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success(
      'Academic Calendar Published',
      'The 2026 Academic Calendar has been published for staff review across the Faculty & Teacher Portals.'
    );
  } else {
    showToast('Academic calendar published for staff review!');
  }
}

function deleteAcademicCalendarTerm(termId) {
  if (!confirm('Are you sure you want to remove this academic term from institutional schedules?')) return;
  let terms = getAcademicCalendar();
  terms = terms.filter(t => t.id !== termId);
  save(CALENDAR_KEY, terms);
  renderAcademicCalendar();

  if (window.Toaster && typeof window.Toaster.info === 'function') {
    window.Toaster.info('Term Removed', 'Academic term has been removed from institutional schedule.');
  } else {
    showToast('Academic term removed.');
  }
}

/* -------------------------------------------------------------
   SECTION 12: STUDENT ASSESSMENT REVIEW & CERTIFICATION DESK
   (HR Validates & Approves; Academic Marks Strictly Protected)
------------------------------------------------------------- */
function getStudentAssessments() {
  let assessments = read(ASSESS_KEY);
  if (!Array.isArray(assessments) || assessments.length === 0) {
    assessments = [
      {
        id: 'as_101',
        studentId: 's_101',
        studentRoll: 'STU-2026-001',
        studentName: 'Samuel Kofi Mensah',
        className: 'Grade 11 - Web Systems & Client Architecture',
        subject: 'Web Systems & Client Architecture',
        teacherName: 'Kwame Boateng',
        teacherEmail: 'kwame@flawless.org',
        assessmentTitle: 'Term 1 Mid-Term Comprehensive Assessment',
        term: '2026 - Term 1',
        caScore: 28,
        examScore: 63,
        totalScore: 91,
        grade: 'A+',
        teacherRemarks: 'Exemplary architectural understanding of CSS Grid, flexbox responsive layouts, and DOM manipulation.',
        status: 'Awaiting HR Certification',
        submittedAt: Date.now() - 86400000 * 3,
        certifiedAt: null,
        certifiedBy: null,
        hrNotes: ''
      },
      {
        id: 'as_102',
        studentId: 's_102',
        studentRoll: 'STU-2026-002',
        studentName: 'Yaa Asantewaa',
        className: 'Grade 10 - Graphic Arts & Visual Identity',
        subject: 'Graphic Arts & Visual Identity',
        teacherName: 'Kofi Owusu',
        teacherEmail: 'kofi@flawless.org',
        assessmentTitle: 'Term 1 Brand Identity Practical Portfolio',
        term: '2026 - Term 1',
        caScore: 26,
        examScore: 61,
        totalScore: 87,
        grade: 'A',
        teacherRemarks: 'Superb vector graphics execution and color balance. Demonstrated strong mastery of design hierarchy.',
        status: 'Awaiting HR Certification',
        submittedAt: Date.now() - 86400000 * 2,
        certifiedAt: null,
        certifiedBy: null,
        hrNotes: ''
      },
      {
        id: 'as_103',
        studentId: 's_103',
        studentRoll: 'STU-2026-003',
        studentName: 'Kwabena J. Darko',
        className: 'Grade 12 - Digital Animation & 3D Modeling',
        subject: 'Digital Animation & 3D Modeling',
        teacherName: 'James Ntiamoah',
        teacherEmail: 'james@flawless.org',
        assessmentTitle: 'Term 1 3D Character Rigging & Animation',
        term: '2026 - Term 1',
        caScore: 29,
        examScore: 66,
        totalScore: 95,
        grade: 'A+',
        teacherRemarks: 'Outstanding kinematic rigging and lighting composition. Portfolio ready for international festival submission.',
        status: 'Approved & Certified',
        submittedAt: Date.now() - 86400000 * 5,
        certifiedAt: Date.now() - 86400000 * 1,
        certifiedBy: 'Ama Serwaa (HR Manager)',
        hrNotes: 'Officially certified for academic records and institutional transcripts.'
      },
      {
        id: 'as_104',
        studentId: 's_104',
        studentRoll: 'STU-2026-004',
        studentName: 'Akua Serwaa Donkor',
        className: 'Grade 10 - UI/UX Interactive Prototyping',
        subject: 'UI/UX Interactive Prototyping',
        teacherName: 'Esi Badu',
        teacherEmail: 'esi@flawless.org',
        assessmentTitle: 'Term 1 User Research & High-Fidelity Prototype',
        term: '2026 - Term 1',
        caScore: 25,
        examScore: 57,
        totalScore: 82,
        grade: 'B+',
        teacherRemarks: 'Great user journey mapping and wireframe fidelity. Keep refining interactive micro-transitions.',
        status: 'Awaiting HR Certification',
        submittedAt: Date.now() - 86400000 * 1,
        certifiedAt: null,
        certifiedBy: null,
        hrNotes: ''
      }
    ];
    save(ASSESS_KEY, assessments);
  }
  return assessments;
}

function warnLockedScore(scoreType) {
  if (typeof window.showWarningToast === 'function') {
    window.showWarningToast(
      'Academic Assessment Protected',
      `HR administrators can review and approve student assessments, but cannot alter ${scoreType || 'academic'} marks. Marks can only be entered by the assigned faculty instructor.`,
      { target: '#studentAssessmentsSection' }
    );
  } else if (window.Toaster && typeof window.Toaster.warning === 'function') {
    window.Toaster.warning(
      'Academic Assessment Protected',
      `HR administrators can review and approve student assessments, but cannot alter ${scoreType || 'academic'} marks. Marks can only be entered by the assigned faculty instructor.`
    );
  } else {
    showToast(`Protected: Only faculty instructors can modify ${scoreType} marks.`, 'warning');
  }
}
window.warnLockedScore = warnLockedScore;

function renderStudentAssessments() {
  const assessments = getStudentAssessments();

  // Metrics
  const total = assessments.length;
  const pending = assessments.filter(a => a.status === 'Awaiting HR Certification').length;
  const certified = assessments.filter(a => a.status === 'Approved & Certified').length;
  const totalScoreSum = assessments.reduce((acc, a) => acc + (a.totalScore || 0), 0);
  const avg = total > 0 ? (totalScoreSum / total).toFixed(1) : '0.0';

  const totalEl = document.getElementById('asKpiTotal');
  const pendingEl = document.getElementById('asKpiPending');
  const certifiedEl = document.getElementById('asKpiCertified');
  const avgEl = document.getElementById('asKpiAvg');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (certifiedEl) certifiedEl.textContent = certified;
  if (avgEl) avgEl.textContent = `${avg}%`;

  // Populate Class Filter if empty
  const classFilter = document.getElementById('filterAssessmentClass');
  if (classFilter && classFilter.options.length <= 1) {
    const classes = [...new Set(assessments.map(a => a.className))];
    classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      classFilter.appendChild(opt);
    });
  }

  // Filter & Search
  const q = (document.getElementById('searchAssessment')?.value || '').trim().toLowerCase();
  const sFilter = document.getElementById('filterAssessmentStatus')?.value || '';
  const cFilter = document.getElementById('filterAssessmentClass')?.value || '';

  const filtered = assessments.filter(a => {
    const matchQ = !q || (a.studentName || '').toLowerCase().includes(q) || (a.studentRoll || '').toLowerCase().includes(q) || (a.subject || '').toLowerCase().includes(q) || (a.teacherName || '').toLowerCase().includes(q);
    const matchS = !sFilter || a.status === sFilter;
    const matchC = !cFilter || a.className === cFilter;
    return matchQ && matchS && matchC;
  });

  const tbody = document.getElementById('studentAssessmentsTableBody');
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--muted);">No matching student assessments found.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(a => {
        const id = escapeHtml(a.id);
        const name = escapeHtml(a.studentName || 'Student');
        const roll = escapeHtml(a.studentRoll || 'STU-000');
        const className = escapeHtml(a.className || 'General Class');
        const subject = escapeHtml(a.subject || className);
        const teacher = escapeHtml(a.teacherName || 'Faculty Instructor');
        const ca = a.caScore !== undefined ? a.caScore : 0;
        const exam = a.examScore !== undefined ? a.examScore : 0;
        const total = a.totalScore !== undefined ? a.totalScore : 0;
        const grade = escapeHtml(a.grade || 'A');
        const isAwaiting = a.status === 'Awaiting HR Certification';
        const initial = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        return `
          <tr style="${isAwaiting ? 'background:rgba(245, 158, 11, 0.04);' : ''}">
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="user-avatar-badge" style="background:linear-gradient(135deg, #0284c7, #2563eb); font-size:13px; font-weight:800; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:10px;">${initial}</div>
                <div>
                  <div style="font-weight:700; color:var(--text); font-size:13.5px;">${name}</div>
                  <div class="small" style="color:var(--muted); font-family:monospace; font-size:11.5px;">${roll}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight:600; color:var(--text); font-size:13px;">${className}</div>
              <div class="small" style="color:var(--muted); font-size:11px;"><i class="fa-solid fa-book" style="margin-right:3px;"></i>${subject}</div>
            </td>
            <td>
              <div style="font-size:12.5px; font-weight:600; color:var(--text);"><i class="fa-solid fa-chalkboard-user" style="color:var(--primary); margin-right:5px;"></i>${teacher}</div>
            </td>
            <td>
              <span onclick="warnLockedScore('Continuous Assessment (CA)')" style="cursor:pointer; background:#f1f5f9; border:1px solid var(--border); padding:4px 10px; border-radius:8px; font-weight:700; font-size:12.5px; color:var(--text); display:inline-flex; align-items:center; gap:5px;" title="Click to view lock status">
                ${ca} / 30 <i class="fa-solid fa-lock" style="font-size:10px; color:#94a3b8;"></i>
              </span>
            </td>
            <td>
              <span onclick="warnLockedScore('Final Examination')" style="cursor:pointer; background:#f1f5f9; border:1px solid var(--border); padding:4px 10px; border-radius:8px; font-weight:700; font-size:12.5px; color:var(--text); display:inline-flex; align-items:center; gap:5px;" title="Click to view lock status">
                ${exam} / 70 <i class="fa-solid fa-lock" style="font-size:10px; color:#94a3b8;"></i>
              </span>
            </td>
            <td>
              <div style="font-weight:800; color:var(--primary); font-size:14px;">${total}%</div>
              <span class="badge-pill badge-green" style="font-size:10.5px; padding:1px 6px;">Grade ${grade}</span>
            </td>
            <td>
              ${isAwaiting ? `
                <span style="background:rgba(245, 158, 11, 0.15); color:#b45309; border:1px solid rgba(245, 158, 11, 0.35); padding:4px 10px; border-radius:12px; font-size:11.5px; font-weight:800; display:inline-flex; align-items:center; gap:5px;">
                  <i class="fa-solid fa-clock" style="font-size:10px;"></i> Awaiting HR Certification
                </span>
              ` : `
                <span class="badge-pill badge-green" style="font-size:11.5px; padding:4px 10px;">
                  <i class="fa-solid fa-circle-check"></i> Approved &amp; Certified
                </span>
              `}
            </td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:6px; align-items:center;">
                ${isAwaiting ? `
                  <button type="button" class="btn btn-sm" style="background:#10b981; border-color:#059669; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(16,185,129,0.3);" onclick="approveStudentAssessment('${id}')" title="Prove and Certify this student assessment">
                    <i class="fa-solid fa-stamp"></i> Prove / Approve
                  </button>
                ` : `
                  <span style="color:#059669; font-size:11.5px; font-weight:700; margin-right:4px;"><i class="fa-solid fa-certificate"></i> Certified</span>
                `}
                <button type="button" class="btn ghost btn-sm" style="padding:6px 10px; font-size:12px; color:var(--primary);" onclick="openAssessmentDetailModal('${id}')" title="View Full Assessment Audit">
                  <i class="fa-solid fa-magnifying-glass"></i> Audit
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function openAssessmentDetailModal(assessmentId) {
  const modal = document.getElementById('assessmentDetailModal');
  if (!modal) return;

  const assessments = getStudentAssessments();
  const a = assessments.find(item => item.id === assessmentId);
  if (!a) return;

  document.getElementById('as_currentId').value = a.id;
  document.getElementById('as_studentName').textContent = a.studentName || 'Student';
  document.getElementById('as_rollBadge').textContent = a.studentRoll || 'STU-000';
  document.getElementById('as_className').textContent = a.className || 'Class';
  document.getElementById('as_instructor').textContent = a.teacherName || 'Faculty Instructor';
  document.getElementById('as_caScore').value = a.caScore !== undefined ? a.caScore : '';
  document.getElementById('as_examScore').value = a.examScore !== undefined ? a.examScore : '';
  document.getElementById('as_totalScore').value = `${a.totalScore || 0}%`;
  document.getElementById('as_grade').value = a.grade || 'A';
  document.getElementById('as_teacherRemarks').value = a.teacherRemarks || 'No instructor remarks provided.';
  document.getElementById('as_hrNotes').value = a.hrNotes || '';

  const avatar = document.getElementById('as_avatar');
  if (avatar) {
    const initials = (a.studentName || 'Student').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    avatar.textContent = initials;
  }

  const certMeta = document.getElementById('as_certificationMeta');
  const certText = document.getElementById('as_certifiedText');
  const approveBtn = document.getElementById('as_approveBtn');

  if (a.status === 'Approved & Certified') {
    if (certMeta) certMeta.style.display = 'block';
    if (certText) certText.textContent = `Officially approved & certified by ${a.certifiedBy || 'HR Administration'} on ${a.certifiedAt ? new Date(a.certifiedAt).toLocaleString() : 'Record'}.`;
    if (approveBtn) {
      approveBtn.style.display = 'none';
    }
  } else {
    if (certMeta) certMeta.style.display = 'none';
    if (approveBtn) {
      approveBtn.style.display = 'inline-flex';
    }
  }

  modal.classList.add('active');
}

function closeAssessmentDetailModal() {
  const modal = document.getElementById('assessmentDetailModal');
  if (modal) modal.classList.remove('active');
}

function submitAssessmentApproval() {
  const currentId = document.getElementById('as_currentId')?.value;
  if (!currentId) return;
  const hrNotes = document.getElementById('as_hrNotes')?.value.trim();

  let assessments = getStudentAssessments();
  const target = assessments.find(a => a.id === currentId);
  if (target) {
    target.hrNotes = hrNotes || 'Officially audited and certified by HR Administration.';
    save(ASSESS_KEY, assessments);
  }

  approveStudentAssessment(currentId);
  closeAssessmentDetailModal();
}

function approveStudentAssessment(id) {
  let assessments = getStudentAssessments();
  const target = assessments.find(a => a.id === id);
  if (!target) return;

  const hrName = (user && (user.name || user.fullName)) || 'HR Administrator';
  target.status = 'Approved & Certified';
  target.certifiedBy = `${hrName} (HR Manager)`;
  target.certifiedAt = Date.now();
  if (!target.hrNotes) {
    target.hrNotes = 'Officially audited and certified by HR Administration for academic transcripts.';
  }

  save(ASSESS_KEY, assessments);
  renderStudentAssessments();

  if (window.Toaster && typeof window.Toaster.success === 'function') {
    window.Toaster.success(
      'Assessment Approved & Certified',
      `Official certification issued for ${target.studentName} (${target.studentRoll}) — Grade ${target.grade} (${target.totalScore}%).`
    );
  } else {
    showToast(`Assessment certified for ${target.studentName}`);
  }
}

/* -------------------------------------------------------------
   INITIAL BOOTSTRAP
------------------------------------------------------------- */
function bootstrapApp() {
  try {
    // Explicit global attachments
    window.openAddStudentModal = openAddStudentModal;
    window.openAddClassModal = openAddClassModal;
    window.closeAddClassModal = closeAddClassModal;
    window.openTeacherModal = openTeacherModal;
    window.closeTeacherModal = closeTeacherModal;
    window.closeStudentModal = closeStudentModal;
    window.submitStudentAdmission = submitStudentAdmission;
    window.deleteHRStudent = deleteHRStudent;
    window.editHRStudent = editHRStudent;

    // Academic Calendar & Staff Review Attachments
    window.renderAcademicCalendar = renderAcademicCalendar;
    window.openAcademicCalendarModal = openAcademicCalendarModal;
    window.closeAcademicCalendarModal = closeAcademicCalendarModal;
    window.saveAcademicCalendarTerm = saveAcademicCalendarTerm;
    window.publishCalendarForStaffReview = publishCalendarForStaffReview;
    window.deleteAcademicCalendarTerm = deleteAcademicCalendarTerm;

    // Student Assessment QA & Certification Attachments
    window.renderStudentAssessments = renderStudentAssessments;
    window.openAssessmentDetailModal = openAssessmentDetailModal;
    window.closeAssessmentDetailModal = closeAssessmentDetailModal;
    window.warnLockedScore = warnLockedScore;
    window.approveStudentAssessment = approveStudentAssessment;
    window.submitAssessmentApproval = submitAssessmentApproval;

    // Direct event listener binding for all Add Student triggers
    document.querySelectorAll('#openAddStudentBtn, #topAddStudentBtn, #navAddStudentBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAddStudentModal();
      });
    });

    updateCloudSyncStatus();
    renderDashboard();
    renderCharts();
    renderTeachers();
    loadHRStudents();
    initPayrollSection();
  } catch (err) {
    console.error('HR Dashboard Bootstrap Error:', err);
  } finally {
    // Guarantees skeleton loader overlay is dismissed immediately
    const sk = document.getElementById('skeletonLoader');
    if (sk) {
      sk.classList.add('fade-out');
      setTimeout(() => {
        if (sk && sk.parentNode) {
          sk.parentNode.removeChild(sk);
        }
      }, 300);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

// Global safety dismissal for skeleton overlay
window.addEventListener('load', () => {
  const sk = document.getElementById('skeletonLoader');
  if (sk) {
    sk.classList.add('fade-out');
    setTimeout(() => { if (sk && sk.parentNode) sk.parentNode.removeChild(sk); }, 250);
  }
});