const fs = require('fs');
const path = require('path');

// 1. Root level files
function updateRootFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace body background
    content = content.replace(
        /body\s*\{[\s\S]*?background-color:\s*#[a-fA-F0-9]+;[\s\S]*?overflow-x:\s*hidden;\s*\}/g,
        (match) => {
            return match.replace(
                /background-color:\s*#[a-fA-F0-9]+;[\s\S]*?(?=color:)/g,
                `background-color: #F8F5EE;
        background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('assets/img/graduation-bg.jpg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;\n        `
            );
        }
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

// 2. Subfolder files (pages/*/*)
function updateSubfolderFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Update body background
    content = content.replace(
        /body\s*\{[\s\S]*?background-color:\s*#[a-fA-F0-9]+;[\s\S]*?overflow-x:\s*hidden;\s*\}/g,
        (match) => {
            return match.replace(
                /background-color:\s*#[a-fA-F0-9]+;[\s\S]*?(?=color:)/g,
                `background-color: #F8F5EE;
      background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('../../assets/img/graduation-bg.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;\n      `
            );
        }
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

updateRootFile('site-login.html');
updateSubfolderFile('pages/admin/admin-login.html');
updateSubfolderFile('pages/teacher/teacher-login.html');
updateSubfolderFile('pages/student/student-login.html');
updateSubfolderFile('pages/finance/finance-login.html');
updateSubfolderFile('pages/hr/hr-login.html');
