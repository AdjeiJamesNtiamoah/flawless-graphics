const fs = require('fs');
const filePath = 'pages/teacher/teacher-login.html';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Update verification submission to save directly to Supabase
const targetVerify = `    // 1. Persist to master organizations_users repository
    try {
        let orgUsers = JSON.parse(localStorage.getItem('organizations_users') || '[]');
        const uIdx = orgUsers.findIndex(u => (u.email || '').toLowerCase() === pendingTeacherData.email.toLowerCase());
        if (uIdx >= 0) {
            orgUsers[uIdx] = Object.assign({}, orgUsers[uIdx], pendingTeacherData);
        } else {
            orgUsers.push(pendingTeacherData);
        }
        localStorage.setItem('organizations_users', JSON.stringify(orgUsers));
    } catch(e) {
        console.warn("Error saving to organizations_users:", e);
    }

    // 2. Persist to teachers list
    const list = getTeachers();
    const tIdx = list.findIndex(t => (t.email || '').toLowerCase() === pendingTeacherData.email.toLowerCase());
    if (tIdx >= 0) list[tIdx] = pendingTeacherData;
    else list.push(pendingTeacherData);
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(list));

    // 3. Persist to organization teachers roster
    const activeOrg = (window.AuthSession ? window.AuthSession.getOrg() : '') || localStorage.getItem('active_org') || 'Organization';
    const orgKey = \`\${activeOrg}_teachers\`;
    try {
        let orgStaff = JSON.parse(localStorage.getItem(orgKey) || '[]');
        if (!orgStaff.some(s => (s.email || '').toLowerCase() === pendingTeacherData.email.toLowerCase())) {
            orgStaff.push({
                id: 't_' + Date.now(),
                name: pendingTeacherData.name,
                email: pendingTeacherData.email,
                role: 'Teacher',
                position: 'Educator / Teacher',
                status: 'pending_approval',
                photo: pendingTeacherData.photo || null,
                createdAt: Date.now()
            });
            localStorage.setItem(orgKey, JSON.stringify(orgStaff));
        }
    } catch(e) {
        console.warn("Error saving to org staff roster:", e);
    }`;

const replacementVerify = `    // 1. Persist to live Supabase Cloud database
    if (window.SupabaseService) {
        const activeOrg = (window.AuthSession ? window.AuthSession.getOrg() : '') || localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
        window.SupabaseService.createTeacher({
            name: pendingTeacherData.name,
            full_name: pendingTeacherData.name,
            email: pendingTeacherData.email,
            org_id: activeOrg,
            department: 'Academic Staff',
            position: 'Teacher / Educator',
            status: 'pending_approval',
            photo_url: pendingTeacherData.photo || null
        }).catch(e => console.warn('Supabase teacher sync warning:', e));

        window.SupabaseService.saveUser({
            name: pendingTeacherData.name,
            email: pendingTeacherData.email,
            password: pendingTeacherData.rawPassPreview || undefined,
            org: activeOrg,
            role: 'teacher',
            status: 'pending_approval'
        }).catch(e => console.warn('Supabase user sync warning:', e));
    }

    // Keep temporary in-memory representation for UI feedback
    const list = getTeachers();
    const tIdx = list.findIndex(t => (t.email || '').toLowerCase() === pendingTeacherData.email.toLowerCase());
    if (tIdx >= 0) list[tIdx] = pendingTeacherData;
    else list.push(pendingTeacherData);
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(list));`;

if (!content.includes(targetVerify)) {
    console.error('targetVerify not found in ' + filePath);
    process.exit(1);
}

content = content.replace(targetVerify, replacementVerify);

if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated teacher-login.html');
