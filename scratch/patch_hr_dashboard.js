const fs = require('fs');
const path = 'pages/hr/hr-dashboard.html';

let content = fs.readFileSync(path, 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

const targetListener = `    renderTeachers();${nl}    loadHRStudents();${nl}    initPayrollSection();`;
const replacementListener = `    renderTeachers();${nl}    renderUsers();${nl}    updatePendingBanners();${nl}    loadHRStudents();${nl}    initPayrollSection();`;

if (content.includes(targetListener)) {
  content = content.replace(targetListener, replacementListener);
  console.log('Successfully added renderUsers() to fg:realtime-change listener!');
  fs.writeFileSync(path, content, 'utf8');
} else {
  console.warn('targetListener pattern not found!');
}
