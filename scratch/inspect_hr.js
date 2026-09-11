const fs = require('fs');
const hrPath = 'd:/flawless-graphics/pages/hr/hr-dashboard.html';
const content = fs.readFileSync(hrPath, 'utf8');
console.log('File size:', content.length);

const lines = content.split('\n');
console.log('Line count:', lines.length);

// Search for section tags
lines.forEach((line, idx) => {
  if (line.includes('<section') || line.includes('openEmbeddedPage') || line.includes('academicCalendar') || line.includes('appraisals')) {
    console.log(`L${idx+1}: ${line.trim().slice(0, 100)}`);
  }
});
