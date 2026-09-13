const fs = require('fs');
const path = require('path');

const studentDash = path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html');
const studentContent = fs.readFileSync(studentDash, 'utf8');

// Find all sections in student dashboard HTML
const sections = studentContent.match(/<section[^>]*id="[^"]*"[^>]*>/gi) || [];
console.log('Student sections markup:\n', sections);

// Find sidebar nav buttons
const navs = studentContent.match(/<button[^>]*id="nav_[^"]*"[^>]*>[\s\S]*?<\/button>/gi) || [];
console.log('Student sidebar navs:\n', navs);
