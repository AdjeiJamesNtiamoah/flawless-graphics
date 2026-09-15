const fs = require('fs');
const assert = require('assert');

console.log('--- Verifying Org Display & Admin Lockdown Changes ---');

// 1. Verify realtime-auth.js
const realtimeAuth = fs.readFileSync('assets/js/realtime-auth.js', 'utf8');
assert(realtimeAuth.includes('applyOrgBranding: function'), 'realtime-auth.js defines applyOrgBranding');
assert(realtimeAuth.includes("path.includes('admin-login')"), 'realtime-auth.js protects admin-login from tenant branding');
assert(realtimeAuth.includes("data-preserve-title"), 'realtime-auth.js respects data-preserve-title');
assert(realtimeAuth.includes("data-preserve-logo"), 'realtime-auth.js respects data-preserve-logo');
console.log('✓ realtime-auth.js branding logic verified');

// 2. Verify auth-session.js
const authSession = fs.readFileSync('assets/js/auth-session.js', 'utf8');
assert(authSession.includes("path.includes('admin-login')"), 'auth-session.js protects admin-login from tenant branding');
console.log('✓ auth-session.js admin lockdown verified');

// 3. Verify admin-login.html
const adminLogin = fs.readFileSync('pages/admin/admin-login.html', 'utf8');
assert(adminLogin.includes('data-preserve-title="true"'), 'admin-login.html has data-preserve-title="true"');
assert(adminLogin.includes('data-preserve-logo="true"'), 'admin-login.html has data-preserve-logo="true"');
assert(!adminLogin.includes('window.AuthSession.applyGlobalBranding()'), 'admin-login.html does not call applyGlobalBranding');
assert(adminLogin.includes('FLAWLESS GRAPHICS'), 'admin-login.html retains FLAWLESS GRAPHICS branding');
console.log('✓ admin-login.html Super Admin lockdown verified');

// 4. Verify hr-login.html
const hrLogin = fs.readFileSync('pages/hr/hr-login.html', 'utf8');
assert(hrLogin.includes('class="org-hero-brand"'), 'hr-login.html uses .org-hero-brand container');
assert(hrLogin.includes('id="orgLogoBox"'), 'hr-login.html has #orgLogoBox');
assert(hrLogin.includes('id="orgTitle"'), 'hr-login.html has #orgTitle');
assert(!hrLogin.includes('<div class="role-badge">HR &amp; FACULTY PAYROLL CONSOLE</div>'), 'hr-login.html removed overlapping duplicate role-badge');
console.log('✓ hr-login.html branding and clean layout verified');

// 5. Verify finance-login.html
const financeLogin = fs.readFileSync('pages/finance/finance-login.html', 'utf8');
assert(financeLogin.includes('class="org-hero-brand"'), 'finance-login.html uses .org-hero-brand container');
assert(financeLogin.includes('id="orgLogoBox"'), 'finance-login.html has #orgLogoBox');
assert(financeLogin.includes('id="orgTitle"'), 'finance-login.html has #orgTitle');
assert(!financeLogin.includes('<div class="role-badge">BURSARY &amp; TREASURY CONSOLE</div>'), 'finance-login.html removed overlapping duplicate role-badge');
console.log('✓ finance-login.html branding and clean layout verified');

// 6. Verify student-login.html
const studentLogin = fs.readFileSync('pages/student/student-login.html', 'utf8');
assert(studentLogin.includes('id="orgLogoBox"'), 'student-login.html has #orgLogoBox');
assert(studentLogin.includes('id="orgTitle"'), 'student-login.html has #orgTitle');
console.log('✓ student-login.html branding verified');

// 7. Verify teacher-login.html
const teacherLogin = fs.readFileSync('pages/teacher/teacher-login.html', 'utf8');
assert(teacherLogin.includes('id="orgLogoBox"'), 'teacher-login.html has #orgLogoBox');
assert(teacherLogin.includes('id="orgTitle"'), 'teacher-login.html has #orgTitle');
console.log('✓ teacher-login.html branding verified');

console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
