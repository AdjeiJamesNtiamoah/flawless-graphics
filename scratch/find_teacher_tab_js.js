const fs = require('fs');
const path = require('path');

const teacherDash = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const teacherContent = fs.readFileSync(teacherDash, 'utf8');

// Search for tab click listeners
const navMatches = teacherContent.match(/class="tab[^"]*"/gi) || [];
console.log('Teacher tabs:', navMatches);

const tabMatches = teacherContent.substring(teacherContent.indexOf('<nav class="nav">'), teacherContent.indexOf('</nav>'));
console.log('Teacher nav HTML:\n', tabMatches);

// Search for switchTab or tab event listener in script
const scriptStart = teacherContent.indexOf('<script');
const scriptContent = teacherContent.substring(scriptStart);
const tabListenerIdx = scriptContent.indexOf('.tab');
if (tabListenerIdx !== -1) {
    console.log('Tab listener in script:\n', scriptContent.substring(tabListenerIdx - 50, tabListenerIdx + 600));
}
