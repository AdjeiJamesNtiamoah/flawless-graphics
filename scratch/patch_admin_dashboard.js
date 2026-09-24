const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'pages', 'admin', 'admin-dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the topbar / overview section
const targetMarker = '<button type="button" class="btn-top ghost" onclick="SlideOver.openGuide(\'admin\')" title="Admin Operating Guide"><i class="fa-solid fa-book-open"></i> Guide</button>\n            <div>\n              <div class="kpi-title">Staff &amp; Faculty</div>';

const replacementMarker = `<button type="button" class="btn-top ghost" onclick="SlideOver.openGuide('admin')" title="Admin Operating Guide"><i class="fa-solid fa-book-open"></i> Guide</button>
        <button type="button" class="btn-top ghost" onclick="openBackupExportModal()" title="Export Database Snapshot">
          <i class="fa-solid fa-download"></i> Backup Snapshot
        </button>
        <button type="button" class="btn-top primary" onclick="openUserModal()">
          <i class="fa-solid fa-user-plus"></i> New User
        </button>
        <a href="../../welcome.html" class="btn-top ghost" title="Return to Workspace Hub">
          <i class="fa-solid fa-grip"></i> Hub
        </a>
        <div id="topRightProfileContainer" class="fg-top-profile-container"></div>
      </div>
    </header>

    <!-- CONTENT SCROLL -->
    <main class="content-scroll">

      <!-- =========================================================
           1. EXECUTIVE OVERVIEW SECTION
           ========================================================= -->
      <section class="admin-section active" id="sec_overview">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-size:24px; font-weight:800; color:var(--text);">Executive Command Center</h2>
            <div style="font-size:13px; color:var(--muted); margin-top:4px;">Cross-tenant institutional metrics, user governance &amp; system health telemetry.</div>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn-top ghost" onclick="refreshAllStats()"><i class="fa-solid fa-arrows-rotate"></i> Refresh Telemetry</button>
          </div>
        </div>

        <!-- Pending Registrations Alert Banner -->
        <div id="pendingRegistrationsBanner" style="display:none; margin-bottom:24px; background:linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%); border:1px solid rgba(245, 158, 11, 0.35); border-radius:var(--radius); padding:16px 20px; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:42px; height:42px; border-radius:12px; background:var(--accent-gold-bg); color:var(--accent-gold); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
              <i class="fa-solid fa-building-circle-check"></i>
            </div>
            <div>
              <div style="font-weight:800; font-size:14px; color:var(--text);" id="pendingBannerTitle">Pending Institutional Registrations (<span id="pendingApprovalCountText">0</span>)</div>
              <div style="font-size:12.5px; color:var(--muted);" id="pendingBannerSub">There are institutions awaiting Super Admin review and authorization.</div>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-top primary" style="background:var(--accent-gold); border-color:var(--accent-gold); font-size:12px; padding:7px 14px;" onclick="switchSection('tenants')"><i class="fa-solid fa-list-check"></i> Review Approvals</button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon" style="background:var(--primary-light); color:var(--primary);"><i class="fa-solid fa-building"></i></div>
            <div>
              <div class="kpi-title">Active Tenants</div>
              <div class="kpi-value" id="kpi_tenants">3</div>
              <div class="kpi-sub">Multi-tenant environments</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:rgba(6, 182, 212, 0.14); color:var(--accent-cyan);"><i class="fa-solid fa-users"></i></div>
            <div>
              <div class="kpi-title">Global Users</div>
              <div class="kpi-value" id="kpi_users">0</div>
              <div class="kpi-sub">Active login credentials</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:var(--accent-green-bg); color:var(--accent-green);"><i class="fa-solid fa-user-graduate"></i></div>
            <div>
              <div class="kpi-title">Enrolled Students</div>
              <div class="kpi-value" id="kpi_students">0</div>
              <div class="kpi-sub">Across all classrooms</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:var(--accent-gold-bg); color:var(--accent-gold);"><i class="fa-solid fa-chalkboard-user"></i></div>
            <div>
              <div class="kpi-title">Staff &amp; Faculty</div>`;

