const fs = require('fs');

function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove Auto-fill sample button
    content = content.replace(/<button type="button" onclick="fillSampleForm\(\)"[\s\S]*?<\/button>/g, '');

    // 2. Remove fillSampleForm function
    content = content.replace(/function fillSampleForm\(\)[\s\S]*?showMessage\([^)]*\);\s*\}/g, '');

    // 3. Remove Instant Code Card HTML
    content = content.replace(/<!-- Instant Code Card -->[\s\S]*?<\/div>\s*<\/div>/g, '');

    // 4. Remove autoFillOtpCode function
    content = content.replace(/function autoFillOtpCode\(\)[\s\S]*?showVerifyFeedback\([^)]*\);\s*\}\s*\}/g, '');

    // 5. Remove instant code CSS
    content = content.replace(/\/\* Instant Code Card \*\/[\s\S]*?cursor:\s*pointer;\s*\}/g, '');
    content = content.replace(/\.instant-code-card[\s\S]*?\.btn-copy-code[\s\S]*?cursor:\s*pointer;\s*\}/g, '');

    // 6. Clean openVerificationModal & resendVerificationEmail
    content = content.replace(/const instantEl = document\.getElementById\("instantCodeValue"\);[\s\S]*?if \(instantEl\) instantEl\.textContent = currentOtpCode;/g, '');
    content = content.replace(/`Verification code generated! Instant code: \${currentOtpCode}`/g, "'An authorization code has been dispatched to your official email.'");
    content = content.replace(/`New activation code generated: \${currentOtpCode}`/g, "'A fresh authorization code has been dispatched to your official email.'");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned ' + filePath + ' successfully!');
}

cleanFile('register.html');
cleanFile('registration.html');
