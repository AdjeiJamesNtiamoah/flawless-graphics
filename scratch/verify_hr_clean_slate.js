const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('--- TESTING HR DASHBOARD PURE SUPABASE CLOUD SYNC & CLEAN SLATE ---');
console.log('================================================================\n');

// Set up localStorage with previous organization and cross-org polluted data
const storage = {
  active_org: 'CAPE COAST UNIVERSITY',
  activeOrg: 'CAPE COAST UNIVERSITY',
  active_user: JSON.stringify({
    name: 'Adjei James Kofi Ntiamoah',
    email: 'adjeijames175@gmail.com',
    role: 'HR',
    org: 'CAPE COAST UNIVERSITY'
  }),
  activeHR: JSON.stringify({
    name: 'Adjei James Kofi Ntiamoah',
    email: 'adjeijames175@gmail.com',
    role: 'HR',
    org: 'CAPE COAST UNIVERSITY'
  }),
  // Polluted legacy data from previous/deleted organizations
  'fg_classes': JSON.stringify([{ id: '1A', name: '1A', students: [{ name: 'Eugene Yaw Adjei', roll: 'STU-2026-001' }] }]),
  'classes': JSON.stringify([{ id: '1A', name: '1A' }]),
  'teachers': JSON.stringify([{ id: 't1', name: 'James Ntiamoah', email: 'admin@flawlessgraphics.com' }]),
  'students': JSON.stringify([{ id: 's1', name: 'Eugene Yaw Adjei', roll: 'STU-2026-001' }]),
  'fg_student_fees': JSON.stringify([{ id: 'f1', amount: 500 }]),
  'FLAWLESS GRAPHICS_classes': JSON.stringify([{ id: 'c_form2', name: 'Form 2', subject: 'English Language' }]),
  'DELETED_ORG_classes': JSON.stringify([{ id: 'c_del', name: 'Old Class' }]),
  'DELETED_ORG_students': JSON.stringify([{ id: 's_del', name: 'Old Student' }]),
  'CAPE COAST UNIVERSITY_classes': JSON.stringify([{ id: '1A', name: '1A', students: [{ name: 'Eugene Yaw Adjei' }] }]),
  'CAPE COAST UNIVERSITY_subjects': JSON.stringify([{ name: 'English Language', code: 'ENG' }])
};

const mockElements = {
  sideOrg: { textContent: '', style: {} },
  sideName: { textContent: '', style: {} },
  sideEmail: { textContent: '', style: {} },
  cloudSyncLabel: { textContent: '', style: {} },
  cloudSyncIcon: { className: '', style: {} },
  cloudSyncBtn: { style: {} },
  orgSwitcher: { innerHTML: '', appendChild: () => {}, addEventListener: () => {}, style: {} },
  classesTableBody: { innerHTML: '', style: {} },
  subjectsTableBody: { innerHTML: '', style: {} },
  studentTableBody: { innerHTML: '', style: {} },
  teacherTable: { innerHTML: '', style: {} },
  classMetricsSummary: { innerHTML: '', style: {} },
  subjectMetricsSummary: { innerHTML: '', style: {} },
  toast: { classList: { add: () => {}, remove: () => {} }, style: {} },
  toastText: { textContent: '', style: {} },
  skeletonLoader: { classList: { add: () => {} }, parentNode: null, style: {} }
};

const domMock = {
  getElementById: (id) => mockElements[id] || { value: '', innerHTML: '', style: {}, addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
  querySelectorAll: () => [],
  createElement: (tag) => ({ tagName: tag, value: '', textContent: '', style: {}, classList: { add: () => {}, remove: () => {} }, setAttribute: () => {}, appendChild: () => {} }),
  addEventListener: () => {},
  readyState: 'complete'
};

const windowMock = {
  localStorage: {
    getItem: (k) => storage[k] !== undefined ? storage[k] : null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    key: (i) => Object.keys(storage)[i],
    get length() { return Object.keys(storage).length; }
  },
  document: domMock,
  addEventListener: () => {},
  dispatchEvent: () => {},
  location: { replace: () => {}, reload: () => {} },
  AuthSession: {
    getUser: () => JSON.parse(storage.active_user),
    requireAuth: () => JSON.parse(storage.active_user)
  },
  SupabaseConfig: {
    isConfigured: () => true
  },
  SupabaseService: {
    getOrganizations: async () => [
      { id: 'org_1', org_name: 'FLAWLESS GRAPHICS', name: 'FLAWLESS GRAPHICS' },
      { id: 'org_2', org_name: 'CAPE COAST UNIVERSITY', name: 'CAPE COAST UNIVERSITY' }
    ],
    getUserByEmail: async () => ({ email: 'adjeijames175@gmail.com', status: 'active', org: 'CAPE COAST UNIVERSITY' }),
    getTeachers: async () => [],
    getAttendance: async () => [],
    getAnnouncements: async () => [],
    getStudents: async () => [],
    getClasses: async () => [],
    getSubjects: async () => [],
    getPayroll: async () => [],
    getUsers: async () => [
      { email: 'adjeijames175@gmail.com', name: 'Adjei James Kofi Ntiamoah', role: 'hr', org: 'CAPE COAST UNIVERSITY' }
    ]
  }
};

const sandbox = {
  window: windowMock,
  document: domMock,
  localStorage: windowMock.localStorage,
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  CustomEvent: class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } }
};

