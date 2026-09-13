const fs = require('fs');
const path = 'pages/finance/finance-dashboard.html';
let content = fs.readFileSync(path, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add financeStore and loadFinanceCloudData
const bootstrapAnchor = `    // BOOTSTRAP FINANCE PORTAL
    function bootstrapFinance() {`;

const replacementBootstrap = `    // In-Memory Finance Repository (Pure Supabase System of Record)
    const financeStore = {
      payroll: [],
      studentFees: [],
      scholarships: [],
      audit: []
    };

    async function loadFinanceCloudData() {
      if (!window.SupabaseService) return;
      const activeOrg = localStorage.getItem('active_org') || 'FLAWLESS GRAPHICS';
      try {
        const fees = await window.SupabaseService.getStudentFees(activeOrg);
        financeStore.studentFees = Array.isArray(fees) ? fees : [];

        const payroll = await window.SupabaseService.getPayroll(activeOrg);
        financeStore.payroll = Array.isArray(payroll) ? payroll : [];

        const txs = await window.SupabaseService.getTransactions(activeOrg);
        financeStore.scholarships = Array.isArray(txs) ? txs : [];

        const stream = await window.SupabaseService.getActivityStream(activeOrg);
        financeStore.audit = Array.isArray(stream) ? stream : [];
      } catch (err) {
        console.warn('[Finance Supabase] Load error:', err);
      }
    }

    // BOOTSTRAP FINANCE PORTAL
    async function bootstrapFinance() {
      await loadFinanceCloudData();`;

content = content.replace(bootstrapAnchor, replacementBootstrap);

// 2. Remove default seed into localStorage
content = content.replace(
  /if \(!localStorage\.getItem\('fg_payroll'\)\) \{[\s\S]*?localStorage\.setItem\('fg_audit', JSON\.stringify\(auditLogs\)\);\s*\}/,
  `// Entity data loaded directly from Supabase Cloud`
);

// 3. Replace all JSON.parse(localStorage.getItem('fg_student_fees')) with financeStore.studentFees
content = content.replace(
  /JSON\.parse\(localStorage\.getItem\('fg_student_fees'\)\) \|\| \[\]/g,
  `financeStore.studentFees`
);

// 4. Replace all JSON.parse(localStorage.getItem('fg_payroll')) with financeStore.payroll
content = content.replace(
  /JSON\.parse\(localStorage\.getItem\('fg_payroll'\)\) \|\| \[\]/g,
  `financeStore.payroll`
);

// 5. Replace all JSON.parse(localStorage.getItem('fg_scholarships')) with financeStore.scholarships
content = content.replace(
  /JSON\.parse\(localStorage\.getItem\('fg_scholarships'\)\) \|\| \[\]/g,
  `financeStore.scholarships`
);

// 6. Replace all JSON.parse(localStorage.getItem('fg_audit')) with financeStore.audit
content = content.replace(
  /JSON\.parse\(localStorage\.getItem\('fg_audit'\)\) \|\| \[\]/g,
  `financeStore.audit`
);

// 7. Replace saves for student_fees
content = content.replace(
  /localStorage\.setItem\('fg_student_fees', JSON\.stringify\(feeData\)\);/g,
  `financeStore.studentFees = feeData;
      if (window.SupabaseService) {
        const lastFee = feeData[0];
        if (lastFee) window.SupabaseService.saveStudentFee(activeOrg, lastFee).catch(console.warn);
      }`
);

// 8. Replace saves for payroll
content = content.replace(
  /localStorage\.setItem\('fg_payroll', JSON\.stringify\(payrollData\)\);/g,
  `financeStore.payroll = payrollData;
      if (window.SupabaseService) {
        const lastPay = payrollData[0];
        if (lastPay) window.SupabaseService.savePayroll(activeOrg, lastPay).catch(console.warn);
      }`
);

// 9. Replace saves for scholarships
content = content.replace(
  /localStorage\.setItem\('fg_scholarships', JSON\.stringify\(schData\)\);/g,
  `financeStore.scholarships = schData;`
);

// 10. Replace saves for audit
content = content.replace(
  /localStorage\.setItem\('fg_audit', JSON\.stringify\(logs\)\);/g,
  `financeStore.audit = logs;
      if (window.SupabaseService) {
        const lastLog = logs[0];
        if (lastLog) window.SupabaseService.logActivity(activeOrg, { type: 'FINANCE', text: \`\${lastLog.action || 'Audit'}: \${lastLog.desc || ''}\` }).catch(console.warn);
      }`
);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully migrated finance-dashboard.html to pure Supabase data access!');
