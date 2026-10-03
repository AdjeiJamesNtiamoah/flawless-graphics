const fs = require('fs');

const targetFile = 'd:/flawless-graphics/pages/hr/hr-dashboard.html';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add student helper generator functions right above openAddStudentModal
const oldOpenAddStudentModalSig = `function openAddStudentModal(studentOrCode = null) {`;

const studentGenerators = `// --- AUTOMATIC STUDENT ROLL & PASSWORD ENGINE ---
function generateStudentRollNumber() {
  const allStuds = typeof getEnrolledStudentsList === 'function' ? getEnrolledStudentsList() : [];
  const currentYear = new Date().getFullYear();
  let maxNum = 0;
  allStuds.forEach(s => {
    const code = String(s.roll || s.enrollment_code || s.id || '');
    const match = code.match(/STU-\\d{4}-(\\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = String(Math.max(maxNum + 1, allStuds.length + 1)).padStart(3, '0');
  return 'STU-' + currentYear + '-' + nextNum;
}

function regenerateStudentRoll() {
  const rollInput = document.getElementById('sm_roll');
  if (rollInput) {
    rollInput.value = generateStudentRollNumber();
    showToast('New Roll Number generated: ' + rollInput.value);
  }
}

function generateSecureStudentPassword() {
  const randDigits = Math.floor(1000 + Math.random() * 9000);
  return 'Stu@' + randDigits;
}

function regenerateStudentPassword() {
  const passInput = document.getElementById('sm_password');
  if (passInput) {
    passInput.value = generateSecureStudentPassword();
    showToast('New Student Password generated: ' + passInput.value);
  }
}

function toggleStudentFormPasswordVis() {
  const inp = document.getElementById('sm_password');
  const icon = document.getElementById('sm_passEyeIcon');
  if (!inp || !icon) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fa-solid fa-eye';
  } else {
    inp.type = 'password';
    icon.className = 'fa-solid fa-eye-slash';
  }
}

function openRegisterStudentModal(studentOrCode = null) {
  openAddStudentModal(studentOrCode);
}
window.openRegisterStudentModal = openRegisterStudentModal;

function openAddStudentModal(studentOrCode = null) {`;

content = content.replace(oldOpenAddStudentModalSig, studentGenerators);

// 2. In openAddStudentModal: Auto-populate roll and password on Add Mode, and load in Edit Mode
const oldAddModePattern = `    document.getElementById('sm_studentId').value = '';
    const allStuds = getEnrolledStudentsList();
    const nextNum = String(allStuds.length + 1).padStart(3, '0');
    document.getElementById('sm_roll').value = 'STU-' + new Date().getFullYear() + '-' + nextNum;
    document.getElementById('sm_term').value = new Date().getFullYear() + ' - Term 1';`;

const newAddModePattern = `    document.getElementById('sm_studentId').value = '';
    const autoRoll = generateStudentRollNumber();
    const autoPass = generateSecureStudentPassword();
    document.getElementById('sm_roll').value = autoRoll;
    const smPassInput = document.getElementById('sm_password');
    if (smPassInput) {
      smPassInput.value = autoPass;
      smPassInput.type = 'text';
    }
    document.getElementById('sm_term').value = new Date().getFullYear() + ' - Term 1';`;

content = content.replace(oldAddModePattern, newAddModePattern);

// In Edit Mode, populate existing password
const oldEditModeRoll = `document.getElementById('sm_roll').value = student.roll || student.enrollment_code || student.id || '';`;
const newEditModeRoll = `document.getElementById('sm_roll').value = student.roll || student.enrollment_code || student.id || '';
    const smPassEdit = document.getElementById('sm_password');
    if (smPassEdit) {
      const usersList = typeof getSystemUsers === 'function' ? getSystemUsers() : [];
      const matchedUser = usersList.find(u => (u.linkedStaffId === student.roll || u.email === student.guardianEmail || (u.name && u.name.toLowerCase() === (student.student_name || '').toLowerCase())));
      smPassEdit.value = (matchedUser && (matchedUser.rawPassPreview || matchedUser.pass)) || student.password || 'Stu@2026';
      smPassEdit.type = 'text';
    }`;

content = content.replace(oldEditModeRoll, newEditModeRoll);

