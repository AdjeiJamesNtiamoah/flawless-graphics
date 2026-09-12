// scratch/verify_teacher_portal_overhaul.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const teacherHtmlPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const htmlContent = fs.readFileSync(teacherHtmlPath, 'utf-8');

console.log('--- TEACHER DASHBOARD PROFESSIONAL PORTAL VERIFICATION ---');

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

// 1. Static HTML Assertions
const requiredElements = [
  'teacherDutyPill',
  'k_classes',
  'k_students',
  'k_att',
  'k_pending_grading',
  'k_teaching_load',
  'todayScheduleList',
  'overviewGradeDistribution',
  'classesCardsGrid',
  'classesTableViewContainer',
  'attendanceMarkArea',
  'rollCallTally',
  'assignmentList',
  'assessStandardContainer',
  'assessBatchContainer',
  'batchScoresTableBody',
  'subTabLeaveContainer',
  'subTabCommsContainer',
  'teacherLeaveForm',
  'notesList',
  'periodMatrixTable',
  'teacherCalendarContainer',
  'transcriptModal',
  'lessonPlanModal',
  'assignmentModal'
];

requiredElements.forEach(id => {
  assert(htmlContent.includes(`id="${id}"`), `UI Container #${id} exists in HTML`);
});

// Check assignment lifecycle tabs exist
assert(htmlContent.includes('class="btn ghost btn-sm assign-tab active"'), 'Assignment lifecycle filter tabs exist');

// 2. Extract inline script cleanly
const startTag = '<script>';
const endTag = '</script>';
const scriptStart = htmlContent.indexOf(startTag);
assert(scriptStart !== -1, 'Found opening <script> tag');

const scriptEnd = htmlContent.indexOf(endTag, scriptStart);
assert(scriptEnd !== -1, 'Found closing </script> tag');

const scriptCode = htmlContent.substring(scriptStart + startTag.length, scriptEnd);
assert(scriptCode.length > 50000, `Extracted primary inline script block (${scriptCode.length} chars)`);

// Build mock DOM environment
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
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
        contains(c) { return this.classes.has(c); }
      },
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      addEventListener: () => {},
      focus: () => {},
      reset: () => {}
    };
  }
  return elements[id];
}

const mockDocument = {
  getElementById: (id) => getOrCreateElement(id),
  querySelector: (sel) => getOrCreateElement(sel.replace(/[^a-zA-Z0-9_-]/g, '')),
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: {
    classList: {
      toggle: () => {},
      add: () => {},
      remove: () => {}
    },
    appendChild: () => {},
    removeChild: () => {}
  },
  createElement: (tag) => ({
    setAttribute: () => {},
    click: () => {},
    style: {},
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  })
};

