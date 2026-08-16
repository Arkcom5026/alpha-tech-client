import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const filePath = path.resolve('src/features/tax/handoff/pages/TaxClosingHandoffPage.jsx');
const source = fs.readFileSync(filePath, 'utf8');

assert.match(source, /const finalizingRef = useRef\(false\)/, 'finalization must keep synchronous command ownership');
assert.match(source, /const branchIdSnapshot = Number\(branchId\)/, 'finalization must snapshot branch authority');
assert.match(source, /const taxPeriodIdSnapshot = taxPeriodId/, 'finalization must snapshot tax period authority');
assert.match(source, /const snapshotHashSnapshot = data\.snapshotHash/, 'finalization must snapshot expected closing hash');
assert.match(source, /return \{ ok: true, data: nextData, error: null \}/, 'handoff reload must expose successful refresh outcome');
assert.match(source, /return \{ ok: false, data: null, error: requestError \}/, 'handoff reload must expose failed refresh outcome');
assert.match(source, /refresh-after-finalize:error/, 'post-finalization refresh failure must use a distinct event key');
assert.match(source, /ยืนยัน Tax Closing Snapshot สำเร็จแล้ว แต่รีเฟรชชุดข้อมูลล่าสุดไม่สำเร็จ/, 'post-success refresh failure must not be reported as finalization failure');

const persistenceIndex = source.indexOf('result = await finalizeTaxClosingHandoffBundle');
const successIndex = source.indexOf("feedback.actionSuccess(\n        result?.replayed");
const refreshIndex = source.indexOf('const refreshResult = await load()');
assert.ok(persistenceIndex >= 0 && successIndex > persistenceIndex && refreshIndex > successIndex, 'finalization lifecycle must be persistence -> success -> refresh');

console.log('Tax Closing finalization partial-success authority contract: PASS');
