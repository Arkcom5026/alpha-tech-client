import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagePath = path.join(root, 'src/features/tax/withholding/pages/WithholdingTaxWorkspacePage.jsx');
const source = fs.readFileSync(pagePath, 'utf8');

assert.match(source, /const mutationRef = useRef\(false\)/, 'WHT mutations must retain synchronous ownership');
assert.match(source, /return \{ ok: true, data: workspace, error: null \}/, 'load must expose successful refresh outcome');
assert.match(source, /return \{ ok: false, data: null, error: requestError \}/, 'load must expose failed refresh outcome');
assert.match(source, /const branchIdSnapshot = Number\(branchId\)/, 'mutation must snapshot branch authority');
assert.match(source, /const taxPeriodIdSnapshot = taxPeriodId/, 'mutation must snapshot tax-period authority');
assert.match(source, /await work\(\{ branchIdSnapshot, taxPeriodIdSnapshot \}\)/, 'persistent work must consume immutable authority snapshots');
assert.match(source, /feedback\.actionSuccess\(successMessage, `withholding-tax:\$\{taxPeriodIdSnapshot\}:\$\{key\}:success`\)/, 'success feedback must follow confirmed persistence');
assert.match(source, /const refreshResult = await load\(\)/, 'post-success reconciliation must remain explicit');
assert.match(source, /ดำเนินการ WHT สำเร็จแล้ว แต่รีเฟรชข้อมูล WHT ล่าสุดไม่สำเร็จ/, 'refresh failure must be communicated as partial success');
assert.match(source, /:refresh:error`/, 'partial-success feedback needs a dedicated event identity');
assert.match(source, /const referenceSnapshot = String\(references\[formTypeSnapshot\] \|\| ''\)\.trim\(\)/, 'filing evidence reference must be snapshotted before persistence');
assert.match(source, /const selectedFormSnapshot = first\.recommendedFormType \|\| manualForms\[taxExpenseIdSnapshot\]/, 'certificate form authority must be snapshotted before persistence');

console.log('Withholding Tax Partial-Success Authority Contract: PASS');
