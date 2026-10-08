const fs = require('fs');
const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const lines = content.split('\n');

const targets = [
  'teacherModal',
  'studentModal',
  'userModal',
  'addClassDrawer',
  'addSubjectDrawer',
  'assignTeacherDrawer',
  'slideOverBackdrop',
  'addClassDrawerBackdrop',
  'addSubjectDrawerBackdrop',
  'assignTeacherDrawerBackdrop',
  'skeletonLoader'
];

targets.forEach(t => {
  lines.forEach((l, i) => {
    if (l.includes('id="' + t + '"') || l.includes("id='" + t + "'")) {
      console.log(t, i + 1, l.trim().slice(0, 100));
    }
  });
});
