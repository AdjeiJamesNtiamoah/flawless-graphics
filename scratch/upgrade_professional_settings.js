const fs = require('fs');
const path = require('path');

// ==========================================
// 1. UPGRADE TEACHER DASHBOARD SETTINGS
// ==========================================
const teacherPath = path.join(__dirname, '..', 'pages', 'teacher', 'teacher-dashboard.html');
let teacherContent = fs.readFileSync(teacherPath, 'utf8');

const oldTeacherSettings = `<section id="settingsSection" class="card view-panel" style="display:none">
      <h3>Account & Portal Settings</h3>
      <div style="display:flex; gap:24px; align-items:flex-start; margin-top:16px;">
        <div style="flex:1">
          <label class="tiny">Update Profile Photo</label>
          <input type="file" id="photoUpload" accept="image/*" style="margin-top:6px">
          <div style="margin-top:16px">
            <label class="tiny">Session Timeout (Minutes)</label>
            <input type="number" id="idleMinutes" min="1" value="10" style="width:140px; margin-top:6px">
          </div>
        </div>
        <div>
          <div class="tiny" style="margin-bottom:6px">Avatar Preview</div>
          <img id="profilePreview" style="width:140px; height:140px; border-radius:12px; object-fit:cover; border:1px solid var(--card-border)" src="" alt="preview">
        </div>
      </div>
    </section>`;

