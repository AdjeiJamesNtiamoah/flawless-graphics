const fs = require('fs');
const path = require('path');

console.log('Cleaning remaining demo references and mock accounts across portals...');

// 1. pages/finance/finance-login.html
let fLoginPath = path.join(__dirname, '..', 'pages', 'finance', 'finance-login.html');
if (fs.existsSync(fLoginPath)) {
  let fLogin = fs.readFileSync(fLoginPath, 'utf8');
  
  // Remove Quick Demo Credentials Box & One-Click Demo button
  fLogin = fLogin.replace(/<!-- Quick Demo Credentials Box -->[\s\S]*?<\/button>\s*<\/div>\s*<button type="button" class="btn-submit"[^>]*onclick="quickDemoFinance\(\)"[\s\S]*?<\/button>/g, '');
  
  // Remove quickDemoFinance function
  fLogin = fLogin.replace(/function quickDemoFinance\(\)\s*\{[\s\S]*?\n    \}/g, '');
  // Remove fillFinanceDemo function
  fLogin = fLogin.replace(/function fillFinanceDemo\(\)\s*\{[\s\S]*?\n    \}/g, '');
  
  // Clean fallback demo user in sign-in logic
  fLogin = fLogin.replace(/\/\/ Demo user fallback[\s\S]*?matchedUser = \{[\s\S]*?\};\s*\}/g, '');

  fs.writeFileSync(fLoginPath, fLogin, 'utf8');
  console.log('✓ Cleaned finance-login.html');
}

// 2. pages/hr/hr-login.html
let hrLoginPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-login.html');
if (fs.existsSync(hrLoginPath)) {
  let hrLogin = fs.readFileSync(hrLoginPath, 'utf8');
  
  // Remove demo button from HTML
  hrLogin = hrLogin.replace(/<button type="button" class="btn-demo" onclick="quickDemoHRLogin\(\)">[\s\S]*?<\/button>/g, '');
  
  // Remove quickDemoHRLogin function
  hrLogin = hrLogin.replace(/function quickDemoHRLogin\(\)\s*\{[\s\S]*?\n    \}/g, '');
  
  // Remove demo credentials fallback
  hrLogin = hrLogin.replace(/\/\/ Support demo fallback credentials[\s\S]*?userToAuth = \{[\s\S]*?\};\s*\}/g, '');

  fs.writeFileSync(hrLoginPath, hrLogin, 'utf8');
  console.log('✓ Cleaned hr-login.html');
}

// 3. pages/teacher/teacher-dashboard.html
let tDashPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
if (fs.existsSync(tDashPath)) {
  let tDash = fs.readFileSync(tDashPath, 'utf8');
  
  // Replace Demo Teacher fallback with clean session redirection or active_org fallback
  tDash = tDash.replace(
    /if\(!teacher\)\{\s*teacher = \{ name: 'Demo Teacher', email: 'teacher@flawless.org', org: 'FLAWLESS GRAPHICS' \};\s*\}/g,
    `if(!teacher){
  const activeOrg = localStorage.getItem('active_org');
  if(!activeOrg){
    window.location.href = 'teacher-login.html';
  } else {
    teacher = { name: 'Teacher', email: 'teacher@' + activeOrg.toLowerCase().replace(/\\s+/g,'') + '.edu', org: activeOrg };
  }
}`
  );

  fs.writeFileSync(tDashPath, tDash, 'utf8');
  console.log('✓ Cleaned teacher-dashboard.html');
}

// 4. pages/teacher/teacher-profile.html
let tProfPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-profile.html');
if (fs.existsSync(tProfPath)) {
  let tProf = fs.readFileSync(tProfPath, 'utf8');
  tProf = tProf.replace(
    /teacher = \{ name: 'Demo Teacher', email: 'teacher@flawless.org', org: 'FLAWLESS' \};/g,
    `const activeOrg = localStorage.getItem('active_org') || 'Organization';
  teacher = { name: 'Teacher', email: 'teacher@' + activeOrg.toLowerCase().replace(/\\s+/g,'') + '.edu', org: activeOrg };`
  );
  fs.writeFileSync(tProfPath, tProf, 'utf8');
  console.log('✓ Cleaned teacher-profile.html');
}

// 5. pages/admin/admin-login.html
let aLoginPath = path.join(__dirname, '..', 'pages', 'admin', 'admin-login.html');
if (fs.existsSync(aLoginPath)) {
  let aLogin = fs.readFileSync(aLoginPath, 'utf8');
  // Check if there are hardcoded demo login matches
  aLogin = aLogin.replace(/\/\/ Check root demo match or users match[\s\S]*?if \(!matched &&/g, 'if (!matched &&');
  fs.writeFileSync(aLoginPath, aLogin, 'utf8');
  console.log('✓ Cleaned admin-login.html');
}

console.log('All remaining demo fallbacks successfully removed.');
