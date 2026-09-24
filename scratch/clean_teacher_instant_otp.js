const fs = require('fs');

function cleanTeacherFiles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Instant Code Card HTML
    content = content.replace(/<!-- Instant Code Card -->[\s\S]*?<\/div>\s*<\/div>/g, '');

    // Remove autoFillOtpCode function
    content = content.replace(/function autoFillOtpCode\(\)[\s\S]*?showVerifyFeedback\([^)]*\);\s*\}\s*\}/g, '');

    // Remove instant code references in openVerificationModal
    content = content.replace(/const instantEl = document\.getElementById\("instantCodeValue"\);[\s\S]*?if \(instantEl\) instantEl\.textContent = currentOtpCode;/g, '');
    content = content.replace(/`Verification code dispatched! Pass: \${currentOtpCode}`/g, "'A verification code has been dispatched to your email.'");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned ' + filePath);
}

cleanTeacherFiles('pages/teacher/teacher-login.html');
cleanTeacherFiles('pages/teacher/teacher.html');
