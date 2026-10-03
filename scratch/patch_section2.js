const fs = require('fs');

const targetFile = 'd:/flawless-graphics/pages/hr/hr-dashboard.html';
let content = fs.readFileSync(targetFile, 'utf8');

const targetText = `      <!-- Section 2: Academic Placement -->
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
      </div>

      <div class="form-grid-2">
        <div>
          <label class="field-label">Academic Term / Semester</label>
          <input type="text" id="sm_term" class="modal-input" placeholder="e.g. 2026 - Term 1">
        </div>
        <div>
          <label class="field-label">Enrollment / Admission Date</label>
          <input type="date" id="sm_enrollmentDate" class="modal-input">
        </div>
      </div>`;

const replacementText = `      <!-- Section 2: Academic Placement & Auto-Generated Credentials -->
      <div class="form-section-title"><i class="fa-solid fa-chalkboard-user"></i> 2. Academic Placement &amp; Auto-Generated Credentials</div>
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

// Normalize line breaks
content = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetText.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, replacementText);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('✓ Successfully patched Section 2 with visible Roll No & Password fields');
} else {
  console.error('❌ Could not find normalizedTarget in file');
}
