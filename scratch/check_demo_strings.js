const fs = require('fs');
const path = require('path');

const studentLoginPath = path.join(__dirname, '..', 'pages', 'student', 'student-login.html');
const teacherLoginPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');

const sContent = fs.readFileSync(studentLoginPath, 'utf8');
const tContent = fs.readFileSync(teacherLoginPath, 'utf8');

console.log('sContent contains demo-picker-card:', sContent.includes('demo-picker-card'));
if (sContent.includes('demo-picker-card')) {
    const idx = sContent.indexOf('demo-picker-card');
    console.log('Context in student-login.html:', sContent.substring(idx - 100, idx + 200));
}

console.log('tContent contains quickDemoTeacher:', tContent.includes('quickDemoTeacher'));
if (tContent.includes('quickDemoTeacher')) {
    const idx = tContent.indexOf('quickDemoTeacher');
    console.log('Context in teacher-login.html:', tContent.substring(idx - 100, idx + 200));
}
