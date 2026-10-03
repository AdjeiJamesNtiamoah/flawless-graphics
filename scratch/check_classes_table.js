const SUPABASE_URL = 'https://wmvsujwgvlosfjdlhadu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

async function checkClasses() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/classes?limit=1`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const data = await res.json();
  console.log('Sample class:', data);
}

checkClasses().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