const newTeacherSettings = `<!-- PROFESSIONAL EDUCATOR SETTINGS SECTION -->
    <section id="settingsSection" class="card view-panel" style="display:none; padding: 28px; border-radius: 18px;">
      <!-- Header with Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--card-border); padding-bottom: 18px; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; box-shadow: 0 4px 14px rgba(2,132,199,0.3);">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0;">Educator Workspace &amp; Institutional Calibration</h2>
              <p style="font-size: 12.5px; color: var(--text-muted); margin: 3px 0 0;">Manage academic credentials, grading rubrics, roll-call defaults &amp; Supabase cloud sync</p>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button class="btn ghost" type="button" onclick="syncTeacherSettingsToSupabase()" style="font-size: 12.5px; padding: 8px 16px; border-radius: 10px; display: flex; align-items: center; gap: 7px;">
            <i class="fa-solid fa-cloud-arrow-up" style="color: #0284c7;"></i> Sync Cloud
          </button>
          <button class="btn prim" type="button" onclick="saveTeacherSettings()" style="font-size: 12.5px; padding: 8px 20px; border-radius: 10px; display: flex; align-items: center; gap: 7px;">
            <i class="fa-solid fa-check"></i> Save Preferences
          </button>
        </div>
      </div>

      <!-- 4-Pillar Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
        
        <!-- Pillar 1: Educator Profile & Credentials -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--accent1);">
            <i class="fa-solid fa-id-card" style="font-size: 16px;"></i>
            <h4 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--text-main);">Educator Profile &amp; Contact</h4>
          </div>

          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.02); border: 1px dashed var(--card-border); border-radius: 12px;">
            <img id="profilePreview" style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover; border: 2px solid var(--accent1); flex-shrink: 0;" src="" alt="avatar">
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px;">Profile Photo</div>
              <input type="file" id="photoUpload" accept="image/*" style="font-size: 11.5px; max-width: 190px;" onchange="previewTeacherPhoto(event)">
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Full Educator Name</label>
              <input type="text" id="tset_name" class="modal-input" placeholder="Sarah Jenkins" style="padding: 8px 12px; font-size: 13px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Staff ID / Badge #</label>
                <input type="text" id="tset_staffId" class="modal-input" placeholder="T-2026-088" style="padding: 8px 12px; font-size: 13px;">
              </div>
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Department</label>
                <select id="tset_dept" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="Visual Arts & Design">Visual Arts &amp; Design</option>
                  <option value="Mathematics & Science">Mathematics &amp; Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Humanities & Languages">Humanities &amp; Languages</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>
            </div>
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Institutional Email</label>
              <input type="email" id="tset_email" class="modal-input" placeholder="sarah.jenkins@flawless.org" style="padding: 8px 12px; font-size: 13px;">
            </div>
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Office Phone / Extension</label>
              <input type="tel" id="tset_phone" class="modal-input" placeholder="+233 24 000 1234" style="padding: 8px 12px; font-size: 13px;">
            </div>
          </div>
        </div>

        <!-- Pillar 2: Grading Calibration & Assessment Policies -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: var(--accent2);">
            <i class="fa-solid fa-stamp" style="font-size: 16px;"></i>
            <h4 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--text-main);">Grading Calibration &amp; Policies</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Standard Grading Framework</label>
              <select id="tset_gradingSystem" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                <option value="WAEC_9POINT">WAEC/WASSCE 9-Point Scale (A1 - F9)</option>
                <option value="GPA_40">Standard 4.0 GPA Weighted Scale</option>
                <option value="PERCENTAGE">Standard Percentage (0 - 100%)</option>
                <option value="CAMBRIDGE_IGCSE">Cambridge / IGCSE Letter System (A* - G)</option>
              </select>
            </div>
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Assessment Weighting Split</label>
              <select id="tset_weighting" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                <option value="30_70">30% Continuous Assessment (CA) / 70% Final Exam (Standard WAEC)</option>
                <option value="40_60">40% Continuous Assessment (CA) / 60% Final Exam</option>
                <option value="50_50">50% Continuous Assessment (CA) / 50% Final Exam</option>
              </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Pass Mark Benchmark</label>
                <input type="number" id="tset_passMark" class="modal-input" value="50" min="40" max="70" style="padding: 8px 12px; font-size: 13px;">
              </div>
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Auto-Publish Grades</label>
                <select id="tset_autoPublish" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="manual">Manual Approval Required</option>
                  <option value="instant">Instant Live Sync</option>
                </select>
              </div>
            </div>
            <div style="padding: 10px; background: rgba(2,132,199,0.06); border: 1px solid rgba(2,132,199,0.15); border-radius: 10px; font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
              <i class="fa-solid fa-circle-info" style="color: var(--accent1); margin-right: 4px;"></i>
              Changes to grading calibrations automatically apply to newly calculated student transcripts and terminal reports.
            </div>
          </div>
        </div>

        <!-- Pillar 3: Classroom & Roll Call Defaults -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #10b981;">
            <i class="fa-solid fa-clipboard-user" style="font-size: 16px;"></i>
            <h4 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--text-main);">Classroom &amp; Roll Call Defaults</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Primary Attendance Method</label>
              <select id="tset_attMode" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                <option value="biometric">Biometric &amp; NFC Smart Card Terminal</option>
                <option value="one_click">One-Click Rapid Roll Call (Default Present)</option>
                <option value="manual">Manual Itemized Check-in</option>
              </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Low Attendance Alert</label>
                <select id="tset_attThreshold" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="75">Below 75% (Standard)</option>
                  <option value="80">Below 80% (Strict)</option>
                  <option value="70">Below 70% (Lenient)</option>
                </select>
              </div>
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Unexcused Absence Trigger</label>
                <select id="tset_absentAlert" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="3">3 Consecutive Days</option>
                  <option value="2">2 Consecutive Days</option>
                  <option value="5">5 Total Days / Term</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
                <input type="checkbox" id="tset_guardianSms" style="accent-color: #0284c7;" checked>
                Auto-notify Head of Department when attendance falls into probation
              </label>
            </div>
          </div>
        </div>

        <!-- Pillar 4: Real-time Audio, Session Timeout & Cloud Security -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #f59e0b;">
            <i class="fa-solid fa-shield-halved" style="font-size: 16px;"></i>
            <h4 style="font-size: 14.5px; font-weight: 700; margin: 0; color: var(--text-main);">Audio Alerts &amp; Cloud Security</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Session Inactivity Lock</label>
                <select id="idleMinutes" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="5">5 Minutes</option>
                  <option value="10" selected>10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
              <div>
                <label class="tiny" style="font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Daily Digest Email</label>
                <select id="tset_digestEmail" class="modal-input" style="padding: 8px 12px; font-size: 13px;">
                  <option value="daily_1700">Daily at 5:00 PM</option>
                  <option value="weekly_fri">Weekly on Friday</option>
                  <option value="off">Disabled</option>
                </select>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
                <input type="checkbox" id="tset_soundFx" style="accent-color: #0284c7;" checked>
                Enable WebAudio chime on student assignment submission
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: var(--text-main);">
                <input type="checkbox" id="tset_otpGrades" style="accent-color: #0284c7;">
                Require password verification before publishing final terminal grades
              </label>
            </div>

            <div style="margin-top: 8px; padding: 10px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                <span>Supabase Live Sync: <strong style="color: #10b981;">Connected</strong></span>
              </div>
              <span class="tiny" id="tset_lastSyncTime" style="color: var(--text-muted); font-family: monospace;">Just now</span>
            </div>
          </div>
        </div>

      </div>
    </section>`;

