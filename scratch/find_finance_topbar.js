const fs = require('fs');
const c = fs.readFileSync('pages/finance/finance-dashboard.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, idx) => {
    if ((l.includes('class="top') || l.includes('class="header') || l.includes('id="pageTitle') || l.includes('class="main')) && !l.includes('skeleton')) {
        console.log('Line', idx + 1, ':', l.trim().substring(0, 100));
    }
});
