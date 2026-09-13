const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html'), 'utf8');

console.log('--- Testing Navbar Elements & Responsiveness in student-dashboard.html ---');

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

assert(html.includes('.top-navbar'), 'Has .top-navbar CSS class');
assert(html.includes('overflow-x: auto;'), 'Has overflow-x: auto on .top-navbar to prevent hidden clipping');
assert(html.includes('@media (max-width: 1320px)'), 'Has media query at 1320px for compact action buttons');
assert(html.includes('.quick-action-btn span {'), 'Hides text labels on buttons at compact breakpoints');
assert(html.includes('id="studentSwitcherSelect"'), 'Contains #studentSwitcherSelect');
assert(html.includes('id="notifBellBtn"'), 'Contains #notifBellBtn');
assert(html.includes('id="topNavStudentName"'), 'Contains #topNavStudentName');
assert(html.includes('id="topNavAvatar"'), 'Contains #topNavAvatar');

console.log('ALL NAVBAR VISIBILITY CHECKS PASSED!');
