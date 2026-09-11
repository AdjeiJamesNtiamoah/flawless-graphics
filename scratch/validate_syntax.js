const fs = require('fs');
const vm = require('vm');
const path = require('path');

function checkHtmlFile(filePath) {
  console.log(`Checking ${path.basename(filePath)}...`);
  const html = fs.readFileSync(filePath, 'utf8');
  // Match script blocks without src
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

checkHtmlFile('d:/flawless-graphics/pages/hr/hr-dashboard.html');
checkHtmlFile('d:/flawless-graphics/pages/admin/admin-dashboard.html');
checkHtmlFile('d:/flawless-graphics/pages/teacher/teacher-dashboard.html');
