const fs = require('fs');

let sa = fs.readFileSync('super-admin.html', 'utf8');
const start = sa.indexOf('<header class="exec-master-header">');
const end = sa.indexOf('</header>', start);
console.log(sa.substring(start, end + 9));
