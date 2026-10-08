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
    
    let inBacktick = false;
    let backtickStart = -1;
    
    for (let i = 0; i < 1163; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        // check escaped
        if (line[j] === '\\') {
          j++; // skip escaped
          continue;
        }
        if (line[j] === '`') {
          if (!inBacktick) {
            inBacktick = true;
            backtickStart = i + 1;
          } else {
            inBacktick = false;
          }
        }
      }
      if (inBacktick) {
        // console.log(`Still in backtick after line ${i + 1}`);
      }
    }
    
    console.log('After line 1162, inBacktick =', inBacktick, 'started at line', backtickStart);
  }
}
