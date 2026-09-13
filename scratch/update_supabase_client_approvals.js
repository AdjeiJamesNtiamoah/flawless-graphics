const fs = require('fs');
const filePath = 'assets/js/supabase-client.js';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Target saveOrganization to include status & add getPendingOrganizations, approveOrganization, rejectOrganization
const targetSaveOrg = `    async saveOrganization(orgData) {
      const payload = {
        id: orgData.id || undefined,
        org_name: orgData.org_name || orgData.org || orgData.name || 'FLAWLESS GRAPHICS',
        admin_name: orgData.admin_name || orgData.name || orgData.fullName || 'Admin',
        email: (orgData.email || '').trim().toLowerCase(),
        phone: orgData.phone || null,
        address: orgData.address || null,
        logo_path: orgData.logo_path || orgData.logo || null,
        tier: orgData.tier || 'Enterprise',
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('organizations', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save organization:', err.message);
        throw err;
      }
    }`;

const replacementSaveOrg = `    async saveOrganization(orgData) {
      const payload = {
        id: orgData.id || undefined,
        org_name: orgData.org_name || orgData.org || orgData.name || 'FLAWLESS GRAPHICS',
        admin_name: orgData.admin_name || orgData.name || orgData.fullName || 'Admin',
        email: (orgData.email || '').trim().toLowerCase(),
        phone: orgData.phone || null,
        address: orgData.address || null,
        logo_path: orgData.logo_path || orgData.logo || null,
        tier: orgData.tier || 'Enterprise',
        status: orgData.status || 'pending_approval',
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('organizations', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save organization:', err.message);
        throw err;
      }
    }

    async getPendingOrganizations() {
      try {
        const data = await this.query('organizations?status=eq.pending_approval&order=created_at.desc');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending organizations:', err.message);
        return [];
      }
    }

    async approveOrganization(orgId) {
      try {
        const res = await this.query(\`organizations?id=eq.\${encodeURIComponent(orgId)}\`, 'PATCH', {
          status: 'Active',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve organization:', err.message);
        throw err;
      }
    }

    async rejectOrganization(orgId) {
      try {
        const res = await this.query(\`organizations?id=eq.\${encodeURIComponent(orgId)}\`, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject organization:', err.message);
        throw err;
      }
    }`;

// 2. Target saveUser and authenticate to enforce approval statuses & add getPendingUsers, approveUser, rejectUser, getPendingTeachers, approveTeacher, rejectTeacher, getPendingStudents, approveStudent, rejectStudent
const targetSaveUserAndAuth = `    async saveUser(userData) {
      const email = (userData.email || '').trim().toLowerCase();
      const payload = {
        id: userData.id || ('u_' + Date.now()),
        org: userData.org || userData.org_id || 'FLAWLESS GRAPHICS',
        name: userData.name || userData.fullName || email.split('@')[0],
        email: email,
        password: userData.password || userData.pass || undefined,
        role: (userData.role || 'teacher').toLowerCase(),
        status: userData.status || 'active',
        designation: userData.designation || userData.position || '',
        department: userData.department || userData.dept || '',
        phone: userData.phone || '',
        photo_url: userData.photo_url || userData.photo || null,
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('users', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save user:', err.message);
        throw err;
      }
    }

    async deleteUser(userId) {
      try {
        await this.query(\`users?id=eq.\${encodeURIComponent(userId)}\`, 'DELETE');
        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete user:', err.message);
        throw err;
      }
    }

    /**
     * Authenticate user directly against Supabase users table
     */
    async authenticate(email, password, orgId = null, role = null) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) return { success: false, error: 'Email is required' };

      try {
        let endpoint = \`users?email=eq.\${encodeURIComponent(cleanEmail)}\`;
        if (orgId) {
          endpoint += \`&org=eq.\${encodeURIComponent(orgId)}\`;
        }
        const users = await this.query(endpoint);
        if (!Array.isArray(users) || users.length === 0) {
          return { success: false, error: 'Account not found in institutional database. Please register.' };
        }

        const user = users[0];
        if (role && user.role && user.role.toLowerCase() !== role.toLowerCase() && user.role.toLowerCase() !== 'superadmin' && user.role.toLowerCase() !== 'admin') {
          return { success: false, error: \`Account role mismatch: expected \${role}, found \${user.role}.\` };
        }

        if (user.password && user.password !== password) {
          return { success: false, error: 'Invalid password. Please re-enter.' };
        }

        return { success: true, user };
      } catch (err) {
        console.error('[Supabase] Authentication error:', err.message);
        return { success: false, error: err.message };
      }
    }

    /**
     * Sign up administrative or institutional account
     * Creates user record in Supabase users table and returns user session
     */
    async signUp(email, password, metadata = {}) {
      const cleanEmail = (email || '').trim().toLowerCase();
      try {
        const userRecord = await this.saveUser({
          email: cleanEmail,
          password: password,
          name: metadata.admin_name || cleanEmail.split('@')[0],
          org: metadata.org_name || 'FLAWLESS GRAPHICS',
          role: metadata.role || 'admin',
          status: 'active'
        });

        if (metadata.org_name) {
          await this.saveOrganization({
            org_name: metadata.org_name,
            name: metadata.org_name,
            admin_name: metadata.admin_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            logo_path: metadata.logo_path || null
          }).catch(console.warn);
        }

        return {
          success: true,
          requiresVerification: false,
          user: userRecord,
          message: 'Account registered successfully in cloud database.'
        };
      } catch (err) {
        console.error('[Supabase] Sign up error:', err.message);
        throw err;
      }
    }`;

