const fs = require('fs');
const path = require('path');

const hrFile = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
let content = fs.readFileSync(hrFile, 'utf8');

// Normalize line endings to \n
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

console.log('Original lines count:', content.split('\n').length);

// 1. Fix DOM Nesting: Close #appraisalsSectionPanel
const target1 = `        <tbody id="appraisalsTableBody">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    </div>
  <!-- 11. ACADEMIC CALENDAR FOR STAFF REVIEW SECTION -->`;

const replace1 = `        <tbody id="appraisalsTableBody">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- 11. ACADEMIC CALENDAR FOR STAFF REVIEW SECTION -->`;

if (!content.includes(target1)) {
  console.error('FAIL: target1 not found');
  process.exit(1);
}
content = content.replace(target1, replace1);
console.log('PASS: Step 1 closed #appraisalsSectionPanel');

// 2. Modernize #announcementsSection and #settingsSectionPanel
const target2 = `  <!-- 8. ANNOUNCEMENTS SECTION -->
  <section class="panel" id="announcementsSection" style="display:none">
    <h3 style="margin-top:0"><i class="fa-solid fa-bullhorn" style="color:var(--primary);margin-right:6px"></i> Company Broadcasts</h3>
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <input id="announcementInput" class="select" placeholder="Draft announcement for all workforce members..." style="flex:1">
      <button class="btn" id="postAnnouncement"><i class="fa-solid fa-paper-plane"></i> Publish</button>
    </div>
    <div id="announcementList" style="display:flex;flex-direction:column;gap:12px"></div>
  </section>

  <!-- 9. SETTINGS SECTION -->
  <section class="panel" id="settingsSectionPanel" style="display:none">
    <h3 style="margin-top:0"><i class="fa-solid fa-sliders" style="color:var(--primary);margin-right:6px"></i> Portal Configurations</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;flex-wrap:wrap">
      <div>
        <div class="small" style="font-weight:700;margin-bottom:10px">Primary Accent Color</div>
        <div>
          <span class="color-swatch active" data-color="#635bfc" style="background:#635bfc"></span>
          <span class="color-swatch" data-color="#10b981" style="background:#10b981"></span>
          <span class="color-swatch" data-color="#f59e0b" style="background:#f59e0b"></span>
          <span class="color-swatch" data-color="#ef4444" style="background:#ef4444"></span>
          <span class="color-swatch" data-color="#06b6d4" style="background:#06b6d4"></span>
        </div>
        
        <div style="margin-top:24px">
          <label class="small" style="display:block;font-weight:700;margin-bottom:6px">Session Auto-Lock Timeout (Minutes)</label>
          <div style="display:flex;gap:10px">
            <input id="idleMinutes" class="select" type="number" min="1" max="120" value="15" style="width:120px">
            <button class="btn ghost" onclick="saveIdleSetting()"><i class="fa-solid fa-check"></i> Save</button>
          </div>
        </div>

        <div style="margin-top:24px">
          <label class="small" style="display:block;font-weight:700;margin-bottom:6px">Quick Workspace Links</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="btn ghost" onclick="showSection('appraisals')"><i class="fa-solid fa-chart-simple"></i> Appraisals</button>
            <button type="button" class="btn ghost" onclick="openEmbeddedPage('hr.html', 'HR Hub', 'fa-grid-horizontal')"><i class="fa-solid fa-grid-horizontal"></i> HR Hub</button>
          </div>
        </div>
      </div>

      <div>
        <h4 style="margin-top:0;font-size:15px;font-weight:800;color:var(--primary)">
          <i class="fa-solid fa-wand-magic-sparkles"></i> HR Copilot Assistant
        </h4>
        <div style="background:var(--bg);padding:18px;border-radius:14px;border:1px solid var(--border)">
          <p style="font-size:12px;color:var(--muted);margin-top:0">Ask policy questions, overtime standards, or leave regulations:</p>
          <input id="aiQuery" class="select" placeholder="e.g. What is the annual leave allowance?" style="width:100%">
          <button class="btn" id="askAiBtn" style="width:100%;margin-top:10px;justify-content:center">
            <i class="fa-solid fa-brain"></i> Ask HR Copilot
          </button>
          <div id="aiAnswer" style="margin-top:14px;padding:12px;background:var(--card);border-radius:10px;border:1px solid var(--border);display:none;font-size:12.5px;line-height:1.5"></div>
        </div>
      </div>
    </div>
  </section>`;