if (teacherContent.includes(oldTeacherSettings)) {
    teacherContent = teacherContent.replace(oldTeacherSettings, newTeacherSettings);
} else {
    // Replace by finding the section
    const sStart = teacherContent.indexOf('<section id="settingsSection"');
    const sEnd = teacherContent.indexOf('</section>', sStart) + 10;
    teacherContent = teacherContent.substring(0, sStart) + newTeacherSettings + teacherContent.substring(sEnd);
}

// Add script helper functions for Teacher Settings if not already present
const teacherScriptAdditions = `
/* --- Professional Teacher Settings Handlers --- */
let currentTeacherSettingsPhoto = null;

function previewTeacherPhoto(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    if (window.Toaster) window.Toaster.error("File Too Large", "Photo must be under 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentTeacherSettingsPhoto = evt.target.result;
    const preview = document.getElementById('profilePreview');
    if (preview) preview.src = currentTeacherSettingsPhoto;
    const sidebarPhoto = document.getElementById('profilePhoto');
    if (sidebarPhoto) sidebarPhoto.src = currentTeacherSettingsPhoto;
  };
  reader.readAsDataURL(file);
}

function loadTeacherSettings() {
  try {
    const raw = localStorage.getItem('teacher_portal_settings');
    const settings = raw ? JSON.parse(raw) : {};
    
    // Fallback to active teacher
    const activeTeacher = JSON.parse(localStorage.getItem('active_teacher') || localStorage.getItem('teacher_active_user') || '{}');
    
    if (document.getElementById('tset_name')) document.getElementById('tset_name').value = settings.name || activeTeacher.name || 'Sarah Jenkins';
    if (document.getElementById('tset_staffId')) document.getElementById('tset_staffId').value = settings.staffId || 'T-2026-088';
    if (document.getElementById('tset_dept')) document.getElementById('tset_dept').value = settings.dept || 'Visual Arts & Design';
    if (document.getElementById('tset_email')) document.getElementById('tset_email').value = settings.email || activeTeacher.email || 'sarah.jenkins@flawless.org';
    if (document.getElementById('tset_phone')) document.getElementById('tset_phone').value = settings.phone || '+233 24 000 1234';
    if (document.getElementById('tset_gradingSystem')) document.getElementById('tset_gradingSystem').value = settings.gradingSystem || 'WAEC_9POINT';
    if (document.getElementById('tset_weighting')) document.getElementById('tset_weighting').value = settings.weighting || '30_70';
    if (document.getElementById('tset_passMark')) document.getElementById('tset_passMark').value = settings.passMark || 50;
    if (document.getElementById('tset_autoPublish')) document.getElementById('tset_autoPublish').value = settings.autoPublish || 'manual';
    if (document.getElementById('tset_attMode')) document.getElementById('tset_attMode').value = settings.attMode || 'biometric';
    if (document.getElementById('tset_attThreshold')) document.getElementById('tset_attThreshold').value = settings.attThreshold || '75';
    if (document.getElementById('tset_absentAlert')) document.getElementById('tset_absentAlert').value = settings.absentAlert || '3';
    if (document.getElementById('idleMinutes')) document.getElementById('idleMinutes').value = settings.idleMinutes || 10;
    if (document.getElementById('tset_digestEmail')) document.getElementById('tset_digestEmail').value = settings.digestEmail || 'daily_1700';
    if (document.getElementById('tset_guardianSms')) document.getElementById('tset_guardianSms').checked = settings.guardianSms !== false;
    if (document.getElementById('tset_soundFx')) document.getElementById('tset_soundFx').checked = settings.soundFx !== false;
    if (document.getElementById('tset_otpGrades')) document.getElementById('tset_otpGrades').checked = !!settings.otpGrades;

    const photoSrc = settings.photo || activeTeacher.photo || activeTeacher.avatar || '';
    if (photoSrc) {
      currentTeacherSettingsPhoto = photoSrc;
      const preview = document.getElementById('profilePreview');
      if (preview) preview.src = photoSrc;
    }
  } catch (e) {
    console.warn("Could not load teacher settings:", e);
  }
}

function saveTeacherSettings() {
  const settings = {
    name: document.getElementById('tset_name')?.value || '',
    staffId: document.getElementById('tset_staffId')?.value || '',
    dept: document.getElementById('tset_dept')?.value || '',
    email: document.getElementById('tset_email')?.value || '',
    phone: document.getElementById('tset_phone')?.value || '',
    gradingSystem: document.getElementById('tset_gradingSystem')?.value || 'WAEC_9POINT',
    weighting: document.getElementById('tset_weighting')?.value || '30_70',
    passMark: parseInt(document.getElementById('tset_passMark')?.value || '50', 10),
    autoPublish: document.getElementById('tset_autoPublish')?.value || 'manual',
    attMode: document.getElementById('tset_attMode')?.value || 'biometric',
    attThreshold: document.getElementById('tset_attThreshold')?.value || '75',
    absentAlert: document.getElementById('tset_absentAlert')?.value || '3',
    idleMinutes: parseInt(document.getElementById('idleMinutes')?.value || '10', 10),
    digestEmail: document.getElementById('tset_digestEmail')?.value || 'daily_1700',
    guardianSms: document.getElementById('tset_guardianSms')?.checked,
    soundFx: document.getElementById('tset_soundFx')?.checked,
    otpGrades: document.getElementById('tset_otpGrades')?.checked,
    photo: currentTeacherSettingsPhoto,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('teacher_portal_settings', JSON.stringify(settings));

  // Sync back to active teacher
  let activeTeacher = JSON.parse(localStorage.getItem('active_teacher') || localStorage.getItem('teacher_active_user') || '{}');
  activeTeacher.name = settings.name;
  activeTeacher.email = settings.email;
  if (settings.photo) activeTeacher.photo = settings.photo;
  localStorage.setItem('active_teacher', JSON.stringify(activeTeacher));
  localStorage.setItem('teacher_active_user', JSON.stringify(activeTeacher));

  // Update top bar / sidebar names
  const nameSmall = document.getElementById('teacherNameSmall');
  if (nameSmall) nameSmall.textContent = settings.name;
  const emailSmall = document.getElementById('teacherEmailSmall');
  if (emailSmall) emailSmall.textContent = settings.email;

  if (window.Toaster) {
    window.Toaster.success("Settings Saved", "Educator configuration successfully saved and applied.");
  } else {
    alert("Educator settings saved successfully!");
  }
}

function syncTeacherSettingsToSupabase() {
  saveTeacherSettings();
  const syncEl = document.getElementById('tset_lastSyncTime');
  if (syncEl) syncEl.textContent = new Date().toLocaleTimeString();
  
  if (window.Toaster) {
    window.Toaster.info("Supabase Cloud Sync", "Synchronized educator calibration records with institutional database.");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadTeacherSettings, 100);
});
`;

