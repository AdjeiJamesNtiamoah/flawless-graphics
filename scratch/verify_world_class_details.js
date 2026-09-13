const fs = require('fs');
const path = require('path');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('  FLAWLESS GRAPHICS — WORLD-CLASS ELEVATION AUDIT  ');
console.log('====================================================\n');

// 1. Check shared design system & keyframe animations
console.log('[TEST GROUP 1] Shared Design System & Animation Engine');
const sharedCss = fs.readFileSync(path.join(__dirname, '../assets/css/shared-design.css'), 'utf8');
assert(sharedCss.includes('@keyframes pulseLive'), 'Contains @keyframes pulseLive');
assert(sharedCss.includes('@keyframes floatCard'), 'Contains @keyframes floatCard');
assert(sharedCss.includes('@keyframes shimmerEffect'), 'Contains @keyframes shimmerEffect');
assert(sharedCss.includes('.hover-lift'), 'Contains .hover-lift micro-interaction utility');
assert(sharedCss.includes('.institutional-ticker'), 'Contains .institutional-ticker component');
assert(sharedCss.includes('.glass-luxury-card'), 'Contains .glass-luxury-card utility');

// 2. Check Welcome Hub (welcome.html)
console.log('\n[TEST GROUP 2] Welcome Hub & Navigation Workstations');
const welcomeHtml = fs.readFileSync(path.join(__dirname, '../welcome.html'), 'utf8');
assert(welcomeHtml.includes('telemetry-ribbon'), 'Contains institutional telemetry ribbon');
assert(welcomeHtml.includes('portalAdminLink'), 'Contains Super Admin workstation link');
assert(welcomeHtml.includes('portalTeacherLink'), 'Contains Teachers workstation link');
assert(welcomeHtml.includes('portalStudentLink'), 'Contains Student Academy workstation link');
assert(welcomeHtml.includes('portalFinanceLink'), 'Contains Bursary & Finance workstation link');
assert(welcomeHtml.includes('portalHrLink'), 'Contains HR workstation link');
assert(welcomeHtml.includes('liveClock'), 'Contains real-time live clock ticker');
assert(welcomeHtml.includes('AuthSession'), 'Contains AuthSession single-sign-on integration');

// 3. Check Organization Login (site-login.html)
console.log('\n[TEST GROUP 3] Site Login & Role Presets');
const loginHtml = fs.readFileSync(path.join(__dirname, '../site-login.html'), 'utf8');
assert(loginHtml.includes('selectDemoRole'), 'Contains selectDemoRole presets selector');
assert(loginHtml.includes('selectDemoRole(\'admin\')'), 'Contains Admin demo switch');
assert(loginHtml.includes('selectDemoRole(\'teacher\')'), 'Contains Teacher demo switch');
assert(loginHtml.includes('selectDemoRole(\'student\')'), 'Contains Student demo switch');
assert(loginHtml.includes('selectDemoRole(\'finance\')'), 'Contains Finance demo switch');
assert(loginHtml.includes('selectDemoRole(\'hr\')'), 'Contains HR demo switch');
assert(loginHtml.includes('verificationModal'), 'Contains OTP Email Verification Modal');

// 4. Check Super Admin Portal (admin-dashboard.html)
console.log('\n[TEST GROUP 4] Super Admin Dashboard');
const adminHtml = fs.readFileSync(path.join(__dirname, '../pages/admin/admin-dashboard.html'), 'utf8');
assert(adminHtml.includes('institutional-ticker'), 'Contains institutional ticker in topbar');
assert(adminHtml.includes('Live Sync'), 'Contains live cloud sync telemetry badge');
assert(adminHtml.includes('activeTenantSelect'), 'Contains multi-tenant switch control');
assert(adminHtml.includes('adminTopbarNotifBtn'), 'Contains Notifications button with badge');

// 5. Check Teacher Workstation (teacher-dashboard.html)
console.log('\n[TEST GROUP 5] Teacher Workstation');
const teacherHtml = fs.readFileSync(path.join(__dirname, '../pages/teacher/teacher-dashboard.html'), 'utf8');
assert(teacherHtml.includes('academic-term-badge'), 'Contains academic term badge');
assert(teacherHtml.includes('duty-pill'), 'Contains educator duty pill');
assert(teacherHtml.includes('educator-kpis-grid'), 'Contains educator KPI telemetry grid');
assert(teacherHtml.includes('teacherTopbarNotifBtn'), 'Contains notification bridge');

// 6. Check Finance Portal (finance-dashboard.html)
console.log('\n[TEST GROUP 6] Finance & Bursary Control');
const financeHtml = fs.readFileSync(path.join(__dirname, '../pages/finance/finance-dashboard.html'), 'utf8');
assert(financeHtml.includes('tabDashboard'), 'Contains Treasury Hub');
assert(financeHtml.includes('tabStudentBilling'), 'Contains Student Ledger');
assert(financeHtml.includes('tabClearanceDesk'), 'Contains Exam Clearance Desk');
assert(financeHtml.includes('tabApproval'), 'Contains Staff Payroll Desk');
assert(financeHtml.includes('tabFeeTariff'), 'Contains Fee Tariff Matrix');
assert(financeHtml.includes('tabScholarships'), 'Contains Scholarships & Aid Desk');

// 7. Check Student Portal (student-dashboard.html)
console.log('\n[TEST GROUP 7] Student Academy Portal');
const studentHtml = fs.readFileSync(path.join(__dirname, '../pages/student/student-dashboard.html'), 'utf8');
assert(studentHtml.includes('smartIdCardBox') || studentHtml.includes('smart-badge'), 'Contains Digital Smart ID Badge Box');
assert(studentHtml.includes('overviewSection') && studentHtml.includes('gradesSection'), 'Contains Academic Coursework & Gradebook Sections');
assert(studentHtml.includes('academicContextBreadcrumb') || studentHtml.includes('todayScheduleContainer'), 'Contains Academic Schedule & Context Bar');

console.log('\n====================================================');
console.log(`  AUDIT COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
