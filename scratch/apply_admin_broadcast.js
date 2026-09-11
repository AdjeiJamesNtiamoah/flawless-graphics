const fs = require('fs');
const path = require('path');

const adminFile = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');
let content = fs.readFileSync(adminFile, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add Sidebar button
const sidebarTarget = `    <button type="button" class="nav-btn" data-sec="portals" onclick="switchSection('portals')">
      <i class="fa-solid fa-layer-group nav-icon"></i>
      <span class="hide-collapsed">Portal Hub &amp; Jump</span>
    </button>`;

const sidebarReplace = `    <button type="button" class="nav-btn" data-sec="portals" onclick="switchSection('portals')">
      <i class="fa-solid fa-layer-group nav-icon"></i>
      <span class="hide-collapsed">Portal Hub &amp; Jump</span>
    </button>
    <button type="button" class="nav-btn" data-sec="broadcasts" onclick="switchSection('broadcasts')">
      <i class="fa-solid fa-bullhorn nav-icon"></i>
      <span class="hide-collapsed">Broadcast Console</span>
    </button>`;

if (!content.includes(sidebarTarget)) {
  console.error('FAIL: sidebarTarget not found');
  process.exit(1);
}
content = content.replace(sidebarTarget, sidebarReplace);

// 2. Add Broadcast Console Section right before </main>
const sectionTarget = `      </section>

    </main>`;

const sectionReplace = `      </section>

      <!-- =========================================================
           9. SYSTEM & ORGANIZATIONAL BROADCAST CONSOLE
           ========================================================= -->
      <section class="admin-section" id="sec_broadcasts">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-size:24px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-bullhorn" style="color:var(--accent-gold);"></i> System &amp; Organizational Broadcast Console
            </h2>
            <div style="font-size:13px; color:var(--muted); margin-top:4px;">
              Super Admin official directives published here carry a verified gold badge across Teacher, HR, and Staff portals.
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn-top ghost" onclick="renderAdminBroadcasts()"><i class="fa-solid fa-rotate"></i> Refresh Directives</button>
          </div>
        </div>

        <!-- Super Admin Broadcast Composer -->
        <div class="chart-card" style="margin-bottom:24px;">
          <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-pen-nib" style="color:var(--primary);"></i> Issue Institutional Super Admin Directive
          </h3>
          <form id="adminBroadcastForm" onsubmit="handleAdminPublishBroadcast(event)">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:14px;">
              <div>
                <label class="form-label">Broadcast Headline *</label>
                <input type="text" id="adm_bcTitle" class="form-input" placeholder="e.g. End of Term System Maintenance &amp; Grade Moderation" required>
              </div>
              <div>
                <label class="form-label">Category *</label>
                <select id="adm_bcCategory" class="form-select" required>
                  <option value="Urgent">Urgent Institutional Alert</option>
                  <option value="Academic">Academic Directive</option>
                  <option value="Policy">Policy &amp; Compliance Mandate</option>
                  <option value="General">General System Notice</option>
                </select>
              </div>
              <div>
                <label class="form-label">Priority Level *</label>
                <select id="adm_bcPriority" class="form-select" required>
                  <option value="High">High Priority (Urgent Popover Banner)</option>
                  <option value="Normal">Normal Standard</option>
                </select>
              </div>
              <div>
                <label class="form-label">Target Tenant</label>
                <select id="adm_bcTenant" class="form-select">
                  <option value="all">Broadcast to All Tenants &amp; Portals</option>
                  <option value="active" selected>Active Tenant Only</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom:16px;">
              <label class="form-label">Directive Message Body *</label>
              <textarea id="adm_bcBody" class="form-input" rows="3" placeholder="Specify all governance directives, compliance deadlines, and instructions..." required style="resize:vertical; font-family:inherit;"></textarea>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; cursor:pointer;">
                <input type="checkbox" id="adm_bcPinned" style="width:16px; height:16px; accent-color:var(--accent-gold);" checked>
                <span><i class="fa-solid fa-thumbtack" style="color:var(--accent-gold);"></i> Pin with Verified Super Admin Gold Ribbon</span>
              </label>
              <button type="submit" class="btn-top primary" style="padding:10px 22px; font-size:13.5px; font-weight:700;">
                <i class="fa-solid fa-paper-plane"></i> Publish Super Admin Broadcast
              </button>
            </div>
          </form>
        </div>

        <!-- Active Broadcasts Table -->
        <div class="table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--text);">Published Directives Ledger</h3>
            <span class="badge" id="adm_bcCount" style="background:var(--accent-gold-bg); color:var(--accent-gold); font-weight:800;">0 Directives</span>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Directive Headline</th>
                  <th>Issuer Role</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Published Date</th>
                  <th>Pinned</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody id="adm_broadcastsTableBody">
                <!-- Populated dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>`;

if (!content.includes(sectionTarget)) {
  console.error('FAIL: sectionTarget not found');
  process.exit(1);
}
content = content.replace(sectionTarget, sectionReplace);

// 3. Update switchSection(secId) to render broadcasts
const switchSecTarget = `      if (secId === 'health') {
        checkStorageCapacity();
      }`;

const switchSecReplace = `      if (secId === 'health') {
        checkStorageCapacity();
      }
      if (secId === 'broadcasts') {
        renderAdminBroadcasts();
      }`;

if (!content.includes(switchSecTarget)) {
  console.error('FAIL: switchSecTarget not found');
  process.exit(1);
}
content = content.replace(switchSecTarget, switchSecReplace);

// 4. Add admin broadcast JS logic
const logicTarget = `    function handleGlobalSearch(query) {`;
const adminBcLogic = `    /* -------------------------------------------------------------
       SUPER ADMIN BROADCAST CONSOLE LOGIC
    ------------------------------------------------------------- */
    function renderAdminBroadcasts() {
      const annKey = \`\${ACTIVE_ORG}_announcements\`;
      const ann = safeParse(localStorage.getItem(annKey)) || [];
      const tbody = document.getElementById('adm_broadcastsTableBody');
      const countBadge = document.getElementById('adm_bcCount');
      if (!tbody) return;

      if (countBadge) countBadge.textContent = \`\${ann.length} Directives\`;

      if (ann.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:28px; color:var(--muted);">No published directives found for this organization.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      ann.forEach((a, i) => {
        const isSuperAdmin = a.role === 'admin' || (a.author && a.author.includes('Super Admin'));
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td style="font-weight:700; color:var(--muted);">\${i + 1}</td>
          <td style="font-weight:800; color:var(--text);">
            <div>\${escapeHtml(a.title || 'Directive')}</div>
            <div style="font-size:11.5px; color:var(--muted); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${escapeHtml(a.body || a.text || '')}</div>
          </td>
          <td>
            \${isSuperAdmin 
              ? '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid rgba(245, 158, 11, 0.4); font-weight:800;"><i class="fa-solid fa-certificate"></i> [Super Admin Broadcast]</span>' 
              : '<span class="badge badge-purple"><i class="fa-solid fa-user-shield"></i> ' + escapeHtml(a.author || 'HR') + '</span>'
            }
          </td>
          <td>
            <span class="badge badge-blue">\${escapeHtml(a.category || 'General')}</span>
          </td>
          <td>
            \${a.priority === 'High' 
              ? '<span class="badge badge-red"><i class="fa-solid fa-triangle-exclamation"></i> High</span>' 
              : '<span class="badge" style="background:rgba(0,0,0,0.05); color:var(--muted);">Normal</span>'
            }
          </td>
          <td style="font-size:12px; color:var(--muted);">\${escapeHtml(a.date || 'Today')}</td>
          <td>
            \${a.pinned 
              ? '<span style="color:var(--accent-gold); font-weight:800;"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' 
              : '<span style="color:var(--muted);">No</span>'
            }
          </td>
          <td style="text-align:right;">
            <button type="button" class="btn-top ghost btn-sm" onclick="toggleAdminPinBroadcast('\${escapeHtml(a.id)}') style="padding:4px 8px; font-size:11px;" title="Pin/Unpin">
              <i class="fa-solid fa-thumbtack"></i>
            </button>
            <button type="button" class="btn-top ghost btn-sm" onclick="deleteAdminBroadcast('\${escapeHtml(a.id)}') style="padding:4px 8px; font-size:11px; color:var(--accent-red);" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function handleAdminPublishBroadcast(e) {
      if (e) e.preventDefault();
      const title = document.getElementById('adm_bcTitle')?.value.trim();
      const category = document.getElementById('adm_bcCategory')?.value || 'Urgent';
      const priority = document.getElementById('adm_bcPriority')?.value || 'High';
      const tenantMode = document.getElementById('adm_bcTenant')?.value || 'active';
      const body = document.getElementById('adm_bcBody')?.value.trim();
      const pinned = document.getElementById('adm_bcPinned')?.checked || true;

      if (!title || !body) return;

      const newBc = {
        id: 'bc_' + Date.now(),
        title: title,
        body: body,
        text: body,
        author: 'Super Administrator',
        role: 'admin',
        category: category,
        priority: priority,
        pinned: pinned,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const tenantsToUpdate = (tenantMode === 'all') 
        ? ['FLAWLESS GRAPHICS', 'CREATIVE CAMPUS', 'ENTERPRISE TECH', ACTIVE_ORG] 
        : [ACTIVE_ORG];

      [...new Set(tenantsToUpdate)].forEach(org => {
        const key = \`\${org}_announcements\`;
        const list = safeParse(localStorage.getItem(key)) || [];
        list.unshift(Object.assign({}, newBc, { id: 'bc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5) }));
        localStorage.setItem(key, JSON.stringify(list));
      });

      document.getElementById('adminBroadcastForm')?.reset();
      renderAdminBroadcasts();
      if (window.Toaster && typeof window.Toaster.success === 'function') {
        window.Toaster.success('Official Super Admin Broadcast Published Across All Portals');
      } else {
        alert('Super Admin Broadcast successfully published to staff portals!');
      }
    }

    function toggleAdminPinBroadcast(id) {
      const annKey = \`\${ACTIVE_ORG}_announcements\`;
      const ann = safeParse(localStorage.getItem(annKey)) || [];
      const target = ann.find(a => String(a.id) === String(id));
      if (target) {
        target.pinned = !target.pinned;
        localStorage.setItem(annKey, JSON.stringify(ann));
        renderAdminBroadcasts();
      }
    }

    function deleteAdminBroadcast(id) {
      const annKey = \`\${ACTIVE_ORG}_announcements\`;
      let ann = safeParse(localStorage.getItem(annKey)) || [];
      ann = ann.filter(a => String(a.id) !== String(id));
      localStorage.setItem(annKey, JSON.stringify(ann));
      renderAdminBroadcasts();
    }

    window.renderAdminBroadcasts = renderAdminBroadcasts;
    window.handleAdminPublishBroadcast = handleAdminPublishBroadcast;
    window.toggleAdminPinBroadcast = toggleAdminPinBroadcast;
    window.deleteAdminBroadcast = deleteAdminBroadcast;

`;

if (!content.includes(logicTarget)) {
  console.error('FAIL: logicTarget not found');
  process.exit(1);
}
content = content.replace(logicTarget, adminBcLogic + '    ' + logicTarget);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(adminFile, content, 'utf8');
console.log('Successfully updated admin-dashboard.html with Broadcast Console');
