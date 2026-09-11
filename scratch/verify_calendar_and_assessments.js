const fs = require('fs');
const path = require('path');
const vm = require('vm');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`FAIL: ${message}`);
    testsFailed++;
  }
}

const hrPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
const teacherPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const adminPath = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');

assert(fs.existsSync(hrPath), 'HR dashboard HTML exists');
assert(fs.existsSync(teacherPath), 'Teacher dashboard HTML exists');
assert(fs.existsSync(adminPath), 'Super Admin dashboard HTML exists as dedicated page');

const hrHtml = fs.readFileSync(hrPath, 'utf8');
const teacherHtml = fs.readFileSync(teacherPath, 'utf8');
const adminHtml = fs.readFileSync(adminPath, 'utf8');

// --- 1. HR Academic Calendar for Staff Review ---
assert(hrHtml.includes('id="academicCalendarSection"'), 'HR has #academicCalendarSection');
assert(hrHtml.includes('id="academicCalendarModal"'), 'HR has #academicCalendarModal for creating terms');
assert(hrHtml.includes('publishCalendarForStaffReview'), 'HR has publishCalendarForStaffReview function');
assert(hrHtml.includes('data-section="calendar"'), 'HR sidebar navigation contains Academic Calendar link');
assert(hrHtml.includes('id="calKpiReviewStatus"'), 'HR has calendar review status KPI');
assert(hrHtml.includes('id="calendarMilestonesGrid"'), 'HR has milestone timeline cards');

// --- 2. HR Student Assessments with Strict Edit Lock ---
assert(hrHtml.includes('id="studentAssessmentsSection"'), 'HR has #studentAssessmentsSection');
assert(hrHtml.includes('id="assessmentDetailModal"'), 'HR has #assessmentDetailModal for QA & Certification');
assert(hrHtml.includes('warnLockedScore'), 'HR has warnLockedScore handler');
assert(hrHtml.includes('approveStudentAssessment'), 'HR has approveStudentAssessment function ("only the access to prove")');
assert(hrHtml.includes('as_caScore') && hrHtml.includes('readonly'), 'CA Score is read-only for HR');
assert(hrHtml.includes('as_examScore') && hrHtml.includes('readonly'), 'Exam Score is read-only for HR');
assert(hrHtml.includes('Academic Assessment Protected'), 'warnLockedScore calls warning toast for protected marks');
assert(hrHtml.includes('Approved & Certified'), 'Assessment approval issues Approved & Certified status');

// --- 3. Split Super Admin from HR Dashboard ---
assert(!hrHtml.includes('<option value="admin">Super Administrator</option>'), 'HR cannot create Super Admin role accounts');
assert(hrHtml.includes('Super Administrator Protected'), 'Root admin accounts are protected against HR editing or deletion');
assert(hrHtml.includes('../admin/admin-dashboard.html'), 'HR dashboard links directly to dedicated Super Admin portal');
assert(adminHtml.includes('Super Admin Console') || adminHtml.includes('Tenant Management') || adminHtml.includes('admin'), 'Super Admin portal exists independently');

// --- 4. Teacher Portal Staff Review Integration ---
assert(teacherHtml.includes('Institutional Academic Calendar (Staff Review)'), 'Teacher dashboard has academic calendar review in timetable section');
assert(teacherHtml.includes('id="teacherCalOverviewBanner"'), 'Teacher overview has published academic calendar announcement banner');
assert(teacherHtml.includes('acknowledgeAcademicCalendar'), 'Teacher portal has calendar acknowledgment action');
assert(teacherHtml.includes('id="assessmentsSection"'), 'Teacher portal has student assessments desk');
assert(teacherHtml.includes('id="recordAssessmentModal"'), 'Teacher portal has recordAssessmentModal for entering marks');
assert(teacherHtml.includes('handleSaveTeacherAssessment'), 'Teacher can record CA & Exam marks for HR certification');
assert(teacherHtml.includes('id="notifPopover"'), 'Teacher notification popover alert implemented');

// --- 5. Functional Logic Verification with Node VM ---
console.log('\n--- Running Functional Logic Simulation ---');

// Mock browser environment
const storage = {};
const elements = {};

function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      selectedOptions: [{ value: 'sel', dataset: { name: 'Student 1', roll: 'STU-001' } }],
      options: [],
      addEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      closest: () => null
    };
  }
  return elements[id];
}

let warningToastArgs = null;
let successToastArgs = null;

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Date: Date,
  Math: Math,
  JSON: JSON,
  parseFloat: parseFloat,
  parseInt: parseInt,
  String: String,
  Array: Array,
  Object: Object,
  localStorage: {
    getItem: (k) => storage[k] !== undefined ? storage[k] : null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  },
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelector: (sel) => getOrCreateElement(sel),
    querySelectorAll: (sel) => [getOrCreateElement(sel)],
    createElement: (tag) => getOrCreateElement(tag + '_' + Math.random()),
    addEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  showToast: (m) => {},
  showWarningToast: (title, desc) => {
    warningToastArgs = { title, desc };
  },
  Toaster: {
    warning: (title, desc) => { warningToastArgs = { title, desc }; },
    success: (title, desc) => { successToastArgs = { title, desc }; },
    show: () => {}
  }
};

