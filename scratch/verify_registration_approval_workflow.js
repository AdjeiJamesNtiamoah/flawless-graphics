// scratch/verify_registration_approval_workflow.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('--- ACADEMIC REGISTRATION HR APPROVAL WORKFLOW VERIFICATION ---');
console.log('================================================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

const teacherHtmlPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const hrHtmlPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');

const teacherHtml = fs.readFileSync(teacherHtmlPath, 'utf8');
const hrHtml = fs.readFileSync(hrHtmlPath, 'utf8');

// --- 1. Static HTML Assertions: Teacher Dashboard ---
assert(teacherHtml.includes('Pending HR Approval'), 'Teacher portal includes Pending HR Approval status string');
assert(teacherHtml.includes('addHRRegistrationApproval'), 'Teacher portal defines addHRRegistrationApproval function');
assert(teacherHtml.includes('Submit for HR Approval'), 'Teacher student registration modal button says "Submit for HR Approval"');
assert(teacherHtml.includes('Request New Class Registration'), 'Teacher new class prompt specifies "Request New Class Registration"');
assert(teacherHtml.includes('Pending HR Approval') && teacherHtml.includes('<option value="Pending HR Approval">'), 'Teacher student registration modal has Pending HR Approval dropdown option');
assert(teacherHtml.includes('status-pending-hr-approval'), 'Teacher portal CSS contains .status-pending-hr-approval badge style');

// --- 2. Static HTML Assertions: HR Dashboard ---
assert(hrHtml.includes('id="classPendingApprovalBanner"'), 'HR dashboard has #classPendingApprovalBanner');
assert(hrHtml.includes('id="studentPendingApprovalBanner"'), 'HR dashboard has #studentPendingApprovalBanner');
assert(hrHtml.includes('approveClassRegistration'), 'HR dashboard defines approveClassRegistration');
assert(hrHtml.includes('rejectClassRegistration'), 'HR dashboard defines rejectClassRegistration');
assert(hrHtml.includes('approveAllPendingClasses'), 'HR dashboard defines approveAllPendingClasses');
assert(hrHtml.includes('approveStudentRegistration'), 'HR dashboard defines approveStudentRegistration');
assert(hrHtml.includes('rejectStudentRegistration'), 'HR dashboard defines rejectStudentRegistration');
assert(hrHtml.includes('approveAllPendingStudents'), 'HR dashboard defines approveAllPendingStudents');

// --- 3. Functional Simulation of Teacher & HR Workflow ---
const sharedStorage = {};

function createMockDom(initialStorage) {
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

  const doc = {
    getElementById: (id) => getEl(id),
    querySelector: (sel) => getEl(sel.replace(/[^a-zA-Z0-9_-]/g, '')),
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { classList: { toggle: () => {}, add: () => {}, remove: () => {} }, appendChild: () => {}, removeChild: () => {} },
    createElement: (tag) => ({
      setAttribute: () => {},
      options: [],
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      click: () => {},
      style: {}
    })
  };

  const win = {
    localStorage: {
      getItem: (k) => sharedStorage[k] || null,
      setItem: (k, v) => { sharedStorage[k] = String(v); },
      removeItem: (k) => { delete sharedStorage[k]; },
      clear: () => { for (let k in sharedStorage) delete sharedStorage[k]; }
    },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: doc,
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
    print: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    location: { href: '', reload: () => {}, search: '' },
    navigator: { userAgent: 'Node-Mock' },
    CustomEvent: class CustomEvent { constructor(type, opt) { this.type = type; Object.assign(this, opt); } }
  };
  win.window = win;
  win.self = win;
  return { doc, win, getEl };
}

// Extract Teacher Dashboard Script
const tStart = teacherHtml.indexOf('<script>');
const tEnd = teacherHtml.indexOf('</script>', tStart);
const teacherScriptCode = teacherHtml.substring(tStart + 8, tEnd);

const teacherEnv = createMockDom(sharedStorage);
teacherEnv.win.localStorage.setItem('active_teacher', JSON.stringify({
  id: 't_demo_1',
  name: 'Dr. Michael Bruce',
  email: 'm.bruce@flawless.edu',
  subject: 'Integrated Chemistry & Physics'
}));

const teacherContext = vm.createContext(teacherEnv.win);
try {
  vm.runInContext(teacherScriptCode, teacherContext);
  assert(true, 'Teacher Dashboard script executed in VM');
} catch (e) {
  assert(false, 'Teacher script execution error: ' + e.message);
}

// Extract HR Dashboard Script
const hrStart = hrHtml.indexOf('<script>');
const hrEnd = hrHtml.indexOf('</script>', hrStart);
const hrScriptCode = hrHtml.substring(hrStart + 8, hrEnd);

const hrEnv = createMockDom(sharedStorage);
hrEnv.win.localStorage.setItem('active_user', JSON.stringify({
  id: 'hr_1',
  name: 'Sarah Mensah',
  email: 's.mensah@flawless.edu',
  role: 'hr'
}));

const hrContext = vm.createContext(hrEnv.win);
try {
  vm.runInContext(hrScriptCode, hrContext);
  assert(true, 'HR Dashboard script executed in VM');
} catch (e) {
  assert(false, 'HR script execution error: ' + e.message);
}

// --- Test Flow 1: Teacher Adds a New Class ---
console.log('\n--- Scenario 1: Teacher creates a class -> Status must be Pending HR Approval ---');
const teacherClassesKey = 'FLAWLESS GRAPHICS_classes';
let classes = JSON.parse(sharedStorage[teacherClassesKey] || '[]');
const testClassId = 'c_test_' + Date.now();
const newTestClass = {
  id: testClassId,
  name: 'Grade 11 - Computer Systems Engineering',
  subject: 'Hardware & Embedded Logic',
  room: 'Engineering Lab 4',
  teacherName: 'Dr. Michael Bruce',
  teacherEmail: 'm.bruce@flawless.edu',
  status: 'Pending HR Approval',
  approvalStatus: 'pending',
  submittedBy: 'Dr. Michael Bruce',
  submittedByEmail: 'm.bruce@flawless.edu',
  submittedAt: Date.now(),
  syllabusPct: 0,
  students: []
};

classes.push(newTestClass);
sharedStorage[teacherClassesKey] = JSON.stringify(classes);

teacherContext.addHRRegistrationApproval({
  id: 'req_' + Date.now(),
  type: 'class',
  targetId: testClassId,
  title: `New Classroom: ${newTestClass.name} (${newTestClass.subject})`,
  name: newTestClass.name,
  subject: newTestClass.subject,
  submittedBy: 'Dr. Michael Bruce',
  submittedByEmail: 'm.bruce@flawless.edu',
  submittedAt: Date.now(),
  status: 'pending'
});

classes = JSON.parse(sharedStorage[teacherClassesKey]);
const addedClass = classes.find(c => c.id === testClassId);
assert(addedClass !== undefined, 'New class persisted to shared localStorage');
assert(addedClass.status === 'Pending HR Approval', `New class status is 'Pending HR Approval' (got: ${addedClass.status})`);
assert(addedClass.approvalStatus === 'pending', `New class approvalStatus is 'pending' (got: ${addedClass.approvalStatus})`);

// --- Test Flow 2: Teacher Registers a New Student ---
console.log('\n--- Scenario 2: Teacher registers a student -> Status must be Pending HR Approval ---');
const testStudentId = 's_test_' + Date.now();
const newTestStudent = {
  id: testStudentId,
  firstName: 'Kwame',
  middleName: 'K.',
  lastName: 'Asante',
  roll: 'STU-2026-999',
  gender: 'Male',
  status: 'Pending HR Approval',
  approvalStatus: 'pending',
  submittedBy: 'Dr. Michael Bruce',
  submittedByEmail: 'm.bruce@flawless.edu',
  submittedAt: Date.now(),
  classId: testClassId,
  className: newTestClass.name,
  createdAt: Date.now()
};

addedClass.students = addedClass.students || [];
addedClass.students.push(newTestStudent);
sharedStorage[teacherClassesKey] = JSON.stringify(classes);

teacherContext.addHRRegistrationApproval({
  id: 'req_' + Date.now(),
  type: 'student',
  targetId: testStudentId,
  classId: testClassId,
  className: newTestClass.name,
  studentName: 'Kwame Asante',
  roll: 'STU-2026-999',
  gender: 'Male',
  submittedBy: 'Dr. Michael Bruce',
  submittedByEmail: 'm.bruce@flawless.edu',
  submittedAt: Date.now(),
  status: 'pending'
});

classes = JSON.parse(sharedStorage[teacherClassesKey]);
const currentCls = classes.find(c => c.id === testClassId);
const addedStudent = currentCls.students.find(s => s.id === testStudentId);
assert(addedStudent !== undefined, 'New student persisted inside class in shared localStorage');
assert(addedStudent.status === 'Pending HR Approval', `New student status is 'Pending HR Approval' (got: ${addedStudent.status})`);
assert(addedStudent.approvalStatus === 'pending', `New student approvalStatus is 'pending' (got: ${addedStudent.approvalStatus})`);

// --- Test Flow 3: HR Approves Class Registration ---
console.log('\n--- Scenario 3: HR Approves Class Registration ---');
assert(typeof hrContext.approveClassRegistration === 'function', 'HR approveClassRegistration function exists');
hrContext.approveClassRegistration(testClassId);

classes = JSON.parse(sharedStorage[teacherClassesKey]);
const approvedCls = classes.find(c => c.id === testClassId);
assert(approvedCls.status === 'Active', `Class status updated to 'Active' upon HR approval (got: ${approvedCls.status})`);
assert(approvedCls.approvalStatus === 'approved', `Class approvalStatus updated to 'approved' (got: ${approvedCls.approvalStatus})`);
assert(approvedCls.approvedBy === 'HR Directorate', `Class approvedBy stamped with 'HR Directorate' (got: ${approvedCls.approvedBy})`);
assert(typeof approvedCls.approvedAt === 'number', 'Class approvedAt has valid numeric timestamp');

// --- Test Flow 4: HR Approves Student Registration ---
console.log('\n--- Scenario 4: HR Approves Student Registration ---');
assert(typeof hrContext.approveStudentRegistration === 'function', 'HR approveStudentRegistration function exists');
hrContext.approveStudentRegistration(testStudentId, testClassId);

classes = JSON.parse(sharedStorage[teacherClassesKey]);
const updatedCls = classes.find(c => c.id === testClassId);
const approvedStudent = updatedCls.students.find(s => s.id === testStudentId);
assert(approvedStudent.status === 'Active', `Student status updated to 'Active' upon HR approval (got: ${approvedStudent.status})`);
assert(approvedStudent.approvalStatus === 'approved', `Student approvalStatus updated to 'approved' (got: ${approvedStudent.approvalStatus})`);
assert(approvedStudent.approvedBy === 'HR Directorate', `Student approvedBy stamped with 'HR Directorate' (got: ${approvedStudent.approvedBy})`);
assert(typeof approvedStudent.approvedAt === 'number', 'Student approvedAt has valid numeric timestamp');

// --- Test Flow 5: Rejection Workflow ---
console.log('\n--- Scenario 5: HR Rejection of Class & Student ---');
const rejectClassId = 'c_rej_' + Date.now();
classes.push({
  id: rejectClassId,
  name: 'Grade 12 - Unapproved Exploratory Module',
  status: 'Pending HR Approval',
  approvalStatus: 'pending',
  students: [
    { id: 's_rej_1', firstName: 'Kofi', lastName: 'RejectMe', status: 'Pending HR Approval', approvalStatus: 'pending' }
  ]
});
sharedStorage[teacherClassesKey] = JSON.stringify(classes);

hrContext.rejectClassRegistration(rejectClassId);
classes = JSON.parse(sharedStorage[teacherClassesKey]);
const rejectedCls = classes.find(c => c.id === rejectClassId);
assert(rejectedCls.status === 'Rejected', `Class marked as 'Rejected' upon HR decline (got: ${rejectedCls.status})`);
assert(rejectedCls.approvalStatus === 'rejected', `Class approvalStatus set to 'rejected' (got: ${rejectedCls.approvalStatus})`);

hrContext.rejectStudentRegistration('s_rej_1', rejectClassId);
classes = JSON.parse(sharedStorage[teacherClassesKey]);
const rejClsAfter = classes.find(c => c.id === rejectClassId);
const rejStud = rejClsAfter.students.find(s => s.id === 's_rej_1');
assert(rejStud.status === 'Rejected', `Student marked as 'Rejected' upon HR decline (got: ${rejStud.status})`);

// --- Test Flow 6: Bulk Approval of Pending Classes & Students ---
console.log('\n--- Scenario 6: HR Bulk Approval ---');
classes.push({
  id: 'c_bulk_1',
  name: 'Bulk Class 1',
  status: 'Pending HR Approval',
  approvalStatus: 'pending',
  students: [{ id: 's_bulk_1', firstName: 'Alice', lastName: 'A', status: 'Pending HR Approval', approvalStatus: 'pending' }]
});
classes.push({
  id: 'c_bulk_2',
  name: 'Bulk Class 2',
  status: 'Pending HR Approval',
  approvalStatus: 'pending',
  students: [{ id: 's_bulk_2', firstName: 'Bob', lastName: 'B', status: 'Pending HR Approval', approvalStatus: 'pending' }]
});
sharedStorage[teacherClassesKey] = JSON.stringify(classes);

hrContext.approveAllPendingClasses();
classes = JSON.parse(sharedStorage[teacherClassesKey]);
const bCls1 = classes.find(c => c.id === 'c_bulk_1');
const bCls2 = classes.find(c => c.id === 'c_bulk_2');
assert(bCls1.status === 'Active' && bCls2.status === 'Active', 'approveAllPendingClasses successfully approves all pending classes');

hrContext.approveAllPendingStudents();
classes = JSON.parse(sharedStorage[teacherClassesKey]);
const bCls1Up = classes.find(c => c.id === 'c_bulk_1');
const bCls2Up = classes.find(c => c.id === 'c_bulk_2');
assert(bCls1Up.students[0].status === 'Active' && bCls2Up.students[0].status === 'Active', 'approveAllPendingStudents successfully approves all pending students');

console.log(`\n================================================================`);
console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
console.log(`================================================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL REGISTRATION APPROVAL WORKFLOW TESTS PASSED!');
}
