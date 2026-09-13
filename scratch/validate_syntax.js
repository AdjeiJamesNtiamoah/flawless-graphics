const fs = require('fs');
const vm = require('vm');
const path = require('path');

function checkHtmlFile(filePath) {
  console.log(`Checking ${path.basename(filePath)}...`);
  const html = fs.readFileSync(filePath, 'utf8');
  const scriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    try {
      new vm.Script(code, { filename: `${path.basename(filePath)}_script_${count}.js` });
      console.log(`  Script #${count}: SYNTAX OK (${code.length} chars)`);
    } catch (err) {
      console.error(`  Script #${count}: SYNTAX ERROR!`, err.message);
      process.exit(1);
    }
  }
}

const files = [
  'd:/flawless-graphics/site-login.html',
  'd:/flawless-graphics/pages/student/student-login.html',
  'd:/flawless-graphics/pages/teacher/teacher-login.html',
  'd:/flawless-graphics/pages/hr/hr-login.html',
  'd:/flawless-graphics/pages/finance/finance-login.html',
  'd:/flawless-graphics/pages/hr/hr-dashboard.html',
  'd:/flawless-graphics/pages/admin/admin-dashboard.html',
  'd:/flawless-graphics/pages/teacher/teacher-dashboard.html'
];

files.forEach(f => checkHtmlFile(f));
console.log('🎉 ALL SCRIPTS HAVE PERFECT SYNTAX!');
