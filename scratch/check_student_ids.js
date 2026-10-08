const fs = require('fs');
const c = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const studentIds = [
  'studentModal',
  'studentDetailForm',
  'studentModalTitle',
  'sm_saveBtn',
  'sm_classId',
  'sm_studentId',
  'sm_firstName',
  'sm_middleName',
  'sm_lastName',
  'sm_gender',
  'sm_dob',
  'sm_bloodGroup',
  'sm_roll',
  'sm_password',
  'sm_status',
  'sm_term',
  'sm_enrollmentDate',
  'sm_guardianName',
  'sm_guardianRel',
  'sm_phone',
  'sm_guardianEmail',
  'sm_address',
  'sm_emergencyPhone',
  'sm_medicalNotes',
  'sm_notes',
  'sm_photoPreview',
  'sm_removePhotoBtn',
  'sm_photoFile',
  'sm_orgBadge'
];

let allGood = true;
studentIds.forEach(id => {
  const has = c.includes(`id="${id}"`) || c.includes(`id='${id}'`);
  if (!has) {
    console.log(`MISSING: ${id}`);
    allGood = false;
  }
});

if (allGood) {
  console.log('ALL student modal IDs exist!');
}
