const fs = require('fs');

let hrHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// 1. Replace the modal HTML
const oldModalStart = '<!-- MODAL: ASSIGN TEACHER TO CLASS -->';
const oldModalEnd = '<!-- MODAL: ADD NEW CLASS -->';

const sModal = hrHtml.indexOf(oldModalStart);
const eModal = hrHtml.indexOf(oldModalEnd, sModal);

console.log('Modal indices:', sModal, eModal);

if (sModal === -1 || eModal === -1) {
  console.error('Could not find modal markers');
  process.exit(1);
}

const newModalHtml = `<!-- MODAL: ASSIGN TEACHER TO CLASS -->
<div class="modal-backdrop" id="assignTeacherModalBackdrop" style="backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.65);" onclick="if(event.target===this)closeAssignModal()">
  <div class="modal" style="max-width: 580px; border-radius: 20px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.3); border: 1px solid var(--border); overflow: hidden; padding: 0;">
    
    <!-- Modal Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 22px 26px; color: #fff; position: relative;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; font-size:20px; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h3 style="margin:0; font-size:19px; font-weight:800; letter-spacing:-0.3px; color:#fff;">Assign Educator to Class</h3>
              <span style="background:rgba(255,255,255,0.22); color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">Curriculum Deployment</span>
            </div>
            <div style="font-size:12.5px; opacity:0.9; margin-top:3px;">Allocate certified faculty, designate learning facility &amp; establish schedule</div>
          </div>
        </div>
        <button type="button" onclick="closeAssignModal()" style="background:rgba(255,255,255,0.2); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- Modal Form Content -->
    <form id="assignTeacherForm" onsubmit="event.preventDefault(); submitTeacherAssignment();" style="padding: 24px 26px;">
      
      <!-- Field 1: Academic Class -->
      <div style="margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text);"><i class="fa-solid fa-graduation-cap" style="color:var(--primary); margin-right:4px;"></i> Academic Classroom / Stream <span style="color:#ef4444;">*</span></label>
          <button type="button" onclick="closeAssignModal(); openAddClassModal();" style="background:none; border:none; color:var(--primary); font-size:11.5px; font-weight:700; cursor:pointer; padding:0; display:flex; align-items:center; gap:4px;">
            <i class="fa-solid fa-plus-circle"></i> New Class Stream
          </button>
        </div>
        <select id="assign_class_select" class="select" style="width:100%; font-size:13.5px; padding:10px 14px; border-radius:10px; font-weight:600;" required onchange="handleAssignClassChange()"></select>

        <!-- Live Class Info Strip -->
        <div id="assign_class_preview_box" style="margin-top:8px; padding:10px 14px; background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.18); border-radius:10px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge-pill badge-purple" id="acp_grade">Form 2</span>
            <span style="font-weight:700; color:var(--text);" id="acp_subject">Graphic Design &amp; Digital Media</span>
          </div>
          <div style="color:var(--muted); font-size:11.5px;" id="acp_enrollment">
            <i class="fa-solid fa-users" style="margin-right:3px;"></i> <span id="acp_seats">0 / 35 Enrolled</span>
          </div>
        </div>
      </div>

      <!-- Field 2: Assigned Educator -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 12.5px; font-weight: 700; color: var(--text); display:block; margin-bottom: 6px;"><i class="fa-solid fa-user-tie" style="color:var(--primary); margin-right:4px;"></i> Assigned Lead Educator <span style="color:#ef4444;">*</span></label>
        <select id="assign_teacher_select" class="select" style="width:100%; font-size:13.5px; padding:10px 14px; border-radius:10px; font-weight:600;" required onchange="handleAssignTeacherChange()"></select>

        <!-- Live Teacher Workload Strip -->
        <div id="assign_teacher_preview_box" style="margin-top:8px; padding:10px 14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.18); border-radius:10px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div id="atp_avatar" style="width:28px; height:28px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px;">EA</div>
            <div>
              <span style="font-weight:700; color:var(--text);" id="atp_name">Eugene Adjei</span>
              <span style="color:var(--muted); font-size:11px; margin-left:4px;" id="atp_email">eugeneadjei524@gmail.com</span>
            </div>
          </div>
          <span class="badge-pill badge-green" id="atp_status"><i class="fa-solid fa-circle-check"></i> Certified Faculty</span>
        </div>
      </div>

      <!-- Field 3 & 4: Room & Schedule Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom: 16px;">
        <div>
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text); display:block; margin-bottom: 6px;"><i class="fa-solid fa-door-open" style="color:var(--primary); margin-right:4px;"></i> Room / Facility <span style="color:#ef4444;">*</span></label>
          <input id="assign_room" class="select" placeholder="e.g. Media Lab 201" style="width:100%; font-size:13px; padding:9px 12px; border-radius:10px;" required>
          <!-- Quick Presets -->
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignRoom('Studio Suite 3B')">Studio 3B</button>
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignRoom('Innovation Lab 2')">Lab 2</button>
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignRoom('Media Lab 201')">Media 201</button>
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignRoom('Design Studio A')">Studio A</button>
          </div>
        </div>

        <div>
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text); display:block; margin-bottom: 6px;"><i class="fa-solid fa-clock" style="color:var(--primary); margin-right:4px;"></i> Timetable Schedule <span style="color:#ef4444;">*</span></label>
          <input id="assign_schedule" class="select" placeholder="e.g. Mon, Wed, Fri 09:00 AM" style="width:100%; font-size:13px; padding:9px 12px; border-radius:10px;" required>
          <!-- Quick Presets -->
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignSchedule('Mon, Wed, Fri 09:00 AM')">MWF 9am</button>
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignSchedule('Tue, Thu 10:00 AM')">Tue/Thu 10am</button>
            <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px;" onclick="setAssignSchedule('Daily 08:30 AM')">Daily 8:30am</button>
          </div>
        </div>
      </div>

      <!-- Field 5: Directives & Special Notes -->
      <div style="margin-bottom: 18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text);"><i class="fa-solid fa-clipboard-list" style="color:var(--primary); margin-right:4px;"></i> Assignment Directives &amp; Special Directives</label>
          <span style="font-size:11px; color:var(--muted);">Optional instructions for educator</span>
        </div>
        <textarea id="assign_notes" class="select" placeholder="e.g. Focus on digital portfolio project, semester grading milestones, and weekly student attendance..." style="width:100%; height:64px; font-size:12.5px; padding:9px 12px; border-radius:10px; resize:none;"></textarea>
        <!-- Suggestion Tags -->
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
          <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px; color:var(--muted);" onclick="appendAssignNote('Focus on digital portfolio project.')">+ Portfolio Project</button>
          <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px; color:var(--muted);" onclick="appendAssignNote('Strict adherence to daily roll call and studio attendance.')">+ Attendance Discipline</button>
          <button type="button" class="btn ghost btn-sm" style="font-size:10px; padding:2px 7px; border-radius:6px; color:var(--muted);" onclick="appendAssignNote('Prepare mid-term practical assessments.')">+ Practical Assessments</button>
        </div>
      </div>

      <!-- Live Sync Confirmation Banner -->
      <div style="background:rgba(99,91,252,0.06); border:1px solid rgba(99,91,252,0.18); border-radius:10px; padding:10px 14px; font-size:12px; color:var(--text); display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <i class="fa-solid fa-cloud-arrow-up" style="color:var(--primary); font-size:16px; flex-shrink:0;"></i>
        <div>
          <strong>Live Synchronization:</strong> Saving will immediately assign this class to the teacher, grant roster access in their <strong>Teacher Portal</strong>, and emit an official academic announcement.
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px; border-top:1px solid var(--border); padding-top:16px;">
        <button type="button" class="btn ghost" onclick="closeAssignModal()" style="font-size:13px; padding:8px 16px;">Cancel</button>
        <button type="submit" class="btn" id="assignSubmitBtn" style="background:linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color:#fff; font-size:13px; font-weight:700; padding:9px 20px; border-radius:10px; box-shadow:0 4px 14px rgba(79,70,229,0.35);">
          <i class="fa-solid fa-check"></i> Save Assignment &amp; Notify
        </button>
      </div>
    </form>
  </div>
</div>\r\n\r\n`;

