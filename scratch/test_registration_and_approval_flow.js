const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING PURE SUPABASE PERSISTENCE (ZERO LOCALSTORAGE FOR ORGS) ===\n');

// 1. Verify register.html and registration.html
['register.html', 'registration.html'].forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Must NOT use localStorage
  assert.ok(!content.includes('localStorage'), `[${file}] Must NOT contain any localStorage calls`);

  // Must NOT display any code on screen
  assert.ok(!content.includes('id="dispatchedCodeDisplay"'), `[${file}] Must NOT contain dispatchedCodeDisplay`);
  assert.ok(!content.includes('class="dispatched-code-card"'), `[${file}] Must NOT contain dispatched-code-card`);

  // Must verify using Supabase Auth
  assert.ok(content.includes('verifyEmailOtp'), `[${file}] Must call verifyEmailOtp`);
  assert.ok(content.includes('sendEmailOtp'), `[${file}] Must call sendEmailOtp`);

  // Must save exclusively to Supabase as pending_approval
  assert.ok(content.includes("status: 'pending_approval'"), `[${file}] Must set status to pending_approval`);
  assert.ok(content.includes('window.SupabaseService.saveOrganization'), `[${file}] Must save via SupabaseService`);

  console.log(`✓ [${file}] Zero localStorage: pure Supabase persistence verified.`);
});

// 2. Verify pages/admin/admin-dashboard.html
const adminDashPath = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');
const adminContent = fs.readFileSync(adminDashPath, 'utf8');
assert.ok(!adminContent.includes('pending_institution_registrations'), 'admin-dashboard.html must not contain pending_institution_registrations');
assert.ok(adminContent.includes('window.SupabaseService.getOrganizations()'), 'admin-dashboard.html must load organizations from Supabase');
assert.ok(adminContent.includes('window.SupabaseService.approveOrganization'), 'admin-dashboard.html must approve in Supabase');
assert.ok(adminContent.includes('window.SupabaseService.rejectOrganization'), 'admin-dashboard.html must reject in Supabase');
console.log('✓ [pages/admin/admin-dashboard.html] Super Admin dashboard pure Supabase persistence verified.');

console.log('\n=== ALL PURE SUPABASE PERSISTENCE CHECKS PASSED ===');
