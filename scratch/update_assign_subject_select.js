const fs = require('fs');

let content = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');

// 1. Add populateAssignSubjectSelect function and update handleAssignClassChange
const oldAssignClassChange = `function handleAssignClassChange() {
  const classSelect = document.getElementById('assign_class_select');
  if (!classSelect) return;
  const classes = getClassesList();
  const selClass = classes.find(c => String(c.id) === String(classSelect.value));
  if (selClass) {
    document.getElementById('assign_room').value = selClass.room || 'Studio Suite 3B';
    document.getElementById('assign_schedule').value = selClass.schedule || 'Mon, Wed, Fri 09:00 AM';
    if (selClass.teacherEmail) {
      const tSelect = document.getElementById('assign_teacher_select');
      if (tSelect) tSelect.value = selClass.teacherEmail;
    }
    if (selClass.subject) {
      const sSelect = document.getElementById('assign_subject_select');
      if (sSelect) {
        let matched = false;
        for (let i = 0; i < sSelect.options.length; i++) {
          if (sSelect.options[i].value.toLowerCase() === selClass.subject.toLowerCase()) {
            sSelect.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched && selClass.subject) {
          const opt = new Option(\`\${selClass.subject} (Current)\`, selClass.subject, true, true);
          sSelect.add(opt, 1);
        }
      }
    }
  }
  updateAssignmentClassPreview();
  updateAssignmentTeacherPreview();
  handleAssignSubjectChange();
}`;

const newAssignClassChange = `function populateAssignSubjectSelect(targetClass, preselectedSubject = null) {
  const subjectSelect = document.getElementById('assign_subject_select');
  if (!subjectSelect) return;

  const catalogSubjects = typeof getSubjectsList === 'function' ? getSubjectsList() : [];
  
  // Extract individual subjects registered under this classroom
  let classSubs = [];
  if (targetClass) {
    if (Array.isArray(targetClass.subjects) && targetClass.subjects.length > 0) {
      classSubs = targetClass.subjects;
    } else if (targetClass.subject) {
      classSubs = String(targetClass.subject).split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  let html = '<option value="">-- Select Subject to Assign --</option>';

  if (classSubs.length > 0) {
    html += \`<optgroup label="Subjects Registered for \${escapeHtml(targetClass.name || 'this Class')}">\`;
    classSubs.forEach(sub => {
      const isSel = preselectedSubject ? (sub.toLowerCase() === preselectedSubject.toLowerCase()) : false;
      html += \`<option value="\${escapeHtml(sub)}" \${isSel ? 'selected' : ''}>\${escapeHtml(sub)}</option>\`;
    });
    html += '</optgroup>';
  }

  // Additional curriculum subjects from catalog
  const otherSubs = catalogSubjects.filter(s => !classSubs.some(cs => cs.toLowerCase() === s.name.toLowerCase()));
  if (otherSubs.length > 0) {
    html += '<optgroup label="Curriculum Syllabus Catalog">';
    otherSubs.forEach(s => {
      const isSel = preselectedSubject && s.name.toLowerCase() === preselectedSubject.toLowerCase();
      html += \`<option value="\${escapeHtml(s.name)}" data-code="\${escapeHtml(s.code)}" data-dept="\${escapeHtml(s.department || 'General')}" \${isSel ? 'selected' : ''}>
        \${s.code ? s.code + ' — ' : ''}\${escapeHtml(s.name)} (\${escapeHtml(s.department || 'General')})
      </option>\`;
    });
    html += '</optgroup>';
  }

  if (classSubs.length === 0 && otherSubs.length === 0) {
    html = '<option value="">No subjects registered yet — Click \\'+ New Subject\\'</option>';
  }

  subjectSelect.innerHTML = html;

  if (preselectedSubject) {
    subjectSelect.value = preselectedSubject;
  } else if (classSubs.length > 0) {
    subjectSelect.value = classSubs[0];
  }
}

function handleAssignClassChange() {
  const classSelect = document.getElementById('assign_class_select');
  if (!classSelect) return;
  const classes = getClassesList();
  const selClass = classes.find(c => String(c.id) === String(classSelect.value));
  if (selClass) {
    document.getElementById('assign_room').value = selClass.room || 'Studio Suite 3B';
    document.getElementById('assign_schedule').value = selClass.schedule || 'Mon, Wed, Fri 09:00 AM';
    if (selClass.teacherEmail) {
      const tSelect = document.getElementById('assign_teacher_select');
      if (tSelect) tSelect.value = selClass.teacherEmail;
    }
    populateAssignSubjectSelect(selClass);
  }
  updateAssignmentClassPreview();
  updateAssignmentTeacherPreview();
  handleAssignSubjectChange();
}`;

