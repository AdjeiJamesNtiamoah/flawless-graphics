const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// ============================================================
// 1. CLEAN site-login.html
// ============================================================
const siteLoginPath = path.join(root, 'site-login.html');
let loginHtml = fs.readFileSync(siteLoginPath, 'utf8');

// Remove role quick-switch chips and demo login buttons
loginHtml = loginHtml.replace(/<!-- Role Quick-Switch Chips -->[\s\S]*?<\/div>\s*<\/div>/, '');
loginHtml = loginHtml.replace(/value="admin@flawlessgraphics\.com"/g, '');
loginHtml = loginHtml.replace(/value="flawless2026"/g, '');
loginHtml = loginHtml.replace(/placeholder="admin@flawlessgraphics\.com"/g, 'placeholder="admin@institution.edu"');
loginHtml = loginHtml.replace(/<button type="button" class="btn-submit"[^>]*onclick="quickDemoLogin[\s\S]*?<\/button>/g, '');
loginHtml = loginHtml.replace(/<a href="welcome\.html"[^>]*onclick="quickDemoLogin[\s\S]*?<\/a>/g, '<a href="register.html" class="link-subtle" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Register Organization</a>');

// Remove quickDemoLogin and selectDemoRole from script
loginHtml = loginHtml.replace(/function quickDemoLogin[\s\S]*?\}\n/g, '');
loginHtml = loginHtml.replace(/function selectDemoRole[\s\S]*?\}\n/g, '');

fs.writeFileSync(siteLoginPath, loginHtml, 'utf8');
console.log('site-login.html cleaned of all mock role chips and credentials!');

// ============================================================
// 2. CLEAN finance-login.html & hr-login.html
// ============================================================
const fLoginPath = path.join(root, 'pages', 'finance', 'finance-login.html');
if (fs.existsSync(fLoginPath)) {
    let fLogin = fs.readFileSync(fLoginPath, 'utf8');
    fLogin = fLogin.replace(/function quickDemoFinance[\s\S]*?\}\n/g, '');
    fLogin = fLogin.replace(/value="[^"]*@flawless[^"]*"/g, '');
    fLogin = fLogin.replace(/value="flawless2026"/g, '');
    fs.writeFileSync(fLoginPath, fLogin, 'utf8');
    console.log('finance-login.html cleaned!');
}

const hrLoginPath = path.join(root, 'pages', 'hr', 'hr-login.html');
if (fs.existsSync(hrLoginPath)) {
    let hrLogin = fs.readFileSync(hrLoginPath, 'utf8');
    hrLogin = hrLogin.replace(/function quickDemoHR[\s\S]*?\}\n/g, '');
    hrLogin = hrLogin.replace(/value="[^"]*@flawless[^"]*"/g, '');
    hrLogin = hrLogin.replace(/value="flawless2026"/g, '');
    fs.writeFileSync(hrLoginPath, hrLogin, 'utf8');
    console.log('hr-login.html cleaned!');
}

// ============================================================
// 3. UPDATE welcome.html with Dynamic Org State
// ============================================================
const welcomePath = path.join(root, 'welcome.html');
let welcomeHtml = fs.readFileSync(welcomePath, 'utf8');

const oldWelcomeInit = `document.addEventListener("DOMContentLoaded", function() {
    try {
        const user = window.AuthSession ? window.AuthSession.requireAuth('site-login.html', true) : null;
        if (user) {
            if (user.name) {
                document.getElementById("userName").textContent = user.name;
                document.getElementById("userBadge").style.display = "flex";
            }
            if (user.org) {
                document.getElementById("orgTitle").textContent = user.org.toUpperCase();
            }
            if (user.logo) {
                document.getElementById("orgLogoBox").innerHTML = \`<img src="\${user.logo}" alt="Organization Logo">\`;
            }

            const hrLink = document.getElementById("portalHrLink");
            if (hrLink) hrLink.href = "pages/hr/hr-dashboard.html";

            const teacherLink = document.getElementById("portalTeacherLink");
            if (teacherLink) teacherLink.href = "pages/teacher/teacher-dashboard.html";

            const financeLink = document.getElementById("portalFinanceLink");
            if (financeLink) financeLink.href = "pages/finance/finance-dashboard.html";

            const studentLink = document.getElementById("portalStudentLink");
            if (studentLink) studentLink.href = "pages/student/student-dashboard.html";
        }
    } catch (e) {
        console.warn("Could not parse user session details:", e);
    }
});`;

