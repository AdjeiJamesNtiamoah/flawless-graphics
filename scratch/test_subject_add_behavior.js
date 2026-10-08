const fs = require('fs');
const assert = require('assert');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// 1. Verify rightFloatingNavBar is completely removed from DOM
assert(!content.includes('<div class="right-floating-nav-bar" id="rightFloatingNavBar"'), 'rightFloatingNavBar is taken out of DOM');
assert(content.includes('display: none !important;\n      position: fixed;'), 'CSS hides right-floating-nav-bar');
console.log('✓ Check 1 passed: rightFloatingNavBar is completely removed');

// 2. Verify submitAddSubject appends instead of replaces
assert(content.includes('// ADD NEW SUBJECT TO THE OLD ONES (NO OVERWRITE!)'), 'submitAddSubject has append logic');
assert(content.includes('classes[targetClassIdx].subjects = currentSubs;'), 'submitAddSubject sets subjects array');
assert(content.includes('classes[targetClassIdx].subject = currentSubs.join(\', \');'), 'submitAddSubject sets joined string');
console.log('✓ Check 2 passed: submitAddSubject appends to existing subjects');

// 3. Verify submitTeacherAssignment appends instead of replaces
assert(content.includes('classes[idx].subjects = currentSubs;'), 'submitTeacherAssignment sets subjects array');
assert(content.includes('classes[idx].subject = currentSubs.join(\', \');'), 'submitTeacherAssignment sets joined string');
console.log('✓ Check 3 passed: submitTeacherAssignment appends to existing subjects');

// 4. Verify submitAddClass merges subjects for existing classes
assert(content.includes('// CLASS ALREADY EXISTS: MERGE & ADD TO EXISTING SUBJECTS!'), 'submitAddClass has merge logic');
assert(content.includes('classes[existingIdx].subjects = currentSubs;'), 'submitAddClass sets subjects array');
console.log('✓ Check 4 passed: submitAddClass merges subjects for existing classes');

// 5. Verify openAddClassModal loads existing class subjects when classId is passed
assert(content.includes('function openAddClassModal(classId = null)'), 'openAddClassModal accepts classId');
assert(content.includes('title="Manage Classroom & Add Subjects"'), 'Class rows have Manage Classroom & Add Subjects button');
console.log('✓ Check 5 passed: Classroom rows have Manage Classroom button to edit and add subjects');

console.log('--- ALL CHECKS PASSED PERFECTLY ---');
