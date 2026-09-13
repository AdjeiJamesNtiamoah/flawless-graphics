const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== 1. VERIFYING SUPABASE CLIENT ENHANCEMENTS ===');
const supabaseClientCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'supabase-client.js'), 'utf8');
assert(supabaseClientCode.includes('sendEmailOtp('), 'SupabaseRestClient defines sendEmailOtp');
assert(supabaseClientCode.includes('verifyEmailOtp('), 'SupabaseRestClient defines verifyEmailOtp');
assert(supabaseClientCode.includes('getApprovedOrganizations()'), 'SupabaseRestClient defines getApprovedOrganizations');
assert(supabaseClientCode.includes('/auth/v1/otp'), 'SupabaseRestClient uses GoTrue /auth/v1/otp endpoint');
assert(supabaseClientCode.includes('/auth/v1/verify'), 'SupabaseRestClient uses GoTrue /auth/v1/verify endpoint');

console.log('\n=== 2. VERIFYING REALTIME AUTH ENGINE & PREVIEW REMOVAL ===');
const realtimeAuthCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'realtime-auth.js'), 'utf8');
assert(!realtimeAuthCode.includes('raPreviewBadge'), 'realtime-auth.js has completely removed raPreviewBadge');
assert(!realtimeAuthCode.includes('ra-preview-badge'), 'realtime-auth.js has completely removed ra-preview-badge');
assert(!realtimeAuthCode.includes('Press to auto-fill'), 'realtime-auth.js has completely removed "Press to auto-fill"');
assert(realtimeAuthCode.includes('populateApprovedOrgDropdown'), 'realtime-auth.js defines populateApprovedOrgDropdown');
assert(realtimeAuthCode.includes('verifyUserOrgMembership'), 'realtime-auth.js defines verifyUserOrgMembership');
assert(realtimeAuthCode.includes('verifyOtpAsync'), 'realtime-auth.js defines verifyOtpAsync dual verification');

console.log('\n=== 3. VERIFYING TEACHER LOGIN & REGISTRATION ===');
const teacherLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html'), 'utf8');
assert(teacherLoginHtml.includes('id="teacherOrgSelect"'), 'teacher-login.html has #teacherOrgSelect dropdown');
assert(teacherLoginHtml.includes('id="teacherPhotoFile"'), 'teacher-login.html has #teacherPhotoFile photo input');
assert(teacherLoginHtml.includes('id="teacherPhotoPreview"'), 'teacher-login.html has #teacherPhotoPreview preview container');
assert(teacherLoginHtml.includes('populateApprovedOrgDropdown'), 'teacher-login.html populates approved org dropdown');
assert(teacherLoginHtml.includes('verifyUserOrgMembership'), 'teacher-login.html enforces org membership');

console.log('\n=== 4. VERIFYING HR LOGIN & REGISTRATION ===');
const hrLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'hr', 'hr-login.html'), 'utf8');
assert(hrLoginHtml.includes('id="orgName"') && hrLoginHtml.includes('<select id="orgName"'), 'hr-login.html has #orgName select dropdown');
assert(hrLoginHtml.includes('id="hrPhotoFile"'), 'hr-login.html has #hrPhotoFile photo input');
assert(hrLoginHtml.includes('id="hrPhotoPreview"'), 'hr-login.html has #hrPhotoPreview preview container');
assert(hrLoginHtml.includes('populateApprovedOrgDropdown'), 'hr-login.html populates approved org dropdown');
assert(hrLoginHtml.includes('verifyUserOrgMembership'), 'hr-login.html enforces org membership');

console.log('\n=== 5. VERIFYING FINANCE LOGIN & REGISTRATION ===');
const financeLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'finance', 'finance-login.html'), 'utf8');
assert(financeLoginHtml.includes('id="orgName"') && financeLoginHtml.includes('<select id="orgName"'), 'finance-login.html has #orgName select dropdown');
assert(financeLoginHtml.includes('id="financePhotoFile"'), 'finance-login.html has #financePhotoFile photo input');
assert(financeLoginHtml.includes('id="financePhotoPreview"'), 'finance-login.html has #financePhotoPreview preview container');
assert(financeLoginHtml.includes('populateApprovedOrgDropdown'), 'finance-login.html populates approved org dropdown');
assert(financeLoginHtml.includes('verifyUserOrgMembership'), 'finance-login.html enforces org membership');

