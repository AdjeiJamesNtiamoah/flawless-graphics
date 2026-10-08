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

    // Let's test lines 1 to 2000
    // We want to find the minimal range [0, k] that has a syntax error NOT being "Unexpected end of input"
    // But since JS can have functions across multiple lines, let's find the function that contains line 1163.
    // Line 1163 in script is around line 7208 in HTML.
    // Let's print lines 1140 to 1180 in script:
    for (let j = 1140; j <= 1180; j++) {
      console.log(`${j}: ${lines[j - 1]}`);
    }

    // Now let's test if the function surrounding line 1163 compiles:
    let funcLines = [];
    for (let j = 1145; j <= 1165; j++) {
      funcLines.push(lines[j - 1]);
    }
    const funcStr = funcLines.join('\n');
    console.log('Testing isolated function:');
    try {
      new vm.Script(funcStr);
      console.log('Isolated function compiles fine!');
    } catch (e) {
      console.log('Isolated function error:', e.message);
    }
  }
}
