const fs = require('fs');

const files = [
    'pages/admin/index.html',
    'pages/admin/admin-dashboard.html',
    'pages/teacher/teacher-dashboard.html',
    'pages/student/student-dashboard.html',
    'pages/finance/finance-dashboard.html',
    'pages/finance/index.html',
    'pages/hr/hr-dashboard.html',
    'pages/hr/index.html',
    'super-admin.html'
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const c = fs.readFileSync(f, 'utf8');
    console.log('==============================================');
    console.log('PORTAL:', f);

    // Look for top navigation, topbar, header, or greeting
    const matches = [
        c.match(/<header[\s\S]*?<\/header>/i),
        c.match(/<div[^>]*class=\"[^\"]*(?:topbar|navbar|top-nav|header|dashboard-header|main-header)[^\"]*\"[^>]*>[\s\S]*?<\/div>/i),
        c.match(/<div[^>]*id=\"[^\"]*(?:topbar|navbar|header)[^\"]*\"[^>]*>[\s\S]*?<\/div>/i)
    ];

    let found = false;
    for (const m of matches) {
        if (m) {
            console.log('Found element:', m[0].substring(0, 400).replace(/\n/g, ' '));
            found = true;
            break;
        }
    }
    if (!found) {
        // check first 100 lines of body
        const bodyIdx = c.indexOf('<body');
        if (bodyIdx !== -1) {
            console.log('Body snippet:', c.substring(bodyIdx, bodyIdx + 500).replace(/\n/g, ' '));
        }
    }
});
