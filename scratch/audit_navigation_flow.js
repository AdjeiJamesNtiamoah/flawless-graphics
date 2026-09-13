const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== '.git' && file !== '.agentic' && file !== '.kilo' && file !== 'scratch') {
                getHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const root = path.join(__dirname, '..');
const htmlFiles = getHtmlFiles(root);

console.log(`Found ${htmlFiles.length} HTML files in project:`);
htmlFiles.forEach(f => {
    const rel = path.relative(root, f);
    const content = fs.readFileSync(f, 'utf8');
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'No title';
    console.log(`- ${rel.padEnd(35)} : ${title}`);
});
