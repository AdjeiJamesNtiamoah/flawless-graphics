const fs = require('fs');
const path = 'pages/finance/finance-login.html';

let content = fs.readFileSync(path, 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

// 1. First finance registration block
const targetBlock1 = `      photo_url: currentFinancePhotoBase64 || null,${nl}      status: 'active'${nl}    };${nl}${nl}    if (window.SupabaseService) {${nl}      window.SupabaseService.saveUser(financeRecord).catch(console.warn);${nl}    }${nl}${nl}    closeFinanceOtpModal();${nl}    setMode(false);${nl}    showSuccess('Registration submitted! Your Finance account is active. You can now sign in.');${nl}${nl}    if (window.Toaster) {${nl}      window.Toaster.success('Account Ready', 'Your Finance account registration is active. You can now sign in.');${nl}    }`;

const replBlock1 = `      photo_url: currentFinancePhotoBase64 || null,${nl}      status: 'pending_approval'${nl}    };${nl}${nl}    if (window.SupabaseService) {${nl}      window.SupabaseService.saveUser(financeRecord).catch(console.warn);${nl}    }${nl}${nl}    closeFinanceOtpModal();${nl}    setMode(false);${nl}    showSuccess('Registration submitted successfully! Your account is awaiting Human Resources authorization.');${nl}${nl}    if (window.Toaster) {${nl}      window.Toaster.info('Registration Submitted', 'Your Finance account is awaiting Human Resources authorization.');${nl}    }`;

if (content.includes(targetBlock1)) {
  content = content.replace(targetBlock1, replBlock1);
  console.log('Block 1 replaced successfully.');
} else {
  console.warn('Block 1 target not found!');
}

// 2. Second finance registration block
const targetBlock2 = `        photo_url: currentFinancePhotoBase64 || null,${nl}        status: 'active'${nl}      };${nl}${nl}      if (window.RealtimeAuth) {${nl}        window.RealtimeAuth.openAuthModal({${nl}          email: hrEmail,${nl}          purpose: 'Finance Account Registration',${nl}          durationSeconds: 300,${nl}          onVerified: async () => {${nl}            if (window.SupabaseService) {${nl}              await window.SupabaseService.saveUser(financeRecord).catch(console.warn);${nl}            }${nl}            setMode(false);${nl}            showSuccess('Registration submitted! Your Finance account is active. You can now sign in.');${nl}            if (window.Toaster) {${nl}              window.Toaster.success('Account Ready', 'Your Finance account registration is active. You can now sign in.');${nl}            }${nl}          }${nl}        });`;

const replBlock2 = `        photo_url: currentFinancePhotoBase64 || null,${nl}        status: 'pending_approval'${nl}      };${nl}${nl}      if (window.RealtimeAuth) {${nl}        window.RealtimeAuth.openAuthModal({${nl}          email: hrEmail,${nl}          purpose: 'Finance Account Registration',${nl}          durationSeconds: 300,${nl}          onVerified: async () => {${nl}            if (window.SupabaseService) {${nl}              await window.SupabaseService.saveUser(financeRecord).catch(console.warn);${nl}            }${nl}            setMode(false);${nl}            showSuccess('Registration submitted successfully! Your account is awaiting Human Resources authorization.');${nl}            if (window.Toaster) {${nl}              window.Toaster.info('Registration Submitted', 'Your Finance account is awaiting Human Resources authorization.');${nl}            }${nl}          }${nl}        });`;

if (content.includes(targetBlock2)) {
  content = content.replace(targetBlock2, replBlock2);
  console.log('Block 2 replaced successfully.');
} else {
  console.warn('Block 2 target not found!');
}

// 3. Watch pending approval during sign in
const targetSignIn = `        if (authRes.success) {${nl}          matchedUser = authRes.user;${nl}        } else {${nl}          submitBtn.disabled = false;${nl}          submitBtn.innerHTML = \`<span>Sign In to Finance Dashboard</span> <i class="fa-solid fa-arrow-right"></i>\`;${nl}          showError(authRes.error || 'Account not found in institutional database. Please register.');${nl}          return;${nl}        }`;

const replSignIn = `        if (authRes.success) {${nl}          matchedUser = authRes.user;${nl}        } else {${nl}          submitBtn.disabled = false;${nl}          submitBtn.innerHTML = \`<span>Sign In to Finance Dashboard</span> <i class="fa-solid fa-arrow-right"></i>\`;${nl}          const errMsg = authRes.error || 'Account not found in institutional database. Please register.';${nl}          if (authRes.status === 'pending_approval' && window.RealtimeAuth) {${nl}            window.RealtimeAuth.watchPendingApproval({${nl}              email: lowerEmail,${nl}              role: 'finance',${nl}              org: selectedOrgName,${nl}              targetUrl: 'finance-dashboard.html'${nl}            });${nl}          }${nl}          showError(errMsg);${nl}          return;${nl}        }`;

if (content.includes(targetSignIn)) {
  content = content.replace(targetSignIn, replSignIn);
  console.log('Sign in block replaced successfully.');
} else {
  console.warn('Sign in target not found!');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully written pages/finance/finance-login.html');
