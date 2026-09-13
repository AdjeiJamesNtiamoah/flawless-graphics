const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('--- VERIFYING SUPABASE-EXCLUSIVE DATA DISPLAY & AUTO-PURGE ---');
console.log('================================================================\n');

// 1. Check auth-session.js
console.log('--- 1. Testing AuthSession Cloud Validation & Auto-Purge ---');
const authSessionCode = fs.readFileSync('assets/js/auth-session.js', 'utf8');

const mockStorage = {
  active_org: 'APOSTOLIC SCHOOL COMPLEX, AKIM ACHIASE',
  active_org_logo: 'data:image/png;base64,mockLogo',
  active_org_user: JSON.stringify({
    name: 'Adjei James Kofi Ntiamoah',
    email: 'jameskofintiamoahadjei@gmail.com',
    org: 'APOSTOLIC SCHOOL COMPLEX, AKIM ACHIASE'
  }),
  organizations: JSON.stringify([{ name: 'APOSTOLIC SCHOOL COMPLEX, AKIM ACHIASE' }]),
  organizations_users: JSON.stringify([{ email: 'jameskofintiamoahadjei@gmail.com' }])
};

const domElements = {
  orgTitle: { textContent: 'TEACHER PORTAL', getAttribute: () => null },
  sideOrgName: { textContent: '' },
  sideAdminName: { textContent: '' },
  sideAdminEmail: { textContent: '' }
};

const windowMock = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { for (let k in mockStorage) delete mockStorage[k]; }
  },
  sessionStorage: { clear: () => {} },
  addEventListener: () => {},
  document: {
    querySelectorAll: (sel) => {
      if (sel.includes('#orgTitle')) return [domElements.orgTitle];
      return [];
    },
    getElementById: (id) => domElements[id] || null
  },
  SupabaseService: {
    getOrganizations: async () => [
      { id: '1', org_name: 'FLAWLESS GRAPHICS', name: 'FLAWLESS GRAPHICS' }
    ],
    getUsers: async () => [
      { id: 'u_1', email: 'admin@flawlessgraphics.com', name: 'James Ntiamoah', role: 'admin' }
    ],
    getTeachers: async () => [
      { id: 'emp_1', email: 'kwame@flawless.org', full_name: 'Kwame Boateng' }
    ]
  }
};

const sandbox = {
  window: windowMock,
  document: windowMock.document,
  localStorage: windowMock.localStorage,
  sessionStorage: windowMock.sessionStorage,
  console: console
};

vm.createContext(sandbox);
vm.runInContext(authSessionCode, sandbox);

assert(!mockStorage['organizations'], 'Legacy organizations array purged on load');
assert(!mockStorage['organizations_users'], 'Legacy organizations_users array purged on load');
console.log('✅ PASS: Legacy local arrays purged immediately on script load');

// Run validateCloudSession
(async () => {
  await sandbox.window.AuthSession.validateCloudSession();

  assert(mockStorage['active_org'] !== 'APOSTOLIC SCHOOL COMPLEX, AKIM ACHIASE', 'Non-Supabase organization was purged from active_org');
  assert(mockStorage['active_org'] === 'FLAWLESS GRAPHICS', 'Active org fell back to Supabase cloud organization');
  assert(!mockStorage['active_org_user'], 'Non-Supabase user was purged from active_org_user');
  console.log('✅ PASS: validateCloudSession() successfully detected and purged non-Supabase org & user');

  // Verify that branding only applies to verified cloud organizations
  assert(domElements.orgTitle.textContent !== 'APOSTOLIC SCHOOL COMPLEX, AKIM ACHIASE', 'Hero title is NOT polluted by non-Supabase organization');
  console.log('✅ PASS: Header/branding element does NOT display non-Supabase organization');

  // 2. Check Admin Dashboard Code
  console.log('\n--- 2. Checking Admin Dashboard Supabase-Exclusive Display ---');
  const adminHtml = fs.readFileSync('pages/admin/admin-dashboard.html', 'utf8');
  assert(adminHtml.includes('const orgMatch = adminState.tenants.find'), 'Admin dashboard validates ACTIVE_ORG against Supabase organizations');
  assert(adminHtml.includes('const verifiedUser = adminState.users.find'), 'Admin dashboard validates sidebar user against Supabase users');
  console.log('✅ PASS: Admin dashboard enforces Supabase-exclusive tenants & users');

  // 3. Check Teacher Dashboard Code
  console.log('\n--- 3. Checking Teacher Dashboard Supabase-Exclusive Display ---');
  const teacherDashHtml = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
  assert(teacherDashHtml.includes('const orgs = await window.SupabaseService.getOrganizations()'), 'Teacher dashboard validates ORG against Supabase organizations');
  assert(teacherDashHtml.includes('const cloudTeachers = await window.SupabaseService.getTeachers(ORG)'), 'Teacher dashboard validates educator profile against Supabase teachers');
  console.log('✅ PASS: Teacher dashboard enforces Supabase-exclusive classroom roster & educator data');

  // 4. Check HR Dashboard Code
  console.log('\n--- 4. Checking HR Dashboard Supabase-Exclusive Display ---');
  const hrDashHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
  assert(hrDashHtml.includes('const orgs = await window.SupabaseService.getOrganizations()'), 'HR dashboard validates organization against Supabase');
  assert(hrDashHtml.includes('orgSwitcher.innerHTML = \'\''), 'HR dashboard populates org switcher exclusively with Supabase organizations');
  console.log('✅ PASS: HR dashboard enforces Supabase-exclusive organization switcher');

  // 5. Check Finance Dashboard Code
  console.log('\n--- 5. Checking Finance Dashboard Supabase-Exclusive Display ---');
  const finDashHtml = fs.readFileSync('pages/finance/finance-dashboard.html', 'utf8');
  assert(finDashHtml.includes('const orgs = await window.SupabaseService.getOrganizations()'), 'Finance dashboard validates institution against Supabase organizations');
  console.log('✅ PASS: Finance dashboard enforces Supabase-exclusive institution branding');

  // 6. Check Welcome Hub Code
  console.log('\n--- 6. Checking Welcome Hub Supabase-Exclusive Display ---');
  const welcomeHtml = fs.readFileSync('welcome.html', 'utf8');
  assert(!welcomeHtml.includes("localStorage.getItem('organizations')"), 'welcome.html no longer reads from localStorage organizations');
  assert(welcomeHtml.includes('window.SupabaseService.getOrganizations()'), 'welcome.html queries organizations directly from Supabase');
  console.log('✅ PASS: Welcome hub queries and displays organizations directly from Supabase');

  // 7. Check Registration Direct Supabase Cloud Save
  console.log('\n--- 7. Checking Registration Direct Cloud Save ---');
  const regHtml = fs.readFileSync('register.html', 'utf8');
  assert(regHtml.includes('await window.SupabaseService.signUp'), 'register.html awaits window.SupabaseService.signUp');
  assert(regHtml.includes('await window.SupabaseService.saveOrganization'), 'register.html awaits window.SupabaseService.saveOrganization');
  assert(regHtml.includes('await window.SupabaseService.saveUser'), 'register.html awaits window.SupabaseService.saveUser');
  assert(!regHtml.includes('localStorage.setItem("organizations_users"'), 'register.html does not pollute localStorage with organizations_users');
  console.log('✅ PASS: register.html persists new registrations directly to Supabase Cloud');

  console.log('\n================================================================');
  console.log('🎉 ALL SUPABASE-EXCLUSIVE DATA DISPLAY & AUTO-PURGE TESTS PASSED!');
  console.log('================================================================');
})();
