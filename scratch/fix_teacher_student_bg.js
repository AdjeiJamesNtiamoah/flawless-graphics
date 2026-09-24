const fs = require('fs');

function updateLoginBg(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(
        /body\s*\{[\s\S]*?background-color:\s*#[a-fA-F0-9]+;[\s\S]*?background:\s*#[a-fA-F0-9]+;/g,
        `body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #F8F5EE;
        background-image: linear-gradient(135deg, rgba(248, 245, 238, 0.88) 0%, rgba(241, 235, 226, 0.93) 100%), url('../../assets/img/graduation-bg.jpg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

updateLoginBg('pages/teacher/teacher-login.html');
updateLoginBg('pages/student/student-login.html');
