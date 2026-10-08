const fs = require('fs');

let content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// 1. Take out the right-floating-nav-bar
const oldFloatingNav = `<!-- RIGHT FLOATING QUICK NAVIGATION BAR -->
<div class="right-floating-nav-bar" id="rightFloatingNavBar" aria-label="Quick Actions Navigation">
  <button type="button" class="rf-nav-item rf-add-class" id="rfAddClassBtn" onclick="openAddClassModal()" title="Add Academic Classroom" aria-label="Add Academic Classroom">
    <span class="rf-nav-label">Add Classroom</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-folder-plus"></i></span>
    <span class="rf-nav-pulse"></span>
  </button>
  <button type="button" class="rf-nav-item rf-add-subject" id="rfAddSubjectBtn" onclick="openAddSubjectModal()" title="Add Curriculum Subject" aria-label="Add Subject">
    <span class="rf-nav-label">Add Subject</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-book-bookmark"></i></span>
  </button>
  <button type="button" class="rf-nav-item rf-assign-teacher" id="rfAssignTeacherBtn" onclick="openAssignModal()" title="Assign Teacher to Class" aria-label="Assign Teacher">
    <span class="rf-nav-label">Assign Teacher</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-chalkboard-user"></i></span>
  </button>
  <button type="button" class="rf-nav-item rf-enroll-student" id="rfEnrollStudentBtn" onclick="openRegisterStudentModal()" title="Enroll New Student" aria-label="Enroll Student">
    <span class="rf-nav-label">Enroll Student</span>
    <span class="rf-nav-icon"><i class="fa-solid fa-user-plus"></i></span>
  </button>
</div>`;

if (!content.includes(oldFloatingNav)) {
  console.error('Could not find oldFloatingNav in hr-dashboard.html!');
  process.exit(1);
}
content = content.replace(oldFloatingNav, '<!-- RIGHT FLOATING QUICK NAVIGATION BAR REMOVED PER USER REQUEST -->');
console.log('1. Took out rightFloatingNavBar');

// Also update CSS to keep it hidden
content = content.replace(
  '.right-floating-nav-bar {\n      position: fixed;',
  '.right-floating-nav-bar {\n      display: none !important;\n      position: fixed;'
);

// Update empty state text
content = content.replace(
  'Click below or use the right floating navigation bar to add a classroom.',
  'Click below to add your first academic classroom.'
);
console.log('2. Updated CSS and empty state text');

// 3. Fix submitAddSubject so newly added subject ADDS to class instead of replacing
const oldAddSubjectAllocation = `    // 3. Handle immediate Class & Teacher allocation if selected
    if (assignClassId) {
      const classes = getClassesList();
      const targetClassIdx = classes.findIndex(c => String(c.id) === String(assignClassId));
      if (targetClassIdx !== -1) {
        classes[targetClassIdx].subject = name;
        classes[targetClassIdx].subjectCode = code;

        let allocatedTeacherName = '';
        if (assignTeacherEmail) {
          const selectedTeacherOpt = assignTeacherInput.options[assignTeacherInput.selectedIndex];
          allocatedTeacherName = selectedTeacherOpt ? (selectedTeacherOpt.dataset.name || selectedTeacherOpt.text.split('(')[0].trim()) : '';
          classes[targetClassIdx].teacherEmail = assignTeacherEmail;
          classes[targetClassIdx].teacherName = allocatedTeacherName;
          classes[targetClassIdx].status = 'Active';
          classes[targetClassIdx].approvalStatus = 'approved';
        }

        saveClassesList(classes);

        // Sync updated class to cloud
        if (window.SupabaseService && typeof window.SupabaseService.saveClass === 'function') {
          try {
            await window.SupabaseService.saveClass(registeringHrOrg, {
              id: !isNaN(Number(classes[targetClassIdx].id)) ? Number(classes[targetClassIdx].id) : undefined,
              name: classes[targetClassIdx].name,
              className: classes[targetClassIdx].name,
              code: classes[targetClassIdx].code,
              grade: classes[targetClassIdx].grade,
              gradeLevel: classes[targetClassIdx].grade,
              subject: name,
              room: classes[targetClassIdx].room || 'Room 101',
              schedule: classes[targetClassIdx].schedule || 'Tue, Thu 10:00 AM',
              teacherId: assignTeacherEmail || null,
              teacherName: allocatedTeacherName || null,
              status: 'Active'
            });
          } catch(e) {}
        }`;

