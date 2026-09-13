const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://wmvsujwgvlosfjdlhadu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

function req(endpoint, method = 'GET', body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${SUPABASE_URL}/rest/v1/${endpoint}`);
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };

    const r = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

// Emulate client-side SupabaseService
class TestSupabaseService {
  async getOrganizations() {
    const res = await req('organizations?order=created_at.desc');
    return res.data;
  }
  async getOrganization(orgId) {
    if (!orgId) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId);
    if (isUuid) {
      const byId = await req(`organizations?id=eq.${encodeURIComponent(orgId)}&limit=1`);
      if (byId.data && byId.data.length > 0) return byId.data[0];
    }
    const byName = await req(`organizations?org_name=eq.${encodeURIComponent(orgId)}&limit=1`);
    return byName.data && byName.data.length > 0 ? byName.data[0] : null;
  }
  async saveOrganization(payload) {
    const res = await req('organizations', 'POST', payload, { 'Prefer': 'resolution=merge-duplicates,return=representation' });
    return res.data[0];
  }
  async approveOrganization(orgIdOrName) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgIdOrName);
    const ep = isUuid ? `organizations?id=eq.${encodeURIComponent(orgIdOrName)}` : `organizations?org_name=eq.${encodeURIComponent(orgIdOrName)}`;
    const res = await req(ep, 'PATCH', {
      status: 'Active',
      updated_at: new Date().toISOString()
    }, { 'Prefer': 'return=representation' });
    return res.data[0];
  }
  async saveUser(payload) {
    const res = await req('users', 'POST', payload, { 'Prefer': 'resolution=merge-duplicates,return=representation' });
    return res.data[0];
  }
  async approveUser(userIdOrEmail, approvedBy = 'Super Admin') {
    let ep = `users?id=eq.${encodeURIComponent(userIdOrEmail)}`;
    if (userIdOrEmail.includes('@')) {
      ep = `users?email=eq.${encodeURIComponent(userIdOrEmail.trim().toLowerCase())}`;
    }
    const res = await req(ep, 'PATCH', {
      status: 'active',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { 'Prefer': 'return=representation' });
    return res.data[0];
  }
  async saveStudent(orgId, payload) {
    const res = await req('students', 'POST', {
      org_id: orgId,
      student_name: payload.name,
      parent_email: payload.email,
      roll: payload.roll || ('R-' + Date.now()),
      status: payload.status || 'Pending HR Approval',
      updated_at: new Date().toISOString()
    }, { 'Prefer': 'resolution=merge-duplicates,return=representation' });
    return res.data[0];
  }
  async approveStudent(studentIdOrRoll, approvedBy = 'HR Directorate') {
    let ep = `students?id=eq.${encodeURIComponent(studentIdOrRoll)}`;
    if (studentIdOrRoll.startsWith('STD-') || studentIdOrRoll.startsWith('R-')) {
      ep = `students?roll=eq.${encodeURIComponent(studentIdOrRoll)}`;
    }
    const res = await req(ep, 'PATCH', {
      status: 'Active',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { 'Prefer': 'return=representation' });
    return res.data[0];
  }
  async authenticate(email, password, orgId = null, role = null) {
    const cleanEmail = (email || '').trim().toLowerCase();
    let ep = `users?email=eq.${encodeURIComponent(cleanEmail)}`;
    if (orgId) ep += `&org=eq.${encodeURIComponent(orgId)}`;
    const usersRes = await req(ep);
    const users = usersRes.data;
    if (!users || users.length === 0) return { success: false, error: 'Account not found' };

    const user = users[0];
    const storedPass = user.pass_hash || user.password;
    if (storedPass && storedPass !== password) return { success: false, error: 'Invalid password' };

    // Role check
    if (role && user.role && user.role.toLowerCase() !== role.toLowerCase() && user.role.toLowerCase() !== 'admin') {
      return { success: false, error: `Role mismatch: expected ${role}, found ${user.role}` };
    }

    // Org check (Super Admin approves organisations)
    if (user.role !== 'admin' && user.org && user.org !== 'FLAWLESS GRAPHICS') {
      const orgData = await this.getOrganization(user.org);
      if (orgData) {
        const os = (orgData.status || '').toLowerCase();
        if (os === 'pending_approval' || os === 'pending') {
          return { success: false, status: 'pending_org', error: `Organisation '${orgData.org_name}' is pending approval by Super Admin Command.` };
        }
      }
    }

    // User status check
    const uStat = (user.status || 'pending_approval').toLowerCase();
    if (uStat === 'pending_approval' || uStat === 'pending') {
      if (user.role === 'hr') {
        return { success: false, status: 'pending_approval', approvedByRole: 'Super Admin', error: 'HR Account is awaiting Super Admin authorization.' };
      } else if (user.role === 'teacher') {
        return { success: false, status: 'pending_approval', approvedByRole: 'Human Resources', error: 'Teacher account is awaiting approval by Human Resources.' };
      } else if (user.role === 'finance') {
        return { success: false, status: 'pending_approval', approvedByRole: 'Human Resources', error: 'Finance account is awaiting approval by Human Resources.' };
      } else if (user.role === 'student') {
        return { success: false, status: 'pending_approval', approvedByRole: 'Human Resources', error: 'Student admission is awaiting approval by Human Resources.' };
      } else {
        return { success: false, status: 'pending_approval', error: 'Account is pending administrative authorization.' };
      }
    }

    return { success: true, user };
  }
}

async function run() {
  console.log('=== STARTING HIERARCHICAL APPROVAL TEST ===');
  const supa = new TestSupabaseService();
  const testOrgName = 'ACADEMY OF ARTS';

  // Initial cleanup if previous run failed halfway
  await req(`students?org_id=eq.${encodeURIComponent(testOrgName)}`, 'DELETE').catch(() => {});
  await req(`users?org=eq.${encodeURIComponent(testOrgName)}`, 'DELETE').catch(() => {});
  await req(`organizations?org_name=eq.${encodeURIComponent(testOrgName)}`, 'DELETE').catch(() => {});

  // Test 1: Verify Root Super Admin exists and can authenticate
  console.log('\n--- 1. Root Super Admin Authentication ---');
  const adminAuth = await supa.authenticate('admin@flawlessgraphics.com', 'admin123', null, 'admin');
  console.log('Super Admin login status:', adminAuth.success, adminAuth.user ? `Name: ${adminAuth.user.name}` : adminAuth.error);
  if (!adminAuth.success) throw new Error('Root Super Admin failed to authenticate');

  // Test 2: Tier 1 - Register Organization & HR Account (Pending Super Admin Approval)
  console.log('\n--- 2. Tier 1 Registration: Org & HR ---');
  const testHREmail = 'hr.clara@academyarts.org';

  await supa.saveOrganization({
    org_name: testOrgName,
    admin_name: 'Clara Oswald',
    email: testHREmail,
    status: 'pending_approval'
  });
  console.log(`Saved organization '${testOrgName}' with status: pending_approval`);

  await supa.saveUser({
    email: testHREmail,
    name: 'Clara Oswald',
    pass_hash: 'Clara@123',
    role: 'hr',
    org: testOrgName,
    status: 'pending_approval'
  });
  console.log(`Saved user '${testHREmail}' with status: pending_approval`);

  // Attempt login for Clara before Org approval -> Should be BLOCKED by Super Admin level
  const claraLogin1 = await supa.authenticate(testHREmail, 'Clara@123', testOrgName, 'hr');
  console.log('Clara Login (Pre-Org Approval):', claraLogin1);
  if (claraLogin1.success) throw new Error('Clara logged in before Organization approval!');

  // Super Admin approves Organization
  console.log('\n--- Super Admin Approving Organization ---');
  const approvedOrg = await supa.approveOrganization(testOrgName);
  console.log('Approved Org Status:', approvedOrg ? approvedOrg.status : 'Active');

  // Attempt login for Clara after Org approval but before HR user approval -> Should STILL be blocked awaiting Super Admin
  const claraLogin2 = await supa.authenticate(testHREmail, 'Clara@123', testOrgName, 'hr');
  console.log('Clara Login (Post-Org, Pre-User Approval):', claraLogin2);
  if (claraLogin2.success) throw new Error('Clara logged in before User approval!');
  if (claraLogin2.approvedByRole !== 'Super Admin') throw new Error('Expected approval role to be Super Admin');

  // Super Admin approves HR Account
  console.log('\n--- Super Admin Approving HR Account ---');
  const approvedHR = await supa.approveUser(testHREmail, 'Super Admin');
  console.log('Approved HR Status:', approvedHR.status, 'Approved By:', approvedHR.approved_by);

  // Attempt login for Clara -> Should now SUCCEED
  const claraLogin3 = await supa.authenticate(testHREmail, 'Clara@123', testOrgName, 'hr');
  console.log('Clara Login (Post-Approval):', claraLogin3.success, claraLogin3.user ? claraLogin3.user.name : claraLogin3.error);
  if (!claraLogin3.success) throw new Error('Clara failed to log in after Super Admin approval!');

  // Test 3: Tier 2 - Register Teacher, Finance, Student (Pending HR Approval)
  console.log('\n--- 3. Tier 2 Registration: Teacher, Finance, Student ---');
  const testTeacherEmail = 'teacher.sam@academyarts.org';
  const testFinanceEmail = 'bursar.kwame@academyarts.org';
  const testStudentEmail = 'student.kofi@academyarts.org';

  await supa.saveUser({
    email: testTeacherEmail,
    name: 'Samuel Academic',
    pass_hash: 'Teach@123',
    role: 'teacher',
    org: testOrgName,
    status: 'pending_approval'
  });

  await supa.saveUser({
    email: testFinanceEmail,
    name: 'Kwame Treasury',
    pass_hash: 'Bursar@123',
    role: 'finance',
    org: testOrgName,
    status: 'pending_approval'
  });

  await supa.saveUser({
    email: testStudentEmail,
    name: 'Kofi Learner',
    pass_hash: 'Student@123',
    role: 'student',
    org: testOrgName,
    status: 'pending_approval'
  });
  await supa.saveStudent(testOrgName, {
    email: testStudentEmail,
    name: 'Kofi Learner',
    roll: 'STD-2026-001',
    status: 'Pending HR Approval'
  });

  // Verify all 3 sign-in attempts fail with HR Directorate requirement
  console.log('\n--- Verifying Blocked Sign-in before HR Approval ---');
  const teacherAuth1 = await supa.authenticate(testTeacherEmail, 'Teach@123', testOrgName, 'teacher');
  console.log('Teacher Auth 1:', teacherAuth1.error, `(ApprovedByRole: ${teacherAuth1.approvedByRole})`);
  if (teacherAuth1.success || teacherAuth1.approvedByRole !== 'Human Resources') {
    throw new Error('Teacher auth was not correctly held for HR approval!');
  }

  const financeAuth1 = await supa.authenticate(testFinanceEmail, 'Bursar@123', testOrgName, 'finance');
  console.log('Finance Auth 1:', financeAuth1.error, `(ApprovedByRole: ${financeAuth1.approvedByRole})`);
  if (financeAuth1.success || financeAuth1.approvedByRole !== 'Human Resources') {
    throw new Error('Finance auth was not correctly held for HR approval!');
  }

  const studentAuth1 = await supa.authenticate(testStudentEmail, 'Student@123', testOrgName, 'student');
  console.log('Student Auth 1:', studentAuth1.error, `(ApprovedByRole: ${studentAuth1.approvedByRole})`);
  if (studentAuth1.success || studentAuth1.approvedByRole !== 'Human Resources') {
    throw new Error('Student auth was not correctly held for HR approval!');
  }

  // HR Directorate Approves Teacher, Finance, and Student
  console.log('\n--- HR Directorate Approving Accounts ---');
  const appTeacher = await supa.approveUser(testTeacherEmail, 'HR Directorate');
  console.log('Teacher approved:', appTeacher.status, 'by', appTeacher.approved_by);

  const appFinance = await supa.approveUser(testFinanceEmail, 'HR Directorate');
  console.log('Finance approved:', appFinance.status, 'by', appFinance.approved_by);

  const appStudent = await supa.approveStudent('STD-2026-001', 'HR Directorate');
  console.log('Student approved:', appStudent.status, 'by', appStudent.approved_by);
  await supa.approveUser(testStudentEmail, 'HR Directorate');

  // Verify all 3 logins now succeed
  console.log('\n--- Verifying Successful Logins after HR Approval ---');
  const teacherAuth2 = await supa.authenticate(testTeacherEmail, 'Teach@123', testOrgName, 'teacher');
  console.log('Teacher Auth 2:', teacherAuth2.success ? 'SUCCESS' : teacherAuth2.error);
  if (!teacherAuth2.success) throw new Error('Teacher failed to authenticate after HR approval!');

  const financeAuth2 = await supa.authenticate(testFinanceEmail, 'Bursar@123', testOrgName, 'finance');
  console.log('Finance Auth 2:', financeAuth2.success ? 'SUCCESS' : financeAuth2.error);
  if (!financeAuth2.success) throw new Error('Finance failed to authenticate after HR approval!');

  const studentAuth2 = await supa.authenticate(testStudentEmail, 'Student@123', testOrgName, 'student');
  console.log('Student Auth 2:', studentAuth2.success ? 'SUCCESS' : studentAuth2.error);
  if (!studentAuth2.success) throw new Error('Student failed to authenticate after HR approval!');

  // Clean up test data
  console.log('\n--- Cleaning up test records ---');
  await req(`students?org_id=eq.${encodeURIComponent(testOrgName)}`, 'DELETE');
  await req(`users?org=eq.${encodeURIComponent(testOrgName)}`, 'DELETE');
  await req(`organizations?org_name=eq.${encodeURIComponent(testOrgName)}`, 'DELETE');
  console.log('Cleaned up test organization and members from Supabase Cloud.');

  console.log('\n>>> ALL HIERARCHICAL APPROVAL CHECKS PASSED PERFECTLY! <<<');
}

run().catch(err => {
  console.error('TEST RUN FAILED:', err);
  process.exit(1);
});