hrHtml = hrHtml.slice(0, sModal) + newModalHtml + hrHtml.slice(eModal);
console.log('Replaced modal HTML successfully');

// 2. Update getClassesList to include fallback standard curriculum
const oldGetClassesStart = 'function getClassesList() {';
const oldGetClassesEnd = 'function saveClassesList(list) {';

const sGC = hrHtml.indexOf(oldGetClassesStart);
const eGC = hrHtml.indexOf(oldGetClassesEnd, sGC);

console.log('getClassesList indices:', sGC, eGC);
if (sGC !== -1 && eGC !== -1) {
  const newGetClassesFunc = `function getDefaultAcademicClasses() {
  return [
    {
      id: 'cls_f2_arts',
      code: 'CLS-F2-ART',
      name: 'Form 2 Visual Arts & Creative Systems',
      subject: 'Graphic Design & Digital Media',
      grade: 'Form 2',
      room: 'Studio Suite 3B',
      schedule: 'Mon, Wed, Fri 09:00 AM',
      capacity: 35,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      approvalStatus: 'approved'
    },
    {
      id: 'cls_f3_web',
      code: 'CLS-F3-WEB',
      name: 'Form 3 Web Architecture & Front-End UI',
      subject: 'Computer Studies & Web Engineering',
      grade: 'Form 3',
      room: 'Innovation Lab 2',
      schedule: 'Tue, Thu 10:00 AM',
      capacity: 35,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      approvalStatus: 'approved'
    },
    {
      id: 'cls_f1_illust',
      code: 'CLS-F1-ILL',
      name: 'Form 1 Digital Illustration & Brand Identity',
      subject: 'Visual Arts Core',
      grade: 'Form 1',
      room: 'Studio Suite 1A',
      schedule: 'Mon, Wed 11:30 AM',
      capacity: 35,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      approvalStatus: 'approved'
    },
    {
      id: 'cls_f2_print',
      code: 'CLS-F2-PRT',
      name: 'Form 2 Commercial Print & Typography',
      subject: 'Applied Graphic Media',
      grade: 'Form 2',
      room: 'Production Lab',
      schedule: 'Fri 08:30 AM',
      capacity: 35,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      approvalStatus: 'approved'
    }
  ];
}

function getClassesList() {
  let classes = read(CLASSES_STORAGE_KEY);
  if (!Array.isArray(classes) || classes.length === 0) {
    classes = getDefaultAcademicClasses();
    save(CLASSES_STORAGE_KEY, classes);
  }
  return classes;
}

`;

  hrHtml = hrHtml.slice(0, sGC) + newGetClassesFunc + hrHtml.slice(eGC);
  console.log('Replaced getClassesList with default academic classes');
}

