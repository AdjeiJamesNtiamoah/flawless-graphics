const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/hr/hr-dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetModalStart = '<!-- MODAL: ADD NEW CLASS -->';
const targetModalEnd = '<!-- PROFESSIONAL REGISTER STUDENT PROFILE MODAL (Matching teacher-dashboard.html) -->';

const startIndex = content.indexOf(targetModalStart);
const endIndex = content.indexOf(targetModalEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target markers not found!', { startIndex, endIndex });
  process.exit(1);
}

const replacement = `<!-- SLIDE-OVER DRAWER & BACKDROP: ADD ACADEMIC CLASSROOM -->
<div class="slide-over-backdrop" id="addClassDrawerBackdrop" onclick="closeAddClassModal()"></div>
<div class="modal-backdrop" id="addClassModalBackdrop" style="display:none;" aria-hidden="true"></div>

<div class="slide-over-panel slide-over-wide" id="addClassDrawer" role="dialog" aria-modal="true" aria-labelledby="addClassDrawerTitle">
  <!-- Slide-Over Header -->
  <div class="slide-over-header" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, rgba(99, 91, 252, 0.05) 100%);">
    <div class="slide-over-header-left">
      <div class="slide-over-icon-box" style="background: rgba(16, 185, 129, 0.16); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.32);">
        <i class="fa-solid fa-folder-plus"></i>
      </div>
      <div class="slide-over-header-titles">
        <h3 class="slide-over-title" id="addClassDrawerTitle" style="font-size: 17.5px; font-weight: 800; color: var(--text);">Add Academic Classroom</h3>
        <div class="slide-over-subtitle" style="font-size: 12px; color: var(--muted);">Register new subject class into school database</div>
      </div>
    </div>
    <button type="button" class="slide-over-close-btn" onclick="closeAddClassModal()" title="Close Drawer (Esc)">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <!-- Slide-Over Body -->
  <div class="slide-over-body" style="padding: 20px 24px;">
    <!-- Live Spec Preview Strip -->
    <div class="so-card" style="border-left: 4px solid #10b981; background: var(--bg); margin-bottom: 20px; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="preview_class_code" style="font-size: 11.5px; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #10b981; letter-spacing: 0.5px;">CLS-11A</span>
          <span id="preview_class_grade" style="font-size: 11.5px; font-weight: 700; color: var(--primary);">Grade 10</span>
        </div>
        <span style="font-size: 11px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 9999px;">
          <i class="fa-solid fa-circle-dot" style="font-size: 8px; margin-right: 4px;"></i> Live Preview
        </span>
      </div>
      <div id="preview_class_title" style="font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 6px;">Grade 11 - Web Engineering</div>
      <div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--muted);">
        <span><i class="fa-solid fa-book-open" style="color: var(--primary); margin-right: 4px;"></i> <span id="preview_class_subject">Computer Science</span></span>
        <span><i class="fa-solid fa-door-open" style="color: #f59e0b; margin-right: 4px;"></i> <span id="preview_class_room">Room 101</span></span>
        <span><i class="fa-solid fa-clock" style="color: #6366f1; margin-right: 4px;"></i> <span id="preview_class_schedule">Tue, Thu 10am</span></span>
        <span><i class="fa-solid fa-users" style="color: #10b981; margin-right: 4px;"></i> <span id="preview_class_capacity">30 Seats</span></span>
      </div>
    </div>

    <form id="addClassForm" onsubmit="event.preventDefault(); submitAddClass();">
      <!-- Row 1: Class Code & Title -->
      <div style="display: grid; grid-template-columns: 140px 1fr; gap: 12px; margin-bottom: 14px;">
        <div class="so-form-group" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="so-label" style="margin-bottom: 0;">Class Code *</label>
            <button type="button" onclick="autoGenerateClassCode()" style="background: none; border: none; font-size: 10px; font-weight: 800; color: var(--primary); cursor: pointer; padding: 0;" title="Generate unique class code">Auto</button>
          </div>
          <input id="new_class_code" class="so-input" placeholder="CLS-11A" required oninput="updateAddClassPreview()" style="font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
        </div>
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Class Title *</label>
          <input id="new_class_name" class="so-input" placeholder="e.g. Grade 11 - Web Engineering" required oninput="updateAddClassPreview()">
        </div>
      </div>

      <!-- Quick Title Presets -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Curriculum Stream Suggestions:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <button type="button" class="btn ghost btn-sm" onclick="setPresetClass('CSC-10A', 'Grade 10 - Web Engineering', 'Computer Science', 'Grade 10', 'ICT Lab 1', 'Mon, Wed 09:00 AM')" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Web Eng (10)</button>
          <button type="button" class="btn ghost btn-sm" onclick="setPresetClass('ART-11B', 'Grade 11 - Graphic Communication', 'Visual Arts', 'Grade 11', 'Studio 3B', 'Tue, Thu 10:00 AM')" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Graphic Comm (11)</button>
          <button type="button" class="btn ghost btn-sm" onclick="setPresetClass('MTH-12A', 'Grade 12 - Applied Mathematics', 'Mathematics', 'Grade 12', 'Room 204', 'Daily 08:30 AM')" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Mathematics (12)</button>
          <button type="button" class="btn ghost btn-sm" onclick="setPresetClass('SCI-10B', 'Grade 10 - Physical Sciences', 'Physics', 'Grade 10', 'Science Lab 2', 'Tue, Thu 01:00 PM')" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">Physics (10)</button>
        </div>
      </div>

      <!-- Row 2: Subject Field & Grade Level -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Subject Field *</label>
          <input id="new_class_subject" class="so-input" placeholder="Computer Science" required oninput="updateAddClassPreview()">
        </div>
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Grade Level *</label>
          <select id="new_class_grade" class="so-select" required onchange="updateAddClassPreview()">
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10" selected>Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Advanced Lab">Advanced Lab</option>
            <option value="Tertiary & Vocational">Tertiary &amp; Vocational</option>
          </select>
        </div>
      </div>

      <!-- Grade Level Preset Pills -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="class-grade-pill active" data-grade="Grade 10" onclick="selectClassGradePill('Grade 10')">Grade 10</button>
          <button type="button" class="class-grade-pill" data-grade="Grade 9" onclick="selectClassGradePill('Grade 9')">Grade 9</button>
          <button type="button" class="class-grade-pill" data-grade="Grade 11" onclick="selectClassGradePill('Grade 11')">Grade 11</button>
          <button type="button" class="class-grade-pill" data-grade="Grade 12" onclick="selectClassGradePill('Grade 12')">Grade 12</button>
          <button type="button" class="class-grade-pill" data-grade="Advanced Lab" onclick="selectClassGradePill('Advanced Lab')">Advanced Lab</button>
        </div>
      </div>

      <!-- Row 3: Room, Schedule, Capacity -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 110px; gap: 12px; margin-bottom: 14px;">
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Room</label>
          <input id="new_class_room" class="so-input" placeholder="Room 101" oninput="updateAddClassPreview()">
        </div>
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Schedule</label>
          <input id="new_class_schedule" class="so-input" placeholder="Tue, Thu 10am" oninput="updateAddClassPreview()">
        </div>
        <div class="so-form-group" style="margin-bottom: 0;">
          <label class="so-label">Capacity</label>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" onclick="adjustClassCapacity(-5)" class="btn ghost btn-sm" style="padding: 9px 8px; border-radius: 8px;">-</button>
            <input id="new_class_capacity" type="number" class="so-input" value="30" min="5" max="150" style="text-align: center; padding: 11px 4px;" oninput="updateAddClassPreview()">
            <button type="button" onclick="adjustClassCapacity(5)" class="btn ghost btn-sm" style="padding: 9px 8px; border-radius: 8px;">+</button>
          </div>
        </div>
      </div>

      <!-- Quick Room & Schedule Chips -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Quick Room Presets:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
          <button type="button" class="preset-chip" onclick="setAddClassRoom('Room 101')">Room 101</button>
          <button type="button" class="preset-chip" onclick="setAddClassRoom('Studio Suite 3B')">Studio 3B</button>
          <button type="button" class="preset-chip" onclick="setAddClassRoom('ICT Lab 1')">ICT Lab 1</button>
          <button type="button" class="preset-chip" onclick="setAddClassRoom('Science Lab 2')">Science Lab 2</button>
          <button type="button" class="preset-chip" onclick="setAddClassRoom('Lecture Hall A')">Lecture Hall A</button>
        </div>
        <div style="font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Quick Schedule Presets:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="preset-chip" onclick="setAddClassSchedule('Tue, Thu 10:00 AM')">Tue, Thu 10am</button>
          <button type="button" class="preset-chip" onclick="setAddClassSchedule('Mon, Wed 09:00 AM')">Mon, Wed 9am</button>
          <button type="button" class="preset-chip" onclick="setAddClassSchedule('Daily 08:30 AM')">Daily 8:30am</button>
          <button type="button" class="preset-chip" onclick="setAddClassSchedule('Fri 02:00 PM')">Fri 2pm</button>
        </div>
      </div>

      <!-- Notification Info Alert -->
      <div class="so-card" style="background: rgba(99, 91, 252, 0.06); border: 1px solid rgba(99, 91, 252, 0.18); margin-bottom: 0;">
        <div class="so-card-title" style="color: var(--primary); font-size: 12.5px;">
          <i class="fa-solid fa-circle-info"></i> Cloud Sync &amp; Roster Dispatch
        </div>
        <div class="so-card-desc" style="margin-bottom: 0; font-size: 12px;">
          Saving this classroom registers it instantly into the local curriculum database and replicates to Supabase Cloud. Teachers can be assigned immediately.
        </div>
      </div>
    </form>
  </div>

  <!-- Slide-Over Footer -->
  <div class="slide-over-footer">
    <button type="button" class="so-btn so-btn-ghost" onclick="closeAddClassModal()">Cancel</button>
    <button type="button" id="addClassSubmitBtn" class="so-btn so-btn-success" onclick="submitAddClass()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff;">
      <i class="fa-solid fa-plus"></i> Create Classroom
    </button>
  </div>
</div>

<!-- RIGHT FLOATING QUICK NAVIGATION BAR -->
<div class="right-floating-nav-bar" id="rightFloatingNavBar" aria-label="Quick Actions Navigation">
  <button type="button" class="rf-nav-item rf-add-class" id="rfAddClassBtn" onclick="openAddClassModal()" title="Add Academic Classroom" aria-label="Add Academic Classroom">
    <span class="rf-nav-label">Add Classroom</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-folder-plus"></i></span>
    <span class="rf-nav-pulse"></span>
  </button>
  <button type="button" class="rf-nav-item rf-assign-teacher" id="rfAssignTeacherBtn" onclick="openAssignModal()" title="Assign Teacher to Class" aria-label="Assign Teacher">
    <span class="rf-nav-label">Assign Teacher</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-chalkboard-user"></i></span>
  </button>
  <button type="button" class="rf-nav-item rf-enroll-student" id="rfEnrollStudentBtn" onclick="openRegisterStudentModal()" title="Enroll New Student" aria-label="Enroll Student">
    <span class="rf-nav-label">Enroll Student</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-user-plus"></i></span>
  </button>
</div>

`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated hr-dashboard.html with slide-over drawer and right floating navigation bar!');
