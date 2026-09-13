const fs = require('fs');
const path = require('path');

let errors = 0;
function assert(condition, message) {
    if (!condition) {
        console.error('❌ FAIL:', message);
        errors++;
    } else {
        console.log('✅ PASS:', message);
    }
}

console.log('--- 1. Testing Demo Removal ---');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(!indexHtml.includes('Launch Instant Demo'), 'index.html does not contain Launch Instant Demo');
assert(!indexHtml.includes('quickDemoAccess()'), 'index.html does not call quickDemoAccess()');

const studentLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'student', 'student-login.html'), 'utf8');
assert(!studentLoginHtml.includes('demo-picker-card'), 'student-login.html has removed demo picker card');

const teacherLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html'), 'utf8');
assert(!teacherLoginHtml.includes('quickDemoTeacher'), 'teacher-login.html has removed quickDemoTeacher');
assert(teacherLoginHtml.includes('id="teacherAuthForm"'), 'teacher-login.html has valid teacherAuthForm');
assert(teacherLoginHtml.includes('id="verificationModal"'), 'teacher-login.html has valid verificationModal');

console.log('\n--- 2. Testing Teacher Dashboard Professional Settings ---');
const teacherDashHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html'), 'utf8');
assert(teacherDashHtml.includes('id="settingsSection"'), 'teacher-dashboard.html has settingsSection');
assert(teacherDashHtml.includes('Educator Workspace & Institutional Calibration') || teacherDashHtml.includes('Educator Workspace &amp; Institutional Calibration'), 'teacher-dashboard.html has professional title');
assert(teacherDashHtml.includes('tset_gradingSystem'), 'teacher-dashboard.html has gradingSystem calibration');
assert(teacherDashHtml.includes('tset_attMode'), 'teacher-dashboard.html has attendance mode calibration');
assert(teacherDashHtml.includes('saveTeacherSettings'), 'teacher-dashboard.html has saveTeacherSettings JS');
assert(teacherDashHtml.includes('syncTeacherSettingsToSupabase'), 'teacher-dashboard.html has syncTeacherSettingsToSupabase JS');

console.log('\n--- 3. Testing Student Dashboard Professional Settings ---');
const studentDashHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html'), 'utf8');
assert(studentDashHtml.includes('id="nav_settings"'), 'student-dashboard.html has nav_settings sidebar button');
assert(studentDashHtml.includes('id="settingsSection"'), 'student-dashboard.html has settingsSection');
assert(studentDashHtml.includes('Student Portal Settings & Preferences') || studentDashHtml.includes('Student Portal Settings &amp; Preferences'), 'student-dashboard.html has professional title');
assert(studentDashHtml.includes('sset_gradeFormat'), 'student-dashboard.html has grade format calibration');
assert(studentDashHtml.includes('sset_pin'), 'student-dashboard.html has smart PIN calibration');
assert(studentDashHtml.includes('saveStudentSettings'), 'student-dashboard.html has saveStudentSettings JS');
assert(studentDashHtml.includes('syncStudentSettingsToSupabase'), 'student-dashboard.html has syncStudentSettingsToSupabase JS');

console.log('\n--- 4. Summary ---');
if (errors === 0) {
    console.log('🎉 ALL VERIFICATION TESTS PASSED PERFECTLY!');
} else {
    console.error(`💥 ${errors} tests failed!`);
    process.exit(1);
}
