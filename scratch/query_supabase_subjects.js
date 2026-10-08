const SUPABASE_URL = 'https://wmvsujwgvlosfjdlhadu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

async function apiGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return await res.json();
}

async function check() {
  console.log('--- ALL CLASSES IN SUPABASE ---');
  try {
    const classes = await apiGet('classes?select=*');
    console.log(`Found ${classes.length} classes:`);
    classes.forEach(c => {
      console.log(`\nClass: "${c.name}" (Code: ${c.code}, ID: ${c.id})`);
      console.log(`  School/Org: "${c.school_id || c.organization}"`);
      console.log(`  Subject (column): "${c.subject}"`);
      console.log(`  Subjects (json array): ${JSON.stringify(c.subjects)}`);
      console.log(`  Assigned Teacher: "${c.teacher_name || c.teacher || c.teacherEmail || 'None'}"`);
    });
  } catch (err) {
    console.error('Error fetching classes:', err.message);
  }

  console.log('\n--- SUBJECTS TABLE IN SUPABASE ---');
  try {
    const subjects = await apiGet('subjects?select=*');
    console.log(`Found ${subjects.length} subjects:`);
    subjects.forEach(s => {
      console.log(`- ID: ${s.id} | Code: ${s.code} | Name: ${s.name} | Dept: ${s.department} | Class ID: ${s.class_id} | School: "${s.school_id}"`);
    });
  } catch (err) {
    console.log('Subjects table query error:', err.message);
  }

  console.log('\n--- SYSTEM / CURRICULUM SUBJECTS (DEFAULT DATA) ---');
}

check();
