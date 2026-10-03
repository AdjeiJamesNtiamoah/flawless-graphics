const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/hr/hr-dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetOldStart = 'function openAddClassModal() {';
const targetOldEnd = 'async function deleteClassroom(classId) {';

const startIndex = content.indexOf(targetOldStart);
const endIndex = content.indexOf(targetOldEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target functions not found!', { startIndex, endIndex });
  process.exit(1);
}

const replacementCode = `function openAddClassModal() {
  const drawer = document.getElementById('addClassDrawer');
  const backdrop = document.getElementById('addClassDrawerBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.classList.add('slide-over-open');
  if (window.SlideOver && typeof window.SlideOver.open === 'function') {
    window.SlideOver.open('addClassDrawer');
  }
  updateAddClassPreview();
}

function closeAddClassModal() {
  const drawer = document.getElementById('addClassDrawer');
  const backdrop = document.getElementById('addClassDrawerBackdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.classList.remove('slide-over-open');
  if (window.SlideOver && typeof window.SlideOver.close === 'function') {
    window.SlideOver.close('addClassDrawer');
  }
  document.getElementById('addClassModalBackdrop')?.classList.remove('show');
}

function updateAddClassPreview() {
  const code = (document.getElementById('new_class_code')?.value || 'CLS-11A').trim().toUpperCase();
  const name = (document.getElementById('new_class_name')?.value || 'Grade 11 - Web Engineering').trim();
  const subject = (document.getElementById('new_class_subject')?.value || 'Computer Science').trim();
  const grade = document.getElementById('new_class_grade')?.value || 'Grade 10';
  const room = (document.getElementById('new_class_room')?.value || 'Room 101').trim();
  const schedule = (document.getElementById('new_class_schedule')?.value || 'Tue, Thu 10am').trim();
  const cap = document.getElementById('new_class_capacity')?.value || '30';

  const previewCode = document.getElementById('preview_class_code');
  const previewTitle = document.getElementById('preview_class_title');
  const previewSubject = document.getElementById('preview_class_subject');
  const previewGrade = document.getElementById('preview_class_grade');
  const previewRoom = document.getElementById('preview_class_room');
  const previewSchedule = document.getElementById('preview_class_schedule');
  const previewCapacity = document.getElementById('preview_class_capacity');

  if (previewCode) previewCode.textContent = code || 'CLS-11A';
  if (previewTitle) previewTitle.textContent = name || 'Grade 11 - Web Engineering';
  if (previewSubject) previewSubject.textContent = subject || 'Computer Science';
  if (previewGrade) previewGrade.textContent = grade;
  if (previewRoom) previewRoom.textContent = room || 'Room 101';
  if (previewSchedule) previewSchedule.textContent = schedule || 'Tue, Thu 10am';
  if (previewCapacity) previewCapacity.textContent = \`\${cap} Seats\`;
}

function autoGenerateClassCode() {
  const subject = (document.getElementById('new_class_subject')?.value || '').trim().toUpperCase();
  const grade = (document.getElementById('new_class_grade')?.value || '').trim();
  
  let prefix = 'CLS';
  if (subject.includes('COMP') || subject.includes('CS') || subject.includes('WEB')) prefix = 'CSC';
  else if (subject.includes('ART') || subject.includes('GRAPH') || subject.includes('DESIGN')) prefix = 'ART';
  else if (subject.includes('MATH')) prefix = 'MTH';
  else if (subject.includes('PHYS') || subject.includes('SCI')) prefix = 'SCI';
  else if (subject.includes('ENG')) prefix = 'ENG';
  else if (subject.includes('BUS') || subject.includes('ECON')) prefix = 'BUS';

  let num = '10A';
  if (grade.includes('9')) num = '9A';
  else if (grade.includes('10')) num = '10A';
  else if (grade.includes('11')) num = '11A';
  else if (grade.includes('12')) num = '12A';
  else if (grade.includes('ADV')) num = 'ADV';

  const code = \`\${prefix}-\${num}\`;
  const codeInput = document.getElementById('new_class_code');
  if (codeInput) {
    codeInput.value = code;
    updateAddClassPreview();
  }
}

function setPresetClass(code, title, subject, grade, room, schedule) {
  if (document.getElementById('new_class_code')) document.getElementById('new_class_code').value = code;
  if (document.getElementById('new_class_name')) document.getElementById('new_class_name').value = title;
  if (document.getElementById('new_class_subject')) document.getElementById('new_class_subject').value = subject;
  if (document.getElementById('new_class_grade')) document.getElementById('new_class_grade').value = grade;
  if (document.getElementById('new_class_room')) document.getElementById('new_class_room').value = room;
  if (document.getElementById('new_class_schedule')) document.getElementById('new_class_schedule').value = schedule;
  selectClassGradePill(grade);
  updateAddClassPreview();
}

function selectClassGradePill(gradeVal) {
  const sel = document.getElementById('new_class_grade');
  if (sel) sel.value = gradeVal;
  document.querySelectorAll('.class-grade-pill').forEach(btn => {
    if (btn.getAttribute('data-grade') === gradeVal) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  updateAddClassPreview();
}

function setAddClassRoom(room) {
  const el = document.getElementById('new_class_room');
  if (el) {
    el.value = room;
    updateAddClassPreview();
  }
}

function setAddClassSchedule(sched) {
  const el = document.getElementById('new_class_schedule');
  if (el) {
    el.value = sched;
    updateAddClassPreview();
  }
}

function adjustClassCapacity(delta) {
  const el = document.getElementById('new_class_capacity');
  if (el) {
    let val = Number(el.value) || 30;
    val = Math.max(5, Math.min(150, val + delta));
    el.value = val;
    updateAddClassPreview();
  }
}

// Global escape key listener for slide-over drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('addClassDrawer');
    if (drawer && drawer.classList.contains('active')) {
      closeAddClassModal();
    }
  }
});

async function submitAddClass() {
  const codeInput = document.getElementById('new_class_code');
  const nameInput = document.getElementById('new_class_name');
  const subjectInput = document.getElementById('new_class_subject');
  const gradeInput = document.getElementById('new_class_grade');
  const roomInput = document.getElementById('new_class_room');
  const scheduleInput = document.getElementById('new_class_schedule');
  const capacityInput = document.getElementById('new_class_capacity');

  const code = (codeInput?.value || '').trim().toUpperCase();
  const name = (nameInput?.value || '').trim();
  const subject = (subjectInput?.value || '').trim();
  const grade = gradeInput?.value || 'Grade 10';
  const room = (roomInput?.value || '').trim() || 'Room 101';
  const schedule = (scheduleInput?.value || '').trim() || 'Tue, Thu 10:00 AM';
  const capacity = Number(capacityInput?.value) || 30;

  if (!code) {
    if (window.Toaster) window.Toaster.warning('Class Code Required', 'Please enter a unique class code (e.g. CLS-11A).');
    else showToast('Please enter a class code', 'warning');
    if (codeInput) codeInput.focus();
    return;
  }
  if (!name) {
    if (window.Toaster) window.Toaster.warning('Class Title Required', 'Please enter a class title (e.g. Grade 11 - Web Engineering).');
    else showToast('Please enter a class title', 'warning');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!subject) {
    if (window.Toaster) window.Toaster.warning('Subject Required', 'Please specify a subject field for this class.');
    else showToast('Please enter a subject', 'warning');
    if (subjectInput) subjectInput.focus();
    return;
  }

  const submitBtn = document.getElementById('addClassSubmitBtn');
  const origBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Classroom...';
  }

  try {
    const classes = getClassesList();
    const newClass = {
      id: 'cls_' + Date.now(),
      code: code,
      name: name,
      className: name,
      subject: subject,
      grade: grade,
      gradeLevel: grade,
      room: room,
      schedule: schedule,
      capacity: capacity,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      createdAt: Date.now()
    };

    classes.push(newClass);
    saveClassesList(classes);

    // Persist directly to Supabase Cloud
    if (window.SupabaseService && typeof window.SupabaseService.saveClass === 'function') {
      window.SupabaseService.saveClass(ACTIVE_ORG, {
        id: newClass.id,
        code: newClass.code,
        name: newClass.name,
        className: newClass.name,
        subject: newClass.subject,
        gradeLevel: newClass.grade,
        room: newClass.room,
        schedule: newClass.schedule,
        capacity: newClass.capacity,
        status: 'Active',
        academicYear: '2026/2027'
      }).catch(err => console.warn('Supabase saveClass notice:', err));
    }

    // Broadcast change
    if (window.RealtimeBus && typeof window.RealtimeBus.emit === 'function') {
      window.RealtimeBus.emit('class:created', newClass);
    }
    window.dispatchEvent(new CustomEvent('fg:class-updated', { detail: newClass }));

    closeAddClassModal();
    renderClassesSection();

    // Reset form
    if (document.getElementById('addClassForm')) {
      document.getElementById('addClassForm').reset();
    }

    if (window.Toaster) {
      window.Toaster.success('New Classroom Created!', \`\${name} (\${code}) added to active curriculum.\`, 4000);
    } else {
      showToast(\`Classroom \${code} created successfully\`, 'success');
    }
  } catch (err) {
    console.error('Error creating classroom:', err);
    if (window.Toaster) window.Toaster.error('Creation Error', 'Failed to register classroom: ' + (err.message || err));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnText;
    }
  }
}

`;

content = content.substring(0, startIndex) + replacementCode + content.substring(endIndex);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated hr-dashboard.html class functions!');