const mockWindow = {
  localStorage: {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { for (let k in storage) delete storage[k]; }
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  document: mockDocument,
  alert: (msg) => console.log('Mock Alert:', msg),
  confirm: () => true,
  prompt: () => '',
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  Date,
  Math,
  Blob: class {},
  URL: { createObjectURL: () => 'blob:mock' },
  scrollTo: () => {},
  print: () => {}
};

mockWindow.window = mockWindow;
mockWindow.localStorage.setItem('active_teacher', JSON.stringify({
  id: 't_demo_1',
  name: 'Dr. Michael Bruce',
  email: 'm.bruce@flawless.edu',
  subject: 'Integrated Chemistry & Physics',
  department: 'Science & STEM',
  title: 'Senior Faculty Head'
}));

const context = vm.createContext(mockWindow);

// Run the script
try {
  vm.runInContext(scriptCode, context);
  console.log('PASS: Teacher dashboard script executed without unhandled errors.');
  testsPassed++;
} catch (e) {
  console.error('FAIL: Error running teacher dashboard script:', e);
  testsFailed++;
}

// 3. Verify Functions on Window Context
const requiredFunctions = [
  'calculateWAECGrade',
  'switchClassesView',
  'startClassRollCall',
  'renderAttendanceMarkArea',
  'setStudentAttendance',
  'bulkSetAttendance',
  'resetAttendanceRegister',
  'saveAttendanceRegister',
  'filterAssignments',
  'openAssignmentCreateModal',
  'switchAssessMode',
  'renderBatchScoreTable',
  'recalcBatchRow',
  'saveAllBatchScores',
  'openTranscriptPreviewModal',
  'renderTranscriptContent',
  'switchMsgSubTab',
  'calcLeaveDays',
  'handleTeacherLeaveSubmit',
  'renderNotes',
  'viewLessonPlan',
  'renderPeriodMatrix',
  'renderTodayScheduleList',
  'renderOverviewGradeDistribution',
  'renderTeacherCalendarReview',
  'acknowledgeAcademicCalendar'
];

requiredFunctions.forEach(fn => {
  assert(typeof context[fn] === 'function', `Global function ${fn}() is defined and exposed`);
});

// 4. Test WAEC 9-point grading scale
const testGrades = [
  { score: 92, expectedGrade: 'A1', expectedClass: 'grade-a1' },
  { score: 72, expectedGrade: 'B2', expectedClass: 'grade-b2' },
  { score: 66, expectedGrade: 'B3', expectedClass: 'grade-b3' },
  { score: 62, expectedGrade: 'C4', expectedClass: 'grade-c4' },
  { score: 58, expectedGrade: 'C5', expectedClass: 'grade-c5' },
  { score: 52, expectedGrade: 'C6', expectedClass: 'grade-c6' },
  { score: 47, expectedGrade: 'D7', expectedClass: 'grade-d7' },
  { score: 41, expectedGrade: 'E8', expectedClass: 'grade-e8' },
  { score: 32, expectedGrade: 'F9', expectedClass: 'grade-f9' }
];

testGrades.forEach(tg => {
  const res = context.calculateWAECGrade(tg.score);
  assert(
    res.grade === tg.expectedGrade && res.class === tg.expectedClass,
    `WAEC Score ${tg.score} accurately maps to ${tg.expectedGrade} (${tg.expectedClass})`
  );
});

// 5. Test Leave Calculation
const sInput = getOrCreateElement('tl_startDate');
const eInput = getOrCreateElement('tl_endDate');
sInput.value = '2026-10-05';
eInput.value = '2026-10-09';
const days = context.calcLeaveDays();
assert(days === 5, `calcLeaveDays correctly calculates 5 calendar/working days inclusive (got ${days})`);

// 6. Test Batch Assessment Mode Switch
context.switchAssessMode('batch');
const batchContainer = getOrCreateElement('assessBatchContainer');
const stdContainer = getOrCreateElement('assessStandardContainer');
assert(
  batchContainer.style.display === 'block' && stdContainer.style.display === 'none',
  'switchAssessMode("batch") displays batch score entry view'
);

context.switchAssessMode('standard');
assert(
  batchContainer.style.display === 'none' && stdContainer.style.display === 'block',
  'switchAssessMode("standard") displays standard assessment table view'
);

// 7. Test Duty Leave Desk Tab Switch
context.switchMsgSubTab('leave');
const leaveSub = getOrCreateElement('subTabLeaveContainer');
const commsSub = getOrCreateElement('subTabCommsContainer');
assert(
  leaveSub.style.display === 'block' && commsSub.style.display === 'none',
  'switchMsgSubTab("leave") displays Faculty Duty Leave Desk'
);

// 8. Test Roll Call Attendance Marking
const attSelect = getOrCreateElement('attClassSelect');
attSelect.value = 'c_demo_sci10';

context.setStudentAttendance('s_101', 'late');
let rollCallState = context.getCurrentRollCall ? context.getCurrentRollCall() : {};
assert(rollCallState && rollCallState['s_101'] === 'late', 'setStudentAttendance successfully marks student as late');

context.bulkSetAttendance('present');
rollCallState = context.getCurrentRollCall ? context.getCurrentRollCall() : {};
assert(rollCallState && rollCallState['s_101'] === 'present', 'bulkSetAttendance("present") successfully sets all students to present');

console.log(`\n========================================`);
console.log(`FINAL RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`========================================`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('ALL TEACHER PORTAL TESTS PASSED!');
}