const replace2 = `  <!-- 8. CROSS-PORTAL BROADCASTS & INSTITUTIONAL DIRECTIVES HUB -->
  <section class="panel" id="announcementsSection" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-bullhorn" style="color:var(--primary);"></i> Cross-Portal Broadcasts &amp; Directives Hub
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Publish official notices, academic directives, and urgent alerts across Teacher, Faculty, and Admin portals.
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <span class="badge-pill badge-purple" style="font-size:12px; padding:6px 12px;">
          <i class="fa-solid fa-tower-broadcast"></i> Live Portal Sync Active
        </span>
      </div>
    </div>

    <!-- BROADCAST COMPOSER CARD -->
    <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:22px; margin-bottom:24px; box-shadow:var(--shadow-sm);">
      <h3 style="margin:0 0 16px; font-size:15px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-pen-to-square" style="color:var(--primary);"></i> Compose Official Broadcast / Directive
      </h3>
      <form id="broadcastComposeForm" onsubmit="handlePublishBroadcast(event)">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Broadcast Headline / Subject *</label>
            <input type="text" id="bc_title" class="select" placeholder="e.g. Term 1 Mid-Semester Faculty Assembly" required style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Directive Category *</label>
            <select id="bc_category" class="select" style="width:100%;" required>
              <option value="Academic">Academic Directive</option>
              <option value="Urgent">Urgent / Important Notice</option>
              <option value="Policy">Institutional Policy</option>
              <option value="General">General Announcement</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Dispatch Priority *</label>
            <select id="bc_priority" class="select" style="width:100%;" required>
              <option value="Normal">Normal Standard</option>
              <option value="High">High Priority (Urgent Popover)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Target Audience</label>
            <select id="bc_audience" class="select" style="width:100%;">
              <option value="all">All Faculty, Staff &amp; Educators</option>
              <option value="teachers">Teaching Faculty Only</option>
              <option value="support">Administrative &amp; Support Personnel</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Broadcast Message Body &amp; Directives *</label>
          <textarea id="bc_body" class="select" rows="3" placeholder="Provide complete directives, meeting coordinates, agenda, or compliance deadlines..." required style="width:100%; resize:vertical; font-family:inherit;"></textarea>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; cursor:pointer; color:var(--text);">
            <input type="checkbox" id="bc_pinned" style="accent-color:var(--primary); width:16px; height:16px;">
            <span><i class="fa-solid fa-thumbtack" style="color:var(--accent-orange);"></i> Pin to Staff Dashboard Header</span>
          </label>
          <div style="display:flex; gap:10px;">
            <button type="reset" class="btn ghost"><i class="fa-solid fa-rotate-left"></i> Reset</button>
            <button type="submit" class="btn prim" id="publishBroadcastBtn">
              <i class="fa-solid fa-paper-plane"></i> Publish Official Broadcast
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- ACTIVE BROADCASTS DIRECTORY -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
      <h3 style="margin:0; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-list-check" style="color:var(--primary);"></i> Active Notices &amp; Broadcast History
      </h3>
      <div style="display:flex; gap:8px; align-items:center;">
        <input type="text" id="searchBroadcasts" class="select" placeholder="Search broadcasts..." oninput="filterBroadcasts()" style="padding:6px 12px; font-size:12.5px; width:180px;">
        <select id="filterBcCategory" class="select" onchange="filterBroadcasts()" style="padding:6px 10px; font-size:12.5px;">
          <option value="">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Urgent">Urgent</option>
          <option value="Policy">Policy</option>
          <option value="General">General</option>
        </select>
      </div>
    </div>

    <div id="broadcastsCardsContainer" style="display:flex; flex-direction:column; gap:12px;">
      <!-- Populated dynamically by JS -->
    </div>
  </section>

  <!-- 9. ENTERPRISE PROJECT & DASHBOARD SETTINGS WORKSTATION -->
  <section class="panel" id="settingsSectionPanel" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-sliders" style="color:var(--primary);"></i> Enterprise Portal &amp; System Configuration
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Govern institutional identity, operational standards, currency localization, security sessions, visual themes, and cloud disaster recovery.
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn prim" onclick="saveAllPortalSettings()">
          <i class="fa-solid fa-floppy-disk"></i> Save Configuration
        </button>
      </div>
    </div>

    <!-- SETTINGS SUB-TABS -->
    <div class="sub-tabs-container" id="settingsSubTabs" style="margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:4px; display:flex; gap:6px; overflow-x:auto;">
      <button type="button" class="sub-tab-btn active" data-settab="profile" onclick="switchSettingsTab('profile')">
        <i class="fa-solid fa-building"></i> Organization Profile
      </button>
      <button type="button" class="sub-tab-btn" data-settab="standards" onclick="switchSettingsTab('standards')">
        <i class="fa-solid fa-graduation-cap"></i> Academic &amp; Operations
      </button>
      <button type="button" class="sub-tab-btn" data-settab="localization" onclick="switchSettingsTab('localization')">
        <i class="fa-solid fa-globe"></i> Localization &amp; Currency
      </button>
      <button type="button" class="sub-tab-btn" data-settab="security" onclick="switchSettingsTab('security')">
        <i class="fa-solid fa-shield-halved"></i> Security &amp; Sessions
      </button>
      <button type="button" class="sub-tab-btn" data-settab="theme" onclick="switchSettingsTab('theme')">
        <i class="fa-solid fa-palette"></i> Visual Themes &amp; Display
      </button>
      <button type="button" class="sub-tab-btn" data-settab="backup" onclick="switchSettingsTab('backup')">
        <i class="fa-solid fa-cloud-arrow-up"></i> Cloud Sync &amp; Disaster Rec.
      </button>
    </div>

    <!-- TAB 1: ORGANIZATION PROFILE -->
    <div class="settings-tab-panel" id="settab_profile" style="display:block;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-building-circle-check" style="color:var(--primary);"></i> Institutional Legal Identity &amp; Branding
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Organization Legal Name *</label>
            <input type="text" id="cfg_orgName" class="select" placeholder="FLAWLESS GRAPHICS" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Institutional Tagline / Motto</label>
            <input type="text" id="cfg_orgTagline" class="select" placeholder="Excellence in Creative Design &amp; Technology Education" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Ghana Card / Corporate Registration No.</label>
            <input type="text" id="cfg_regNo" class="select" placeholder="GHA-729401928-3 / CS-2026-GH" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Official Directorate Email *</label>
            <input type="email" id="cfg_orgEmail" class="select" placeholder="hr@flawlessgraphics.edu.gh" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Executive Contact Phone</label>
            <input type="tel" id="cfg_orgPhone" class="select" placeholder="+233 24 123 4567" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Campus Physical Address</label>
            <input type="text" id="cfg_orgAddress" class="select" placeholder="Plot 14, Ring Road Central, Accra, Ghana" style="width:100%;">
          </div>
        </div>

        <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border); display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <div style="width:70px; height:70px; border-radius:14px; background:var(--primary-light); border:2px dashed var(--primary); display:flex; align-items:center; justify-content:center; overflow:hidden;" id="cfg_logoPreviewBox">
            <span style="font-weight:800; font-size:20px; color:var(--primary);" id="cfg_logoPreviewText">FG</span>
          </div>
          <div style="flex:1; min-width:240px;">
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Institutional Logo URL or Upload</label>
            <div style="display:flex; gap:10px;">
              <input type="text" id="cfg_logoUrl" class="select" placeholder="https://... or upload local badge" style="flex:1;" oninput="previewLogoFromUrl(this.value)">
              <label class="btn ghost" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; margin:0;">
                <i class="fa-solid fa-upload"></i> Upload
                <input type="file" id="cfg_logoFile" accept="image/*" style="display:none;" onchange="handleLogoUpload(event)">
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: ACADEMIC & OPERATIONAL STANDARDS -->
    <div class="settings-tab-panel" id="settab_standards" style="display:none;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-clock" style="color:var(--primary);"></i> Institutional Academic &amp; Attendance Policy Controls
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:18px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Active Academic Year</label>
            <input type="text" id="cfg_academicYear" class="select" placeholder="2026 / 2027" value="2026/2027" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Grading &amp; Assessment Benchmark</label>
            <select id="cfg_gradingStandard" class="select" style="width:100%;">
              <option value="waec">WAEC 9-Point Scale (A1 - F9)</option>
              <option value="gpa">Standard 4.0 GPA System</option>
              <option value="percentage">Percentage 100% Mark Scale</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Faculty Shift Scheduled Start</label>
            <input type="time" id="cfg_shiftStart" class="select" value="08:00" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Faculty Shift Scheduled End</label>
            <input type="time" id="cfg_shiftEnd" class="select" value="17:00" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Punctuality Grace Period (Minutes)</label>
            <input type="number" id="cfg_gracePeriod" class="select" min="0" max="60" value="15" style="width:100%;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Minimum Required Teaching Hours / Wk</label>
            <input type="number" id="cfg_minHours" class="select" min="1" max="60" value="35" style="width:100%;">
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: LOCALIZATION & CURRENCY -->
    <div class="settings-tab-panel" id="settab_localization" style="display:none;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-coins" style="color:var(--primary);"></i> Payroll Currency &amp; Regional Localization
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:18px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Base Compensation Currency</label>
            <select id="cfg_currency" class="select" style="width:100%;">
              <option value="GHS">Ghanaian Cedi (GHS ₵)</option>
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR €)</option>
              <option value="GBP">British Pound (GBP £)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Currency Symbol Positioning</label>
            <select id="cfg_currencyFormat" class="select" style="width:100%;">
              <option value="prefix">Prefix (e.g. ₵ 1,250.00)</option>
              <option value="suffix">Suffix (e.g. 1,250.00 GHS)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Date Presentation Format</label>
            <select id="cfg_dateFormat" class="select" style="width:100%;">
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/11/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Time Presentation Format</label>
            <select id="cfg_timeFormat" class="select" style="width:100%;">
              <option value="12h">12-Hour (e.g. 02:30 PM)</option>
              <option value="24h">24-Hour Military (e.g. 14:30)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: SECURITY & GOVERNANCE -->
    <div class="settings-tab-panel" id="settab_security" style="display:none;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-lock" style="color:var(--primary);"></i> Session Lifecycle &amp; Access Governance
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">
              Idle Session Auto-Lock: <strong id="cfg_idleDisplay" style="color:var(--primary);">15 Minutes</strong>
            </label>
            <input type="range" id="cfg_idleSlider" min="5" max="120" step="5" value="15" style="width:100%; accent-color:var(--primary);" oninput="document.getElementById('cfg_idleDisplay').textContent = this.value + ' Minutes'">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-top:4px;">
              <span>5m</span><span>30m</span><span>60m</span><span>120m</span>
            </div>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Root Administrator Protection</label>
            <div style="padding:12px 14px; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); border-radius:10px; font-size:12.5px; color:#065f46; display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-shield-check" style="font-size:18px;"></i>
              <div>
                <strong>Protected &amp; Enforced:</strong> Super Admin root accounts are strictly decoupled from HR and cannot be modified or deleted here.
              </div>
            </div>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Multi-Factor Authentication (MFA)</label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; font-weight:600; margin-top:8px;">
              <input type="checkbox" id="cfg_mfaToggle" style="width:18px; height:18px; accent-color:var(--primary);">
              <span>Require 2-Factor OTP verification on staff logins</span>
            </label>
          </div>
        </div>

        <div style="margin-top:24px; padding-top:18px; border-top:1px solid var(--border);">
          <h4 style="margin:0 0 10px; font-size:13.5px; font-weight:800; color:var(--text);"><i class="fa-solid fa-clipboard-list" style="color:var(--primary);"></i> Recent Active Security Events</h4>
          <div id="cfg_securityEventsList" style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--muted);">
            <div style="padding:8px 12px; background:var(--bg); border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><i class="fa-solid fa-key" style="color:#10b981;"></i> Current Session Authenticated — Central Auth Bridge</span>
              <span id="cfg_sessionTimestamp">Active Now</span>
            </div>
            <div style="padding:8px 12px; background:var(--bg); border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><i class="fa-solid fa-shield" style="color:var(--primary);"></i> Role Clearance: HR Directorate Access Token Verified</span>
              <span>Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: VISUAL THEMES & DISPLAY -->
    <div class="settings-tab-panel" id="settab_theme" style="display:none;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-swatchbook" style="color:var(--primary);"></i> Curated Design Palettes &amp; Display Ergonomics
        </h3>
        
        <div style="margin-bottom:20px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:10px;">Primary Executive Accent Color</label>
          <div style="display:flex; gap:14px; flex-wrap:wrap;">
            <div class="color-swatch-box" onclick="selectThemeSwatch('#635bfc')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#635bfc" style="background:#635bfc; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Executive Indigo</span>
            </div>
            <div class="color-swatch-box" onclick="selectThemeSwatch('#10b981')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#10b981" style="background:#10b981; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Emerald Green</span>
            </div>
            <div class="color-swatch-box" onclick="selectThemeSwatch('#f59e0b')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#f59e0b" style="background:#f59e0b; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Amber Gold</span>
            </div>
            <div class="color-swatch-box" onclick="selectThemeSwatch('#ef4444')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#ef4444" style="background:#ef4444; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Crimson Red</span>
            </div>
            <div class="color-swatch-box" onclick="selectThemeSwatch('#06b6d4')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#06b6d4" style="background:#06b6d4; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Cyan Tech</span>
            </div>
            <div class="color-swatch-box" onclick="selectThemeSwatch('#8b5cf6')" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border:1px solid var(--border); border-radius:10px; cursor:pointer; background:var(--bg);">
              <span class="color-swatch" data-color="#8b5cf6" style="background:#8b5cf6; width:22px; height:22px; border-radius:50%; display:inline-block;"></span>
              <span style="font-size:12.5px; font-weight:700;">Deep Violet</span>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:18px; padding-top:16px; border-top:1px solid var(--border);">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Display Mode</label>
            <div style="display:flex; gap:10px;">
              <button type="button" class="btn ghost" id="themeModeLight" onclick="setDashboardThemeMode('light')" style="flex:1;">
                <i class="fa-solid fa-sun" style="color:#f59e0b;"></i> Warm Light
              </button>
              <button type="button" class="btn ghost" id="themeModeDark" onclick="setDashboardThemeMode('dark')" style="flex:1;">
                <i class="fa-solid fa-moon" style="color:var(--primary);"></i> Sleek Dark
              </button>
            </div>
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:6px;">Interface Density</label>
            <select id="cfg_density" class="select" style="width:100%;" onchange="setDashboardDensity(this.value)">
              <option value="comfortable">Comfortable Spacing (Default)</option>
              <option value="compact">High-Density Compact (Spreadsheet View)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 6: CLOUD SYNC & DISASTER RECOVERY -->
    <div class="settings-tab-panel" id="settab_backup" style="display:none;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-database" style="color:var(--primary);"></i> Cloud Handshake &amp; Institutional Database Snapshots
        </h3>
        
        <!-- Live Status Card -->
        <div style="padding:16px; background:var(--bg); border:1px solid var(--border); border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-weight:800; font-size:14px; color:var(--text); display:flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-cloud" style="color:var(--primary);"></i> Supabase Cloud Bridge Status
            </div>
            <div style="font-size:12.5px; color:var(--muted); margin-top:2px;" id="cfg_cloudStatusText">
              Real-time synchronization connected with encrypted local persistence layer.
            </div>
          </div>
          <button type="button" class="btn ghost" onclick="openCloudConfigModal()" style="font-size:12px;">
            <i class="fa-solid fa-plug"></i> Configure Supabase Keys
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
          <!-- 1-Click Backup Export -->
          <div style="padding:18px; border:1px solid var(--border); border-radius:12px; background:var(--card); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 6px; font-size:14px; font-weight:800; color:var(--text);">
                <i class="fa-solid fa-file-export" style="color:#10b981;"></i> 1-Click Database JSON Snapshot
              </h4>
              <p style="font-size:12.5px; color:var(--muted); margin:0 0 14px; line-height:1.5;">
                Generates a timestamped, cryptographically validated JSON backup of all staff, attendance, appraisals, calendar milestones, assessments, and payroll ledger.
              </p>
            </div>
            <button type="button" class="btn prim" onclick="exportFullDatabaseBackup()" style="width:100%; justify-content:center;">
              <i class="fa-solid fa-download"></i> Export Full Backup (.json)
            </button>
          </div>

          <!-- Restore Backup Uploader -->
          <div style="padding:18px; border:1px solid var(--border); border-radius:12px; background:var(--card); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 6px; font-size:14px; font-weight:800; color:var(--text);">
                <i class="fa-solid fa-file-import" style="color:var(--primary);"></i> Restore Database Snapshot
              </h4>
              <p style="font-size:12.5px; color:var(--muted); margin:0 0 14px; line-height:1.5;">
                Upload previously exported JSON snapshot to recover records after system audit or machine migration.
              </p>
            </div>
            <label class="btn ghost" style="cursor:pointer; width:100%; justify-content:center; display:inline-flex; align-items:center; gap:8px;">
              <i class="fa-solid fa-upload"></i> Select Backup JSON
              <input type="file" id="cfg_restoreFileInput" accept=".json" style="display:none;" onchange="restoreFullDatabaseBackup(event)">
            </label>
          </div>

          <!-- Reset Local Cache -->
          <div style="padding:18px; border:1px solid rgba(239, 68, 68, 0.25); border-radius:12px; background:rgba(239, 68, 68, 0.03); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 6px; font-size:14px; font-weight:800; color:var(--accent-red);">
                <i class="fa-solid fa-triangle-exclamation"></i> Emergency Cache Purge
              </h4>
              <p style="font-size:12.5px; color:var(--muted); margin:0 0 14px; line-height:1.5;">
                Clears cached dashboard telemetry and reloads verified sample datasets without impacting active cloud user accounts.
              </p>
            </div>
            <button type="button" class="btn ghost" onclick="resetLocalCacheConfirm()" style="color:var(--accent-red); border-color:var(--accent-red); width:100%; justify-content:center;">
              <i class="fa-solid fa-trash-can"></i> Reset Local Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>`;

