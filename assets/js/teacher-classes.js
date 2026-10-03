/* teacher-classes.js - classroom UI logic */
(function(){
  function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
  function read(k){ return safeParse(localStorage.getItem(k)) || [] }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }

  const ACTIVE_ORG = (localStorage.getItem('active_org') || (window.AuthSession ? window.AuthSession.getOrg() : '') || 'FLAWLESS GRAPHICS').trim();
  if(!localStorage.getItem('active_org')) localStorage.setItem('active_org', ACTIVE_ORG);

  const CLASSES_KEY = `${ACTIVE_ORG}_classes`;
  const SCHEDULE_KEY = `${ACTIVE_ORG}_class_schedule`;

  function getClasses(){
    let arr = read(CLASSES_KEY);
    if (!Array.isArray(arr)) {
      arr = [];
    }
    // Purge any legacy dummy seed classes
    const dummyIds = new Set(['cls_f2_arts', 'cls_f3_web', 'cls_f1_illust', 'cls_f2_print', 'cls_1', 'cls_2', 'cls_3', 'cls_4', 'cls_5']);
    const dummyNames = new Set([
      'grade 10 - graphic arts & visual identity',
      'grade 11 - web systems & client architecture',
      'grade 12 - digital animation & 3d modeling',
      'grade 9 - fundamental design principles',
      'grade 10 - ui/ux interactive prototyping',
      'class 1 - visual design',
      'class 2 - web systems',
      'class 3 - animation & 3d'
    ]);
    const filtered = arr.filter(c => !dummyIds.has(c.id) && !dummyNames.has((c.name || c.className || '').toLowerCase().trim()));
    if (filtered.length !== arr.length) {
      arr = filtered;
      save(CLASSES_KEY, arr);
    }
    return arr;
  }
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
      tr.innerHTML = `<td>${i+1}</td><td><strong>${c.name}</strong></td><td>${c.subject||''}</td><td>${(c.teacherName||'')}</td><td>${(c.students||[]).length}</td><td><button class="btn" onclick="editClass(${i})"><i class="fa-solid fa-pen-to-square"></i> Edit</button></td>`;
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

  // add class restriction (HR only)
  const addClassBtn = document.getElementById('addClassBtn');
  if (addClassBtn) {
    addClassBtn.addEventListener('click', ()=>{
      if (window.Toaster) {
        window.Toaster.warning('Action Restricted', 'Academic classrooms can only be created by HR Administrators.');
      } else {
        alert('Only HR Administrators can add classes to the organization.');
      }
    });
  }

  // simple schedule slot adder
  document.getElementById('addScheduleBtn').addEventListener('click', ()=>{
    const day = Number(document.getElementById('schedDay').value);
    const time = document.getElementById('schedTime').value;
    const className = document.getElementById('schedClassName').value.trim();
    const teacherName = document.getElementById('schedTeacher').value.trim();
    if(!day || !time || !className) return alert('Fill schedule fields');
    const s = getSchedule(); s.push({ day, time, className, teacherName }); saveSchedule(s); renderTimetable(); if (window.Toaster) { window.Toaster.success('Timetable Saved', `Scheduled slot for ${className} saved successfully!`); } else { alert('Scheduled'); }
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
          if (window.Toaster) { window.Toaster.success('Import Complete', 'Classes and schedule imported successfully!'); } else { alert('Import done'); }
        }catch(err){ alert('Invalid JSON'); }
      }; r.readAsText(f);
    }; ip.click();
  });

})();
