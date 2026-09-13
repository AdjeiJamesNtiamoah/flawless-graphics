const fs = require('fs');

function updateFile(filePath, transforms) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isCRLF = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  for (const { target, replacement, isRegex } of transforms) {
    if (isRegex) {
      if (!target.test(content)) {
        console.error('Regex not matched in ' + filePath + ':', target);
        process.exit(1);
      }
      content = content.replace(target, replacement);
    } else {
      if (!content.includes(target)) {
        console.error('Target not found in ' + filePath + ':', target.slice(0, 100));
        process.exit(1);
      }
      content = content.replace(target, replacement);
    }
  }

  if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated ' + filePath);
}

// 1. Update pages/admin/admin-dashboard.html
updateFile('pages/admin/admin-dashboard.html', [
  {
    target: `        // 6. Audit logs & Activity Stream from Supabase
        adminState.auditLogs = await window.SupabaseService.getActivityStream(ACTIVE_ORG);
      } catch (err) {`,
    replacement: `        // 6. Audit logs & Activity Stream from Supabase
        adminState.auditLogs = await window.SupabaseService.getActivityStream(ACTIVE_ORG);

        // Validate ACTIVE_ORG against Supabase organizations
        const orgMatch = adminState.tenants.find(t => (t.name || '').toLowerCase() === (ACTIVE_ORG || '').toLowerCase());
        if (!orgMatch) {
          ACTIVE_ORG = adminState.tenants[0] ? adminState.tenants[0].name : 'FLAWLESS GRAPHICS';
          localStorage.setItem('active_org', ACTIVE_ORG);
          localStorage.setItem('activeOrg', ACTIVE_ORG);
        }
      } catch (err) {`
  },
  {
    target: `    function initAdminUI() {
      // Set admin details
      if (user) {
        document.getElementById('sideAdminName').textContent = user.name || 'Super Administrator';
        document.getElementById('sideAdminEmail').textContent = user.email || 'admin@flawlessgraphics.com';
        document.getElementById('sideOrgName').textContent = ACTIVE_ORG;
      }`,
    replacement: `    function initAdminUI() {
      // Set admin details exclusively from Supabase-verified data
      const verifiedUser = adminState.users.find(u => user && u.email && u.email.toLowerCase() === user.email.toLowerCase());
      if (verifiedUser) {
        document.getElementById('sideAdminName').textContent = verifiedUser.name || 'Super Administrator';
        document.getElementById('sideAdminEmail').textContent = verifiedUser.email || '';
      } else if (adminState.users.length > 0) {
        const rootAdmin = adminState.users.find(u => u.role === 'admin' || u.role === 'superadmin') || adminState.users[0];
        document.getElementById('sideAdminName').textContent = rootAdmin.name || 'Super Administrator';
        document.getElementById('sideAdminEmail').textContent = rootAdmin.email || '';
      } else {
        document.getElementById('sideAdminName').textContent = 'Super Administrator';
        document.getElementById('sideAdminEmail').textContent = 'admin@flawlessgraphics.com';
      }
      document.getElementById('sideOrgName').textContent = ACTIVE_ORG;`
  }
]);

// 2. Update pages/teacher/teacher-dashboard.html
updateFile('pages/teacher/teacher-dashboard.html', [
  {
    target: `async function loadTeacherCloudData() {
  if (!window.SupabaseService) return;
  try {
    const classes = await window.SupabaseService.getClasses(ORG);
    teacherStore[CLASSES_KEY] = classes;

    const students = await window.SupabaseService.getStudents(ORG);
    teacherStore[\`\${ORG}_students\`] = students;

    const att = await window.SupabaseService.getAttendance(ORG);
    teacherStore[ATT_KEY] = att;

    const broadcasts = await window.SupabaseService.getAnnouncements(ORG);
    teacherStore[\`\${ORG}_announcements\`] = broadcasts;
  } catch (err) {
    console.warn('[Teacher Supabase] Load error:', err);
  }
}`,
    replacement: `async function loadTeacherCloudData() {
  if (!window.SupabaseService) return;
  try {
    // 1. Verify organization from Supabase
    const orgs = await window.SupabaseService.getOrganizations();
    if (Array.isArray(orgs) && orgs.length > 0) {
      const match = orgs.find(o => (o.org_name || o.name || '').toLowerCase() === (ORG || '').toLowerCase());
      if (!match) {
        ORG = orgs[0].org_name || orgs[0].name || 'FLAWLESS GRAPHICS';
        localStorage.setItem('active_org', ORG);
        localStorage.setItem('activeOrg', ORG);
        const orgEl = document.getElementById('orgName');
        if (orgEl) orgEl.textContent = ORG;
      }
    }

    // 2. Fetch teachers and verify current teacher
    const cloudTeachers = await window.SupabaseService.getTeachers(ORG);
    if (Array.isArray(cloudTeachers) && cloudTeachers.length > 0) {
      const matchT = cloudTeachers.find(t => teacher && t.email && t.email.toLowerCase() === (teacher.email || '').toLowerCase()) || cloudTeachers[0];
      if (matchT) {
        teacher = {
          name: matchT.full_name || matchT.name || 'Educator',
          email: matchT.email || '',
          org: matchT.org_id || ORG,
          photoBase64: matchT.photo_url || ''
        };
        localStorage.setItem('active_teacher', JSON.stringify(teacher));
        localStorage.setItem('teacher_active_user', JSON.stringify(teacher));
        const tNameEl = document.getElementById('teacherNameSmall');
        if (tNameEl) tNameEl.textContent = teacher.name;
        const tEmailEl = document.getElementById('teacherEmailSmall');
        if (tEmailEl) tEmailEl.textContent = teacher.email;
        if (matchT.photo_url) {
          const pPrev = document.getElementById('profilePreview');
          if (pPrev) pPrev.src = matchT.photo_url;
          const pPhoto = document.getElementById('profilePhoto');
          if (pPhoto) pPhoto.src = matchT.photo_url;
        }
      }
    }

    const classes = await window.SupabaseService.getClasses(ORG);
    teacherStore[CLASSES_KEY] = classes;

    const students = await window.SupabaseService.getStudents(ORG);
    teacherStore[\`\${ORG}_students\`] = students;

    const att = await window.SupabaseService.getAttendance(ORG);
    teacherStore[ATT_KEY] = att;

    const broadcasts = await window.SupabaseService.getAnnouncements(ORG);
    teacherStore[\`\${ORG}_announcements\`] = broadcasts;
  } catch (err) {
    console.warn('[Teacher Supabase] Load error:', err);
  }
}`
  }
]);

