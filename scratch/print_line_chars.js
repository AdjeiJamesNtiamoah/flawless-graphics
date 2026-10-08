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
    const line1163 = lines[1162]; // 0-indexed
    console.log('Line 1163:');
    for (let i = 0; i < line1163.length; i++) {
      console.log(`pos ${i}: char=${JSON.stringify(line1163[i])}, code=${line1163.charCodeAt(i)}`);
    }
  }
}