const newAddSubjectAllocation = `    // 3. Handle immediate Class & Teacher allocation if selected - ADD TO EXISTING, NEVER REPLACE!
    if (assignClassId) {
      const classes = getClassesList();
      const targetClassIdx = classes.findIndex(c => String(c.id) === String(assignClassId));
      if (targetClassIdx !== -1) {
        // Collect existing subjects of this class
        let currentSubs = [];
        if (Array.isArray(classes[targetClassIdx].subjects) && classes[targetClassIdx].subjects.length > 0) {
          currentSubs = [...classes[targetClassIdx].subjects];
        } else if (classes[targetClassIdx].subject) {
          currentSubs = String(classes[targetClassIdx].subject).split(',').map(s => s.trim()).filter(Boolean);
        }
        // ADD NEW SUBJECT TO THE OLD ONES (NO OVERWRITE!)
        if (!currentSubs.some(s => s.toLowerCase() === name.toLowerCase())) {
          currentSubs.push(name);
        }
        classes[targetClassIdx].subjects = currentSubs;
        classes[targetClassIdx].subject = currentSubs.join(', ');
        classes[targetClassIdx].subjectCode = code;

        let allocatedTeacherName = '';
        if (assignTeacherEmail) {
          const selectedTeacherOpt = assignTeacherInput.options[assignTeacherInput.selectedIndex];
          allocatedTeacherName = selectedTeacherOpt ? (selectedTeacherOpt.dataset.name || selectedTeacherOpt.text.split('(')[0].trim()) : '';
          classes[targetClassIdx].teacherEmail = assignTeacherEmail;
          classes[targetClassIdx].teacherName = allocatedTeacherName;
          classes[targetClassIdx].status = 'Active';
          classes[targetClassIdx].approvalStatus = 'approved';
        }

        saveClassesList(classes);

        // Sync updated class to cloud with multi-subjects preserved
        if (window.SupabaseService && typeof window.SupabaseService.saveClass === 'function') {
          try {
            await window.SupabaseService.saveClass(registeringHrOrg, {
              id: !isNaN(Number(classes[targetClassIdx].id)) ? Number(classes[targetClassIdx].id) : undefined,
              name: classes[targetClassIdx].name,
              className: classes[targetClassIdx].name,
              code: classes[targetClassIdx].code,
              grade: classes[targetClassIdx].grade,
              gradeLevel: classes[targetClassIdx].grade,
              subject: classes[targetClassIdx].subject,
              subjects: classes[targetClassIdx].subjects,
              room: classes[targetClassIdx].room || 'Room 101',
              schedule: classes[targetClassIdx].schedule || 'Tue, Thu 10:00 AM',
              teacherId: assignTeacherEmail || classes[targetClassIdx].teacherEmail || null,
              teacherName: allocatedTeacherName || classes[targetClassIdx].teacherName || null,
              status: 'Active'
            });
          } catch(e) {}
        }`;

if (!content.includes(oldAddSubjectAllocation)) {
  console.error('Could not find oldAddSubjectAllocation in submitAddSubject!');
  process.exit(1);
}
content = content.replace(oldAddSubjectAllocation, newAddSubjectAllocation);
console.log('3. Fixed submitAddSubject to append subjects instead of replacing');

// 4. Fix submitTeacherAssignment so selecting a subject ADDS to the class instead of replacing
const oldAssignTeacherSubject = `    const subjectSelect = document.getElementById('assign_subject_select');
    const subjectVal = subjectSelect ? subjectSelect.value.trim() : '';

    if (subjectVal) {
      classes[idx].subject = subjectVal;
    }`;

const newAssignTeacherSubject = `    const subjectSelect = document.getElementById('assign_subject_select');
    const subjectVal = subjectSelect ? subjectSelect.value.trim() : '';

    if (subjectVal) {
      let currentSubs = [];
      if (Array.isArray(classes[idx].subjects) && classes[idx].subjects.length > 0) {
        currentSubs = [...classes[idx].subjects];
      } else if (classes[idx].subject) {
        currentSubs = String(classes[idx].subject).split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!currentSubs.some(s => s.toLowerCase() === subjectVal.toLowerCase())) {
        currentSubs.push(subjectVal);
      }
      classes[idx].subjects = currentSubs;
      classes[idx].subject = currentSubs.join(', ');
    }`;

if (!content.includes(oldAssignTeacherSubject)) {
  console.error('Could not find oldAssignTeacherSubject!');
  process.exit(1);
}
content = content.replace(oldAssignTeacherSubject, newAssignTeacherSubject);

// Also update Supabase sync in submitTeacherAssignment to pass subjects array
content = content.replace(
  `          gradeLevel: classes[idx].grade,\n          subject: subjectVal || classes[idx].subject || 'General',`,
  `          gradeLevel: classes[idx].grade,\n          subject: classes[idx].subject || 'General',\n          subjects: classes[idx].subjects || [],`
);
console.log('4. Fixed submitTeacherAssignment to append subjects instead of replacing');

