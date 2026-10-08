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
    
    // Binary search or line by line test to find earliest line that causes syntax error
    for (let end = 1; end <= lines.length; end++) {
      const slice = lines.slice(0, end).join('\n');
      try {
        new vm.Script(slice);
      } catch (e) {
        // SyntaxError might just be unclosed function, which is normal for a slice.
        // But let's check what e.message is!
        if (!e.message.includes('Unexpected end of input')) {
          console.log(`First real syntax error at line ${end} (HTML line ${6045 + end}): ${e.message}`);
          console.log('Line content:', lines[end - 1]);
          console.log('Previous 3 lines:', lines.slice(Math.max(0, end - 4), end - 1));
          break;
        }
      }
    }
  }
}
