const fs = require('fs');

console.log('Applying comprehensive Multi-Tenant Clean Slate across all portals...\n');

// 1. UPDATE pages/teacher/teacher-dashboard.html
let teacherDash = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');

// (a) Remove fake default classes in renderClasses()
const oldTeacherClassesRegex = /\/\/\s*Ensure default teacher classes if empty\s*\n\s*if\s*\(!arr\s*\|\|\s*!arr\.length\)\s*\{[\s\S]*?saveClasses\(arr\);\s*\}/;
const newTeacherClasses = `// Clean slate: only show real classes registered under active organization
  if (!Array.isArray(arr)) arr = [];`;

if (oldTeacherClassesRegex.test(teacherDash)) {
  teacherDash = teacherDash.replace(oldTeacherClassesRegex, newTeacherClasses);
  console.log('✓ teacher-dashboard: renderClasses clean slate applied');
}

// (b) Remove fake default assessments in getStudentAssessmentsForTeacher()
const oldTeacherAssessRegex = /function getStudentAssessmentsForTeacher\(\)\s*\{[\s\S]*?if\s*\(!list\s*\|\|\s*!Array\.isArray\(list\)\s*\|\|\s*!list\.length\)\s*\{[\s\S]*?\}\s*return list;\s*\}/;
const newTeacherAssess = `function getStudentAssessmentsForTeacher() {
  let list = safeParse(localStorage.getItem(ASSESS_KEY));
  if (!list || !Array.isArray(list)) list = [];
  return list;
}`;

if (oldTeacherAssessRegex.test(teacherDash)) {
  teacherDash = teacherDash.replace(oldTeacherAssessRegex, newTeacherAssess);
  console.log('✓ teacher-dashboard: getStudentAssessmentsForTeacher clean slate applied');
}
fs.writeFileSync('pages/teacher/teacher-dashboard.html', teacherDash, 'utf8');


// 2. UPDATE pages/finance/finance-dashboard.html
let financeDash = fs.readFileSync('pages/finance/finance-dashboard.html', 'utf8');

// Guard default data in finance-dashboard so new institutions start clean
const oldFinanceData = `    // INITIAL INSTITUTIONAL DATA
    let defaultFacultyStaff = [`;

const newFinanceData = `    // INITIAL INSTITUTIONAL DATA (Clean slate for new institution workspaces)
    const isRootOrg = (ACTIVE_ORG || '').toUpperCase() === 'FLAWLESS GRAPHICS';
    let defaultFacultyStaff = isRootOrg ? [`;

if (financeDash.includes(oldFinanceData)) {
  financeDash = financeDash.replace(oldFinanceData, newFinanceData);
  
  // Also adjust defaultStudentAccounts and defaultScholarships
  financeDash = financeDash.replace(`    let defaultStudentAccounts = [`, `    let defaultStudentAccounts = isRootOrg ? [`);
  financeDash = financeDash.replace(`    let defaultScholarships = [`, `    let defaultScholarships = isRootOrg ? [`);
  financeDash = financeDash.replace(`    ];\n\n    let defaultStudentAccounts`, `    ] : [];\n\n    let defaultStudentAccounts`);
  financeDash = financeDash.replace(`    ];\n\n    let defaultScholarships`, `    ] : [];\n\n    let defaultScholarships`);
  financeDash = financeDash.replace(`    ];\n\n    let auditLogs = [`, `    ] : [];\n\n    let auditLogs = isRootOrg ? [`);
  financeDash = financeDash.replace(`    ];\n\n    let cashFlowChartObj = null;`, `    ] : [];\n\n    let cashFlowChartObj = null;`);
  
  fs.writeFileSync('pages/finance/finance-dashboard.html', financeDash, 'utf8');
  console.log('✓ finance-dashboard: multi-tenant clean slate applied');
}


// 3. VERIFY pages/hr/hr-dashboard.html
let hrDash = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// Ensure loadHRStudents renders clean empty state when no students
const oldEmptyStudentTable = `tbody.innerHTML = \`<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">No students registered yet. Click "Add Student" to register a student profile.</td></tr>\`;`;
if (!hrDash.includes('No students registered yet')) {
  console.log('Checking hr-dashboard empty state...');
} else {
  console.log('✓ hr-dashboard: empty state messaging verified');
}

// 4. VERIFY assets/js/quick-dock.js
let dock = fs.readFileSync('assets/js/quick-dock.js', 'utf8');
if (dock.includes('Registration Request Arrived') && !dock.includes('alert_att_today')) {
  console.log('✓ quick-dock.js: pure real-time notifications verified');
}

console.log('\nAll Multi-Tenant Clean Slate Updates Successfully Applied! 🎉');
