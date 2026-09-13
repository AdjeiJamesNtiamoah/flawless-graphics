const fs = require('fs');

const files = [
  'pages/admin/admin-dashboard.html',
  'pages/hr/hr-dashboard.html',
  'pages/finance/finance-dashboard.html',
  'pages/teacher/teacher-dashboard.html',
  'pages/student/student-dashboard.html'
];

const report = {};

files.forEach(file => {
  report[file] = [];
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('localStorage.')) {
      report[file].push({
        line: idx + 1,
        code: line.trim()
      });
    }
  });
});

fs.writeFileSync('scratch/storage_summary.json', JSON.stringify(report, null, 2), 'utf8');
console.log('Saved summary to scratch/storage_summary.json');
