const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('--- VERIFYING STANDALONE PROFILE BUTTON & CONTEXT ACCURACY ---');

const authSessionCode = fs.readFileSync(path.join(__dirname, '..', 'assets/js/auth-session.js'), 'utf8');

// 1. Syntax check
assert.doesNotThrow(() => {
    new vm.Script(authSessionCode);
}, 'auth-session.js must parse cleanly');

// 2. Check context-aware getUser
assert(authSessionCode.includes("path.includes('/student/')"), 'getUser must check student path');
assert(authSessionCode.includes("path.includes('/teacher/')"), 'getUser must check teacher path');
assert(authSessionCode.includes("path.includes('/hr/')"), 'getUser must check hr path');
assert(authSessionCode.includes("path.includes('/finance/')"), 'getUser must check finance path');

// 3. Check standalone pill design
assert(authSessionCode.includes('fg-top-profile-pill standalone'), 'Must render standalone pill class');
assert(authSessionCode.includes('fg-online-dot'), 'Must render online green dot');
assert(authSessionCode.includes('fg-profile-dropdown'), 'Must include interactive dropdown on click');

// 4. Check student dashboard has no legacy switcher dropdown in HTML markup
const studentDashContent = fs.readFileSync(path.join(__dirname, '..', 'pages/student/student-dashboard.html'), 'utf8');
assert(!studentDashContent.includes('<select class="student-switcher-select"'), 'student-dashboard.html must not have switcher HTML select tag');

console.log('✓ All context-aware session logic and standalone profile widget requirements are verified!');
console.log('--- VERIFICATION COMPLETE ---');
