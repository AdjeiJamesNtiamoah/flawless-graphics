const fs = require('fs');
const path = require('path');

// 1. Read quick-assistant.js and verify all role tour step configurations
const qaContent = fs.readFileSync(path.join(__dirname, '../assets/js/quick-assistant.js'), 'utf8');

const roles = ['hr', 'finance', 'teacher', 'student'];
const missingInQA = [];

roles.forEach(role => {
  if (!qaContent.includes(`role === '${role}'`) && !qaContent.includes(`role === "${role}"`) && !qaContent.includes(`"${role}"`) && !qaContent.includes(`'${role}'`)) {
    missingInQA.push(role);
  }
});

console.log('Roles checked in quick-assistant.js:', roles);
console.log('Tour welcome highlights exist for all 4 roles:', 
  qaContent.includes('HR & FACULTY PAYROLL PORTAL') &&
  qaContent.includes('BURSARY & TREASURY PORTAL') &&
  qaContent.includes('EDUCATOR & CLASSROOM PORTAL') &&
  qaContent.includes('STUDENT ACADEMY PORTAL')
);

// 2. Read index.html and verify DRAWER_ROLE_CONFIGS and student inclusion
const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
console.log('Student role in DRAWER_ROLE_CONFIGS:', indexContent.includes('student: {') && indexContent.includes('Student Academy Enrollment'));
console.log('Student tab in drawer-role-switch:', indexContent.includes('data-role="student"'));
console.log('is_new_registration flag in pendingDrawerSignupData:', indexContent.includes('is_new_registration: true'));
console.log('is_new_registration preserved in sessionData:', indexContent.includes('isNewReg = !!(matchedUser.is_new_registration'));

// 3. Verify Tour buttons across dashboards
const hrContent = fs.readFileSync(path.join(__dirname, '../pages/hr/hr-dashboard.html'), 'utf8');
const finContent = fs.readFileSync(path.join(__dirname, '../pages/finance/finance-dashboard.html'), 'utf8');
const teachContent = fs.readFileSync(path.join(__dirname, '../pages/teacher/teacher-dashboard.html'), 'utf8');
const stuContent = fs.readFileSync(path.join(__dirname, '../pages/student/student-dashboard.html'), 'utf8');

console.log('HR dashboard has Tour button & quick-assistant.js:', hrContent.includes('startProjectTour') && hrContent.includes('quick-assistant.js'));
console.log('Finance dashboard has Tour button & quick-assistant.js:', finContent.includes('startProjectTour') && finContent.includes('quick-assistant.js'));
console.log('Teacher dashboard has Tour button & quick-assistant.js:', teachContent.includes('startProjectTour') && teachContent.includes('quick-assistant.js'));
console.log('Student dashboard has Tour button & quick-assistant.js:', stuContent.includes('startProjectTour') && stuContent.includes('quick-assistant.js'));