const replacementSaveUserAndAuth = `    async saveUser(userData) {
      const email = (userData.email || '').trim().toLowerCase();
      const rawPass = userData.pass_hash || userData.password || userData.pass || undefined;
      const payload = {
        id: userData.id || ('u_' + Date.now()),
        org: userData.org || userData.org_id || 'FLAWLESS GRAPHICS',
        name: userData.name || userData.fullName || email.split('@')[0],
        email: email,
        pass_hash: rawPass,
        role: (userData.role || 'teacher').toLowerCase(),
        status: userData.status || 'pending_approval',
        designation: userData.designation || userData.position || '',
        department: userData.department || userData.dept || '',
        phone: userData.phone || '',
        photo_url: userData.photo_url || userData.photo || null,
        approved_at: userData.approved_at || null,
        approved_by: userData.approved_by || null,
        updated_at: new Date().toISOString()
      };

      try {
        const res = await this.query('users', 'POST', payload, {
          'Prefer': 'resolution=merge-duplicates,return=representation'
        });
        return Array.isArray(res) && res.length > 0 ? res[0] : payload;
      } catch (err) {
        console.error('[Supabase] Failed to save user:', err.message);
        throw err;
      }
    }

    async deleteUser(userId) {
      try {
        await this.query(\`users?id=eq.\${encodeURIComponent(userId)}\`, 'DELETE');
        return true;
      } catch (err) {
        console.error('[Supabase] Failed to delete user:', err.message);
        throw err;
      }
    }

    async getPendingUsers(role = null, orgId = null) {
      try {
        let endpoint = 'users?status=eq.pending_approval&order=created_at.desc';
        if (role) endpoint += \`&role=eq.\${encodeURIComponent(role)}\`;
        if (orgId) endpoint += \`&org=eq.\${encodeURIComponent(orgId)}\`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending users:', err.message);
        return [];
      }
    }

    async approveUser(userId, approvedBy = 'Super Admin') {
      try {
        const res = await this.query(\`users?id=eq.\${encodeURIComponent(userId)}\`, 'PATCH', {
          status: 'active',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0) {
          const u = res[0];
          if (u.role === 'teacher') {
            await this.query(\`teachers?email=eq.\${encodeURIComponent(u.email)}\`, 'PATCH', {
              status: 'Active',
              updated_at: new Date().toISOString()
            }).catch(() => {});
          } else if (u.role === 'student') {
            await this.query(\`students?email=eq.\${encodeURIComponent(u.email)}\`, 'PATCH', {
              status: 'Active',
              updated_at: new Date().toISOString()
            }).catch(() => {});
          }
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve user:', err.message);
        throw err;
      }
    }

    async rejectUser(userId, rejectedBy = 'Super Admin') {
      try {
        const res = await this.query(\`users?id=eq.\${encodeURIComponent(userId)}\`, 'PATCH', {
          status: 'rejected',
          approved_by: rejectedBy,
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject user:', err.message);
        throw err;
      }
    }

    /**
     * Authenticate user directly against Supabase users table with full institutional approval checks
     */
    async authenticate(email, password, orgId = null, role = null) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) return { success: false, error: 'Email is required' };

      try {
        let endpoint = \`users?email=eq.\${encodeURIComponent(cleanEmail)}\`;
        if (orgId) {
          endpoint += \`&org=eq.\${encodeURIComponent(orgId)}\`;
        }
        const users = await this.query(endpoint);
        if (!Array.isArray(users) || users.length === 0) {
          return { success: false, error: 'Account not found in institutional database. Please register.' };
        }

        const user = users[0];

        // 1. Password check
        const storedPass = user.pass_hash || user.password;
        if (storedPass && storedPass !== password) {
          return { success: false, error: 'Invalid password. Please re-enter.' };
        }

        // 2. Role check
        if (role && user.role && user.role.toLowerCase() !== role.toLowerCase() && user.role.toLowerCase() !== 'superadmin' && user.role.toLowerCase() !== 'admin') {
          return { success: false, error: \`Account role mismatch: expected \${role}, found \${user.role}.\` };
        }

        // 3. Organization Approval check (Super Admin approves organisations)
        if (user.role !== 'admin' && user.org && user.org !== 'FLAWLESS GRAPHICS') {
          const orgData = await this.getOrganization(user.org);
          if (orgData) {
            const orgStatus = (orgData.status || '').toLowerCase();
            if (orgStatus === 'pending_approval' || orgStatus === 'pending') {
              return {
                success: false,
                status: 'pending_org',
                error: \`Organisation '\${orgData.org_name || orgData.name}' is pending approval by Super Admin Command.\`
              };
            }
            if (orgStatus === 'rejected') {
              return {
                success: false,
                status: 'rejected_org',
                error: \`Organisation '\${orgData.org_name || orgData.name}' registration was declined.\`
              };
            }
          }
        }

        // 4. User Status Approval check
        const userStatus = (user.status || 'pending_approval').toLowerCase();
        if (userStatus === 'pending_approval' || userStatus === 'pending') {
          if (user.role === 'hr') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Super Admin',
              error: 'HR Account is awaiting Super Admin authorization. You will be able to sign in once approved.'
            };
          } else if (user.role === 'teacher') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Teacher account is awaiting approval by Human Resources. Please contact your HR Directorate.'
            };
          } else if (user.role === 'finance' || user.role === 'bursar') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Finance account is awaiting approval by Human Resources. Please contact your HR Directorate.'
            };
          } else if (user.role === 'student') {
            return {
              success: false,
              status: 'pending_approval',
              approvedByRole: 'Human Resources',
              error: 'Student admission is awaiting approval by Human Resources.'
            };
          } else {
            return {
              success: false,
              status: 'pending_approval',
              error: 'Account is pending administrative authorization.'
            };
          }
        }

        if (userStatus === 'rejected') {
          return {
            success: false,
            status: 'rejected',
            error: 'This account registration was declined.'
          };
        }

        return { success: true, user };
      } catch (err) {
        console.error('[Supabase] Authentication error:', err.message);
        return { success: false, error: err.message };
      }
    }

    /**
     * Sign up administrative or institutional account
     * Super admin seed is active, all others default to pending_approval
     */
    async signUp(email, password, metadata = {}) {
      const cleanEmail = (email || '').trim().toLowerCase();
      try {
        const role = (metadata.role || 'admin').toLowerCase();
        const isSuperAdminSeed = role === 'admin' && cleanEmail === 'admin@flawlessgraphics.com';
        const initialStatus = isSuperAdminSeed ? 'active' : 'pending_approval';

        const userRecord = await this.saveUser({
          email: cleanEmail,
          pass_hash: password,
          password: password,
          name: metadata.admin_name || metadata.name || cleanEmail.split('@')[0],
          org: metadata.org_name || 'FLAWLESS GRAPHICS',
          role: role,
          status: initialStatus
        });

        if (metadata.org_name) {
          await this.saveOrganization({
            org_name: metadata.org_name,
            name: metadata.org_name,
            admin_name: metadata.admin_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            logo_path: metadata.logo_path || null,
            status: isSuperAdminSeed ? 'Active' : 'pending_approval'
          }).catch(console.warn);
        }

        return {
          success: true,
          requiresVerification: false,
          user: userRecord,
          status: initialStatus,
          message: isSuperAdminSeed
            ? 'Root Super Admin account active.'
            : 'Registration submitted! Awaiting institutional approval.'
        };
      } catch (err) {
        console.error('[Supabase] Sign up error:', err.message);
        throw err;
      }
    }`;

