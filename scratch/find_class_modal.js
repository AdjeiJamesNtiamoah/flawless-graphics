const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('openAddClassModal') || line.includes('addClassModalBackdrop') || line.includes('submitAddClass')) {
    console.log((idx + 1) + ': ' + line.trim());
  }
});
