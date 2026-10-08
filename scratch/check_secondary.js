const fs = require('fs');

const secondaryFiles = [
    'pages/admin/super-admin.html',
    'pages/finance/index.html',
    'pages/hr/index.html',
    'pages/teacher/teacher.html',
    'pages/teacher/teacher-classes.html'
];

secondaryFiles.forEach(f => {
    if (fs.existsSync(f)) {
        console.log(f, 'size:', fs.statSync(f).size);
    }
});