if (!content.includes(targetSaveOrg)) {
  console.error('targetSaveOrg not found in ' + filePath);
  process.exit(1);
}
content = content.replace(targetSaveOrg, replacementSaveOrg);

if (!content.includes(targetSaveUserAndAuth)) {
  console.error('targetSaveUserAndAuth not found in ' + filePath);
  process.exit(1);
}
content = content.replace(targetSaveUserAndAuth, replacementSaveUserAndAuth);

// 3. Add Teacher & Student approval methods
const targetTeacherClass = `    async getTeachers(orgId = 'FLAWLESS GRAPHICS') {`;
const teacherApprovalsCode = `    async getPendingTeachers(orgId = null) {
      try {
        let endpoint = 'teachers?status=eq.pending_approval&order=created_at.desc';
        if (orgId) endpoint += \`&org_id=eq.\${encodeURIComponent(orgId)}\`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending teachers:', err.message);
        return [];
      }
    }

    async approveTeacher(teacherId, approvedBy = 'Human Resources') {
      try {
        const res = await this.query(\`teachers?id=eq.\${encodeURIComponent(teacherId)}\`, 'PATCH', {
          status: 'Active',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0 && res[0].email) {
          await this.query(\`users?email=eq.\${encodeURIComponent(res[0].email)}\`, 'PATCH', {
            status: 'active',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
          }).catch(() => {});
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve teacher:', err.message);
        throw err;
      }
    }

    async rejectTeacher(teacherId) {
      try {
        const res = await this.query(\`teachers?id=eq.\${encodeURIComponent(teacherId)}\`, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject teacher:', err.message);
        throw err;
      }
    }

    async getPendingStudents(orgId = null) {
      try {
        let endpoint = 'students?status=eq.pending_approval&order=created_at.desc';
        if (orgId) endpoint += \`&org_id=eq.\${encodeURIComponent(orgId)}\`;
        const data = await this.query(endpoint);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[Supabase] Failed to fetch pending students:', err.message);
        return [];
      }
    }

    async approveStudent(studentId, approvedBy = 'Human Resources') {
      try {
        const res = await this.query(\`students?id=eq.\${encodeURIComponent(studentId)}\`, 'PATCH', {
          status: 'Active',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });

        if (Array.isArray(res) && res.length > 0 && res[0].email) {
          await this.query(\`users?email=eq.\${encodeURIComponent(res[0].email)}\`, 'PATCH', {
            status: 'active',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
          }).catch(() => {});
        }
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to approve student:', err.message);
        throw err;
      }
    }

    async rejectStudent(studentId) {
      try {
        const res = await this.query(\`students?id=eq.\${encodeURIComponent(studentId)}\`, 'PATCH', {
          status: 'Rejected',
          updated_at: new Date().toISOString()
        }, { 'Prefer': 'return=representation' });
        return Array.isArray(res) && res.length > 0 ? res[0] : true;
      } catch (err) {
        console.error('[Supabase] Failed to reject student:', err.message);
        throw err;
      }
    }

    async getTeachers(orgId = 'FLAWLESS GRAPHICS') {`;

if (!content.includes(targetTeacherClass)) {
  console.error('targetTeacherClass not found in ' + filePath);
  process.exit(1);
}
content = content.replace(targetTeacherClass, teacherApprovalsCode);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated assets/js/supabase-client.js with approval hierarchy methods');