console.log('\n=== 6. VERIFYING STUDENT LOGIN & ENROLLMENT ===');
const studentLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'pages', 'student', 'student-login.html'), 'utf8');
assert(studentLoginHtml.includes('id="studentOrgSelect"'), 'student-login.html has #studentOrgSelect dropdown');
assert(studentLoginHtml.includes('id="studentPhotoFile"'), 'student-login.html has #studentPhotoFile photo input');
assert(studentLoginHtml.includes('id="studentPhotoPreview"'), 'student-login.html has #studentPhotoPreview preview container');
assert(studentLoginHtml.includes('populateApprovedOrgDropdown'), 'student-login.html populates approved org dropdown');
assert(studentLoginHtml.includes('verifyUserOrgMembership'), 'student-login.html enforces org membership');

console.log('\n=== 7. VERIFYING SITE CENTRAL LOGIN ===');
const siteLoginHtml = fs.readFileSync(path.join(__dirname, '..', 'site-login.html'), 'utf8');
assert(siteLoginHtml.includes('id="siteOrgSelect"'), 'site-login.html has #siteOrgSelect dropdown');
assert(siteLoginHtml.includes('populateApprovedOrgDropdown'), 'site-login.html populates approved org dropdown');
assert(siteLoginHtml.includes('verifyUserOrgMembership'), 'site-login.html enforces org membership');
assert(!siteLoginHtml.includes('Temporary OTP code:'), 'site-login.html removed temporary OTP preview code');

console.log('\n=== 8. FUNCTIONAL JAVASCRIPT SYNTAX & EXECUTION TEST ===');
// Test RealtimeAuth in VM
const mockWindow = {
  localStorage: {
    getItem: (k) => null,
    setItem: (k, v) => {}
  },
  document: {
    getElementById: (id) => null,
    head: { insertAdjacentHTML: () => {} },
    body: { insertAdjacentHTML: () => {} }
  },
  addEventListener: () => {}
};
const ctx = vm.createContext({ window: mockWindow, document: mockWindow.document, localStorage: mockWindow.localStorage, globalThis: mockWindow });
try {
  vm.runInContext(realtimeAuthCode, ctx);
  assert(typeof ctx.window.RealtimeAuth === 'object', 'RealtimeAuth initialized in VM');
  
  // Test membership verification logic
  const userA = { email: 'teacher@schoola.edu', org: 'school-a', org_name: 'School A Academy' };
  assert(ctx.window.RealtimeAuth.verifyUserOrgMembership(userA, 'school-a') === true, 'Membership allows matching org slug');
  assert(ctx.window.RealtimeAuth.verifyUserOrgMembership(userA, 'School A Academy') === true, 'Membership allows matching org name');
  assert(ctx.window.RealtimeAuth.verifyUserOrgMembership(userA, 'school-b') === false, 'Membership denies mismatched org slug');
  
  const superAdmin = { email: 'admin@flawless.com', org: 'fg-main', role: 'admin' };
  assert(ctx.window.RealtimeAuth.verifyUserOrgMembership(superAdmin, 'fg-main') === true, 'SuperAdmin matches fg-main');
  assert(ctx.window.RealtimeAuth.verifyUserOrgMembership(superAdmin, 'all') === true, 'SuperAdmin matches all');

  // Test OTP generation and expiration
  const session = ctx.window.RealtimeAuth.requestOtp('test@domain.com', 'testing', 300);
  assert(session.code.length === 6, 'Generated OTP has 6 digits');
  assert(session.email === 'test@domain.com', 'Session email matches');
  
  const badVerify = ctx.window.RealtimeAuth.verifyOtp('test@domain.com', '000000');
  assert(badVerify.success === false, 'Wrong code fails verification');
  
  const goodVerify = ctx.window.RealtimeAuth.verifyOtp('test@domain.com', session.code);
  assert(goodVerify.success === true, 'Correct code succeeds verification');

} catch (err) {
  console.error('VM Execution Error:', err);
  assert(false, `RealtimeAuth VM execution: ${err.message}`);
}

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
