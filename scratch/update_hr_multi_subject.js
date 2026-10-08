const fs = require('fs');

let content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// 1. Update the table header
const oldTh = '<th>Subject / Field</th>';
const newTh = '<th>Curriculum Subject(s)</th>';
if (!content.includes(oldTh)) {
  console.error('Could not find old table header:', oldTh);
  process.exit(1);
}
content = content.replace(oldTh, newTh);
console.log('1. Updated table header to Curriculum Subject(s)');

// 2. Replace Row 2 in addClassDrawer with rich Multi-Subject selector
const oldRow2 = `      <!-- Row 2: Subject Field & Grade Level -->
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
      </div>`;

const newRow2 = `      <!-- Row 2: Multi-Subject Registration & Grade Level -->
      <div style="margin-bottom: 14px;">
        <div class="so-form-group" style="margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label class="so-label" style="margin-bottom:0;">Curriculum Subjects (Multi-Subject Supported) *</label>
            <span style="font-size:11px; color:var(--muted); font-weight:600;"><i class="fa-solid fa-layer-group" style="color:var(--primary); margin-right:3px;"></i> Select or register multiple</span>
          </div>

          <!-- Active Selected Subject Pills / Tags Display -->
          <div id="classSelectedSubjectPills" style="min-height:42px; padding:6px 10px; background:var(--surface); border:1px solid var(--border); border-radius:8px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;">
            <span id="noSubjectPlaceholder" style="font-size:12px; color:var(--muted); font-style:italic;">No subjects selected yet &bull; Click below or type to add</span>
          </div>

          <!-- Input to add subject by name / comma -->
          <div style="display:flex; gap:6px;">
            <input id="new_class_subject_input" class="so-input" placeholder="Type subject name (e.g. Mathematics, English) and click Add or press Enter..." style="flex:1;" onkeydown="if(event.key==='Enter'||event.key===','){event.preventDefault(); addCustomClassSubject();}">
            <button type="button" class="btn" onclick="addCustomClassSubject()" style="padding:0 14px; font-size:12px; white-space:nowrap; background:var(--primary); color:#fff; border:none; border-radius:8px; font-weight:700;">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
          <!-- Hidden synced input for backward compatibility and forms -->
          <input type="hidden" id="new_class_subject" value="Computer Science">
        </div>

        <!-- Dynamic Quick-Pick Curriculum Subject Chips -->
        <div style="margin-top:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Curriculum Subject Quick-Select:</span>
            <button type="button" onclick="selectAllCoreCurriculumSubjects()" style="background:none; border:none; color:var(--primary); font-size:11px; font-weight:700; cursor:pointer; padding:0;">+ Add All Core</button>
          </div>
          <div id="classCurriculumSubjectChips" style="display:flex; flex-wrap:wrap; gap:6px; max-height:100px; overflow-y:auto; padding-bottom:2px;">
            <!-- Dynamically populated from getSubjectsList() on drawer open -->
          </div>
        </div>
      </div>

      <!-- Grade Level Selector -->
      <div class="so-form-group" style="margin-bottom: 14px;">
        <label class="so-label">Grade Level *</label>
        <select id="new_class_grade" class="so-select" required onchange="updateAddClassPreview()">
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 10" selected>Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
          <option value="Advanced Lab">Advanced Lab</option>
          <option value="Tertiary & Vocational">Tertiary &amp; Vocational</option>
        </select>
      </div>`;

if (!content.includes(oldRow2)) {
  console.error('Could not find oldRow2 in addClassDrawer!');
  process.exit(1);
}
content = content.replace(oldRow2, newRow2);
console.log('2. Replaced addClassDrawer Row 2 with multi-subject UI');

// 3. Update search filter & class row rendering in renderClassesSection
const oldClassFilter = `  const filtered = classes.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search) || (c.code && c.code.toLowerCase().includes(search)) || (c.subject && c.subject.toLowerCase().includes(search)) || (c.teacherName && c.teacherName.toLowerCase().includes(search));
    const matchGrade = !gradeFilter || c.grade === gradeFilter;
    const matchTeacher = !teacherFilter || c.teacherName === teacherFilter;
    return matchSearch && matchGrade && matchTeacher;
  });`;

const newClassFilter = `  const filtered = classes.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search) ||
      (c.code && c.code.toLowerCase().includes(search)) ||
      (Array.isArray(c.subjects) && c.subjects.some(s => s.toLowerCase().includes(search))) ||
      (c.subject && c.subject.toLowerCase().includes(search)) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(search));
    const matchGrade = !gradeFilter || c.grade === gradeFilter;
    const matchTeacher = !teacherFilter || c.teacherName === teacherFilter;
    return matchSearch && matchGrade && matchTeacher;
  });`;

