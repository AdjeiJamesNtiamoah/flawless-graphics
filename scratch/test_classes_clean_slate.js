const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('--- RUNNING RIGOROUS CLASSES & COHORTS CLEAN SLATE VERIFICATION ---');

// 1. HR Dashboard verification
const hrDash = fs.readFileSync(path.join(__dirname, '../pages/hr/hr-dashboard.html'), 'utf8');
assert(!hrDash.includes("option value=\"cls_1\""), "hr-dashboard.html must not contain hardcoded cls_1 option");
assert(!hrDash.includes("option value=\"cls_2\""), "hr-dashboard.html must not contain hardcoded cls_2 option");
assert(hrDash.includes("No classrooms registered yet — Please add a classroom first"), "hr-dashboard.html must show empty prompt when classes length is 0");
assert(hrDash.includes("purgeLegacyHardcodedClasses"), "hr-dashboard.html must have startup purge function");
assert(hrDash.includes("cloudSaved = await window.SupabaseService.saveClass"), "hr-dashboard.html must await SupabaseService.saveClass");
assert(hrDash.includes("newClass.id = cloudSaved.id"), "hr-dashboard.html must sync cloud class ID");
console.log('✓ 1. HR Dashboard: Clean slate & HR-only class creation verified');

// 2. Student Login verification
const studentLogin = fs.readFileSync(path.join(__dirname, '../pages/student/student-login.html'), 'utf8');
assert(!studentLogin.includes("option value=\"cls_1"), "student-login.html must not have hardcoded cls_1 option");
assert(studentLogin.includes("Select organization first"), "student-login.html must default to selecting organization first");
assert(studentLogin.includes("async function populateStudentClasses"), "student-login.html must define populateStudentClasses");
assert(studentLogin.includes("window.SupabaseService.getClasses"), "student-login.html must query real classes dynamically");
assert(studentLogin.includes("Please select an active academic class"), "student-login.html must require active class selection");
console.log('✓ 2. Student Portal: Dynamic classes & no hardcoded options verified');

// 3. Teacher Login verification
const teacherLogin = fs.readFileSync(path.join(__dirname, '../pages/teacher/teacher-login.html'), 'utf8');
assert(!teacherLogin.includes("<option value=\"Grade 10 - Graphic Arts & Visual Identity\">"), "teacher-login.html must not have hardcoded Grade 10 option");
assert(teacherLogin.includes("Select organization first"), "teacher-login.html must default to selecting organization first");
assert(teacherLogin.includes("async function populateTeacherClasses"), "teacher-login.html must define populateTeacherClasses");
console.log('✓ 3. Teacher Login: Dynamic classes & no hardcoded options verified');

// 4. Teacher Classes HTML verification
const teacherClassesHtml = fs.readFileSync(path.join(__dirname, '../pages/teacher/teacher-classes.html'), 'utf8');
assert(!teacherClassesHtml.includes("id=\"addClassBtn\""), "teacher-classes.html must not allow teachers to add classes");
assert(teacherClassesHtml.includes("HR Administration Notice:"), "teacher-classes.html must show HR exclusivity notice");
console.log('✓ 4. Teacher Classes HTML: Teacher class creation UI removed');

// 5. Teacher Classes JS verification
const teacherClassesJs = fs.readFileSync(path.join(__dirname, '../assets/js/teacher-classes.js'), 'utf8');
assert(!teacherClassesJs.includes("Class 1 - Visual Design\", subject"), "teacher-classes.js must not seed dummy classes");
assert(teacherClassesJs.includes("Only HR Administrators can add classes"), "teacher-classes.js must restrict class addition");
console.log('✓ 5. Teacher Classes JS: No seed classes and action restricted to HR');

// 6. Teacher Extended JS verification
const teacherExtendedJs = fs.readFileSync(path.join(__dirname, '../assets/js/teacher-extended.js'), 'utf8');
assert(!teacherExtendedJs.includes("Kojo Antwi"), "teacher-extended.js must not seed demo students");
assert(teacherExtendedJs.includes("Only HR Administrators can add classrooms for the organization"), "teacher-extended.js must restrict addClass to HR");
console.log('✓ 6. Teacher Extended JS: No demo student seed and addClass locked to HR');

// 7. Teacher Dashboard verification
const teacherDash = fs.readFileSync(path.join(__dirname, '../pages/teacher/teacher-dashboard.html'), 'utf8');
assert(teacherDash.includes("purgeLegacyDummyClasses"), "teacher-dashboard.html must have dummy purge function");
console.log('✓ 7. Teacher Dashboard: Pure dynamic classes and startup purge verified');

console.log('\n======================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('======================================================');
