const fs = require('fs');

// 1. Update realtime-auth.js populateApprovedOrgDropdown
let realtimeAuth = fs.readFileSync('assets/js/realtime-auth.js', 'utf8');

const newPopulate = `        populateApprovedOrgDropdown: async function (selectElement, selectedValue = null) {
            if (!selectElement) return;
            try {
                // Determine preferred active organization from parameters or storage
                const preferredOrg = (selectedValue || 
                    (window.AuthSession && typeof window.AuthSession.getOrg === 'function' ? window.AuthSession.getOrg() : null) || 
                    localStorage.getItem('active_org') || 
                    localStorage.getItem('activeOrg') || 
                    '').trim();

                let orgs = [];
                if (window.SupabaseService && typeof window.SupabaseService.getApprovedOrganizations === 'function') {
                    orgs = await window.SupabaseService.getApprovedOrganizations();
                }

                // If no approved orgs from cloud, fallback to local active_org / default
                if (!orgs || orgs.length === 0) {
                    const localOrg = preferredOrg || 'FLAWLESS GRAPHICS';
                    orgs = [{ org_name: localOrg, name: localOrg, org_id: 'fg-main', status: 'Active' }];
                }

                // Ensure root / default exists if needed
                const hasRoot = orgs.some(o => ((o.org_name || o.name || '').toUpperCase() === 'FLAWLESS GRAPHICS') || ((o.org_id || o.slug || '') === 'fg-main'));
                if (!hasRoot && (!orgs || orgs.length === 0)) {
                    orgs.unshift({ org_name: 'FLAWLESS GRAPHICS', name: 'FLAWLESS GRAPHICS', org_id: 'fg-main', status: 'Active' });
                }

                selectElement.innerHTML = '<option value="">-- Select Approved Institution Workspace --</option>';
                let matchedIndex = -1;

                orgs.forEach((org, idx) => {
                    const name = org.org_name || org.name || 'Educational Institution';
                    const slug = org.org_id || org.slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'workspace');
                    const opt = document.createElement('option');
                    opt.value = slug;
                    opt.dataset.name = name;
                    opt.dataset.slug = slug;
                    opt.textContent = \`\${name} (\${slug})\`;

                    const prefClean = preferredOrg.toLowerCase();
                    const slugClean = slug.toLowerCase();
                    const nameClean = name.toLowerCase();

                    if (prefClean && (prefClean === slugClean || prefClean === nameClean || prefClean.includes(nameClean) || nameClean.includes(prefClean))) {
                        opt.selected = true;
                        matchedIndex = idx + 1;
                    }
                    selectElement.appendChild(opt);
                });

                // Auto-select matched active organization or default if only 1 exists
                if (matchedIndex > 0) {
                    selectElement.selectedIndex = matchedIndex;
                } else if (orgs.length === 1) {
                    selectElement.selectedIndex = 1;
                }

                // Listen to dropdown changes to sync active institution workspace
                if (!selectElement._hasOrgChangeListener) {
                    selectElement._hasOrgChangeListener = true;
                    selectElement.addEventListener('change', () => {
                        const selOpt = selectElement.selectedOptions && selectElement.selectedOptions[0];
                        if (selOpt && selOpt.value) {
                            const newOrgName = selOpt.dataset.name || selOpt.textContent;
                            if (newOrgName && !newOrgName.includes('-- Select Approved')) {
                                localStorage.setItem('active_org', newOrgName);
                                if (window.AuthSession && typeof window.AuthSession.setOrgName === 'function') {
                                    window.AuthSession.setOrgName(newOrgName);
                                }
                            }
                        }
                    });
                }
            } catch (err) {
                console.warn('[RealtimeAuth] Error populating org dropdown:', err);
                if (!selectElement.options || selectElement.options.length <= 1) {
                    selectElement.innerHTML = '<option value="fg-main" selected>FLAWLESS GRAPHICS (fg-main)</option>';
                }
            }
        },`;

const populateRegex = /populateApprovedOrgDropdown:\s*async\s*function\s*\([^\)]*\)\s*\{[\s\S]*?\n\s*\},/;
if (populateRegex.test(realtimeAuth)) {
    realtimeAuth = realtimeAuth.replace(populateRegex, newPopulate.trim());
    fs.writeFileSync('assets/js/realtime-auth.js', realtimeAuth, 'utf8');
    console.log('✓ realtime-auth.js updated successfully');
} else {
    console.error('✗ Failed to match populateApprovedOrgDropdown in realtime-auth.js');
}

// 2. Update supabase-client.js
let supaClient = fs.readFileSync('assets/js/supabase-client.js', 'utf8');

const getOrgRegex = /async getOrganization\(orgId\)\s*\{[\s\S]*?\n    \}/;
const newGetOrg = `async getOrganization(orgId) {
      if (!orgId) return null;
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId);
        if (isUuid) {
          const data = await this.query(\`organizations?id=eq.\${encodeURIComponent(orgId)}&limit=1\`);
          if (Array.isArray(data) && data.length > 0) return data[0];
        }
        // Try query by org_name
        const byName = await this.query(\`organizations?org_name=eq.\${encodeURIComponent(orgId)}&limit=1\`);
        if (Array.isArray(byName) && byName.length > 0) return byName[0];

        // Search through all organizations with normalized comparison
        const all = await this.getOrganizations();
        if (Array.isArray(all) && all.length > 0) {
          const target = String(orgId).trim().toLowerCase();
          const match = all.find(o => {
            const n = (o.org_name || o.name || '').trim().toLowerCase();
            const s = (o.slug || o.org_id || '').trim().toLowerCase();
            const id = (o.id || '').trim().toLowerCase();
            return n === target || s === target || id === target || (n && target && (n.includes(target) || target.includes(n)));
          });
          if (match) return match;
        }
        return null;
      } catch (err) {
        console.error('[Supabase] Failed to fetch organization:', err.message);
        return null;
      }
    }`;

if (getOrgRegex.test(supaClient)) {
    supaClient = supaClient.replace(getOrgRegex, newGetOrg);
    console.log('✓ supabase-client.js getOrganization updated');
}

const getApprovedRegex = /async getApprovedOrganizations\(\)\s*\{[\s\S]*?\n    \}/;
const newGetApproved = `async getApprovedOrganizations() {
      try {
        const data = await this.query('organizations?order=org_name.asc');
        if (!Array.isArray(data)) return [];
        return data.filter(org => {
          const st = (org.status || '').toLowerCase().trim();
          return st === 'approved' || st === 'active' || st === '';
        });
      } catch (err) {
        console.warn('[Supabase] Failed to fetch approved organizations:', err.message);
        return [];
      }
    }`;

if (getApprovedRegex.test(supaClient)) {
    supaClient = supaClient.replace(getApprovedRegex, newGetApproved);
    console.log('✓ supabase-client.js getApprovedOrganizations updated');
}

fs.writeFileSync('assets/js/supabase-client.js', supaClient, 'utf8');

// 3. Fix teacher-login.html matchedOrgUser reference
let teacherLogin = fs.readFileSync('pages/teacher/teacher-login.html', 'utf8');
if (teacherLogin.includes('matchedOrgUser')) {
    teacherLogin = teacherLogin.replace(/const userStatus = \(\(matchedOrgUser && matchedOrgUser\.status\) \|\| \(teacher && teacher\.status\) \|\| 'active'\)\.toLowerCase\(\);/, "const userStatus = ((teacher && teacher.status) || 'active').toLowerCase();");
    fs.writeFileSync('pages/teacher/teacher-login.html', teacherLogin, 'utf8');
    console.log('✓ teacher-login.html matchedOrgUser reference fixed');
}
