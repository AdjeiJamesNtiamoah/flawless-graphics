const fs = require('fs');
const https = require('https');

const clientCode = fs.readFileSync('assets/js/supabase-client.js', 'utf8');
const usesLocalStorage = clientCode.includes('localStorage.setItem') || clientCode.includes('localStorage.getItem');
console.log('Uses localStorage for entity data:', usesLocalStorage);

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdnN1andndmxvc2ZqZGxoYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTMxODUsImV4cCI6MjEwMzg2OTE4NX0.7fcpfZtvTgYNxZpc4dW3K3xhZgTS7f0hrXGtzfItTzg';

const req = https.request('https://wmvsujwgvlosfjdlhadu.supabase.co/rest/v1/teachers?limit=1', {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Direct Supabase Response code:', res.statusCode);
    console.log('Teachers in cloud:', body);
  });
});
req.on('error', e => console.error(e));
req.end();