if (content.includes(targetMarker)) {
  content = content.replace(targetMarker, replacementMarker);
  console.log('Fixed Overview and Banner section!');
} else {
  // Let's check with normalized whitespace
  const normContent = content.replace(/\r\n/g, '\n');
  if (normContent.includes(targetMarker)) {
    content = normContent.replace(targetMarker, replacementMarker);
    console.log('Fixed Overview and Banner section (normalized CRLF)!');
  } else {
    console.warn('targetMarker not found');
  }
}

// 2. In loadAllAdminData: merge pending_institution_registrations from localStorage
const targetLoadOrgs = `const orgs = await window.SupabaseService.getOrganizations();
        adminState.allOrgs = Array.isArray(orgs) ? orgs : [];`;

const enhancedLoadOrgs = `const orgs = await window.SupabaseService.getOrganizations();
        adminState.allOrgs = Array.isArray(orgs) ? orgs : [];

        // Merge pending institution registrations from localStorage to guarantee immediate visibility
        try {
          const localPending = JSON.parse(localStorage.getItem('pending_institution_registrations') || '[]');
          if (Array.isArray(localPending)) {
            localPending.forEach(lp => {
              const orgName = lp.org_name || lp.name;
              const exists = adminState.allOrgs.some(o => (o.org_name || o.name || '').toLowerCase() === (orgName || '').toLowerCase());
              if (!exists) {
                adminState.allOrgs.unshift({
                  id: lp.id || lp.tracking_ref || ('PENDING-' + Date.now()),
                  org_name: orgName,
                  name: orgName,
                  admin_name: lp.admin_name || 'Administrator',
                  email: lp.email,
                  phone: lp.phone,
                  status: lp.status || 'pending_approval',
                  created_at: lp.created_at || new Date().toISOString()
                });
              }
            });
          }
        } catch(e) {}`;

if (content.includes(targetLoadOrgs)) {
  content = content.replace(targetLoadOrgs, enhancedLoadOrgs);
  console.log('Enhanced loadAllAdminData with localStorage pending merge!');
}

// 3. In approveOrgCloud: also update pending_institution_registrations in localStorage
const targetApprove = `if (window.SupabaseService) {
          await window.SupabaseService.approveOrganization(orgIdOrName);
        }`;

const enhancedApprove = `if (window.SupabaseService) {
          await window.SupabaseService.approveOrganization(orgIdOrName);
        }
        try {
          let pendingList = JSON.parse(localStorage.getItem('pending_institution_registrations') || '[]');
          pendingList = pendingList.filter(item => (item.org_name || item.name) !== orgIdOrName && item.id !== orgIdOrName);
          localStorage.setItem('pending_institution_registrations', JSON.stringify(pendingList));
        } catch(_) {}`;

if (content.includes(targetApprove)) {
  content = content.replace(targetApprove, enhancedApprove);
  console.log('Enhanced approveOrgCloud!');
}

// 4. In rejectOrgCloud: also update pending_institution_registrations in localStorage
const targetReject = `if (window.SupabaseService) {
          await window.SupabaseService.rejectOrganization(orgIdOrName);
        }`;

const enhancedReject = `if (window.SupabaseService) {
          await window.SupabaseService.rejectOrganization(orgIdOrName);
        }
        try {
          let pendingList = JSON.parse(localStorage.getItem('pending_institution_registrations') || '[]');
          pendingList = pendingList.filter(item => (item.org_name || item.name) !== orgIdOrName && item.id !== orgIdOrName);
          localStorage.setItem('pending_institution_registrations', JSON.stringify(pendingList));
        } catch(_) {}`;

if (content.includes(targetReject)) {
  content = content.replace(targetReject, enhancedReject);
  console.log('Enhanced rejectOrgCloud!');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('pages/admin/admin-dashboard.html update finished.');
