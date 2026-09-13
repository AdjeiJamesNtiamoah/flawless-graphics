const fs = require('fs');
const path = require('path');

let errors = 0;
function assert(condition, message) {
    if (!condition) {
        console.error('❌ FAIL:', message);
        errors++;
    } else {
        console.log('✅ PASS:', message);
    }
}

const root = path.join(__dirname, '..');

console.log('====================================================');
console.log('  FLAWLESS GRAPHICS — COMPLETE USER FLOW AUDIT     ');
console.log('====================================================\n');

// 1. Check index.html (Showcase)
console.log('[STAGE 1] Master Entry Display (index.html)');
const indexContent = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(indexContent.includes('FLAWLESS GRAPHICS — Institutional & School Management Platform'), 'index.html has correct title');
assert(indexContent.includes('href="register.html"'), 'index.html links to register.html');
assert(indexContent.includes('href="welcome.html"'), 'index.html links to welcome.html');
assert(indexContent.includes('href="site-login.html"'), 'index.html links to site-login.html');

// 2. Check register.html (Registration & Onboarding)
console.log('\n[STAGE 2] Master Organization Onboarding (register.html)');
assert(fs.existsSync(path.join(root, 'register.html')), 'register.html exists');
const regContent = fs.readFileSync(path.join(root, 'register.html'), 'utf8');
assert(regContent.includes('Register Educational Institution'), 'register.html has correct title');
assert(regContent.includes('href="index.html"'), 'register.html has back-link to index.html overview');
assert(regContent.includes('href="welcome.html"'), 'register.html links to welcome.html');
assert(regContent.includes('href="site-login.html"'), 'register.html links to site-login.html');
assert(regContent.includes('window.location.href = "welcome.html"'), 'register.html redirects to welcome.html on completion');

// 3. Check welcome.html (Unified Multi-Role Switchboard)
console.log('\n[STAGE 3] Unified Multi-Role Hub (welcome.html)');
const welcomeContent = fs.readFileSync(path.join(root, 'welcome.html'), 'utf8');
assert(welcomeContent.includes('href="index.html"'), 'welcome.html links to index.html overview');
assert(welcomeContent.includes('href="register.html"'), 'welcome.html links to register.html');
assert(welcomeContent.includes('pages/admin/admin-dashboard.html'), 'welcome.html links to Admin dashboard');
assert(welcomeContent.includes('pages/teacher/teacher-dashboard.html'), 'welcome.html links to Teacher workstation');
assert(welcomeContent.includes('pages/student/student-login.html'), 'welcome.html links to Student portal');
assert(welcomeContent.includes('pages/finance/finance-dashboard.html'), 'welcome.html links to Finance treasury');
assert(welcomeContent.includes('pages/hr/hr-dashboard.html'), 'welcome.html links to HR portal');

// 4. Check site-login.html (Central Login)
console.log('\n[STAGE 4] Central Institutional Gateway (site-login.html)');
const loginContent = fs.readFileSync(path.join(root, 'site-login.html'), 'utf8');
assert(loginContent.includes('href="index.html"'), 'site-login.html links to index.html overview');
assert(loginContent.includes('href="register.html"'), 'site-login.html links to register.html');
assert(loginContent.includes('href="welcome.html"'), 'site-login.html links to welcome.html');

// 5. Verify all relative links exist on disk (No 404s across all HTML files)
console.log('\n[STAGE 5] Checking Link Validity Across All Key Files');
const filesToCheck = [
    'index.html',
    'register.html',
    'welcome.html',
    'site-login.html',
    'pages/student/student-login.html',
    'pages/student/student-dashboard.html',
    'pages/teacher/teacher-login.html',
    'pages/teacher/teacher-dashboard.html',
    'pages/finance/finance-dashboard.html',
    'pages/hr/hr-dashboard.html',
    'pages/admin/admin-dashboard.html'
];

filesToCheck.forEach(file => {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
        assert(false, `File exists: ${file}`);
        return;
    }
    const html = fs.readFileSync(fullPath, 'utf8');
    const links = html.match(/href="([^"#:?]+)"/g) || [];
    const dir = path.dirname(fullPath);

    links.forEach(linkTag => {
        const target = linkTag.match(/href="([^"]+)"/)[1];
        if (target.endsWith('.html') || target.endsWith('.css') || target.endsWith('.js') || target.endsWith('.png') || target.endsWith('.jpg')) {
            const resolved = path.resolve(dir, target);
            if (!fs.existsSync(resolved)) {
                assert(false, `Dead link in ${file}: ${target} -> resolved: ${resolved}`);
            }
        }
    });
    console.log(`  Verified all links in ${file}`);
});

console.log('\n====================================================');
if (errors === 0) {
    console.log('🎉 COMPLETE AUDIT SUCCESS: Zero dead links, perfect user flow!');
} else {
    console.error(`💥 Audit failed with ${errors} errors!`);
    process.exit(1);
}
console.log('====================================================');
