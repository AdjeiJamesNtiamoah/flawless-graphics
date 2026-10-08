const fs = require('fs');

const targets = [
    { name: 'Admin', file: 'pages/admin/admin-dashboard.html', marker: '<header class="topbar">' },
    { name: 'SuperAdmin', file: 'super-admin.html', marker: '<header class="exec-master-header">' },
    { name: 'Teacher', file: 'pages/teacher/teacher-dashboard.html', marker: '<div class="header">' },
    { name: 'Student', file: 'pages/student/student-dashboard.html', marker: '<header class="top-navbar">' },
    { name: 'Finance', file: 'pages/finance/finance-dashboard.html', marker: '<main' },
    { name: 'HR', file: 'pages/hr/hr-dashboard.html', marker: '<div class="topbar">' }
];

targets.forEach(t => {
    if (!fs.existsSync(t.file)) return;
    const c = fs.readFileSync(t.file, 'utf8');
    console.log(`\n================== [ ${t.name} ] ==================`);
    const idx = c.indexOf(t.marker);
    if (idx !== -1) {
        console.log(c.substring(idx, idx + 1000).replace(/\r?\n\s*/g, ' '));
    }
});
