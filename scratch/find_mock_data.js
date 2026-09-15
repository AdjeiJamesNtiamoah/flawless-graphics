const fs = require('fs');

const hr = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8').split('\n');

console.log('--- HR DASHBOARD FUNCTIONS ---');
hr.forEach((line, idx) => {
  if (line.includes('function get') || line.includes('function load') || line.includes('function render')) {
    if (line.includes('Student') || line.includes('Class') || line.includes('Appraisal') || line.includes('Assessment') || line.includes('Teacher') || line.includes('Staff') || line.includes('Payroll') || line.includes('Attendance') || line.includes('Calendar') || line.includes('Department')) {
      console.log('Line ' + (idx + 1) + ': ' + line.trim());
    }
  }
});