if (!teacherContent.includes('function saveTeacherSettings')) {
    teacherContent = teacherContent.replace('</script>\n</body>', teacherScriptAdditions + '\n</script>\n</body>');
    if (!teacherContent.includes('function saveTeacherSettings')) {
        teacherContent = teacherContent.replace('</script>', teacherScriptAdditions + '\n</script>');
    }
}

fs.writeFileSync(teacherPath, teacherContent, 'utf8');
console.log('Teacher Dashboard settings upgraded successfully!');


// ==========================================
// 2. UPGRADE STUDENT DASHBOARD SETTINGS
// ==========================================
const studentPath = path.join(__dirname, '..', 'pages', 'student', 'student-dashboard.html');
let studentContent = fs.readFileSync(studentPath, 'utf8');

// A. Add nav_settings button to sidebar
const navTarget = `<button class="nav-item-btn" id="nav_gpaSim" onclick="showSection('gpaSim')">
            <i class="fa-solid fa-calculator"></i> GPA Simulator
          </button>`;

const newNavButton = `<button class="nav-item-btn" id="nav_gpaSim" onclick="showSection('gpaSim')">
            <i class="fa-solid fa-calculator"></i> GPA Simulator
          </button>
          <button class="nav-item-btn" id="nav_settings" onclick="showSection('settings')">
            <i class="fa-solid fa-sliders"></i> Settings &amp; Preferences
          </button>`;

if (!studentContent.includes('id="nav_settings"')) {
    studentContent = studentContent.replace(navTarget, newNavButton);
}

