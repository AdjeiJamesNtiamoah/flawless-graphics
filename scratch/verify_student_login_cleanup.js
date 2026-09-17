const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- VERIFYING STUDENT-LOGIN.HTML CLEANUP ---');

const studentLoginPath = path.join(__dirname, '..', 'pages/student/student-login.html');
const content = fs.readFileSync(studentLoginPath, 'utf8');

// 1. Ensure "New Student" tab and signup fields are gone
assert(!content.includes('New Student'), 'student-login.html must NOT contain "New Student"');
assert(!content.includes('tabSignUp'), 'student-login.html must NOT contain "tabSignUp"');
assert(!content.includes('signupFields'), 'student-login.html must NOT contain "signupFields"');
assert(!content.includes('studentPhotoGroup'), 'student-login.html must NOT contain "studentPhotoGroup"');
assert(!content.includes('regClass'), 'student-login.html must NOT contain "regClass"');

// 2. Ensure login components exist
assert(content.includes('studentAuthForm'), 'student-login.html must contain studentAuthForm');
assert(content.includes('studentOrgSelect'), 'student-login.html must contain studentOrgSelect');
assert(content.includes('identifier'), 'student-login.html must contain identifier');
assert(content.includes('password'), 'student-login.html must contain password');
assert(content.includes('handleStudentAuth'), 'student-login.html must contain handleStudentAuth');

// 3. Extract and check JS syntax
const scriptMatches = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
assert(scriptMatches && scriptMatches.length > 0, 'Inline scripts must exist');
const vm = require('vm');
scriptMatches.forEach((sm, idx) => {
    const jsCode = sm.replace(/<\/?script[^>]*>/gi, '');
    assert.doesNotThrow(() => {
        new vm.Script(jsCode);
    }, `Script tag ${idx} must parse cleanly`);
});

console.log('✓ student-login.html is strictly dedicated to Student Login with zero registration tabs!');
console.log('--- ALL STUDENT LOGIN VERIFICATION CHECKS PASSED ---');
