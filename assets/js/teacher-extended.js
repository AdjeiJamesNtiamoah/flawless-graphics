/* teacher-extended.js
   Adds Classroom Management, Student Module, Messaging, Leave, Timetable, Attendance for teachers.
   Requires: active_org in localStorage and teacher_active_user session.
*/

(function(){
  // Helpers
  function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
  function read(k){ return safeParse(localStorage.getItem(k)) || [] }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
  function id(i){ return document.getElementById(i) }

  const user = (window.AuthSession ? window.AuthSession.getUser() : null) 
    || safeParse(localStorage.getItem('teacher_active_user')) 
    || safeParse(localStorage.getItem('active_teacher')) 
    || safeParse(localStorage.getItem('active_org_user'))
    || { name: 'Demo Teacher', email: 'teacher@flawless.org', org: 'FLAWLESS GRAPHICS' };

  const ACTIVE_ORG = user.org || (localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS').trim();
  const TEACHER_SESSION = user;
  localStorage.setItem('teacher_active_user', JSON.stringify(TEACHER_SESSION));
  localStorage.setItem('active_teacher', JSON.stringify(TEACHER_SESSION));
  if(!localStorage.getItem('active_org')) localStorage.setItem('active_org', ACTIVE_ORG);

  // Storage keys
  const STUD_KEY = `${ACTIVE_ORG}_students`;
  const CLASS_KEY = `${ACTIVE_ORG}_classes`;
  const SCHED_KEY = `${ACTIVE_ORG}_class_schedule`;
  const STD_ATT_KEY = `${ACTIVE_ORG}_student_attendance`;
  const MSG_KEY = `${ACTIVE_ORG}_teacher_messages`;
  const LEAVE_KEY = `${ACTIVE_ORG}_leave_requests`;

  // --- Students API ---
  window.getStudents = ()=> {
    let arr = read(STUD_KEY);
    if (!arr || arr.length === 0) {
      arr = [
        { id: 1, firstName: "Kojo", lastName: "Antwi", class: "Class 1", roll: "101", createdAt: Date.now() },
        { id: 2, firstName: "Yaa", lastName: "Asantewaa", class: "Class 1", roll: "102", createdAt: Date.now() },
        { id: 3, firstName: "Kwabena", lastName: "Darko", class: "Class 2", roll: "201", createdAt: Date.now() },
        { id: 4, firstName: "Akua", lastName: "Donkor", class: "Class 2", roll: "202", createdAt: Date.now() },
        { id: 5, firstName: "Fiifi", lastName: "Baffour", class: "Class 3", roll: "301", createdAt: Date.now() }
      ];
      save(STUD_KEY, arr);
    }
    return arr;
  };
  window.saveStudents = (arr)=> save(STUD_KEY, arr);
  window.addStudent = (student)=>{
    const arr = getStudents();
    arr.push(Object.assign({ id: Date.now(), createdAt: Date.now() }, student));
    saveStudents(arr);
    return arr[arr.length-1];
  };
  window.updateStudent = (id, patch)=>{
    const arr = getStudents().map(s => s.id === id ? Object.assign({}, s, patch) : s);
    saveStudents(arr);
  };
  window.deleteStudent = (id)=>{ const arr = getStudents().filter(s=>s.id !== id); saveStudents(arr); };

  // --- Classes API (extend existing) ---
  window.getClasses = ()=> read(CLASS_KEY);
  window.saveClasses = (arr)=> save(CLASS_KEY, arr);
  window.addClass = (c) => {
    const arr = getClasses();
    arr.push(Object.assign({ id: Date.now() }, c));
    saveClasses(arr);
  };

  // --- Schedule API ---
  window.getSchedule = ()=> read(SCHED_KEY);
  window.saveSchedule = (a)=> save(SCHED_KEY, a);
  window.addScheduleSlot = (slot) => {
    // slot: { classId, teacherEmail, day (1-5), time ('08:00'), room}
    const arr = getSchedule();
    arr.push(Object.assign({ id: Date.now() }, slot));
    saveSchedule(arr);
  };
  window.deleteScheduleSlot = (id) => {
    const a = getSchedule().filter(s=> s.id !== id);
    saveSchedule(a);
  };

  // --- Student Attendance ---
  window.getStudentAttendance = ()=> read(STD_ATT_KEY);
  window.saveStudentAttendance = (a)=> save(STD_ATT_KEY, a);
  window.recordStudentAttendance = ({studentId, classId, status='present', note=''})=>{
    const arr = getStudentAttendance();
    arr.push({ id: Date.now(), studentId, classId, status, note, teacherEmail: TEACHER_SESSION.email, date: new Date().toISOString() });
    saveStudentAttendance(arr);
  };

  // --- Messaging (teacher <-> hr) ---
  window.getMessages = () => read(MSG_KEY);
  window.saveMessages = (a) => save(MSG_KEY, a);
  window.sendMessage = ({fromEmail, toEmail, subject, body})=>{
    const arr = getMessages();
    arr.push({ id:Date.now(), fromEmail, toEmail, subject, body, read:false, createdAt: new Date().toISOString() });
    saveMessages(arr);
  };

  // --- Leave requests (teacher) ---
  window.getLeaves = ()=> read(LEAVE_KEY);
  window.saveLeaves = (a)=> save(LEAVE_KEY, a);
  window.requestLeave = ({teacherEmail, fromDate, toDate, reason})=>{
    const arr = getLeaves();
    arr.push({ id:Date.now(), teacherEmail, fromDate, toDate, reason, status:'pending', createdAt: new Date().toISOString() });
    saveLeaves(arr);
  };
  window.updateLeaveStatus = (id, status, hrNote='')=>{
    const arr = getLeaves().map(l => l.id === id ? Object.assign({}, l, { status, hrNote, decidedAt: new Date().toISOString() }) : l);
    saveLeaves(arr);
  };

  // --- Exports ---
  window.exportStudentsCSV = ()=>{
    const students = getStudents();
    if(!students.length) return alert('No students to export');
    const keys = ['id','firstName','lastName','class','roll','phone','email'];
    const csv = [keys.join(',')].concat(students.map(s => keys.map(k=>`"${String(s[k]||'').replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${ACTIVE_ORG}_students.csv`; a.click();
  };

  // --- Simple UI helper renderers (small components) ---
  window.renderStudentsTable = function(containerId){
    const container = id(containerId);
    if(!container) return;
    const data = getStudents();
    if(!data.length){ container.innerHTML = '<div class="small" style="padding:16px; text-align:center; color:var(--text-muted);">No students enrolled yet</div>'; return; }
    let html = '<table style="width:100%;border-collapse:collapse;" class="modern-table"><thead><tr><th>#</th><th>Student Name</th><th>Class</th><th>Roll</th><th>Phone</th><th>Action</th></tr></thead><tbody>';
    data.forEach((s,i)=>{
      const avatar = s.photo 
        ? `<img src="${s.photo}" alt="${s.firstName}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; margin-right:10px; border:1px solid rgba(0,0,0,0.1); vertical-align:middle;">`
        : `<div style="display:inline-flex; width:32px; height:32px; border-radius:50%; background:var(--accent-primary, #6366f1); color:#fff; align-items:center; justify-content:center; font-size:11px; font-weight:700; margin-right:10px; vertical-align:middle;">${(s.firstName?.[0]||'S')+(s.lastName?.[0]||'')}</div>`;
      html += `<tr><td>${i+1}</td><td><div style="display:flex; align-items:center;">${avatar} <span style="font-weight:600;">${(s.firstName||'')+' '+(s.lastName||'')}</span></div></td><td>${s.class||''}</td><td><span class="badge">${s.roll||'—'}</span></td><td>${s.phone||'—'}</td><td><button class="btn-modern btn-secondary" style="padding:4px 10px; font-size:12px;" onclick="window.__openEditStudent(${s.id})"><i class="fa-solid fa-pen"></i> Edit</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  };

  // small global helpers used by UI
  window.__openEditStudent = function(id){
    const students = getStudents();
    const s = students.find(x=>x.id===id);
    if(!s) return alert('Student not found');
    // dispatch custom event for host page to handle (so UI remains flexible)
    window.dispatchEvent(new CustomEvent('teacher-extended-edit-student', { detail: s }));
  };

  // --- Initialize default sample data if none exists (safe)
  if(!read(STUD_KEY).length) {
    save(STUD_KEY, []);
  }
  if(!read(CLASS_KEY).length){
    save(CLASS_KEY, []);
  }
  if(!read(SCHED_KEY).length){
    save(SCHED_KEY, []);
  }
  if(!read(STD_ATT_KEY).length) save(STD_ATT_KEY, []);
  if(!read(MSG_KEY).length) save(MSG_KEY, []);
  if(!read(LEAVE_KEY).length) save(LEAVE_KEY, []);

  // Expose keys for debug
  window._TEACHER_EXT_KEYS = { STUD_KEY, CLASS_KEY, SCHED_KEY, STD_ATT_KEY, MSG_KEY, LEAVE_KEY };

})();
