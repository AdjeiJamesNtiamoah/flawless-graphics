const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Read existing files
const landingContent = fs.readFileSync(path.join(root, 'landing.html'), 'utf8');
const oldIndexRegistrationContent = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 2. Create register.html and registration.html with clean updated links
let registerContent = oldIndexRegistrationContent;
// In register.html:
// Update title
registerContent = registerContent.replace(
    /<title>.*?<\/title>/i,
    '<title>Register Educational Institution — FLAWLESS GRAPHICS ERP</title>'
);

// Update nav in register.html
registerContent = registerContent.replace(
    /<nav class="window-quick-nav">[\s\S]*?<\/nav>/,
    `<nav class="window-quick-nav">
                    <a href="index.html" class="window-nav-link" style="color: #38bdf8;"><i class="fa-solid fa-sparkles"></i> Overview</a>
                    <a href="welcome.html" class="window-nav-link"><i class="fa-solid fa-grid-horizontal"></i> Unified Hub</a>
                    <a href="pages/public/home.html" class="window-nav-link"><i class="fa-solid fa-house"></i> Main Site</a>
                    <a href="site-login.html" class="window-nav-link"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
                </nav>`
);

fs.writeFileSync(path.join(root, 'register.html'), registerContent, 'utf8');
fs.writeFileSync(path.join(root, 'registration.html'), registerContent, 'utf8');
console.log('Created register.html & registration.html successfully!');

// 3. Make index.html the Landing Showcase with links pointing to register.html
let newIndexLandingContent = landingContent;
// Replace href="index.html" with href="register.html" where it's about registering
newIndexLandingContent = newIndexLandingContent.replace(/href="index\.html"/g, 'href="register.html"');
// Ensure title is clear
newIndexLandingContent = newIndexLandingContent.replace(
    /<title>.*?<\/title>/i,
    '<title>FLAWLESS GRAPHICS — Institutional & School Management Platform</title>'
);

fs.writeFileSync(path.join(root, 'index.html'), newIndexLandingContent, 'utf8');
fs.writeFileSync(path.join(root, 'landing.html'), newIndexLandingContent, 'utf8');
console.log('Updated index.html and landing.html as premier platform showcase!');

// 4. Update welcome.html
let welcomeContent = fs.readFileSync(path.join(root, 'welcome.html'), 'utf8');
welcomeContent = welcomeContent.replace(/href="index\.html"/g, 'href="register.html"');
welcomeContent = welcomeContent.replace(
    /<nav class="window-quick-nav">[\s\S]*?<\/nav>/,
    `<nav class="window-quick-nav">
                <a href="index.html" class="window-nav-link" style="color: #38bdf8;"><i class="fa-solid fa-sparkles"></i> Overview</a>
                <a href="register.html" class="window-nav-link"><i class="fa-solid fa-building"></i> Register Org</a>
                <a href="pages/public/home.html" class="window-nav-link"><i class="fa-solid fa-house"></i> Main Site</a>
                <a href="site-login.html" class="window-nav-link"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
            </nav>`
);
fs.writeFileSync(path.join(root, 'welcome.html'), welcomeContent, 'utf8');
console.log('Updated welcome.html navigation links!');

// 5. Update site-login.html
let loginContent = fs.readFileSync(path.join(root, 'site-login.html'), 'utf8');
loginContent = loginContent.replace(/href="index\.html"/g, 'href="register.html"');
loginContent = loginContent.replace(
    /<nav class="window-quick-nav">[\s\S]*?<\/nav>/,
    `<nav class="window-quick-nav">
                <a href="index.html" class="window-nav-link" style="color: #38bdf8;"><i class="fa-solid fa-sparkles"></i> Overview</a>
                <a href="welcome.html" class="window-nav-link"><i class="fa-solid fa-grid-horizontal"></i> Hub</a>
                <a href="pages/public/home.html" class="window-nav-link"><i class="fa-solid fa-house"></i> Main Site</a>
                <a href="register.html" class="window-nav-link"><i class="fa-solid fa-building"></i> Register Org</a>
            </nav>`
);
fs.writeFileSync(path.join(root, 'site-login.html'), loginContent, 'utf8');
console.log('Updated site-login.html navigation links!');

// 6. Update student-login.html and teacher-login.html
const sLoginPath = path.join(root, 'pages', 'student', 'student-login.html');
let sLogin = fs.readFileSync(sLoginPath, 'utf8');
sLogin = sLogin.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="../../register.html"');
fs.writeFileSync(sLoginPath, sLogin, 'utf8');

const tLoginPath = path.join(root, 'pages', 'teacher', 'teacher-login.html');
let tLogin = fs.readFileSync(tLoginPath, 'utf8');
tLogin = tLogin.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="../../register.html"');
fs.writeFileSync(tLoginPath, tLogin, 'utf8');

console.log('All navigation paths synchronized and streamlined!');
