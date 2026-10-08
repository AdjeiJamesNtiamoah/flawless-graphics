const fs = require('fs');

const original = fs.readFileSync('index.html', 'utf8');
const replacementBlock = fs.readFileSync('scratch/replacement_users_block.js', 'utf8');

// Find the start and end of the block in index.html
const startMarker = '/**\r\n * Resilient multi-storage reader for registered users\r\n */';
const startMarkerLf = '/**\n * Resilient multi-storage reader for registered users\n */';

const endMarker = '    // 0b. Pre-recognition for EMP-2026-226 (HR Administrator)';

const isCrlf = original.includes('\r\n');
const searchStart = isCrlf ? startMarker : startMarkerLf;

const startIndex = original.indexOf(searchStart);
const endIndex = original.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
    process.exit(1);
}

const before = original.substring(0, startIndex);
const after = original.substring(endIndex);

const formattedReplacement = isCrlf ? replacementBlock.replace(/\r?\n/g, '\r\n') + '\r\n\r\n    ' : replacementBlock.replace(/\r\n/g, '\n') + '\n\n    ';

const newContent = before + formattedReplacement + after;
fs.writeFileSync('index.html', newContent, 'utf8');
console.log('Successfully updated index.html with Supabase saved users!');
