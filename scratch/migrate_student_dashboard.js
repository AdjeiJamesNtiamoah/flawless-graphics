const fs = require('fs');
const path = 'pages/student/student-dashboard.html';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Update loadActiveStudent to query Supabase
content = content.replace(
  /function loadActiveStudent\(\) \{[\s\S]*?\/\/ Fallback to default student if none active/,
  `async function loadActiveStudent() {
  if (window.SupabaseService && (!activeStudent || !activeStudent.id)) {
    try {
      const studs = await window.SupabaseService.getStudents(ACTIVE_ORG || 'FLAWLESS GRAPHICS');
      if (Array.isArray(studs) && studs.length > 0) {
        activeStudent = studs[0];
      }
    } catch(e) {}
  }

  // Fallback to default student if none active`
);

// 2. Update renderBroadcasts to query Supabase announcements
content = content.replace(
  /function renderBroadcasts\(\) \{[\s\S]*?broadcasts = JSON\.parse\(localStorage\.getItem\(BROADCAST_KEY\) \|\| '\[\]'\);\s*\} catch\(e\) \{\}/,
  `async function renderBroadcasts() {
  const container = document.getElementById('overviewBroadcastsList');
  if (!container) return;

  let broadcasts = [];
  if (window.SupabaseService) {
    try {
      broadcasts = await window.SupabaseService.getAnnouncements(ACTIVE_ORG || 'FLAWLESS GRAPHICS');
    } catch(e) {}
  }`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully migrated student-dashboard.html to pure Supabase data access!');
