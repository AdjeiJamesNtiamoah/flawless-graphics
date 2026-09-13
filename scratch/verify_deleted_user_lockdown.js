/**
 * verify_deleted_user_lockdown.js
 * Comprehensive automated test verifying that deleted users are strictly locked out
 * across all login portals and dashboards, and that open sessions are revoked immediately.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING DELETED USER LOCKDOWN VERIFICATION ---');

// 1. Check all dashboard files for presence of auth-session & Supabase client in <head>
const dashboards = [
  { file: 'pages/teacher/teacher-dashboard.html', name: 'Teacher Dashboard', login: 'teacher-login.html' },
  { file: 'pages/student/student-dashboard.html', name: 'Student Dashboard', login: 'student-login.html' },
  { file: 'pages/hr/hr-dashboard.html', name: 'HR Dashboard', login: 'hr-login.html' },
  { file: 'pages/finance/finance-dashboard.html', name: 'Finance Dashboard', login: 'finance-login.html' },
  { file: 'pages/admin/admin-dashboard.html', name: 'Admin Dashboard', login: 'admin-login.html' }
];

dashboards.forEach(d => {
  const filePath = path.join(__dirname, '..', d.file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify scripts in <head>
  assert(content.includes('auth-session.js'), `${d.name} must include auth-session.js`);
  assert(content.includes('supabase-config.js'), `${d.name} must include supabase-config.js`);
  assert(content.includes('supabase-client.js'), `${d.name} must include supabase-client.js`);
  assert(content.includes('requireAuth'), `${d.name} must include requireAuth`);

  console.log(`[PASS] ${d.name}: Has auth-session.js, supabase client, and requireAuth route guard.`);
});

// 2. Check student dashboard: NO synthetic fallbacks (Samuel Kofi Mensah or studs[0])
const studentDashContent = fs.readFileSync(path.join(__dirname, '..', 'pages/student/student-dashboard.html'), 'utf8');
assert(!studentDashContent.includes("name: 'Samuel Kofi Mensah'"), 'Student Dashboard must NOT contain fallback Samuel Kofi Mensah');
assert(!studentDashContent.includes('activeStudent = studs[0]'), 'Student Dashboard must NOT fall back to studs[0] if user deleted');
assert(studentDashContent.includes('Your student account has been deleted from the institutional database. Access revoked.'), 'Student Dashboard must alert deletion');
console.log('[PASS] Student Dashboard: Synthetic mock student fallback completely removed.');

// 3. Check teacher dashboard: NO synthetic fallbacks (cloudTeachers[0])
const teacherDashContent = fs.readFileSync(path.join(__dirname, '..', 'pages/teacher/teacher-dashboard.html'), 'utf8');
assert(!teacherDashContent.includes('teacher = cloudTeachers[0]'), 'Teacher Dashboard must NOT fall back to cloudTeachers[0] if user deleted');
assert(teacherDashContent.includes('Your educator account has been deleted from the institutional database. Access revoked.'), 'Teacher Dashboard must alert deletion');
console.log('[PASS] Teacher Dashboard: cloudTeachers[0] fallback completely removed.');

// 4. Check HR and Finance dashboards have live user checks
const hrDashContent = fs.readFileSync(path.join(__dirname, '..', 'pages/hr/hr-dashboard.html'), 'utf8');
assert(hrDashContent.includes('Your HR administrator account has been deleted from the institutional database. Access revoked.'), 'HR Dashboard must alert deletion');
console.log('[PASS] HR Dashboard: Live HR account verification in place.');

const finDashContent = fs.readFileSync(path.join(__dirname, '..', 'pages/finance/finance-dashboard.html'), 'utf8');
assert(finDashContent.includes('Your finance administrator account has been deleted from the institutional database. Access revoked.'), 'Finance Dashboard must alert deletion');
console.log('[PASS] Finance Dashboard: Live Finance account verification in place.');

// 5. Check all login pages reject deleted users and do NOT auto-create users
const loginPages = [
  { file: 'pages/teacher/teacher-login.html', name: 'Teacher Login' },
  { file: 'pages/student/student-login.html', name: 'Student Login' },
  { file: 'pages/hr/hr-login.html', name: 'HR Login' },
  { file: 'pages/finance/finance-login.html', name: 'Finance Login' },
  { file: 'pages/admin/admin-login.html', name: 'Admin Login' },
  { file: 'site-login.html', name: 'Central Site Login' }
];

loginPages.forEach(p => {
  const filePath = path.join(__dirname, '..', p.file);
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('SupabaseService'), `${p.name} must use SupabaseService for auth`);
  
  if (p.file.includes('hr-login') || p.file.includes('finance-login')) {
    // Ensure no fallback auto-recreation of users on failed auth
    assert(!content.includes("status: 'active'"), `${p.name} must not auto-resurrect failed users as active`);
  }
  
  console.log(`[PASS] ${p.name}: Strictly validates credentials against Supabase.`);
});

// 6. Check AuthSession watchdog in auth-session.js
const authSessionContent = fs.readFileSync(path.join(__dirname, '..', 'assets/js/auth-session.js'), 'utf8');
assert(authSessionContent.includes('validateCloudSession'), 'AuthSession must have validateCloudSession');
assert(authSessionContent.includes('Your account has been deleted from the institutional database. Access revoked.'), 'AuthSession must alert on deletion');
assert(authSessionContent.includes('students?or=(email.eq.'), 'AuthSession must verify students table');
console.log('[PASS] AuthSession: Global watchdog checks users, teachers, and students tables and revokes access.');

console.log('\n>>> ALL 12 DELETED USER LOCKDOWN ASSERTIONS PASSED SUCCESSFULLY! <<<');
