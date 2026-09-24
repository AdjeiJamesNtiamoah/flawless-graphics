const fs = require('fs');

const dashboardFiles = [
    'pages/admin/admin-dashboard.html',
    'pages/teacher/teacher-dashboard.html',
    'pages/teacher/teacher-profile.html',
    'pages/teacher/teacher-classes-extended.html',
    'pages/hr/hr-dashboard.html',
    'pages/finance/finance-dashboard.html',
    'pages/student/student-dashboard.html'
];

dashboardFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Add CSS link if not present
    if (!content.includes('cascading-nav.css')) {
        content = content.replace('</head>', '  <link rel="stylesheet" href="../../assets/css/cascading-nav.css">\n</head>');
    }

    // Add JS script if not present
    if (!content.includes('cascading-nav.js')) {
        content = content.replace('</body>', '  <script src="../../assets/js/cascading-nav.js" defer></script>\n</body>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Injected cascading nav into ' + filePath);
});
