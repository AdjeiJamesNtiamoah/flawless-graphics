/* teacher-dashboard.js
   Requires: teacher-dashboard.css loaded and Chart.js (optional charts)
   Keys used (per org):
     - <org>_teacher_accounts
     - <org>_teachers       (teacher profile list)
     - <org>_teacher_attendance
     - <org>_teacher_payments
     - <org>_teacher_performance
     - <org>_classes
     - <org>_class_schedule
*/

(function(){
  // utilities
  function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
  function read(k){ return safeParse(localStorage.getItem(k)) || [] }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

  const ACTIVE_ORG = (localStorage.getItem('active_org') || localStorage.getItem('activeOrg') || '').trim();
  if(!ACTIVE_ORG){ alert('No active organization found. Please login.'); window.location.href='teacher-login.html'; return; }

  const TEACHERS_KEY = `${ACTIVE_ORG}_teachers`;
  const ACC_KEY = `${ACTIVE_ORG}_teacher_accounts`;
  const ATT_KEY = `${ACTIVE_ORG}_teacher_attendance`;
  const PAY_KEY = `${ACTIVE_ORG}_teacher_payments`;
  const PERF_KEY = `${ACTIVE_ORG}_teacher_performance`;
  const CLASSES_KEY = `${ACTIVE_ORG}_classes`;
  const SCHEDULE_KEY = `${ACTIVE_ORG}_class_schedule`;

  // teacher session check (teacher_active_user set by login)
  const teacherSession = safeParse(localStorage.getItem('teacher_active_user') || '{}');
  if(!teacherSession || !teacherSession.email){ window.location.href = 'teacher-login.html'; return; }

  // DOM helpers
  function id(x){ return document.getElementById(x) }
  function q(sel){ return document.querySelector(sel) }

  // initial UI bindings (create DOM if file is used inline or ensure elements exist)
  // This script is meant to be imported by teacher-dashboard.html which provides the DOM elements.
  // If DOM not present, do nothing.
  if(!id('teacherDashboardRoot')) return;

  // show org & user
  id('orgName').textContent = ACTIVE_ORG;
  id('teacherName').textContent = teacherSession.name || teacherSession.email;
  id('teacherRole').textContent = teacherSession.role || 'Teacher';

  // data accessors
  function getTeachers(){ return read(TEACHERS_KEY) }
  function saveTeachers(a){ save(TEACHERS_KEY, a) }
  function getAttendance(){ return read(ATT_KEY) }
  function saveAttendance(a){ save(ATT_KEY, a) }
  function getPayments(){ return read(PAY_KEY) }
  function savePayments(a){ save(PAY_KEY, a) }
  function getPerformance(){ return read(PERF_KEY) }
  function savePerformance(a){ save(PERF_KEY, a) }
  function getClasses(){ return read(CLASSES_KEY) }
  function saveClasses(a){ save(CLASSES_KEY, a) }
  function getSchedule(){ return read(SCHEDULE_KEY) }
  function saveSchedule(a){ save(SCHEDULE_KEY, a) }

  // ---------- Render profile & KPIs ----------
  function calcKpis(){
    const teachers = getTeachers();
    const myIndex = teachers.findIndex(t => t.email === teacherSession.email);
    const totalTeachers = teachers.length;
    const myPayments = getPayments().filter(p=> p.teacherEmail === teacherSession.email );
    const totalPaid = myPayments.reduce((s,p)=> s + (Number(p.amount)||0), 0);
    const attendance = getAttendance().filter(a => a.teacherEmail === teacherSession.email && a.action==='in');
    const attendanceRate = teachers.length ? Math.round((attendance.length / (teachers.length||1)) * 100) : 100;
    return { totalTeachers, myPaymentsCount: myPayments.length, totalPaid, attendanceCount: attendance.length, attendanceRate };
  }

  function updateKpis(){
    const k = calcKpis();
    id('k_total_teachers').textContent = k.totalTeachers;
    id('k_attendance_rate').textContent = k.attendanceRate + '%';
    id('k_payments_count').textContent = k.myPaymentsCount;
    id('k_total_paid').textContent = 'GHS ' + (k.totalPaid || 0).toLocaleString();
  }

  // ---------- Attendance actions for teacher ----------
  id('myClockIn').addEventListener('click', ()=>{
    const rec = { teacherEmail: teacherSession.email, action:'in', date: new Date().toISOString() };
    const arr = getAttendance(); arr.push(rec); saveAttendance(arr); renderMyAttendance(); updateKpis(); alert('Clocked in');
  });
  id('myClockOut').addEventListener('click', ()=>{
    const rec = { teacherEmail: teacherSession.email, action:'out', date: new Date().toISOString() };
    const arr = getAttendance(); arr.push(rec); saveAttendance(arr); renderMyAttendance(); updateKpis(); alert('Clocked out');
  });

  function renderMyAttendance(){
    const arr = getAttendance().filter(a=> a.teacherEmail === teacherSession.email).slice().reverse();
    const out = id('myAttendanceList'); out.innerHTML = '';
    if(!arr.length) { out.innerHTML = '<div class="small">No attendance history</div>'; return; }
    arr.forEach(a=>{
      const d = document.createElement('div');
      d.className = 'small';
      d.style.padding = '6px 0';
      d.innerHTML = `${a.action.toUpperCase()} • ${new Date(a.date).toLocaleString()}`;
      out.appendChild(d);
    });
  }

  // ---------- My Performance & chart ----------
  function renderMyPerformance(){
    const arr = getPerformance().filter(p=> p.teacherEmail === teacherSession.email);
    const out = id('myEvalList'); out.innerHTML = '';
    if(!arr.length) out.innerHTML = '<div class="small">No evaluations yet</div>';
    arr.slice().reverse().forEach(p=>{
      const d = document.createElement('div'); d.style.padding='8px 0'; d.innerHTML = `<strong>Score: ${p.score}</strong> <div class="small">${p.comment || ''} • ${new Date(p.date).toLocaleString()}</div>`;
      out.appendChild(d);
    });
    // chart
    const ctx = id('myPerfChart');
    if(ctx){
      const labels = arr.slice(-12).map(x=> new Date(x.date).toLocaleDateString());
      const data = arr.slice(-12).map(x=> x.score);
      if(window._myPerfChart) window._myPerfChart.destroy();
      window._myPerfChart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Score', data, borderColor:'#00d1ff', backgroundColor:'rgba(0,209,255,0.08)', fill:true }] }, options:{plugins:{legend:{display:false}}} });
    }
  }

  // ---------- My Payroll ----------
  function renderMyPayments(){
    const arr = getPayments().filter(p=> p.teacherEmail === teacherSession.email).slice().reverse();
    const out = id('myPaymentsList'); out.innerHTML = '';
    if(!arr.length) out.innerHTML = '<div class="small">No payments yet</div>';
    arr.forEach(p=>{
      const div = document.createElement('div'); div.style.padding = '8px 0';
      div.innerHTML = `<strong>GHS ${Number(p.amount).toLocaleString()}</strong> <div class="small">${new Date(p.date).toLocaleString()} • ${p.note||''}</div>`;
      out.appendChild(div);
    });
  }

  // ---------- Classes: roster & timetable ----------
  function renderMyClasses(){
    const classes = getClasses();
    const my = classes.filter(c => (c.teacherEmail||'').toLowerCase() === teacherSession.email.toLowerCase());
    const out = id('myClassesList'); out.innerHTML = '';
    if(!my.length) out.innerHTML = '<div class="small">No assigned classes</div>';
    my.forEach(c=>{
      const card = document.createElement('div'); card.className='card small';
      card.style.marginBottom='8px';
      card.innerHTML = `<strong>${c.name}</strong><div class="small">${c.subject || ''} • ${ (c.students||[]).length } students</div>`;
      out.appendChild(card);
    });

    // Timetable: render schedule (basic)
    const schedule = getSchedule();
    const table = id('timetableGrid');
    if(!table) return;
    // days: Mon-Fri, hours slots from schedule
    const days = ['Time','Mon','Tue','Wed','Thu','Fri'];
    // header
    table.innerHTML = '';
    const headerRow = document.createElement('div'); headerRow.style.display='contents';
    days.forEach(d=>{
      const cell = document.createElement('div'); cell.className='cell'; cell.style.fontWeight='700'; cell.style.background='transparent'; cell.textContent = d;
      table.appendChild(cell);
    });
    // timeslots (simple fixed rows 4 slots)
    const times = ['08:00','10:00','12:00','14:00'];
    times.forEach(t=>{
      const timeCell = document.createElement('div'); timeCell.className='cell'; timeCell.textContent=t; table.appendChild(timeCell);
      for(let di=1; di<=5; di++){
        const cell = document.createElement('div'); cell.className='cell';
        // find slot
        const slot = schedule.find(s => s.day===di && s.time===t && s.teacherEmail === teacherSession.email);
        if(slot){
          const el = document.createElement('div');
          el.className='slot';
          el.textContent = `${slot.className} • ${slot.subject}`;
          cell.appendChild(el);
        } else {
          cell.innerHTML = '<div class="small">—</div>';
        }
        table.appendChild(cell);
      }
    });
  }

  // ---------- Announcements (org-level) ----------
  function renderAnnouncements(){
    const announcements = read(`${ACTIVE_ORG}_announcements`) || [];
    const out = id('announcements'); out.innerHTML = '';
    if(!announcements.length) out.innerHTML = '<div class="small">No announcements</div>';
    announcements.slice().reverse().forEach(a=>{
      const d = document.createElement('div'); d.style.padding='8px 0';
      d.innerHTML = `<strong>${a.title}</strong><div class="small">${a.body} • ${new Date(a.date).toLocaleString()}</div>`;
      out.appendChild(d);
    });
  }

  // ---------- logout ----------
  id('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem('teacher_active_user');
    window.location.href = 'teacher-login.html';
  });

  // ---------- initial render ----------
  updateKpis(); renderMyAttendance(); renderMyPerformance(); renderMyPayments(); renderMyClasses(); renderAnnouncements();

  // keep in sync
  window.addEventListener('storage', ()=>{
    updateKpis(); renderMyAttendance(); renderMyPerformance(); renderMyPayments(); renderMyClasses(); renderAnnouncements();
  });
})();
