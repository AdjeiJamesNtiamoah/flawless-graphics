const fs = require('fs');
const path = require('path');

const teacherDash = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const studentDash = path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html');

console.log('Teacher Dashboard length:', fs.readFileSync(teacherDash, 'utf8').length);
console.log('Student Dashboard length:', fs.readFileSync(studentDash, 'utf8').length);

const teacherContent = fs.readFileSync(teacherDash, 'utf8');
const studentContent = fs.readFileSync(studentDash, 'utf8');

// Find sections in teacher dashboard
const tSections = teacherContent.match(/id="[^"]*section[^"]*"/gi) || [];
console.log('Teacher sections:', tSections);

const tNavs = teacherContent.match(/class="[^"]*nav[^"]*"/gi) || [];
console.log('Teacher navs sample:', tNavs.slice(0, 10));

// Find sections in student dashboard
const sSections = studentContent.match(/id="[^"]*section[^"]*"/gi) || [];
console.log('Student sections:', sSections);
