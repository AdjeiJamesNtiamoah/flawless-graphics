const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');

console.log('Searching nav and buttons...');
lines.forEach((l, i) => {
  if (l.includes('id="nav"') || l.includes("id='nav'") || l.includes('<nav')) {
    console.log('Nav found at line', i + 1, l.trim().slice(0, 80));
  }
  if (l.includes('data-section="dashboard"') || l.includes("data-section='dashboard'")) {
    console.log('Dashboard button at line', i + 1, l.trim().slice(0, 80));
  }
});
