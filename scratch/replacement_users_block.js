let _supabaseUsersCache = [];
let _supabaseUsersLoaded = false;
let _supabaseUsersPromise = null;

/**
 * Fetch and synchronize registered users and students directly from Supabase Cloud.
 * Eliminates unverified legacy local cache and ensures only active Supabase users and orgs are recognized.
 */
async function fetchSupabaseSavedUsers() {
    if (_supabaseUsersPromise) return _supabaseUsersPromise;

    _supabaseUsersPromise = (async () => {
        if (!window.SupabaseService) return [];
        try {
            // 1. Fetch valid organizations from Supabase to form an authoritative allowlist
            let validOrgs = ['FLAWLESS GRAPHICS'];
            try {
                const orgs = await window.SupabaseService.getOrganizations();
                if (Array.isArray(orgs)) {
                    orgs.forEach(o => {
                        const name = (o.org_name || o.name || '').trim();
                        const status = (o.status || '').toLowerCase();
                        if (name && (!status || status === 'active' || status === 'approved')) {
                            validOrgs.push(name);
                        }
                    });
                }
            } catch (_) {}
            const orgSet = new Set(validOrgs.map(o => o.toLowerCase()));

            // 2. Sweep legacy local storage: purge any users from deleted organizations
            ['fg_registered_users', 'registered_users'].forEach(key => {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const list = JSON.parse(raw);
                        if (Array.isArray(list)) {
                            const cleaned = list.filter(u => {
                                const uOrg = (u.org || u.org_name || '').trim().toLowerCase();
                                return !uOrg || orgSet.has(uOrg);
                            });
                            localStorage.setItem(key, JSON.stringify(cleaned));
                        }
                    }
                } catch (_) {}
            });

            // 3. Fetch active users strictly from Supabase
            const combinedMap = new Map();
            try {
                const cloudUsers = await window.SupabaseService.getUsers();
                if (Array.isArray(cloudUsers)) {
                    cloudUsers.forEach(u => {
                        if (!u) return;
                        const uOrg = (u.org || u.org_name || 'FLAWLESS GRAPHICS').trim();
                        if (uOrg && !orgSet.has(uOrg.toLowerCase())) return; // skip deleted organizations
                        const key = normalizeIdentifier(u.roll || u.linked_staff_id || u.email || u.id || '');
                        if (key) {
                            combinedMap.set(key, {
                                id: u.id,
                                name: u.name || u.fullName || (u.email ? u.email.split('@')[0] : 'User'),
                                fullName: u.name || u.fullName,
                                email: u.email,
                                role: (u.role || 'teacher').toLowerCase(),
                                roll: u.roll || u.linked_staff_id,
                                linked_staff_id: u.linked_staff_id || u.roll,
                                org: uOrg,
                                org_name: uOrg,
                                status: u.status || 'active',
                                password: u.pass_hash || u.password
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('[Supabase Users] Error fetching cloud users:', err.message);
            }

            // 4. Also fetch students from Supabase
            try {
                const cloudStudents = await window.SupabaseService.getStudents();
                if (Array.isArray(cloudStudents)) {
                    cloudStudents.forEach(s => {
                        if (!s) return;
                        const sOrg = (s.org_name || s.org_id || s.org || 'FLAWLESS GRAPHICS').trim();
                        if (sOrg && !orgSet.has(sOrg.toLowerCase())) return; // skip deleted organizations
                        const rollKey = normalizeIdentifier(s.roll || s.enrollment_code || s.email || s.id || '');
                        if (rollKey && !combinedMap.has(rollKey)) {
                            combinedMap.set(rollKey, {
                                id: s.id,
                                name: s.student_name || s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student',
                                fullName: s.student_name || s.name,
                                email: s.email,
                                role: 'student',
                                roll: s.roll || s.enrollment_code,
                                org: sOrg,
                                org_name: sOrg,
                                status: s.status || 'Active',
                                password: s.password || s.pass_hash || 'Stu@2026'
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('[Supabase Users] Error fetching cloud students:', err.message);
            }

            _supabaseUsersCache = Array.from(combinedMap.values());
            _supabaseUsersLoaded = true;
            return _supabaseUsersCache;
        } catch (e) {
            console.warn('Error fetching Supabase saved users:', e);
            return [];
        } finally {
            _supabaseUsersPromise = null;
        }
    })();

    return _supabaseUsersPromise;
}

/**
 * Return saved users called strictly from Supabase Cloud.
 */
function getStoredUsers() {
    if (_supabaseUsersCache.length > 0) {
        return _supabaseUsersCache;
    }
    // Asynchronously ensure fresh fetch in the background
    fetchSupabaseSavedUsers().catch(() => {});
    return [];
}

/**
 * Save user and update in-memory cache
 */
function saveStoredUser(newUserData) {
    if (!newUserData) return;
    try {
        const key = normalizeIdentifier(newUserData.roll || newUserData.linked_staff_id || newUserData.email || newUserData.id || '');
        if (key) {
            const idx = _supabaseUsersCache.findIndex(u => normalizeIdentifier(u.roll || u.linked_staff_id || u.email || u.id || '') === key);
            if (idx >= 0) {
                _supabaseUsersCache[idx] = Object.assign({}, _supabaseUsersCache[idx], newUserData);
            } else {
                _supabaseUsersCache.push(newUserData);
            }
        }
    } catch (_) {}
}

/**
 * Live auto-detection of role based on Auto-Generated ID, staff code, student roll number, or registered email.
 * Evaluates strictly against live Supabase saved users.
 */
async function handleUnifiedIdentifierInput(val) {
    const rawVal = (val || '').trim();
    const v = normalizeIdentifier(rawVal);
    const notice = document.getElementById('unifiedDetectionNotice');
    
    if (!v) {
        if (notice) notice.style.display = 'none';
        updatePortalRoutePreview(null);
        return;
    }

    // 0. Saved Supabase Users Check (Exact match on Auto-Generated ID, Staff ID, Roll, Email, or Name)
    try {
        if (!_supabaseUsersLoaded) {
            await fetchSupabaseSavedUsers();
        }
        const storedUsers = getStoredUsers();
        let matched = storedUsers.find(u => {
            const uRoll = normalizeIdentifier(u.roll || '');
            const uStaff = normalizeIdentifier(u.linked_staff_id || '');
            const uEmail = normalizeIdentifier(u.email || '');
            const uId = normalizeIdentifier(u.id || '');
            const uName = (u.name || u.fullName || '').trim().toLowerCase();
            return (uRoll && uRoll === v) ||
                   (uStaff && uStaff === v) ||
                   (uEmail && uEmail === v) ||
                   (uId && uId === v) ||
                   (uName && uName === v);
        });

        // Fallback: If not yet in cache, query findUser in Supabase directly
        if (!matched && window.SupabaseService && typeof window.SupabaseService.findUser === 'function') {
            try {
                const cloudUser = await window.SupabaseService.findUser(rawVal);
                if (cloudUser) {
                    matched = {
                        id: cloudUser.id,
                        name: cloudUser.name || cloudUser.fullName,
                        email: cloudUser.email,
                        role: cloudUser.role,
                        roll: cloudUser.roll || cloudUser.linked_staff_id,
                        org: cloudUser.org || cloudUser.org_name,
                        status: cloudUser.status,
                        password: cloudUser.pass_hash || cloudUser.password
                    };
                }
            } catch (_) {}
        }

        if (matched && matched.role) {
            switchUnifiedRole(matched.role, true);
            // Select their registered organization ONLY if it exists in the active Supabase dropdown!
            const orgSelect = document.getElementById('unifiedOrgSelect');
            if (orgSelect && (matched.org || matched.org_name)) {
                const targetOrg = (matched.org || matched.org_name).trim().toLowerCase();
                for (let i = 0; i < orgSelect.options.length; i++) {
                    const optVal = orgSelect.options[i].value.trim().toLowerCase();
                    const optTxt = orgSelect.options[i].text.trim().toLowerCase();
                    if (optVal === targetOrg || optTxt === targetOrg || optTxt.includes(targetOrg)) {
                        orgSelect.selectedIndex = i;
                        break;
                    }
                }
                // Never inject, prepend, or invent an unverified or deleted organization!
            }
            if (notice) {
                notice.style.display = 'inline-flex';
                notice.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #059669;"></i> <span><strong>${matched.name}</strong> (${matched.org || 'Campus'}) &bull; ${matched.role.toUpperCase()} Gateway Ready</span>`;
            }
            updatePortalRoutePreview(matched.role, `<span class="tag-route verified"><i class="fa-solid fa-circle-check"></i> ${matched.name} &bull; Directing to ${matched.role.toUpperCase()} Portal</span>`);
            return;
        }
    } catch (_) {}
