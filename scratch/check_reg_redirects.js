const fs = require('fs');
const path = require('path');

const regPath = path.join(__dirname, '..', 'register.html');
const content = fs.readFileSync(regPath, 'utf8');

const matches = content.match(/window\.location\.href\s*=\s*['"][^'"]+['"]/g) || [];
console.log('Redirects in register.html:\n', matches);
