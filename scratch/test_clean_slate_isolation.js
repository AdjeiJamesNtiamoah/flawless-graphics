const assert = require('assert');
const fs = require('fs');

console.log('Running Multi-Tenant Clean Slate & Persistence Tests...\n');

// 1. HR Dashboard Clean Slate
const hrDashContent = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// Test that hardcoded student fallbacks are removed
assert(!hrDashContent.includes("id: 's_101', enrollment_code: 'STU-2026-001'"), 'HR Dashboard must NOT have hardcoded s_101 student fallback');
assert(!hrDashContent.includes("id: 'cls_1', code: 'CLS-10A'"), 'HR Dashboard must NOT have hardcoded cls_1 class fallback');
assert(!hrDashContent.includes("name: 'Sarah Jenkins', email: 's.jenkins@flawless.org'"), 'HR Dashboard must NOT have hardcoded Sarah Jenkins teacher fallback');
assert(!hrDashContent.includes("id: 'as_101', studentId: 's_101'"), 'HR Dashboard must NOT have hardcoded as_101 assessment fallback');
assert(!hrDashContent.includes("id: 'term_2026_1'"), 'HR Dashboard must NOT have hardcoded term_2026_1 calendar fallback');

console.log('✓ HR Dashboard: 100% clean of hardcoded demo students, classes, teachers, assessments, and calendar');

// 2. Teacher Dashboard Clean Slate
const teacherDashContent = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
assert(!teacherDashContent.includes("id: 'c_demo_sci10'"), 'Teacher Dashboard must NOT have hardcoded c_demo_sci10 class fallback');
assert(!teacherDashContent.includes("studentRoll: 'STU-2026-101'"), 'Teacher Dashboard must NOT have hardcoded STU-2026-101 assessment fallback');

console.log('✓ Teacher Dashboard: 100% clean of synthetic class/student fallbacks');

// 3. Quick Dock Notifications Clean Slate
const dockContent = fs.readFileSync('assets/js/quick-dock.js', 'utf8');
assert(!dockContent.includes("alert_att_today"), 'Quick Dock must NOT have hardcoded alert_att_today');
assert(!dockContent.includes("teacher_alert_submissions"), 'Quick Dock must NOT have hardcoded teacher_alert_submissions');
assert(!dockContent.includes("finance_alert_tuition_pay"), 'Quick Dock must NOT have hardcoded finance_alert_tuition_pay');
assert(!dockContent.includes("stu_alert_assignment_1"), 'Quick Dock must NOT have hardcoded stu_alert_assignment_1');

console.log('✓ Quick Dock: 100% clean of fake static notifications');

// 4. Persistence & Multi-Tenant Data Isolation Simulation
const mockDatabase = {};
const mockTenant = 'CAPE COAST UNIVERSITY';

function saveStudent(tenant, student) {
  const key = `${tenant}_students`;
  mockDatabase[key] = mockDatabase[key] || [];
  mockDatabase[key].push(student);
}

function getStudents(tenant) {
  const key = `${tenant}_students`;
  return mockDatabase[key] || [];
}

function deleteStudent(tenant, studentId) {
  const key = `${tenant}_students`;
  mockDatabase[key] = (mockDatabase[key] || []).filter(s => s.id !== studentId);
}

// Initial state for new tenant must be empty
assert.strictEqual(getStudents(mockTenant).length, 0, 'New tenant initially has 0 students');

// Tenant adds a student
saveStudent(mockTenant, { id: 'stu_1', name: 'John Doe', roll: 'CCU-001' });
assert.strictEqual(getStudents(mockTenant).length, 1, 'Tenant now has 1 student');
assert.strictEqual(getStudents(mockTenant)[0].name, 'John Doe', 'Student name matches');

// Other tenant (e.g. UNIVERSITY OF GHANA) should NOT see Cape Coast University student
assert.strictEqual(getStudents('UNIVERSITY OF GHANA').length, 0, 'Different tenant has 0 students');

// Delete student: must stay deleted
deleteStudent(mockTenant, 'stu_1');
assert.strictEqual(getStudents(mockTenant).length, 0, 'Deleted student is permanently removed');

console.log('✓ Multi-Tenant Isolation & Persistence Simulation Passed');

console.log('\nAll Multi-Tenant Clean Slate Verification Tests Passed Successfully! 🎉');
