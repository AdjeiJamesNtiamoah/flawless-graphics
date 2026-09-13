const fs = require('fs');
const path = require('path');

const teacherDash = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const studentDash = path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html');

const teacherContent = fs.readFileSync(teacherDash, 'utf8');
const studentContent = fs.readFileSync(studentDash, 'utf8');

// Print teacher settingsSection
const tSettingsIdx = teacherContent.indexOf('id="settingsSection"');
if (tSettingsIdx !== -1) {
    console.log('--- TEACHER SETTINGS SECTION ---');
    console.log(teacherContent.substring(tSettingsIdx - 100, tSettingsIdx + 1500));
}

// Print student sidebar nav
const sNavIdx = studentContent.indexOf('nav-menu');
if (sNavIdx !== -1) {
    console.log('--- STUDENT NAV MENU ---');
    console.log(studentContent.substring(sNavIdx - 50, sNavIdx + 1200));
}

// Print student section switching logic
const sSwitchIdx = studentContent.indexOf('function showSection') !== -1 ? studentContent.indexOf('function showSection') : studentContent.indexOf('showSection(');
if (sSwitchIdx !== -1) {
    console.log('--- STUDENT SHOW SECTION SCRIPT ---');
    console.log(studentContent.substring(sSwitchIdx - 50, sSwitchIdx + 800));
}