// 3. Update pages/hr/hr-dashboard.html
updateFile('pages/hr/hr-dashboard.html', [
  {
    target: `async function loadHRCloudData() {
  if (!window.SupabaseService) return;
  try {
    const teachers = await window.SupabaseService.getTeachers(ACTIVE_ORG);
    hrStore[EMP_KEY] = teachers;

    const att = await window.SupabaseService.getAttendance(ACTIVE_ORG);
    hrStore[ATT_KEY] = att;

    const ann = await window.SupabaseService.getAnnouncements(ACTIVE_ORG);
    hrStore[ANNOUNCE_KEY] = ann;

    const students = await window.SupabaseService.getStudents(ACTIVE_ORG);
    hrStore[STUD_KEY] = students;

    const payroll = await window.SupabaseService.getPayroll(ACTIVE_ORG);
    hrStore['fg_payroll'] = payroll;
  } catch (err) {
    console.warn('[HR Supabase] Load error:', err);
  }
}`,
    replacement: `async function loadHRCloudData() {
  if (!window.SupabaseService) return;
  try {
    // 1. Validate organization from Supabase
    const orgs = await window.SupabaseService.getOrganizations();
    if (Array.isArray(orgs) && orgs.length > 0) {
      const match = orgs.find(o => (o.org_name || o.name || '').toLowerCase() === (ACTIVE_ORG || '').toLowerCase());
      if (!match) {
        ACTIVE_ORG = orgs[0].org_name || orgs[0].name || 'FLAWLESS GRAPHICS';
        localStorage.setItem('active_org', ACTIVE_ORG);
        localStorage.setItem('activeOrg', ACTIVE_ORG);
        const sideOrgEl = document.getElementById('sideOrg');
        if (sideOrgEl) sideOrgEl.textContent = ACTIVE_ORG.toUpperCase();
      }

      // Re-populate org switcher with live Supabase organizations only
      const orgSwitcher = document.getElementById('orgSwitcher');
      if (orgSwitcher) {
        orgSwitcher.innerHTML = '';
        orgs.forEach(o => {
          const name = o.org_name || o.name;
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          if (name === ACTIVE_ORG) opt.selected = true;
          orgSwitcher.appendChild(opt);
        });
      }
    }

    const teachers = await window.SupabaseService.getTeachers(ACTIVE_ORG);
    hrStore[EMP_KEY] = teachers;

    const att = await window.SupabaseService.getAttendance(ACTIVE_ORG);
    hrStore[ATT_KEY] = att;

    const ann = await window.SupabaseService.getAnnouncements(ACTIVE_ORG);
    hrStore[ANNOUNCE_KEY] = ann;

    const students = await window.SupabaseService.getStudents(ACTIVE_ORG);
    hrStore[STUD_KEY] = students;

    const payroll = await window.SupabaseService.getPayroll(ACTIVE_ORG);
    hrStore['fg_payroll'] = payroll;
  } catch (err) {
    console.warn('[HR Supabase] Load error:', err);
  }
}`
  }
]);

