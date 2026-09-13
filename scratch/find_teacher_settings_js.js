const fs = require('fs');
const path = require('path');

const teacherDash = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const teacherContent = fs.readFileSync(teacherDash, 'utf8');

const matches = [];
let pos = 0;
while (true) {
    const idx = teacherContent.indexOf('idleMinutes', pos);
    if (idx === -1) break;
    matches.push(teacherContent.substring(Math.max(0, idx - 100), Math.min(teacherContent.length, idx + 400)));
    pos = idx + 11;
}

console.log('idleMinutes occurrences:', matches);
