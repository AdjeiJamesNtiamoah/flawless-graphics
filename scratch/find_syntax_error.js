const fs = require('fs');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIdx++;
  if (scriptIdx === 2) {
    const scriptStartChar = match.index;
    const scriptContent = match[1];
    const linesBefore = content.slice(0, scriptStartChar).split('\n').length;
    console.log(`Script #2 starts at HTML line: ${linesBefore}`);
    const scriptLines = scriptContent.split('\n');
    for (let i = 1150; i <= 1175; i++) {
      console.log(`Line ${linesBefore + i} (script line ${i}): ${JSON.stringify(scriptLines[i - 1])}`);
    }
  }
}
