const fs = require('fs');
const content = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
content.split('\n').forEach((l, i) => {
  if (l.includes('announcement') || l.includes('broadcast') || l.includes('notif') || l.includes('timetable') || l.includes('academicCalendar')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 100));
  }
});
