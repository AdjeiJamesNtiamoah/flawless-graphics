const fs = require('fs');
const path = require('path');

const welcomePath = path.join(__dirname, '..', 'welcome.html');
const content = fs.readFileSync(welcomePath, 'utf8');

const linkMatches = content.match(/<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi) || [];
console.log('Links in welcome.html:');
linkMatches.forEach(l => {
    const href = l.match(/href="([^"]+)"/i)[1];
    const text = l.replace(/<[^>]+>/g, '').trim();
    console.log(`- ${href.padEnd(45)} -> ${text}`);
});
