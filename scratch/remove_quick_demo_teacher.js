const fs = require('fs');
const path = require('path');

const tPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');
let tContent = fs.readFileSync(tPath, 'utf8');

const idx = tContent.indexOf('quickDemoTeacher');
console.log('quickDemoTeacher at index:', idx);
if (idx !== -1) {
    console.log(tContent.substring(idx - 50, idx + 350));
    // Remove exactly
    const start = tContent.lastIndexOf('function quickDemoTeacher', idx);
    const end = tContent.indexOf('}', idx) + 1;
    tContent = tContent.substring(0, start) + tContent.substring(end);
    fs.writeFileSync(tPath, tContent, 'utf8');
    console.log('Removed quickDemoTeacher cleanly!');
}
