const fs = require('fs');
const path = require('path');

function searchFiles(dir, results = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== '.git' && file !== '.agentic' && file !== '.kilo' && file !== 'scratch') {
                searchFiles(filePath, results);
            }
        } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.sql')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = [];
            
            // Check for hardcoded org fallback
            if (content.includes("|| 'FLAWLESS GRAPHICS'") || content.includes('|| "FLAWLESS GRAPHICS"')) {
                matches.push('Hardcoded FLAWLESS GRAPHICS fallback');
            }
            if (content.includes('initDemoSession') || content.includes('DEMO_USER')) {
                matches.push('Demo session / DEMO_USER');
            }
            if (content.includes('Sarah Jenkins') || content.includes('Kofi Mensah') || content.includes('Ebenezer Addo')) {
                matches.push('Sample person names');
            }
            if (content.includes('INSERT INTO public.organizations') || content.includes('INSERT INTO public.users')) {
                matches.push('SQL default seed insertions');
            }
            
            if (matches.length > 0) {
                results.push({ file: path.relative(path.join(__dirname, '..'), filePath), matches });
            }
        }
    });
    return results;
}

const res = searchFiles(path.join(__dirname, '..'));
console.log('Seed & Default occurrences found in:', res);
