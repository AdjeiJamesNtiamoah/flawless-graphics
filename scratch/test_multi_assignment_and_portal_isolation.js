// test_multi_assignment_and_portal_isolation.js
const assert = require('assert');

// Mock localStorage
const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
global.localStorage = localStorage;

const ORG = 'FLAWLESS GRAPHICS';
const CLASSES_KEY = `${ORG}_classes`;

// Setup Test Data
const teacher1 = {
  email: 'sarah.jenkins@flawless.org',
  name: 'Sarah Jenkins',
  role: 'Educator',
  dept: 'Visual Arts & Design'
};

const teacher2 = {
  email: 'kwame.mensah@flawless.org',
  name: 'Kwame Mensah',
  role: 'Educator',
  dept: 'Visual Arts & Design'
};

const teacher3 = {
  email: 'abena.boateng@flawless.org',
  name: 'Abena Boateng',
  role: 'Educator',
  dept: 'Science'
};

// 3 Classes:
// Class A: Form 2 Graphic Arts (Co-taught by Sarah and Kwame for Graphic Design, plus Sarah teaches 3D Modeling)
// Class B: Form 3 Web Architecture (Taught by Sarah alone for Web Systems)
// Class C: Form 1 Biology (Taught by Abena alone for Biology)
const classes = [
  {
    id: 'cls_form2_arts',
    name: 'Form 2 Graphic Arts',
    subjects: ['Graphic Design', '3D Modeling'],
    teachers: [
      {
        email: teacher1.email,
        name: teacher1.name,
        role: 'Lead Educator',
        subjects: ['Graphic Design', '3D Modeling'],
        pairedWith: [teacher2.email]
      },
      {
        email: teacher2.email,
        name: teacher2.name,
        role: 'Co-Educator',
        subjects: ['Graphic Design'],
        pairedWith: [teacher1.email]
      }
    ],
    students: [
      { id: 'stu_1', name: 'Kofi Annan', classId: 'cls_form2_arts' },
      { id: 'stu_2', name: 'Ama Konadu', classId: 'cls_form2_arts' }
    ]
  },
  {
    id: 'cls_form3_web',
    name: 'Form 3 Web Architecture',
    subjects: ['Web Systems', 'UI/UX Interactive'],
    teachers: [
      {
        email: teacher1.email,
        name: teacher1.name,
        role: 'Lead Educator',
        subjects: ['Web Systems', 'UI/UX Interactive'],
        pairedWith: []
      }
    ],
    students: [
      { id: 'stu_3', name: 'Yaw Preko', classId: 'cls_form3_web' }
    ]
  },
  {
    id: 'cls_form1_bio',
    name: 'Form 1 Biology Lab',
    subjects: ['Biology'],
    teachers: [
      {
        email: teacher3.email,
        name: teacher3.name,
        role: 'Lead Educator',
        subjects: ['Biology'],
        pairedWith: []
      }
    ],
    students: [
      { id: 'stu_4', name: 'Esi Mansa', classId: 'cls_form1_bio' }
    ]
  }
];

localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
localStorage.setItem(`${ORG}_students`, JSON.stringify([
  { id: 'stu_1', name: 'Kofi Annan', classId: 'cls_form2_arts' },
  { id: 'stu_2', name: 'Ama Konadu', classId: 'cls_form2_arts' },
  { id: 'stu_3', name: 'Yaw Preko', classId: 'cls_form3_web' },
  { id: 'stu_4', name: 'Esi Mansa', classId: 'cls_form1_bio' },
  { id: 'stu_unassigned', name: 'Orphan Scholar', classId: 'cls_unassigned_other' }
]));

// Simulate helper functions
function isSameEducator(educatorObj, targetTeacher) {
  if (!educatorObj || !targetTeacher) return false;
  const tEmail = (targetTeacher.email || '').toLowerCase().trim();
  const tName = (targetTeacher.name || '').toLowerCase().trim();
  const tId = String(targetTeacher.id || targetTeacher.empId || targetTeacher.staffId || '').trim();

  const eEmail = (educatorObj.email || '').toLowerCase().trim();
  const eName = (educatorObj.name || '').toLowerCase().trim();
  const eId = String(educatorObj.id || educatorObj.empId || educatorObj.staffId || '').trim();

  if (tEmail && eEmail && (tEmail === eEmail || tEmail.includes(eEmail) || eEmail.includes(tEmail))) return true;
  if (tName && eName && (tName === eName || tName.includes(eName) || eName.includes(tName))) return true;
  if (tId && eId && tId === eId) return true;
  return false;
}

