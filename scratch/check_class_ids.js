const fs = require('fs');
const c = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const classIds = [
  'addClassDrawer',
  'addClassDrawerBackdrop',
  'addClassForm',
  'new_class_code',
  'new_class_name',
  'new_class_room',
  'new_class_schedule',
  'new_class_capacity',
  'new_class_grade',
  'addClassDrawerTitle',
  'addClassSubmitBtn'
];

let allGood = true;
classIds.forEach(id => {
  const has = c.includes(`id="${id}"`) || c.includes(`id='${id}'`);
  if (!has) {
    console.log(`MISSING: ${id}`);
    allGood = false;
  }
});

if (allGood) {
  console.log('ALL add class drawer IDs exist!');
}
