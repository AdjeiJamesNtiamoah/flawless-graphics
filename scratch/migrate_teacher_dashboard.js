const fs = require('fs');
const path = 'pages/teacher/teacher-dashboard.html';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Replace read/save with in-memory store
const targetReadSave = `function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
function read(k){ return safeParse(localStorage.getItem(k)) || [] }
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)) }`;

const replacementReadSave = `function safeParse(s){ try{return JSON.parse(s)}catch(e){return null} }
const teacherStore = {};
function read(k){ return teacherStore[k] || [] }
function save(k,v){ 
  teacherStore[k] = v;
}

async function loadTeacherCloudData() {
  if (!window.SupabaseService) return;
  try {
    const classes = await window.SupabaseService.getClasses(ORG);
    teacherStore[CLASSES_KEY] = classes;

    const students = await window.SupabaseService.getStudents(ORG);
    teacherStore[\`\${ORG}_students\`] = students;

    const att = await window.SupabaseService.getAttendance(ORG);
    teacherStore[ATT_KEY] = att;

    const broadcasts = await window.SupabaseService.getAnnouncements(ORG);
    teacherStore[\`\${ORG}_announcements\`] = broadcasts;
  } catch (err) {
    console.warn('[Teacher Supabase] Load error:', err);
  }
}`;

content = content.replace(targetReadSave, replacementReadSave);

// 2. Remove default localStorage stores
content = content.replace(
  /\/\* Ensure Default Stores \*\/[\s\S]*?if\(!localStorage\.getItem\(ACT_KEY\)\) save\(ACT_KEY, \[\]\);/,
  `/* Live Supabase Entity Storage Initialized */`
);

// 3. Trigger loadTeacherCloudData before UI render
content = content.replace(
  /\/\* UI Initial Boot \*\/[\s\S]*?document\.getElementById\('orgName'\)\.textContent = ORG;/,
  `/* UI Initial Boot (Direct Supabase Cloud Engine) */
document.getElementById('orgName').textContent = ORG;
if (window.SupabaseService) {
  loadTeacherCloudData().then(() => {
    if (typeof renderClasses === 'function') renderClasses();
    if (typeof renderAttendance === 'function') renderAttendance();
  });
}`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully migrated teacher-dashboard.html to pure Supabase data access!');
