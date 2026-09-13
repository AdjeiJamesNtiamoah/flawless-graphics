const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('--- INDEX.HTML EXECUTIVE GATEWAY (BURSARY, HR, ADMIN) TESTS ---');
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

const indexPath = path.join(__dirname, '..', 'index.html');
assert(fs.existsSync(indexPath), 'index.html exists');

const html = fs.readFileSync(indexPath, 'utf8');

// 1. Static HTML Assertions
console.log('\n--- 1. Markup & Link Assertions ---');
assert(html.includes('id="executiveGateways"'), '#executiveGateways section exists in index.html');
assert(html.includes('href="#executiveGateways"'), 'Navbar and Hero have direct links to #executiveGateways');
assert(html.includes('id="tabAdmin"'), 'Super Admin tab button exists');
assert(html.includes('id="tabFinance"'), 'Bursary & Treasury tab button exists');
assert(html.includes('id="tabHR"'), 'HR & Faculty tab button exists');
assert(html.includes('id="execEmail"'), 'Institutional Email input exists');
assert(html.includes('id="execPassword"'), 'Password input exists');
assert(html.includes('id="execSubmitBtn"'), 'Executive submit button exists');
assert(html.includes('id="execStandaloneLink"'), 'Standalone portal link exists');

// Workstations Grid card links
assert(html.includes('href="pages/admin/admin-login.html"'), 'Workstation card links to admin-login.html');
assert(html.includes('href="pages/finance/finance-login.html"'), 'Workstation card links to finance-login.html');
assert(html.includes('href="pages/hr/hr-login.html"'), 'Workstation card links to hr-login.html');
assert(html.includes('href="pages/teacher/teacher-login.html"'), 'Workstation card links to teacher-login.html');
assert(html.includes('href="pages/student/student-login.html"'), 'Workstation card links to student-login.html');

// 2. Functional JavaScript Simulation
console.log('\n--- 2. Executive Authentication Simulation in VM ---');

const mockStorage = {
    'organizations_users': JSON.stringify([
        { name: 'Dr. James Admin', email: 'admin@flawless.edu', pass: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', rawPassPreview: 'admin2026', role: 'admin', status: 'active' },
        { name: 'Grace Bursar', email: 'bursar@flawless.edu', pass: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', rawPassPreview: 'bursar2026', role: 'finance', status: 'active' },
        { name: 'Kofi HR', email: 'hr@flawless.edu', pass: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', rawPassPreview: 'hr2026', role: 'hr', status: 'active' }
    ])
};

const domElements = {};
function getEl(id) {
    if (!domElements[id]) {
        domElements[id] = {
            id,
            value: '',
            textContent: '',
            innerHTML: '',
            href: '',
            placeholder: '',
            className: '',
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
            disabled: false,
            checked: false
        };
    }
    return domElements[id];
}

const sandbox = {
    console: console,
    document: {
        getElementById: (id) => getEl(id)
    },
    window: {
        location: { href: '' },
        Toaster: {
            success: (t, m) => console.log(`   [Toast Success]: ${t} - ${m}`),
            warning: (t, m) => console.log(`   [Toast Warning]: ${t} - ${m}`),
            error: (t, m) => console.log(`   [Toast Error]: ${t} - ${m}`)
        },
        AuthSession: {
            getUser: () => null,
            getOrg: () => 'FLAWLESS GRAPHICS',
            setUser: (u) => { mockStorage['active_user'] = JSON.stringify(u); },
            applyGlobalBranding: () => {}
        },
        addEventListener: () => {}
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
    setTimeout: (cb) => { cb(); return 1; }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;

// Extract script block
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert(scriptMatch && scriptMatch[1], 'Extracted executive auth script from index.html');

const context = vm.createContext(sandbox);
try {
    vm.runInContext(scriptMatch[1], context);
    assert(true, 'Executive script executed cleanly in VM without errors');
} catch (e) {
    assert(false, 'Script error: ' + e.message);
    console.error(e);
}

// 3. Test Tab Switching
console.log('\n--- 3. Testing Tab Switching ---');
assert(typeof context.switchExecutiveRole === 'function', 'switchExecutiveRole function exists');

context.switchExecutiveRole('finance');
assert(getEl('tabFinance').classList.contains('active'), 'Finance tab is active');
assert(getEl('execRoleTitle').textContent.includes('Bursary'), 'Role title updated to Bursary & Treasury');
assert(getEl('execStandaloneLink').href === 'pages/finance/finance-login.html', 'Standalone link updated to finance-login.html');

context.switchExecutiveRole('hr');
assert(getEl('tabHR').classList.contains('active'), 'HR tab is active');
assert(getEl('execRoleTitle').textContent.includes('Human Resources'), 'Role title updated to Human Resources & Faculty Payroll');
assert(getEl('execStandaloneLink').href === 'pages/hr/hr-login.html', 'Standalone link updated to hr-login.html');

context.switchExecutiveRole('admin');
assert(getEl('tabAdmin').classList.contains('active'), 'Admin tab is active');
assert(getEl('execRoleTitle').textContent.includes('Super Admin'), 'Role title updated to Super Admin Command');
assert(getEl('execStandaloneLink').href === 'pages/admin/admin-login.html', 'Standalone link updated to admin-login.html');

// 4. Test Authentication & Redirection Flow
console.log('\n--- 4. Testing Authentication Flow ---');
getEl('execEmail').value = 'admin@flawless.edu';
getEl('execPassword').value = 'admin2026';

context.handleExecutiveAuth().then(() => {
    assert(sandbox.window.location.href === 'pages/admin/admin-dashboard.html', 'Admin redirected to pages/admin/admin-dashboard.html');
    assert(mockStorage['active_admin'] !== undefined, 'active_admin saved to storage');

    // Test Bursary Auth
    context.switchExecutiveRole('finance');
    getEl('execEmail').value = 'bursar@flawless.edu';
    getEl('execPassword').value = 'bursar2026';

    return context.handleExecutiveAuth();
}).then(() => {
    assert(sandbox.window.location.href === 'pages/finance/finance-dashboard.html', 'Finance redirected to pages/finance/finance-dashboard.html');
    assert(mockStorage['activeFinance'] !== undefined, 'activeFinance saved to storage');

    // Test HR Auth
    context.switchExecutiveRole('hr');
    getEl('execEmail').value = 'hr@flawless.edu';
    getEl('execPassword').value = 'hr2026';

    return context.handleExecutiveAuth();
}).then(() => {
    assert(sandbox.window.location.href === 'pages/hr/hr-dashboard.html', 'HR redirected to pages/hr/hr-dashboard.html');
    assert(mockStorage['activeHR'] !== undefined, 'activeHR saved to storage');

    console.log('\n================================================================');
    console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed`);
    console.log('================================================================');
    if (failed > 0) process.exit(1);
    else process.exit(0);
});