// Extract JS code from hr-dashboard.html
const hrHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const scriptMatches = hrHtml.match(/<script>([\s\S]*?)<\/script>/gi);
let appScript = '';
for (const sm of scriptMatches) {
  if (sm.includes('loadHRCloudData')) {
    appScript = sm.replace(/<\/?script>/gi, '');
    break;
  }
}

vm.createContext(sandbox);

(async () => {
  try {
    vm.runInContext(appScript, sandbox);
    
    // Call bootstrapApp in the sandbox
    await sandbox.bootstrapApp();

    console.log('--- 1. Testing Storage Sanitization ---');
    assert.strictEqual(storage['fg_classes'], undefined, 'Legacy fg_classes key must be purged');
    assert.strictEqual(storage['classes'], undefined, 'Legacy classes key must be purged');
    assert.strictEqual(storage['teachers'], undefined, 'Legacy teachers key must be purged');
    assert.strictEqual(storage['students'], undefined, 'Legacy students key must be purged');
    assert.strictEqual(storage['fg_student_fees'], undefined, 'Legacy fg_student_fees key must be purged');
    assert.strictEqual(storage['DELETED_ORG_classes'], undefined, 'Deleted organization classes must be purged');
    assert.strictEqual(storage['DELETED_ORG_students'], undefined, 'Deleted organization students must be purged');
    console.log('✓ PASS: All legacy un-scoped and deleted organization keys purged');

    console.log('\n--- 2. Testing Pure Supabase Data Loading for New Organization ---');
    const classes = sandbox.getClassesList();
    assert.strictEqual(classes.length, 0, `Classes must be 0 for CAPE COAST UNIVERSITY, got ${classes.length}`);
    console.log('✓ PASS: getClassesList() returns [] (0 classes)');

    const subjects = sandbox.getSubjectsList();
    assert.strictEqual(subjects.length, 0, `Subjects must be 0 for CAPE COAST UNIVERSITY, got ${subjects.length}`);
    console.log('✓ PASS: getSubjectsList() returns [] (0 subjects)');

    const students = sandbox.getEnrolledStudentsList();
    assert.strictEqual(students.length, 0, `Students must be 0 for CAPE COAST UNIVERSITY, got ${students.length}`);
    console.log('✓ PASS: getEnrolledStudentsList() returns [] (0 students)');

    const teachers = sandbox.getAvailableTeachers();
    assert.strictEqual(teachers.length, 0, `Teachers must be 0 for CAPE COAST UNIVERSITY, got ${teachers.length}`);
    console.log('✓ PASS: getAvailableTeachers() returns [] (0 teachers)');

    console.log('\n--- 3. Testing LocalStorage Synchronization ---');
    assert.strictEqual(storage['CAPE COAST UNIVERSITY_classes'], '[]', 'Active org classes in storage must be reset to []');
    assert.strictEqual(storage['CAPE COAST UNIVERSITY_subjects'], '[]', 'Active org subjects in storage must be reset to []');
    assert.strictEqual(storage['CAPE COAST UNIVERSITY_students'], '[]', 'Active org students in storage must be reset to []');
    assert.strictEqual(storage['CAPE COAST UNIVERSITY_teachers'], '[]', 'Active org teachers in storage must be reset to []');
    console.log('✓ PASS: Active organization storage keys properly synchronized to []');

    console.log('\n--- 4. Testing Empty State UI Rendering ---');
    assert(mockElements.classesTableBody.innerHTML.includes('No Academic Classrooms Added Yet'), 'Classes table must display empty state');
    assert(mockElements.subjectsTableBody.innerHTML.includes('No Curriculum Subjects Registered'), 'Subjects table must display empty state');
    assert(mockElements.studentTableBody.innerHTML.includes('No students registered yet'), 'Student table must display empty state');
    console.log('✓ PASS: Empty state message rendered correctly across all tables');

    console.log('\n================================================================');
    console.log('🎉 ALL TESTS PASSED! HR PORTAL CALLS EXCLUSIVELY FROM SUPABASE');
    console.log('================================================================');
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
})();
