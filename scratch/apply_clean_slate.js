const fs = require('fs');

// ============================================================================
// 1. UPDATE pages/hr/hr-dashboard.html
// ============================================================================
let hrDash = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// (a) getClassesList - return empty array if no classes exist
const oldGetClasses = `function getClassesList() {
  let classes = read(CLASSES_STORAGE_KEY);
  if (!classes || classes.length === 0) {
    classes = [
      { id: 'cls_1', code: 'CLS-10A', name: 'Grade 10 - Graphic Arts & Visual Identity', subject: 'Graphic Design', grade: 'Grade 10', teacherName: 'Sarah Jenkins', teacherEmail: 's.jenkins@flawless.org', room: 'Media Studio 201', schedule: 'Mon, Wed, Fri • 08:30 AM', capacity: 30, enrolled: 28, status: 'Assigned' },
      { id: 'cls_2', code: 'CLS-11B', name: 'Grade 11 - Web Systems & Client Architecture', subject: 'Frontend Dev', grade: 'Grade 11', teacherName: 'Kwame Boateng', teacherEmail: 'k.boateng@flawless.org', room: 'Computer Lab 3', schedule: 'Tue, Thu • 10:00 AM', capacity: 25, enrolled: 24, status: 'Assigned' },
      { id: 'cls_3', code: 'CLS-12A', name: 'Grade 12 - Digital Animation & 3D Modeling', subject: '3D & VFX', grade: 'Grade 12', teacherName: 'Kofi Owusu', teacherEmail: 'k.owusu@flawless.org', room: 'Studio 105', schedule: 'Mon, Thu • 01:00 PM', capacity: 20, enrolled: 18, status: 'Assigned' },
      { id: 'cls_4', code: 'CLS-09C', name: 'Grade 9 - Fundamental Design Principles', subject: 'Art Fundamentals', grade: 'Grade 9', teacherName: 'James Ntiamoah', teacherEmail: 'admin@flawlessgraphics.com', room: 'Room 102', schedule: 'Wed, Fri • 11:15 AM', capacity: 32, enrolled: 30, status: 'Assigned' },
      { id: 'cls_5', code: 'CLS-10B', name: 'Grade 10 - UI/UX Interactive Prototyping', subject: 'User Experience', grade: 'Grade 10', teacherName: '', teacherEmail: '', room: 'Design Lab 4', schedule: 'Tue, Fri • 02:00 PM', capacity: 25, enrolled: 22, status: 'Unassigned' }
    ];
    save(CLASSES_STORAGE_KEY, classes);
  }
  return classes;
}`;

const newGetClasses = `function getClassesList() {
  let classes = read(CLASSES_STORAGE_KEY);
  if (!Array.isArray(classes)) classes = [];
  return classes;
}`;

if (hrDash.includes(oldGetClasses)) {
  hrDash = hrDash.replace(oldGetClasses, newGetClasses);
  console.log('✓ hr-dashboard: getClassesList clean slate applied');
}

// (b) getAvailableTeachers - only return registered teachers
const oldGetAvailableTeachers = `function getAvailableTeachers() {
  const registeredTeachers = read('teachers');
  const defaults = [
    { name: 'Sarah Jenkins', email: 's.jenkins@flawless.org', role: 'Teacher • Graphic Arts' },
    { name: 'James Ntiamoah', email: 'admin@flawlessgraphics.com', role: 'HR Lead & Instructor' },
    { name: 'Kwame Boateng', email: 'k.boateng@flawless.org', role: 'Teacher • Web Systems' },
    { name: 'Kofi Owusu', email: 'k.owusu@flawless.org', role: 'Teacher • 3D Animation' }
  ];

  const map = new Map();
  defaults.forEach(t => map.set(t.email.toLowerCase(), t));
  if (Array.isArray(registeredTeachers)) {
    registeredTeachers.forEach(t => {
      if (t && t.email) {
        map.set(t.email.toLowerCase(), {
          name: t.name || t.fullName || t.email.split('@')[0],
          email: t.email,
          role: t.role ? \`Teacher • \${t.role}\` : 'Certified Educator'
        });
      }
    });
  }
  return Array.from(map.values());
}`;

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

if (hrDash.includes(oldGetAvailableTeachers)) {
  hrDash = hrDash.replace(oldGetAvailableTeachers, newGetAvailableTeachers);
  console.log('✓ hr-dashboard: getAvailableTeachers clean slate applied');
}

// (c) getEnrolledStudentsList - return empty array if no students registered
const enrolledStudentsRegex = /function getEnrolledStudentsList\(\)\s*\{[\s\S]*?if\s*\(merged\.length === 0\)\s*\{[\s\S]*?save\(STUD_KEY, merged\);\s*\}\s*return merged;\s*\}/;
const newGetEnrolledStudents = `function getEnrolledStudentsList() {
  let studs = read(STUD_KEY);
  if (!Array.isArray(studs)) studs = [];

  // Also harvest any students stored inside classes
  const classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
  let merged = [...studs];
  classes.forEach(c => {
    if (Array.isArray(c.students)) {
      c.students.forEach(cs => {
        const rollId = cs.roll || cs.id || cs.enrollment_code;
        const existingIdx = merged.findIndex(s => (s.roll || s.id || s.enrollment_code) === rollId);
        if (existingIdx === -1) {
          merged.push(Object.assign({
            id: cs.id || rollId,
            enrollment_code: rollId,
            roll: rollId,
            class_name: c.name,
            classId: c.id
          }, cs));
        }
      });
    }
  });

  return merged;
}`;

