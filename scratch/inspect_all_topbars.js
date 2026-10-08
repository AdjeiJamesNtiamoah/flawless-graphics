const fs = require('fs');

const portalFiles = [
    { id: 'admin-dash', file: 'pages/admin/admin-dashboard.html' },
    { id: 'super-admin', file: 'super-admin.html' },
    { id: 'teacher-dash', file: 'pages/teacher/teacher-dashboard.html' },
    { id: 'student-dash', file: 'pages/student/student-dashboard.html' },
    { id: 'finance-dash', file: 'pages/finance/finance-dashboard.html' },
    { id: 'hr-dash', file: 'pages/hr/hr-dashboard.html' }
];

portalFiles.forEach(p => {
    if (!fs.existsSync(p.file)) {
        console.log('File missing:', p.file);
        return;
    }
    const c = fs.readFileSync(p.file, 'utf8');
    console.log('========================================================');
    console.log('PORTAL:', p.id, '->', p.file);

    // Let's locate the top navigation/bar in HTML
    if (p.id === 'admin-dash') {
        const idx = c.indexOf('<header class="topbar">');
        console.log(c.substring(idx, idx + 450));
    } else if (p.id === 'super-admin') {
        const idx = c.indexOf('<header class="exec-master-header">');
        console.log(c.substring(idx, idx + 450));
    } else if (p.id === 'teacher-dash') {
        const idx = c.indexOf('<div class="header">');
        console.log(c.substring(idx, idx + 450));
    } else if (p.id === 'student-dash') {
        const idx = c.indexOf('<header class="top-navbar">');
        console.log(c.substring(idx, idx + 450));
    } else if (p.id === 'finance-dash') {
        const idx = c.indexOf('<header>');
        console.log(c.substring(idx, idx + 450));
    } else if (p.id === 'hr-dash') {
        const idx = c.indexOf('<div class="topbar">');
        console.log(c.substring(idx, idx + 450));
    }
});
