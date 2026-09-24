const fs = require('fs');
const path = 'pages/teacher/teacher-login.html';

let content = fs.readFileSync(path, 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

const target = `    showVerifyFeedback("Account verified! Activating educator account...", false);${nl}${nl}    pendingTeacherData.status = 'active';`;
const replacement = `    showVerifyFeedback("Email verified! Submitting registration for Human Resources authorization...", false);${nl}${nl}    pendingTeacherData.status = 'pending_approval';`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched teacher-login.html');
} else {
  console.warn('Target not found in teacher-login.html!');
}
