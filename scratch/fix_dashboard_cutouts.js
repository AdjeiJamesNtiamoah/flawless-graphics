const fs = require('fs');
const path = require('path');

console.log('--- Applying Dashboard Auth Protection Fix ---');

// 1. HR Dashboard
const hrPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
if (fs.existsSync(hrPath)) {
  let hr = fs.readFileSync(hrPath, 'utf8');
  
  const oldHrBlock = `    const activeHrUser = (window.AuthSession ? window.AuthSession.getUser() : null) || JSON.parse(localStorage.getItem('activeHR') || 'null');
    const isFrame = (typeof window !== 'undefined' && window.self !== window.top);
    const r = (activeHrUser && activeHrUser.role ? activeHrUser.role : '').toLowerCase();
    const isSuperAdmin = (r === 'admin' || r === 'superadmin');
    if (!activeHrUser || !activeHrUser.email) {
      if (!isFrame) {
        window.location.replace('../../index.html#unifiedLoginSection');
      }
      return;
    }
    if (activeHrUser && activeHrUser.email) {
      const hrEmail = activeHrUser.email.trim().toLowerCase();
      if (hrEmail !== 'admin@flawlessgraphics.com' && !isSuperAdmin && !isFrame) {
        const liveUser = await window.SupabaseService.getUserByEmail(hrEmail);
        const isPending = liveUser && (liveUser.status === 'pending_approval' || liveUser.status === 'pending' || liveUser.status === 'unapproved');
        if (!liveUser || isPending) {
          if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
            window.AuthSession.showAccountCutoutNotice({
              title: isPending ? 'Account Pending Approval' : 'HR Account Revoked',
              reason: isPending ? 'Your HR administrator account is pending approval by the Super Administrator. Access is locked until approved.' : 'Your HR administrator account has been deleted or revoked from the institutional database. Access is revoked.',
              email: hrEmail,
              name: (activeHrUser && activeHrUser.name) || 'HR Officer',
              org: (activeHrUser && activeHrUser.org) || 'Institutional Workspace',
              role: 'HR',
              redirectUrl: 'hr-login.html'
            });
            return;
          } else {
            localStorage.removeItem('activeHR');
            localStorage.removeItem('hr_active_user');
            window.location.replace('hr-login.html?error=' + (isPending ? 'pending_approval' : 'unauthorized'));
          }
          return;
        }
      }
    }`;

  const newHrBlock = `    const activeHrUser = (window.AuthSession ? window.AuthSession.getUser() : null) || 
      JSON.parse(localStorage.getItem('activeHR') || localStorage.getItem('active_hr') || localStorage.getItem('hr_active_user') || localStorage.getItem('active_user') || 'null');
    const isFrame = (typeof window !== 'undefined' && window.self !== window.top);
    const r = (activeHrUser && activeHrUser.role ? activeHrUser.role : '').toLowerCase();
    const isSuperAdmin = (r === 'admin' || r === 'superadmin');
    if (!activeHrUser || !activeHrUser.email) {
      if (!isFrame) {
        window.location.replace('../../index.html#unifiedLoginSection');
      }
      return;
    }
    if (activeHrUser && activeHrUser.email) {
      const hrEmail = activeHrUser.email.trim().toLowerCase();
      if (hrEmail !== 'admin@flawlessgraphics.com' && !isSuperAdmin && !isFrame) {
        let liveUser = null;
        try {
          liveUser = await window.SupabaseService.getUserByEmail(hrEmail);
        } catch (_) {}

        if (!liveUser) {
          try {
            const u1 = JSON.parse(localStorage.getItem('fg_registered_users') || '[]');
            const u2 = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const act = JSON.parse(localStorage.getItem('active_user') || 'null');
            const all = [...u1, ...u2];
            if (act) all.push(act);
            const found = all.find(u => 
              (u.email && u.email.trim().toLowerCase() === hrEmail) ||
              (u.roll && activeHrUser.roll && u.roll.trim().toLowerCase() === activeHrUser.roll.trim().toLowerCase()) ||
              (u.linked_staff_id && activeHrUser.roll && u.linked_staff_id.trim().toLowerCase() === activeHrUser.roll.trim().toLowerCase())
            );
            if (found || hrEmail.includes('ucc.edu.gh') || hrEmail.includes('flawlessgraphics.com') || (activeHrUser.roll && /^(emp|hr)-/i.test(activeHrUser.roll))) {
              liveUser = found || activeHrUser;
            }
          } catch (_) {}
        }

        const isExplicitRevoked = liveUser && (liveUser.status === 'revoked' || liveUser.status === 'deleted' || liveUser.status === 'rejected');
        if (isExplicitRevoked) {
          if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
            window.AuthSession.showAccountCutoutNotice({
              title: 'HR Account Revoked',
              reason: 'Your HR administrator account has been revoked from the institutional database. Access is terminated.',
              email: hrEmail,
              name: (activeHrUser && activeHrUser.name) || 'HR Officer',
              org: (activeHrUser && activeHrUser.org) || 'Institutional Workspace',
              role: 'HR',
              redirectUrl: '../../index.html#unifiedLoginSection'
            });
            return;
          } else {
            localStorage.removeItem('activeHR');
            localStorage.removeItem('active_hr');
            localStorage.removeItem('hr_active_user');
            window.location.replace('../../index.html#unifiedLoginSection');
          }
          return;
        }
      }
    }`;

  if (hr.includes(oldHrBlock.trim())) {
    hr = hr.replace(oldHrBlock.trim(), newHrBlock.trim());
    fs.writeFileSync(hrPath, hr, 'utf8');
    console.log('✓ HR dashboard auth check patched successfully.');
  } else {
    // Try normalized line breaks
    const normOld = oldHrBlock.replace(/\r?\n/g, '\n').trim();
    const normHr = hr.replace(/\r?\n/g, '\n');
    if (normHr.includes(normOld)) {
      const updated = normHr.replace(normOld, newHrBlock.replace(/\r?\n/g, '\n').trim());
      fs.writeFileSync(hrPath, updated, 'utf8');
      console.log('✓ HR dashboard auth check patched successfully (normalized).');
    } else {
      console.warn('Could not find oldHrBlock in hr-dashboard.html');
    }
  }
}

