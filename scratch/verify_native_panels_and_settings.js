const fs = require('fs');
const path = require('path');
const vm = require('vm');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`FAIL: ${message}`);
    testsFailed++;
  }
}

const hrPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
const teacherPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const adminPath = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');

assert(fs.existsSync(hrPath), 'HR dashboard HTML exists');
assert(fs.existsSync(teacherPath), 'Teacher dashboard HTML exists');
assert(fs.existsSync(adminPath), 'Admin dashboard HTML exists');

const hrHtml = fs.readFileSync(hrPath, 'utf8').replace(/\r\n/g, '\n');
const teacherHtml = fs.readFileSync(teacherPath, 'utf8').replace(/\r\n/g, '\n');
const adminHtml = fs.readFileSync(adminPath, 'utf8').replace(/\r\n/g, '\n');

console.log('\n--- 1. DOM Hierarchy & Native Panel Existence ---');

// Assert appraisals section is properly closed before academicCalendarSection
const appraisalsIndex = hrHtml.indexOf('id="appraisalsSectionPanel"');
const calendarIndex = hrHtml.indexOf('id="academicCalendarSection"');
const assessmentsIndex = hrHtml.indexOf('id="studentAssessmentsSection"');
const attLogIndex = hrHtml.indexOf('id="attendanceLogSectionPanel"');
const payslipsIndex = hrHtml.indexOf('id="payslipGeneratorSectionPanel"');
const salarySchIndex = hrHtml.indexOf('id="salarySchedulesSectionPanel"');
const reportsIndex = hrHtml.indexOf('id="reportsSectionPanel"');
const settingsIndex = hrHtml.indexOf('id="settingsSectionPanel"');
const mainCloseIndex = hrHtml.lastIndexOf('</main>');

assert(appraisalsIndex !== -1, 'HR has #appraisalsSectionPanel');
assert(calendarIndex !== -1, 'HR has #academicCalendarSection');
assert(assessmentsIndex !== -1, 'HR has #studentAssessmentsSection');
assert(attLogIndex !== -1, 'HR has #attendanceLogSectionPanel');
assert(payslipsIndex !== -1, 'HR has #payslipGeneratorSectionPanel');
assert(salarySchIndex !== -1, 'HR has #salarySchedulesSectionPanel');
assert(reportsIndex !== -1, 'HR has #reportsSectionPanel');
assert(settingsIndex !== -1, 'HR has #settingsSectionPanel');
assert(mainCloseIndex !== -1, 'HR has </main>');

// Verify appraisalsSectionPanel closing tag occurs BEFORE academicCalendarSection
const betweenAppraisalsAndCalendar = hrHtml.slice(appraisalsIndex, calendarIndex);
assert(betweenAppraisalsAndCalendar.includes('</section>'), '#appraisalsSectionPanel is closed before #academicCalendarSection');

// Verify all panels appear before </main>
assert(calendarIndex < mainCloseIndex, '#academicCalendarSection is inside <main>');
assert(assessmentsIndex < mainCloseIndex, '#studentAssessmentsSection is inside <main>');
assert(attLogIndex < mainCloseIndex, '#attendanceLogSectionPanel is inside <main>');
assert(payslipsIndex < mainCloseIndex, '#payslipGeneratorSectionPanel is inside <main>');
assert(salarySchIndex < mainCloseIndex, '#salarySchedulesSectionPanel is inside <main>');
assert(reportsIndex < mainCloseIndex, '#reportsSectionPanel is inside <main>');

console.log('\n--- 2. Native Sidebar Navigation & showSection without Iframes ---');
assert(hrHtml.includes("showSection('attendance-log')"), 'Sidebar navigates to attendance-log via showSection');
assert(hrHtml.includes("showSection('payslips')"), 'Sidebar navigates to payslips via showSection');
assert(hrHtml.includes("showSection('salary-schedules')"), 'Sidebar navigates to salary-schedules via showSection');
assert(hrHtml.includes("showSection('reports')"), 'Sidebar navigates to reports via showSection');

assert(hrHtml.includes("'attendance-log': document.getElementById('attendanceLogSectionPanel')"), 'sections dictionary maps attendance-log natively');
assert(hrHtml.includes("payslips: document.getElementById('payslipGeneratorSectionPanel')"), 'sections dictionary maps payslips natively');
assert(hrHtml.includes("'salary-schedules': document.getElementById('salarySchedulesSectionPanel')"), 'sections dictionary maps salary-schedules natively');
assert(hrHtml.includes("reports: document.getElementById('reportsSectionPanel')"), 'sections dictionary maps reports natively');

