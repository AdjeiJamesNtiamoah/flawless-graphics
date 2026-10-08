const fs = require('fs');

// =========================================================================
// 1. UPDATE assets/js/supabase-client.js
// =========================================================================
let scCode = fs.readFileSync('assets/js/supabase-client.js', 'utf8');

// Replace getTeachers implementation with dual-source (teachers + users) self-healing query
const oldGetTeachersRegex = /async getTeachers\(orgId = 'FLAWLESS GRAPHICS'\)\s*\{[\s\S]*?async saveTeacher/;

const newGetTeachersCode = `async getTeachers(orgId = null) {
      try {
        let targetOrg = orgId;
        if (!targetOrg || targetOrg === 'all') {
          targetOrg = (window.AuthSession ? (window.AuthSession.getUser()?.org || localStorage.getItem('active_org')) : localStorage.getItem('active_org')) || null;
        }

        // 1. Query teachers table
        let teacherEndpoint = 'teachers?order=created_at.desc';
        if (targetOrg && targetOrg !== 'all') {
          teacherEndpoint = \`teachers?or=(org_id.eq.\${encodeURIComponent(targetOrg)},org_id.ilike.\${encodeURIComponent(targetOrg)})&order=created_at.desc\`;
        }
        const teacherData = await this.query(teacherEndpoint).catch(() => []);

        // 2. Query users table for all registered teachers/educators/faculty
        let userEndpoint = 'users?or=(role.eq.teacher,role.eq.educator,role.eq.faculty)&order=created_at.desc';
        if (targetOrg && targetOrg !== 'all') {
          userEndpoint = \`users?and=(or(role.eq.teacher,role.eq.educator,role.eq.faculty),or(org.eq.\${encodeURIComponent(targetOrg)},org.ilike.\${encodeURIComponent(targetOrg)}))&order=created_at.desc\`;
        }
        const userData = await this.query(userEndpoint).catch(() => []);

        // 3. Merge, deduplicate, and auto-sync
        const teacherMap = new Map();

        if (Array.isArray(teacherData)) {
          teacherData.forEach(e => {
            const key = (e.email || e.id || '').trim().toLowerCase();
            if (!key) return;
            teacherMap.set(key, {
              id: e.id,
              fullName: e.full_name || e.name || 'Faculty Member',
              name: e.full_name || e.name || 'Faculty Member',
              department: e.department || e.dept || 'Academic Staff',
              dept: e.department || e.dept || 'Academic Staff',
              position: e.position || e.role || 'Educator',
              role: e.position || e.role || 'Educator',
              email: e.email || '',
              phone: e.phone || '',
              salary: Number(e.salary || 4800),
              status: e.status || 'Active',
              photo: e.photo_url || e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              photo_url: e.photo_url || e.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              org: e.org_id || targetOrg,
              org_id: e.org_id || targetOrg,
              linked_staff_id: e.linked_staff_id || e.id,
              created_at: e.created_at
            });
          });
        }

        if (Array.isArray(userData)) {
          for (const u of userData) {
            const key = (u.email || u.id || '').trim().toLowerCase();
            if (!key) continue;
            const uStat = (u.status || 'active').toLowerCase();
            const isApproved = uStat === 'active' || uStat === 'approved' || (u.approved_by && uStat !== 'rejected' && uStat !== 'pending_approval');

            const existing = teacherMap.get(key);
            if (!existing && isApproved) {
              const mapped = {
                id: u.linked_staff_id || u.id,
                fullName: u.name || u.fullName || 'Faculty Member',
                name: u.name || u.fullName || 'Faculty Member',
                department: u.department || 'Academic Staff',
                dept: u.department || 'Academic Staff',
                position: u.designation || 'Educator',
                role: u.designation || 'Educator',
                email: u.email || '',
                phone: u.phone || '',
                salary: Number(u.salary || 4800),
                status: 'Active',
                photo: u.photo_url || u.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                photo_url: u.photo_url || u.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                org: u.org || targetOrg,
                org_id: u.org || targetOrg,
                linked_staff_id: u.linked_staff_id || u.roll || u.id,
                created_at: u.created_at
              };
              teacherMap.set(key, mapped);

              // Auto-sync into teachers table in Supabase in background
              this.query('teachers', 'POST', {
                id: mapped.id,
                org_id: mapped.org_id,
                full_name: mapped.name,
                name: mapped.name,
                department: mapped.dept,
                position: mapped.role,
                role: mapped.role,
                email: mapped.email,
                phone: mapped.phone,
                salary: mapped.salary,
                status: 'Active',
                photo_url: mapped.photo_url
              }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' }).catch(() => {});
            } else if (existing && isApproved) {
              existing.status = 'Active';
              if (u.name) { existing.fullName = u.name; existing.name = u.name; }
              if (u.photo_url) { existing.photo = u.photo_url; existing.photo_url = u.photo_url; }
              if (u.linked_staff_id) { existing.linked_staff_id = u.linked_staff_id; }
            }
          }
        }

        const result = Array.from(teacherMap.values());

        // Cache in local storage for instant offline display
        if (targetOrg) {
          try {
            localStorage.setItem(\`\${targetOrg}_teachers\`, JSON.stringify(result));
            localStorage.setItem('fg_teachers', JSON.stringify(result));
          } catch (_) {}
        }

        return result;
      } catch (err) {
        console.error('[Supabase] Failed to fetch teachers:', err.message);
        try {
          const targetOrg = orgId || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
          return JSON.parse(localStorage.getItem(\`\${targetOrg}_teachers\`) || '[]');
        } catch (_) {
          return [];
        }
      }
    }

    async saveTeacher`;

if (oldGetTeachersRegex.test(scCode)) {
  scCode = scCode.replace(oldGetTeachersRegex, newGetTeachersCode);
  console.log('Updated getTeachers in supabase-client.js');
} else {
  console.warn('Could not match old getTeachers regex, checking alternatives...');
}

// Update getPendingTeachers
const oldPendingRegex = /async getPendingTeachers\(orgId = null\)\s*\{[\s\S]*?async approveTeacher/;
const newPendingCode = `async getPendingTeachers(orgId = null) {
      try {
        let targetOrg = orgId;
        if (!targetOrg || targetOrg === 'all') {
          targetOrg = (window.AuthSession ? (window.AuthSession.getUser()?.org || localStorage.getItem('active_org')) : localStorage.getItem('active_org')) || null;
        }

        // 1. Query users with pending_approval role teacher
        let uEndpoint = 'users?status=eq.pending_approval&or=(role.eq.teacher,role.eq.educator,role.eq.faculty)&order=created_at.desc';
        if (targetOrg && targetOrg !== 'all') {
          uEndpoint = \`users?and=(status.eq.pending_approval,or(role.eq.teacher,role.eq.educator,role.eq.faculty),or(org.eq.\${encodeURIComponent(targetOrg)},org.ilike.\${encodeURIComponent(targetOrg)}))&order=created_at.desc\`;
        }
        const uPending = await this.query(uEndpoint).catch(() => []);

        // 2. Query teachers table with pending_approval
        let tEndpoint = 'teachers?status=eq.pending_approval&order=created_at.desc';
        if (targetOrg && targetOrg !== 'all') {
          tEndpoint = \`teachers?or=(org_id.eq.\${encodeURIComponent(targetOrg)},org_id.ilike.\${encodeURIComponent(targetOrg)})&status=eq.pending_approval&order=created_at.desc\`;
        }
        const tPending = await this.query(tEndpoint).catch(() => []);

        const map = new Map();
        [...tPending, ...uPending].forEach(item => {
          const key = (item.email || item.id || '').trim().toLowerCase();
          if (key && !map.has(key)) {
            map.set(key, {
              id: item.id || item.linked_staff_id,
              name: item.name || item.fullName || item.full_name,
              fullName: item.name || item.fullName || item.full_name,
              email: item.email,
              phone: item.phone || '',
              role: item.role || item.position || 'Educator',
              org: item.org || item.org_id || targetOrg,
              org_id: item.org || item.org_id || targetOrg,
              status: 'pending_approval',
              created_at: item.created_at
            });
          }
        });
        return Array.from(map.values());
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending teachers:', err.message);
        return [];
      }
    }

    async approveTeacher`;

if (oldPendingRegex.test(scCode)) {
  scCode = scCode.replace(oldPendingRegex, newPendingCode);
  console.log('Updated getPendingTeachers in supabase-client.js');
}

// In approveUser: allow Super Admin or HR to approve, and auto-insert into teachers table
scCode = scCode.replace(
  `if (isSuperAdminApprover && isTeacherOrFinance) {\n            throw new Error('Super Admin is not authorized to approve Teacher or Finance registrations. Approval must be conducted by the Human Resources Directorate.');\n          }`,
  `// Both Super Admin and HR are authorized to approve staff registrations\n          // (Allows executive oversight and campus onboarding)`
);
scCode = scCode.replace(
  `if (userRole === 'teacher' || userRole === 'finance' || userRole === 'educator' || userRole === 'bursar') {\n            throw new Error('Teacher and Finance registrations must be approved strictly by the Human Resources (HR) Directorate.');\n          }`,
  `// Both Super Admin and HR are authorized to approve staff registrations`
);

// Ensure approveUser upserts into teachers table
const approveUpsertOld = `if (r === 'teacher' || r === 'educator' || r === 'faculty') {\n            await this.query(\`teachers?email=eq.\${encodeURIComponent(u.email)}\`, 'PATCH', {\n              status: 'Active',\n              updated_at: new Date().toISOString()\n            }).catch(() => {});\n          }`;

const approveUpsertNew = `if (r === 'teacher' || r === 'educator' || r === 'faculty') {
            const tchPayload = {
              id: u.linked_staff_id || u.id || ('tch_' + Date.now()),
              org_id: u.org || 'FLAWLESS GRAPHICS',
              full_name: u.name,
              name: u.name,
              department: u.department || 'Academic Staff',
              position: u.designation || 'Educator',
              role: 'Educator',
              email: u.email,
              phone: u.phone || '',
              salary: Number(u.salary || 4800),
              status: 'Active',
              photo_url: u.photo_url || null,
              created_at: u.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            await this.query('teachers', 'POST', tchPayload, {
              'Prefer': 'resolution=merge-duplicates,return=representation'
            }).catch(() => {
              return this.query(\`teachers?email=eq.\${encodeURIComponent(u.email)}\`, 'PATCH', { status: 'Active' });
            });
          }`;

if (scCode.includes(`if (r === 'teacher' || r === 'educator' || r === 'faculty')`)) {
  scCode = scCode.replace(approveUpsertOld, approveUpsertNew);
  console.log('Updated approveUser teacher upsert in supabase-client.js');
}

fs.writeFileSync('assets/js/supabase-client.js', scCode, 'utf8');
console.log('Saved assets/js/supabase-client.js successfully!');

// =========================================================================
// 2. UPDATE pages/hr/teacher.html TO LOAD SUPABASE TEACHERS
// =========================================================================
let hrTeacherHtml = fs.readFileSync('pages/hr/teacher.html', 'utf8');

// Update init script in pages/hr/teacher.html
const oldHrInit = `    // 3. Render Table
    function renderTable(list = null) {`;

const newHrInit = `    // 2.5 Cloud Supabase Fetch Engine
    async function fetchCloudTeachers() {
      if (window.SupabaseService && typeof window.SupabaseService.getTeachers === 'function') {
        try {
          const cloudList = await window.SupabaseService.getTeachers(activeOrg);
          if (Array.isArray(cloudList) && cloudList.length > 0) {
            localStorage.setItem(EMP_KEY, JSON.stringify(cloudList));
            return cloudList;
          }
        } catch(e) {
          console.warn('[Teacher Page] Cloud fetch note:', e.message);
        }
      }
      return getTeachers();
    }

    // 3. Render Table
    function renderTable(list = null) {`;

if (!hrTeacherHtml.includes('fetchCloudTeachers')) {
  hrTeacherHtml = hrTeacherHtml.replace(oldHrInit, newHrInit);
}

// In pages/hr/teacher.html, call fetchCloudTeachers on init and update
hrTeacherHtml = hrTeacherHtml.replace(
  `// Initial Render\n    renderTable();\n    updateDeptDropdown();\n    updateKPIs();`,
  `// Initial Render with live cloud data\n    (async function init() {\n      const teachers = await fetchCloudTeachers();\n      renderTable(teachers);\n      updateDeptDropdown();\n      updateKPIs();\n    })();\n\n    // Auto-refresh when real-time updates arrive\n    window.addEventListener('fg:realtime-change', async (e) => {\n      if (e.detail && (e.detail.table === 'teachers' || e.detail.table === 'users')) {\n        const updated = await fetchCloudTeachers();\n        renderTable(updated);\n        updateDeptDropdown();\n        updateKPIs();\n      }\n    });`
);

// In saveTeacherModalForm in pages/hr/teacher.html: also sync to Supabase
const oldSaveModal = `saveTeachers(list);\n      closeModal();`;
const newSaveModal = `saveTeachers(list);
      if (window.SupabaseService && typeof window.SupabaseService.saveTeacher === 'function') {
        window.SupabaseService.saveTeacher(activeOrg, emp).catch(console.warn);
      }
      closeModal();`;

if (hrTeacherHtml.includes(oldSaveModal)) {
  hrTeacherHtml = hrTeacherHtml.replace(oldSaveModal, newSaveModal);
}

fs.writeFileSync('pages/hr/teacher.html', hrTeacherHtml, 'utf8');
console.log('Saved pages/hr/teacher.html successfully!');

// =========================================================================
// 3. UPDATE pages/teacher/teacher-dashboard.html ROUTE GUARD
// =========================================================================
let tdHtml = fs.readFileSync('pages/teacher/teacher-dashboard.html', 'utf8');
if (tdHtml.includes("requireAuth('teacher-login.html', true)")) {
  tdHtml = tdHtml.replace(
    "requireAuth('teacher-login.html', true)",
    "requireAuth('../../site-login.html', true)"
  );
  fs.writeFileSync('pages/teacher/teacher-dashboard.html', tdHtml, 'utf8');
  console.log('Fixed route guard in pages/teacher/teacher-dashboard.html');
}