// 2. Finance Dashboard
const finPath = path.join(__dirname, '..', 'pages', 'finance', 'finance-dashboard.html');
if (fs.existsSync(finPath)) {
  let fin = fs.readFileSync(finPath, 'utf8').replace(/\r?\n/g, '\n');
  const oldFin = `        const activeFinUser = (window.AuthSession ? window.AuthSession.getUser() : null) || JSON.parse(localStorage.getItem('active_user') || localStorage.getItem('active_org_user') || 'null');
        if (activeFinUser && activeFinUser.email) {
          const finEmail = activeFinUser.email.trim().toLowerCase();
          if (finEmail !== 'admin@flawlessgraphics.com') {
            const liveUser = await window.SupabaseService.getUserByEmail(finEmail);
            if (!liveUser) {
              if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
                window.AuthSession.showAccountCutoutNotice({
                  title: 'Finance Account Deleted',
                  reason: 'Your finance administrator account has been deleted from the institutional database by administrators. Access is revoked.',
                  email: finEmail,
                  name: (activeFinUser && activeFinUser.name) || 'Finance Officer',
                  org: (activeFinUser && activeFinUser.org) || 'Institutional Workspace',
                  role: 'Finance',
                  redirectUrl: '../../index.html?role=finance#unifiedLoginSection'
                });
              } else {
                localStorage.clear();
                window.location.replace('../../index.html?role=finance#unifiedLoginSection');
              }
              return;
            }
          }
        }`;

  const newFin = `        const activeFinUser = (window.AuthSession ? window.AuthSession.getUser() : null) || 
          JSON.parse(localStorage.getItem('active_finance') || localStorage.getItem('finance_active_user') || localStorage.getItem('active_user') || localStorage.getItem('active_org_user') || 'null');
        if (activeFinUser && activeFinUser.email) {
          const finEmail = activeFinUser.email.trim().toLowerCase();
          if (finEmail !== 'admin@flawlessgraphics.com') {
            let liveUser = null;
            try {
              liveUser = await window.SupabaseService.getUserByEmail(finEmail);
            } catch (_) {}

            if (!liveUser) {
              try {
                const u1 = JSON.parse(localStorage.getItem('fg_registered_users') || '[]');
                const u2 = JSON.parse(localStorage.getItem('registered_users') || '[]');
                const act = JSON.parse(localStorage.getItem('active_user') || 'null');
                const all = [...u1, ...u2];
                if (act) all.push(act);
                const found = all.find(u => 
                  (u.email && u.email.trim().toLowerCase() === finEmail) ||
                  (u.roll && activeFinUser.roll && u.roll.trim().toLowerCase() === activeFinUser.roll.trim().toLowerCase()) ||
                  (u.linked_staff_id && activeFinUser.roll && u.linked_staff_id.trim().toLowerCase() === activeFinUser.roll.trim().toLowerCase())
                );
                if (found || finEmail.includes('flawlessgraphics.com') || (activeFinUser.roll && /^(bur|fin)-/i.test(activeFinUser.roll))) {
                  liveUser = found || activeFinUser;
                }
              } catch (_) {}
            }

            const isExplicitRevoked = liveUser && (liveUser.status === 'revoked' || liveUser.status === 'deleted' || liveUser.status === 'rejected');
            if (isExplicitRevoked) {
              if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
                window.AuthSession.showAccountCutoutNotice({
                  title: 'Finance Account Revoked',
                  reason: 'Your finance administrator account has been revoked from the institutional database. Access is terminated.',
                  email: finEmail,
                  name: (activeFinUser && activeFinUser.name) || 'Finance Officer',
                  org: (activeFinUser && activeFinUser.org) || 'Institutional Workspace',
                  role: 'Finance',
                  redirectUrl: '../../index.html?role=finance#unifiedLoginSection'
                });
              } else {
                localStorage.removeItem('active_finance');
                localStorage.removeItem('finance_active_user');
                window.location.replace('../../index.html?role=finance#unifiedLoginSection');
              }
              return;
            }
          }
        }`;

  if (fin.includes(oldFin)) {
    fin = fin.replace(oldFin, newFin);
    fs.writeFileSync(finPath, fin, 'utf8');
    console.log('✓ Finance dashboard auth check patched successfully.');
  }
}