// 3. In saveStudentDetailForm: extract password, guarantee user creation & call showStudentCredentialsModal
const oldSaveFuncPattern = /async function saveStudentDetailForm\(e\) {[\s\S]*?function showStudentCredentialsModal/;

const newSaveFunc = `async function saveStudentDetailForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const classSelect = document.getElementById('sm_classId');
  const classId = classSelect ? classSelect.value : '';
  const selectedOption = classSelect ? classSelect.options[classSelect.selectedIndex] : null;
  const className = selectedOption ? (selectedOption.getAttribute('data-name') || selectedOption.text.split(' (')[0]) : 'General Studies';

  const studentId = document.getElementById('sm_studentId')?.value.trim();
  const firstName = document.getElementById('sm_firstName')?.value.trim();
  const middleName = document.getElementById('sm_middleName')?.value.trim();
  const lastName = document.getElementById('sm_lastName')?.value.trim();
  const gender = document.getElementById('sm_gender')?.value || 'Male';
  const dob = document.getElementById('sm_dob')?.value || '';
  const bloodGroup = document.getElementById('sm_bloodGroup')?.value || 'Not Specified';
  
  let roll = (document.getElementById('sm_roll')?.value || '').trim();
  if (!roll) {
    roll = generateStudentRollNumber();
  }

  let password = (document.getElementById('sm_password')?.value || '').trim();
  if (!password) {
    password = generateSecureStudentPassword();
  }

  const status = document.getElementById('sm_status')?.value || 'Active';
  const term = document.getElementById('sm_term')?.value.trim() || (new Date().getFullYear() + ' - Term 1');
  const enrollmentDate = document.getElementById('sm_enrollmentDate')?.value || new Date().toISOString().split('T')[0];
  const guardianName = document.getElementById('sm_guardianName')?.value.trim();
  const guardianRel = document.getElementById('sm_guardianRel')?.value || 'Mother';
  const phone = document.getElementById('sm_phone')?.value.trim();
  const guardianEmail = document.getElementById('sm_guardianEmail')?.value.trim();
  const address = document.getElementById('sm_address')?.value.trim();
  const emergencyPhone = document.getElementById('sm_emergencyPhone')?.value.trim();
  const medicalNotes = document.getElementById('sm_medicalNotes')?.value.trim();
  const notes = document.getElementById('sm_notes')?.value.trim();

  if (!firstName || !lastName) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Required Information Missing', 'First Name and Last Name / Surname are mandatory.');
    } else {
      showToast('First and Last names are required', 'warning');
    }
    return;
  }
  if (!guardianName || !phone) {
    if (window.Toaster && typeof window.Toaster.warning === 'function') {
      window.Toaster.warning('Guardian Information Missing', 'Guardian Full Name and Primary Phone are required for enrollment.');
    } else {
      showToast('Guardian name and primary phone are required', 'warning');
    }
    return;
  }

  const saveBtn = document.getElementById('sm_saveBtn');
  const origBtnText = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering &amp; Provisioning...';
  }

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const isEdit = Boolean(studentId);
  const recordId = studentId || ('s_' + Date.now());
  const orgSlug = ACTIVE_ORG.toLowerCase().replace(/[^a-z0-9]/g, '');
  const studentEmail = guardianEmail || \`\${roll.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.\${orgSlug || 'flawless'}.edu\`;

  const studentRecord = {
    id: recordId,
    enrollment_code: roll,
    roll: roll,
    student_name: fullName,
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    gender: gender,
    dob: dob,
    bloodGroup: bloodGroup,
    classId: classId,
    class_id: classId,
    class_name: className,
    className: className,
    grade: className,
    status: status,
    term: term,
    password: password,
    pass_hash: password,
    enrollmentDate: enrollmentDate,
    enrolledAt: enrollmentDate ? new Date(enrollmentDate).toISOString() : new Date().toISOString(),
    guardianName: guardianName,
    guardian_name: guardianName,
    guardianRel: guardianRel,
    guardian_rel: guardianRel,
    phone: phone,
    guardian_phone: phone,
    guardianEmail: studentEmail,
    guardian_email: studentEmail,
    address: address,
    emergencyPhone: emergencyPhone,
    medicalNotes: medicalNotes,
    notes: notes,
    photo: currentStudentPhotoBase64 || DEFAULT_STUDENT_AVATAR,
    photo_url: currentStudentPhotoBase64 || DEFAULT_STUDENT_AVATAR,
    updatedAt: Date.now()
  };

  try {
    let cloudEnrollResult = null;
    if (window.SupabaseService) {
      if (isEdit) {
        await window.SupabaseService.saveStudent(ACTIVE_ORG, studentRecord).catch(console.warn);
      } else {
        cloudEnrollResult = await window.SupabaseService.createStudentWithAccount(ACTIVE_ORG, studentRecord).catch(err => {
          console.warn('[Supabase Cloud Enrollment Notice]:', err.message);
          return null;
        });
      }
    }

    // 1. Update in STUD_KEY
    let studs = read(STUD_KEY);
    if (!Array.isArray(studs)) studs = [];
    const existingIdx = studs.findIndex(s => (s.id === recordId || (s.roll && s.roll === roll) || (s.enrollment_code && s.enrollment_code === roll)));
    if (existingIdx !== -1) {
      studs[existingIdx] = Object.assign({}, studs[existingIdx], studentRecord);
    } else {
      studentRecord.createdAt = Date.now();
      studs.unshift(studentRecord);
    }
    save(STUD_KEY, studs);

    // 2. Cross-portal sync: Update into target class in CLASSES_STORAGE_KEY
    let classes = typeof getClassesList === 'function' ? getClassesList() : (read(CLASSES_STORAGE_KEY) || []);
    if (Array.isArray(classes)) {
      let targetClass = classes.find(c => c.id === classId || c.name === className);
      if (targetClass) {
        targetClass.students = targetClass.students || [];
        const cIdx = targetClass.students.findIndex(s => s.id === recordId || s.roll === roll);
        if (cIdx !== -1) {
          targetClass.students[cIdx] = Object.assign({}, targetClass.students[cIdx], studentRecord);
        } else {
          targetClass.students.push(studentRecord);
        }
        targetClass.enrolled = targetClass.students.length;
        save(CLASSES_STORAGE_KEY, classes);
      }
    }

    // 3. Guarantee student login account in USERS_STORAGE_KEY
    try {
      let users = getSystemUsers();
      const existingUserIdx = users.findIndex(u => (u.email === studentEmail || u.linkedStaffId === roll));
      const userRecord = {
        id: 'u_' + roll.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        org: ACTIVE_ORG,
        name: fullName,
        email: studentEmail,
        role: 'student',
        status: 'active',
        pass: password,
        pass_hash: password,
        rawPassPreview: password,
        linkedStaffId: roll,
        linked_staff_id: roll,
        createdAt: Date.now()
      };
      if (existingUserIdx !== -1) {
        users[existingUserIdx] = Object.assign({}, users[existingUserIdx], userRecord);
      } else {
        users.unshift(userRecord);
      }
      save(USERS_STORAGE_KEY, users);
    } catch (e) {
      console.warn('User account sync notice:', e);
    }

    closeStudentModal();
    loadHRStudents();
    renderDashboard();

    // 4. ALWAYS display the visible credentials modal right after registration is done by HR
    const finalPassword = (cloudEnrollResult && (cloudEnrollResult.password || cloudEnrollResult.generatedPassword)) || password;
    showStudentCredentialsModal({
      name: fullName,
      roll: roll,
      className: className,
      password: finalPassword,
      generatedPassword: finalPassword,
      email: (cloudEnrollResult && cloudEnrollResult.email) || studentEmail,
      phone: phone,
      guardianName: guardianName
    });

    if (window.Toaster && typeof window.Toaster.success === 'function') {
      window.Toaster.success(
        isEdit ? 'Student Profile Updated' : 'Student Registered Successfully',
        \`Roll Number: \${roll} • Password: \${finalPassword}\`
      );
    } else {
      showToast(\`Student registered! Roll: \${roll} • Password: \${finalPassword}\`);
    }

  } catch (err) {
    console.error('Error saving student:', err);
    showToast('Notice saving student: ' + (err.message || err), 'warning');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origBtnText;
    }
  }
}

function showStudentCredentialsModal`;

content = content.replace(oldSaveFuncPattern, newSaveFunc);

// 4. Update showStudentCredentialsModal and slip helpers
const oldCredModalHelpers = `function showStudentCredentialsModal(data) {
  const modal = document.getElementById('studentCredentialsModal');
  if (!modal) return;
  document.getElementById('sc_name').textContent = data.name || '--';
  document.getElementById('sc_class').textContent = data.className || '--';
  document.getElementById('sc_roll').textContent = data.roll || '--';
  document.getElementById('sc_pass').textContent = data.generatedPassword || '--';
  
  window._lastStudentCredentials = data;
  modal.classList.add('active');
}`;

const newCredModalHelpers = `let _modalPassMasked = false;

function showStudentCredentialsModal(data) {
  const modal = document.getElementById('studentCredentialsModal');
  if (!modal) return;
  
  const displayPass = data.generatedPassword || data.password || 'Stu@' + Math.floor(1000 + Math.random() * 9000);
  const displayRoll = data.roll || '--';

  document.getElementById('sc_name').textContent = data.name || '--';
  document.getElementById('sc_class').textContent = data.className || '--';
  document.getElementById('sc_roll').textContent = displayRoll;
  
  const passEl = document.getElementById('sc_pass');
  if (passEl) {
    passEl.textContent = displayPass;
    passEl.setAttribute('data-raw', displayPass);
  }

  const eyeIcon = document.getElementById('sc_passEyeIcon');
  if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
  _modalPassMasked = false;
  
  window._lastStudentCredentials = Object.assign({}, data, {
    password: displayPass,
    generatedPassword: displayPass
  });

  modal.classList.add('active');
}

function toggleModalPasswordMask() {
  const passEl = document.getElementById('sc_pass');
  const eyeIcon = document.getElementById('sc_passEyeIcon');
  if (!passEl) return;
  const actualPass = (window._lastStudentCredentials && (window._lastStudentCredentials.generatedPassword || window._lastStudentCredentials.password)) || passEl.getAttribute('data-raw') || passEl.innerText;
  if (!_modalPassMasked) {
    passEl.setAttribute('data-raw', actualPass);
    passEl.innerText = '••••••••';
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
    _modalPassMasked = true;
  } else {
    passEl.innerText = passEl.getAttribute('data-raw') || actualPass;
    if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
    _modalPassMasked = false;
  }
}

function copyStudentCredential(elementId, successMsg) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const val = el.getAttribute('data-raw') || el.innerText;
  navigator.clipboard.writeText(val).then(() => {
    showToast(successMsg || 'Copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy', 'warning');
  });
}

function printStudentCredentialSlip() {
  window.print();
}`;

content = content.replace(oldCredModalHelpers, newCredModalHelpers);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✓ Successfully patched all student JS logic in hr-dashboard.html');
