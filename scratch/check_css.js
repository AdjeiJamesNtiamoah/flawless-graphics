const fs = require('fs');

function checkFile(filePath, searchTerms) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('=== Checking:', filePath, '===');
  searchTerms.forEach(term => {
    let idx = 0;
    while ((idx = content.indexOf(term, idx)) !== -1) {
      const snippet = content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 250));
      console.log(`-- Found "${term}" --`);
      console.log(snippet.replace(/\r?\n/g, ' '));
      idx += term.length;
    }
  });
}

checkFile('assets/css/skeleton.css', ['skeleton', 'z-index', 'pointer-events']);
checkFile('assets/css/slide-over.css', ['slide-over-backdrop', 'slide-over-panel', 'z-index']);
