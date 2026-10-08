const fs = require('fs');
const c = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const userIds = [
  'editUserOriginalEmail',
  'um_name',
  'um_email',
  'um_role',
  'um_status',
  'um_password',
  'um_linkedStaff',
  'userModalTitle'
];

userIds.forEach(id => {
  const has = c.includes(`id="${id}"`) || c.includes(`id='${id}'`);
  console.log(`${id}: ${has ? 'FOUND' : 'NOT FOUND'}`);
});
