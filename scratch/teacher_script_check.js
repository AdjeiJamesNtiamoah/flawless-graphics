/* -------------------------
  Utilities & Session Setup
------------------------- */
function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
function read(k){ return safeParse(localStorage.getItem(k)) || [] }
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
function toast(msg, t=2800) {
  if (window.Toaster && typeof window.Toaster.show === 'function') {
    const isWarn = /error|fail|invalid|required|select|provide/i.test(msg);
    const isInfo = /info|remove|delete|status|clock/i.test(msg);
    const type = isWarn ? 'warning' : (isInfo ? 'info' : 'success');
    const title = type === 'success' ? 'Saved Successfully' : (type === 'warning' ? 'Required Action' : 'Teacher Portal');
    window.Toaster.show({ type, title, message: msg, duration: t });
  } else {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), t);
    }
  }
}
function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* Session Verification */
const sessionCandidates = ['active_teacher','teacher_active_user','active_user','active_org_user'];
let teacher = null;
for(const k of sessionCandidates){ const v = safeParse(localStorage.getItem(k)); if(v && (v.email || v.name)){ teacher = v; break; } }
if(!teacher){ 
  teacher = { name: 'Demo Teacher', email: 'teacher@flawless.org', org: 'FLAWLESS GRAPHICS' };
}
localStorage.setItem('active_teacher', JSON.stringify(teacher));
localStorage.setItem('teacher_active_user', JSON.stringify(teacher));

const ORG = teacher.org || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
if (!localStorage.getItem('active_org')) localStorage.setItem('active_org', ORG);

/* ORG Storage Keys */
const CLASSES_KEY = `${ORG}_classes`;
const ASSIGN_KEY = `${ORG}_assignments`;
const ATT_KEY = `${ORG}_attendance`;
const TEACH_ATT_KEY = `${ORG}_teacher_attendance`;
const MSG_KEY = `${ORG}_messages`;
const NOTE_KEY = `${ORG}_lesson_notes`;
const TT_KEY = `${ORG}_timetable`;
const SETTINGS_KEY = `${ORG}_settings`;
const ACT_KEY = `${ORG}_activity`;
const CALENDAR_KEY = `${ORG}_academic_calendar`;
const ASSESS_KEY = `${ORG}_student_assessments`;

/* Ensure Default Stores */
if(!localStorage.getItem(CLASSES_KEY)) save(CLASSES_KEY, []);
if(!localStorage.getItem(ASSIGN_KEY)) save(ASSIGN_KEY, []);
if(!localStorage.getItem(ATT_KEY)) save(ATT_KEY, []);
if(!localStorage.getItem(TEACH_ATT_KEY)) save(TEACH_ATT_KEY, []);
if(!localStorage.getItem(MSG_KEY)) save(MSG_KEY, []);
if(!localStorage.getItem(NOTE_KEY)) save(NOTE_KEY, []);
if(!localStorage.getItem(TT_KEY)) save(TT_KEY, []);
if(!localStorage.getItem(SETTINGS_KEY)) save(SETTINGS_KEY, { idle_minutes:10 });
if(!localStorage.getItem(ACT_KEY)) save(ACT_KEY, []);

/* UI Initial Boot */
document.getElementById('orgName').textContent = ORG;
document.getElementById('teacherNameSmall').textContent = teacher.name || teacher.email;
document.getElementById('teacherEmailSmall').textContent = teacher.email || '';
const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%230b1b2b"/></svg>';
document.getElementById('profilePreview').src = teacher.photoBase64 || defaultAvatar;
document.getElementById('profilePhoto').src = teacher.photoBase64 || defaultAvatar;

/* Tab Navigation */
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    const sec = btn.dataset.section;
    document.querySelectorAll('main section').forEach(s=> s.style.display='none');
    const target = document.getElementById(sec + 'Section');
    if(target) {
      target.style.display = 'block';
      document.getElementById('pageTitle').textContent = btn.textContent.trim();
    }
    if (sec === 'timetable') {
      renderTeacherCalendarReview();
      renderTimetable();
    }
    if (sec === 'assessments') {
      renderTeacherAssessments();
    }
    if (sec === 'overview') {
      updateCalendarOverviewBanner();
    }
  });
});

/* Activity Tracking */
function pushActivity(text){
  const arr = read(ACT_KEY);
  arr.push({ text, time: new Date().toISOString() });
  save(ACT_KEY, arr);
  renderActivity();
}

function renderActivity(){
  const arr = read(ACT_KEY).slice().reverse().slice(0,6);
  const container = document.getElementById('activityFeed');
  if(!arr.length) { container.innerHTML = '<div class="tiny">No recent system activity recorded</div>'; return; }
  container.innerHTML = arr.map(a => `
    <div style="padding:10px 14px; background:var(--card-bg); border-radius:8px; border:1px solid var(--card-border); display:flex; justify-content:space-between; align-items:center;">
      <span>${escapeHtml(a.text)}</span>
      <span class="tiny">${new Date(a.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
    </div>
  `).join('');
  document.getElementById('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString();
}

/* Modal Helper Function replacing prompt() */
function openModal(title, fields, onConfirm) {
  const modal = document.getElementById('customModal');
  const container = document.getElementById('modalInputs');
  document.getElementById('modalTitle').textContent = title;
  container.innerHTML = '';

  fields.forEach(f => {
    const input = document.createElement('input');
    input.id = 'modal_' + f.name;
    input.placeholder = f.label;
    input.value = f.value || '';
    if(f.type) input.type = f.type;
    container.appendChild(input);
  });

  modal.classList.add('active');

  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');

  const close = () => {
    modal.classList.remove('active');
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  cancelBtn.onclick = close;
  confirmBtn.onclick = () => {
    const res = {};
    fields.forEach(f => { res[f.name] = document.getElementById('modal_' + f.name).value.trim(); });
    onConfirm(res);
    close();
  };
}

/* -------------------------
  CLASSES CRUD
------------------------- */
function getClasses(){ return read(CLASSES_KEY) }
function saveClasses(arr){ save(CLASSES_KEY, arr) }

function renderClasses(){
  const tb = document.querySelector('#classesTable tbody'); tb.innerHTML = '';
  const arr = getClasses();
  arr.forEach((c,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.subject||'')}</td><td><span class="badge">${(c.students||[]).length}</span></td>
      <td>
        <button class="btn ghost" style="padding:4px 8px;" onclick="editClass('${c.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn ghost" style="padding:4px 8px;" onclick="manageStudents('${c.id}')"><i class="fa-solid fa-users"></i></button>
        <button class="btn ghost" style="padding:4px 8px; color:var(--danger)" onclick="deleteClass('${c.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>`;
    tb.appendChild(tr);
  });
  updateKPIs();
  populateClassSelects();
  renderClassPreview();
}

