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
    const lines = scriptContent.split('\n');
    console.log(`Script #2 has ${lines.length} lines.`);

    // Let's divide script into chunks or binary search where the error is.
    // We can test by commenting out half the lines.
    function testRange(start, end) {
      // replace lines outside [start, end] with empty lines to preserve line numbers
      const testLines = lines.map((l, idx) => {
        if (idx >= start && idx <= end) return l;
        return '';
      });
      try {
        new vm.Script(testLines.join('\n'));
        return true;
      } catch (e) {
        return e;
      }
    }

    console.log('Testing full script:');
    try {
      new vm.Script(scriptContent);
      console.log('OK');
    } catch (e) {
      console.log('Full script error:', e.message, e.stack.slice(0, 300));
    }
  }
}
