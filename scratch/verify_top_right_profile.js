const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('--- STARTING VERIFICATION: TOP-RIGHT PROFILE PICTURE & ONLINE INDICATOR ---');

// 1. Check auth-session.js syntax and methods
const authSessionPath = path.join(__dirname, '..', 'assets/js/auth-session.js');
const authSessionCode = fs.readFileSync(authSessionPath, 'utf8');

// Test JS parse
assert.doesNotThrow(() => {
    new vm.Script(authSessionCode);
}, 'auth-session.js must be valid JavaScript syntax');
console.log('✓ auth-session.js parsed successfully without syntax errors');

// Verify key design components in auth-session.js
assert(authSessionCode.includes('renderTopRightProfileWidget'), 'auth-session.js must contain renderTopRightProfileWidget method');
assert(authSessionCode.includes('fg-online-dot'), 'auth-session.js must contain fg-online-dot class');
assert(authSessionCode.includes('fgOnlineRadarPulse'), 'auth-session.js must contain fgOnlineRadarPulse radar wave animation');
assert(authSessionCode.includes('#10b981'), 'auth-session.js must use emerald green #10b981 for live online indicator');
assert(authSessionCode.includes('fg-profile-dropdown'), 'auth-session.js must include interactive luxury dropdown card');
assert(authSessionCode.includes('topRightProfileContainer'), 'auth-session.js must check for topRightProfileContainer');
console.log('✓ auth-session.js verified with full profile widget, pulse animation & dropdown');

// 2. Check dashboards
const filesToCheck = [
    { name: 'Admin Dashboard', path: 'pages/admin/admin-dashboard.html' },
    { name: 'HR Dashboard', path: 'pages/hr/hr-dashboard.html' },
    { name: 'Teacher Dashboard', path: 'pages/teacher/teacher-dashboard.html' },
    { name: 'Student Dashboard', path: 'pages/student/student-dashboard.html' },
    { name: 'Finance Dashboard', path: 'pages/finance/finance-dashboard.html' },
    { name: 'Teacher Profile', path: 'pages/teacher/teacher-profile.html' },
    { name: 'Welcome Hub', path: 'welcome.html' }
];

filesToCheck.forEach(f => {
    const fullPath = path.join(__dirname, '..', f.path);
    assert(fs.existsSync(fullPath), `${f.name} must exist at ${f.path}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('auth-session.js'), `${f.name} must load auth-session.js`);
    assert(content.includes('topRightProfileContainer'), `${f.name} must contain topRightProfileContainer`);
    console.log(`✓ ${f.name} (${f.path}) successfully includes auth-session.js and topRightProfileContainer slot`);
});

console.log('--- ALL VERIFICATION CHECKS PASSED PERFECTLY! ---');
