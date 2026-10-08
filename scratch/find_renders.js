const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('function renderDashboard') || l.includes('function renderCharts')) {
    console.log(i + 1, l.trim());
  }
});
