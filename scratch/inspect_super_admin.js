const fs = require('fs');

let sa = fs.readFileSync('super-admin.html', 'utf8');
const idx = sa.indexOf('<header class="exec-master-header">');
console.log(sa.substring(idx, idx + 800));
