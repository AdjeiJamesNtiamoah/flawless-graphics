const fs = require('fs');
const path = 'pages/admin/admin-dashboard.html';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Centralized In-Memory Admin State (Pure Supabase System of Record)
const targetStart = `    // Boot UI
    document.addEventListener('DOMContentLoaded', () => {
      initAdminUI();
      refreshAllStats();
      logAuditAction('Portal Initialized', 'Super Admin Console loaded successfully.', 'INFO');
    });`;

const replacementStart = `    // Centralized In-Memory Admin State (Pure Supabase System of Record)
    const adminState = {
      tenants: [],
      users: [],
      teachers: [],
      students: [],
      broadcasts: [],
      auditLogs: [],
      loading: false
    };

    // Boot UI with direct Supabase Cloud calls
    document.addEventListener('DOMContentLoaded', async () => {
      await loadAllAdminData();
      initAdminUI();
      refreshAllStats();
      if (typeof logAuditAction === 'function') {
        logAuditAction('Portal Initialized', 'Super Admin Console connected to live Supabase cloud database.', 'INFO');
      }
    });

    async function loadAllAdminData() {
      if (!window.SupabaseService) return;
      adminState.loading = true;
      try {
        // 1. Organizations from Supabase
        const orgs = await window.SupabaseService.getOrganizations();
        if (Array.isArray(orgs) && orgs.length > 0) {
          adminState.tenants = orgs.map(o => ({
            name: o.org_name || o.name || 'FLAWLESS GRAPHICS',
            code: o.id || 'FG-ROOT',
            tagline: o.tagline || 'Institutional Branch',
            color: o.color || '#635bfc',
            status: o.status || 'Active'
          }));
        } else {
          // Seed root organization in Supabase if not yet provisioned
          const defOrg = { org_name: 'FLAWLESS GRAPHICS', admin_name: 'Super Admin' };
          await window.SupabaseService.saveOrganization(defOrg).catch(() => {});
          adminState.tenants = [
            { name: 'FLAWLESS GRAPHICS', code: 'FG-ROOT', tagline: 'Creative Design & Systems Architecture', color: '#635bfc', status: 'Active' }
          ];
        }

        // 2. Users from Supabase
        adminState.users = await window.SupabaseService.getUsers();

        // 3. Personnel / Teachers from Supabase
        adminState.teachers = await window.SupabaseService.getTeachers(ACTIVE_ORG);

        // 4. Students from Supabase
        adminState.students = await window.SupabaseService.getStudents(ACTIVE_ORG);

        // 5. Directives & Broadcasts from Supabase
        adminState.broadcasts = await window.SupabaseService.getAnnouncements(ACTIVE_ORG);

        // 6. Audit logs & Activity Stream from Supabase
        adminState.auditLogs = await window.SupabaseService.getActivityStream(ACTIVE_ORG);
      } catch (err) {
        console.error('Error loading Supabase admin data:', err);
      } finally {
        adminState.loading = false;
      }
    }`;

if (!content.includes(targetStart)) {
  console.error('Could not find targetStart in admin-dashboard.html');
  process.exit(1);
}

content = content.replace(targetStart, replacementStart);

// Update getTenantsList
content = content.replace(
  /function getTenantsList\(\)\s*\{[\s\S]*?return tenants;\s*\}/,
  `function getTenantsList() {
      if (adminState.tenants && adminState.tenants.length > 0) {
        return adminState.tenants;
      }
      return [
        { name: 'FLAWLESS GRAPHICS', code: 'FG-ROOT', tagline: 'Creative Design & Systems Architecture', color: '#635bfc', status: 'Active' }
      ];
    }`
);

// Update renderTenantsGrid
content = content.replace(
  /const studs = JSON\.parse\(localStorage\.getItem\(`\$\{t\.name\}_students`\) \|\| '\[\]'\);\s*const staff = JSON\.parse\(localStorage\.getItem\(`\$\{t\.name\}_teachers`\) \|\| '\[\]'\);/,
  `const studs = adminState.students.filter(s => !s.org || s.org === t.name || t.name === ACTIVE_ORG);
        const staff = adminState.teachers.filter(e => !e.org || e.org === t.name || t.name === ACTIVE_ORG);`
);

