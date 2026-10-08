const url = 'https://wmvsujwgvlosfjdlhadu.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

async function testSaveUser() {
  const payload = {
    id: 'u_' + Date.now(),
    org: 'FLAWLESS GRAPHICS',
    name: 'Test Teacher',
    email: 'testteacher' + Date.now() + '@gmail.com',
    pass_hash: 'Password123!',
    role: 'teacher',
    linked_staff_id: 'TEA-TEST-001',
    status: 'pending_approval',
    designation: '',
    department: 'General Faculty',
    phone: '0241234567',
    photo_url: null,
    approved_at: null,
    approved_by: null,
    updated_at: new Date().toISOString()
  };

  console.log('Sending saveUser POST request...');
  const start = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/users`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status, res.statusText, `(${Date.now() - start}ms)`);
    const data = await res.json();
    console.log('Response body:', data);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testSaveUser();
