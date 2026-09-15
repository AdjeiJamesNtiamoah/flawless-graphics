const fs = require('fs');

function inspectFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('=== ' + filePath + ' ===');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('Samuel') || l.includes('s_101') || l.includes('cls_1') || l.includes('Sarah Jenkins') || l.includes('Kwabena') || (l.includes('defaults') && l.includes('['))) {
      console.log(`  L${idx + 1}: ${l.trim().substring(0, 100)}`);
    }
  });
}

inspectFile('pages/teacher/teacher-dashboard.html');
inspectFile('pages/finance/finance-dashboard.html');
inspectFile('pages/student/student-dashboard.html');
inspectFile('pages/admin/admin-dashboard.html');
