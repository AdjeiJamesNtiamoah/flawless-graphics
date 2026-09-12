/**
 * VERIFICATION SUITE: STUDENT PORTAL WORKSPACE
 * Tests pages/student/student-login.html, pages/student/student-dashboard.html,
 * quick-dock.js integration, routing, WAEC calculations, and workstation flows.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('--- STUDENT PORTAL & WORKSPACE AUTOMATED VERIFICATION ---');
console.log('================================================================');

// 1. File Existence Checks
const studentLoginPath = path.join(__dirname, '../pages/student/student-login.html');
const studentDashPath = path.join(__dirname, '../pages/student/student-dashboard.html');
const welcomePath = path.join(__dirname, '../welcome.html');
const siteLoginPath = path.join(__dirname, '../site-login.html');
const indexPath = path.join(__dirname, '../index.html');
const quickDockPath = path.join(__dirname, '../assets/js/quick-dock.js');

assert(fs.existsSync(studentLoginPath), 'pages/student/student-login.html exists');
assert(fs.existsSync(studentDashPath), 'pages/student/student-dashboard.html exists');

const loginHtml = fs.readFileSync(studentLoginPath, 'utf8');
const dashHtml = fs.readFileSync(studentDashPath, 'utf8');
const welcomeHtml = fs.readFileSync(welcomePath, 'utf8');
const siteLoginHtml = fs.readFileSync(siteLoginPath, 'utf8');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const quickDockJs = fs.readFileSync(quickDockPath, 'utf8');

// 2. Cross-Portal Discovery & Routing Links
assert(welcomeHtml.includes('pages/student/student-login.html'), 'welcome.html includes Student Portal link card');
assert(welcomeHtml.includes('portalStudentLink'), 'welcome.html includes #portalStudentLink');
assert(siteLoginHtml.includes("user.role === 'student'"), 'site-login.html includes role === "student" route');
assert(siteLoginHtml.includes('pages/student/student-dashboard.html'), 'site-login.html redirects student to student-dashboard.html');
assert(indexHtml.includes('pages/student/student-login.html'), 'index.html includes Student Portal navigation link');

// 3. Quick Dock Integration
assert(quickDockJs.includes('/pages/student/'), 'quick-dock.js recognizes /pages/student/ in getRootPrefix');
assert(quickDockJs.includes("role === 'Student'"), 'quick-dock.js handles role === "Student" in getReadNotifStorageKey');
assert(quickDockJs.includes('student_read_notif_ids'), 'quick-dock.js uses student_read_notif_ids');
assert(quickDockJs.includes('panelSub = \'Academic Directives, Coursework & Results\''), 'quick-dock.js defines Student telemetry subtitle');

// 4. Student Dashboard UI Containers & Workstations
const requiredContainers = [
  '#academicContextBreadcrumb',
  '#attendanceStreakPill',
  '#studentSwitcherSelect',
  '#notifBellBtn',
  '#overviewSection',
  '#coursesSection',
  '#assignmentsSection',
  '#gradesSection',
  '#timetableSection',
  '#attendanceSection',
  '#profileSection',
  '#submitAssignmentModal',
  '#absenceExcuseModal',
  '#transcriptModal',
  '#kpiGpaValue',
  '#kpiCoursesValue',
  '#kpiAttendanceValue',
  '#kpiPendingTasksValue',
  '#todayScheduleContainer',
  '#enrolledCoursesGrid',
  '#assignmentsListContainer',
  '#fullGradebookTableBody',
  '#weeklyTimetableBody',
  '#printableBroadsheet',
  '#smartIdCardBox'
];

requiredContainers.forEach(sel => {
  const cleanId = sel.replace('#', '');
  assert(dashHtml.includes(`id="${cleanId}"`), `UI Container ${sel} exists in student-dashboard.html`);
});

// 5. Student Login Capabilities
assert(loginHtml.includes('id="tabSignIn"'), 'student-login.html has Sign In tab');
assert(loginHtml.includes('id="tabSignUp"'), 'student-login.html has New Student registration tab');
assert(loginHtml.includes('quickDemoStudent'), 'student-login.html includes quickDemoStudent function');
assert(loginHtml.includes('STU-2026-001'), 'student-login.html includes STU-2026-001 demo chip');
assert(loginHtml.includes('STU-2026-002'), 'student-login.html includes STU-2026-002 demo chip');
assert(loginHtml.includes('STU-2026-003'), 'student-login.html includes STU-2026-003 demo chip');
assert(loginHtml.includes('STU-2026-004'), 'student-login.html includes STU-2026-004 demo chip');
assert(loginHtml.includes('Pending HR Approval'), 'student-login.html handles Pending HR Approval for self-registration');

// 6. Runtime VM Execution of Student Dashboard Logic
function extractInlineScript(html) {
  const start = html.lastIndexOf('<script>');
  const end = html.indexOf('</script>', start);
  return html.substring(start + 8, end);
}

const dashScript = extractInlineScript(dashHtml);
assert(dashScript.length > 500, `Extracted inline student script (${dashScript.length} chars)`);

// Create DOM sandbox for VM
const mockStorage = {};
const elements = {};

function getEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      options: [],
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains(c) { return this.classes.has(c); }
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      focus: () => {},
      reset: () => {}
    };
  }
  return elements[id];
}

const doc = {
  getElementById: (id) => getEl(id),
  querySelector: (sel) => getEl(sel.replace(/[^a-zA-Z0-9_-]/g, '')),
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: { classList: { toggle: () => {}, add: () => {}, remove: () => {} }, appendChild: () => {}, removeChild: () => {} },
  createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {} })
};

const win = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { for (let k in mockStorage) delete mockStorage[k]; }
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: doc,
  alert: () => {},
  confirm: () => true,
  prompt: () => '',
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  Date,
  Math,
  JSON,
  scrollTo: () => {},
  print: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
win.window = win;
win.self = win;

const context = vm.createContext(win);

try {
  vm.runInContext(dashScript, context);
  assert(true, 'Student Dashboard script evaluated cleanly without unhandled syntax or runtime errors');
} catch (err) {
  assert(false, 'Student Dashboard script execution error: ' + err.message);
}

// 7. Functional Logic Testing in Context
console.log('\n--- Functional Logic Testing ---');

// Test WAEC Grade mapping
assert(typeof context.calculateWAECGrade === 'function', 'calculateWAECGrade is defined');
assert(context.calculateWAECGrade(92).grade === 'A1', 'WAEC 92% maps to A1 (got: ' + context.calculateWAECGrade(92).grade + ')');
assert(context.calculateWAECGrade(72).grade === 'B2', 'WAEC 72% maps to B2 (got: ' + context.calculateWAECGrade(72).grade + ')');
assert(context.calculateWAECGrade(66).grade === 'B3', 'WAEC 66% maps to B3 (got: ' + context.calculateWAECGrade(66).grade + ')');
assert(context.calculateWAECGrade(62).grade === 'C4', 'WAEC 62% maps to C4 (got: ' + context.calculateWAECGrade(62).grade + ')');
assert(context.calculateWAECGrade(57).grade === 'C5', 'WAEC 57% maps to C5 (got: ' + context.calculateWAECGrade(57).grade + ')');
assert(context.calculateWAECGrade(52).grade === 'C6', 'WAEC 52% maps to C6 (got: ' + context.calculateWAECGrade(52).grade + ')');
assert(context.calculateWAECGrade(47).grade === 'D7', 'WAEC 47% maps to D7 (got: ' + context.calculateWAECGrade(47).grade + ')');
assert(context.calculateWAECGrade(42).grade === 'E8', 'WAEC 42% maps to E8 (got: ' + context.calculateWAECGrade(42).grade + ')');
assert(context.calculateWAECGrade(32).grade === 'F9', 'WAEC 32% maps to F9 (got: ' + context.calculateWAECGrade(32).grade + ')');

// Test Profile Switcher
assert(typeof context.switchActiveStudentProfile === 'function', 'switchActiveStudentProfile is defined');
context.switchActiveStudentProfile('s_102');
const currentStored = JSON.parse(mockStorage['active_student'] || '{}');
assert(currentStored.roll === 'STU-2026-002', 'Profile switched to Yaa Asantewaa (STU-2026-002)');
assert(currentStored.name === 'Yaa Asantewaa', 'Active student name updated to Yaa Asantewaa');

// Test Homework Submission Flow
assert(typeof context.handleAssignmentSubmit === 'function', 'handleAssignmentSubmit is defined');
getEl('subTaskSelect').value = 'task_1';
context.handleAssignmentSubmit();
const assignmentsList = vm.runInContext('STUDENT_ASSIGNMENTS', context);
const submittedTask = assignmentsList.find(t => t.id === 'task_1');
assert(submittedTask.status === 'submitted', 'handleAssignmentSubmit marked task_1 as submitted');
assert(typeof submittedTask.submittedAt === 'number', 'Submitted task has timestamp');

// Test Absence Excuse Lodging Flow
assert(typeof context.handleAbsenceExcuseSubmit === 'function', 'handleAbsenceExcuseSubmit is defined');
getEl('excuseCategory').value = 'Medical / Health Clinic';
getEl('excuseDateFrom').value = '2026-03-20';
getEl('excuseDateTo').value = '2026-03-22';
getEl('excuseReason').value = 'Hospital specialist consultation';
context.handleAbsenceExcuseSubmit();
const storedExcuses = JSON.parse(mockStorage['student_absence_excuses'] || '[]');
assert(storedExcuses.length > 0, 'Absence excuse registered in localStorage');
assert(storedExcuses[0].category === 'Medical / Health Clinic', 'Excuse category recorded correctly');
assert(storedExcuses[0].dates === '2026-03-20 to 2026-03-22', 'Excuse date span recorded correctly');
assert(storedExcuses[0].status === 'Pending Review', 'Excuse initial status set to Pending Review');

// Test Broadsheet Modal
assert(typeof context.openTranscriptModal === 'function', 'openTranscriptModal is defined');
context.openTranscriptModal();
assert(getEl('transcriptModal').classList.contains('active'), 'openTranscriptModal activates #transcriptModal');

// 8. Test Instant Demo Student Access in student-login.html
console.log('\n--- Instant Demo Student Access Testing ---');
const loginScriptStart = loginHtml.indexOf('<script>\nconst ORG = \'FLAWLESS GRAPHICS\';');
const loginScriptEnd = loginHtml.indexOf('</script>', loginScriptStart);
const loginScript = loginHtml.substring(loginScriptStart + 8, loginScriptEnd);
assert(loginScript.length > 500, `Extracted login script (${loginScript.length} chars)`);

const loginWin = {
  localStorage: {
    data: {
      // Simulate existing students from teacher or HR portal that don't match s_101/s_102
      'FLAWLESS GRAPHICS_students': JSON.stringify([
        { id: 1, firstName: 'Kojo', lastName: 'Antwi', roll: '101' },
        { id: 2, firstName: 'Fiifi', lastName: 'Baffour', roll: '201' }
      ])
    },
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; },
    clear() { this.data = {}; }
  },
  location: { href: '' },
  document: {
    getElementById: (id) => getEl(id),
    querySelector: (sel) => getEl(sel.replace(/[^a-zA-Z0-9_-]/g, '')),
    querySelectorAll: () => []
  },
  setTimeout: (fn) => fn(),
  addEventListener: () => {},
  console,
  Date,
  Math,
  JSON
};
loginWin.window = loginWin;

const loginCtx = vm.createContext(loginWin);
try {
  vm.runInContext(loginScript, loginCtx);
  assert(true, 'student-login.html script evaluated cleanly');
} catch (err) {
  assert(false, 'student-login.html script error: ' + err.message);
}

// Verify getStoredStudents auto-merges DEFAULT_STUDENTS into existing non-empty array
const mergedStudents = loginCtx.getStoredStudents();
assert(mergedStudents.some(s => s.id === 's_101'), 'getStoredStudents preserves/merges s_101 (Samuel Mensah)');
assert(mergedStudents.some(s => s.id === 's_102'), 'getStoredStudents preserves/merges s_102 (Yaa Asantewaa)');
assert(mergedStudents.some(s => s.id === 's_103'), 'getStoredStudents preserves/merges s_103 (Kwabena Darko)');
assert(mergedStudents.some(s => s.id === 's_104'), 'getStoredStudents preserves/merges s_104 (Akua Donkor)');
assert(mergedStudents.some(s => s.id === 1), 'getStoredStudents preserves existing external student (Kojo Antwi)');

// Test 1: Click Samuel Mensah (s_101)
loginWin.location.href = '';
loginCtx.quickDemoStudent('s_101');
let currentActive = JSON.parse(loginWin.localStorage.getItem('active_student') || '{}');
assert(currentActive.id === 's_101', 'quickDemoStudent(s_101) sets active_student ID to s_101');
assert(currentActive.name.includes('Samuel'), 'quickDemoStudent(s_101) sets name to Samuel');
assert(currentActive.roll === 'STU-2026-001', 'quickDemoStudent(s_101) sets roll to STU-2026-001');
assert(loginWin.location.href === 'student-dashboard.html', 'quickDemoStudent(s_101) redirects to student-dashboard.html');
assert(getEl('identifier').value === 'STU-2026-001', 'quickDemoStudent auto-populates #identifier input');
assert(getEl('password').value === 'student123', 'quickDemoStudent auto-populates #password input');

// Test 2: Click Yaa Asantewaa (s_102)
loginWin.location.href = '';
loginCtx.quickDemoStudent('s_102');
currentActive = JSON.parse(loginWin.localStorage.getItem('active_student') || '{}');
assert(currentActive.id === 's_102', 'quickDemoStudent(s_102) sets active_student ID to s_102');
assert(currentActive.name === 'Yaa Asantewaa', 'quickDemoStudent(s_102) sets name to Yaa Asantewaa');
assert(loginWin.location.href === 'student-dashboard.html', 'quickDemoStudent(s_102) redirects to student-dashboard.html');

// Test 3: Click Kwabena Darko (s_103)
loginWin.location.href = '';
loginCtx.quickDemoStudent('s_103');
currentActive = JSON.parse(loginWin.localStorage.getItem('active_student') || '{}');
assert(currentActive.id === 's_103', 'quickDemoStudent(s_103) sets active_student ID to s_103');
assert(loginWin.location.href === 'student-dashboard.html', 'quickDemoStudent(s_103) redirects to student-dashboard.html');

// Test 4: Click Akua Donkor (s_104)
loginWin.location.href = '';
loginCtx.quickDemoStudent('s_104');
currentActive = JSON.parse(loginWin.localStorage.getItem('active_student') || '{}');
assert(currentActive.id === 's_104', 'quickDemoStudent(s_104) sets active_student ID to s_104');
assert(loginWin.location.href === 'student-dashboard.html', 'quickDemoStudent(s_104) redirects to student-dashboard.html');

// 9. Automated Testing for Smart ID Generation & AuthSession Integration
console.log('\n--- Smart ID & Registration Engine Verification ---');
const authSessionJs = fs.readFileSync(path.join(__dirname, '../assets/js/auth-session.js'), 'utf8');
const authWin = {
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; },
    clear() { this.data = {}; }
  },
  document: doc,
  addEventListener: () => {},
  console,
  Date,
  Math,
  JSON
};
authWin.window = authWin;
const authCtx = vm.createContext(authWin);
try {
  vm.runInContext(authSessionJs, authCtx);
  assert(typeof authWin.AuthSession === 'object', 'AuthSession loaded successfully into VM context');
  assert(typeof authWin.AuthSession.generateSmartId === 'function', 'AuthSession.generateSmartId function exists');
  
  const testSmartId = authWin.AuthSession.generateSmartId({ name: 'Kofi Mensah', email: 'kofi@example.com' }, 'student');
  assert(testSmartId.smartIdNumber && testSmartId.smartIdNumber.startsWith('FG-STU-'), 'Smart ID number starts with FG-STU- (got: ' + testSmartId.smartIdNumber + ')');
  assert(testSmartId.rfidUid && testSmartId.rfidUid.startsWith('E0:04:01:'), 'Smart ID RFID UID starts with standard ISO 15693 prefix E0:04:01: (got: ' + testSmartId.rfidUid + ')');
  assert(testSmartId.barcode && testSmartId.barcode.includes(testSmartId.smartIdNumber), 'Smart ID barcode contains smartIdNumber');
  assert(testSmartId.qrData && testSmartId.qrData.includes('verify.flawlessgraphics.com'), 'Smart ID QR data links to verification URL');
  assert(testSmartId.issueDate && testSmartId.expiryDate, 'Smart ID includes issueDate and expiryDate');
  assert(testSmartId.securityHash && testSmartId.securityHash.startsWith('SEC-'), 'Smart ID includes securityHash');
  
  // Test auto-generation on user registration save
  authWin.AuthSession.saveRegisteredUser({
    email: 'newuser@school.edu',
    name: 'New Student',
    role: 'student'
  });
  const savedUsers = JSON.parse(authWin.localStorage.getItem('organizations_users') || '[]');
  const saved = savedUsers.find(u => u.email === 'newuser@school.edu');
  assert(saved && saved.smartId, 'saveRegisteredUser automatically attaches smartId object to newly registered user');
  assert(saved && saved.smartIdNumber && saved.smartIdNumber.startsWith('FG-STU-'), 'Saved user receives smartIdNumber');
} catch (err) {
  assert(false, 'AuthSession verification failed: ' + err.message);
}

// 10. Light Theme Verification in student-login.html & student-dashboard.html
console.log('\n--- Light Theme & Visual Styling Verification ---');
// student-login.html light theme assertions
assert(loginHtml.includes('#FAF7F2'), 'student-login.html body uses warm executive light canvas #FAF7F2');
assert(loginHtml.includes('.app-window') && loginHtml.includes('background: #ffffff;'), 'student-login.html window frame uses clean white #ffffff background');
assert(!loginHtml.includes('background: #0B0813;') && !loginHtml.includes('background: #130E24;'), 'student-login.html no longer uses dark purple #0B0813/#130E24 canvas');

// student-dashboard.html light theme assertions
assert(dashHtml.includes('--bg-dark: #FAF7F2;'), 'student-dashboard.html sets --bg-dark to light executive canvas #FAF7F2');
assert(dashHtml.includes('--bg-card: #ffffff;'), 'student-dashboard.html sets --bg-card to pure white #ffffff');
assert(dashHtml.includes('--text-main: #0f172a;'), 'student-dashboard.html sets --text-main to crisp slate #0f172a');
assert(!dashHtml.includes('--bg-dark: #0B0813;') && !dashHtml.includes('--bg-card: #130E24;'), 'student-dashboard.html removed dark purple theme tokens');

// 11. Standstill Sidebar Navigation Layout & Color Harmonization Verification
console.log('\n--- Standstill Sidebar Layout & Color Harmonization Verification ---');
assert(dashHtml.includes('overflow: hidden') && dashHtml.includes('height: 100vh'), 'student-dashboard.html locks html, body to 100vh with overflow: hidden');
assert(dashHtml.includes('.app-layout') && dashHtml.includes('height: calc(100vh - 64px)'), 'student-dashboard.html sets .app-layout height to calc(100vh - 64px)');
assert(dashHtml.includes('.app-sidebar') && dashHtml.includes('position: sticky'), 'student-dashboard.html sets .app-sidebar to position: sticky');
assert(dashHtml.includes('.app-sidebar') && dashHtml.includes('overflow-y: auto'), 'student-dashboard.html enables independent scroll for sidebar if needed (overflow-y: auto)');
assert(dashHtml.includes('.app-main') && dashHtml.includes('overflow-y: auto'), 'student-dashboard.html enables smooth independent scrolling for .app-main');
assert(dashHtml.includes('.app-sidebar') && dashHtml.includes('background: #0B1120;'), 'student-dashboard.html sidebar uses standout executive dark navy #0B1120');
assert(dashHtml.includes('.top-navbar') && dashHtml.includes('background: #ffffff;'), 'student-dashboard.html top navbar uses clean light background #ffffff');
assert(dashHtml.includes('sidebar-signout-btn'), 'student-dashboard.html includes dedicated .sidebar-signout-btn styling');

// 12. Smart ID Badge UI Elements in Student Dashboard
console.log('\n--- Smart ID Digital Badge UI Verification ---');
assert(dashHtml.includes('id="idCardNumber"'), 'student-dashboard.html includes #idCardNumber element');
assert(dashHtml.includes('id="idCardRfid"'), 'student-dashboard.html includes #idCardRfid element');
assert(dashHtml.includes('id="idCardBarcode"'), 'student-dashboard.html includes #idCardBarcode element');
assert(dashHtml.includes('id="idCardQr"'), 'student-dashboard.html includes #idCardQr element');
assert(dashHtml.includes('gold microchip') || dashHtml.includes('microchip') || dashHtml.includes('chip-lines'), 'student-dashboard.html includes realistic microchip representation');

console.log('================================================================');
console.log(`FINAL RESULTS: ${passedTests} passed, ${failedTests} failed`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL STUDENT PORTAL TESTS PASSED!');
}