if (!content.includes(target2)) {
  console.error('FAIL: target2 not found');
  process.exit(1);
}
content = content.replace(target2, replace2);
console.log('PASS: Step 2 upgraded #announcementsSection and #settingsSectionPanel');

// 3. Insert the 4 Native Professional Workstation Panels right after studentAssessmentsSection
const target3 = `        <tbody id="studentAssessmentsTableBody">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- EMBEDDED WORKSPACE FRAME (Stay Directly Inside HR Dashboard) -->`;

const replace3 = `        <tbody id="studentAssessmentsTableBody">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- 13. NATIVE ATTENDANCE LOG & PUNCTUALITY DESK -->
  <section class="panel" id="attendanceLogSectionPanel" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-clock-rotate-left" style="color:var(--primary);"></i> Attendance Log &amp; Punctuality Desk
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Real-time check-in/out timestamps, duty duration tracking, and punctuality audit analytics.
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn" style="background:#10b981; border-color:#059669; color:#fff;" onclick="markAllPresentToday()">
          <i class="fa-solid fa-check-double"></i> Mark All Present Today
        </button>
        <button type="button" class="btn prim" onclick="openAttendancePunchModal()">
          <i class="fa-solid fa-fingerprint"></i> Record Attendance Punch
        </button>
        <button type="button" class="btn ghost" onclick="exportAttendanceCSV()">
          <i class="fa-solid fa-file-csv"></i> Export CSV
        </button>
        <button type="button" class="btn ghost" onclick="printAttendanceSheet()">
          <i class="fa-solid fa-print"></i> Print Register
        </button>
      </div>
    </div>

    <!-- ATTENDANCE KPI CARDS -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:22px;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-green-bg); color:var(--accent-green); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-user-check"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Present Today</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="attKpiPresentRate">0%</div>
          <div style="font-size:11.5px; color:var(--muted);" id="attKpiPresentCount">0 of 0 Staff</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-stopwatch"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">On-Time Compliance</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="attKpiOnTimeRate">0%</div>
          <div style="font-size:11.5px; color:var(--muted);">Grace threshold: 15m</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-orange-bg); color:var(--accent-orange); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Late Arrivals</div>
          <div style="font-size:22px; font-weight:800; color:var(--accent-orange);" id="attKpiLateCount">0</div>
          <div style="font-size:11.5px; color:var(--muted);">Requires supervisor follow-up</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(99, 91, 252, 0.08); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-plane-departure"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Approved Leave</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="attKpiLeaveCount">0</div>
          <div style="font-size:11.5px; color:var(--muted);">Excused duty absences</div>
        </div>
      </div>
    </div>

    <!-- FILTER TOOLBAR -->
    <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; flex:1;">
        <input type="text" id="attLogSearch" class="select" placeholder="Search staff name or role..." oninput="filterAttendanceLogs()" style="min-width:200px;">
        <input type="date" id="attLogDate" class="select" onchange="filterAttendanceLogs()" style="width:160px;">
        <select id="attLogDept" class="select" onchange="filterAttendanceLogs()" style="width:170px;">
          <option value="">All Departments</option>
        </select>
        <select id="attLogStatus" class="select" onchange="filterAttendanceLogs()" style="width:150px;">
          <option value="">All Statuses</option>
          <option value="Present">Present (On-Time)</option>
          <option value="Late">Late Arrival</option>
          <option value="On Leave">Approved Leave</option>
          <option value="Absent">Absent</option>
        </select>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn ghost" onclick="resetAttendanceFilters()"><i class="fa-solid fa-arrow-rotate-left"></i> Reset</button>
      </div>
    </div>

    <!-- ATTENDANCE REGISTER TABLE -->
    <div class="table-container" style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr>
            <th style="padding:14px 16px;">#</th>
            <th>Staff Personnel</th>
            <th>Department</th>
            <th>Shift Schedule</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Hours Worked</th>
            <th>Punctuality Status</th>
            <th>Verification Notes</th>
            <th style="text-align:right; padding:14px 16px;">Action</th>
          </tr>
        </thead>
        <tbody id="attendanceLogTableBody">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- 14. NATIVE STAFF PAYSLIP GENERATOR WORKSTATION -->
  <section class="panel" id="payslipGeneratorSectionPanel" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-receipt" style="color:var(--primary);"></i> Staff Payslip Generator Workstation
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Produce official institutional remuneration statements, statutory SSNIT &amp; PAYE breakdowns, and dispatch digital slips.
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn prim" onclick="printPayslipDocument()">
          <i class="fa-solid fa-print"></i> Print / Export PDF Payslip
        </button>
        <button type="button" class="btn ghost" onclick="emailDigitalPayslip()">
          <i class="fa-solid fa-paper-plane"></i> Email Digital Slip
        </button>
        <button type="button" class="btn ghost" onclick="recalculatePayslip()">
          <i class="fa-solid fa-calculator"></i> Recalculate
        </button>
      </div>
    </div>

    <!-- PERSONNEL & PERIOD SELECTOR -->
    <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:20px 24px; margin-bottom:24px; box-shadow:var(--shadow-sm);">
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Select Employee / Faculty *</label>
          <select id="ps_employeeSelect" class="select" onchange="onPayslipEmployeeChange(this.value)" style="width:100%;">
            <option value="">-- Choose Staff Member --</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Pay Billing Month *</label>
          <select id="ps_monthSelect" class="select" onchange="recalculatePayslip()" style="width:100%;">
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September" selected>September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Billing Calendar Year *</label>
          <input type="number" id="ps_yearInput" class="select" value="2026" onchange="recalculatePayslip()" style="width:100%;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Disbursement Channel</label>
          <select id="ps_channelSelect" class="select" style="width:100%;">
            <option value="Direct Bank Wire">Direct ACH / Bank Wire</option>
            <option value="Instant Mobile Money">Corporate Mobile Money (MoMo)</option>
            <option value="Official Institutional Cheque">Official Institutional Cheque</option>
          </select>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE BREAKDOWN GRID: EARNINGS VS DEDUCTIONS -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-bottom:24px;">
      <!-- EARNINGS TABLE -->
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 14px; font-size:15px; font-weight:800; color:var(--primary); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-wallet"></i> Itemized Gross Earnings (GHS)
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <tbody>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Basic Contract Salary</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_baseSalary" class="select" style="width:120px; text-align:right;" value="3500" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Responsibility Allowance</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_respAllow" class="select" style="width:120px; text-align:right;" value="450" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Transport &amp; Duty Subsidy</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_transAllow" class="select" style="width:120px; text-align:right;" value="300" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Overtime / Academic Bonus</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_overtimeBonus" class="select" style="width:120px; text-align:right;" value="200" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr style="border-top:2px solid var(--border); font-weight:800; font-size:14px;">
              <td style="padding:12px 0; color:var(--text);">Total Gross Remuneration</td>
              <td style="padding:12px 0; text-align:right; color:var(--primary);" id="ps_totalGrossDisplay">GHS 4,450.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- STATUTORY DEDUCTIONS TABLE -->
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow-sm);">
        <h3 style="margin:0 0 14px; font-size:15px; font-weight:800; color:var(--accent-red); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-receipt"></i> Statutory Taxes &amp; Deductions (GHS)
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <tbody>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Income Tax (PAYE ~13%)</td>
              <td style="padding:8px 0; text-align:right; font-weight:700;" id="ps_payeDisplay">GHS 578.50</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">SSNIT Tier 1 &amp; 2 (5.5% Employee)</td>
              <td style="padding:8px 0; text-align:right; font-weight:700;" id="ps_ssnitDisplay">GHS 244.75</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Staff Welfare Association Dues</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_welfareDues" class="select" style="width:120px; text-align:right;" value="50" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:var(--muted); font-weight:600;">Advance Salary Repayment</td>
              <td style="padding:8px 0; text-align:right;">
                <input type="number" id="ps_advanceDeduct" class="select" style="width:120px; text-align:right;" value="0" oninput="recalculatePayslip()">
              </td>
            </tr>
            <tr style="border-top:2px solid var(--border); font-weight:800; font-size:14px;">
              <td style="padding:12px 0; color:var(--text);">Total Statutory Deductions</td>
              <td style="padding:12px 0; text-align:right; color:var(--accent-red);" id="ps_totalDeductionsDisplay">GHS 873.25</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EXECUTIVE NET PAYOUT BANNER -->
    <div style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%); border:1px solid rgba(16, 185, 129, 0.35); border-radius:var(--radius); padding:20px 28px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <div style="font-size:12.5px; font-weight:800; text-transform:uppercase; color:#065f46; letter-spacing:0.5px;">Net Monthly Bank Payout</div>
        <div style="font-size:32px; font-weight:800; color:#059669; margin-top:2px;" id="ps_netPayoutDisplay">GHS 3,576.75</div>
        <div style="font-size:12px; color:var(--muted); margin-top:2px;">Certified net payable balance ready for direct clearance</div>
      </div>
      <div style="display:flex; gap:10px;">
        <span class="badge-pill badge-green" style="font-size:13px; padding:8px 16px;">
          <i class="fa-solid fa-stamp"></i> Audited &amp; Pre-Approved
        </span>
      </div>
    </div>

    <!-- OFFICIAL DIGITAL PAYSLIP DOCUMENT PREVIEW -->
    <div id="payslipPrintableDocument" style="background:var(--card); border:2px solid var(--border); border-radius:var(--radius); padding:32px; box-shadow:var(--shadow-md); position:relative;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--border); padding-bottom:18px; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:42px; height:42px; border-radius:10px; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;">FG</div>
            <div>
              <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--text);" id="psDoc_orgName">FLAWLESS GRAPHICS HR DIRECTORATE</h3>
              <div style="font-size:12px; color:var(--muted);">Official Digital Employee Remuneration Voucher</div>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:800; color:var(--primary);" id="psDoc_period">September 2026</div>
          <div style="font-size:11.5px; color:var(--muted);">Voucher Ref: <strong id="psDoc_ref">FG-PAY-9281</strong></div>
        </div>
      </div>

      <!-- Employee Metadata Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:20px;">
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Staff Personnel</div>
          <div style="font-weight:800; font-size:13.5px; color:var(--text);" id="psDoc_name">Select Employee</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Staff ID</div>
          <div style="font-weight:700; font-size:13px; color:var(--text);" id="psDoc_id">FG-STAFF-001</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Department</div>
          <div style="font-weight:700; font-size:13px; color:var(--text);" id="psDoc_dept">Creative Arts</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">SSNIT Number</div>
          <div style="font-weight:700; font-size:13px; color:var(--text);" id="psDoc_ssnit">C109283746</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Disbursement Bank</div>
          <div style="font-weight:700; font-size:13px; color:var(--text);" id="psDoc_bank">GCB Bank Ltd</div>
        </div>
      </div>

      <!-- Document Ledger -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:13px; margin-bottom:24px;">
        <div>
          <div style="font-weight:800; font-size:12px; text-transform:uppercase; color:var(--primary); padding-bottom:6px; border-bottom:1px solid var(--border); margin-bottom:8px;">Earnings Item</div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Basic Salary</span><span id="psDoc_base">GHS 3,500.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Responsibility Allowance</span><span id="psDoc_resp">GHS 450.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Transport Allowance</span><span id="psDoc_trans">GHS 300.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Overtime / Bonus</span><span id="psDoc_bonus">GHS 200.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:1px solid var(--border); font-weight:800;"><span>Gross Remuneration</span><span id="psDoc_gross">GHS 4,450.00</span></div>
        </div>
        <div>
          <div style="font-weight:800; font-size:12px; text-transform:uppercase; color:var(--accent-red); padding-bottom:6px; border-bottom:1px solid var(--border); margin-bottom:8px;">Deductions Item</div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Income Tax (PAYE ~13%)</span><span id="psDoc_paye">GHS 578.50</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>SSNIT Tier 1 &amp; 2 (5.5%)</span><span id="psDoc_ssnitDed">GHS 244.75</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Staff Welfare</span><span id="psDoc_welfare">GHS 50.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>Advance Repayment</span><span id="psDoc_advance">GHS 0.00</span></div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:1px solid var(--border); font-weight:800;"><span>Total Deductions</span><span id="psDoc_totalDed">GHS 873.25</span></div>
        </div>
      </div>

      <!-- Net Payable Summary Footer -->
      <div style="padding:14px 20px; background:var(--bg); border:1px solid var(--border); border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-weight:800; font-size:15px; color:var(--text);">NET DISBURSEMENT AMOUNT:</span>
        <span style="font-weight:800; font-size:20px; color:#059669;" id="psDoc_netFinal">GHS 3,576.75</span>
      </div>
    </div>
  </section>

  <!-- 15. NATIVE SALARY SCHEDULES & COMPENSATION MATRIX -->
  <section class="panel" id="salarySchedulesSectionPanel" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-money-bill-wave" style="color:var(--primary);"></i> Salary Schedules &amp; Compensation Matrix
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Faculty grade band structures, statutory institutional wage liabilities, and monthly batch disbursements.
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn" style="background:#10b981; border-color:#059669; color:#fff;" onclick="runPayrollBatchDisbursement()">
          <i class="fa-solid fa-bolt"></i> Run Monthly Payroll Disbursement
        </button>
        <button type="button" class="btn ghost" onclick="exportSalarySchedulesCSV()">
          <i class="fa-solid fa-file-csv"></i> Export Ledger CSV
        </button>
        <button type="button" class="btn ghost" onclick="schedulePayDay()">
          <i class="fa-solid fa-calendar-check"></i> Schedule Pay Day
        </button>
      </div>
    </div>

    <!-- WAGE BILL ANALYTICS KPIS -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:22px;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-calculator"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Total Gross Wage Bill</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="schKpiGross">GHS 0</div>
          <div style="font-size:11.5px; color:var(--muted);">All departments combined</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-green-bg); color:var(--accent-green); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Total Net Disbursed</div>
          <div style="font-size:22px; font-weight:800; color:#059669;" id="schKpiNet">GHS 0</div>
          <div style="font-size:11.5px; color:var(--muted);">Cleared for staff payout</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-red-bg); color:var(--accent-red); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Statutory PAYE Tax</div>
          <div style="font-size:22px; font-weight:800; color:var(--accent-red);" id="schKpiTax">GHS 0</div>
          <div style="font-size:11.5px; color:var(--muted);">GRA statutory remittance</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-orange-bg); color:var(--accent-orange); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-piggy-bank"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Pension Reserve</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="schKpiSSNIT">GHS 0</div>
          <div style="font-size:11.5px; color:var(--muted);">SSNIT Tier 1 &amp; 2 Reserve</div>
        </div>
      </div>
    </div>

    <!-- SALARY BAND STRUCTURE MATRIX -->
    <h3 style="margin:0 0 14px; font-size:16px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px;">
      <i class="fa-solid fa-layer-group" style="color:var(--primary);"></i> Institutional Salary Band Matrix
    </h3>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:24px;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:16px; border-left:4px solid #635bfc;">
        <div style="font-size:11.5px; font-weight:700; color:var(--primary); text-transform:uppercase;">Faculty Band 1</div>
        <div style="font-weight:800; font-size:14px; margin-top:2px;">Senior Faculty &amp; HODs</div>
        <div style="font-size:13px; font-weight:700; color:var(--text); margin-top:6px;">GHS 4,500 — 8,000</div>
        <div style="font-size:11px; color:var(--muted); margin-top:2px;">Doctorates, Department Chairs</div>
      </div>
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:16px; border-left:4px solid #10b981;">
        <div style="font-size:11.5px; font-weight:700; color:#10b981; text-transform:uppercase;">Faculty Band 2</div>
        <div style="font-weight:800; font-size:14px; margin-top:2px;">Lead Instructors &amp; Educators</div>
        <div style="font-size:13px; font-weight:700; color:var(--text); margin-top:6px;">GHS 3,000 — 4,500</div>
        <div style="font-size:11px; color:var(--muted); margin-top:2px;">Full-Time Teachers &amp; Lecturers</div>
      </div>
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:16px; border-left:4px solid #f59e0b;">
        <div style="font-size:11.5px; font-weight:700; color:#f59e0b; text-transform:uppercase;">Support Band 3</div>
        <div style="font-weight:800; font-size:14px; margin-top:2px;">Administrative &amp; Technical</div>
        <div style="font-size:13px; font-weight:700; color:var(--text); margin-top:6px;">GHS 2,200 — 3,200</div>
        <div style="font-size:11px; color:var(--muted); margin-top:2px;">IT, Lab Technicians, Registrars</div>
      </div>
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:16px; border-left:4px solid #64748b;">
        <div style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Junior Band 4</div>
        <div style="font-weight:800; font-size:14px; margin-top:2px;">Junior Support Personnel</div>
        <div style="font-size:13px; font-weight:700; color:var(--text); margin-top:6px;">GHS 1,500 — 2,200</div>
        <div style="font-size:11px; color:var(--muted); margin-top:2px;">Security, Maintenance &amp; Logistics</div>
      </div>
    </div>

    <!-- SALARY SCHEDULE LEDGER TABLE -->
    <div class="table-container" style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr>
            <th style="padding:14px 16px;">#</th>
            <th>Staff Personnel</th>
            <th>Grade Band</th>
            <th>Base Gross</th>
            <th>Allowances</th>
            <th>Statutory Taxes</th>
            <th>SSNIT Reserve</th>
            <th>Net Payout</th>
            <th>Disbursement Status</th>
            <th style="text-align:right; padding:14px 16px;">Action</th>
          </tr>
        </thead>
        <tbody id="salarySchedulesTableBody">
          <!-- Populated dynamically -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- 16. NATIVE EXECUTIVE WORKFORCE REPORTS CENTER -->
  <section class="panel" id="reportsSectionPanel" style="display:none">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:14px;">
      <div>
        <h2 style="margin:0; font-size:22px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-file-lines" style="color:var(--primary);"></i> Executive Workforce Reports Center
        </h2>
        <div style="font-size:13.5px; color:var(--muted); margin-top:4px;">
          Audit staff density, statutory tax filings, attendance punctuality metrics, and academic assessment compliance.
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn prim" onclick="exportReportCSV()">
          <i class="fa-solid fa-file-csv"></i> Export Current Report CSV
        </button>
        <button type="button" class="btn ghost" onclick="printReportView()">
          <i class="fa-solid fa-print"></i> Print Official Report
        </button>
      </div>
    </div>

    <!-- REPORT METRIC KPIS -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:22px;">
      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-users"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Total Headcount</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="repKpiHeadcount">0</div>
          <div style="font-size:11.5px; color:var(--muted);">Enrolled personnel</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-green-bg); color:var(--accent-green); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Educator Ratio</div>
          <div style="font-size:22px; font-weight:800; color:#059669;" id="repKpiTeacherRatio">0%</div>
          <div style="font-size:11.5px; color:var(--muted);">Active teaching staff</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--accent-orange-bg); color:var(--accent-orange); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-award"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Average Tenure</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="repKpiTenure">2.8 Yrs</div>
          <div style="font-size:11.5px; color:var(--muted);">Faculty stability index</div>
        </div>
      </div>

      <div style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(99, 91, 252, 0.08); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
          <i class="fa-solid fa-chart-pie"></i>
        </div>
        <div>
          <div style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Retention Rate</div>
          <div style="font-size:22px; font-weight:800; color:var(--text);" id="repKpiRetention">96.4%</div>
          <div style="font-size:11.5px; color:var(--muted);">High retention</div>
        </div>
      </div>
    </div>

    <!-- REPORT CATEGORY SELECTOR TABS -->
    <div style="display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; border-bottom:1px solid var(--border); padding-bottom:6px;" id="reportsCategoryTabs">
      <button type="button" class="sub-tab-btn active" data-report="master" onclick="switchReportCategory('master')">
        <i class="fa-solid fa-address-book"></i> Report 1: Faculty Master Roll
      </button>
      <button type="button" class="sub-tab-btn" data-report="departments" onclick="switchReportCategory('departments')">
        <i class="fa-solid fa-sitemap"></i> Report 2: Department Density
      </button>
      <button type="button" class="sub-tab-btn" data-report="taxes" onclick="switchReportCategory('taxes')">
        <i class="fa-solid fa-file-invoice"></i> Report 3: Tax &amp; SSNIT Remittances
      </button>
      <button type="button" class="sub-tab-btn" data-report="attendance" onclick="switchReportCategory('attendance')">
        <i class="fa-solid fa-calendar-check"></i> Report 4: Attendance Compliance
      </button>
      <button type="button" class="sub-tab-btn" data-report="assessments" onclick="switchReportCategory('assessments')">
        <i class="fa-solid fa-stamp"></i> Report 5: Assessment QA Summary
      </button>
    </div>

    <!-- DYNAMIC REPORT CONTENT CARD -->
    <div id="dynamicReportCard" style="background:var(--card); border:1px solid var(--border); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow-sm);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 id="reportTitleHeading" style="margin:0; font-size:16px; font-weight:800; color:var(--text);">Comprehensive Faculty Master Roll &amp; Profile Ledger</h3>
          <div id="reportSubHeading" style="font-size:12.5px; color:var(--muted); margin-top:2px;">Complete institutional registry of active instructors and staff.</div>
        </div>
        <div style="display:flex; gap:8px;">
          <span class="badge-pill badge-purple" id="reportItemCountBadge">0 Records</span>
        </div>
      </div>

      <div class="table-container" style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:left;" id="dynamicReportTable">
          <!-- Dynamically populated by switchReportCategory -->
        </table>
      </div>
    </div>
  </section>

  <!-- EMBEDDED WORKSPACE FRAME (Stay Directly Inside HR Dashboard) -->`;