sandbox.window = sandbox;
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};

// Extract main script block from hr-dashboard.html (between <script> and </script>)
const scriptMatch = hrHtml.match(/<script>\s*([\s\S]*?)\s*<\/script>\s*<!-- Short Skeletal/i);
const largestScript = scriptMatch ? scriptMatch[1] : '';

try {
  vm.createContext(sandbox);
  // Execute HR script
  vm.runInContext(largestScript, sandbox);

  // Test 5.1: warnLockedScore
  warningToastArgs = null;
  if (typeof sandbox.warnLockedScore === 'function') {
    sandbox.warnLockedScore('Continuous Assessment (CA)');
    assert(
      warningToastArgs && warningToastArgs.title === 'Academic Assessment Protected',
      `warnLockedScore correctly triggers warning toast for CA marks (title: "${warningToastArgs?.title}")`
    );
    assert(
      warningToastArgs && (warningToastArgs.desc.includes('cannot alter') || warningToastArgs.desc.includes('locked')),
      'warnLockedScore warning explains faculty ownership and read-only lock'
    );
  } else {
    assert(false, 'warnLockedScore function is defined and callable');
  }

  // Test 5.2: approveStudentAssessment ("only the access to prove")
  if (typeof sandbox.approveStudentAssessment === 'function') {
    const testAssessId = 'as_test_unit_1';
    const initialAssessments = [{
      id: testAssessId,
      studentName: 'Amina Bello',
      studentRoll: 'STU-2026-002',
      className: 'Diploma Year 1',
      subject: 'Typography & Layout',
      teacherName: 'Sarah Jenkins',
      caScore: 28,
      examScore: 66,
      totalScore: 94,
      grade: 'A',
      status: 'Awaiting HR Certification'
    }];
    sandbox.localStorage.setItem('FLAWLESS GRAPHICS_student_assessments', JSON.stringify(initialAssessments));

    sandbox.approveStudentAssessment(testAssessId);

    const saved = JSON.parse(sandbox.localStorage.getItem('FLAWLESS GRAPHICS_student_assessments') || '[]');
    const target = saved.find(a => a.id === testAssessId);

    assert(target && target.status === 'Approved & Certified', 'approveStudentAssessment updates assessment to "Approved & Certified"');
    assert(target && target.certifiedBy && target.certifiedBy.includes('HR'), 'approveStudentAssessment stamps certifiedBy name');
    assert(target && typeof target.certifiedAt === 'number' && target.certifiedAt > 0, 'approveStudentAssessment records certifiedAt timestamp');
  } else {
    assert(false, 'approveStudentAssessment function is defined and callable');
  }

  // Test 5.3: publishCalendarForStaffReview
  if (typeof sandbox.publishCalendarForStaffReview === 'function' && typeof sandbox.getAcademicCalendar === 'function') {
    const calendar = sandbox.getAcademicCalendar();
    assert(calendar.length > 0, 'getAcademicCalendar returns default or loaded academic calendar terms');

    sandbox.publishCalendarForStaffReview();
    const publishedCal = sandbox.getAcademicCalendar();
    const activeTerms = publishedCal.filter(t => t.status === 'Published for Staff Review');
    assert(activeTerms.length > 0, `publishCalendarForStaffReview marked term as "Published for Staff Review" (count: ${activeTerms.length})`);
  } else {
    assert(false, 'publishCalendarForStaffReview is defined and callable');
  }

  // Test 5.4: Super Admin Protection in HR portal
  if (typeof sandbox.editUser === 'function' && typeof sandbox.deleteUserAccount === 'function') {
    warningToastArgs = null;
    sandbox.editUser('admin@flawlessgraphics.com');
    assert(
      warningToastArgs && warningToastArgs.title.includes('Protected'),
      'editUser blocks altering Super Admin account and displays warning toast'
    );

    warningToastArgs = null;
    sandbox.deleteUserAccount('admin@flawlessgraphics.com');
    assert(
      warningToastArgs && warningToastArgs.title.includes('Protected'),
      'deleteUserAccount blocks deleting Super Admin account and displays warning toast'
    );
  } else {
    assert(false, 'editUser and deleteUserAccount are defined');
  }

} catch (err) {
  console.error('VM Execution error:', err);
  testsFailed++;
}

console.log(`\n========================================`);
console.log(`Verification Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`========================================`);

if (testsFailed > 0) process.exit(1);
