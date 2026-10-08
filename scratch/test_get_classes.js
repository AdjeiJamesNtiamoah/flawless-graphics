const https = require('https');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

function query(endpoint) {
  return new Promise((resolve) => {
    https.get('https://wmvsujwgvlosfjdlhadu.supabase.co/rest/v1/' + endpoint, {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
}

// Emulate getClasses from supabase-client.js
async function getClasses(orgId = 'CAPE COAST UNIVERSITY') {
  const cleanOrg = String(orgId || 'FLAWLESS GRAPHICS').trim();
  const safeOrgStr = cleanOrg.replace(/"/g, '""');
  const encQuoted = encodeURIComponent(`"${safeOrgStr}"`);
  let data = await query(`classes?or=(org_id.ilike.${encQuoted},org_name.ilike.${encQuoted})&order=created_at.desc`);
  
  return data.map(c => {
    const rawSubj = c.subject || '';
    let subjectsArr = [];
    if (Array.isArray(c.subjects)) {
      subjectsArr = c.subjects;
    } else if (rawSubj) {
      subjectsArr = rawSubj.split(',').map(s => s.trim()).filter(Boolean);
    }
    let teachersArr = [];
    if (Array.isArray(c.teachers)) {
      teachersArr = c.teachers;
    } else if (typeof c.teachers === 'string') {
      try { teachersArr = JSON.parse(c.teachers); } catch(_) {}
    }

    return {
      id: c.id,
      name: c.name || c.class_name || 'Class Cohort',
      className: c.name || c.class_name || 'Class Cohort',
      code: c.code || '',
      grade: c.grade_level || '',
      gradeLevel: c.grade_level || '',
      subject: rawSubj,
      subjects: subjectsArr,
      teachers: teachersArr,
      section: c.section || 'A',
      room: c.room || 'Room 101',
      schedule: c.schedule || '',
      teacherId: c.teacher_id || '',
      teacherName: c.teacher_name || '',
      capacity: Number(c.capacity || 35),
      enrolled: Number(c.enrolled || 0),
      academicYear: c.academic_year || '2026/2027',
      status: c.status || 'Active',
      approvalStatus: c.approval_status || 'approved'
    };
  });
}

(async () => {
  const res = await getClasses('CAPE COAST UNIVERSITY');
  console.log('Result for CAPE COAST UNIVERSITY:');
  console.log(JSON.stringify(res, null, 2));
})();