if (!content.includes(target3)) {
  console.error('FAIL: target3 not found');
  process.exit(1);
}
content = content.replace(target3, replace3);
console.log('PASS: Step 3 inserted 4 native panels');

// 4. Insert Attendance Punch Modal
const targetModal = `        <button type="button" class="btn" id="as_approveBtn" style="background:#10b981; border-color:#059669; color:#fff; font-weight:800;" onclick="submitAssessmentApproval()">
          <i class="fa-solid fa-stamp"></i> Prove / Approve Assessment
        </button>
      </div>
    </div>
  </div>
</div>`;

const replaceModal = `        <button type="button" class="btn" id="as_approveBtn" style="background:#10b981; border-color:#059669; color:#fff; font-weight:800;" onclick="submitAssessmentApproval()">
          <i class="fa-solid fa-stamp"></i> Prove / Approve Assessment
        </button>
      </div>
    </div>
  </div>
</div>

<!-- MODAL: MANUAL ATTENDANCE PUNCH -->
<div class="custom-modal-overlay" id="attendancePunchModal" onclick="if(event.target===this)closeAttendancePunchModal()">
  <div class="modal-card" style="max-width:540px;">
    <div class="modal-header-stagnant">
      <div>
        <h3 style="font-size:20px; font-weight:800; margin:0 0 4px;"><i class="fa-solid fa-fingerprint" style="color:var(--primary);"></i> Record Attendance Punch</h3>
        <p style="font-size:12px; color:var(--muted); margin:0;">Log manual timestamps or update duty punctuality status.</p>
      </div>
      <button onclick="closeAttendancePunchModal()" style="background:none; border:none; font-size:20px; color:var(--muted); cursor:pointer;">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="attendancePunchForm" onsubmit="saveAttendancePunch(event)" style="padding:20px 24px;">
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Select Staff Member *</label>
        <select id="punchStaffSelect" class="select" required style="width:100%;"></select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Attendance Date *</label>
          <input type="date" id="punchDate" class="select" required style="width:100%;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Duty Status *</label>
          <select id="punchStatus" class="select" required style="width:100%;">
            <option value="Present">Present (On-Time)</option>
            <option value="Late">Late Arrival</option>
            <option value="On Leave">Approved Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Clock In Time</label>
          <input type="time" id="punchInTime" class="select" value="08:00" style="width:100%;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Clock Out Time</label>
          <input type="time" id="punchOutTime" class="select" value="17:00" style="width:100%;">
        </div>
      </div>

      <div style="margin-bottom:18px;">
        <label style="display:block; font-size:12px; font-weight:700; color:var(--muted); margin-bottom:5px;">Supervisor Verification Remarks</label>
        <input type="text" id="punchRemarks" class="select" placeholder="e.g. Verified by Department Head" style="width:100%;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; padding-top:14px; border-top:1px solid var(--border);">
        <button type="button" class="btn ghost" onclick="closeAttendancePunchModal()">Cancel</button>
        <button type="submit" class="btn prim"><i class="fa-solid fa-check"></i> Save Attendance Punch</button>
      </div>
    </form>
  </div>
</div>`;