function isTeacherAssignedToClass(c, t) {
  if (!c || !t) return false;
  const tEmail = (t.email || '').toLowerCase().trim();
  const tName = (t.name || '').toLowerCase().trim();
  const tId = String(t.id || t.empId || t.staffId || '').trim();

  if (Array.isArray(c.teachers) && c.teachers.length > 0) {
    if (c.teachers.some(item => isSameEducator(item, t))) return true;
  }
  if (c.teacherEmail && tEmail) {
    const emails = String(c.teacherEmail).toLowerCase().split(',').map(x => x.trim());
    if (emails.some(e => e === tEmail || e.includes(tEmail) || tEmail.includes(e))) return true;
  }
  if (c.teacherName && tName) {
    const names = String(c.teacherName).toLowerCase().split(',').map(x => x.trim());
    if (names.some(n => n === tName || n.includes(tName) || tName.includes(n))) return true;
  }
  if (c.teacherId && tId && String(c.teacherId).trim() === tId) return true;
  if (c.submittedByEmail && tEmail && (c.submittedByEmail || '').toLowerCase().trim() === tEmail) return true;
  if (c.submittedBy && tName && (c.submittedBy || '').toLowerCase().trim() === tName) return true;
  return false;
}

function getTeacherClassSubjects(c, t) {
  if (!c) return ['Academic Core'];
  if (Array.isArray(c.teachers) && c.teachers.length > 0) {
    const matched = c.teachers.find(item => isSameEducator(item, t));
    if (matched && Array.isArray(matched.subjects) && matched.subjects.length > 0) {
      return matched.subjects;
    }
  }
  if (Array.isArray(c.subjects) && c.subjects.length > 0) {
    return c.subjects;
  }
  if (c.subject) {
    return String(c.subject).split(',').map(s => s.trim()).filter(Boolean);
  }
  return ['Academic Core'];
}

function getTeacherClassPairedInfo(c, t) {
  if (!c || !Array.isArray(c.teachers)) {
    return { role: 'Lead Educator', coTeachers: [], mySubjects: getTeacherClassSubjects(c, t) };
  }
  const matched = c.teachers.find(item => isSameEducator(item, t));
  const myRole = (matched && matched.role) ? matched.role : 'Lead Educator';
  const mySubjects = (matched && Array.isArray(matched.subjects)) ? matched.subjects : getTeacherClassSubjects(c, t);
  const myPairedWith = (matched && Array.isArray(matched.pairedWith)) ? matched.pairedWith.map(x => x.toLowerCase().trim()) : [];

  const coTeachers = c.teachers.filter(other => {
    if (isSameEducator(other, t)) return false;
    const otherEmail = (other.email || '').toLowerCase().trim();
    const otherName = (other.name || '').toLowerCase().trim();
    if (myPairedWith.includes(otherEmail) || myPairedWith.includes(otherName)) return true;
    if (Array.isArray(other.pairedWith) && (
      (t.email && other.pairedWith.some(x => x.toLowerCase().trim() === (t.email || '').toLowerCase().trim())) ||
      (t.name && other.pairedWith.some(x => x.toLowerCase().trim() === (t.name || '').toLowerCase().trim()))
    )) return true;
    if (Array.isArray(other.subjects) && mySubjects.some(sub => other.subjects.includes(sub))) return true;
    return false;
  });

  return {
    role: myRole,
    coTeachers,
    mySubjects
  };
}

