const fs = require('fs');
const c = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('<header') || l.includes('class="header') || l.includes('class="top-') || l.includes('class="main-content') || l.includes('class="dashboard-header') || l.includes('class="topbar')) {
        console.log('Line', idx + 1, ':', l.trim().substring(0, 100));
    }
});
