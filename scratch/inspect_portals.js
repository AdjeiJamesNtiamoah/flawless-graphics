const fs = require('fs');

const portalFiles = [
    'pages/admin/index.html',
    'pages/admin/admin-dashboard.html',
    'pages/admin/super-admin.html',
    'pages/teacher/teacher-dashboard.html',
    'pages/teacher/teacher.html',
    'pages/student/student-dashboard.html',
    'pages/finance/finance-dashboard.html',
    'pages/finance/index.html',
    'pages/hr/hr-dashboard.html',
    'pages/hr/index.html',
    'pages/hr/hr.html'
];

portalFiles.forEach(f => {
    if (fs.existsSync(f)) {
        const c = fs.readFileSync(f, 'utf8');
        console.log('----------------------------------------------------');
        console.log('FILE:', f, 'Length:', c.length);
        
        // Find topbar or header or welcome elements
        const lines = c.split('\n');
        lines.slice(0, 150).forEach((line, idx) => {
            if (line.includes('header') || line.includes('topbar') || line.includes('welcome') || line.includes('user-info') || line.includes('profile')) {
                console.log(`  [L${idx+1}]`, line.trim().substring(0, 100));
            }
        });
    }
});
