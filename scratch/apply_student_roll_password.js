const fs = require('fs');

const targetFile = 'd:/flawless-graphics/pages/hr/hr-dashboard.html';
let html = fs.readFileSync(targetFile, 'utf8');

// 1. Add Initial Portal Password input into Section 2 of #studentModal
const oldSection2 = `      <!-- Section 2: Academic Placement -->
      <div class="form-section-title"><i class="fa-solid fa-chalkboard-user"></i> 2. Academic Placement &amp; Enrollment</div>
      <div class="form-grid-3">
        <div>
          <label class="field-label">Student ID / Roll No <span class="req">*</span></label>
          <input type="text" id="sm_roll" class="modal-input" placeholder="e.g. STU-2026-001" required>
        </div>
        <div>
          <label class="field-label">Assign Class / Grade <span class="req">*</span></label>
          <select id="sm_classId" class="modal-input" required></select>
        </div>
        <div>
          <label class="field-label">Enrollment Status</label>
          <select id="sm_status" class="modal-input">
            <option value="Active">Active Student</option>
            <option value="Probation">On Probation</option>
            <option value="Pending">Pending Approval</option>
            <option value="Scholarship">Scholarship Recipient</option>
          </select>
        </div>
      </div>`;

const newSection2 = `      <!-- Section 2: Academic Placement -->
      <div class="form-section-title"><i class="fa-solid fa-chalkboard-user"></i> 2. Academic Placement &amp; Enrollment</div>
      <div class="form-grid-3">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin-bottom:0;">Student ID / Roll No <span class="req">*</span></label>
            <button type="button" onclick="regenerateStudentRoll()" style="background:none; border:none; color:var(--primary); font-size:11px; font-weight:700; cursor:pointer; padding:0;" title="Generate Next Available Roll No">
              <i class="fa-solid fa-arrows-rotate"></i> Auto-Gen
            </button>
          </div>
          <input type="text" id="sm_roll" class="modal-input" placeholder="e.g. STU-2026-001" style="font-family:'JetBrains Mono', monospace; font-weight:700; color:var(--primary);" required>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin-bottom:0;">Initial Portal Password <span class="req">*</span></label>
            <button type="button" onclick="regenerateStudentPassword()" style="background:none; border:none; color:#10b981; font-size:11px; font-weight:700; cursor:pointer; padding:0;" title="Generate Secure Password">
              <i class="fa-solid fa-key"></i> Auto-Gen
            </button>
          </div>
          <div style="position:relative; display:flex; align-items:center;">
            <input type="text" id="sm_password" class="modal-input" placeholder="e.g. Stu@8492" style="font-family:'JetBrains Mono', monospace; font-weight:700; color:#059669; padding-right:58px;" required>
            <button type="button" onclick="toggleStudentFormPasswordVis()" style="position:absolute; right:28px; background:none; border:none; color:var(--muted); cursor:pointer; font-size:12px;" title="Toggle Password Visibility">
              <i class="fa-solid fa-eye" id="sm_passEyeIcon"></i>
            </button>
            <button type="button" onclick="regenerateStudentPassword()" style="position:absolute; right:6px; background:none; border:none; color:#10b981; cursor:pointer; font-size:12px;" title="Regenerate Password">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="field-label">Assign Class / Grade <span class="req">*</span></label>
          <select id="sm_classId" class="modal-input" required></select>
        </div>
      </div>
      <div class="form-grid-3" style="margin-top:10px;">
        <div>
          <label class="field-label">Enrollment Status</label>
          <select id="sm_status" class="modal-input">
            <option value="Active">Active Student</option>
            <option value="Probation">On Probation</option>
            <option value="Pending">Pending Approval</option>
            <option value="Scholarship">Scholarship Recipient</option>
          </select>
        </div>
        <div>
          <label class="field-label">Academic Term / Semester</label>
          <input type="text" id="sm_term" class="modal-input" placeholder="e.g. 2026 - Term 1">
        </div>
        <div>
          <label class="field-label">Enrollment / Admission Date</label>
          <input type="date" id="sm_enrollmentDate" class="modal-input">
        </div>
      </div>`;