const newWelcomeInit = `document.addEventListener("DOMContentLoaded", function() {
    try {
        const user = window.AuthSession ? window.AuthSession.getUser() : null;
        const orgTitle = document.getElementById("orgTitle");
        const orgLogoBox = document.getElementById("orgLogoBox");
        const userBadge = document.getElementById("userBadge");
        const userName = document.getElementById("userName");

        if (user && user.org) {
            if (userName) userName.textContent = user.name || 'Administrator';
            if (userBadge) userBadge.style.display = "flex";
            if (orgTitle) orgTitle.textContent = user.org.toUpperCase();
            if (user.logo && orgLogoBox) {
                orgLogoBox.innerHTML = \`<img src="\${user.logo}" alt="\${user.org}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit;">\`;
            }
        } else {
            // Check if any organization exists in repository
            let orgs = [];
            try { orgs = JSON.parse(localStorage.getItem('organizations') || '[]'); } catch(e){}
            
            if (orgs.length > 0) {
                const latest = orgs[orgs.length - 1];
                if (orgTitle) orgTitle.textContent = (latest.org_name || latest.name || 'INSTITUTIONAL HUB').toUpperCase();
                if (latest.logo && orgLogoBox) {
                    orgLogoBox.innerHTML = \`<img src="\${latest.logo}" alt="Logo" style="width:100%; height:100%; object-fit:contain; border-radius:inherit;">\`;
                }
            } else {
                if (orgTitle) orgTitle.textContent = "ORGANIZATION PLATFORM";
                // Show clean onboarding prompt banner
                const sectionHeading = document.querySelector('.section-heading');
                if (sectionHeading) {
                    const banner = document.createElement('div');
                    banner.id = "noOrgNoticeBanner";
                    banner.style.cssText = "background: rgba(2, 132, 199, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;";
                    banner.innerHTML = \`
                        <div style="font-size: 13px; color: #ffffff;">
                            <strong style="color: #38bdf8;"><i class="fa-solid fa-sparkles"></i> Ready for New Institution:</strong> Register your school or university to launch your dedicated multi-tenant workspace.
                        </div>
                        <a href="register.html" style="background: linear-gradient(135deg, #0284c7, #6366f1); color: #fff; text-decoration: none; padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-plus-circle"></i> Register Institution
                        </a>
                    \`;
                    sectionHeading.parentNode.insertBefore(banner, sectionHeading.nextSibling);
                }
            }
        }
    } catch (e) {
        console.warn("Could not load organization session details:", e);
    }
});`;

welcomeHtml = welcomeHtml.replace(oldWelcomeInit, newWelcomeInit);
fs.writeFileSync(welcomePath, welcomeHtml, 'utf8');
console.log('welcome.html updated with clean dynamic organization state!');

// ============================================================
// 4. ADD AUTO-PURGE ROUTINE FOR LEGACY MOCK DATA IN auth-session.js
// ============================================================
const authSessionPath = path.join(root, 'assets', 'js', 'auth-session.js');
let updatedAuth = fs.readFileSync(authSessionPath, 'utf8');
const purgeCode = `
    // Initializer: clean legacy mock data keys if present
    try {
        const legacyMockUser = safeParse(localStorage.getItem(ACTIVE_ORG_USER_KEY));
        if (legacyMockUser && (legacyMockUser.email === 'admin@flawlessgraphics.com' || legacyMockUser.email === 'admin@flawless.org')) {
            // Clear default placeholder session to allow clean new organization setup
            localStorage.removeItem(ACTIVE_ORG_USER_KEY);
            localStorage.removeItem(ACTIVE_USER_KEY);
            localStorage.removeItem(ACTIVE_ORG_KEY);
            localStorage.removeItem('activeOrg');
            localStorage.removeItem(ACTIVE_HR_KEY);
            localStorage.removeItem(ACTIVE_TEACHER_KEY);
            localStorage.removeItem(TEACHER_USER_KEY);
        }
    } catch(e) {}
`;

if (!updatedAuth.includes('Initializer: clean legacy mock data')) {
    updatedAuth = updatedAuth.replace('window.AuthSession = AuthSession;', purgeCode + '\n    window.AuthSession = AuthSession;');
    fs.writeFileSync(authSessionPath, updatedAuth, 'utf8');
    console.log('Added legacy mock auto-purge routine in auth-session.js!');
}

console.log('All project components transformed to pure organization-based architecture!');
