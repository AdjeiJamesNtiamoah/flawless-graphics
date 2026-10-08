const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// Extract all script contents
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIdx++;
  const scriptContent = match[1];
  console.log(`Checking inline script #${scriptIdx} (length: ${scriptContent.length})...`);
  try {
    // Check syntax
    new vm.Script(scriptContent);
    console.log(`Inline script #${scriptIdx}: Syntax OK!`);
  } catch (err) {
    console.error(`Inline script #${scriptIdx} Syntax ERROR:`, err.message);
    const lineMatch = err.stack.match(/evalmachine\.<anonymous>:(\d+)/);
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1], 10);
      const scriptLines = scriptContent.split('\n');
      console.error('Around line:', lineNum);
      for (let j = Math.max(0, lineNum - 5); j < Math.min(scriptLines.length, lineNum + 5); j++) {
        console.error(`${j + 1}: ${scriptLines[j]}`);
      }
    }
  }
}