// 5. Update submitAddClass to merge subjects if classroom already exists
const oldSubmitAddClassMerge = `    const classes = getClassesList();
    const tempId = 'cls_' + Date.now();
    const newClass = {
      id: tempId,
      code: code,
      name: name,
      className: name,
      subject: subject,
      subjects: subjectsArray,
      grade: grade,
      gradeLevel: grade,
      room: room,
      schedule: schedule,
      capacity: capacity,
      enrolled: 0,
      teacherName: '',
      teacherEmail: '',
      status: 'Unassigned',
      org: registeringHrOrg,
      org_id: registeringHrOrg,
      org_name: registeringHrOrg,
      createdAt: Date.now()
    };

    // Persist directly to Supabase Cloud
    if (window.SupabaseService && typeof window.SupabaseService.saveClass === 'function') {
      try {
        const cloudSaved = await window.SupabaseService.saveClass(registeringHrOrg, {
          code: newClass.code,
          name: newClass.name,
          className: newClass.name,
          subject: newClass.subject,
          subjects: newClass.subjects,
          gradeLevel: newClass.grade,
          room: newClass.room,
          schedule: newClass.schedule,
          capacity: newClass.capacity,
          status: 'Active',
          academicYear: '2026/2027'
        });
        if (cloudSaved && cloudSaved.id) {
          newClass.id = cloudSaved.id;
        }
      } catch (err) {
        console.warn('Supabase saveClass notice:', err);
      }
    }

    classes.push(newClass);
    saveClassesList(classes);`;

const newSubmitAddClassMerge = `    const classes = getClassesList();
    const editingId = document.getElementById('addClassForm')?.dataset?.editingId || null;
    
    // Check if this class already exists (by ID, code, or title)
    const existingIdx = classes.findIndex(c => 
      (editingId && String(c.id) === String(editingId)) ||
      (code && c.code && c.code.trim().toUpperCase() === code.trim().toUpperCase()) ||
      (name && c.name && c.name.trim().toLowerCase() === name.trim().toLowerCase())
    );

    let targetClass;
    if (existingIdx !== -1) {
      // CLASS ALREADY EXISTS: MERGE & ADD TO EXISTING SUBJECTS!
      let currentSubs = [];
      if (Array.isArray(classes[existingIdx].subjects) && classes[existingIdx].subjects.length > 0) {
        currentSubs = [...classes[existingIdx].subjects];
      } else if (classes[existingIdx].subject) {
        currentSubs = String(classes[existingIdx].subject).split(',').map(s => s.trim()).filter(Boolean);
      }
      subjectsArray.forEach(sub => {
        if (!currentSubs.some(s => s.toLowerCase() === sub.toLowerCase())) {
          currentSubs.push(sub);
        }
      });
      classes[existingIdx].subjects = currentSubs;
      classes[existingIdx].subject = currentSubs.join(', ');
      classes[existingIdx].code = code;
      classes[existingIdx].name = name;
      classes[existingIdx].className = name;
      classes[existingIdx].grade = grade;
      classes[existingIdx].gradeLevel = grade;
      if (room) classes[existingIdx].room = room;
      if (schedule) classes[existingIdx].schedule = schedule;
      if (capacity) classes[existingIdx].capacity = capacity;
      targetClass = classes[existingIdx];
    } else {
      // BRAND NEW CLASS
      targetClass = {
        id: 'cls_' + Date.now(),
        code: code,
        name: name,
        className: name,
        subject: subjectsArray.join(', '),
        subjects: subjectsArray,
        grade: grade,
        gradeLevel: grade,
        room: room,
        schedule: schedule,
        capacity: capacity,
        enrolled: 0,
        teacherName: '',
        teacherEmail: '',
        status: 'Unassigned',
        org: registeringHrOrg,
        org_id: registeringHrOrg,
        org_name: registeringHrOrg,
        createdAt: Date.now()
      };
      classes.push(targetClass);
    }

    // Persist directly to Supabase Cloud
    if (window.SupabaseService && typeof window.SupabaseService.saveClass === 'function') {
      try {
        const cloudSaved = await window.SupabaseService.saveClass(registeringHrOrg, {
          id: !isNaN(Number(targetClass.id)) ? Number(targetClass.id) : undefined,
          code: targetClass.code,
          name: targetClass.name,
          className: targetClass.name,
          subject: targetClass.subject,
          subjects: targetClass.subjects,
          gradeLevel: targetClass.grade,
          room: targetClass.room,
          schedule: targetClass.schedule,
          capacity: targetClass.capacity,
          status: 'Active',
          academicYear: '2026/2027'
        });
        if (cloudSaved && cloudSaved.id) {
          targetClass.id = cloudSaved.id;
        }
      } catch (err) {
        console.warn('Supabase saveClass notice:', err);
      }
    }

    saveClassesList(classes);`;

