const fs = require('fs');

const reg = fs.readFileSync('register.html', 'utf8');
const registration = fs.readFileSync('registration.html', 'utf8');
const auth = fs.readFileSync('assets/js/auth-session.js', 'utf8');

console.log('=== PALETTE & STYLES CHECK ===');
console.log('register.html includes #F8F5EE:', reg.includes('#F8F5EE'));
console.log('registration.html includes #F8F5EE:', registration.includes('#F8F5EE'));
console.log('register.html includes tel styling:', reg.includes('input[type="tel"]'));
console.log('registration.html includes tel styling:', registration.includes('input[type="tel"]'));

console.log('=== TOP-RIGHT PROFILE RESTRICTIONS & SIZE ===');
console.log('auth-session.js width 48px:', auth.includes('width: 48px'));
console.log('auth-session.js height 48px:', auth.includes('height: 48px'));

console.log('=== 5 ROLE PROFILE PHOTO REGISTRATION CHECK ===');
console.log('Super Admin photo in register.html:', reg.includes('adminPhotoInput'));
const sLogin = fs.readFileSync('pages/student/student-login.html', 'utf8');
console.log('Student studentPhotoInput in student-login:', sLogin.includes('studentPhotoInput'));
const tLogin = fs.readFileSync('pages/teacher/teacher-login.html', 'utf8');
console.log('Teacher teacherPhotoInput in teacher-login:', tLogin.includes('teacherPhotoInput'));
const fLogin = fs.readFileSync('pages/finance/finance-login.html', 'utf8');
console.log('Finance financePhotoInput in finance-login:', fLogin.includes('financePhotoInput'));
const hLogin = fs.readFileSync('pages/hr/hr-login.html', 'utf8');
console.log('HR hrPhotoInput in hr-login:', hLogin.includes('hrPhotoInput'));
