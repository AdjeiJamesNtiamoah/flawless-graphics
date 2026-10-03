const fs = require('fs');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('assignTeacherModalBackdrop') || 
      l.includes('submitTeacherAssignment') || 
      l.includes('assign_class_select') || 
      l.includes('closeAssignModal') ||
      l.includes('assignTeacher') ||
      l.includes('openAssignTeacherModal')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
