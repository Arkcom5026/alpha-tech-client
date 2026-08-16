import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/features/tax/issuerProfile/pages/TaxIssuerProfilePage.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

const expectIncludes = (needle, label) => {
  if (!source.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
};

expectIncludes('const branchIdRef = useRef(branchId);', 'render-current branch authority ref');
expectIncludes('branchIdRef.current = branchId;', 'current branch synchronization');
expectIncludes('const branchIdSnapshot = Number(branchId);', 'immutable branch snapshot');
expectIncludes('if (!active || branchIdRef.current !== branchIdSnapshot) return;', 'stale read suppression');
expectIncludes('if (branchIdRef.current === branchIdSnapshot) {', 'save result branch reconciliation guard');
expectIncludes('บันทึกข้อมูลผู้ออกเอกสารภาษีของสาขาก่อนหน้าเรียบร้อยแล้ว', 'cross-branch success semantics');
expectIncludes('`tax-issuer-profile:${branchIdSnapshot}:save:success`', 'branch-specific save success key');
expectIncludes('`tax-issuer-profile:${branchIdSnapshot}:save:error`', 'branch-specific save error key');
expectIncludes('`tax-issuer-profile:${branchIdSnapshot}:load:error`', 'branch-specific load error key');

const staleLoadGuardCount = source.split('branchIdRef.current !== branchIdSnapshot').length - 1;
if (staleLoadGuardCount < 2) {
  throw new Error(`Expected stale branch guards around async load lifecycle, found ${staleLoadGuardCount}`);
}

console.log('Tax Issuer Profile Branch Authority Contract: PASS');
