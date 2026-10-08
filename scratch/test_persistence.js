const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

function query(endpoint, method = 'GET', body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = 'https://wmvsujwgvlosfjdlhadu.supabase.co/rest/v1/' + endpoint;
    const headers = Object.assign({
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }, extraHeaders);
    const req = https.request(url, { method, headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testTeacherAssignmentPersistence() {
  console.log('--- Step 1: Assign Martha Adjei to Bsc IT 2 (ID: 11) ---');
  const patchPayload = {
    teacher_name: 'Martha Adjei',
    teacher_id: 'marthaadjei989@gmail.com',
    teachers: [
      {
        name: 'Martha Adjei',
        role: 'Lead Educator',
        email: 'marthaadjei989@gmail.com',
        subjects: ['rgerw', 'Computer Science', 'Mathematics', 'English Language']
      }
    ],
    updated_at: new Date().toISOString()
  };

  const patchRes = await query('classes?id=eq.11', 'PATCH', patchPayload);
  console.log('PATCH returned:', Array.isArray(patchRes) ? patchRes.length + ' row(s) updated' : patchRes);

  console.log('--- Step 2: Fetch classes for CAPE COAST UNIVERSITY ---');
  const encQuoted = encodeURIComponent('"CAPE COAST UNIVERSITY"');
  const data = await query(`classes?or=(org_id.ilike.${encQuoted},org_name.ilike.${encQuoted})&order=id.asc`);
  
  const mapped = data.map(c => {
    const rawSubj = c.subject || '';
    let subjectsArr = [];
    if (Array.isArray(c.subjects)) subjectsArr = c.subjects;
    else if (rawSubj) subjectsArr = rawSubj.split(',').map(s => s.trim()).filter(Boolean);

    let teachersArr = [];
    if (Array.isArray(c.teachers)) teachersArr = c.teachers;
    else if (typeof c.teachers === 'string') {
      try { teachersArr = JSON.parse(c.teachers); } catch(_) {}
    }

    if (teachersArr.length === 0 && (c.teacher_name || c.teacher_id)) {
      teachersArr = [{
        name: c.teacher_name || 'Educator',
        email: c.teacher_id || '',
        role: 'Lead Educator',
        subjects: subjectsArr.length > 0 ? [...subjectsArr] : ['General']
      }];
    } else if (teachersArr.length > 0) {
      teachersArr = teachersArr.map(t => ({
        name: t.name || c.teacher_name || 'Educator',
        email: t.email || t.teacherEmail || t.teacher_id || c.teacher_id || '',
        role: t.role || 'Lead Educator',
        subjects: Array.isArray(t.subjects) && t.subjects.length > 0 ? t.subjects : (subjectsArr.length > 0 ? [...subjectsArr] : ['General']),
        pairedWith: Array.isArray(t.pairedWith) ? t.pairedWith : []
      }));
    }

    const primaryTeacherName = c.teacher_name || (teachersArr.length > 0 ? teachersArr.map(t => t.name).join(', ') : '');
    const primaryTeacherEmail = c.teacher_id || (teachersArr[0] ? teachersArr[0].email : '') || '';

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      teacherId: primaryTeacherEmail,
      teacherEmail: primaryTeacherEmail,
      teacherName: primaryTeacherName,
      teachers: teachersArr
    };
  });

  const bsc2 = mapped.find(c => c.id === 11);
  console.log('Bsc IT 2 Mapped Result:');
  console.log(JSON.stringify(bsc2, null, 2));

  const isAssigned = Boolean((Array.isArray(bsc2.teachers) && bsc2.teachers.length > 0) || (bsc2.teacherName && bsc2.teacherName.trim() !== ''));
  console.log('isAssigned evaluated to:', isAssigned);

  if (isAssigned && bsc2.teachers[0].name === 'Martha Adjei' && bsc2.teachers[0].email === 'marthaadjei989@gmail.com') {
    console.log('SUCCESS: Teacher assignment persisted in cloud and successfully mapped!');
  } else {
    console.error('FAILED: Teacher assignment did not persist correctly.');
    process.exit(1);
  }
}

testTeacherAssignmentPersistence().catch(err => {
  console.error(err);
  process.exit(1);
});
