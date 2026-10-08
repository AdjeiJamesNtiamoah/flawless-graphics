const fs = require('fs');

const content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIdx++;
  if (scriptIdx === 2) {
    const scriptContent = match[1];
    const lines = scriptContent.split('\n');
    for (let i = 0; i < 15; i++) {
      console.log(`Line ${i + 1}: length=${lines[i].length}, charCodes=${[...lines[i].slice(0, 30)].map(c => c.charCodeAt(0))}`);
      console.log(`Text: ${JSON.stringify(lines[i])}`);
    }
  }
}
