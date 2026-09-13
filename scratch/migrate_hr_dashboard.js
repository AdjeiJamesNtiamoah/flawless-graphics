const fs = require('fs');
const path = 'pages/hr/hr-dashboard.html';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Replace read and save with in-memory store backed by Supabase
const targetReadSave = `function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
function read(k) { return safeParse(localStorage.getItem(k)) || []; }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }`;

const replacementReadSave = `function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
const hrStore = {};
function read(k) { return hrStore[k] || []; }
function save(k, v) { 
  hrStore[k] = v;
}

async function loadHRCloudData() {
  if (!window.SupabaseService) return;
  try {
    const teachers = await window.SupabaseService.getTeachers(ACTIVE_ORG);
    hrStore[EMP_KEY] = teachers;

    const att = await window.SupabaseService.getAttendance(ACTIVE_ORG);
    hrStore[ATT_KEY] = att;

    const ann = await window.SupabaseService.getAnnouncements(ACTIVE_ORG);
    hrStore[ANNOUNCE_KEY] = ann;

    const students = await window.SupabaseService.getStudents(ACTIVE_ORG);
    hrStore[STUD_KEY] = students;

    const payroll = await window.SupabaseService.getPayroll(ACTIVE_ORG);
    hrStore['fg_payroll'] = payroll;
  } catch (err) {
    console.warn('[HR Supabase] Load error:', err);
  }
}`;

if (!content.includes(targetReadSave)) {
  console.error('Could not find targetReadSave in hr-dashboard.html');
  process.exit(1);
}

content = content.replace(targetReadSave, replacementReadSave);

// 2. Disable demo seed insertion in initDefaultData
content = content.replace(
  /function initDefaultData\(\) \{[\s\S]*?save\(ANNOUNCE_KEY, ann\);\s*\}\s*\}/,
  `function initDefaultData() {
  // Pure Supabase System of Record: entity data loaded from cloud
  if (!hrStore[EMP_KEY]) hrStore[EMP_KEY] = [];
  if (!hrStore[ANNOUNCE_KEY]) hrStore[ANNOUNCE_KEY] = [];
}`
);

// 3. Update bootstrapApp to await loadHRCloudData
content = content.replace(
  /function bootstrapApp\(\) \{[\s\S]*?updateCloudSyncStatus\(\);/,
  `async function bootstrapApp() {
    await loadHRCloudData();
    updateCloudSyncStatus();`
);

// 4. Update saveAttendancePunch to persist directly to Supabase
content = content.replace(
  /async function saveAttendancePunch\(e\) \{[\s\S]*?if \(window\.SupabaseService/,
  `async function saveAttendancePunch(e) {
    e.preventDefault();
    const date = document.getElementById('punch_date').value;
    const empId = document.getElementById('punch_employee').value;
    const checkIn = document.getElementById('punch_in').value;
    const checkOut = document.getElementById('punch_out').value;
    const status = document.getElementById('punch_status').value;
    const remarks = document.getElementById('punch_remarks').value.trim();

    const emps = read(EMP_KEY);
    const emp = emps.find(e => e.id === empId);
    if (!emp) {
      showToast('Please select a valid staff member.', 'warning');
      return;
    }

    const payload = {
      teacherName: emp.name || emp.fullName,
      teacherId: emp.id,
      department: emp.dept || emp.department,
      date,
      checkIn,
      checkOut,
      status,
      remarks
    };

    if (window.SupabaseService) {
      await window.SupabaseService.saveAttendance(ACTIVE_ORG, payload).catch(console.warn);
      const att = await window.SupabaseService.getAttendance(ACTIVE_ORG);
      hrStore[ATT_KEY] = att;
    }

    if (window.SupabaseService`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully migrated hr-dashboard.html to pure Supabase data access!');