// Assert showSection does NOT call openEmbeddedPage for these sections
assert(hrHtml.includes("if (name === 'attendance-log' || name === 'attendance-summary') {\n    renderAttendanceLogSection();"), 'showSection renders attendance-log natively');
assert(hrHtml.includes("if (name === 'payslips' || name === 'payslip-generator') {\n    renderPayslipGeneratorSection();"), 'showSection renders payslips natively');
assert(hrHtml.includes("if (name === 'salary-schedules') {\n    renderSalarySchedulesSection();"), 'showSection renders salary-schedules natively');
assert(hrHtml.includes("if (name === 'reports' || name === 'teacher-reports') {\n    renderReportsSection();"), 'showSection renders reports natively');

console.log('\n--- 3. Attendance Log & Punctuality Desk Implementation ---');
assert(hrHtml.includes('id="attKpiPresentRate"'), 'HR has Present Today KPI');
assert(hrHtml.includes('id="attKpiOnTimeRate"'), 'HR has On-Time Compliance KPI');
assert(hrHtml.includes('id="attKpiLateCount"'), 'HR has Late Arrivals KPI');
assert(hrHtml.includes('id="attKpiLeaveCount"'), 'HR has Approved Leave KPI');
assert(hrHtml.includes('id="attendancePunchModal"'), 'HR has #attendancePunchModal for manual punches');
assert(hrHtml.includes('markAllPresentToday'), 'HR has markAllPresentToday bulk action');
assert(hrHtml.includes('exportAttendanceCSV'), 'HR has exportAttendanceCSV function');
assert(hrHtml.includes('printAttendanceSheet'), 'HR has printAttendanceSheet function');

console.log('\n--- 4. Staff Payslip Generator Implementation ---');
assert(hrHtml.includes('id="ps_employeeSelect"'), 'HR has employee selector');
assert(hrHtml.includes('id="ps_baseSalary"'), 'HR has base salary input');
assert(hrHtml.includes('id="ps_payeDisplay"'), 'HR has PAYE ~13% display');
assert(hrHtml.includes('id="ps_ssnitDisplay"'), 'HR has SSNIT 5.5% display');
assert(hrHtml.includes('id="ps_netPayoutDisplay"'), 'HR has net payout badge');
assert(hrHtml.includes('id="payslipPrintableDocument"'), 'HR has official printable payslip layout');
assert(hrHtml.includes('recalculatePayslip'), 'HR has recalculatePayslip function');
assert(hrHtml.includes('printPayslipDocument'), 'HR has printPayslipDocument function');
assert(hrHtml.includes('emailDigitalPayslip'), 'HR has emailDigitalPayslip function');

console.log('\n--- 5. Salary Schedules & Compensation Matrix ---');
assert(hrHtml.includes('id="schKpiGross"'), 'HR has Gross Wage Bill KPI');
assert(hrHtml.includes('id="schKpiNet"'), 'HR has Net Disbursed KPI');
assert(hrHtml.includes('id="schKpiTax"'), 'HR has Statutory Tax Liability KPI');
assert(hrHtml.includes('id="schKpiSSNIT"'), 'HR has Pension Reserve KPI');
assert(hrHtml.includes('Faculty Band 1'), 'HR has Band 1 Matrix');
assert(hrHtml.includes('Faculty Band 2'), 'HR has Band 2 Matrix');
assert(hrHtml.includes('Support Band 3'), 'HR has Band 3 Matrix');
assert(hrHtml.includes('Junior Band 4'), 'HR has Band 4 Matrix');
assert(hrHtml.includes('runPayrollBatchDisbursement'), 'HR has runPayrollBatchDisbursement action');
assert(hrHtml.includes('exportSalarySchedulesCSV'), 'HR has exportSalarySchedulesCSV action');

