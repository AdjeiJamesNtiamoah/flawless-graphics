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

console.log('--- 1. Testing Landing Page Showcase ---');
const landingPath = path.join(__dirname, '..', 'landing.html');
assert(fs.existsSync(landingPath), 'landing.html exists');

const landingContent = fs.readFileSync(landingPath, 'utf8');
assert(landingContent.includes('FLAWLESS GRAPHICS'), 'landing.html contains brand title');
assert(landingContent.includes('href="index.html"'), 'landing.html links to index.html for registration');
assert(landingContent.includes('Register Your Institution'), 'landing.html has Register Your Institution CTA');
assert(landingContent.includes('Super Admin Command'), 'landing.html highlights Super Admin');
assert(landingContent.includes('Educator Workstation'), 'landing.html highlights Educator workstation');
assert(landingContent.includes('Student Academy'), 'landing.html highlights Student Academy');
assert(landingContent.includes('Bursary & Treasury') || landingContent.includes('Bursary &amp; Treasury'), 'landing.html highlights Bursary & Treasury');
assert(landingContent.includes('HR & Faculty Payroll') || landingContent.includes('HR &amp; Faculty Payroll'), 'landing.html highlights HR & Payroll');
assert(landingContent.includes('Supabase Cloud Engine'), 'landing.html highlights Supabase cloud engine');

console.log('\n--- 2. Testing Quick Nav Links ---');
const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(indexContent.includes('href="landing.html"'), 'index.html links to landing.html');

const welcomeContent = fs.readFileSync(path.join(__dirname, '..', 'welcome.html'), 'utf8');
assert(welcomeContent.includes('href="landing.html"'), 'welcome.html links to landing.html');

const loginContent = fs.readFileSync(path.join(__dirname, '..', 'site-login.html'), 'utf8');
assert(loginContent.includes('href="landing.html"'), 'site-login.html links to landing.html');

console.log('\n--- 3. Summary ---');
if (errors === 0) {
    console.log('🎉 ALL SHOWCASE LANDING TESTS PASSED PERFECTLY!');
} else {
    console.error(`💥 ${errors} tests failed!`);
    process.exit(1);
}
