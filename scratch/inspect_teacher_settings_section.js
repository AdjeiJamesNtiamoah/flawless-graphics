const fs = require('fs');
const path = require('path');

const teacherDash = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const content = fs.readFileSync(teacherDash, 'utf8');

const sIdx = content.indexOf('id="settingsSection"');
console.log('Context around settingsSection:');
console.log(content.substring(sIdx - 150, sIdx + 700));
