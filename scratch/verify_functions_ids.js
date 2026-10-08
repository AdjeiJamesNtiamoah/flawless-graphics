const fs = require('fs');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

function checkId(id) {
  const exists = content.includes(`id="${id}"`) || content.includes(`id='${id}'`);
  return exists;
}

function checkFunction(fn) {
  const exists = content.includes(`function ${fn}`) || content.includes(`${fn} =`);
  return exists;
}

console.log('--- Checking functions ---');
[
  'openAddStudentModal',
  'closeStudentModal',
  'openTeacherModal',
  'closeTeacherModal',
  'openUserModal',
  'closeUserModal',
  'openAddClassModal',
  'closeAddClassModal',
  'openAddSubjectModal',
  'closeAddSubjectModal',
  'showSection',
  'toggleNavGroup',
  'getEnrolledStudentsList',
  'populateStudentClassSelect',
  'getClassesList',
  'getSubjectsList',
  'getAvailableTeachers',
  'renderDashboard',
  'renderCharts',
  'renderTeachers',
  'renderUsers',
  'renderClassesSection',
  'renderSubjectsTab'
].forEach(fn => {
  console.log(`${fn}: ${checkFunction(fn) ? 'EXISTS' : 'MISSING'}`);
});

console.log('\n--- Checking modal element IDs ---');
[
  'studentModal',
  'studentDetailForm',
  'sm_firstName',
  'teacherModal',
  'teacherForm',
  'modalHeading',
  'editTeacherId',
  'userModal',
  'userForm',
  'addClassDrawer',
  'addClassDrawerBackdrop',
  'addClassForm',
  'addSubjectDrawer',
  'addSubjectDrawerBackdrop',
  'addSubjectForm',
  'assignTeacherDrawer',
  'assignTeacherDrawerBackdrop'
].forEach(id => {
  console.log(`${id}: ${checkId(id) ? 'EXISTS' : 'MISSING'}`);
});
