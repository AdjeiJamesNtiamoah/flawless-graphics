const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== VERIFYING SUPER ADMINISTRATOR SECTION REMOVAL ===");

const files = ['register.html', 'registration.html'];

for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`\nChecking [${file}]...`);

    // 1. Assert Super Administrator section / stepper pills are absent
    assert.strictEqual(content.includes('stepPanel2'), false, `[${file}] should NOT contain stepPanel2`);
    assert.strictEqual(content.includes('stepPill2'), false, `[${file}] should NOT contain stepPill2`);
    assert.strictEqual(content.includes('Super Administrator'), false, `[${file}] should NOT contain "Super Administrator"`);
    assert.strictEqual(content.includes('Master Administrator Account'), false, `[${file}] should NOT contain "Master Administrator Account"`);
    assert.strictEqual(content.includes('validateAndGoToStep2'), false, `[${file}] should NOT contain validateAndGoToStep2`);
    assert.strictEqual(content.includes('checkPasswordStrength'), false, `[${file}] should NOT contain checkPasswordStrength`);

    console.log(`  ✓ No step 2 / Super Administrator / stepper panels found`);

    // 2. Assert streamlined single-step institution form fields are present
    assert.ok(content.includes('id="orgName"'), `[${file}] must include id="orgName"`);
    assert.ok(content.includes('id="orgId"'), `[${file}] must include id="orgId"`);
    assert.ok(content.includes('id="adminName"'), `[${file}] must include id="adminName"`);
    assert.ok(content.includes('id="orgEmail"'), `[${file}] must include id="orgEmail"`);
    assert.ok(content.includes('id="orgPhone"'), `[${file}] must include id="orgPhone"`);
    assert.ok(content.includes('id="submitBtn"'), `[${file}] must include id="submitBtn"`);

    console.log(`  ✓ All institutional registration fields (orgName, orgId, adminName, orgEmail, orgPhone) are present`);

    // 3. Assert register function submits directly as pending_approval to Supabase
    assert.ok(content.includes('saveOrganization'), `[${file}] must call saveOrganization`);
    assert.ok(content.includes("status: 'pending_approval'"), `[${file}] must set status: 'pending_approval'`);
    assert.ok(content.includes('Awaiting Super Admin Authorization'), `[${file}] must inform that registration awaits Super Admin authorization`);

    console.log(`  ✓ Submission directly routes to Supabase saveOrganization as pending_approval`);
}

console.log("\n>>> ALL ASSERTIONS PASSED SUCCESSFULLY! <<<");
