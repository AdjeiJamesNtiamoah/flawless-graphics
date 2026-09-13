const fs = require('fs');
const path = require('path');

// 1. Clean student-login.html
const studentLoginPath = path.join(__dirname, '..', 'pages', 'student', 'student-login.html');
let sContent = fs.readFileSync(studentLoginPath, 'utf8');

// Remove .demo-picker CSS block if present
sContent = sContent.replace(/\/\* Enrolled Demo Switcher Box \*\/[\s\S]*?\.demo-picker-header[\s\S]*?\}\n\n/g, '');
sContent = sContent.replace(/\.demo-picker-card[\s\S]*?\.demo-student-chip:hover[\s\S]*?\}\n/g, '');
sContent = sContent.replace(/function quickDemoStudent[\s\S]*?\}\n/g, '');
sContent = sContent.replace(/<!-- Enrolled Demo Student Quick-Access -->[\s\S]*?<\/div>\s*<\/div>/g, '');

fs.writeFileSync(studentLoginPath, sContent, 'utf8');
console.log('student-login.html cleaned of all demo references!');

// 2. Clean teacher-login.html
const teacherLoginPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');
let tContent = fs.readFileSync(teacherLoginPath, 'utf8');

tContent = tContent.replace(/function quickDemoTeacher\(\)\s*\{[\s\S]*?\}\n/g, '');

fs.writeFileSync(teacherLoginPath, tContent, 'utf8');
console.log('teacher-login.html cleaned of all demo references!');
