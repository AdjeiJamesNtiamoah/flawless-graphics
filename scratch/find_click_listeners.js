const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes("addEventListener('click'") || l.includes('addEventListener("click"')) {
    console.log(i + 1, l.trim());
  }
});