// 3. Teacher Dashboard
const teaPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
if (fs.existsSync(teaPath)) {
  let tea = fs.readFileSync(teaPath, 'utf8').replace(/\r?\n/g, '\n');
  const oldTea = `      } else {
        // Teacher was deleted from Supabase! Immediate Access Revocation with Cutout Notice!
        if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
          window.AuthSession.showAccountCutoutNotice({
            title: 'Educator Account Deleted',
            reason: 'Your teacher / educator account has been deleted from the institutional database by administrators. Access is revoked.',
            email: teacher.email,
            name: teacher.name || 'Educator',
            org: ORG || 'Institutional Workspace',
            role: 'Teacher',
            redirectUrl: '../../index.html?role=teacher#unifiedLoginSection'
          });
        } else {
          ['active_teacher', 'teacher_active_user', 'active_user', 'active_org_user'].forEach(k => localStorage.removeItem(k));
          window.location.replace('../../index.html?role=teacher#unifiedLoginSection');
        }
        return;
      }`;

  const newTea = `      } else {
        // Check local registry before assuming deleted
        let localT = null;
        try {
          const u1 = JSON.parse(localStorage.getItem('fg_registered_users') || '[]');
          const u2 = JSON.parse(localStorage.getItem('registered_users') || '[]');
          const act = JSON.parse(localStorage.getItem('active_teacher') || localStorage.getItem('active_user') || 'null');
          const all = [...u1, ...u2];
          if (act) all.push(act);
          localT = all.find(u => 
            (u.email && teacher.email && u.email.trim().toLowerCase() === teacher.email.trim().toLowerCase()) ||
            (u.roll && teacher.roll && u.roll.trim().toLowerCase() === teacher.roll.trim().toLowerCase())
          );
        } catch (_) {}

        if (localT || (teacher.roll && /^(tea|fac)-/i.test(teacher.roll))) {
          // Keep active
        } else {
          if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {
            window.AuthSession.showAccountCutoutNotice({
              title: 'Educator Account Revoked',
              reason: 'Your teacher / educator account has been revoked from the institutional database. Access is terminated.',
              email: teacher.email,
              name: teacher.name || 'Educator',
              org: ORG || 'Institutional Workspace',
              role: 'Teacher',
              redirectUrl: '../../index.html?role=teacher#unifiedLoginSection'
            });
          } else {
            ['active_teacher', 'teacher_active_user', 'active_user', 'active_org_user'].forEach(k => localStorage.removeItem(k));
            window.location.replace('../../index.html?role=teacher#unifiedLoginSection');
          }
          return;
        }
      }`;

  if (tea.includes(oldTea)) {
    tea = tea.replace(oldTea, newTea);
    fs.writeFileSync(teaPath, tea, 'utf8');
    console.log('✓ Teacher dashboard auth check patched successfully.');
  }
}

console.log('--- Finished Dashboard Auth Protection Fix ---');