if (!content.includes(oldAssignClassChange)) {
  console.error('Could not find oldAssignClassChange!');
  process.exit(1);
}
content = content.replace(oldAssignClassChange, newAssignClassChange);
console.log('1. Added populateAssignSubjectSelect and updated handleAssignClassChange');

// 2. Update openAssignModal to call populateAssignSubjectSelect
const oldSubjectPopulateInModal = `  if (subjectSelect) {
    if (subjects.length === 0) {
      subjectSelect.innerHTML = \`
        <option value="">No subjects registered yet — Click '+ New Subject'</option>
        \${targetClass && targetClass.subject ? \`<option value="\${escapeHtml(targetClass.subject)}" selected>\${escapeHtml(targetClass.subject)} (Current)</option>\` : ''}
      \`;
    } else {
      let optionsHtml = '<option value="">-- Select Curriculum Subject --</option>';
      optionsHtml += subjects.map(s => {
        const isSelected = (preselectedSubjectName && s.name.toLowerCase() === preselectedSubjectName.toLowerCase()) ||
                           (!preselectedSubjectName && targetClass && targetClass.subject && targetClass.subject.toLowerCase() === s.name.toLowerCase());
        return \`<option value="\${escapeHtml(s.name)}" data-code="\${escapeHtml(s.code)}" data-dept="\${escapeHtml(s.department || 'General')}" \${isSelected ? 'selected' : ''}>
          \${s.code ? s.code + ' — ' : ''}\${escapeHtml(s.name)} (\${escapeHtml(s.department || 'General')})
        </option>\`;
      }).join('');
      if (targetClass && targetClass.subject && !subjects.some(s => s.name.toLowerCase() === targetClass.subject.toLowerCase())) {
        optionsHtml = \`<option value="\${escapeHtml(targetClass.subject)}" selected>\${escapeHtml(targetClass.subject)} (Custom)</option>\` + optionsHtml;
      }
      subjectSelect.innerHTML = optionsHtml;
    }
  }`;

const newSubjectPopulateInModal = `  populateAssignSubjectSelect(targetClass, preselectedSubjectName);`;

if (!content.includes(oldSubjectPopulateInModal)) {
  console.error('Could not find oldSubjectPopulateInModal!');
  process.exit(1);
}
content = content.replace(oldSubjectPopulateInModal, newSubjectPopulateInModal);
console.log('2. Updated openAssignModal to call populateAssignSubjectSelect');

// 3. Update updateAssignmentClassPreview to show all subjects of target class
const oldClassPreviewBox = `  if (gradeEl) gradeEl.textContent = c.grade || c.gradeLevel || 'Form 2';
  if (subjectEl) subjectEl.textContent = c.subject || c.name || 'Core Curriculum';`;

const newClassPreviewBox = `  if (gradeEl) gradeEl.textContent = c.grade || c.gradeLevel || 'Form 2';
  if (subjectEl) {
    const classSubs = (Array.isArray(c.subjects) && c.subjects.length > 0)
      ? c.subjects
      : (c.subject ? String(c.subject).split(',').map(s => s.trim()).filter(Boolean) : []);
    subjectEl.textContent = classSubs.length > 0 ? classSubs.join(' • ') : (c.name || 'Core Curriculum');
  }`;

if (!content.includes(oldClassPreviewBox)) {
  console.error('Could not find oldClassPreviewBox!');
  process.exit(1);
}
content = content.replace(oldClassPreviewBox, newClassPreviewBox);
console.log('3. Updated updateAssignmentClassPreview to show individual subjects');

fs.writeFileSync('pages/hr/hr-dashboard.html', content, 'utf8');
console.log('SUCCESS: pages/hr/hr-dashboard.html updated!');
