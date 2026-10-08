const fs = require('fs');
const c = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const subjectIds = [
  'addSubjectDrawer',
  'addSubjectDrawerBackdrop',
  'addSubjectForm',
  'new_sub_name',
  'new_sub_code',
  'new_sub_dept',
  'new_sub_grade',
  'new_sub_class',
  'new_sub_teacher',
  'new_sub_periods',
  'new_sub_credits',
  'new_sub_room',
  'new_sub_desc',
  'addSubjectDrawerTitle',
  'addSubjectSubmitBtn'
];

let allGood = true;
subjectIds.forEach(id => {
  const has = c.includes(`id="${id}"`) || c.includes(`id='${id}'`);
  if (!has) {
    console.log(`MISSING: ${id}`);
    allGood = false;
  }
});

if (allGood) {
  console.log('ALL add subject drawer IDs exist!');
}
