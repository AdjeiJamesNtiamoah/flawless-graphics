const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
content.split('\n').forEach((l, i) => {
  if (l.includes('modal') && l.includes('id=')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 100));
  }
});
