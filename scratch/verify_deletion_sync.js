/**
 * scratch/verify_deletion_sync.js
 * Automated Test Suite: Immediate Deletion Sync & Complete Access Revocation
 */

const fs = require('fs');
const path = require('path');

// Mock browser localStorage and window environment for Node.js
const mockLocalStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

global.localStorage = mockLocalStorage;
global.window = {
  localStorage: mockLocalStorage,
  location: { href: 'http://localhost/pages/admin/admin-dashboard.html', pathname: '/pages/admin/admin-dashboard.html', replace() {} },
  addEventListener() {}
};

// Load supabase client
const supabaseClientCode = fs.readFileSync(path.join(__dirname, '../assets/js/supabase-client.js'), 'utf8');
eval(supabaseClientCode);

const supabase = window.SupabaseService;

async function runTests() {
  console.log('====================================================');
  console.log(' DELETION SYNC & ACCESS REVOCATION TEST SUITE');
  console.log('====================================================\n');

  const testOrgName = `TEST_DEL_ORG_${Date.now()}`;
  const testUserEmail = `test_del_user_${Date.now()}@example.com`;
  const testTeacherEmail = `test_del_teacher_${Date.now()}@example.com`;

  try {
    // ----------------------------------------------------
    // TEST 1: Root Protection
    // ----------------------------------------------------
    console.log('[Test 1] Root Protection Verification');
    let rootOrgBlocked = false;
    try {
      await supabase.deleteOrganization('FLAWLESS GRAPHICS');
    } catch (e) {
      rootOrgBlocked = true;
      console.log('  ✔ Root organization deletion successfully blocked:', e.message);
    }
    if (!rootOrgBlocked) throw new Error('Root organization was NOT blocked from deletion!');

    let rootAdminBlocked = false;
    try {
      await supabase.deleteUser('admin@flawlessgraphics.com');
    } catch (e) {
      rootAdminBlocked = true;
      console.log('  ✔ Root Super Admin deletion successfully blocked:', e.message);
    }
    if (!rootAdminBlocked) throw new Error('Root Super Admin was NOT blocked from deletion!');

    // ----------------------------------------------------
    // TEST 2: User Lifecycle: Creation, Auth, Deletion, Access Denied
    // ----------------------------------------------------
    console.log('\n[Test 2] User Lifecycle & Immediate Access Revocation');
    const uPass = 'TestPass@2026';
    
    // 2a. Provision user in Supabase
    const savedUser = await supabase.saveUser({
      name: 'Deletion Test User',
      email: testUserEmail,
      pass_hash: uPass,
      org: 'FLAWLESS GRAPHICS',
      role: 'teacher',
      status: 'active'
    });
    console.log(`  ✔ User created: ${testUserEmail}`);

    // 2b. Authenticate - should succeed because status is active
    const auth1 = await supabase.authenticate(testUserEmail, uPass);
    if (!auth1.success) throw new Error(`Expected successful auth, got: ${auth1.error}`);
    console.log('  ✔ Initial authentication successful');

    // 2c. Delete user via deleteUser
    await supabase.deleteUser(testUserEmail);
    console.log(`  ✔ deleteUser executed for: ${testUserEmail}`);

    // 2d. Verify user is absent from Supabase
    const lookupAfterDel = await supabase.getUserByEmail(testUserEmail);
    if (lookupAfterDel) throw new Error('User still exists in Supabase after deletion!');
    console.log('  ✔ User confirmed absent from live Supabase users table');

    // 2e. Authenticate again - MUST be rejected with "Account not found"
    const auth2 = await supabase.authenticate(testUserEmail, uPass);
    if (auth2.success) throw new Error('Deleted user was able to authenticate! Access was NOT revoked.');
    console.log('  ✔ Authentication rejected for deleted user:', auth2.error);
    if (!auth2.error.includes('Account not found in institutional database')) {
      throw new Error(`Unexpected error message: ${auth2.error}`);
    }

    // ----------------------------------------------------
    // TEST 3: Organization Deletion & Complete Cascading
    // ----------------------------------------------------
    console.log('\n[Test 3] Organization Creation, Members, and Cascade Deletion');
    // 3a. Create test organization
    await supabase.saveOrganization({
      org_name: testOrgName,
      admin_name: 'Test Org Admin',
      email: `admin_${Date.now()}@testorg.com`,
      status: 'Active'
    });
    console.log(`  ✔ Organization created: ${testOrgName}`);

    // 3b. Add user and teacher under this organization
    const orgUserPass = 'OrgPass@2026';
    await supabase.saveUser({
      name: 'Org Member User',
      email: testTeacherEmail,
      pass_hash: orgUserPass,
      org: testOrgName,
      role: 'teacher',
      status: 'active'
    });
    await supabase.saveTeacher(testOrgName, {
      id: 'emp_del_test_' + Date.now(),
      fullName: 'Org Teacher',
      email: testTeacherEmail,
      status: 'Active'
    });
    console.log(`  ✔ Member user and teacher created under ${testOrgName}`);

    // Verify member can authenticate
    const authOrgMember = await supabase.authenticate(testTeacherEmail, orgUserPass, testOrgName);
    if (!authOrgMember.success) throw new Error(`Member failed to authenticate: ${authOrgMember.error}`);
    console.log('  ✔ Member authenticated under organization');

    // 3c. Delete organization via deleteOrganization
    await supabase.deleteOrganization(testOrgName);
    console.log(`  ✔ deleteOrganization executed for: ${testOrgName}`);

    // 3d. Verify organization is deleted from Supabase
    const orgCheck = await supabase.getOrganization(testOrgName);
    if (orgCheck) throw new Error('Organization still exists in Supabase after deletion!');
    console.log('  ✔ Organization confirmed removed from Supabase');

    // 3e. Verify cascaded deletion of users and teachers under this organization
    const cascadedUserCheck = await supabase.getUserByEmail(testTeacherEmail);
    if (cascadedUserCheck) throw new Error('Member user was NOT cascade-deleted!');
    console.log('  ✔ Cascaded member user confirmed deleted from Supabase');

    const teachersInOrg = await supabase.getTeachers(testOrgName);
    if (teachersInOrg.length > 0) throw new Error('Teachers were NOT cascade-deleted!');
    console.log('  ✔ Cascaded teachers confirmed deleted from Supabase');

    // 3f. Verify member is now strictly denied access
    const authOrgMemberAfter = await supabase.authenticate(testTeacherEmail, orgUserPass, testOrgName);
    if (authOrgMemberAfter.success) throw new Error('Member of deleted organization can still authenticate!');
    console.log('  ✔ Member login strictly denied:', authOrgMemberAfter.error);

    // ----------------------------------------------------
    // TEST 4: Re-Registration After Deletion
    // ----------------------------------------------------
    console.log('\n[Test 4] Re-Registration Lifecycle');
    const reRegResult = await supabase.signUp(testUserEmail, 'NewPassword@2026', {
      name: 'Re-registered User',
      role: 'teacher',
      org_name: 'FLAWLESS GRAPHICS'
    });
    console.log(`  ✔ User re-registered successfully: status = ${reRegResult.status}`);
    if (reRegResult.status !== 'pending_approval') {
      throw new Error(`Expected pending_approval status upon re-registration, got: ${reRegResult.status}`);
    }

    // Login before approval must be rejected as pending
    const loginPending = await supabase.authenticate(testUserEmail, 'NewPassword@2026');
    if (loginPending.success) throw new Error('Re-registered pending user authenticated without approval!');
    console.log('  ✔ Unapproved re-registered user blocked from logging in:', loginPending.error);

    // Clean up re-registered test user
    await supabase.deleteUser(testUserEmail);
    console.log('  ✔ Test cleanup completed.');

    console.log('\n====================================================');
    console.log(' ALL DELETION & ACCESS REVOCATION TESTS PASSED! ✔');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