// Update refreshAllStats
content = content.replace(
  /const users = JSON\.parse\(localStorage\.getItem\('organizations_users'\) \|\| '\[\]'\);/,
  `const users = adminState.users;`
);

content = content.replace(
  /tenants\.forEach\(t => \{\s*const studs = JSON\.parse\(localStorage\.getItem\(`\$\{t\.name\}_students`\) \|\| '\[\]'\);[\s\S]*?totalSalary \+= Number\(s\.salary\) \|\| 0;\s*\}\);\s*\}\);/,
  `tenants.forEach(t => {
        const studs = adminState.students.filter(s => !s.org || s.org === t.name || t.name === ACTIVE_ORG);
        totalStudents += studs.length;

        const staff = adminState.teachers.filter(e => !e.org || e.org === t.name || t.name === ACTIVE_ORG);
        totalStaff += staff.length;
        staff.forEach(s => {
          totalSalary += Number(s.salary) || 0;
        });
      });`
);

// Update role distribution chart
content = content.replace(
  /const users = JSON\.parse\(localStorage\.getItem\('organizations_users'\) \|\| '\[\]'\);\s*let adminC = 0, hrC = 0, teachC = 0, finC = 0;/,
  `const users = adminState.users;
        let adminC = 0, hrC = 0, teachC = 0, finC = 0;`
);

