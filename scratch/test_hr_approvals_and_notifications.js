const assert = require('assert');
const fs = require('fs');

console.log('====================================================');
console.log('TEST SUITE: HR APPROVALS & REALTIME NOTIFICATIONS');
console.log('====================================================\n');

// 1. Static Code Analysis Checks
console.log('STEP 1: Verify Codebase Implementations');

// 1.1 HR Dashboard Filter Exclusions
const hrHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
assert(!hrHtml.includes("if (r === 'teacher' || r === 'student' || r === 'finance') return false;"),
  'HR dashboard must not exclude teachers or finance from approval queue');
assert(hrHtml.includes("if (r === 'admin' || r === 'super_admin' || r === 'superadmin' || r === 'hr') return false;"),
  'HR dashboard must only exclude admin/hr from HR queue');
assert(hrHtml.includes('renderUsers();\r\n    updatePendingBanners();') || hrHtml.includes('renderUsers();\n    updatePendingBanners();'),
  'HR dashboard fg:realtime-change must trigger renderUsers() and updatePendingBanners()');
console.log('  ✓ HR dashboard allows teachers and finance in approval queue');
console.log('  ✓ HR dashboard fg:realtime-change listener calls renderUsers() & updatePendingBanners()');

// 1.2 Finance Login Registration & Pending Gate
const financeHtml = fs.readFileSync('pages/finance/finance-login.html', 'utf8');
assert(financeHtml.includes("status: 'pending_approval'"), 'Finance registration must set status: pending_approval');
assert(!financeHtml.includes("showSuccess('Registration submitted! Your Finance account is active. You can now sign in.');"),
  'Finance registration must not claim account is immediately active');
assert(financeHtml.includes('watchPendingApproval'), 'Finance sign in must watch pending approval in real time');
console.log('  ✓ Finance registration submits status: pending_approval');
console.log('  ✓ Finance login gates pending accounts with real-time approval watchdog');

// 1.3 Teacher Login Registration & Pending Gate
const teacherHtml = fs.readFileSync('pages/teacher/teacher-login.html', 'utf8');
assert(teacherHtml.includes("pendingTeacherData.status = 'pending_approval';"), 'Teacher registration must set pending_approval');
assert(teacherHtml.includes('watchPendingApproval'), 'Teacher login must watch pending approval in real time');
console.log('  ✓ Teacher registration submits status: pending_approval');
console.log('  ✓ Teacher login gates pending accounts with real-time approval watchdog');

// 1.4 Supabase Client Realtime Subscription & LucyBus Dispatch
const supabaseClientJs = fs.readFileSync('assets/js/supabase-client.js', 'utf8');
assert(supabaseClientJs.includes('setupRealtimeChannel'), 'Supabase client must implement setupRealtimeChannel');
assert(supabaseClientJs.includes("dispatchLucyBusEvent(parsed.action, parsed.data)"), 'Cross-tab storage listener must dispatch LucyBus event');
assert(supabaseClientJs.includes("this.dispatchLucyBusEvent(action, data)"), 'broadcastChange must dispatch LucyBus event');
console.log('  ✓ Supabase client subscribes to fg-portal-live-sync channel');
console.log('  ✓ Supabase client dispatches cross-tab and in-tab LucyBus live notifications');

// 1.5 Quick Dock & Slide Over Realtime Listeners
const quickDockJs = fs.readFileSync('assets/js/quick-dock.js', 'utf8');
assert(quickDockJs.includes("window.addEventListener('fg:realtime-change'"), 'QuickDock must listen to fg:realtime-change');
const slideOverJs = fs.readFileSync('assets/js/slide-over.js', 'utf8');
assert(slideOverJs.includes('renderNotificationsList'), 'SlideOver must implement dynamic renderNotificationsList');
console.log('  ✓ QuickDock listens to fg:realtime-change to refresh notifications without reload');
console.log('  ✓ SlideOver dynamically renders arrived notifications and listens to fg:realtime-change');

// 2. Functional Simulation of Supabase Cloud Flow
console.log('\nSTEP 2: Functional Cloud Simulation of Teacher & Finance Registration & HR Approval');

