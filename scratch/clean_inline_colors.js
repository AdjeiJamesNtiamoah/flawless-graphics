const fs = require('fs');

let html = fs.readFileSync('register.html', 'utf8');

// Replace remaining dark text colors with light-theme friendly colors
html = html.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.65\);/g, 'color: #57534e;');
html = html.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.5\);/g, 'color: #78716c;');
html = html.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.6\);/g, 'color: #57534e;');
html = html.replace(/style="background:\s*rgba\(56,\s*189,\s*248,\s*0\.15\);\s*color:\s*#7dd3fc;\s*border-color:\s*rgba\(56,\s*189,\s*248,\s*0\.3\);"/g, 'style="background: #e0f2fe; color: #0369a1; border-color: #bae6fd;"');
html = html.replace(/style="background:\s*rgba\(168,\s*85,\s*247,\s*0\.15\);\s*color:\s*#d8b4fe;\s*border-color:\s*rgba\(168,\s*85,\s*247,\s*0\.3\);"/g, 'style="background: #f3e8ff; color: #7e22ce; border-color: #e9d5ff;"');
html = html.replace(/style="border-color:\s*rgba\(56,\s*189,\s*248,\s*0\.4\);\s*color:\s*#38bdf8;"/g, 'style="border-color: #bfdbfe; color: #2563eb; background: #eff6ff;"');

fs.writeFileSync('register.html', html, 'utf8');
fs.writeFileSync('registration.html', html, 'utf8');
console.log('Polished inline colors on register.html & registration.html successfully!');