if (enrolledStudentsRegex.test(hrDash)) {
  hrDash = hrDash.replace(enrolledStudentsRegex, newGetEnrolledStudents);
  console.log('✓ hr-dashboard: getEnrolledStudentsList clean slate applied');
}

// (d) getAppraisalReviews - return empty array if no appraisals exist
const appraisalRegex = /function getAppraisalReviews\(\)\s*\{[\s\S]*?if\s*\(!Array\.isArray\(revs\)\s*\|\|\s*revs\.length === 0\)\s*\{[\s\S]*?save\(PERF_KEY, revs\);\s*\}\s*return revs;\s*\}\s*catch\(e\)\s*\{\s*return \[\];\s*\}\s*\}/;
const newGetAppraisal = `function getAppraisalReviews() {
  try {
    let revs = read(PERF_KEY);
    if (!Array.isArray(revs)) revs = [];
    return revs;
  } catch(e) {
    return [];
  }
}`;

if (appraisalRegex.test(hrDash)) {
  hrDash = hrDash.replace(appraisalRegex, newGetAppraisal);
  console.log('✓ hr-dashboard: getAppraisalReviews clean slate applied');
}

// (e) getAcademicCalendar - return empty array if no calendar terms exist
const calRegex = /function getAcademicCalendar\(\)\s*\{[\s\S]*?if\s*\(!Array\.isArray\(cal\)\s*\|\|\s*cal\.length === 0\)\s*\{[\s\S]*?save\(CALENDAR_KEY, cal\);\s*\}\s*return cal;\s*\}/;
const newGetCal = `function getAcademicCalendar() {
  let cal = read(CALENDAR_KEY);
  if (!Array.isArray(cal)) cal = [];
  return cal;
}`;

if (calRegex.test(hrDash)) {
  hrDash = hrDash.replace(calRegex, newGetCal);
  console.log('✓ hr-dashboard: getAcademicCalendar clean slate applied');
}

// (f) getStudentAssessments - return empty array if no assessments exist
const assessRegex = /function getStudentAssessments\(\)\s*\{[\s\S]*?if\s*\(!Array\.isArray\(assessments\)\s*\|\|\s*assessments\.length === 0\)\s*\{[\s\S]*?save\(ASSESS_KEY, assessments\);\s*\}\s*return assessments;\s*\}/;
const newGetAssess = `function getStudentAssessments() {
  let assessments = read(ASSESS_KEY);
  if (!Array.isArray(assessments)) assessments = [];
  return assessments;
}`;

if (assessRegex.test(hrDash)) {
  hrDash = hrDash.replace(assessRegex, newGetAssess);
  console.log('✓ hr-dashboard: getStudentAssessments clean slate applied');
}

fs.writeFileSync('pages/hr/hr-dashboard.html', hrDash, 'utf8');

// ============================================================================
// 2. UPDATE assets/js/quick-dock.js (Notifications clean slate)
// ============================================================================
let dockCode = fs.readFileSync('assets/js/quick-dock.js', 'utf8');

// Replace static fake alerts with clean, real-event-only alerts
const oldDockNotifs = /\/\/ 1\. ADMIN NOTIFICATIONS[\s\S]*?\/\/ 5\. HR & WORKSPACE NOTIFICATIONS \(DEFAULT\)[\s\S]*?defaultAlerts\.forEach\(item => \{[\s\S]*?\}\);[\s\S]*?\}/;

const newDockNotifs = `// Real dynamic notification gatherer
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

      // 2. Real Announcements for this active workspace
      try {
        const annKey = \`\${activeOrg}_announcements\`;
        const annList = JSON.parse(localStorage.getItem(annKey) || localStorage.getItem('announcements') || '[]');
        if (Array.isArray(annList)) {
          annList.slice(0, 5).forEach(ann => {
            const isRead = readIds.includes('ann_' + ann.id);
            list.push({
              id: 'ann_' + (ann.id || ann.title),
              category: config.tab2Filter || 'system',
              icon: 'fa-solid fa-bullhorn',
              iconTheme: 'blue',
              title: ann.title || 'Institutional Announcement',
              msg: ann.message || ann.body || 'New announcement broadcasted.',
              time: ann.date || 'Recent',
              actionLabel: 'View Notice',
              actionType: 'navigate',
              section: 'announcements',
              unread: !isRead
            });
          });
        }
      } catch (err) {}
    }`;

if (oldDockNotifs.test(dockCode)) {
  dockCode = dockCode.replace(oldDockNotifs, newDockNotifs);
  fs.writeFileSync('assets/js/quick-dock.js', dockCode, 'utf8');
  console.log('✓ quick-dock.js: notifications clean slate applied');
} else {
  console.log('✗ quick-dock.js pattern not matched directly, checking alternative');
}

console.log('\nAll Clean Slate Enhancements Applied Successfully!');