if (!content.includes(targetModal)) {
  console.error('FAIL: targetModal not found');
  process.exit(1);
}
content = content.replace(targetModal, replaceModal);
console.log('PASS: Step 4 added #attendancePunchModal');

// 5. Update Sidebar Buttons to call showSection for all 4 panels
content = content.replace(
  '<button type="button" class="nav-sub-item" data-section="attendance-log" onclick="openAttendanceLogPanel()" data-tooltip="Attendance Logs">',
  '<button type="button" class="nav-sub-item" data-section="attendance-log" onclick="showSection(\'attendance-log\')" data-tooltip="Attendance Logs">'
);
content = content.replace(
  '<button type="button" class="nav-sub-item" data-section="reports" onclick="openReportsPanel()" data-tooltip="Department Reports">',
  '<button type="button" class="nav-sub-item" data-section="reports" onclick="showSection(\'reports\')" data-tooltip="Department Reports">'
);
content = content.replace(
  '<button type="button" class="nav-sub-item" data-section="payslips" onclick="openPayslipGeneratorPanel()" data-tooltip="Generate Payslips">',
  '<button type="button" class="nav-sub-item" data-section="payslips" onclick="showSection(\'payslips\')" data-tooltip="Generate Payslips">'
);
content = content.replace(
  '<button type="button" class="nav-sub-item" data-section="salary-schedules" onclick="openSalarySchedulesPanel()" data-tooltip="Salary Schedules">',
  '<button type="button" class="nav-sub-item" data-section="salary-schedules" onclick="showSection(\'salary-schedules\')" data-tooltip="Salary Schedules">'
);
console.log('PASS: Step 5 updated sidebar buttons');