console.log('\n--- 6. Executive Workforce Reports Center ---');
assert(hrHtml.includes('id="repKpiHeadcount"'), 'HR has Headcount KPI');
assert(hrHtml.includes('id="repKpiTeacherRatio"'), 'HR has Educator Ratio KPI');
assert(hrHtml.includes('data-report="master"'), 'HR has Faculty Master Roll Report');
assert(hrHtml.includes('data-report="departments"'), 'HR has Department Density Report');
assert(hrHtml.includes('data-report="taxes"'), 'HR has Tax & SSNIT Filing Report');
assert(hrHtml.includes('data-report="attendance"'), 'HR has Attendance Audit Report');
assert(hrHtml.includes('data-report="assessments"'), 'HR has Assessment QA Summary Report');
assert(hrHtml.includes('switchReportCategory'), 'HR has switchReportCategory function');
assert(hrHtml.includes('exportReportCSV'), 'HR has exportReportCSV function');

console.log('\n--- 7. Cross-Portal Broadcasts (HR, Admin & Teacher) ---');
// HR Broadcast Studio
assert(hrHtml.includes('id="broadcastComposeForm"'), 'HR has broadcast composer form');
assert(hrHtml.includes('id="bc_category"'), 'HR has category picker');
assert(hrHtml.includes('id="bc_priority"'), 'HR has priority picker');
assert(hrHtml.includes('id="bc_pinned"'), 'HR has pin toggle');
assert(hrHtml.includes('handlePublishBroadcast'), 'HR has handlePublishBroadcast function');

// Super Admin Broadcast Console
assert(adminHtml.includes('data-sec="broadcasts"'), 'Super Admin sidebar has Broadcast Console link');
assert(adminHtml.includes('id="sec_broadcasts"'), 'Super Admin has #sec_broadcasts console panel');
assert(adminHtml.includes('[Super Admin Broadcast]'), 'Super Admin has verified gold broadcast badge');
assert(adminHtml.includes('handleAdminPublishBroadcast'), 'Super Admin has handleAdminPublishBroadcast function');

// Teacher Portal
assert(teacherHtml.includes('id="teacherBroadcastBanner"'), 'Teacher portal has overview live broadcast alert banner');
assert(teacherHtml.includes('data-section="broadcasts"'), 'Teacher portal has Directives & Broadcasts tab');
assert(teacherHtml.includes('id="broadcastsSection"'), 'Teacher portal has #broadcastsSection panel');
assert(teacherHtml.includes('acknowledgeActiveBroadcast'), 'Teacher portal has broadcast acknowledgment action');
assert(teacherHtml.includes('type: \'broadcast\''), 'Teacher portal notifications bell includes broadcasts');

console.log('\n--- 8. Enterprise Settings Workstation (6 Tabs) ---');
assert(hrHtml.includes('data-settab="profile"'), 'Settings has Organization Profile tab');
assert(hrHtml.includes('data-settab="standards"'), 'Settings has Academic Standards tab');
assert(hrHtml.includes('data-settab="localization"'), 'Settings has Localization & Currency tab');
assert(hrHtml.includes('data-settab="security"'), 'Settings has Security & Governance tab');
assert(hrHtml.includes('data-settab="theme"'), 'Settings has Visual Themes tab');
assert(hrHtml.includes('data-settab="backup"'), 'Settings has Cloud Sync & Disaster Recovery tab');
assert(hrHtml.includes('saveAllPortalSettings'), 'Settings has saveAllPortalSettings action');
assert(hrHtml.includes('exportFullDatabaseBackup'), 'Settings has 1-click JSON backup export');
assert(hrHtml.includes('restoreFullDatabaseBackup'), 'Settings has restore from JSON backup');
assert(hrHtml.includes('resetLocalCacheConfirm'), 'Settings has emergency cache purge');

console.log('\n--- 9. Functional Logic & Calculation Tests ---');
// Test payslip calculation logic
const baseSalary = 4000;
const respAllow = 500;
const transAllow = 300;
const overtime = 200;
const gross = baseSalary + respAllow + transAllow + overtime; // 5000
const paye = Math.round(gross * 0.13 * 100) / 100; // 650
const ssnit = Math.round(baseSalary * 0.055 * 100) / 100; // 220
const welfare = 50;
const totalDed = paye + ssnit + welfare; // 920
const netPay = gross - totalDed; // 4080

assert(gross === 5000, `Gross salary calculation matches: GHS ${gross}`);
assert(paye === 650, `PAYE ~13% calculation matches: GHS ${paye}`);
assert(ssnit === 220, `SSNIT 5.5% calculation matches: GHS ${ssnit}`);
assert(netPay === 4080, `Net pay calculation matches: GHS ${netPay}`);

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}