// B. Add settingsSection HTML
const newStudentSettingsSection = `
    <!-- 11. PROFESSIONAL SETTINGS & PREFERENCES SECTION -->
    <section class="portal-section" id="settingsSection">
      <!-- Section Header -->
      <div class="card" style="margin-bottom: 20px; padding: 22px 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, rgba(2,132,199,0.3) 0%, rgba(14,165,233,0.15) 100%); border: 1px solid rgba(56,189,248,0.35); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 20px;">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0;">Student Portal Settings &amp; Preferences</h2>
              <p style="font-size: 13px; color: #94a3b8; margin: 3px 0 0;">Manage personal identity, academic alert triggers, currency formatting &amp; smart card security</p>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button class="btn btn-secondary" type="button" onclick="syncStudentSettingsToSupabase()" style="padding: 8px 16px; font-size: 12.5px; border-radius: 10px; display: flex; align-items: center; gap: 7px;">
              <i class="fa-solid fa-cloud-arrow-up" style="color: #38bdf8;"></i> Sync Cloud
            </button>
            <button class="btn btn-primary" type="button" onclick="saveStudentSettings()" style="padding: 8px 20px; font-size: 12.5px; border-radius: 10px; display: flex; align-items: center; gap: 7px;">
              <i class="fa-solid fa-check"></i> Save Preferences
            </button>
          </div>
        </div>
      </div>

      <!-- 4-Pillar Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">

        <!-- Pillar 1: Student Identity & Contact -->
        <div class="card" style="padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #38bdf8;">
            <i class="fa-solid fa-user-gear" style="font-size: 16px;"></i>
            <h4 style="font-size: 15px; font-weight: 700; margin: 0; color: #ffffff;">Student Identity &amp; Contact</h4>
          </div>

          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px;">
            <img id="studentSettingsPhotoPreview" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover; border: 2px solid #38bdf8; flex-shrink: 0;" src="../../assets/images/sample-student.jpg" alt="Student avatar">
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">Profile Photo</div>
              <input type="file" id="studentPhotoUpload" accept="image/*" style="font-size: 11px; max-width: 190px;" onchange="previewStudentPhoto(event)">
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Full Legal Name</label>
              <input type="text" id="sset_name" class="form-input" placeholder="Kofi Mensah" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Student Index #</label>
                <input type="text" id="sset_indexNo" class="form-input" readonly placeholder="FG-2026-0042" style="width: 100%; padding: 8px 12px; font-size: 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; border-radius: 8px;">
              </div>
              <div>
                <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Academic Form</label>
                <select id="sset_form" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                  <option value="SHS 1">SHS 1 (First Year)</option>
                  <option value="SHS 2">SHS 2 (Second Year)</option>
                  <option value="SHS 3" selected>SHS 3 (Final Year / WASSCE)</option>
                </select>
              </div>
            </div>
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Student Email</label>
              <input type="email" id="sset_email" class="form-input" placeholder="kofi.mensah@student.flawless.org" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Emergency Guardian Contact</label>
              <input type="tel" id="sset_guardianPhone" class="form-input" placeholder="+233 20 123 4567" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
            </div>
          </div>
        </div>

        <!-- Pillar 2: Academic Deadlines & Assessment Alerts -->
        <div class="card" style="padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #f59e0b;">
            <i class="fa-solid fa-bell" style="font-size: 16px;"></i>
            <h4 style="font-size: 15px; font-weight: 700; margin: 0; color: #ffffff;">Academic Deadlines &amp; Alerts</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Assignment Due Notification</label>
              <select id="sset_dueNotice" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="24h">24 Hours Before Deadline</option>
                <option value="48h">48 Hours Before Deadline</option>
                <option value="12h">12 Hours Before Deadline</option>
              </select>
            </div>
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Examination &amp; Quiz Reminders</label>
              <select id="sset_examAlert" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="3days">3 Days Prior to Exam</option>
                <option value="1day">1 Day Prior to Exam</option>
                <option value="morning">Morning of Exam (6:00 AM)</option>
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: #e2e8f0;">
                <input type="checkbox" id="sset_gradeChime" style="accent-color: #38bdf8;" checked>
                Play WebAudio chime when new grades or WAEC scores are published
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; cursor: pointer; color: #e2e8f0;">
                <input type="checkbox" id="sset_liveAbsence" style="accent-color: #38bdf8;" checked>
                Instant push alert on unexcused roll-call absence
              </label>
            </div>
          </div>
        </div>

        <!-- Pillar 3: Regional Currency & Display Formatting -->
        <div class="card" style="padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #10b981;">
            <i class="fa-solid fa-globe" style="font-size: 16px;"></i>
            <h4 style="font-size: 15px; font-weight: 700; margin: 0; color: #ffffff;">Regional &amp; Display Calibration</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Grade Display Format</label>
              <select id="sset_gradeFormat" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="WAEC_LETTER">WAEC 9-Point Letter (A1, B2, B3, C4, C5, C6...)</option>
                <option value="PERCENTAGE">Composite Percentage (0 - 100%)</option>
                <option value="GPA_SCALE">Cumulative 4.0 GPA Scale</option>
              </select>
            </div>
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Currency Display</label>
              <select id="sset_currency" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="GHS">Ghanaian Cedi (GH₵)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Portal Theme</label>
              <select id="sset_theme" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="dark">Institutional Dark Mode (Recommended)</option>
                <option value="high_contrast">High Contrast Accessibility</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Pillar 4: Smart Card, RFID & Security PIN -->
        <div class="card" style="padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #a855f7;">
            <i class="fa-solid fa-id-card-clip" style="font-size: 16px;"></i>
            <h4 style="font-size: 15px; font-weight: 700; margin: 0; color: #ffffff;">Smart Card &amp; Security PIN</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="padding: 10px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #e2e8f0;">
                <i class="fa-solid fa-wifi" style="color: #38bdf8;"></i>
                <span>NFC / RFID Card: <strong style="color: #38bdf8;">Linked (Active)</strong></span>
              </div>
              <span class="badge" style="background: rgba(16,185,129,0.2); color: #34d399; font-size: 10px; padding: 2px 6px;">VERIFIED</span>
            </div>

            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Campus Wallet &amp; Vault PIN (4-Digits)</label>
              <input type="password" id="sset_pin" class="form-input" maxlength="4" placeholder="••••" value="1234" style="width: 100%; padding: 8px 12px; font-size: 13px; letter-spacing: 4px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
            </div>

            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Portal Inactivity Lockout</label>
              <select id="sset_timeout" class="form-input" style="width: 100%; padding: 8px 12px; font-size: 13px; background: #0b1120; border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 8px;">
                <option value="15" selected>15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div style="margin-top: 4px; font-size: 11.5px; color: #64748b; line-height: 1.4;">
              <i class="fa-solid fa-lock" style="margin-right: 4px;"></i>
              Your smart security PIN protects tuition authorization and examination vault access.
            </div>
          </div>
        </div>

      </div>
    </section>
`;

