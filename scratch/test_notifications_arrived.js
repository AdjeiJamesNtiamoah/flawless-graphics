const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- 1. Testing JS Syntax of quick-dock.js ---');
const quickDockCode = fs.readFileSync(path.join(baseDir, 'assets/js/quick-dock.js'), 'utf8');
try {
  new vm.Script(quickDockCode);
  assert(true, 'quick-dock.js parsed successfully with no syntax errors');
} catch (e) {
  assert(false, `quick-dock.js syntax error: ${e.message}`);
}

console.log('\n--- 2. Checking HTML Inclusions across User Portals ---');
const portals = [
  { name: 'Super Admin', file: 'pages/admin/admin-dashboard.html', role: 'Super Admin' },
  { name: 'Teacher', file: 'pages/teacher/teacher-dashboard.html', role: 'Teacher' },
  { name: 'Finance', file: 'pages/finance/finance-dashboard.html', role: 'Finance' },
  { name: 'HR', file: 'pages/hr/hr-dashboard.html', role: 'HR' }
];

portals.forEach(p => {
  const filePath = path.join(baseDir, p.file);
  assert(fs.existsSync(filePath), `${p.name} dashboard file exists (${p.file})`);
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('quick-dock.css'), `${p.name} includes quick-dock.css`);
  assert(content.includes('quick-dock.js'), `${p.name} includes quick-dock.js`);
  if (p.name !== 'HR') {
    assert(content.includes('Notifications Arrived') || content.includes('quickDockNotifBadge') || content.includes('openNotifications'), `${p.name} has topbar or trigger hooks for Notifications Arrived`);
  }
});

console.log('\n--- 3. Verifying quick-dock.js Role Tailoring & Multi-Role Logic ---');
assert(quickDockCode.includes("role === 'Super Admin'"), 'quick-dock.js handles Super Admin role');
assert(quickDockCode.includes("role === 'Teacher'"), 'quick-dock.js handles Teacher role');
assert(quickDockCode.includes("role === 'Finance'"), 'quick-dock.js handles Finance role');
assert(quickDockCode.includes("admin_read_notif_ids"), 'quick-dock.js has admin_read_notif_ids storage key');
assert(quickDockCode.includes("teacher_read_notif_ids"), 'quick-dock.js has teacher_read_notif_ids storage key');
assert(quickDockCode.includes("finance_read_notif_ids"), 'quick-dock.js has finance_read_notif_ids storage key');

console.log('\n--- 4. Simulated DOM Runtime Test for All 3 User Portals ---');
class SimpleDOM {
  constructor(pathname) {
    this.pathname = pathname;
    this.elements = {};
    this.listeners = {};
    this.storage = {
      'organizations_users': JSON.stringify([
        { name: 'Alice Teacher', email: 'alice@school.edu', role: 'teacher', status: 'pending_approval', org: 'FLAWLESS GRAPHICS' }
      ]),
      'FLAWLESS_GRAPHICS_announcements': JSON.stringify([
        { id: 'bc_1', title: 'Term 1 Commencement', content: 'Classes commence on Monday.', date: new Date().toISOString() }
      ])
    };
  }

  createMockWindow() {
    const self = this;
    const mockDoc = {
      readyState: 'complete',
      head: {
        appendChild: () => {}
      },
      body: {
        appendChild: (el) => {
          self.dockElement = el;
        }
      },
      querySelector: (selector) => {
        if (selector.includes('quick-dock.css')) return null;
        if (self.dockElement) {
          return self.dockElement.querySelector(selector);
        }
        return null;
      },
      querySelectorAll: (selector) => {
        if (self.dockElement) {
          return self.dockElement.querySelectorAll(selector);
        }
        return [];
      },
      getElementById: (id) => {
        if (self.dockElement && self.dockElement.id === id) return self.dockElement;
        if (self.dockElement) {
          return self.dockElement.querySelector('#' + id);
        }
        return null;
      },
      createElement: (tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          className: '',
          id: '',
          innerHTML: '',
          dataset: {},
          style: {},
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); },
            toggle(c, force) {
              if (typeof force === 'boolean') {
                if (force) this.classes.add(c);
                else this.classes.delete(c);
              } else {
                if (this.classes.has(c)) this.classes.delete(c);
                else this.classes.add(c);
              }
            }
          },
          querySelector(sel) {
            if (sel.startsWith('#')) {
              const targetId = sel.slice(1);
              if (this.id === targetId) return this;
              const match = this.innerHTML.match(new RegExp(`id=["']${targetId}["']`));
              if (match) {
                return {
                  id: targetId,
                  dataset: {},
                  textContent: '',
                  classList: { add: () => {}, remove: () => {}, contains: () => false },
                  style: {},
                  querySelectorAll: () => [],
                  addEventListener: () => {}
                };
              }
            }
            return null;
          },
          querySelectorAll(sel) {
            return [];
          },
          addEventListener: (evt, cb) => {}
        };
        return el;
      },
      addEventListener: (evt, cb) => {
        self.listeners[evt] = cb;
      }
    };

    const mockWin = {
      location: { pathname: self.pathname },
      document: mockDoc,
      localStorage: {
        getItem: (k) => self.storage[k] || null,
        setItem: (k, v) => { self.storage[k] = String(v); },
        removeItem: (k) => { delete self.storage[k]; }
      },
      addEventListener: () => {},
      console: console,
      setTimeout: (fn) => fn(),
      setInterval: () => 123,
      clearInterval: () => {}
    };
    mockWin.window = mockWin;

    return mockWin;
  }
}

// Test Teacher Path Context
const teacherDOM = new SimpleDOM('/pages/teacher/teacher-dashboard.html');
const teacherWin = teacherDOM.createMockWindow();
vm.runInNewContext(quickDockCode, teacherWin);
assert(teacherWin.QuickDock, 'QuickDock initialized on Teacher portal');
assert(typeof teacherWin.QuickDock.refreshNotifications === 'function', 'Teacher portal has QuickDock.refreshNotifications()');

// Test Finance Path Context
const financeDOM = new SimpleDOM('/pages/finance/finance-dashboard.html');
const financeWin = financeDOM.createMockWindow();
vm.runInNewContext(quickDockCode, financeWin);
assert(financeWin.QuickDock, 'QuickDock initialized on Finance portal');
assert(typeof financeWin.QuickDock.openNotifications === 'function', 'Finance portal has QuickDock.openNotifications()');

// Test Super Admin Path Context
const adminDOM = new SimpleDOM('/pages/admin/admin-dashboard.html');
const adminWin = adminDOM.createMockWindow();
vm.runInNewContext(quickDockCode, adminWin);
assert(adminWin.QuickDock, 'QuickDock initialized on Super Admin portal');
assert(typeof adminWin.QuickDock.triggerSnooze === 'function', 'Super Admin portal has QuickDock.triggerSnooze()');

console.log(`\n========================================`);
console.log(`TOTAL: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log(`========================================`);

if (failedTests > 0) process.exit(1);
