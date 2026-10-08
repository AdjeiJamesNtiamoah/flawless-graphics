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

(async () => {
  // Check what classes currently exist
  const classes = await query('classes?select=*&order=id.asc');
  console.log('Current classes in DB:');
  classes.forEach(c => {
    console.log(`ID: ${c.id}, Code: ${c.code}, Name: ${c.name}, teacher_name: ${c.teacher_name}, teachers: ${JSON.stringify(c.teachers)}`);
  });
})();
