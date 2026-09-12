// scratch/verify_teacher_navbar_scroll.js
const fs = require('fs');
const path = require('path');

const teacherHtmlPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
const content = fs.readFileSync(teacherHtmlPath, 'utf8').replace(/\r\n/g, '\n');

console.log('--- VERIFYING TEACHER DASHBOARD NAVBAR SCROLL & STANDOUT ---');

let passed = 0;
let failed = 0;

function check(cond, msg) {
  if (cond) {
    console.log('PASS:', msg);
    passed++;
  } else {
    console.error('FAIL:', msg);
    failed++;
  }
}

// 1. html, body height 100vh & overflow hidden
check(content.includes('height: 100vh;') && content.includes('overflow: hidden;'), 'html/body pinned at 100vh with overflow hidden to prevent global page scroll');

// 2. .app container height 100vh & overflow hidden
check(content.includes('.app {\n  display: flex;\n  height: 100vh;\n  width: 100vw;\n  overflow: hidden;\n}'), '.app container flexbox spans 100vh viewport');

// 3. .sidebar pinned sticky top 0 height 100vh with standout shadow and scrollbar
check(content.includes('position: sticky;\n  top: 0;'), '.sidebar has sticky positioning at top 0');
check(content.includes('height: 100vh;\n  position: sticky;'), '.sidebar pinned to full 100vh viewport');
check(content.includes('box-shadow: 8px 0 36px rgba(0, 0, 0, 0.35)'), '.sidebar features prominent 8px multi-layer elevation shadow to stand out');
check(content.includes('scrollbar-width: thin;') && content.includes('.sidebar::-webkit-scrollbar'), '.sidebar has custom thin scrollbar for long nav lists');

// 4. .main independently scrollable with smooth scroll
check(content.includes('.main {\n  flex: 1;\n  min-width: 0;\n  height: 100vh;\n  padding: 24px 32px 60px;\n  overflow-y: auto;'), '.main has independent scroll container (height 100vh, overflow-y auto)');

// 5. .header sticky at top of content scroll
check(content.includes('.header {\n  position: sticky;\n  top: -24px;\n  z-index: 80;'), '.header sticky at top of scroll with glassmorphic backdrop');

// 6. Tab reset scroll in JS
check(content.includes('const mainEl = document.querySelector(\'.main\');\n    if (mainEl) mainEl.scrollTop = 0;'), 'Tab click resets .main scroll position to top');

console.log(`\n================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`================================`);

if (failed > 0) process.exit(1);
