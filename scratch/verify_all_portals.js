const fs = require('fs');

const portals = [
    { name: 'Admin Dashboard', path: 'pages/admin/admin-dashboard.html' },
    { name: 'Super Admin Console (Root)', path: 'super-admin.html' },
    { name: 'Super Admin Console (Subpage)', path: 'pages/admin/super-admin.html' },
    { name: 'Teacher Dashboard', path: 'pages/teacher/teacher-dashboard.html' },
    { name: 'Student Dashboard', path: 'pages/student/student-dashboard.html' },
    { name: 'Finance Dashboard', path: 'pages/finance/finance-dashboard.html' },
    { name: 'Finance Hub', path: 'pages/finance/index.html' },
    { name: 'HR Dashboard', path: 'pages/hr/hr-dashboard.html' },
    { name: 'HR Hub', path: 'pages/hr/index.html' },
    { name: 'Unified Executive Hub', path: 'welcome.html' },
    { name: 'Main Campus Overview', path: 'index.html', customCheck: true }
];

let allPassed = true;

for (const p of portals) {
    if (!fs.existsSync(p.path)) {
        console.error(`MISSING FILE: ${p.path}`);
        allPassed = false;
        continue;
    }
    const html = fs.readFileSync(p.path, 'utf8');
    if (p.customCheck) {
        const hasGreeting = html.includes('welcomeTimeGreeting');
        const hasDate = html.includes('welcomeLiveDate');
        const hasClock = html.includes('welcomeLiveClock');
        console.log(`[${p.name}]: Greeting=${hasGreeting}, Date=${hasDate}, Clock=${hasClock}`);
        if (!hasGreeting || !hasDate || !hasClock) allPassed = false;
    } else {
        const hasCss = html.includes('portal-canopy.css');
        const hasJs = html.includes('portal-canopy.js');
        const hasBadge = html.includes('portal-greeting-badge');
        const hasDate = html.includes('portal-date-chip');
        const hasClock = html.includes('portal-clock-chip');
        console.log(`[${p.name}]: CSS=${hasCss}, JS=${hasJs}, Badge=${hasBadge}, Date=${hasDate}, Clock=${hasClock}`);
        if (!hasCss || !hasJs || !hasBadge || !hasDate || !hasClock) allPassed = false;
    }
}

if (allPassed) {
    console.log('\n>>> ALL PORTALS VERIFIED SUCCESSFULLY WITH GREETINGS, DATE & CLOCK CANOPY! <<<');
} else {
    console.error('\n>>> SOME PORTALS FAILED VERIFICATION <<<');
    process.exit(1);
}
