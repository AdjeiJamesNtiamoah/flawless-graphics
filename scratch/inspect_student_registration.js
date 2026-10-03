const fs = require('fs');

const content = fs.readFileSync('d:/flawless-graphics/pages/hr/hr-dashboard.html', 'utf8');

// Find all occurrences of saveStudentDetailForm or openRegisterStudentModal
const lines = content.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('saveStudentDetailForm') || line.includes('openRegisterStudentModal') || line.includes('openStudentModal') || line.includes('studentCredentialsModal')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