// 6. Update sections dictionary
const targetSections = `const sections = {
  dashboard: document.getElementById('dashboardSection'),
  classes: document.getElementById('classesSection'),
  teachers: document.getElementById('teachersSection'),
  users: document.getElementById('usersSection'),
  appraisals: document.getElementById('appraisalsSectionPanel'),
  students: document.getElementById('studentsSection'),
  messages: document.getElementById('messagesSection'),
  attendance: document.getElementById('attendanceSectionPanel'),
  payroll: document.getElementById('payrollSection'),
  analytics: document.getElementById('analyticsSection'),
  announcements: document.getElementById('announcementsSection'),
  settings: document.getElementById('settingsSectionPanel'),
  embedded: document.getElementById('embeddedFrameSection'),
  calendar: document.getElementById('academicCalendarSection'),
  assessments: document.getElementById('studentAssessmentsSection')
};`;

const replaceSections = `const sections = {
  dashboard: document.getElementById('dashboardSection'),
  classes: document.getElementById('classesSection'),
  teachers: document.getElementById('teachersSection'),
  users: document.getElementById('usersSection'),
  appraisals: document.getElementById('appraisalsSectionPanel'),
  students: document.getElementById('studentsSection'),
  messages: document.getElementById('messagesSection'),
  attendance: document.getElementById('attendanceSectionPanel'),
  payroll: document.getElementById('payrollSection'),
  analytics: document.getElementById('analyticsSection'),
  announcements: document.getElementById('announcementsSection'),
  settings: document.getElementById('settingsSectionPanel'),
  calendar: document.getElementById('academicCalendarSection'),
  assessments: document.getElementById('studentAssessmentsSection'),
  'attendance-log': document.getElementById('attendanceLogSectionPanel'),
  payslips: document.getElementById('payslipGeneratorSectionPanel'),
  'salary-schedules': document.getElementById('salarySchedulesSectionPanel'),
  reports: document.getElementById('reportsSectionPanel'),
  embedded: document.getElementById('embeddedFrameSection')
};`;

