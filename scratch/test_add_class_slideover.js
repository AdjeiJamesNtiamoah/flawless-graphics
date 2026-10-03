const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING ADD CLASSROOM SLIDE-OVER & RIGHT FLOATING NAV BAR ===\n');

// 1. HR Dashboard HTML Check
const hrHtmlPath = path.join(__dirname, '../pages/hr/hr-dashboard.html');
const hrHtml = fs.readFileSync(hrHtmlPath, 'utf8');

assert(hrHtml.includes('id="addClassDrawer"'), 'HR Dashboard must have #addClassDrawer');
assert(hrHtml.includes('class="slide-over-panel slide-over-wide"'), 'HR Dashboard must have slide-over-panel slide-over-wide classes');
assert(hrHtml.includes('id="addClassDrawerBackdrop"'), 'HR Dashboard must have #addClassDrawerBackdrop');
assert(hrHtml.includes('id="rightFloatingNavBar"'), 'HR Dashboard must have #rightFloatingNavBar');
assert(hrHtml.includes('id="rfAddClassBtn"'), 'HR Dashboard must have #rfAddClassBtn');
assert(hrHtml.includes('id="new_class_code"'), 'HR Dashboard must have #new_class_code');
assert(hrHtml.includes('id="new_class_name"'), 'HR Dashboard must have #new_class_name');
assert(hrHtml.includes('id="new_class_subject"'), 'HR Dashboard must have #new_class_subject');
assert(hrHtml.includes('id="new_class_grade"'), 'HR Dashboard must have #new_class_grade');
assert(hrHtml.includes('id="new_class_room"'), 'HR Dashboard must have #new_class_room');
assert(hrHtml.includes('id="new_class_schedule"'), 'HR Dashboard must have #new_class_schedule');
assert(hrHtml.includes('id="new_class_capacity"'), 'HR Dashboard must have #new_class_capacity');
assert(hrHtml.includes('id="preview_class_code"'), 'HR Dashboard must have live spec preview #preview_class_code');
assert(hrHtml.includes('autoGenerateClassCode'), 'HR Dashboard must have autoGenerateClassCode helper');
assert(hrHtml.includes('setPresetClass'), 'HR Dashboard must have setPresetClass helper');
assert(hrHtml.includes('updateAddClassPreview'), 'HR Dashboard must have updateAddClassPreview helper');
assert(hrHtml.includes('submitAddClass'), 'HR Dashboard must have submitAddClass function');
assert(hrHtml.includes('assets/css/slide-over.css'), 'HR Dashboard must link slide-over.css');
assert(hrHtml.includes('assets/js/slide-over.js'), 'HR Dashboard must include slide-over.js');

console.log('✓ hr-dashboard.html verification passed!');

// 2. Quick Dock Check
const quickDockPath = path.join(__dirname, '../assets/js/quick-dock.js');
const quickDockJs = fs.readFileSync(quickDockPath, 'utf8');

assert(quickDockJs.includes('quickDockAddClassBtn'), 'quick-dock.js must have quickDockAddClassBtn');
assert(quickDockJs.includes('openAddClassModal'), 'quick-dock.js must call openAddClassModal');

console.log('✓ quick-dock.js verification passed!');

// 3. Quick Assistant Check
const quickAssistantPath = path.join(__dirname, '../assets/js/quick-assistant.js');
const quickAssistantJs = fs.readFileSync(quickAssistantPath, 'utf8');

assert(quickAssistantJs.includes('openAddClassModal'), 'quick-assistant.js must have openAddClassModal quick card');
assert(quickAssistantJs.includes('Add Classroom'), 'quick-assistant.js must display Add Classroom');

console.log('✓ quick-assistant.js verification passed!');

// 4. Slide Over Check
const slideOverPath = path.join(__dirname, '../assets/js/slide-over.js');
const slideOverJs = fs.readFileSync(slideOverPath, 'utf8');

assert(slideOverJs.includes('window.openAddClassModal'), 'slide-over.js must expose window.openAddClassModal');

console.log('✓ slide-over.js verification passed!');

console.log('\n=== ALL VERIFICATION CHECKS PASSED PERFECTLY! ===');