if (!content.includes(oldClassFilter)) {
  console.error('Could not find oldClassFilter!');
  process.exit(1);
}
content = content.replace(oldClassFilter, newClassFilter);
console.log('3. Updated class search filter for multiple subjects');

// 4. Update row rendering in renderClassesSection
const oldSubjectTd = `      <td><strong>\${escapeHtml(c.subject || 'General')}</strong></td>`;
const newSubjectTd = `      <td>
        \${(() => {
          const classSubjects = (Array.isArray(c.subjects) && c.subjects.length > 0)
            ? c.subjects
            : (c.subject ? String(c.subject).split(',').map(s => s.trim()).filter(Boolean) : ['General']);
          return \`
            <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:240px;">
              \${classSubjects.map(sub => \`
                <span class="badge-pill badge-purple" style="font-size:11px; padding:3px 8px; font-weight:600; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 2px rgba(99,91,252,0.08);">
                  <i class="fa-solid fa-book-bookmark" style="font-size:9.5px; opacity:0.8;"></i> \${escapeHtml(sub)}
                </span>
              \`).join('')}
            </div>
          \`;
        })()}
      </td>`;

if (!content.includes(oldSubjectTd)) {
  console.error('Could not find oldSubjectTd in renderClassesSection!');
  process.exit(1);
}
content = content.replace(oldSubjectTd, newSubjectTd);
console.log('4. Updated class row to render multi-subject badge pills');

// 5. Update openAddClassModal and add multi-subject management functions
const oldOpenAddClass = `function openAddClassModal() {
  const drawer = document.getElementById('addClassDrawer');
  const backdrop = document.getElementById('addClassDrawerBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.classList.add('slide-over-open');
  if (window.SlideOver && typeof window.SlideOver.open === 'function') {
    window.SlideOver.open('addClassDrawer');
  }
  updateAddClassPreview();
}`;

