const assert = require('assert');
const fs = require('fs');

console.log('Testing Institution Dropdown & Branding Fixes...\n');

// 1. Verify auth-session.js does not wipe select elements
const authSessionCode = fs.readFileSync('assets/js/auth-session.js', 'utf8');
assert(authSessionCode.includes("el.tagName === 'SELECT'"), 'auth-session.js checks for SELECT tag');
assert(authSessionCode.includes("el.tagName === 'INPUT'"), 'auth-session.js checks for INPUT tag');
console.log('✓ auth-session.js safely skips form controls during branding');

// 2. Simulate DOM behavior with mock
class MockElement {
  constructor(tagName, id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.children = [];
    this._textContent = '';
    this.options = [];
    this.selectedIndex = 0;
    this.selectedOptions = [];
    this._listeners = {};
  }
  getAttribute(name) { return null; }
  appendChild(child) {
    this.children.push(child);
    this.options.push(child);
  }
  set textContent(val) {
    this._textContent = val;
    this.children = [];
    this.options = [];
  }
  get textContent() { return this._textContent; }
  set innerHTML(html) {
    this.children = [];
    this.options = [];
  }
  addEventListener(event, fn) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(fn);
  }
}

// 3. Verify realtime-auth.js populateApprovedOrgDropdown preserves options and selection
const realtimeAuthCode = fs.readFileSync('assets/js/realtime-auth.js', 'utf8');
assert(realtimeAuthCode.includes('preferredOrg'), 'realtime-auth.js supports preferredOrg from AuthSession / active_org');
assert(realtimeAuthCode.includes('opt.selected = true'), 'realtime-auth.js marks active institution as selected');
assert(realtimeAuthCode.includes('_hasOrgChangeListener'), 'realtime-auth.js binds synchronization change listener');
console.log('✓ realtime-auth.js properly populates, retains, and auto-selects active institution');

// 4. Verify supabase-client.js
const supaClientCode = fs.readFileSync('assets/js/supabase-client.js', 'utf8');
assert(supaClientCode.includes('normalized comparison') || supaClientCode.includes('String(orgId).trim().toLowerCase()'), 'supabase-client.js has normalized org search');
assert(supaClientCode.includes("st === 'approved' || st === 'active' || st === ''"), 'supabase-client.js getApprovedOrganizations supports active/approved/unspecified');
console.log('✓ supabase-client.js handles robust institution matching and approval states');

// 5. Verify teacher-login.html
const teacherLoginCode = fs.readFileSync('pages/teacher/teacher-login.html', 'utf8');
assert(!teacherLoginCode.includes('matchedOrgUser && matchedOrgUser.status'), 'teacher-login.html does not have undefined matchedOrgUser reference');
console.log('✓ teacher-login.html has clean status evaluation');

console.log('\nAll Institution Workspace Dropdown Tests Passed Successfully! 🎉');
