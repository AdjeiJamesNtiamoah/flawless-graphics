/* teacher-classes.js - classroom UI logic */
(function(){
  function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
  function read(k){ return safeParse(localStorage.getItem(k)) || [] }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

  const ACTIVE_ORG = (localStorage.getItem('active_org') || '').trim();
  if(!ACTIVE_ORG){ alert('No active org'); window.location.href='index.html'; return; }

  const CLASSES_KEY = `${ACTIVE_ORG}_classes`;
  const SCHEDULE_KEY = `${ACTIVE_ORG}_class_schedule`;

  function getClasses(){ return read(CLASSES_KEY) }
  function saveClasses(a){ save(CLASSES_KEY,a) }
  function getSchedule(){ return read(SCHEDULE_KEY) }
  function saveSchedule(a){ save(SCHEDULE_KEY,a) }

  // UI elements (teacher-classes.html must have these ids)
  if(!document.getElementById('classesRoot')) return;
  const tableBody = document.getElementById('classesTableBody');
  const cardsWrap = document.getElementById('classesCards');
  const viewTabs = document.querySelectorAll('.view-tab');

  function renderTable(){
    const list = getClasses();
    tableBody.innerHTML = '';
    list.forEach((c,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${c.name}</td><td>${c.subject||''}</td><td>${(c.teacherName||'')}</td><td>${(c.students||[]).length}</td><td><button class="btn" onclick="editClass(${i})">Edit</button></td>`;
      tableBody.appendChild(tr);
    });
  }

  function renderCards(){
    const list = getClasses();
    cardsWrap.innerHTML = '';
    list.forEach((c,i)=>{
      const card = document.createElement('div'); card.className='card small';
      card.style.marginBottom='10px';
      card.innerHTML = `<strong>${c.name}</strong><div class="small">${c.subject||''} • ${c.teacherName||''}</div><div class="small">${(c.students||[]).length} students</div>`;
      cardsWrap.appendChild(card);
    });
  }

  // timetable editor (simple grid)
  function renderTimetable(){
    const schedule = getSchedule();
    const grid = document.getElementById('timetableEditorGrid');
    grid.innerHTML = '';
    const days = ['Time','Mon','Tue','Wed','Thu','Fri'];
    days.forEach(d=>{
      const el = document.createElement('div'); el.className='cell'; el.style.fontWeight='700'; el.textContent=d; grid.appendChild(el);
    });
    const times = ['08:00','10:00','12:00','14:00'];
    times.forEach(t=>{
      const timeCell = document.createElement('div'); timeCell.className='cell'; timeCell.textContent = t; grid.appendChild(timeCell);
      for(let d=1; d<=5; d++){
        const cell = document.createElement('div'); cell.className='cell';
        const slot = schedule.find(s=> s.day===d && s.time===t);
        if(slot){
          const sdiv = document.createElement('div'); sdiv.className='slot'; sdiv.textContent = `${slot.className} • ${slot.teacherName||''}`; cell.appendChild(sdiv);
        } else {
          cell.innerHTML = `<div class="small">—</div>`;
        }
        grid.appendChild(cell);
      }
    });
  }

  // view switching
  viewTabs.forEach(tab=>{
    tab.addEventListener('click', ()=> {
      document.querySelectorAll('.view-tab').forEach(x=>x.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;
      document.querySelectorAll('.view-pane').forEach(p=> p.style.display='none');
      document.getElementById(view).style.display='block';
    });
  });

  // initial
  renderTable(); renderCards(); renderTimetable();

  // expose some helpers globally for the edit buttons
  window.editClass = function(i){
    const classes = getClasses();
    const c = classes[i];
    const name = prompt('Class name', c.name);
    if(name === null) return;
    c.name = name;
    classes[i] = c;
    saveClasses(classes);
    renderTable(); renderCards(); renderTimetable();
  };

  // add class form
  document.getElementById('addClassBtn').addEventListener('click', ()=>{
    const name = document.getElementById('newClassName').value.trim();
    if(!name) return alert('Provide class name');
    const arr = getClasses(); arr.push({ name, subject: document.getElementById('newClassSubject').value.trim(), teacherName: document.getElementById('newClassTeacher').value.trim(), students: [] });
    saveClasses(arr); renderTable(); renderCards(); renderTimetable();
    document.getElementById('newClassName').value=''; document.getElementById('newClassSubject').value=''; document.getElementById('newClassTeacher').value='';
  });

  // simple schedule slot adder
  document.getElementById('addScheduleBtn').addEventListener('click', ()=>{
    const day = Number(document.getElementById('schedDay').value);
    const time = document.getElementById('schedTime').value;
    const className = document.getElementById('schedClassName').value.trim();
    const teacherName = document.getElementById('schedTeacher').value.trim();
    if(!day || !time || !className) return alert('Fill schedule fields');
    const s = getSchedule(); s.push({ day, time, className, teacherName }); saveSchedule(s); renderTimetable(); alert('Scheduled');
  });

  // file import/export
  document.getElementById('exportClassesBtn').addEventListener('click', ()=>{
    const data = { classes: getClasses(), schedule: getSchedule() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${ACTIVE_ORG}_classes.json`; a.click();
  });

  document.getElementById('importClassesBtn').addEventListener('click', ()=>{
    const ip = document.createElement('input'); ip.type='file'; ip.accept='application/json';
    ip.onchange = e=>{
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader(); r.onload = ()=>{
        try{
          const data = JSON.parse(r.result);
          if(data.classes) saveClasses(data.classes);
          if(data.schedule) saveSchedule(data.schedule);
          renderTable(); renderCards(); renderTimetable();
          alert('Import done');
        }catch(err){ alert('Invalid JSON'); }
      }; r.readAsText(f);
    }; ip.click();
  });

})();