function getAllOrgClasses() {
  const raw = localStorage.getItem(CLASSES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getClassesForTeacher(t) {
  return getAllOrgClasses().filter(c => isTeacherAssignedToClass(c, t));
}

function getAllAssignedStudentsForTeacher(t) {
  const arr = getClassesForTeacher(t);
  const studentMap = new Map();

  arr.forEach(cls => {
    (cls.students || []).forEach(s => {
      const key = String(s.id || s.roll || Math.random());
      if (!studentMap.has(key)) {
        studentMap.set(key, Object.assign({}, s, {
          classId: s.classId || cls.id,
          className: cls.name
        }));
      }
    });
  });

  const rawList = JSON.parse(localStorage.getItem(`${ORG}_students`) || '[]');
  if (Array.isArray(rawList)) {
    rawList.forEach(s => {
      const sClassId = String(s.classId || '');
      const matchCls = arr.find(c => sClassId && String(c.id) === sClassId);
      if (matchCls) {
        const key = String(s.id || s.roll || Math.random());
        if (!studentMap.has(key)) {
          studentMap.set(key, Object.assign({}, s, {
            classId: s.classId || matchCls.id,
            className: matchCls.name
          }));
        }
      }
    });
  }

  return Array.from(studentMap.values());
}

console.log('--- TEST 1: One Teacher to Many Classes ---');
const sarahClasses = getClassesForTeacher(teacher1);
console.log('Sarah Classes Count:', sarahClasses.length, '(Expected: 2)');
assert.strictEqual(sarahClasses.length, 2, 'Sarah should have 2 classes');
assert.ok(sarahClasses.some(c => c.id === 'cls_form2_arts'), 'Sarah has Form 2 Graphic Arts');
assert.ok(sarahClasses.some(c => c.id === 'cls_form3_web'), 'Sarah has Form 3 Web Architecture');
console.log('✓ PASS: One Teacher to Many Classes');

console.log('\n--- TEST 2: One Teacher to Many Subjects ---');
const sarahForm2Subs = getTeacherClassSubjects(sarahClasses.find(c => c.id === 'cls_form2_arts'), teacher1);
console.log('Sarah Form 2 Subjects:', sarahForm2Subs);
assert.deepStrictEqual(sarahForm2Subs, ['Graphic Design', '3D Modeling'], 'Sarah teaches multiple subjects');
console.log('✓ PASS: One Teacher to Many Subjects');

console.log('\n--- TEST 3: One Class to Many Teachers ---');
const form2Class = getAllOrgClasses().find(c => c.id === 'cls_form2_arts');
console.log('Form 2 Faculty count:', form2Class.teachers.length);
assert.strictEqual(form2Class.teachers.length, 2, 'Class has 2 assigned teachers');
assert.ok(isTeacherAssignedToClass(form2Class, teacher1), 'Sarah is in Class Form 2');
assert.ok(isTeacherAssignedToClass(form2Class, teacher2), 'Kwame is in Class Form 2');
console.log('✓ PASS: One Class to Many Teachers');

console.log('\n--- TEST 4: Pairing Teachers to One Subject (Co-Teaching) ---');
const sarahPaired = getTeacherClassPairedInfo(form2Class, teacher1);
console.log('Sarah Paired with:', sarahPaired.coTeachers.map(c => c.name));
assert.strictEqual(sarahPaired.coTeachers.length, 1);
assert.strictEqual(sarahPaired.coTeachers[0].email, teacher2.email);

const kwamePaired = getTeacherClassPairedInfo(form2Class, teacher2);
console.log('Kwame Paired with:', kwamePaired.coTeachers.map(c => c.name));
assert.strictEqual(kwamePaired.coTeachers.length, 1);
assert.strictEqual(kwamePaired.coTeachers[0].email, teacher1.email);
console.log('✓ PASS: Pairing Teachers to One Subject');

console.log('\n--- TEST 5: One Class to Many Subjects ---');
console.log('Form 2 Registered Subjects:', form2Class.subjects);
assert.strictEqual(form2Class.subjects.length, 2);
console.log('✓ PASS: One Class to Many Subjects');

console.log('\n--- TEST 6: Strict Portal Isolation (Classes & Students) ---');
// Teacher 1: Sarah (Classes: Form 2, Form 3; Students: stu_1, stu_2, stu_3)
const sarahStudents = getAllAssignedStudentsForTeacher(teacher1);
console.log('Sarah Students:', sarahStudents.map(s => s.name));
assert.strictEqual(sarahStudents.length, 3);
assert.ok(!sarahStudents.some(s => s.id === 'stu_4'), 'Sarah CANNOT see Biology student stu_4');
assert.ok(!sarahStudents.some(s => s.id === 'stu_unassigned'), 'Sarah CANNOT see orphan unassigned student');

// Teacher 2: Kwame (Classes: Form 2 only; Students: stu_1, stu_2)
const kwameClasses = getClassesForTeacher(teacher2);
console.log('Kwame Classes Count:', kwameClasses.length, '(Expected: 1)');
assert.strictEqual(kwameClasses.length, 1);
assert.strictEqual(kwameClasses[0].id, 'cls_form2_arts');
const kwameStudents = getAllAssignedStudentsForTeacher(teacher2);
console.log('Kwame Students:', kwameStudents.map(s => s.name));
assert.strictEqual(kwameStudents.length, 2);
assert.ok(!kwameStudents.some(s => s.id === 'stu_3'), 'Kwame CANNOT see Web student stu_3');

// Teacher 3: Abena (Classes: Form 1 Biology only; Students: stu_4)
const abenaClasses = getClassesForTeacher(teacher3);
console.log('Abena Classes Count:', abenaClasses.length, '(Expected: 1)');
assert.strictEqual(abenaClasses.length, 1);
assert.strictEqual(abenaClasses[0].id, 'cls_form1_bio');
const abenaStudents = getAllAssignedStudentsForTeacher(teacher3);
console.log('Abena Students:', abenaStudents.map(s => s.name));
assert.strictEqual(abenaStudents.length, 1);
assert.strictEqual(abenaStudents[0].id, 'stu_4');

// Non-assigned Teacher (e.g. newly signed up teacher with 0 classes)
const unassignedTeacher = { email: 'new.educator@flawless.org', name: 'New Educator' };
const emptyClasses = getClassesForTeacher(unassignedTeacher);
assert.strictEqual(emptyClasses.length, 0, 'Unassigned teacher has 0 classes');
const emptyStudents = getAllAssignedStudentsForTeacher(unassignedTeacher);
assert.strictEqual(emptyStudents.length, 0, 'Unassigned teacher has 0 students');
console.log('✓ PASS: Strict Portal Isolation Verified (No cross-teacher or unassigned data leaks)');

console.log('\nALL 6 REQUIREMENTS VALIDATED & PASSED SUCCESSFULLY!');