// Replace Section 2 & remove duplicated grid below it
const oldSection2FullPattern = /<!-- Section 2: Academic Placement -->[\s\S]*?<!-- Section 3: Parent \/ Guardian &amp; Contacts -->/;

const newSection2Full = newSection2 + `\n\n      <!-- Section 3: Parent / Guardian &amp; Contacts -->`;

if (oldSection2FullPattern.test(html)) {
  html = html.replace(oldSection2FullPattern, newSection2Full);
  console.log('✓ Successfully enhanced #studentModal Section 2 with visible Roll No & Password fields');
} else {
  console.warn('⚠️ Could not match oldSection2FullPattern');
}

// 2. Enhance #studentCredentialsModal with visible password, copy buttons, and printable slip
const oldCredModalPattern = /<!-- STUDENT PORTAL ACCESS & CREDENTIALS HANDOUT MODAL -->[\s\S]*?<!-- SYSTEM USER ACCOUNT MANAGEMENT MODAL -->/;

const newCredModal = `<!-- STUDENT PORTAL ACCESS & CREDENTIALS HANDOUT MODAL (Auto-Generated & Visible) -->
<div class="custom-modal-overlay" id="studentCredentialsModal" onclick="if(event.target===this)closeStudentCredentialsModal()">
  <div class="modal-card" style="max-width:540px; background:var(--card-bg, #ffffff); border-radius:20px; box-shadow:0 30px 70px rgba(0,0,0,0.3); border:1px solid var(--border); overflow:hidden;">
    <!-- Modal Header -->
    <div style="background:linear-gradient(135deg, #0284c7 0%, #2563eb 100%); padding:22px 24px; color:#fff; position:relative;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; font-size:24px; color:#fff;">
          <i class="fa-solid fa-key"></i>
        </div>
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:800; letter-spacing:-0.3px;">Student Registered Successfully!</h3>
          <div style="font-size:12px; opacity:0.9; margin-top:2px;">Official Login ID &amp; Generated Password Handout</div>
        </div>
      </div>
      <button type="button" onclick="closeStudentCredentialsModal()" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.2); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" title="Close (Esc)"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div style="padding:22px 24px;" id="printableStudentSlipArea">
      <!-- Success Confirmation Alert -->
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px 16px; display:flex; align-items:center; gap:12px; margin-bottom:18px;">
        <i class="fa-solid fa-circle-check" style="color:#16a34a; font-size:20px; flex-shrink:0;"></i>
        <div style="font-size:12.5px; color:#15803d; font-weight:600;">
          Student account created &amp; synced to Supabase Cloud! The student can immediately sign in to the Student Workspace.
        </div>
      </div>

      <!-- Credentials Card -->
      <div style="background:rgba(0,0,0,0.03); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:18px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
          <div>
            <div style="font-size:11px; text-transform:uppercase; color:var(--muted); font-weight:700; letter-spacing:0.5px;">Student Full Name</div>
            <div id="sc_name" style="font-size:15px; font-weight:800; color:var(--text); margin-top:3px;">--</div>
          </div>
          <div>
            <div style="font-size:11px; text-transform:uppercase; color:var(--muted); font-weight:700; letter-spacing:0.5px;">Class / Stream</div>
            <div id="sc_class" style="font-size:14px; font-weight:700; color:var(--primary); margin-top:3px;">--</div>
          </div>
        </div>

        <div style="border-top:1px dashed var(--border); padding-top:14px; display:flex; flex-direction:column; gap:12px;">
          <!-- 1. ROLL NUMBER (LOGIN ID) -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; text-transform:uppercase; color:var(--muted); font-weight:700; letter-spacing:0.5px;"><i class="fa-solid fa-id-badge" style="color:var(--primary); margin-right:4px;"></i> Student Roll Number (Login ID)</span>
              <span class="badge-pill badge-blue" style="font-size:10px; padding:1px 6px;">Sign-In Username</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--card-bg, #fff); border:1px solid var(--border); border-radius:10px; padding:10px 14px; margin-top:4px;">
              <code id="sc_roll" style="font-size:15.5px; font-weight:800; color:#0284c7; letter-spacing:0.5px; font-family:'JetBrains Mono', monospace;">--</code>
              <button type="button" class="btn ghost btn-sm" onclick="copyStudentCredential('sc_roll', 'Student Roll ID copied!')" style="padding:4px 10px; font-size:11.5px; font-weight:700;">
                <i class="fa-solid fa-copy"></i> Copy ID
              </button>
            </div>
          </div>

          <!-- 2. GENERATED VISIBLE PASSWORD -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; text-transform:uppercase; color:var(--muted); font-weight:700; letter-spacing:0.5px;"><i class="fa-solid fa-lock-open" style="color:#059669; margin-right:4px;"></i> Generated Password (Visible)</span>
              <span class="badge-pill badge-green" style="font-size:10px; padding:1px 6px;"><i class="fa-solid fa-eye"></i> Visible</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--card-bg, #fff); border:1.5px solid rgba(16, 185, 129, 0.4); border-radius:10px; padding:10px 14px; margin-top:4px; box-shadow:0 2px 8px rgba(16, 185, 129, 0.08);">
              <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-key" style="color:#10b981; font-size:14px;"></i>
                <code id="sc_pass" style="font-size:16px; font-weight:800; color:#0f172a; letter-spacing:1px; font-family:'JetBrains Mono', monospace;">--</code>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <button type="button" class="btn ghost btn-sm" onclick="toggleModalPasswordMask()" title="Toggle Mask" style="padding:4px 8px; font-size:12px; color:var(--muted);">
                  <i class="fa-solid fa-eye" id="sc_passEyeIcon"></i>
                </button>
                <button type="button" class="btn btn-sm" onclick="copyStudentCredential('sc_pass', 'Password copied!')" style="padding:4px 12px; font-size:11.5px; font-weight:700; background:#10b981; color:#fff; border-color:#059669;">
                  <i class="fa-solid fa-copy"></i> Copy Password
                </button>
              </div>
            </div>
          </div>

          <!-- 3. STUDENT PORTAL URL -->
          <div>
            <div style="font-size:11px; text-transform:uppercase; color:var(--muted); font-weight:700; letter-spacing:0.5px;">Student Portal Sign In URL</div>
            <div style="font-size:12px; color:var(--primary); margin-top:3px; font-family:'JetBrains Mono', monospace; word-break:break-all; background:var(--card-bg, #fff); padding:6px 10px; border-radius:6px; border:1px solid var(--border);">
              pages/student/student-login.html
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn ghost btn-sm" onclick="copyFullCredentialSlip()" style="font-size:12px; font-weight:700;">
            <i class="fa-solid fa-clipboard-list"></i> Copy Complete Slip
          </button>
          <button type="button" class="btn ghost btn-sm" onclick="printStudentCredentialSlip()" style="font-size:12px; font-weight:700;">
            <i class="fa-solid fa-print"></i> Print Slip
          </button>
        </div>
        <button type="button" class="btn" style="background:#0284c7; color:#fff; font-size:12px; font-weight:700; padding:8px 18px;" onclick="closeStudentCredentialsModal()">
          <i class="fa-solid fa-check"></i> Done &amp; Close
        </button>
      </div>
    </div>
  </div>
</div>

<!-- SYSTEM USER ACCOUNT MANAGEMENT MODAL -->`;

if (oldCredModalPattern.test(html)) {
  html = html.replace(oldCredModalPattern, newCredModal);
  console.log('✓ Successfully replaced #studentCredentialsModal with visible password layout and copy/print actions');
} else {
  console.warn('⚠️ Could not match oldCredModalPattern');
}

fs.writeFileSync(targetFile, html, 'utf8');
console.log('✓ HTML markup updated successfully');
