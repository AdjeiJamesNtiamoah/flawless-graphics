const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// Replace the missing backtick
const brokenSnippet = `      </td>\r\n    tbody.appendChild(tr);`;
const brokenSnippetLf = `      </td>\n    tbody.appendChild(tr);`;

console.log('Includes CRLF:', content.includes(brokenSnippet));
console.log('Includes LF:', content.includes(brokenSnippetLf));

const fixedSnippetLf = `      </td>\n    \`;\n    tbody.appendChild(tr);`;
const fixedContent = content.replace(brokenSnippetLf, fixedSnippetLf).replace(brokenSnippet, `      </td>\r\n    \`;\r\n    tbody.appendChild(tr);`);

const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(fixedContent)) !== null) {
  scriptIdx++;
  const scriptContent = match[1];
  console.log(`Checking script #${scriptIdx} (length: ${scriptContent.length})...`);
  try {
    new vm.Script(scriptContent);
    console.log(`Script #${scriptIdx} is 100% VALID JAVASCRIPT!`);
  } catch (err) {
    console.error(`Script #${scriptIdx} ERROR:`, err.message);
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
