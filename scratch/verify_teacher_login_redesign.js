const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('--- TEACHER LOGIN REDESIGN & FUNCTIONAL VERIFICATION ---');
console.log('================================================================');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

const htmlPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-login.html');
assert(fs.existsSync(htmlPath), 'teacher-login.html exists');

const html = fs.readFileSync(htmlPath, 'utf8');

// --- 1. Markup & Layout Architecture Tests ---
console.log('\n--- 1. Markup & Layout Architecture Tests ---');
assert(html.includes('class="app-window"'), 'App window frame container present');
assert(html.includes('class="window-header"'), 'Window header present');
assert(html.includes('class="window-dots"'), 'Window Mac dots present');
assert(html.includes('class="window-quick-nav"'), 'Window quick navigation links present');
assert(html.includes('class="hero-section"'), 'Left hero section present');
assert(html.includes('class="hero-features"'), 'Hero 4-pillar features grid present');
assert(html.includes('class="form-section"'), 'Right form section present');
assert(html.includes('class="card"'), 'Form card present');
assert(html.includes('id="tabSignIn"') && html.includes('id="tabSignUp"'), 'Dual-mode auth tabs present');
assert(html.includes('id="teacherAuthForm"'), 'Teacher auth form present');
assert(html.includes('id="fullNameGroup"'), 'Full name group present');
assert(html.includes('id="teacherPhotoGroup"'), 'Teacher photo uploader group present');
assert(html.includes('id="email"'), 'Institutional email input present');
assert(html.includes('id="password"'), 'Password input present');
assert(html.includes('id="confirmPassGroup"'), 'Confirm password group present');
assert(html.includes('id="passToggle"') && html.includes('id="confirmPassToggle"'), 'Password visibility toggle icons present');
assert(html.includes('id="rememberMe"'), 'Remember me checkbox present');
assert(html.includes('id="submitBtn"'), 'Submit CTA button present');
assert(html.includes('id="verificationModal"'), 'Verification OTP modal present');

// --- 2. Design System & Styling Tests ---
console.log('\n--- 2. Design System & Styling Tests ---');
assert(html.includes('Plus Jakarta Sans'), 'Includes Plus Jakarta Sans typography');
assert(html.includes('JetBrains Mono'), 'Includes JetBrains Mono for OTP code display');
assert(html.includes('linear-gradient'), 'Includes modern aesthetic gradients');
assert(html.includes('@keyframes windowEntrance'), 'Includes smooth window entrance animation');
assert(html.includes('.feature-pill'), 'Includes modern feature pills styling');
assert(!html.includes('<!DOCTYPE html>\n<!DOCTYPE html>'), 'No duplicate DOCTYPE or truncated fragments');

// --- 3. Functional JavaScript & DOM Simulation ---
console.log('\n--- 3. Functional JavaScript & DOM Simulation ---');

const mockStorage = {
    'organizations_users': JSON.stringify([]),
    'teachers': JSON.stringify([])
};

const domElements = {};
function getEl(id) {
    if (!domElements[id]) {
        domElements[id] = {
            id,
            value: '',
            textContent: '',
            innerHTML: '',
            style: {},
            classList: {
                classes: new Set(),
                add: function(c) { this.classes.add(c); },
                remove: function(c) { this.classes.delete(c); },
                toggle: function(c, force) {
                    if (force !== undefined) {
                        if (force) this.classes.add(c);
                        else this.classes.delete(c);
                    } else {
                        if (this.classes.has(c)) this.classes.delete(c);
                        else this.classes.add(c);
                    }
                },
                contains: function(c) { return this.classes.has(c); }
            },
            focus: () => {},
            disabled: false,
            checked: false
        };
    }
    return domElements[id];
}

