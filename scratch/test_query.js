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

(async () => {
  const enc1 = encodeURIComponent('"FLAWLESS GRAPHICS"');
  const d1 = await query('classes?or=(org_id.ilike.' + enc1 + ',org_name.ilike.' + enc1 + ')&order=created_at.desc');
  console.log('Query for FLAWLESS GRAPHICS returned count:', Array.isArray(d1) ? d1.length : d1);

  const enc2 = encodeURIComponent('"CAPE COAST UNIVERSITY"');
  const d2 = await query('classes?or=(org_id.ilike.' + enc2 + ',org_name.ilike.' + enc2 + ')&order=created_at.desc');
  console.log('Query for CAPE COAST UNIVERSITY returned count:', Array.isArray(d2) ? d2.length : d2);
})();