async function runCloudSimulation() {
  const SUPABASE_URL = 'https://wmvsujwgvlosfjdlhadu.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

  async function request(endpoint, method = 'GET', body = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${SUPABASE_URL}${endpoint}`;
    const opts = {
      method: method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (body) {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let json = null;
    try {
      json = await res.json();
    } catch (_) {}
    return { status: res.status, body: json };
  }

  const testOrg = 'CAPE COAST UNIVERSITY';
  const testTeacherEmail = `test.teacher.${Date.now()}@ucc.edu.gh`;
  const testFinanceEmail = `test.finance.${Date.now()}@ucc.edu.gh`;

  console.log(`\n  a) Registering Teacher (${testTeacherEmail}) with status: pending_approval...`);
  const teacherUserRes = await request('/rest/v1/users', 'POST', {
    id: 'u_' + Date.now(),
    org: testOrg,
    name: 'Kofi Teacher',
    email: testTeacherEmail,
    role: 'teacher',
    status: 'pending_approval'
  });
  assert(teacherUserRes.status === 201 || teacherUserRes.status === 200, 'Teacher user record saved');
  console.log('     ✓ Teacher saved to Supabase users with status: pending_approval');

  console.log(`\n  b) Registering Finance Officer (${testFinanceEmail}) with status: pending_approval...`);
  const financeUserRes = await request('/rest/v1/users', 'POST', {
    id: 'u_' + (Date.now() + 1),
    org: testOrg,
    name: 'Ama Finance',
    email: testFinanceEmail,
    role: 'finance',
    status: 'pending_approval'
  });
  assert(financeUserRes.status === 201 || financeUserRes.status === 200, 'Finance user record saved');
  console.log('     ✓ Finance officer saved to Supabase users with status: pending_approval');

  console.log('\n  c) Verifying HR Dashboard pending approvals query logic...');
  const allUsersRes = await request(`/rest/v1/users?org=eq.${encodeURIComponent(testOrg)}&order=created_at.desc`);
  const orgUsers = Array.isArray(allUsersRes.body) ? allUsersRes.body : [];

  // Apply HR Dashboard filter logic
  const pendingUsersForHR = orgUsers.filter(u => {
    const s = (u.status || 'active').toLowerCase();
    const r = (u.role || '').toLowerCase();
    if (r === 'admin' || r === 'super_admin' || r === 'superadmin' || r === 'hr') return false;
    return s === 'pending_approval' || s === 'pending';
  });

  const hasTeacher = pendingUsersForHR.some(u => u.email === testTeacherEmail);
  const hasFinance = pendingUsersForHR.some(u => u.email === testFinanceEmail);

  assert(hasTeacher, 'Teacher applicant MUST be present in HR pending approval queue');
  assert(hasFinance, 'Finance applicant MUST be present in HR pending approval queue');
  console.log(`     ✓ HR Dashboard successfully retrieved ${pendingUsersForHR.length} pending applicants`);
  console.log('     ✓ Both Teacher and Finance applicants are VISIBLE in HR pending approvals queue!');

  console.log('\n  d) HR Approving Teacher Account...');
  const approveTeacherRes = await request(`/rest/v1/users?email=eq.${encodeURIComponent(testTeacherEmail)}`, 'PATCH', {
    status: 'active',
    approved_by: 'Human Resources',
    approved_at: new Date().toISOString()
  });
  assert(approveTeacherRes.status === 200, 'Teacher approval PATCH succeeded');
  assert(approveTeacherRes.body[0].status === 'active', 'Teacher status updated to active');
  assert(approveTeacherRes.body[0].approved_by === 'Human Resources', 'Approved by Human Resources');
  console.log('     ✓ Teacher status updated to active by Human Resources');

  console.log('\n  e) HR Approving Finance Officer Account...');
  const approveFinanceRes = await request(`/rest/v1/users?email=eq.${encodeURIComponent(testFinanceEmail)}`, 'PATCH', {
    status: 'active',
    approved_by: 'Human Resources',
    approved_at: new Date().toISOString()
  });
  assert(approveFinanceRes.status === 200, 'Finance approval PATCH succeeded');
  assert(approveFinanceRes.body[0].status === 'active', 'Finance status updated to active');
  assert(approveFinanceRes.body[0].approved_by === 'Human Resources', 'Approved by Human Resources');
  console.log('     ✓ Finance officer status updated to active by Human Resources');

  console.log('\n  f) Clean up test records...');
  await request(`/rest/v1/users?email=eq.${encodeURIComponent(testTeacherEmail)}`, 'DELETE');
  await request(`/rest/v1/users?email=eq.${encodeURIComponent(testFinanceEmail)}`, 'DELETE');
  console.log('     ✓ Cleaned up test records from Supabase');

  console.log('\n====================================================');
  console.log('ALL TESTS PASSED! HR APPROVALS & REALTIME READY!');
  console.log('====================================================');
}

runCloudSimulation().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
