const fs = require('fs');
const assert = require('assert');

console.log('--- STARTING VERIFICATION ---');

// 1. Verify assets/js/supabase-client.js
const sbClient = fs.readFileSync('assets/js/supabase-client.js', 'utf8');
assert(sbClient.includes('subjectsArr = rawSubj.split(\',\')'), 'supabase-client getClasses parses multiple subjects');
assert(sbClient.includes('const subjectsList = Array.isArray(classData.subjects)'), 'supabase-client saveClass handles subjects list');
assert(sbClient.includes('[\'fg_registered_users\', \'registered_users\'].forEach(k =>'), 'deleteOrganization purges registered users');
console.log('✓ assets/js/supabase-client.js passed all checks');

// 2. Verify index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('fetchSupabaseSavedUsers'), 'index.html defines fetchSupabaseSavedUsers');
assert(indexHtml.includes('_supabaseUsersCache'), 'index.html uses _supabaseUsersCache for Supabase-only users');
assert(!indexHtml.includes('orgSelect.prepend(opt);'), 'index.html DOES NOT prepend unverified organizations into dropdown');
assert(indexHtml.includes('populateUnifiedOrgs().catch'), 'openUnifiedLoginModal refreshes orgs from Supabase');
console.log('✓ index.html passed all checks');

// 3. Verify pages/hr/hr-dashboard.html
const hrHtml = fs.readFileSync('pages/hr/hr-dashboard.html', 'utf8');
assert(hrHtml.includes('<th>Curriculum Subject(s)</th>'), 'hr-dashboard table header updated');
assert(hrHtml.includes('id="classSelectedSubjectPills"'), 'hr-dashboard has multi-subject pills container');
assert(hrHtml.includes('id="classCurriculumSubjectChips"'), 'hr-dashboard has curriculum quick-select chips');
assert(hrHtml.includes('function addCustomClassSubject'), 'hr-dashboard defines addCustomClassSubject');
assert(hrHtml.includes('function toggleClassSubject'), 'hr-dashboard defines toggleClassSubject');
assert(hrHtml.includes('function selectAllCoreCurriculumSubjects'), 'hr-dashboard defines selectAllCoreCurriculumSubjects');
assert(hrHtml.includes('subjects: subjectsArray'), 'hr-dashboard submitAddClass sets subjects array');
assert(hrHtml.includes('classSubjects.map(sub =>'), 'hr-dashboard renderClassesSection maps subjects to badges');
assert(hrHtml.includes('isSubjectInClass'), 'hr-dashboard renderSubjectsTab checks multi-subject allocation');
console.log('✓ pages/hr/hr-dashboard.html passed all checks');

console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
