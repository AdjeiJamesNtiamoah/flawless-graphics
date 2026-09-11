const fs = require('fs');
const path = require('path');

const hrFile = path.join(__dirname, '..', 'pages', 'hr', 'hr-dashboard.html');
let content = fs.readFileSync(hrFile, 'utf8');

console.log('Original HR file length:', content.length);

// 1. Fix DOM Nesting: Close #appraisalsSectionPanel
// Target: after <tbody id="appraisalsTableBody">...</tbody>\n      </table>\n    </div>
// followed by <!-- 11. ACADEMIC CALENDAR
const appraisalsCloseTarget = `        <tbody id="appraisalsTableBody">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    </div>
  <!-- 11. ACADEMIC CALENDAR FOR STAFF REVIEW SECTION -->`;

const appraisalsCloseReplacement = `        <tbody id="appraisalsTableBody">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    </div>
  </section>

  <!-- 11. ACADEMIC CALENDAR FOR STAFF REVIEW SECTION -->`;

if (!content.includes(appraisalsCloseTarget)) {
  console.error('ERROR: Could not find appraisals close target!');
  process.exit(1);
}
content = content.replace(appraisalsCloseTarget, appraisalsCloseReplacement);
console.log('Successfully added closing </section> to #appraisalsSectionPanel');

// 2. Modernize #announcementsSection and #settingsSectionPanel
// Let's locate the chunk from <!-- 8. ANNOUNCEMENTS SECTION --> to <!-- 10. STAFF PERFORMANCE
const announceAndSettingsTarget = `  <!-- 8. ANNOUNCEMENTS SECTION -->
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

const newAnnouncementsAndSettings = `  <!-- 8. CROSS-PORTAL BROADCASTS & INSTITUTIONAL DIRECTIVES HUB -->
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

if (!content.includes(announceAndSettingsTarget)) {
  console.error('ERROR: Could not find announceAndSettingsTarget!');
  process.exit(1);
}
content = content.replace(announceAndSettingsTarget, newAnnouncementsAndSettings);
console.log('Successfully upgraded #announcementsSection and #settingsSectionPanel');

fs.writeFileSync(hrFile, content, 'utf8');
console.log('Saved HR step 1 & 2');
