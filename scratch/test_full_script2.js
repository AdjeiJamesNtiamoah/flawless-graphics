const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIdx++;
  if (scriptIdx === 2) {
    const scriptContent = match[1];
    
    // Test whole script:
    try {
      new vm.Script(scriptContent);
      console.log('Script #2 compiles fine!');
    } catch (err) {
      console.log('Compilation error on full script #2:');
      console.log(err.message);
      console.log(err.stack);
    }
  }
}
