const fs = require('fs');
const assert = require('assert');
const https = require('https');

console.log('--- 1. VERIFYING SUPABASE CONFIGURATION ---');
const configCode = fs.readFileSync('assets/js/supabase-config.js', 'utf8');
assert(configCode.includes('https://wmvsujwgvlosfjdlhadu.supabase.co'), 'DEFAULT_CONFIG has active production Supabase project URL');
assert(configCode.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'), 'DEFAULT_CONFIG has active production Anon Key');
console.log('✔ Supabase config is pre-configured with active production credentials.');

console.log('--- 2. VERIFYING SUPABASE CLIENT PURITY ---');
const clientCode = fs.readFileSync('assets/js/supabase-client.js', 'utf8');
assert(!clientCode.includes('localStorage.setItem'), 'Supabase client has NO localStorage.setItem for entity data');
assert(!clientCode.includes('localStorage.getItem'), 'Supabase client has NO localStorage.getItem for entity data');
assert(clientCode.includes('class SupabaseRestClient'), 'SupabaseRestClient is present');
assert(clientCode.includes('getTeachers'), 'getTeachers is present');
assert(clientCode.includes('getStudents'), 'getStudents is present');
assert(clientCode.includes('getClasses'), 'getClasses is present');
assert(clientCode.includes('getAttendance'), 'getAttendance is present');
assert(clientCode.includes('getStudentFees'), 'getStudentFees is present');
assert(clientCode.includes('getTransactions'), 'getTransactions is present');
assert(clientCode.includes('getPayroll'), 'getPayroll is present');
assert(clientCode.includes('getAnnouncements'), 'getAnnouncements is present');
assert(clientCode.includes('authenticate'), 'authenticate is present');
console.log('✔ Supabase client is pure and provides complete REST methods without localStorage fallback.');

console.log('--- 3. VERIFYING DASHBOARDS HAVE DIRECT SUPABASE INTEGRATION ---');
const adminHtml = fs.readFileSync('pages/admin/admin-dashboard.html', 'utf8');
assert(adminHtml.includes('loadAllAdminData'), 'admin-dashboard.html contains loadAllAdminData async routine');
assert(adminHtml.includes('window.SupabaseService.getOrganizations()'), 'admin-dashboard.html calls Supabase for organizations');
assert(adminHtml.includes('window.SupabaseService.getUsers()'), 'admin-dashboard.html calls Supabase for users');

const hrHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
assert(hrHtml.includes('loadHRCloudData'), 'hr-dashboard.html contains loadHRCloudData async routine');
assert(hrHtml.includes('window.SupabaseService.getTeachers'), 'hr-dashboard.html calls Supabase for teachers');

const finHtml = fs.readFileSync('pages/finance/finance-dashboard.html', 'utf8');
assert(finHtml.includes('loadFinanceCloudData'), 'finance-dashboard.html contains loadFinanceCloudData async routine');
assert(finHtml.includes('window.SupabaseService.getStudentFees'), 'finance-dashboard.html calls Supabase for student fees');

const teachHtml = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
assert(teachHtml.includes('loadTeacherCloudData'), 'teacher-dashboard.html contains loadTeacherCloudData async routine');
assert(teachHtml.includes('window.SupabaseService.getClasses'), 'teacher-dashboard.html calls Supabase for classes');

const studHtml = fs.readFileSync('pages/student/student-dashboard.html', 'utf8');
assert(studHtml.includes('window.SupabaseService.getStudents'), 'student-dashboard.html calls Supabase for students');
assert(studHtml.includes('window.SupabaseService.getAnnouncements'), 'student-dashboard.html calls Supabase for announcements');
console.log('✔ All dashboards are configured to call data directly from Supabase Cloud.');

console.log('--- 4. TESTING LIVE SUPABASE REST API CONNECTIVITY ---');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';
const tables = ['organizations', 'users', 'teachers', 'classes', 'students', 'attendance_records', 'student_fees', 'transactions', 'payroll', 'announcements'];

async function testTables() {
  for (const table of tables) {
    await new Promise((resolve, reject) => {
      const req = https.request(`https://wmvsujwgvlosfjdlhadu.supabase.co/rest/v1/${table}?limit=1`, {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
      }, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          assert.strictEqual(res.statusCode, 200, `Table ${table} responded with HTTP ${res.statusCode}`);
          console.log(`  ✔ [Supabase REST] ${table} -> HTTP 200 OK`);
          resolve();
        });
      });
      req.on('error', reject);
      req.end();
    });
  }
  console.log('✔ All 10 core domain tables in Supabase responded successfully with HTTP 200 OK.');
  console.log('🎉 ALL SUPABASE EXCLUSIVE STORAGE TESTS PASSED!');
}

testTables().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
