const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// Basic DOM Mock
const elements = new Map();

function createElement(tag, id = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id: id,
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    style: {},
    dataset: {},
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = v; },
    getAttribute: function(k) { return this.attributes[k] || null; },
    removeAttribute: function(k) { delete this.attributes[k]; },
    children: [],
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: function(c) { const i = this.children.indexOf(c); if (i !== -1) this.children.splice(i, 1); return c; },
    parentNode: { removeChild: () => {} },
    innerHTML: '',
    textContent: '',
    value: '',
    reset: function() {},
    focus: function() {},
    addEventListener: function() {},
    options: []
  };
  return el;
}

// Extract IDs from HTML to pre-populate elements map
const idRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(html)) !== null) {
  if (!elements.has(m[1])) {
    elements.set(m[1], createElement('div', m[1]));
  }
}

// Special elements
elements.set('attDate', Object.assign(createElement('input', 'attDate'), { value: '2026-10-08' }));

const sandbox = {
  console: console,
  setTimeout: (fn) => { fn(); },
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  Date: Date,
  Math: Math,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  RegExp: RegExp,
  Set: Set,
  Map: Map,
  ACTIVE_ORG: 'FLAWLESS GRAPHICS',
  window: {},
  document: {
    readyState: 'complete',
    body: createElement('body'),
    getElementById: (id) => {
      if (!elements.has(id)) {
        elements.set(id, createElement('div', id));
      }
      return elements.get(id);
    },
    querySelector: (sel) => createElement('div'),
    querySelectorAll: (sel) => [],
    createElement: (tag) => createElement(tag),
    addEventListener: () => {}
  },
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; },
    get length() { return Object.keys(this._data).length; },
    key: function(i) { return Object.keys(this._data)[i] || null; }
  }
};

sandbox.window = sandbox;
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;

// Extract inline scripts
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let scriptIdx = 0;
while ((m = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  const code = m[1];
  console.log(`Executing inline script #${scriptIdx} in sandbox...`);
  vm.runInNewContext(code, sandbox);
  console.log(`Script #${scriptIdx} executed successfully!`);
}

console.log('\n--- Testing runtime button click functions in sandbox ---');

// Test 1: openAddStudentModal
try {
  sandbox.openAddStudentModal();
  console.log('[PASS] openAddStudentModal() succeeded. Modal active:', elements.get('studentModal').classList.contains('active'));
} catch (e) {
  console.error('[FAIL] openAddStudentModal():', e.message);
}

// Test 2: closeStudentModal
try {
  sandbox.closeStudentModal();
  console.log('[PASS] closeStudentModal() succeeded.');
} catch (e) {
  console.error('[FAIL] closeStudentModal():', e.message);
}

// Test 3: openTeacherModal
try {
  sandbox.openTeacherModal();
  console.log('[PASS] openTeacherModal() succeeded. Modal active:', elements.get('teacherModal').classList.contains('active'));
} catch (e) {
  console.error('[FAIL] openTeacherModal():', e.message);
}

// Test 4: closeTeacherModal
try {
  sandbox.closeTeacherModal();
  console.log('[PASS] closeTeacherModal() succeeded.');
} catch (e) {
  console.error('[FAIL] closeTeacherModal():', e.message);
}

// Test 5: openUserModal
try {
  sandbox.openUserModal();
  console.log('[PASS] openUserModal() succeeded. Modal active:', elements.get('userModal').classList.contains('active'));
} catch (e) {
  console.error('[FAIL] openUserModal():', e.message);
}

// Test 6: closeUserModal
try {
  sandbox.closeUserModal();
  console.log('[PASS] closeUserModal() succeeded.');
} catch (e) {
  console.error('[FAIL] closeUserModal():', e.message);
}

// Test 7: openAddClassModal
try {
  sandbox.openAddClassModal();
  console.log('[PASS] openAddClassModal() succeeded. Drawer active:', elements.get('addClassDrawer').classList.contains('active'));
} catch (e) {
  console.error('[FAIL] openAddClassModal():', e.message);
}

// Test 8: closeAddClassModal
try {
  sandbox.closeAddClassModal();
  console.log('[PASS] closeAddClassModal() succeeded.');
} catch (e) {
  console.error('[FAIL] closeAddClassModal():', e.message);
}

// Test 9: openAddSubjectModal
try {
  sandbox.openAddSubjectModal();
  console.log('[PASS] openAddSubjectModal() succeeded. Drawer active:', elements.get('addSubjectDrawer').classList.contains('active'));
} catch (e) {
  console.error('[FAIL] openAddSubjectModal():', e.message);
}

// Test 10: closeAddSubjectModal
try {
  sandbox.closeAddSubjectModal();
  console.log('[PASS] closeAddSubjectModal() succeeded.');
} catch (e) {
  console.error('[FAIL] closeAddSubjectModal():', e.message);
}

// Test 11: showSection('dashboard')
try {
  sandbox.showSection('dashboard');
  console.log('[PASS] showSection("dashboard") succeeded.');
} catch (e) {
  console.error('[FAIL] showSection("dashboard"):', e.message);
}

// Test 12: bootstrapApp()
try {
  sandbox.bootstrapApp();
  console.log('[PASS] bootstrapApp() succeeded.');
} catch (e) {
  console.error('[FAIL] bootstrapApp():', e.message);
}