// 3. Replace openAssignModal, submitTeacherAssignment and add helpers
const oldAssignStart = 'function openAssignModal(preselectedClassId = null) {';
const oldAssignEnd = 'function openAddClassModal() {';

const sAssign = hrHtml.indexOf(oldAssignStart);
const eAssign = hrHtml.indexOf(oldAssignEnd, sAssign);

console.log('Assign functions indices:', sAssign, eAssign);

if (sAssign !== -1 && eAssign !== -1) {
  const newAssignCode = `function setAssignRoom(r) {
  const el = document.getElementById('assign_room');
  if (el) el.value = r;
}

function setAssignSchedule(s) {
  const el = document.getElementById('assign_schedule');
  if (el) el.value = s;
}

function appendAssignNote(text) {
  const el = document.getElementById('assign_notes');
  if (!el) return;
  el.value = el.value ? (el.value.trim() + ' ' + text) : text;
}

function updateAssignmentClassPreview() {
  const classSelect = document.getElementById('assign_class_select');
  if (!classSelect) return;
  const classes = getClassesList();
  const c = classes.find(item => item.id === classSelect.value) || classes[0];
  if (!c) return;

  const gradeEl = document.getElementById('acp_grade');
  const subjectEl = document.getElementById('acp_subject');
  const seatsEl = document.getElementById('acp_seats');

  if (gradeEl) gradeEl.textContent = c.grade || c.gradeLevel || 'Form 2';
  if (subjectEl) subjectEl.textContent = c.subject || c.name || 'Core Curriculum';
  if (seatsEl) {
    const enrolled = Number(c.enrolled || (c.students || []).length || 0);
    const cap = Number(c.capacity || 35);
    seatsEl.textContent = \`\${enrolled} / \${cap} Seats Enrolled\`;
  }
}

function updateAssignmentTeacherPreview() {
  const teacherSelect = document.getElementById('assign_teacher_select');
  if (!teacherSelect) return;
  const teachers = getAvailableTeachers();
  const t = teachers.find(item => item.email === teacherSelect.value) || teachers[0];
  if (!t) return;

  const avatarEl = document.getElementById('atp_avatar');
  const nameEl = document.getElementById('atp_name');
  const emailEl = document.getElementById('atp_email');

  if (avatarEl) {
    const initials = (t.name || 'ED').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.textContent = initials;
  }
  if (nameEl) nameEl.textContent = t.name || 'Educator';
  if (emailEl) emailEl.textContent = t.email || '';
}

function handleAssignClassChange() {
  const classSelect = document.getElementById('assign_class_select');
  if (!classSelect) return;
  const classes = getClassesList();
  const selClass = classes.find(c => c.id === classSelect.value);
  if (selClass) {
    document.getElementById('assign_room').value = selClass.room || 'Studio Suite 3B';
    document.getElementById('assign_schedule').value = selClass.schedule || 'Mon, Wed, Fri 09:00 AM';
    if (selClass.teacherEmail) {
      const tSelect = document.getElementById('assign_teacher_select');
      if (tSelect) tSelect.value = selClass.teacherEmail;
    }
  }
  updateAssignmentClassPreview();
  updateAssignmentTeacherPreview();
}

function handleAssignTeacherChange() {
  updateAssignmentTeacherPreview();
}

function openAssignModal(preselectedClassId = null) {
  let classes = getClassesList();
  if (!Array.isArray(classes) || classes.length === 0) {
    classes = getDefaultAcademicClasses();
    saveClassesList(classes);
  }
  const teachers = getAvailableTeachers();

  const classSelect = document.getElementById('assign_class_select');
  const teacherSelect = document.getElementById('assign_teacher_select');
  if (!classSelect || !teacherSelect) return;

  classSelect.innerHTML = classes.map(c => {
    const isAssigned = Boolean(c.teacherName && c.teacherName.trim() !== '');
    const assignTag = isAssigned ? \` • Assigned to \${c.teacherName}\` : ' • Unassigned';
    return \`<option value="\${c.id}" \${preselectedClassId && c.id === preselectedClassId ? 'selected' : ''}>
      \${c.code ? c.code + ' — ' : ''}\${escapeHtml(c.name)} (\${escapeHtml(c.grade || 'Form 2')}\${escapeHtml(assignTag)})
    </option>\`;
  }).join('');

  if (preselectedClassId) {
    classSelect.value = preselectedClassId;
  }

  teacherSelect.innerHTML = teachers.map(t => \`
    <option value="\${escapeHtml(t.email)}" data-name="\${escapeHtml(t.name)}" data-role="\${escapeHtml(t.role)}">
      \${escapeHtml(t.name)} (\${escapeHtml(t.role)})
    </option>
  \`).join('');

  const targetClass = classes.find(c => c.id === (preselectedClassId || classSelect.value)) || classes[0];
  if (targetClass) {
    document.getElementById('assign_room').value = targetClass.room || 'Studio Suite 3B';
    document.getElementById('assign_schedule').value = targetClass.schedule || 'Mon, Wed, Fri 09:00 AM';
    if (targetClass.teacherEmail) {
      teacherSelect.value = targetClass.teacherEmail;
    }
    if (targetClass.assignmentNotes) {
      document.getElementById('assign_notes').value = targetClass.assignmentNotes;
    } else {
      document.getElementById('assign_notes').value = '';
    }
  }

  updateAssignmentClassPreview();
  updateAssignmentTeacherPreview();

  document.getElementById('assignTeacherModalBackdrop').classList.add('show');
}

function closeAssignModal() {
  document.getElementById('assignTeacherModalBackdrop')?.classList.remove('show');
}

async function submitTeacherAssignment() {
  const classId = document.getElementById('assign_class_select').value;
  const teacherSelect = document.getElementById('assign_teacher_select');
  const teacherEmail = teacherSelect.value;
  const selectedTeacherOpt = teacherSelect.options[teacherSelect.selectedIndex];
  const teacherName = selectedTeacherOpt ? (selectedTeacherOpt.dataset.name || selectedTeacherOpt.text.split('(')[0].trim()) : '';
  const room = document.getElementById('assign_room').value.trim() || 'Studio Suite 3B';
  const schedule = document.getElementById('assign_schedule').value.trim() || 'Mon, Wed, Fri 09:00 AM';
  const notes = document.getElementById('assign_notes').value.trim();

  if (!classId) {
    if (window.Toaster) window.Toaster.warning('Selection Required', 'Please select an academic class.');
    else showToast('Please select an academic class', 'warning');
    return;
  }
  if (!teacherEmail) {
    if (window.Toaster) window.Toaster.warning('Selection Required', 'Please select a teacher to assign.');
    else showToast('Please select a teacher to assign', 'warning');
    return;
  }

  const submitBtn = document.getElementById('assignSubmitBtn');
  const origBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deploying Educator...';
  }

  try {
    const classes = getClassesList();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx !== -1) {
      classes[idx].teacherName = teacherName;
      classes[idx].teacherEmail = teacherEmail;
      classes[idx].room = room;
      classes[idx].schedule = schedule;
      classes[idx].status = 'Active';
      classes[idx].approvalStatus = 'approved';
      classes[idx].assignmentNotes = notes;
      classes[idx].assignedAt = Date.now();

      saveClassesList(classes);

      // 1. Sync to Supabase Cloud
      if (window.SupabaseService) {
        await window.SupabaseService.saveClass(ACTIVE_ORG, {
          id: !isNaN(Number(classes[idx].id)) ? Number(classes[idx].id) : undefined,
          name: classes[idx].name,
          className: classes[idx].name,
          code: classes[idx].code,
          grade: classes[idx].grade,
          gradeLevel: classes[idx].grade,
          room: room,
          schedule: schedule,
          teacherId: teacherEmail,
          teacherName: teacherName,
          status: 'Active',
          capacity: classes[idx].capacity || 35
        }).catch(err => {
          console.warn('[HR Supabase] Save class to cloud notice:', err.message);
        });

        // 2. Broadcast live event across all portals
        window.SupabaseService.broadcastChange('CLASS_ASSIGNED', 'classes', {
          classId: classes[idx].id,
          className: classes[idx].name,
          teacherName: teacherName,
          teacherEmail: teacherEmail,
          room: room,
          schedule: schedule,
          orgId: ACTIVE_ORG
        });
      }

      closeAssignModal();
      renderClassesSection();

      if (window.Toaster && typeof window.Toaster.success === 'function') {
        window.Toaster.success(
          'Educator Deployed Successfully!',
          \`\${teacherName} has been assigned to \${classes[idx].name} in \${room} (\${schedule}).\`
        );
      } else {
        showToast(\`Assigned \${teacherName} to \${classes[idx].name}\`);
      }

      if (window.SchoolMessenger && typeof window.SchoolMessenger.sendSystemNotification === 'function') {
        window.SchoolMessenger.sendSystemNotification(
          'chan-teachers',
          \`Official Academic Allocation: \${teacherName} has been assigned as Lead Educator for \${classes[idx].name} in \${room} (\${schedule}).\`
        );
      }
    }
  } catch (err) {
    console.error('Error assigning teacher:', err);
    showToast('Notice assigning teacher: ' + (err.message || err), 'warning');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnText;
    }
  }
}

`;

  hrHtml = hrHtml.slice(0, sAssign) + newAssignCode + hrHtml.slice(eAssign);
  console.log('Replaced assign functions successfully');
}

fs.writeFileSync('pages/hr/hr-dashboard.html', hrHtml, 'utf8');
console.log('Successfully saved hr-dashboard.html');
