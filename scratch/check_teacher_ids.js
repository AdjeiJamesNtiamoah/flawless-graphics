const fs = require('fs');
const c = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const teacherIds = [
  'modalHeading',
  'editTeacherId',
  'teacherForm',
  'm_avatarFile',
  'm_removePhotoBtn',
  'm_name',
  'm_dob',
  'm_gender',
  'm_nationality',
  'm_nationalId',
  'm_email',
  'm_phone',
  'm_address',
  'm_dept',
  'm_pos',
  'm_empType',
  'm_status',
  'm_hireDate',
  'm_salary',
  'm_ssnit',
  'm_qualification',
  'm_subjects',
  'm_licenseNo',
  'm_experience',
  'm_emergencyName',
  'm_emergencyRel',
  'm_emergencyPhone',
  'm_notes',
  'm_avatarPreview',
  'teacherModal'
];

let allGood = true;
teacherIds.forEach(id => {
  const has = c.includes(`id="${id}"`) || c.includes(`id='${id}'`);
  if (!has) {
    console.log(`MISSING: ${id}`);
    allGood = false;
  }
});

if (allGood) {
  console.log('ALL teacher modal IDs exist!');
}
