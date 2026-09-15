const fs = require('fs');

// ============================================================================
// 1. UPDATE pages/hr/hr-dashboard.html - remove getClassesList and getAvailableTeachers mock fallbacks
// ============================================================================
let hrDash = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

const oldClassesRegex = /function getClassesList\(\)\s*\{[\s\S]*?if\s*\(!classes \|\| classes\.length === 0\)\s*\{[\s\S]*?save\(CLASSES_STORAGE_KEY, classes\);\s*\}\s*return classes;\s*\}/;
const newGetClasses = `function getClassesList() {
  let classes = read(CLASSES_STORAGE_KEY);
  if (!Array.isArray(classes)) classes = [];
  return classes;
}`;

if (oldClassesRegex.test(hrDash)) {
  hrDash = hrDash.replace(oldClassesRegex, newGetClasses);
  console.log('✓ hr-dashboard: getClassesList clean slate applied');
}

const oldTeachersRegex = /function getAvailableTeachers\(\)\s*\{[\s\S]*?const defaults = \[[\s\S]*?\];\s*const map = new Map\(\);[\s\S]*?return Array\.from\(map\.values\(\)\);\s*\}/;
const newGetAvailableTeachers = `function getAvailableTeachers() {
  const registeredTeachers = read(EMP_KEY) || read('teachers') || [];
  const map = new Map();
  if (Array.isArray(registeredTeachers)) {
    registeredTeachers.forEach(t => {
      if (t && t.email) {
        map.set(t.email.toLowerCase(), {
          name: t.name || t.fullName || t.email.split('@')[0],
          email: t.email,
          role: t.role ? \`Teacher • \${t.role}\` : (t.position || 'Certified Educator')
        });
      }
    });
  }
  return Array.from(map.values());
}`;

if (oldTeachersRegex.test(hrDash)) {
  hrDash = hrDash.replace(oldTeachersRegex, newGetAvailableTeachers);
  console.log('✓ hr-dashboard: getAvailableTeachers clean slate applied');
}

fs.writeFileSync('pages/hr/hr-dashboard.html', hrDash, 'utf8');

// ============================================================================
// 2. UPDATE assets/js/quick-dock.js - pure dynamic real-event notifications
// ============================================================================
let dockCode = fs.readFileSync('assets/js/quick-dock.js', 'utf8');

const getNotifsRegex = /function getNotifications\(\)\s*\{[\s\S]*?return list;\s*\}/;

const newGetNotifs = `function getNotifications() {
      const readIds = getReadNotifIds();
      const list = [];
      const activeOrg = (window.AuthSession && typeof window.AuthSession.getOrg === 'function' ? window.AuthSession.getOrg() : null) || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';

      // 1. Pending registration approvals from real organizations_users / Supabase
      try {
        const users = JSON.parse(localStorage.getItem('organizations_users') || '[]');
        const pendingUsers = users.filter(u => {
          const s = (u.status || '').toLowerCase();
          const uOrg = (u.org || u.org_id || '').toLowerCase().trim();
          const orgMatch = !uOrg || uOrg === activeOrg.toLowerCase().trim() || activeOrg === 'FLAWLESS GRAPHICS';
          return orgMatch && (s === 'pending_approval' || s === 'pending');
        });
        pendingUsers.forEach(u => {
          list.push({
            id: 'user_' + (u.id || u.email),
            category: config.tab1Filter || 'approvals',
            icon: 'fa-solid fa-user-clock',
            iconTheme: 'amber',
            title: 'Registration Request Arrived',
            msg: \`\${u.name || u.email} registered as \${u.role ? u.role.toUpperCase() : 'Staff'} & awaits approval.\`,
            time: u.registeredAt ? formatNotifTime(u.registeredAt) : 'Pending',
            actionLabel: 'Review Request',
            actionType: 'approve_user',
            userEmail: u.email,
            unread: true
          });
        });
      } catch (err) {}

      // 2. Real Announcements for active workspace
      try {
        const annKey = \`\${activeOrg}_announcements\`;
        const annList = JSON.parse(localStorage.getItem(annKey) || localStorage.getItem('announcements') || '[]');
        if (Array.isArray(annList) && annList.length > 0) {
          annList.slice(0, 5).forEach(ann => {
            const bId = 'ann_' + (ann.id || ann.title);
            const isRead = readIds.includes(bId);
            list.push({
              id: bId,
              category: config.tab2Filter || 'system',
              icon: 'fa-solid fa-bullhorn',
              iconTheme: 'blue',
              title: ann.title || 'Institutional Announcement',
              msg: ann.message || ann.body || ann.content || 'New announcement broadcasted.',
              time: ann.date ? formatNotifTime(ann.date) : 'Recent',
              actionLabel: 'View Notice',
              actionType: 'navigate',
              section: 'announcements',
              unread: !isRead
            });
          });
        }
      } catch (err) {}

      // 3. Dynamic live events from LucyBus for active workspace
      try {
        const liveNotifs = JSON.parse(localStorage.getItem('lucy_live_notifications') || '[]');
        if (Array.isArray(liveNotifs)) {
          liveNotifs.forEach(item => {
            if (!list.some(existing => existing.id === item.id)) {
              const isRead = readIds.includes(item.id);
              const category = item.category || config.tab1Filter;
              list.unshift(Object.assign({}, item, { category: category, unread: !isRead }));
            }
          });
        }
      } catch (err) {}

      return list;
    }`;

if (getNotifsRegex.test(dockCode)) {
  dockCode = dockCode.replace(getNotifsRegex, newGetNotifs);
  fs.writeFileSync('assets/js/quick-dock.js', dockCode, 'utf8');
  console.log('✓ quick-dock.js: getNotifications pure real-time clean slate applied');
} else {
  console.log('✗ quick-dock.js: could not match getNotifications function');
}