if (!content.includes(oldSubmitAddClassMerge)) {
  console.error('Could not find oldSubmitAddClassMerge!');
  process.exit(1);
}
content = content.replace(oldSubmitAddClassMerge, newSubmitAddClassMerge);
console.log('5. Updated submitAddClass to merge subjects if class already exists');

// 6. Enhance openAddClassModal(classId = null) to allow loading existing class subjects
const oldOpenModalDef = `function openAddClassModal() {
  const drawer = document.getElementById('addClassDrawer');
  const backdrop = document.getElementById('addClassDrawerBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.classList.add('slide-over-open');
  if (window.SlideOver && typeof window.SlideOver.open === 'function') {
    window.SlideOver.open('addClassDrawer');
  }
  populateAddClassSubjectChips();
  renderClassSubjectPills();
  updateAddClassPreview();
}`;

const newOpenModalDef = `function openAddClassModal(classId = null) {
  const drawer = document.getElementById('addClassDrawer');
  const backdrop = document.getElementById('addClassDrawerBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.classList.add('slide-over-open');
  if (window.SlideOver && typeof window.SlideOver.open === 'function') {
    window.SlideOver.open('addClassDrawer');
  }

  const form = document.getElementById('addClassForm');
  if (classId) {
    const classes = getClassesList();
    const c = classes.find(item => String(item.id) === String(classId));
    if (c) {
      if (form) form.dataset.editingId = c.id;
      if (document.getElementById('new_class_code')) document.getElementById('new_class_code').value = c.code || '';
      if (document.getElementById('new_class_name')) document.getElementById('new_class_name').value = c.name || '';
      if (document.getElementById('new_class_room')) document.getElementById('new_class_room').value = c.room || 'Room 101';
      if (document.getElementById('new_class_schedule')) document.getElementById('new_class_schedule').value = c.schedule || 'Tue, Thu 10am';
      if (document.getElementById('new_class_capacity')) document.getElementById('new_class_capacity').value = c.capacity || 30;
      if (document.getElementById('new_class_grade')) document.getElementById('new_class_grade').value = c.grade || 'Grade 10';
      selectClassGradePill(c.grade || 'Grade 10');

      if (Array.isArray(c.subjects) && c.subjects.length > 0) {
        _currentClassSubjects = [...c.subjects];
      } else if (c.subject) {
        _currentClassSubjects = String(c.subject).split(',').map(s => s.trim()).filter(Boolean);
      } else {
        _currentClassSubjects = [];
      }

      const titleEl = document.getElementById('addClassDrawerTitle');
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-layer-group" style="color:var(--primary); margin-right:6px;"></i> Manage Class: ' + escapeHtml(c.name);
      const submitBtn = document.getElementById('addClassSubmitBtn');
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Classroom Subjects';
    }
  } else {
    if (form) delete form.dataset.editingId;
    _currentClassSubjects = ['Computer Science'];
    const titleEl = document.getElementById('addClassDrawerTitle');
    if (titleEl) titleEl.textContent = 'Add Academic Classroom';
    const submitBtn = document.getElementById('addClassSubmitBtn');
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Classroom';
  }

  populateAddClassSubjectChips();
  renderClassSubjectPills();
  updateAddClassPreview();
}`;

if (!content.includes(oldOpenModalDef)) {
  console.error('Could not find oldOpenModalDef!');
  process.exit(1);
}
content = content.replace(oldOpenModalDef, newOpenModalDef);
console.log('6. Enhanced openAddClassModal with classId parameter for managing existing subjects');

// 7. Add Manage Classroom button in table rows so user can manage/add subjects directly
const oldRowActions = `<button class="btn ghost" style="padding:6px 10px;font-size:11px;" title="Reassign / Change Teacher" onclick="openAssignModal('\${c.id}')">
              <i class="fa-solid fa-pencil"></i>
            </button>`;

const newRowActions = `<button class="btn ghost" style="padding:6px 10px;font-size:11px;color:var(--primary);" title="Manage Classroom & Add Subjects" onclick="openAddClassModal('\${c.id}')">
              <i class="fa-solid fa-layer-group"></i>
            </button>
            <button class="btn ghost" style="padding:6px 10px;font-size:11px;" title="Reassign / Change Teacher" onclick="openAssignModal('\${c.id}')">
              <i class="fa-solid fa-chalkboard-user"></i>
            </button>`;

if (!content.includes(oldRowActions)) {
  console.error('Could not find oldRowActions!');
  process.exit(1);
}
content = content.replace(oldRowActions, newRowActions);
console.log('7. Added Manage Classroom button on class rows');

fs.writeFileSync('pages/hr/hr-dashboard.html', content, 'utf8');
console.log('SUCCESS: pages/hr/hr-dashboard.html successfully updated!');
