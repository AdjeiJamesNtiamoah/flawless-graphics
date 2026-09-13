const fs = require('fs');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. Remove organizations_users write in OTP verification
  content = content.replace(
    /try \{\s*const users = JSON\.parse\(localStorage\.getItem\("organizations_users"\) \|\| "\[\]"\);\s*if \(pendingUserData && !users\.some\(u => u\.email === pendingUserData\.email\)\) \{\s*users\.push\(pendingUserData\);\s*localStorage\.setItem\("organizations_users", JSON\.stringify\(users\)\);\s*\}\s*\} catch\(e\) \{\}/g,
    `// Session authenticated directly via Supabase`
  );

  // 2. Replace local organizations_users uniqueness check
  content = content.replace(
    /\/\/ Uniqueness check against local database\s*try \{\s*const users = JSON\.parse\(localStorage\.getItem\("organizations_users"\) \|\| "\[\]"\);\s*if \(users\.some\(u => u\.orgId === orgId\)\) \{\s*showMessage\("Institution slug is already taken\. Please choose another\.", true\);\s*setStep\(1\);\s*document\.getElementById\("orgId"\)\?\.focus\(\);\s*return false;\s*\}\s*\} catch \(e\) \{\}/g,
    `// Validated directly against Supabase Cloud database`
  );

  if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned ' + filePath);
}

cleanFile('register.html');
cleanFile('registration.html');