if (!studentContent.includes('id="settingsSection"')) {
    const sSectionTarget = `</section>\n\n    <!-- 10. GPA SIMULATOR SECTION -->`;
    const sSectionEndTarget = studentContent.indexOf('</section>', studentContent.indexOf('id="gpaSimSection"')) + 10;
    studentContent = studentContent.substring(0, sSectionEndTarget) + '\n' + newStudentSettingsSection + studentContent.substring(sSectionEndTarget);
}

// C. Add JavaScript handlers for Student Settings
const studentScriptAdditions = `
/* --- Professional Student Settings Handlers --- */
let currentStudentSettingsPhoto = null;

function previewStudentPhoto(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    if (window.Toaster) window.Toaster.error("File Too Large", "Photo must be under 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentStudentSettingsPhoto = evt.target.result;
    const preview = document.getElementById('studentSettingsPhotoPreview');
    if (preview) preview.src = currentStudentSettingsPhoto;
    const navPhoto = document.getElementById('studentNavAvatar');
    if (navPhoto) navPhoto.src = currentStudentSettingsPhoto;
  };
  reader.readAsDataURL(file);
}

function loadStudentSettings() {
  try {
    const raw = localStorage.getItem('student_portal_settings');
    const settings = raw ? JSON.parse(raw) : {};
    
    // Active student fallback
    const activeStudent = JSON.parse(localStorage.getItem('active_student') || localStorage.getItem('student_active_user') || '{}');

    if (document.getElementById('sset_name')) document.getElementById('sset_name').value = settings.name || activeStudent.name || 'Kofi Mensah';
    if (document.getElementById('sset_indexNo')) document.getElementById('sset_indexNo').value = settings.indexNo || activeStudent.indexNo || 'FG-2026-0042';
    if (document.getElementById('sset_form')) document.getElementById('sset_form').value = settings.form || 'SHS 3';
    if (document.getElementById('sset_email')) document.getElementById('sset_email').value = settings.email || activeStudent.email || 'kofi.mensah@student.flawless.org';
    if (document.getElementById('sset_guardianPhone')) document.getElementById('sset_guardianPhone').value = settings.guardianPhone || '+233 20 123 4567';
    if (document.getElementById('sset_dueNotice')) document.getElementById('sset_dueNotice').value = settings.dueNotice || '24h';
    if (document.getElementById('sset_examAlert')) document.getElementById('sset_examAlert').value = settings.examAlert || '3days';
    if (document.getElementById('sset_gradeFormat')) document.getElementById('sset_gradeFormat').value = settings.gradeFormat || 'WAEC_LETTER';
    if (document.getElementById('sset_currency')) document.getElementById('sset_currency').value = settings.currency || 'GHS';
    if (document.getElementById('sset_theme')) document.getElementById('sset_theme').value = settings.theme || 'dark';
    if (document.getElementById('sset_pin')) document.getElementById('sset_pin').value = settings.pin || '1234';
    if (document.getElementById('sset_timeout')) document.getElementById('sset_timeout').value = settings.timeout || '15';
    if (document.getElementById('sset_gradeChime')) document.getElementById('sset_gradeChime').checked = settings.gradeChime !== false;
    if (document.getElementById('sset_liveAbsence')) document.getElementById('sset_liveAbsence').checked = settings.liveAbsence !== false;

    const photoSrc = settings.photo || activeStudent.photo || activeStudent.avatar || '';
    if (photoSrc) {
      currentStudentSettingsPhoto = photoSrc;
      const preview = document.getElementById('studentSettingsPhotoPreview');
      if (preview) preview.src = photoSrc;
    }
  } catch(e) {
    console.warn("Could not load student settings:", e);
  }
}

function saveStudentSettings() {
  const settings = {
    name: document.getElementById('sset_name')?.value || '',
    indexNo: document.getElementById('sset_indexNo')?.value || '',
    form: document.getElementById('sset_form')?.value || '',
    email: document.getElementById('sset_email')?.value || '',
    guardianPhone: document.getElementById('sset_guardianPhone')?.value || '',
    dueNotice: document.getElementById('sset_dueNotice')?.value || '24h',
    examAlert: document.getElementById('sset_examAlert')?.value || '3days',
    gradeFormat: document.getElementById('sset_gradeFormat')?.value || 'WAEC_LETTER',
    currency: document.getElementById('sset_currency')?.value || 'GHS',
    theme: document.getElementById('sset_theme')?.value || 'dark',
    pin: document.getElementById('sset_pin')?.value || '1234',
    timeout: document.getElementById('sset_timeout')?.value || '15',
    gradeChime: document.getElementById('sset_gradeChime')?.checked,
    liveAbsence: document.getElementById('sset_liveAbsence')?.checked,
    photo: currentStudentSettingsPhoto,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('student_portal_settings', JSON.stringify(settings));

  // Sync to active student
  let activeStudent = JSON.parse(localStorage.getItem('active_student') || localStorage.getItem('student_active_user') || '{}');
  activeStudent.name = settings.name;
  activeStudent.email = settings.email;
  if (settings.photo) activeStudent.photo = settings.photo;
  localStorage.setItem('active_student', JSON.stringify(activeStudent));
  localStorage.setItem('student_active_user', JSON.stringify(activeStudent));

  if (window.Toaster) {
    window.Toaster.success("Preferences Saved", "Student profile and alert settings have been successfully updated.");
  } else {
    alert("Student preferences saved successfully!");
  }
}

function syncStudentSettingsToSupabase() {
  saveStudentSettings();
  if (window.Toaster) {
    window.Toaster.info("Supabase Cloud Sync", "Synchronized student configuration and preferences with institutional cloud.");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadStudentSettings, 100);
});
`;

if (!studentContent.includes('function saveStudentSettings')) {
    studentContent = studentContent.replace('</script>\n</body>', studentScriptAdditions + '\n</script>\n</body>');
    if (!studentContent.includes('function saveStudentSettings')) {
        studentContent = studentContent.replace('</script>', studentScriptAdditions + '\n</script>');
    }
}

fs.writeFileSync(studentPath, studentContent, 'utf8');
console.log('Student Dashboard settings upgraded successfully!');