// 4. Update pages/finance/finance-dashboard.html
updateFile('pages/finance/finance-dashboard.html', [
  {
    target: `    async function loadFinanceCloudData() {
      if (!window.SupabaseService) return;
      const activeOrg = localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
      try {
        const fees = await window.SupabaseService.getStudentFees(activeOrg);
        financeStore.studentFees = Array.isArray(fees) ? fees : [];

        const payroll = await window.SupabaseService.getPayroll(activeOrg);
        financeStore.payroll = Array.isArray(payroll) ? payroll : [];

        const txs = await window.SupabaseService.getTransactions(activeOrg);
        financeStore.scholarships = Array.isArray(txs) ? txs : [];

        const stream = await window.SupabaseService.getActivityStream(activeOrg);
        financeStore.audit = Array.isArray(stream) ? stream : [];
      } catch (err) {
        console.warn('[Finance Supabase] Load error:', err);
      }
    }`,
    replacement: `    async function loadFinanceCloudData() {
      if (!window.SupabaseService) return;
      let activeOrg = localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
      try {
        const orgs = await window.SupabaseService.getOrganizations();
        if (Array.isArray(orgs) && orgs.length > 0) {
          const match = orgs.find(o => (o.org_name || o.name || '').toLowerCase() === (activeOrg || '').toLowerCase());
          if (!match) {
            activeOrg = orgs[0].org_name || orgs[0].name || 'FLAWLESS GRAPHICS';
            localStorage.setItem('active_org', activeOrg);
            localStorage.setItem('activeOrg', activeOrg);
            const dispOrg = document.getElementById('displayOrg');
            if (dispOrg) dispOrg.innerHTML = '<i class="fa-solid fa-school"></i> Institution: ' + activeOrg;
            const rOrg = document.getElementById('receiptOrgTitle');
            if (rOrg) rOrg.innerText = activeOrg.toUpperCase();
          }
        }

        const fees = await window.SupabaseService.getStudentFees(activeOrg);
        financeStore.studentFees = Array.isArray(fees) ? fees : [];

        const payroll = await window.SupabaseService.getPayroll(activeOrg);
        financeStore.payroll = Array.isArray(payroll) ? payroll : [];

        const txs = await window.SupabaseService.getTransactions(activeOrg);
        financeStore.scholarships = Array.isArray(txs) ? txs : [];

        const stream = await window.SupabaseService.getActivityStream(activeOrg);
        financeStore.audit = Array.isArray(stream) ? stream : [];
      } catch (err) {
        console.warn('[Finance Supabase] Load error:', err);
      }
    }`
  }
]);

// 5. Update welcome.html
updateFile('welcome.html', [
  {
    target: `document.addEventListener("DOMContentLoaded", function() {
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
});`,
    replacement: `document.addEventListener("DOMContentLoaded", async function() {
    try {
        let cloudOrgs = [];
        if (window.SupabaseService) {
            cloudOrgs = await window.SupabaseService.getOrganizations();
        }
        const orgTitle = document.getElementById("orgTitle");
        const orgLogoBox = document.getElementById("orgLogoBox");
        const userBadge = document.getElementById("userBadge");
        const userName = document.getElementById("userName");

        const user = window.AuthSession ? window.AuthSession.getUser() : null;
        const validOrgNames = (cloudOrgs || []).map(o => (o.org_name || o.name || '').trim().toLowerCase());

        if (user && user.org && validOrgNames.includes(user.org.trim().toLowerCase())) {
            if (userName) userName.textContent = user.name || 'Administrator';
            if (userBadge) userBadge.style.display = "flex";
            if (orgTitle) orgTitle.textContent = user.org.toUpperCase();
            if (user.logo && orgLogoBox) {
                orgLogoBox.innerHTML = \`<img src="\${user.logo}" alt="\${user.org}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit;">\`;
            }
        } else if (cloudOrgs && cloudOrgs.length > 0) {
            const rootOrg = cloudOrgs[0];
            const name = (rootOrg.org_name || rootOrg.name || 'FLAWLESS GRAPHICS').toUpperCase();
            if (orgTitle) orgTitle.textContent = name;
            if (rootOrg.logo_url && orgLogoBox) {
                orgLogoBox.innerHTML = \`<img src="\${rootOrg.logo_url}" alt="\${name}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit;">\`;
            }
        } else {
            if (orgTitle) orgTitle.textContent = "ORGANIZATION PLATFORM";
        }
    } catch (e) {
        console.warn("Could not load organization session details:", e);
    }
});`
  }
]);

// 6. Update site-login.html
updateFile('site-login.html', [
  {
    target: `    const authSessionData = {
        org: 'FLAWLESS GRAPHICS',
        name: userName,
        email: email,
        role: userRole
    };`,
    replacement: `    const userOrg = (matchedUser && (matchedUser.org || matchedUser.org_id)) || 'FLAWLESS GRAPHICS';
    const authSessionData = {
        org: userOrg,
        name: userName,
        email: email,
        role: userRole
    };`
  }
]);

console.log('ALL UPDATES COMPLETE!');
