const fs = require('fs');

const targets = [
    { name: 'Admin', file: 'pages/admin/admin-dashboard.html' },
    { name: 'Teacher', file: 'pages/teacher/teacher-dashboard.html' },
    { name: 'Student', file: 'pages/student/student-dashboard.html' },
    { name: 'Finance', file: 'pages/finance/finance-dashboard.html' },
    { name: 'HR', file: 'pages/hr/hr-dashboard.html' },
    { name: 'SuperAdmin', file: 'super-admin.html' }
];

targets.forEach(t => {
    if (!fs.existsSync(t.file)) return;
    const c = fs.readFileSync(t.file, 'utf8');
    console.log(`\n================== [ ${t.name} : ${t.file} ] ==================`);
    
    // Find where the real topbar or header is (after skeleton if any)
    let idx = c.indexOf('class="topbar"');
    if (idx === -1) idx = c.indexOf('class="top-navbar"');
    if (idx === -1) idx = c.indexOf('<header');
    
    if (idx !== -1) {
        console.log('Found topbar at index:', idx);
        console.log(c.substring(idx - 20, idx + 600));
    } else {
        console.log('Topbar not found directly.');
    }
});