if (!content.includes(targetSections)) {
  console.error('FAIL: targetSections not found');
  process.exit(1);
}
content = content.replace(targetSections, replaceSections);
console.log('PASS: Step 6 updated sections map');

// 7. Update showSection triggers
const targetShowSection = `  // Section-specific activation triggers
  if (name === 'appraisals') {
    renderAppraisalsSection();
    return;
  }
  if (name === 'attendance-log' || name === 'attendance-summary') {
    openAttendanceLogPanel();
    return;
  }
  if (name === 'reports' || name === 'teacher-reports') {
    openReportsPanel();
    return;
  }
  if (name === 'payslips' || name === 'payslip-generator') {
    openPayslipGeneratorPanel();
    return;
  }
  if (name === 'salary-schedules') {
    openSalarySchedulesPanel();
    return;
  }
  if (name === 'calendar') {
    renderAcademicCalendar();
    return;
  }
  if (name === 'assessments') {
    renderStudentAssessments();
    return;
  }`;

const replaceShowSection = `  // Section-specific activation triggers
  if (name === 'appraisals') {
    renderAppraisalsSection();
    return;
  }
  if (name === 'attendance-log' || name === 'attendance-summary') {
    renderAttendanceLogSection();
    return;
  }
  if (name === 'reports' || name === 'teacher-reports') {
    renderReportsSection();
    return;
  }
  if (name === 'payslips' || name === 'payslip-generator') {
    renderPayslipGeneratorSection();
    return;
  }
  if (name === 'salary-schedules') {
    renderSalarySchedulesSection();
    return;
  }
  if (name === 'calendar') {
    renderAcademicCalendar();
    return;
  }
  if (name === 'assessments') {
    renderStudentAssessments();
    return;
  }
  if (name === 'settings') {
    renderSettingsSection();
    return;
  }
  if (name === 'announcements') {
    renderAnnouncements();
    return;
  }`;

if (!content.includes(targetShowSection)) {
  console.error('FAIL: targetShowSection not found');
  process.exit(1);
}
content = content.replace(targetShowSection, replaceShowSection);
console.log('PASS: Step 7 updated showSection triggers');

// Re-convert to CRLF if originally CRLF
if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(hrFile, content, 'utf8');
console.log('Successfully written Step 1-7 to hr-dashboard.html');