document.getElementById('newClassBtn').addEventListener('click', ()=>{
  openModal('Create New Class', [{name:'name', label:'Class Name'}, {name:'subject', label:'Subject'}], (data)=>{
    if(!data.name) return toast('Class name required');
    const arr = getClasses();
    arr.push({ id:'c_'+Date.now(), name: data.name, subject: data.subject, students:[] });
    saveClasses(arr); renderClasses(); pushActivity(`Created class: ${data.name}`); toast('Class created');
  });
});

function editClass(id){
  const arr = getClasses(); const c = arr.find(x=>x.id===id); if(!c) return;
  openModal('Edit Class', [{name:'name', label:'Class Name', value:c.name}, {name:'subject', label:'Subject', value:c.subject}], (data)=>{
    if(!data.name) return;
    c.name = data.name; c.subject = data.subject;
    saveClasses(arr); renderClasses(); pushActivity(`Updated class: ${c.name}`); toast('Class updated');
  });
}

function deleteClass(id){
  if(!confirm('Delete this class?')) return;
  const arr = getClasses().filter(x=>x.id!==id);
  saveClasses(arr); renderClasses(); pushActivity('Deleted class'); toast('Class removed');
}

function manageStudents(classId){
  document.querySelector('[data-section="students"]').click();
  document.getElementById('selectClassForStudents').value = classId;
  renderStudentsForClass(classId);
}

function renderClassPreview(){
  const sel = document.getElementById('selectClassForStudents').value || (getClasses()[0] && getClasses()[0].id);
  const container = document.getElementById('classPreview');
  if(!sel) { container.innerHTML = '<div class="tiny">No class active</div>'; return; }
  const c = getClasses().find(x=>x.id===sel);
  if(!c) return;
  container.innerHTML = `<strong>${escapeHtml(c.name)}</strong><div class="tiny">${escapeHtml(c.subject||'Unassigned')}</div>
  <div style="margin-top:12px;" class="tiny">Students Enrolled:</div>
  <div style="margin-top:6px">${(c.students||[]).map(s=>`<span class="badge" style="margin:2px;">${escapeHtml(s.firstName+' '+(s.lastName||''))}</span>`).join('') || '<span class="tiny">No students enrolled</span>'}</div>`;
}

/* -------------------------
  STUDENTS CRUD & API SYNC
------------------------- */
function populateClassSelects(){
  const ids = ['selectClassForStudents','attClassSelect','assignClassSelect','noteClassSelect','ttClassSelect'];
  const arr = getClasses();
  ids.forEach(id=>{
    const el = document.getElementById(id); if(!el) return;
    const currentVal = el.value;
    el.innerHTML = '<option value="">-- Select Class --</option>';
    arr.forEach(c => el.appendChild(Object.assign(document.createElement('option'), { value:c.id, textContent:c.name })));
    if(currentVal) el.value = currentVal;
  });
}