const newOpenAddClass = `let _currentClassSubjects = ['Computer Science'];

function renderClassSubjectPills() {
  const container = document.getElementById('classSelectedSubjectPills');
  const hiddenInput = document.getElementById('new_class_subject');
  if (!container) return;

  if (_currentClassSubjects.length === 0) {
    container.innerHTML = '<span id="noSubjectPlaceholder" style="font-size:12px; color:var(--muted); font-style:italic;">No subjects selected yet &bull; Click below or type to add</span>';
    if (hiddenInput) hiddenInput.value = '';
  } else {
    container.innerHTML = _currentClassSubjects.map((sub, idx) => \`
      <span class="badge-pill badge-purple" style="font-size:11.5px; padding:3px 10px; display:inline-flex; align-items:center; gap:6px; font-weight:700; background:rgba(99,91,252,0.12); color:var(--primary); border:1px solid rgba(99,91,252,0.25); border-radius:14px;">
        <i class="fa-solid fa-book-bookmark" style="font-size:10px;"></i>
        <span>\${escapeHtml(sub)}</span>
        <button type="button" onclick="removeClassSubject(\${idx})" style="background:none; border:none; color:var(--muted); cursor:pointer; padding:0; margin-left:2px; font-size:12px; line-height:1;" title="Remove \${escapeHtml(sub)}">&times;</button>
      </span>
    \`).join('');
    if (hiddenInput) hiddenInput.value = _currentClassSubjects.join(', ');
  }

  // Update chip active states
  document.querySelectorAll('.class-subject-pick-chip').forEach(chip => {
    const chipSub = chip.getAttribute('data-subject');
    if (_currentClassSubjects.some(s => s.toLowerCase() === (chipSub || '').toLowerCase())) {
      chip.classList.add('active');
      chip.style.background = 'var(--primary)';
      chip.style.color = '#fff';
      chip.style.borderColor = 'var(--primary)';
    } else {
      chip.classList.remove('active');
      chip.style.background = 'var(--surface)';
      chip.style.color = 'var(--text)';
      chip.style.borderColor = 'var(--border)';
    }
  });

  updateAddClassPreview();
}

function addCustomClassSubject() {
  const input = document.getElementById('new_class_subject_input');
  if (!input) return;
  const raw = (input.value || '').trim();
  if (!raw) return;

  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  parts.forEach(part => {
    if (!_currentClassSubjects.some(s => s.toLowerCase() === part.toLowerCase())) {
      _currentClassSubjects.push(part);
    }
  });

  input.value = '';
  renderClassSubjectPills();
}

function toggleClassSubject(subjectName) {
  const clean = (subjectName || '').trim();
  if (!clean) return;
  const idx = _currentClassSubjects.findIndex(s => s.toLowerCase() === clean.toLowerCase());
  if (idx >= 0) {
    _currentClassSubjects.splice(idx, 1);
  } else {
    _currentClassSubjects.push(clean);
  }
  renderClassSubjectPills();
}

function removeClassSubject(idx) {
  if (idx >= 0 && idx < _currentClassSubjects.length) {
    _currentClassSubjects.splice(idx, 1);
    renderClassSubjectPills();
  }
}

function selectAllCoreCurriculumSubjects() {
  const subjects = typeof getSubjectsList === 'function' ? getSubjectsList() : [];
  const defaultCores = ['Mathematics', 'English Language', 'Integrated Science', 'Computer Science'];
  const pool = subjects.length > 0 ? subjects.map(s => s.name) : defaultCores;
  pool.forEach(sub => {
    if (!_currentClassSubjects.some(s => s.toLowerCase() === sub.toLowerCase())) {
      _currentClassSubjects.push(sub);
    }
  });
  renderClassSubjectPills();
}

function populateAddClassSubjectChips() {
  const container = document.getElementById('classCurriculumSubjectChips');
  if (!container) return;

  const catalog = typeof getSubjectsList === 'function' ? getSubjectsList() : [];
  const defaultSubs = [
    'Computer Science', 'Mathematics', 'English Language', 
    'Integrated Science', 'Physics', 'Visual Arts', 'Graphic Design'
  ];

  const allSubs = Array.from(new Set([
    ...catalog.map(s => s.name),
    ...defaultSubs
  ])).filter(Boolean);

  container.innerHTML = allSubs.map(s => {
    const isSel = _currentClassSubjects.some(item => item.toLowerCase() === s.toLowerCase());
    return \`
      <button type="button" class="preset-chip class-subject-pick-chip \${isSel ? 'active' : ''}" data-subject="\${escapeHtml(s)}" onclick="toggleClassSubject(this.getAttribute('data-subject'))" style="font-size:11px; padding:3px 9px; border-radius:6px; cursor:pointer;">
        + \${escapeHtml(s)}
      </button>
    \`;
  }).join('');
}

function openAddClassModal() {
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

if (!content.includes(oldOpenAddClass)) {
  console.error('Could not find oldOpenAddClass!');
  process.exit(1);
}
content = content.replace(oldOpenAddClass, newOpenAddClass);
console.log('5. Added multi-subject management functions and updated openAddClassModal');

// 6. Update updateAddClassPreview
const oldPreviewSubjectLogic = `  const subject = (document.getElementById('new_class_subject')?.value || 'Computer Science').trim();`;
const newPreviewSubjectLogic = `  const subCount = _currentClassSubjects.length;
  const subject = subCount === 0 
    ? (document.getElementById('new_class_subject')?.value || 'None')
    : (subCount === 1 ? _currentClassSubjects[0] : \`\${subCount} Subjects (\${_currentClassSubjects.slice(0, 2).join(', ')}\${subCount > 2 ? '...' : ''})\`);`;

if (!content.includes(oldPreviewSubjectLogic)) {
  console.error('Could not find oldPreviewSubjectLogic!');
  process.exit(1);
}
content = content.replace(oldPreviewSubjectLogic, newPreviewSubjectLogic);
console.log('6. Updated preview card to show multi-subject count and names');

// 7. Update setPresetClass to populate _currentClassSubjects
const oldPresetLogic = `  if (document.getElementById('new_class_subject')) document.getElementById('new_class_subject').value = subject;`;
const newPresetLogic = `  if (document.getElementById('new_class_subject')) document.getElementById('new_class_subject').value = subject;
  _currentClassSubjects = subject.split(',').map(s => s.trim()).filter(Boolean);
  renderClassSubjectPills();`;

if (!content.includes(oldPresetLogic)) {
  console.error('Could not find oldPresetLogic!');
  process.exit(1);
}
content = content.replace(oldPresetLogic, newPresetLogic);
console.log('7. Updated setPresetClass to sync subject pills');

// 8. Update submitAddClass to collect subjects array and persist multi-subject
const oldSubmitSubjectCheck = `  const code = (codeInput?.value || '').trim().toUpperCase();
  const name = (nameInput?.value || '').trim();
  const subject = (subjectInput?.value || '').trim();`;

const newSubmitSubjectCheck = `  const code = (codeInput?.value || '').trim().toUpperCase();
  const name = (nameInput?.value || '').trim();
  const subjectsArray = _currentClassSubjects.slice();
  if (subjectsArray.length === 0 && subjectInput?.value) {
    subjectInput.value.split(',').map(s => s.trim()).filter(Boolean).forEach(s => subjectsArray.push(s));
  }
  const subject = subjectsArray.join(', ');`;

if (!content.includes(oldSubmitSubjectCheck)) {
  console.error('Could not find oldSubmitSubjectCheck!');
  process.exit(1);
}
content = content.replace(oldSubmitSubjectCheck, newSubmitSubjectCheck);

const oldSubjectValidation = `  if (!subject) {
    if (window.Toaster) window.Toaster.warning('Subject Required', 'Please specify a subject field for this class.');
    else showToast('Please enter a subject', 'warning');
    if (subjectInput) subjectInput.focus();
    return;
  }`;

const newSubjectValidation = `  if (!subject || subjectsArray.length === 0) {
    if (window.Toaster) window.Toaster.warning('Subjects Required', 'Please register at least one curriculum subject for this class.');
    else showToast('Please select or register at least one subject', 'warning');
    const subInput = document.getElementById('new_class_subject_input');
    if (subInput) subInput.focus();
    return;
  }`;

if (!content.includes(oldSubjectValidation)) {
  console.error('Could not find oldSubjectValidation!');
  process.exit(1);
}
content = content.replace(oldSubjectValidation, newSubjectValidation);

const oldNewClassObj = `      className: name,
      subject: subject,
      grade: grade,`;

const newNewClassObj = `      className: name,
      subject: subject,
      subjects: subjectsArray,
      grade: grade,`;

if (!content.includes(oldNewClassObj)) {
  console.error('Could not find oldNewClassObj!');
  process.exit(1);
}
content = content.replace(oldNewClassObj, newNewClassObj);

const oldSupabaseSaveClass = `          className: newClass.name,
          subject: newClass.subject,
          gradeLevel: newClass.grade,`;

const newSupabaseSaveClass = `          className: newClass.name,
          subject: newClass.subject,
          subjects: newClass.subjects,
          gradeLevel: newClass.grade,`;

if (!content.includes(oldSupabaseSaveClass)) {
  console.error('Could not find oldSupabaseSaveClass!');
  process.exit(1);
}
content = content.replace(oldSupabaseSaveClass, newSupabaseSaveClass);
console.log('8. Updated submitAddClass to persist multi-subject to local and Supabase Cloud');

// 9. Update renderSubjectsTab to check multi-subject allocation
const oldAllocatedSub = `  const allocatedSubjects = subjects.filter(s => classes.some(c => (c.subject || '').toLowerCase() === s.name.toLowerCase()));`;
const newAllocatedSub = `  const isSubjectInClass = (cl, subName) => {
    const target = (subName || '').toLowerCase().trim();
    if (Array.isArray(cl.subjects)) {
      if (cl.subjects.some(s => String(s).toLowerCase().trim() === target)) return true;
    }
    if (cl.subject) {
      const parts = String(cl.subject).split(',').map(s => s.trim().toLowerCase());
      if (parts.includes(target) || cl.subject.toLowerCase().trim() === target) return true;
    }
    return false;
  };
  const allocatedSubjects = subjects.filter(s => classes.some(c => isSubjectInClass(c, s.name)));`;

if (!content.includes(oldAllocatedSub)) {
  console.error('Could not find oldAllocatedSub!');
  process.exit(1);
}
content = content.replace(oldAllocatedSub, newAllocatedSub);

const oldLinkedClasses = `    const linkedClasses = classes.filter(c => (c.subject || '').toLowerCase() === s.name.toLowerCase());`;
const newLinkedClasses = `    const linkedClasses = classes.filter(c => isSubjectInClass(c, s.name));`;

if (!content.includes(oldLinkedClasses)) {
  console.error('Could not find oldLinkedClasses!');
  process.exit(1);
}
content = content.replace(oldLinkedClasses, newLinkedClasses);
console.log('9. Updated renderSubjectsTab to accurately map multi-subject allocations');

fs.writeFileSync('pages/hr/hr-dashboard.html', content, 'utf8');
console.log('SUCCESS! pages/hr/hr-dashboard.html updated with multi-subject registration and display!');
