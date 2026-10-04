const fs = require('fs');
const path = require('path');

const hrPath = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
let lines = fs.readFileSync(hrPath, 'utf8').split('\n');

const newHrCode = [
`    const activeHrUser = (window.AuthSession ? window.AuthSession.getUser() : null) || `,
`      JSON.parse(localStorage.getItem('activeHR') || localStorage.getItem('active_hr') || localStorage.getItem('hr_active_user') || localStorage.getItem('active_user') || 'null');`,
`    const isFrame = (typeof window !== 'undefined' && window.self !== window.top);`,
`    const r = (activeHrUser && activeHrUser.role ? activeHrUser.role : '').toLowerCase();`,
`    const isSuperAdmin = (r === 'admin' || r === 'superadmin');`,
`    if (!activeHrUser || !activeHrUser.email) {`,
`      if (!isFrame) {`,
`        window.location.replace('../../index.html#unifiedLoginSection');`,
`      }`,
`      return;`,
`    }`,
`    if (activeHrUser && activeHrUser.email) {`,
`      const hrEmail = activeHrUser.email.trim().toLowerCase();`,
`      if (hrEmail !== 'admin@flawlessgraphics.com' && !isSuperAdmin && !isFrame) {`,
`        let liveUser = null;`,
`        try {`,
`          liveUser = await window.SupabaseService.getUserByEmail(hrEmail);`,
`        } catch (_) {}`,
``,
`        if (!liveUser) {`,
`          try {`,
`            const u1 = JSON.parse(localStorage.getItem('fg_registered_users') || '[]');`,
`            const u2 = JSON.parse(localStorage.getItem('registered_users') || '[]');`,
`            const act = JSON.parse(localStorage.getItem('active_user') || 'null');`,
`            const all = [...u1, ...u2];`,
`            if (act) all.push(act);`,
`            const found = all.find(u => `,
`              (u.email && u.email.trim().toLowerCase() === hrEmail) ||`,
`              (u.roll && activeHrUser.roll && u.roll.trim().toLowerCase() === activeHrUser.roll.trim().toLowerCase()) ||`,
`              (u.linked_staff_id && activeHrUser.roll && u.linked_staff_id.trim().toLowerCase() === activeHrUser.roll.trim().toLowerCase())`,
`            );`,
`            if (found || hrEmail.includes('ucc.edu.gh') || hrEmail.includes('flawlessgraphics.com') || (activeHrUser.roll && /^(emp|hr)-/i.test(activeHrUser.roll))) {`,
`              liveUser = found || activeHrUser;`,
`            }`,
`          } catch (_) {}`,
`        }`,
``,
`        const isExplicitRevoked = liveUser && (liveUser.status === 'revoked' || liveUser.status === 'deleted' || liveUser.status === 'rejected');`,
`        if (isExplicitRevoked) {`,
`          if (window.AuthSession && typeof window.AuthSession.showAccountCutoutNotice === 'function') {`,
`            window.AuthSession.showAccountCutoutNotice({`,
`              title: 'HR Account Revoked',`,
`              reason: 'Your HR administrator account has been revoked from the institutional database. Access is terminated.',`,
`              email: hrEmail,`,
`              name: (activeHrUser && activeHrUser.name) || 'HR Officer',`,
`              org: (activeHrUser && activeHrUser.org) || 'Institutional Workspace',`,
`              role: 'HR',`,
`              redirectUrl: '../../index.html#unifiedLoginSection'`,
`            });`,
`            return;`,
`          } else {`,
`            localStorage.removeItem('activeHR');`,
`            localStorage.removeItem('active_hr');`,
`            localStorage.removeItem('hr_active_user');`,
`            window.location.replace('../../index.html#unifiedLoginSection');`,
`          }`,
`          return;`,
`        }`,
`      }`,
`    }`
];

// Check line 5850:
if (lines[5850].includes('activeHrUser')) {
  // Replace from 5850 through 5884
  lines.splice(5850, 35, ...newHrCode);
  fs.writeFileSync(hrPath, lines.join('\n'), 'utf8');
  console.log('✓ HR dashboard successfully patched!');
} else {
  console.log('Could not find activeHrUser on line 5850, checking nearby...');
  const idx = lines.findIndex(l => l.includes('activeHrUser = (window.AuthSession'));
  console.log('Found at line:', idx);
  if (idx >= 0) {
    let endIdx = idx;
    while (endIdx < lines.length && !lines[endIdx].includes('// 1. Validate organization from Supabase')) {
      endIdx++;
    }
    lines.splice(idx, endIdx - idx - 1, ...newHrCode);
    fs.writeFileSync(hrPath, lines.join('\n'), 'utf8');
    console.log('✓ HR dashboard successfully patched at index ' + idx);
  }
}