const sandbox = {
    console: console,
    document: {
        getElementById: (id) => getEl(id),
        querySelectorAll: () => []
    },
    window: {
        location: { href: '' },
        Toaster: {
            success: (t, m) => console.log(`   [Toast Success]: ${t} - ${m}`),
            warning: (t, m) => console.log(`   [Toast Warning]: ${t} - ${m}`),
            error: (t, m) => console.log(`   [Toast Error]: ${t} - ${m}`),
            info: (t, m) => console.log(`   [Toast Info]: ${t} - ${m}`)
        },
        AuthSession: {
            getUser: () => null,
            getOrg: () => 'FLAWLESS GRAPHICS',
            getLogo: () => null,
            setUser: (u) => { mockStorage['active_user'] = JSON.stringify(u); },
            applyGlobalBranding: () => {}
        }
    },
    localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; }
    },
    crypto: {
        subtle: {
            digest: async (algo, buffer) => {
                const cryptoNode = require('crypto');
                return cryptoNode.createHash('sha256').update(Buffer.from(buffer)).digest();
            }
        }
    },
    TextEncoder: TextEncoder,
    Uint8Array: Uint8Array,
    clearInterval: clearInterval,
    setInterval: (cb) => { return 1; },
    setTimeout: (cb) => { cb(); return 1; },
    Date: Date
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;

// Extract script block from HTML
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch && scriptMatch[1], 'Extracted main inline script from teacher-login.html');

const context = vm.createContext(sandbox);
try {
    vm.runInContext(scriptMatch[1], context);
    assert(true, 'teacher-login.html script executed cleanly in VM without errors');
} catch(e) {
    assert(false, 'Script error: ' + e.message);
    console.error(e);
}

// Test Tab Switching
console.log('\n--- 4. Testing Tab Switch Interactivity ---');
assert(typeof context.switchTeacherTab === 'function', 'switchTeacherTab function exists');
context.switchTeacherTab('signup');
assert(getEl('fullNameGroup').classList.contains('hidden') === false, 'Full name group shown on signup');
assert(getEl('teacherPhotoGroup').classList.contains('hidden') === false, 'Photo group shown on signup');
assert(getEl('confirmPassGroup').classList.contains('hidden') === false, 'Confirm pass shown on signup');
assert(getEl('formTitle').textContent === 'Register Educator Account', 'Title updated to Register Educator Account');

context.switchTeacherTab('signin');
assert(getEl('fullNameGroup').classList.contains('hidden') === true, 'Full name group hidden on signin');
assert(getEl('teacherPhotoGroup').classList.contains('hidden') === true, 'Photo group hidden on signin');
assert(getEl('confirmPassGroup').classList.contains('hidden') === true, 'Confirm pass hidden on signin');
assert(getEl('formTitle').textContent === 'Educator Sign In', 'Title updated to Educator Sign In');

// Test Registration flow to OTP verification
console.log('\n--- 5. Testing Teacher Registration -> Verification Flow ---');
context.switchTeacherTab('signup');
getEl('fullName').value = 'Prof. Kwabena Asante';
getEl('email').value = 'asante@flawless.org';
getEl('password').value = 'password123';
getEl('confirmPassword').value = 'password123';

// Call handleTeacherAuth
context.handleTeacherAuth().then(() => {
    assert(getEl('verificationModal').classList.contains('active') === true, 'Verification modal opened for new teacher');
    assert(getEl('verifyEmailText').textContent === 'asante@flawless.org', 'Verification modal shows teacher email');
    const otpVal = getEl('instantCodeValue').textContent;
    assert(otpVal.length === 6, 'Generated 6-digit OTP code: ' + otpVal);

    // Auto-fill OTP and submit verification
    context.autoFillOtpCode();
    assert(getEl('otpInput').value === otpVal, 'Auto-filled OTP code into input');

    // Submit OTP verification
    context.submitOtpVerification();

    const teachers = JSON.parse(mockStorage['teachers'] || '[]');
    assert(teachers.length === 1, 'Teacher saved to teachers list');
    assert(teachers[0].name === 'Prof. Kwabena Asante', 'Teacher name matches');
    assert(teachers[0].status === 'pending_approval', 'Teacher status is pending_approval');

    const orgStaff = JSON.parse(mockStorage['FLAWLESS GRAPHICS_teachers'] || '[]');
    assert(orgStaff.length === 1, 'Teacher added to FLAWLESS GRAPHICS_teachers roster');
    assert(orgStaff[0].status === 'pending_approval', 'Teacher in roster has pending_approval status');

    console.log('\n================================================================');
    console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
    console.log('================================================================');
    if (failed > 0) process.exit(1);
    else process.exit(0);
});