// Update renderMasterUsersTable
content = content.replace(
  /function renderMasterUsersTable\(\)\s*\{\s*const users = JSON\.parse\(localStorage\.getItem\('organizations_users'\) \|\| '\[\]'\);/,
  `function renderMasterUsersTable() {
      const users = adminState.users;`
);

// Update approveUserAccount
content = content.replace(
  /function approveUserAccount\(email\) \{[\s\S]*?logAuditAction\('User Approved'/,
  `async function approveUserAccount(email) {
      const target = adminState.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
      if (!target) return;
      target.status = 'active';
      target.approvedAt = Date.now();

      if (window.SupabaseService) {
        await window.SupabaseService.saveUser(target).catch(console.warn);
      }

      logAuditAction('User Approved'`
);

// Update rejectUserAccount
content = content.replace(
  /function rejectUserAccount\(email\) \{[\s\S]*?logAuditAction\('User Rejected'/,
  `async function rejectUserAccount(email) {
      if (!confirm(\`Are you sure you want to decline registration for (\${email})?\`)) return;
      const target = adminState.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
      if (!target) return;
      target.status = 'rejected';
      target.rejectedAt = Date.now();

      if (window.SupabaseService) {
        await window.SupabaseService.saveUser(target).catch(console.warn);
      }

      logAuditAction('User Rejected'`
);

// Update openUserModal prefill
content = content.replace(
  /const users = JSON\.parse\(localStorage\.getItem\('organizations_users'\) \|\| '\[\]'\);\s*const target = users\.find/,
  `const users = adminState.users;
        const target = users.find`
);

// Update handleSaveUser
content = content.replace(
  /async function handleSaveUser\(e\) \{[\s\S]*?renderMasterUsersTable\(\);\s*refreshAllStats\(\);\s*if \(window\.Toaster\)/,
  `async function handleSaveUser(e) {
      e.preventDefault();
      const origEmail = document.getElementById('um_originalEmail').value.trim().toLowerCase();
      const name = document.getElementById('um_name').value.trim();
      const email = document.getElementById('um_email').value.trim().toLowerCase();
      const org = document.getElementById('um_org').value;
      const role = document.getElementById('um_role').value;
      const status = document.getElementById('um_status').value;
      const pass = document.getElementById('um_pass').value.trim();

      const users = adminState.users;
      if (origEmail !== email && users.some(u => (u.email || '').toLowerCase() === email)) {
        if (window.Toaster) window.Toaster.error('Email Conflict', \`An account with \${email} already exists.\`);
        return;
      }

      const payload = {
        name,
        email,
        org,
        role,
        status,
        password: pass || undefined
      };

      if (origEmail) {
        const existing = users.find(u => (u.email || '').toLowerCase() === origEmail);
        if (existing) payload.id = existing.id;
      }

      if (window.SupabaseService) {
        const saved = await window.SupabaseService.saveUser(payload);
        if (origEmail) {
          const idx = adminState.users.findIndex(u => (u.email || '').toLowerCase() === origEmail);
          if (idx !== -1) adminState.users[idx] = Object.assign({}, adminState.users[idx], payload);
        } else {
          adminState.users.unshift(saved);
        }
      }

      closeUserModal();
      renderMasterUsersTable();
      refreshAllStats();
      if (window.Toaster)`
);

// Update toggleUserStatus
content = content.replace(
  /function toggleUserStatus\(email\) \{[\s\S]*?renderMasterUsersTable\(\);/,
  `async function toggleUserStatus(email) {
      const target = adminState.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
      if (!target) return;
      target.status = target.status === 'suspended' ? 'active' : 'suspended';
      if (window.SupabaseService) {
        await window.SupabaseService.saveUser(target).catch(console.warn);
      }
      renderMasterUsersTable();`
);

// Update deleteMasterUser
content = content.replace(
  /function deleteMasterUser\(email\) \{[\s\S]*?renderMasterUsersTable\(\);/,
  `async function deleteMasterUser(email) {
      if (!confirm(\`Are you sure you want to permanently delete user account (\${email})?\`)) return;
      const target = adminState.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
      if (target && window.SupabaseService) {
        await window.SupabaseService.deleteUser(target.id).catch(console.warn);
      }
      adminState.users = adminState.users.filter(u => (u.email || '').toLowerCase() !== email.toLowerCase());
      renderMasterUsersTable();`
);

// Update syncAllStaffLogins
content = content.replace(
  /function syncAllStaffLogins\(\) \{[\s\S]*?if \(count > 0\) \{/,
  `async function syncAllStaffLogins() {
      const tenants = getTenantsList();
      let users = adminState.users;
      let count = 0;

      for (const t of tenants) {
        const staff = (window.SupabaseService ? await window.SupabaseService.getTeachers(t.name) : adminState.teachers) || [];
        for (const s of staff) {
          if (!s.email) continue;
          const sEmail = s.email.trim().toLowerCase();
          if (!users.some(u => (u.email || '').toLowerCase() === sEmail)) {
            const pos = (s.position || s.role || '').toLowerCase();
            let r = 'teacher';
            if (pos.includes('director') || pos.includes('head') || pos.includes('admin')) r = 'admin';
            else if (pos.includes('hr')) r = 'hr';
            else if (pos.includes('finance') || pos.includes('account')) r = 'finance';

            const newUser = {
              org: t.name,
              name: s.name || s.fullName || sEmail.split('@')[0],
              email: sEmail,
              role: r,
              status: 'active',
              password: 'Flawless@2026'
            };
            if (window.SupabaseService) {
              const saved = await window.SupabaseService.saveUser(newUser).catch(() => null);
              if (saved) users.push(saved);
            } else {
              users.push(newUser);
            }
            count++;
          }
        }
      }

      if (count > 0) {`
);

// Update handleSaveTenant
content = content.replace(
  /function handleSaveTenant\(e\) \{[\s\S]*?renderTenantsGrid\(\);/,
  `async function handleSaveTenant(e) {
      e.preventDefault();
      const name = document.getElementById('tm_name').value.trim().toUpperCase();
      const code = document.getElementById('tm_code').value.trim().toUpperCase();
      const color = document.getElementById('tm_color').value;
      const tagline = document.getElementById('tm_tagline').value.trim();

      let tenants = getTenantsList();
      if (tenants.some(t => t.name === name)) {
        if (window.Toaster) window.Toaster.warning('Tenant Exists', \`Organization \${name} is already registered.\`);
        return;
      }

      const newTenant = { name, code, color, tagline, status: 'Active' };
      if (window.SupabaseService) {
        await window.SupabaseService.saveOrganization({ org_name: name, admin_name: 'Super Admin' }).catch(console.warn);
      }
      adminState.tenants.push(newTenant);
      closeTenantModal();
      renderTenantsGrid();`
);

// Update audit logs
content = content.replace(
  /function getAuditLogs\(\) \{\s*return JSON\.parse\(localStorage\.getItem\('system_audit_logs'\) \|\| '\[\]'\);\s*\}/,
  `function getAuditLogs() {
      return adminState.auditLogs || [];
    }`
);

content = content.replace(
  /function logAuditAction\(action, details, severity = 'INFO'\) \{[\s\S]*?renderAuditLogs\(\);\s*\}/,
  `function logAuditAction(action, details, severity = 'INFO') {
      const newEntry = {
        id: 'aud_' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        operator: user ? user.name : 'Super Admin',
        action,
        details,
        severity
      };
      adminState.auditLogs.unshift(newEntry);
      if (window.SupabaseService) {
        window.SupabaseService.logActivity(ACTIVE_ORG, {
          type: 'AUDIT',
          text: \`\${action}: \${details}\`,
          role: 'Super Admin',
          severity
        }).catch(() => {});
      }
      renderAuditLogs();
    }`
);

content = content.replace(
  /function clearAuditLogs\(\) \{[\s\S]*?renderAuditLogs\(\);/,
  `function clearAuditLogs() {
      if (!confirm('Clear all recorded system audit logs?')) return;
      adminState.auditLogs = [];
      renderAuditLogs();`
);

// Update renderAdminBroadcasts
content = content.replace(
  /function renderAdminBroadcasts\(\) \{\s*const annKey = `\$\{ACTIVE_ORG\}_announcements`;\s*const ann = safeParse\(localStorage\.getItem\(annKey\)\) \|\| \[\];/,
  `function renderAdminBroadcasts() {
      const ann = adminState.broadcasts || [];`
);

// Update handleAdminPublishBroadcast
content = content.replace(
  /function handleAdminPublishBroadcast\(e\) \{[\s\S]*?renderAdminBroadcasts\(\);/,
  `async function handleAdminPublishBroadcast(e) {
      if (e) e.preventDefault();
      const title = document.getElementById('adm_bcTitle')?.value.trim();
      const category = document.getElementById('adm_bcCategory')?.value || 'Urgent';
      const priority = document.getElementById('adm_bcPriority')?.value || 'High';
      const tenantMode = document.getElementById('adm_bcTenant')?.value || 'active';
      const body = document.getElementById('adm_bcBody')?.value.trim();
      const pinned = document.getElementById('adm_bcPinned')?.checked || true;

      if (!title || !body) return;

      const newBc = {
        title: title,
        body: body,
        text: body,
        author: 'Super Administrator',
        role: 'admin',
        category: category,
        priority: priority,
        pinned: pinned
      };

      if (window.SupabaseService) {
        const saved = await window.SupabaseService.saveAnnouncement(ACTIVE_ORG, newBc);
        adminState.broadcasts.unshift(saved || newBc);
      } else {
        adminState.broadcasts.unshift(newBc);
      }

      document.getElementById('adminBroadcastForm')?.reset();
      renderAdminBroadcasts();`
);

// Update toggleAdminPinBroadcast and deleteAdminBroadcast
content = content.replace(
  /function toggleAdminPinBroadcast\(id\) \{[\s\S]*?renderAdminBroadcasts\(\);\s*\}\s*\}/,
  `async function toggleAdminPinBroadcast(id) {
      const target = adminState.broadcasts.find(a => String(a.id) === String(id));
      if (target) {
        target.pinned = !target.pinned;
        if (window.SupabaseService) {
          await window.SupabaseService.saveAnnouncement(ACTIVE_ORG, target).catch(console.warn);
        }
        renderAdminBroadcasts();
      }
    }`
);

content = content.replace(
  /function deleteAdminBroadcast\(id\) \{[\s\S]*?renderAdminBroadcasts\(\);\s*\}/,
  `async function deleteAdminBroadcast(id) {
      if (window.SupabaseService) {
        await window.SupabaseService.deleteAnnouncement(ACTIVE_ORG, id).catch(console.warn);
      }
      adminState.broadcasts = adminState.broadcasts.filter(a => String(a.id) !== String(id));
      renderAdminBroadcasts();
    }`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully migrated admin-dashboard.html to pure Supabase data access!');
