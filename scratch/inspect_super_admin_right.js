const fs = require('fs');

let sa = fs.readFileSync('super-admin.html', 'utf8');
const idx = sa.indexOf('exec-master-right');
console.log(sa.substring(idx - 100, idx + 300));