function renderStudentsForClass(classId){
  const arr = getClasses(); const cls = arr.find(c=>c.id===classId);
  const tbody = document.querySelector('#studentsTable tbody'); tbody.innerHTML = '';
  if(!cls){ tbody.innerHTML = '<tr><td colspan="7" class="tiny" style="text-align:center; padding:18px;">Select a class to view enrollment</td></tr>'; return; }
  const students = cls.students || [];
  if(students.length === 0){
    tbody.innerHTML = '<tr><td colspan="7" class="tiny" style="text-align:center; padding:24px; color:var(--text-muted);"><i class="fa-solid fa-user-graduate" style="font-size:26px; margin-bottom:8px; display:block; opacity:0.5;"></i>No students registered in this class yet. Click "Add Student" to register.</td></tr>';
    updateKPIs(); renderClassPreview(); return;
  }
  students.forEach((s,i)=>{
    const fullName = escapeHtml([s.firstName, s.middleName, s.lastName].filter(Boolean).join(' '));
    const status = s.status || 'Active';
    const statusClass = status.toLowerCase();
    const guardianInfo = s.guardianName ? `${escapeHtml(s.guardianName)} (${escapeHtml(s.phone||'No phone')})` : escapeHtml(s.phone||'—');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          ${s.photo ? `
            <img src="${s.photo}" alt="${fullName}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1px solid var(--card-border); box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          ` : `
            <div style="width:36px; height:36px; border-radius:50%; background:var(--accent-gradient); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; flex-shrink:0;">
              ${escapeHtml((s.firstName?.[0]||'S') + (s.lastName?.[0]||''))}
            </div>
          `}
          <div>
            <div style="font-weight:700;">${fullName}</div>
            <div class="tiny" style="color:var(--text-muted);">${escapeHtml(s.guardianRel ? s.guardianRel + "'s Child" : 'Student')}</div>
          </div>
        </div>
      </td>
      <td><span class="badge" style="font-family:monospace; font-weight:700;">${escapeHtml(s.roll||'—')}</span></td>
      <td>${escapeHtml(s.gender||'—')}</td>
      <td>
        <div>${guardianInfo}</div>
        ${s.guardianEmail ? `<div class="tiny" style="color:var(--text-muted);">${escapeHtml(s.guardianEmail)}</div>` : ''}
      </td>
      <td><span class="student-badge-status status-${statusClass}">${escapeHtml(status)}</span></td>
      <td>
        <div style="display:flex; gap:4px;">
          <button class="btn ghost" style="padding:4px 8px;" title="View Full Details" onclick="viewStudentDetails('${classId}','${s.id}')"><i class="fa-solid fa-eye"></i></button>
          <button class="btn ghost" style="padding:4px 8px;" title="Edit Student" onclick="openStudentModal('${classId}','${s.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn ghost" style="padding:4px 8px; color:var(--danger)" title="Delete Student" onclick="deleteStudent('${classId}','${s.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
  updateKPIs();
  renderClassPreview();
}

/* Comprehensive Student Registration Modal Logic */
function openStudentModal(classId, studentId = null) {
  const arr = getClasses();
  if (!classId) {
    classId = document.getElementById('selectClassForStudents').value || (arr[0] && arr[0].id);
  }
  if (!classId) return toast('Please create and select a class first');

  // Populate class dropdown in modal
  const classSelect = document.getElementById('sm_classId');
  classSelect.innerHTML = '';
  arr.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name + (c.subject ? ` (${c.subject})` : '');
    if (c.id === classId) opt.selected = true;
    classSelect.appendChild(opt);
  });

  const form = document.getElementById('studentDetailForm');
  form.reset();

  if (studentId) {
    // Edit Mode
    const cls = arr.find(c => c.id === classId);
    const s = cls ? (cls.students || []).find(x => x.id === studentId) : null;
    if (!s) return toast('Student not found');

    document.getElementById('studentModalTitle').textContent = 'Edit Student Profile';
    document.getElementById('sm_studentId').value = s.id;
    document.getElementById('sm_firstName').value = s.firstName || '';
    document.getElementById('sm_middleName').value = s.middleName || '';
    document.getElementById('sm_lastName').value = s.lastName || '';
    document.getElementById('sm_gender').value = s.gender || '';
    document.getElementById('sm_dob').value = s.dob || '';
    document.getElementById('sm_bloodGroup').value = s.bloodGroup || 'Unknown';
    document.getElementById('sm_roll').value = s.roll || '';
    document.getElementById('sm_classId').value = classId;
    document.getElementById('sm_status').value = s.status || 'Active';
    document.getElementById('sm_term').value = s.term || '';
    document.getElementById('sm_enrollmentDate').value = s.enrollmentDate || '';
    document.getElementById('sm_guardianName').value = s.guardianName || '';
    document.getElementById('sm_guardianRel').value = s.guardianRel || 'Mother';
    document.getElementById('sm_phone').value = s.phone || '';
    document.getElementById('sm_guardianEmail').value = s.guardianEmail || '';
    document.getElementById('sm_address').value = s.address || '';
    document.getElementById('sm_emergencyPhone').value = s.emergencyPhone || '';
    document.getElementById('sm_medicalNotes').value = s.medicalNotes || '';
    document.getElementById('sm_notes').value = s.notes || '';
    document.getElementById('sm_saveBtn').innerHTML = '<i class="fa-solid fa-check"></i> Update Student Profile';

    currentStudentPhotoBase64 = s.photo || null;
    const preview = document.getElementById('sm_photoPreview');
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (s.photo) {
      if (preview) preview.innerHTML = `<img src="${s.photo}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
      if (removeBtn) removeBtn.style.display = 'none';
    }
  } else {
    // Add Mode
    document.getElementById('studentModalTitle').textContent = 'Register Student Profile';
    document.getElementById('sm_studentId').value = '';
    const existingCount = (arr.find(c => c.id === classId)?.students || []).length;
    document.getElementById('sm_roll').value = 'STU-' + new Date().getFullYear() + '-' + String(existingCount + 1).padStart(3, '0');
    document.getElementById('sm_enrollmentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('sm_term').value = new Date().getFullYear() + ' - Term 1';
    document.getElementById('sm_saveBtn').innerHTML = '<i class="fa-solid fa-check"></i> Save & Enroll Student';

    currentStudentPhotoBase64 = null;
    const fileInput = document.getElementById('sm_photoFile');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('sm_photoPreview');
    if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (removeBtn) removeBtn.style.display = 'none';
  }

  document.getElementById('studentModal').classList.add('active');
  setTimeout(() => document.getElementById('sm_firstName').focus(), 100);
}

let currentStudentPhotoBase64 = null;

function handleStudentPhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast('Student photo size must be under 2MB');
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentStudentPhotoBase64 = evt.target.result;
    const preview = document.getElementById('sm_photoPreview');
    if (preview) {
      preview.innerHTML = `<img src="${currentStudentPhotoBase64}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }
    const removeBtn = document.getElementById('sm_removePhotoBtn');
    if (removeBtn) removeBtn.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

function removeStudentPhoto() {
  currentStudentPhotoBase64 = null;
  const fileInput = document.getElementById('sm_photoFile');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('sm_photoPreview');
  if (preview) preview.innerHTML = `<i class="fa-solid fa-graduation-cap" id="sm_photoIcon"></i>`;
  const removeBtn = document.getElementById('sm_removePhotoBtn');
  if (removeBtn) removeBtn.style.display = 'none';
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.remove('active');
}

function saveStudentDetailForm(e) {
  e.preventDefault();
  const classId = document.getElementById('sm_classId').value;
  if (!classId) return toast('Please select an assigned class');

  const studentId = document.getElementById('sm_studentId').value;
  const firstName = document.getElementById('sm_firstName').value.trim();
  const middleName = document.getElementById('sm_middleName').value.trim();
  const lastName = document.getElementById('sm_lastName').value.trim();
  const gender = document.getElementById('sm_gender').value;
  const dob = document.getElementById('sm_dob').value;
  const bloodGroup = document.getElementById('sm_bloodGroup').value;
  const roll = document.getElementById('sm_roll').value.trim();
  const status = document.getElementById('sm_status').value;
  const term = document.getElementById('sm_term').value.trim();
  const enrollmentDate = document.getElementById('sm_enrollmentDate').value;
  const guardianName = document.getElementById('sm_guardianName').value.trim();
  const guardianRel = document.getElementById('sm_guardianRel').value;
  const phone = document.getElementById('sm_phone').value.trim();
  const guardianEmail = document.getElementById('sm_guardianEmail').value.trim();
  const address = document.getElementById('sm_address').value.trim();
  const emergencyPhone = document.getElementById('sm_emergencyPhone').value.trim();
  const medicalNotes = document.getElementById('sm_medicalNotes').value.trim();
  const notes = document.getElementById('sm_notes').value.trim();

  if (!firstName || !lastName) return toast('First and Last names are required');
  if (!roll) return toast('Roll number is required');

  const studentData = {
    firstName,
    middleName,
    lastName,
    photo: currentStudentPhotoBase64,
    gender,
    dob,
    bloodGroup,
    roll,
    status,
    term,
    enrollmentDate,
    guardianName,
    guardianRel,
    phone,
    guardianEmail,
    address,
    emergencyPhone,
    medicalNotes,
    notes,
    updatedAt: Date.now()
  };

  const arr = getClasses();
  const cls = arr.find(c => c.id === classId);
  if (!cls) return toast('Class not found');
  cls.students = cls.students || [];

  if (studentId) {
    // Update existing student
    const idx = cls.students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      cls.students[idx] = { ...cls.students[idx], ...studentData };
    } else {
      for (const otherClass of arr) {
        const otherIdx = (otherClass.students || []).findIndex(s => s.id === studentId);
        if (otherIdx !== -1) {
          const [movedStudent] = otherClass.students.splice(otherIdx, 1);
          cls.students.push({ ...movedStudent, ...studentData });
          break;
        }
      }
    }
    toast(`Student ${firstName} ${lastName} updated successfully`);
  } else {
    // New Student
    studentData.id = 's_' + Date.now();
    studentData.createdAt = Date.now();
    cls.students.push(studentData);
    toast(`Student ${firstName} ${lastName} enrolled in ${cls.name}`);
    pushActivity(`Enrolled student ${firstName} ${lastName} in ${cls.name}`);
  }

  saveClasses(arr);
  closeStudentModal();
  document.getElementById('selectClassForStudents').value = classId;
  renderStudentsForClass(classId);
}

function viewStudentDetails(classId, studentId) {
  const arr = getClasses();
  const cls = arr.find(c => c.id === classId);
  if (!cls) return toast('Class not found');
  const s = (cls.students || []).find(x => x.id === studentId);
  if (!s) return toast('Student record not found');

  const fullName = escapeHtml([s.firstName, s.middleName, s.lastName].filter(Boolean).join(' '));
  document.getElementById('vs_fullName').textContent = fullName;
  document.getElementById('vs_classRoll').textContent = `${cls.name} • Roll: ${s.roll || '—'} • Status: ${s.status || 'Active'}`;
  if (s.photo) {
    document.getElementById('vs_avatar').innerHTML = `<img src="${s.photo}" alt="${fullName}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
  } else {
    document.getElementById('vs_avatar').innerHTML = `<span style="font-weight:800; font-size:16px;">${escapeHtml((s.firstName?.[0]||'S') + (s.lastName?.[0]||''))}</span>`;
  }

  const container = document.getElementById('vs_content');
  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; background:rgba(0,0,0,0.03); padding:16px; border-radius:12px; border:1px solid var(--card-border);">
      <div>
        <div class="tiny" style="color:var(--text-muted); font-weight:700;">GENDER & D.O.B</div>
        <div style="font-weight:600; font-size:13px; margin-top:2px;">${escapeHtml(s.gender || '—')} • ${escapeHtml(s.dob || 'Not provided')}</div>
      </div>
      <div>
        <div class="tiny" style="color:var(--text-muted); font-weight:700;">BLOOD GROUP</div>
        <div style="font-weight:600; font-size:13px; margin-top:2px;"><span class="badge">${escapeHtml(s.bloodGroup || 'Unknown')}</span></div>
      </div>
      <div>
        <div class="tiny" style="color:var(--text-muted); font-weight:700;">ACADEMIC TERM</div>
        <div style="font-weight:600; font-size:13px; margin-top:2px;">${escapeHtml(s.term || 'Current Term')}</div>
      </div>
      <div>
        <div class="tiny" style="color:var(--text-muted); font-weight:700;">ENROLLMENT DATE</div>
        <div style="font-weight:600; font-size:13px; margin-top:2px;">${escapeHtml(s.enrollmentDate || '—')}</div>
      </div>
    </div>

    <div style="background:rgba(0,0,0,0.03); padding:16px; border-radius:12px; border:1px solid var(--card-border);">
      <div class="tiny" style="color:var(--accent1); font-weight:800; text-transform:uppercase; margin-bottom:8px;"><i class="fa-solid fa-users"></i> Guardian Information</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <div>
          <div class="tiny" style="color:var(--text-muted);">Name & Relation:</div>
          <div style="font-weight:700; font-size:13px;">${escapeHtml(s.guardianName || '—')} (${escapeHtml(s.guardianRel || 'Guardian')})</div>
        </div>
        <div>
          <div class="tiny" style="color:var(--text-muted);">Primary Phone:</div>
          <div style="font-weight:700; font-size:13px;"><a href="tel:${escapeHtml(s.phone||'')}" style="color:var(--accent1); text-decoration:none;"><i class="fa-solid fa-phone"></i> ${escapeHtml(s.phone || '—')}</a></div>
        </div>
        <div>
          <div class="tiny" style="color:var(--text-muted);">Email:</div>
          <div style="font-size:12px;">${escapeHtml(s.guardianEmail || '—')}</div>
        </div>
        <div>
          <div class="tiny" style="color:var(--text-muted);">Residential Address:</div>
          <div style="font-size:12px;">${escapeHtml(s.address || '—')}</div>
        </div>
      </div>
    </div>

    <div style="background:rgba(0,0,0,0.03); padding:16px; border-radius:12px; border:1px solid var(--card-border);">
      <div class="tiny" style="color:var(--accent1); font-weight:800; text-transform:uppercase; margin-bottom:8px;"><i class="fa-solid fa-notes-medical"></i> Medical & Special Instructions</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <div>
          <div class="tiny" style="color:var(--text-muted);">Emergency Phone:</div>
          <div style="font-weight:700; font-size:13px;">${escapeHtml(s.emergencyPhone || '—')}</div>
        </div>
        <div>
          <div class="tiny" style="color:var(--text-muted);">Allergies / Conditions:</div>
          <div style="font-size:12px; color:#ef4444; font-weight:600;">${escapeHtml(s.medicalNotes || 'None recorded')}</div>
        </div>
      </div>
      ${s.notes ? `<div style="margin-top:8px; border-top:1px dashed var(--card-border); padding-top:8px;"><div class="tiny" style="color:var(--text-muted);">Teacher Remarks:</div><div style="font-size:12px; font-style:italic;">${escapeHtml(s.notes)}</div></div>` : ''}
    </div>
  `;

  document.getElementById('vs_editBtn').onclick = () => {
    closeViewStudentModal();
    openStudentModal(classId, studentId);
  };

  document.getElementById('viewStudentModal').classList.add('active');
}

function closeViewStudentModal() {
  document.getElementById('viewStudentModal').classList.remove('active');
}

document.getElementById('newStudentBtn').addEventListener('click', ()=>{
  const classId = document.getElementById('selectClassForStudents').value;
  openStudentModal(classId);
});

function editStudent(classId, studentId){
  openStudentModal(classId, studentId);
}

function deleteStudent(classId, studentId){
  if(!confirm('Are you sure you want to remove this student from the class?')) return;
  const arr = getClasses(); const c = arr.find(x=>x.id===classId);
  if(!c) return;
  c.students = (c.students||[]).filter(s=>s.id!==studentId);
  saveClasses(arr); renderStudentsForClass(classId); toast('Student deleted');
}

document.getElementById('selectClassForStudents').addEventListener('change', (e)=> renderStudentsForClass(e.target.value));

/* -------------------------
  ATTENDANCE REGISTER
------------------------- */
document.getElementById('openMarkBtn').addEventListener('click', renderAttendanceMarkArea);

function renderAttendanceMarkArea(){
  const classId = document.getElementById('attClassSelect').value;
  const date = document.getElementById('attDate').value;
  if(!classId || !date) return toast('Select class and date');
  const cls = getClasses().find(c=>c.id===classId);
  const area = document.getElementById('attendanceMarkArea'); area.innerHTML = '';
  if(!cls || !(cls.students||[]).length){ area.innerHTML = '<div class="tiny">No enrolled students in this class</div>'; return; }

  const table = document.createElement('table');
  table.innerHTML = `<thead><tr><th>Student</th><th>Status</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  cls.students.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(s.firstName + ' ' + (s.lastName||''))}</td><td><select id="att_${s.id}" style="width:140px"><option value="present">Present</option><option value="absent">Absent</option></select></td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); area.appendChild(table);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn prim';
  saveBtn.style.marginTop = '12px';
  saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Attendance Register';
  saveBtn.onclick = () => {
    const record = { classId, date, records: {} };
    cls.students.forEach(s => {
      record.records[s.id] = document.getElementById('att_' + s.id).value;
    });
    const all = read(ATT_KEY);
    all.push(record);
    save(ATT_KEY, all);
    pushActivity(`Saved attendance for ${cls.name} on ${date}`);
    toast('Attendance register recorded successfully');
    area.innerHTML = '<div class="tiny" style="color:var(--success)">Attendance submitted successfully!</div>';
    updateKPIs();
  };
  area.appendChild(saveBtn);
}

/* Teacher Clock-In/Out */
document.getElementById('clockInBtn').addEventListener('click', ()=>{
  const t = read(TEACH_ATT_KEY);
  t.push({ type:'Clock In', time: new Date().toISOString() });
  save(TEACH_ATT_KEY, t);
  document.getElementById('attStatus').textContent = 'Status: Clocked In at ' + new Date().toLocaleTimeString();
  pushActivity('Teacher Clocked In');
  toast('Clocked in successfully');
});

document.getElementById('clockOutBtn').addEventListener('click', ()=>{
  const t = read(TEACH_ATT_KEY);
  t.push({ type:'Clock Out', time: new Date().toISOString() });
  save(TEACH_ATT_KEY, t);
  document.getElementById('attStatus').textContent = 'Status: Clocked Out at ' + new Date().toLocaleTimeString();
  pushActivity('Teacher Clocked Out');
  toast('Clocked out successfully');
});

/* -------------------------
  ASSIGNMENTS
------------------------- */
document.getElementById('newAssignBtn').addEventListener('click', ()=>{
  const classId = document.getElementById('assignClassSelect').value;
  if(!classId) return toast('Select a class first');
  openModal('New Assignment', [{name:'title', label:'Assignment Title'}, {name:'dueDate', label:'Due Date', type:'date'}], (data)=>{
    if(!data.title) return toast('Title required');
    const list = read(ASSIGN_KEY);
    list.push({ id:'a_'+Date.now(), classId, ...data });
    save(ASSIGN_KEY, list);
    renderAssignments();
    pushActivity(`Added assignment: ${data.title}`);
    toast('Assignment created');
  });
});

function renderAssignments(){
  const classId = document.getElementById('assignClassSelect').value;
  const list = read(ASSIGN_KEY).filter(a => !classId || a.classId === classId);
  const container = document.getElementById('assignmentList');
  if(!list.length) { container.innerHTML = '<div class="tiny">No assignments recorded.</div>'; return; }
  container.innerHTML = list.map(a => `
    <div style="padding:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between;">
      <div>
        <strong>${escapeHtml(a.title)}</strong>
        <div class="tiny">Due: ${a.dueDate || 'N/A'}</div>
      </div>
      <button class="btn ghost" style="color:var(--danger)" onclick="deleteAssignment('${a.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');
}
function deleteAssignment(id){
  save(ASSIGN_KEY, read(ASSIGN_KEY).filter(a=>a.id!==id));
  renderAssignments();
  toast('Assignment removed');
}
document.getElementById('assignClassSelect').addEventListener('change', renderAssignments);

/* -------------------------
  MESSAGES
------------------------- */
document.getElementById('sendMsgBtn').addEventListener('click', ()=>{
  const subject = document.getElementById('msgSubject').value.trim();
  const to = document.getElementById('msgTo').value.trim();
  const body = document.getElementById('msgBody').value.trim();
  if(!subject || !body) return toast('Subject and content required');
  const msgs = read(MSG_KEY);
  msgs.push({ id:'m_'+Date.now(), subject, to, body, date: new Date().toISOString() });
  save(MSG_KEY, msgs);
  document.getElementById('msgSubject').value = '';
  document.getElementById('msgTo').value = '';
  document.getElementById('msgBody').value = '';
  renderMessages();
  pushActivity(`Sent message: ${subject}`);
  toast('Message sent');
});

function renderMessages(){
  const msgs = read(MSG_KEY).slice().reverse();
  const container = document.getElementById('msgList');
  if(!msgs.length) { container.innerHTML = '<div class="tiny">No messages found.</div>'; return; }
  container.innerHTML = msgs.map(m => `
    <div style="padding:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; margin-bottom:8px;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${escapeHtml(m.subject)}</strong>
        <span class="tiny">${new Date(m.date).toLocaleDateString()}</span>
      </div>
      <div class="tiny" style="margin-bottom:4px;">To: ${escapeHtml(m.to||'All')}</div>
      <div>${escapeHtml(m.body)}</div>
    </div>
  `).join('');
}

/* -------------------------
  LESSON NOTES
------------------------- */
document.getElementById('saveNoteBtn').addEventListener('click', ()=>{
  const classId = document.getElementById('noteClassSelect').value;
  const title = document.getElementById('noteTitle').value.trim();
  const body = document.getElementById('noteBody').value.trim();
  if(!title || !body) return toast('Title and description required');
  const notes = read(NOTE_KEY);
  notes.push({ id:'n_'+Date.now(), classId, title, body, date: new Date().toISOString() });
  save(NOTE_KEY, notes);
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteBody').value = '';
  renderNotes();
  pushActivity(`Saved lesson note: ${title}`);
  toast('Note saved');
});

function renderNotes(){
  const notes = read(NOTE_KEY).slice().reverse();
  const container = document.getElementById('notesList');
  if(!notes.length) { container.innerHTML = '<div class="tiny">No lesson notes recorded.</div>'; return; }
  container.innerHTML = notes.map(n => `
    <div style="padding:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; margin-bottom:8px;">
      <strong>${escapeHtml(n.title)}</strong>
      <div class="tiny" style="margin-bottom:6px;">${new Date(n.date).toLocaleDateString()}</div>
      <p style="font-size:14px;">${escapeHtml(n.body)}</p>
    </div>
  `).join('');
}

/* -------------------------
  TIMETABLE
------------------------- */
document.getElementById('saveTTBtn').addEventListener('click', ()=>{
  const classId = document.getElementById('ttClassSelect').value;
  const day = document.getElementById('ttDay').value;
  const from = document.getElementById('ttFrom').value;
  const to = document.getElementById('ttTo').value;
  if(!classId || !from || !to) return toast('Fill all timetable fields');
  const tt = read(TT_KEY);
  tt.push({ id:'tt_'+Date.now(), classId, day, from, to });
  save(TT_KEY, tt);
  renderTimetable();
  toast('Timetable slot added');
});

function renderTimetable(){
  const tt = read(TT_KEY);
  const container = document.getElementById('timetableList');
  if(!tt.length) { container.innerHTML = '<div class="tiny">No timetable slots added.</div>'; return; }
  container.innerHTML = tt.map(t => `
    <div style="padding:10px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:8px; margin-bottom:6px; display:flex; justify-content:space-between;">
      <span><strong>${t.day}</strong>: ${t.from} - ${t.to}</span>
      <button class="btn ghost" style="padding:2px 6px; color:var(--danger)" onclick="deleteTT('${t.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');
}
function deleteTT(id){
  save(TT_KEY, read(TT_KEY).filter(t=>t.id!==id));
  renderTimetable();
}

/* -------------------------
  SETTINGS & THEME TOGGLE
------------------------- */
document.getElementById('themeBtn').addEventListener('click', ()=>{
  document.body.classList.toggle('light-theme');
  toast('Theme toggled');
});

document.getElementById('photoUpload').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const base64 = evt.target.result;
    teacher.photoBase64 = base64;
    localStorage.setItem('active_teacher', JSON.stringify(teacher));
    document.getElementById('profilePreview').src = base64;
    document.getElementById('profilePhoto').src = base64;
    toast('Profile image updated');
  };
  reader.readAsDataURL(file);
});

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('active_teacher');
  window.location.href = 'teacher-login.html';
});

/* -------------------------------------------------------------
   ACADEMIC CALENDAR & STAFF REVIEW LOGIC
------------------------------------------------------------- */
function getAcademicCalendarForStaff() {
  let list = safeParse(localStorage.getItem(CALENDAR_KEY));
  if (!list || !Array.isArray(list) || !list.length) {
    list = safeParse(localStorage.getItem('FLAWLESS GRAPHICS_academic_calendar'));
  }
  return (list && Array.isArray(list)) ? list : [];
}

function renderTeacherCalendarReview() {
  const container = document.getElementById('teacherCalendarContainer');
  if (!container) return;

  const calendar = getAcademicCalendarForStaff();
  const publishedTerms = calendar.filter(t => t.status === 'Published for Staff Review' || t.status === 'Certified');
  const termsToDisplay = publishedTerms.length ? publishedTerms : calendar;

  if (!termsToDisplay.length) {
    container.innerHTML = `
      <div style="padding:18px; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed var(--card-border); border-radius:12px;">
        <i class="fa-solid fa-calendar-xmark" style="font-size:24px; color:var(--text-muted); margin-bottom:8px; display:block;"></i>
        <div style="font-weight:700; font-size:13px;">No Academic Terms Published Yet</div>
        <div class="tiny" style="color:var(--text-muted); margin-top:2px;">
          HR Administration is finalizing term schedules. Once published for staff review, timelines and deadlines will appear here.
        </div>
      </div>
    `;
    updateCalendarOverviewBanner(null);
    return;
  }

  const ackKey = `${ORG}_calendar_ack_${teacher.email || 'teacher'}`;
  const isAck = localStorage.getItem(ackKey) === 'true';

  const ackBtn = document.getElementById('ackCalendarBtn');
  if (ackBtn) {
    if (isAck) {
      ackBtn.classList.remove('prim');
      ackBtn.classList.add('ghost');
      ackBtn.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Acknowledged';
    } else {
      ackBtn.classList.add('prim');
      ackBtn.classList.remove('ghost');
      ackBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Acknowledge Calendar';
    }
  }

  container.innerHTML = termsToDisplay.map(t => {
    const isLive = t.status === 'Published for Staff Review';
    return `
      <div style="background:var(--card-bg); border:1px solid ${isLive ? 'rgba(92, 225, 230, 0.3)' : 'var(--card-border)'}; border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 4px 14px rgba(0,0,0,0.12);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:800; font-size:15px; color:var(--text-main);">${escapeHtml(t.termTitle || 'Academic Term')}</span>
              <span class="badge" style="background:${isLive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)'}; color:${isLive ? '#10b981' : 'var(--text-muted)'}; font-size:10.5px;">
                ${isLive ? '<i class="fa-solid fa-circle" style="font-size:6px; margin-right:4px;"></i> Live Staff Review' : escapeHtml(t.status || 'Draft')}
              </span>
            </div>
            <div class="tiny" style="color:var(--text-muted); margin-top:3px;">
              Academic Session: <strong>${escapeHtml(t.academicYear || '2026/2027')}</strong> &bull; Review Window: <strong>${t.reviewWindowEnd ? new Date(t.reviewWindowEnd).toLocaleDateString() : 'Active'}</strong>
            </div>
          </div>
          ${isAck ? `
            <span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:11px; padding:4px 10px;">
              <i class="fa-solid fa-check"></i> Confirmed by Faculty
            </span>
          ` : `
            <span class="badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; font-size:11px; padding:4px 10px;">
              <i class="fa-solid fa-clock"></i> Review Pending
            </span>
          `}
        </div>

        <!-- Timeline Grid -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:12px; background:rgba(255,255,255,0.02); border:1px solid var(--card-border); border-radius:10px; padding:12px;">
          <div>
            <div class="tiny" style="color:var(--text-muted);"><i class="fa-solid fa-calendar-day" style="color:var(--accent1);"></i> Term Duration</div>
            <div style="font-size:12.5px; font-weight:700; margin-top:2px;">
              ${t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'} &rarr; ${t.endDate ? new Date(t.endDate).toLocaleDateString() : 'TBD'}
            </div>
          </div>
          <div>
            <div class="tiny" style="color:var(--text-muted);"><i class="fa-solid fa-file-circle-check" style="color:#f59e0b;"></i> CA Marks Deadline</div>
            <div style="font-size:12.5px; font-weight:700; color:#f59e0b; margin-top:2px;">
              ${t.caDeadline ? new Date(t.caDeadline).toLocaleDateString() : 'End of Wk 7'}
            </div>
          </div>
          <div>
            <div class="tiny" style="color:var(--text-muted);"><i class="fa-solid fa-pen-nib" style="color:#ef4444;"></i> Exams Period</div>
            <div style="font-size:12.5px; font-weight:700; margin-top:2px;">
              ${t.examStart ? new Date(t.examStart).toLocaleDateString() : 'TBD'} &rarr; ${t.endDate ? new Date(t.endDate).toLocaleDateString() : 'TBD'}
            </div>
          </div>
        </div>

        ${t.notes ? `
          <div style="font-size:12px; color:var(--text-muted); background:rgba(0,0,0,0.1); border-left:3px solid var(--accent1); padding:8px 12px; border-radius:4px; line-height:1.4;">
            <strong style="color:var(--text-main); font-size:11px; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:2px;">
              <i class="fa-solid fa-bullhorn"></i> Faculty Directives from HR:
            </strong>
            ${escapeHtml(t.notes)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  updateCalendarOverviewBanner(termsToDisplay[0]);
  updateNotificationBell();
}

function acknowledgeAcademicCalendar() {
  const ackKey = `${ORG}_calendar_ack_${teacher.email || 'teacher'}`;
  localStorage.setItem(ackKey, 'true');
  pushActivity(`Acknowledged Academic Calendar for Staff Review`);
  toast('Academic calendar successfully acknowledged. Receipt logged for HR.');
  renderTeacherCalendarReview();
}

function updateCalendarOverviewBanner(activeTerm) {
  const banner = document.getElementById('teacherCalOverviewBanner');
  if (!banner) return;

  if (!activeTerm) {
    const calendar = getAcademicCalendarForStaff();
    activeTerm = calendar.find(t => t.status === 'Published for Staff Review') || calendar[0];
  }

  if (activeTerm && (activeTerm.status === 'Published for Staff Review' || activeTerm.status === 'Certified')) {
    banner.style.display = 'flex';
    const titleEl = document.getElementById('teacherCalBannerTitle');
    const subEl = document.getElementById('teacherCalBannerSubtitle');
    if (titleEl) titleEl.textContent = `Academic Calendar Published: ${activeTerm.termTitle || 'New Term'}`;
    if (subEl) subEl.textContent = `Session ${activeTerm.academicYear || '2026/2027'} &bull; CA Deadline: ${activeTerm.caDeadline ? new Date(activeTerm.caDeadline).toLocaleDateString() : 'Scheduled'} &bull; Faculty review open.`;
  } else {
    banner.style.display = 'none';
  }
}

function goToTeacherTimetable() {
  const tab = document.querySelector('[data-section="timetable"]');
  if (tab) tab.click();
}

/* -------------------------------------------------------------
   STUDENT ASSESSMENTS & GRADING DESK
------------------------------------------------------------- */
function getStudentAssessmentsForTeacher() {
  let list = safeParse(localStorage.getItem(ASSESS_KEY));
  if (!list || !Array.isArray(list) || !list.length) {
    list = safeParse(localStorage.getItem('FLAWLESS GRAPHICS_student_assessments'));
  }
  return (list && Array.isArray(list)) ? list : [];
}

function renderTeacherAssessments() {
  const tbody = document.getElementById('teacherAssessmentsTableBody');
  if (!tbody) return;

  const assessments = getStudentAssessmentsForTeacher();
  if (!assessments.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:28px; color:var(--text-muted);">
          <i class="fa-solid fa-stamp" style="font-size:24px; opacity:0.5; margin-bottom:8px; display:block;"></i>
          No assessments recorded yet. Click <strong>Record Assessment</strong> to submit continuous assessment &amp; exam marks.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = assessments.map(a => {
    const isApproved = a.status === 'Approved & Certified';
    const ca = a.caScore !== undefined ? a.caScore : 0;
    const exam = a.examScore !== undefined ? a.examScore : 0;
    const total = a.totalScore !== undefined ? a.totalScore : (ca + exam);
    const grade = a.grade || 'A';

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--text-main); font-size:13.5px;">${escapeHtml(a.studentName || 'Student')}</div>
          <div class="tiny" style="color:var(--text-muted); font-size:11px;">Roll: ${escapeHtml(a.studentRoll || 'STU-000')}</div>
        </td>
        <td>
          <div style="font-weight:600; font-size:13px;">${escapeHtml(a.className || 'Class')}</div>
          <div class="tiny" style="color:var(--text-muted); font-size:11px;">${escapeHtml(a.subject || 'Academic Core')}</div>
        </td>
        <td>
          <span style="background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:6px; font-weight:700; font-size:12.5px;">
            ${ca} / 30
          </span>
        </td>
        <td>
          <span style="background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:6px; font-weight:700; font-size:12.5px;">
            ${exam} / 70
          </span>
        </td>
        <td>
          <div style="font-weight:800; font-size:14px; color:var(--accent1, #5ce1e6);">${total}%</div>
          <span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981; font-size:10px; padding:1px 6px;">Grade ${grade}</span>
        </td>
        <td>
          ${isApproved ? `
            <span class="badge" style="background:rgba(16, 185, 129, 0.2); color:#10b981; font-size:11px; padding:4px 10px;">
              <i class="fa-solid fa-stamp"></i> Approved &amp; Certified
            </span>
          ` : `
            <span class="badge" style="background:rgba(245, 158, 11, 0.2); color:#f59e0b; font-size:11px; padding:4px 10px;">
              <i class="fa-solid fa-clock"></i> Awaiting HR Certification
            </span>
          `}
        </td>
        <td style="text-align:right;">
          ${isApproved ? `
            <div class="tiny" style="color:#10b981; font-weight:700;">
              <i class="fa-solid fa-circle-check"></i> Certified by HR
            </div>
            <div class="tiny" style="color:var(--text-muted); font-size:10px;">${a.certifiedAt ? new Date(a.certifiedAt).toLocaleDateString() : 'Official'}</div>
          ` : `
            <span class="tiny" style="color:var(--text-muted); font-style:italic;">Pending HR QA</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function openNewAssessmentModal() {
  const modal = document.getElementById('recordAssessmentModal');
  if (!modal) return;

  const classSelect = document.getElementById('ra_classSelect');
  const classes = getClasses();
  if (classSelect) {
    classSelect.innerHTML = '<option value="">-- Select Classroom --</option>' +
      classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.subject || 'Core')})</option>`).join('');
  }

  document.getElementById('ra_editId').value = '';
  document.getElementById('ra_caScore').value = '';
  document.getElementById('ra_examScore').value = '';
  document.getElementById('ra_totalScore').textContent = '0%';
  document.getElementById('ra_gradeBadge').textContent = 'F';
  document.getElementById('ra_teacherRemarks').value = '';

  populateStudentsForAssessment();
  modal.classList.add('active');
}

function closeRecordAssessmentModal() {
  const modal = document.getElementById('recordAssessmentModal');
  if (modal) modal.classList.remove('active');
}

function populateStudentsForAssessment() {
  const classId = document.getElementById('ra_classSelect')?.value;
  const studentSelect = document.getElementById('ra_studentSelect');
  if (!studentSelect) return;

  if (!classId) {
    // Populate all students from all classes or defaults
    const classes = getClasses();
    let allStudents = [];
    classes.forEach(c => {
      (c.students || []).forEach(s => {
        allStudents.push({ ...s, classId: c.id, className: c.name, subject: c.subject });
      });
    });

    if (!allStudents.length) {
      allStudents = [
        { id: 's_demo1', firstName: 'Samuel', lastName: 'Kofi Mensah', roll: 'STU-2026-001' },
        { id: 's_demo2', firstName: 'Amina', lastName: 'Bello', roll: 'STU-2026-002' },
        { id: 's_demo3', firstName: 'Kwesi', lastName: 'Appiah', roll: 'STU-2026-003' }
      ];
    }

    studentSelect.innerHTML = '<option value="">-- Select Student --</option>' +
      allStudents.map(s => {
        const name = (s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.name).trim();
        return `<option value="${s.id}" data-name="${escapeHtml(name)}" data-roll="${escapeHtml(s.roll || 'STU-000')}">${escapeHtml(name)} (${escapeHtml(s.roll || 'STU-000')})</option>`;
      }).join('');
    return;
  }

  const c = getClasses().find(x => x.id === classId);
  const students = (c && c.students) ? c.students : [];
  if (!students.length) {
    studentSelect.innerHTML = '<option value="">No students enrolled in selected class</option>';
  } else {
    studentSelect.innerHTML = '<option value="">-- Select Student --</option>' +
      students.map(s => {
        const name = (s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.name).trim();
        return `<option value="${s.id}" data-name="${escapeHtml(name)}" data-roll="${escapeHtml(s.roll || 'STU-000')}">${escapeHtml(name)} (${escapeHtml(s.roll || 'STU-000')})</option>`;
      }).join('');
  }
}

function recalcAssessmentScores() {
  const ca = Math.min(30, Math.max(0, parseFloat(document.getElementById('ra_caScore')?.value) || 0));
  const exam = Math.min(70, Math.max(0, parseFloat(document.getElementById('ra_examScore')?.value) || 0));
  const total = Math.round(ca + exam);

  let grade = 'F';
  if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';

  const totalEl = document.getElementById('ra_totalScore');
  const gradeEl = document.getElementById('ra_gradeBadge');
  if (totalEl) totalEl.textContent = `${total}%`;
  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = (grade === 'A' || grade === 'B') ? '#10b981' : (grade === 'C' ? 'var(--accent1)' : '#f59e0b');
  }
}

function handleSaveTeacherAssessment(e) {
  if (e) e.preventDefault();

  const classSelect = document.getElementById('ra_classSelect');
  const studentSelect = document.getElementById('ra_studentSelect');
  const studentOpt = studentSelect?.selectedOptions[0];

  const studentId = studentSelect?.value;
  const studentName = studentOpt?.dataset.name || studentOpt?.textContent || 'Student';
  const studentRoll = studentOpt?.dataset.roll || 'STU-2026-000';

  const classId = classSelect?.value;
  const classObj = getClasses().find(c => c.id === classId);
  const className = classObj?.name || 'Assigned Classroom';
  const subject = classObj?.subject || 'Academic Course';

  const caScore = Math.min(30, Math.max(0, parseFloat(document.getElementById('ra_caScore')?.value) || 0));
  const examScore = Math.min(70, Math.max(0, parseFloat(document.getElementById('ra_examScore')?.value) || 0));
  const totalScore = Math.round(caScore + examScore);

  let grade = 'F';
  if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 50) grade = 'D';

  const remarks = document.getElementById('ra_teacherRemarks')?.value.trim();

  let assessments = getStudentAssessmentsForTeacher();
  const newRecord = {
    id: 'as_' + Date.now(),
    studentId: studentId || ('stu_' + Date.now()),
    studentName,
    studentRoll,
    className,
    subject,
    teacherName: (teacher && (teacher.name || teacher.fullName)) || 'Faculty Instructor',
    caScore,
    examScore,
    totalScore,
    grade,
    status: 'Awaiting HR Certification',
    teacherRemarks: remarks || 'Faculty continuous evaluation & end-of-term score submitted.',
    submittedAt: Date.now()
  };

  assessments.unshift(newRecord);
  save(ASSESS_KEY, assessments);
  // Also keep active org synced
  localStorage.setItem(`${ORG}_student_assessments`, JSON.stringify(assessments));

  renderTeacherAssessments();
  closeRecordAssessmentModal();
  pushActivity(`Recorded assessment for ${studentName} (${totalScore}%) — Sent for HR Certification`);
  toast(`Assessment submitted to HR QA Desk for certification`);
}

/* -------------------------------------------------------------
   NOTIFICATIONS POPOVER & BELL
------------------------------------------------------------- */
function toggleNotificationPopover(e) {
  if (e) e.stopPropagation();
  const pop = document.getElementById('notifPopover');
  if (!pop) return;
  const isOpen = pop.style.display === 'block';
  pop.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) updateNotificationBell();
}

document.addEventListener('click', (e) => {
  const pop = document.getElementById('notifPopover');
  if (pop && !pop.contains(e.target)) {
    pop.style.display = 'none';
  }
});

function updateNotificationBell() {
  const bellCount = document.getElementById('notifCount');
  const popoverCount = document.getElementById('notifPopoverCount');
  const popoverList = document.getElementById('notifPopoverList');

  const notifications = [];

  // Check published calendar
  const calendar = getAcademicCalendarForStaff();
  const liveTerm = calendar.find(t => t.status === 'Published for Staff Review');
  if (liveTerm) {
    const ackKey = `${ORG}_calendar_ack_${teacher.email || 'teacher'}`;
    const isAck = localStorage.getItem(ackKey) === 'true';
    if (!isAck) {
      notifications.push({
        type: 'calendar',
        icon: 'fa-solid fa-calendar-days',
        color: 'var(--accent1)',
        title: 'Academic Calendar Review',
        desc: `${liveTerm.termTitle || 'New Term'} published for faculty review.`,
        action: 'goToTeacherTimetable()'
      });
    }
  }

  // Check pending certified assessments
  const assessments = getStudentAssessmentsForTeacher();
  const certified = assessments.filter(a => a.status === 'Approved & Certified');
  if (certified.length) {
    notifications.push({
      type: 'assessment',
      icon: 'fa-solid fa-stamp',
      color: '#10b981',
      title: 'Assessment Certified',
      desc: `${certified.length} student assessment(s) officially endorsed by HR.`,
      action: "document.querySelector('[data-section=\"assessments\"]').click()"
    });
  }

  const unreadCount = notifications.length;
  if (bellCount) {
    bellCount.textContent = unreadCount;
    bellCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }
  if (popoverCount) {
    popoverCount.textContent = `${unreadCount} active`;
  }
  if (popoverList) {
    if (!notifications.length) {
      popoverList.innerHTML = '<div class="tiny" style="color:var(--text-muted); text-align:center; padding:8px;">No unread notifications</div>';
    } else {
      popoverList.innerHTML = notifications.map(n => `
        <div onclick="${n.action}; document.getElementById('notifPopover').style.display='none';" style="cursor:pointer; padding:8px 10px; background:rgba(255,255,255,0.03); border:1px solid var(--card-border); border-radius:8px; display:flex; gap:10px; align-items:flex-start;">
          <i class="${n.icon}" style="color:${n.color}; font-size:14px; margin-top:2px;"></i>
          <div>
            <div style="font-weight:700; font-size:12px; color:var(--text-main);">${escapeHtml(n.title)}</div>
            <div class="tiny" style="color:var(--text-muted); font-size:11px;">${escapeHtml(n.desc)}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

/* -------------------------
  KPI UPDATES & INITIALIZATION
------------------------- */
function updateKPIs(){
  const classes = getClasses();
  let totalStudents = 0;
  classes.forEach(c => { totalStudents += (c.students||[]).length; });
  
  document.getElementById('k_classes').textContent = classes.length;
  document.getElementById('k_students').textContent = totalStudents;
  document.getElementById('k_msgs').textContent = read(MSG_KEY).length;
  document.getElementById('k_att').textContent = '95%';
}

// Initial Boot Sequence
renderClasses();
renderActivity();
renderAssignments();
renderMessages();
renderNotes();
renderTimetable();
renderTeacherCalendarReview();
renderTeacherAssessments();
updateKPIs();
updateNotificationBell();