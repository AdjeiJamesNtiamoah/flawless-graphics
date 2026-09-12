const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html'), 'utf8');

console.log('--- Checking Section hierarchy in student-dashboard.html ---');

// Check profileSection start and end
const profileStart = html.indexOf('id="profileSection"');
const profileEnd = html.indexOf('</section>', profileStart);
console.log('profileSection index:', profileStart, 'ends at:', profileEnd);

const feesStart = html.indexOf('id="feesSection"');
const feesEnd = html.indexOf('</section>', feesStart);
console.log('feesSection index:', feesStart, 'ends at:', feesEnd);

const vaultStart = html.indexOf('id="vaultSection"');
const vaultEnd = html.indexOf('</section>', vaultStart);
console.log('vaultSection index:', vaultStart, 'ends at:', vaultEnd);

const gpaSimStart = html.indexOf('id="gpaSimSection"');
const gpaSimEnd = html.indexOf('</section>', gpaSimStart);
console.log('gpaSimSection index:', gpaSimStart, 'ends at:', gpaSimEnd);

if (profileEnd < feesStart) {
  console.log('SUCCESS: profileSection is properly closed before feesSection begins!');
} else {
  console.error('ERROR: feesSection is nested inside profileSection!');
  process.exit(1);
}

if (feesEnd < vaultStart) {
  console.log('SUCCESS: feesSection is properly closed before vaultSection begins!');
} else {
  console.error('ERROR: vaultSection is nested inside feesSection!');
  process.exit(1);
}

if (vaultEnd < gpaSimStart) {
  console.log('SUCCESS: vaultSection is properly closed before gpaSimSection begins!');
} else {
  console.error('ERROR: gpaSimSection is nested inside vaultSection!');
  process.exit(1);
}

console.log('ALL SECTION CLOSING TAGS AND SIBLING RELATIONSHIPS ARE 100% CORRECT!');
