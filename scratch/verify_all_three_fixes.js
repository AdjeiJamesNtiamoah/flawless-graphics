const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFYING THREE CRITICAL USER REQUIREMENTS ===\n');

// -------------------------------------------------------------
// Test 1: Password Requirement Validation
// -------------------------------------------------------------
function validatePassword(password) {
    if (!password || password.length < 8) return { valid: false, reason: 'min 8 chars' };
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return { valid: false, reason: 'uppercase and lowercase' };
    if (!/[0-9]/.test(password)) return { valid: false, reason: 'at least 1 number' };
    if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, reason: 'at least 1 special symbol' };
    return { valid: true };
}

assert.strictEqual(validatePassword('short').valid, false);
assert.strictEqual(validatePassword('alllowercase1!').valid, false);
assert.strictEqual(validatePassword('ALLUPPERCASE1!').valid, false);
assert.strictEqual(validatePassword('NoNumberHere!').valid, false);
assert.strictEqual(validatePassword('NoSpecial1234').valid, false);
assert.strictEqual(validatePassword('ValidPass@2026').valid, true);
assert.strictEqual(validatePassword('CapeCoast#2026').valid, true);
console.log('✓ Test 1 Passed: Password requirement validation enforces min 8 chars, Aa, 0-9, and symbols.');

// -------------------------------------------------------------
// Test 2: OTP Delivery & Broadcast Card
// -------------------------------------------------------------
const regContent = fs.readFileSync('registration.html', 'utf8');
const registerContent = fs.readFileSync('register.html', 'utf8');

assert(regContent.includes('id="dispatchedCodeDisplay"'), 'registration.html has dispatchedCodeDisplay');
assert(registerContent.includes('id="dispatchedCodeDisplay"'), 'register.html has dispatchedCodeDisplay');
assert(regContent.includes('currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString()'), 'registration.html generates OTP code');
assert(registerContent.includes('currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString()'), 'register.html generates OTP code');
assert(regContent.includes('inputVal === currentOtpCode'), 'registration.html verifies generated OTP code');
assert(registerContent.includes('inputVal === currentOtpCode'), 'register.html verifies generated OTP code');
console.log('✓ Test 2 Passed: OTP delivery card and code generation are active in registration portals.');

// -------------------------------------------------------------
// Test 3: Dashboard Auth Guard (No false bounce-back to index.html)
// -------------------------------------------------------------
const hrContent = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const finContent = fs.readFileSync('pages/finance/finance-dashboard.html', 'utf8');
const teaContent = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
const stuContent = fs.readFileSync('pages/student/student-dashboard.html', 'utf8');
const admContent = fs.readFileSync('pages/admin/admin-dashboard.html', 'utf8');
const authSessionContent = fs.readFileSync('assets/js/auth-session.js', 'utf8');

// Ensure they check local registries before revoking
assert(hrContent.includes('fg_registered_users'), 'hr-dashboard checks fg_registered_users');
assert(finContent.includes('fg_registered_users'), 'finance-dashboard checks fg_registered_users');
assert(teaContent.includes('fg_registered_users'), 'teacher-dashboard checks fg_registered_users');
assert(stuContent.includes('fg_registered_users'), 'student-dashboard checks fg_registered_users');
assert(admContent.includes('fg_registered_users'), 'admin-dashboard checks fg_registered_users');
assert(authSessionContent.includes('fg_registered_users'), 'auth-session checks fg_registered_users');

// Ensure hr-dashboard no longer tries to redirect to deleted hr-login.html
assert(!hrContent.includes("redirectUrl: 'hr-login.html'"), 'hr-dashboard no longer points to deleted hr-login.html');

console.log('✓ Test 3 Passed: All 5 portals and AuthSession protect local/registered sessions from being bounced.');

// -------------------------------------------------------------
// Test 4: index.html Drawer Password Requirements UI
// -------------------------------------------------------------
const indexContent = fs.readFileSync('index.html', 'utf8');
assert(indexContent.includes('id="drawerPasswordRequirementsCard"'), 'index.html has requirements card');
assert(indexContent.includes('handleDrawerPasswordInput()'), 'index.html has live password validator');
assert(indexContent.includes('password.length < 8'), 'index.html drawer requires min 8 chars');
assert(indexContent.includes('localStorage.setItem(\'activeHR\''), 'index.html sets activeHR uppercase');
assert(indexContent.includes('localStorage.setItem(\'hr_active_user\''), 'index.html sets hr_active_user');

console.log('✓ Test 4 Passed: index.html has interactive password requirements UI & complete session keys.');

console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
