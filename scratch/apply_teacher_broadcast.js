const fs = require('fs');
const path = require('path');

const teacherFile = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
let content = fs.readFileSync(teacherFile, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add Sidebar button
const navTarget = `      <button class="tab" data-section="timetable"><i class="fa-solid fa-calendar-days"></i> Timetable &amp; Calendar</button>
      <button class="tab" data-section="settings"><i class="fa-solid fa-gear"></i> Settings</button>`;

const navReplace = `      <button class="tab" data-section="timetable"><i class="fa-solid fa-calendar-days"></i> Timetable &amp; Calendar</button>
      <button class="tab" data-section="broadcasts"><i class="fa-solid fa-bullhorn"></i> Directives &amp; Broadcasts</button>
      <button class="tab" data-section="settings"><i class="fa-solid fa-gear"></i> Settings</button>`;

if (!content.includes(navTarget)) {
  console.error('FAIL: navTarget not found');
  process.exit(1);
}
content = content.replace(navTarget, navReplace);
console.log('PASS: Step 1 added sidebar tab');

// 2. Add Overview Banner
const overviewBannerTarget = `      <!-- Published Academic Calendar Banner for Teachers -->
      <div id="teacherCalOverviewBanner" style="display:none; margin-bottom:18px; background:linear-gradient(135deg, rgba(99,91,252,0.12) 0%, rgba(16,185,129,0.08) 100%); border:1px solid rgba(99,91,252,0.25); border-radius:12px; padding:14px 18px; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">`;

const overviewBannerReplace = `      <!-- Published Broadcast / Directive Alert Banner for Teachers -->
      <div id="teacherBroadcastBanner" style="display:none; margin-bottom:18px; background:linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(99,91,252,0.1) 100%); border:1px solid rgba(245,158,11,0.35); border-radius:12px; padding:14px 18px; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:280px;">
          <div style="width:38px; height:38px; border-radius:10px; background:rgba(245,158,11,0.2); color:#f59e0b; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0;">
            <i class="fa-solid fa-bullhorn"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px; flex-wrap:wrap;">
              <span id="teacherBcBannerAuthor"></span>
              <strong style="font-size:14px; color:var(--text-main);" id="teacherBcBannerTitle">Official Institutional Directive</strong>
            </div>
            <div class="tiny" id="teacherBcBannerBody" style="color:var(--text-muted); line-height:1.4;">New directive published by institutional leadership.</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn ghost btn-sm" onclick="acknowledgeActiveBroadcast()" style="padding:6px 12px; font-size:12px;">
            <i class="fa-solid fa-check"></i> Acknowledge
          </button>
          <button type="button" class="btn prim btn-sm" onclick="goToTeacherBroadcasts()" style="padding:6px 12px; font-size:12px;">
            <i class="fa-solid fa-arrow-right"></i> Review Directives
          </button>
        </div>
      </div>

      <!-- Published Academic Calendar Banner for Teachers -->
      <div id="teacherCalOverviewBanner" style="display:none; margin-bottom:18px; background:linear-gradient(135deg, rgba(99,91,252,0.12) 0%, rgba(16,185,129,0.08) 100%); border:1px solid rgba(99,91,252,0.25); border-radius:12px; padding:14px 18px; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">`;

if (!content.includes(overviewBannerTarget)) {
  console.error('FAIL: overviewBannerTarget not found');
  process.exit(1);
}
content = content.replace(overviewBannerTarget, overviewBannerReplace);
console.log('PASS: Step 2 added overview live broadcast banner');

// 3. Add #broadcastsSection before </main>
const sectionTarget = `    <!-- SETTINGS SECTION -->
    <section id="settingsSection" class="card view-panel" style="display:none">`;

const sectionReplace = `    <!-- BROADCASTS & DIRECTIVES SECTION -->
    <section id="broadcastsSection" class="card view-panel" style="display:none">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:18px; display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-bullhorn" style="color:var(--accent1);"></i> Institutional Directives &amp; Staff Broadcasts
          </h3>
          <div class="tiny" style="color:var(--text-muted); margin-top:2px;">
            Verified executive communiqués from Super Administrator and HR Directorate.
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <select id="teacherBcCategoryFilter" class="select" onchange="filterTeacherBroadcasts()" style="padding:6px 10px; font-size:12px; background:var(--card-bg); color:var(--text-main); border:1px solid var(--card-border); border-radius:8px;">
            <option value="">All Directives</option>
            <option value="Urgent">Urgent Notices</option>
            <option value="Academic">Academic</option>
            <option value="Policy">Policy</option>
            <option value="General">General</option>
          </select>
          <button type="button" class="btn ghost btn-sm" onclick="acknowledgeAllBroadcasts()">
            <i class="fa-solid fa-check-double"></i> Acknowledge All
          </button>
        </div>
      </div>

      <div id="teacherBroadcastsList" style="display:flex; flex-direction:column; gap:12px; margin-top:14px;">
        <!-- Dynamically rendered -->
      </div>
    </section>

    <!-- SETTINGS SECTION -->
    <section id="settingsSection" class="card view-panel" style="display:none">`;

if (!content.includes(sectionTarget)) {
  console.error('FAIL: sectionTarget not found');
  process.exit(1);
}
content = content.replace(sectionTarget, sectionReplace);
console.log('PASS: Step 3 added #broadcastsSection');

// 4. Update Tab click logic
const tabLogicTarget = `    if (sec === 'overview') {
      updateCalendarOverviewBanner();
    }`;

const tabLogicReplace = `    if (sec === 'overview') {
      updateCalendarOverviewBanner();
      renderTeacherBroadcastBanner();
    }
    if (sec === 'broadcasts') {
      renderTeacherBroadcasts();
    }`;

if (!content.includes(tabLogicTarget)) {
  console.error('FAIL: tabLogicTarget not found');
  process.exit(1);
}
content = content.replace(tabLogicTarget, tabLogicReplace);
console.log('PASS: Step 4 updated tab navigation handler');

// 5. Update updateNotificationBell to include broadcasts
const notifTarget = `  // Check published calendar
  const calendar = getAcademicCalendarForStaff();`;

const notifReplace = `  // Check published broadcasts from HR & Super Admin
  const broadcastKey = \`\${ORG}_announcements\`;
  const broadcasts = safeParse(localStorage.getItem(broadcastKey)) || [];
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const acknowledgedIds = safeParse(localStorage.getItem(ackBcKey)) || [];

  const unreadBroadcasts = broadcasts.filter(b => !acknowledgedIds.includes(String(b.id)));
  if (unreadBroadcasts.length > 0) {
    const latest = unreadBroadcasts[0];
    const isSuperAdmin = latest.role === 'admin' || (latest.author && latest.author.includes('Super Admin'));
    notifications.push({
      type: 'broadcast',
      icon: 'fa-solid fa-bullhorn',
      color: isSuperAdmin ? '#f59e0b' : 'var(--accent1)',
      title: isSuperAdmin ? '[Super Admin Directive]' : (latest.title || 'Official Broadcast'),
      desc: latest.title || (latest.body || latest.text || '').slice(0, 50),
      action: "goToTeacherBroadcasts()"
    });
  }

  // Check published calendar
  const calendar = getAcademicCalendarForStaff();`;

if (!content.includes(notifTarget)) {
  console.error('FAIL: notifTarget not found');
  process.exit(1);
}
content = content.replace(notifTarget, notifReplace);
console.log('PASS: Step 5 integrated broadcasts into updateNotificationBell');

// 6. Add Teacher Broadcast helper functions right before updateKPIs
const helperTarget = `/* -------------------------
  KPI UPDATES & INITIALIZATION
------------------------- */`;

const helperReplace = `/* -------------------------
  CROSS-PORTAL DIRECTIVES & BROADCASTS
------------------------- */
let activeBroadcastId = null;

function renderTeacherBroadcastBanner() {
  const banner = document.getElementById('teacherBroadcastBanner');
  if (!banner) return;
  const broadcastKey = \`\${ORG}_announcements\`;
  const broadcasts = safeParse(localStorage.getItem(broadcastKey)) || [];
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const acknowledgedIds = safeParse(localStorage.getItem(ackBcKey)) || [];

  const unread = broadcasts.filter(b => !acknowledgedIds.includes(String(b.id)));
  if (!unread.length) {
    banner.style.display = 'none';
    return;
  }

  const latest = unread[0];
  activeBroadcastId = latest.id;
  const isSuperAdmin = latest.role === 'admin' || (latest.author && latest.author.includes('Super Admin'));
  
  banner.style.display = 'flex';
  
  const titleEl = document.getElementById('teacherBcBannerTitle');
  if (titleEl) titleEl.textContent = latest.title || 'Official Institutional Directive';
  
  const authorEl = document.getElementById('teacherBcBannerAuthor');
  if (authorEl) {
    authorEl.innerHTML = isSuperAdmin
      ? '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid rgba(245,158,11,0.3); font-weight:800; font-size:11px; padding:2px 8px;"><i class="fa-solid fa-certificate"></i> [Super Admin Broadcast]</span>'
      : '<span class="badge" style="background:rgba(99,91,252,0.15); color:var(--accent1); font-size:11px; padding:2px 8px;"><i class="fa-solid fa-user-shield"></i> ' + escapeHtml(latest.author || 'HR Directorate') + '</span>';
  }

  const bodyEl = document.getElementById('teacherBcBannerBody');
  if (bodyEl) {
    const raw = latest.body || latest.text || '';
    bodyEl.textContent = raw.length > 130 ? raw.slice(0, 130) + '...' : raw;
  }
}

function acknowledgeActiveBroadcast() {
  if (!activeBroadcastId) return;
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const acknowledgedIds = safeParse(localStorage.getItem(ackBcKey)) || [];
  if (!acknowledgedIds.includes(String(activeBroadcastId))) {
    acknowledgedIds.push(String(activeBroadcastId));
    localStorage.setItem(ackBcKey, JSON.stringify(acknowledgedIds));
  }
  renderTeacherBroadcastBanner();
  updateNotificationBell();
  toast('Directive receipt acknowledged');
}

function acknowledgeAllBroadcasts() {
  const broadcastKey = \`\${ORG}_announcements\`;
  const broadcasts = safeParse(localStorage.getItem(broadcastKey)) || [];
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const allIds = broadcasts.map(b => String(b.id));
  localStorage.setItem(ackBcKey, JSON.stringify(allIds));
  renderTeacherBroadcastBanner();
  renderTeacherBroadcasts();
  updateNotificationBell();
  toast('All institutional directives acknowledged');
}

function goToTeacherBroadcasts() {
  const btn = document.querySelector('.tab[data-section="broadcasts"]');
  if (btn) btn.click();
}

function renderTeacherBroadcasts() {
  const container = document.getElementById('teacherBroadcastsList');
  if (!container) return;

  const broadcastKey = \`\${ORG}_announcements\`;
  const broadcasts = safeParse(localStorage.getItem(broadcastKey)) || [];
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const acknowledgedIds = safeParse(localStorage.getItem(ackBcKey)) || [];

  const catFilter = document.getElementById('teacherBcCategoryFilter')?.value || '';

  let filtered = broadcasts;
  if (catFilter) {
    filtered = filtered.filter(b => b.category && b.category.toLowerCase() === catFilter.toLowerCase());
  }

  // Sort pinned first
  filtered.sort((x, y) => {
    if (x.pinned && !y.pinned) return -1;
    if (!x.pinned && y.pinned) return 1;
    return (y.timestamp || 0) - (x.timestamp || 0);
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="tiny" style="text-align:center; padding:32px; color:var(--text-muted);"><i class="fa-solid fa-bullhorn" style="font-size:24px; opacity:0.3; margin-bottom:8px;"></i><div>No directives or announcements found.</div></div>';
    return;
  }

  container.innerHTML = filtered.map(b => {
    const isSuperAdmin = b.role === 'admin' || (b.author && b.author.includes('Super Admin'));
    const isAck = acknowledgedIds.includes(String(b.id));
    const cat = b.category || 'General';
    const isHigh = b.priority === 'High';

    return \`
      <div style="background:var(--card-bg); border:1px solid \${b.pinned ? 'rgba(245,158,11,0.4)' : 'var(--card-border)'}; border-radius:12px; padding:16px 18px; \${b.pinned ? 'border-left:4px solid #f59e0b;' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            \${isSuperAdmin 
              ? '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid rgba(245,158,11,0.3); font-weight:800;"><i class="fa-solid fa-certificate"></i> [Super Admin Broadcast]</span>' 
              : '<span class="badge" style="background:rgba(99,91,252,0.15); color:var(--accent1);"><i class="fa-solid fa-user-shield"></i> ' + escapeHtml(b.author || 'HR Directorate') + '</span>'
            }
            <span class="badge badge-blue">\${escapeHtml(cat)}</span>
            \${isHigh ? '<span class="badge badge-red"><i class="fa-solid fa-bell"></i> High Priority</span>' : ''}
            \${b.pinned ? '<span class="badge badge-orange"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : ''}
          </div>
          <div class="tiny" style="color:var(--text-muted);">
            <i class="fa-solid fa-clock"></i> \${escapeHtml(b.date || 'Today')}
          </div>
        </div>

        <div style="font-size:15px; font-weight:800; color:var(--text-main); margin-bottom:6px;">
          \${escapeHtml(b.title || 'Directive')}
        </div>
        <div style="font-size:13px; color:var(--text-main); line-height:1.6; margin-bottom:12px; white-space:pre-wrap;">
          \${escapeHtml(b.body || b.text || '')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--card-border); padding-top:8px;">
          <div class="tiny" style="color:var(--text-muted);">
            Audience: <strong>\${b.audience === 'support' ? 'Support Personnel' : (b.audience === 'teachers' ? 'Teaching Faculty' : 'All Institutional Personnel')}</strong>
          </div>
          <div>
            \${isAck 
              ? '<span class="tiny" style="color:#10b981; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Receipt Acknowledged</span>'
              : \`<button type="button" class="btn ghost btn-sm" onclick="acknowledgeSingleBroadcast('\${b.id}')" style="padding:4px 10px; font-size:11.5px;"><i class="fa-solid fa-check"></i> Acknowledge Receipt</button>\`
            }
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

function acknowledgeSingleBroadcast(id) {
  const ackBcKey = \`\${ORG}_broadcast_ack_\${teacher.email || 'teacher'}\`;
  const acknowledgedIds = safeParse(localStorage.getItem(ackBcKey)) || [];
  if (!acknowledgedIds.includes(String(id))) {
    acknowledgedIds.push(String(id));
    localStorage.setItem(ackBcKey, JSON.stringify(acknowledgedIds));
  }
  renderTeacherBroadcastBanner();
  renderTeacherBroadcasts();
  updateNotificationBell();
  toast('Directive receipt acknowledged');
}

function filterTeacherBroadcasts() {
  renderTeacherBroadcasts();
}

window.renderTeacherBroadcastBanner = renderTeacherBroadcastBanner;
window.acknowledgeActiveBroadcast = acknowledgeActiveBroadcast;
window.acknowledgeAllBroadcasts = acknowledgeAllBroadcasts;
window.goToTeacherBroadcasts = goToTeacherBroadcasts;
window.renderTeacherBroadcasts = renderTeacherBroadcasts;
window.acknowledgeSingleBroadcast = acknowledgeSingleBroadcast;
window.filterTeacherBroadcasts = filterTeacherBroadcasts;

/* -------------------------
  KPI UPDATES & INITIALIZATION
------------------------- */`;

if (!content.includes(helperTarget)) {
  console.error('FAIL: helperTarget not found');
  process.exit(1);
}
content = content.replace(helperTarget, helperReplace);
console.log('PASS: Step 6 added broadcast helper functions');

// 7. Call renderTeacherBroadcastBanner during init
const bootTarget = `renderTeacherAssessments();
updateKPIs();
updateNotificationBell();`;

const bootReplace = `renderTeacherAssessments();
renderTeacherBroadcastBanner();
updateKPIs();
updateNotificationBell();`;

if (!content.includes(bootTarget)) {
  console.error('FAIL: bootTarget not found');
  process.exit(1);
}
content = content.replace(bootTarget, bootReplace);
console.log('PASS: Step 7 added renderTeacherBroadcastBanner to boot sequence');

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(teacherFile, content, 'utf8');
console.log('Successfully updated teacher-dashboard.html');
