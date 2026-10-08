const fs = require('fs');
const vm = require('vm');

const files = [
  'assets/js/skeleton-loader.js',
  'assets/js/quick-assistant.js',
  'assets/js/quick-dock.js',
  'assets/js/slide-over.js',
  'assets/js/supabase-client.js'
];

files.forEach(f => {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new vm.Script(code);
    console.log(`[PASS] ${f} is valid JavaScript.`);
  } catch (e) {
    console.error(`[FAIL] ${f}:`, e.message);
  }
});
