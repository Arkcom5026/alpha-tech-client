import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const sourcePath = path.resolve(
  process.cwd(),
  'src/features/tax/settlement/components/VatCarryForwardAuthorityPanel.jsx',
);
const source = fs.readFileSync(sourcePath, 'utf8');

const requireMatch = (pattern, message) => {
  if (!pattern.test(source)) throw new Error(message);
};

requireMatch(
  /const savingRef = useRef\(false\);/,
  'carry-forward confirmation must keep synchronous mutation ownership',
);

requireMatch(
  /const branchIdSnapshot = branchId;[\s\S]*const taxPeriodIdSnapshot = taxPeriodId;/,
  'carry-forward confirmation must snapshot authority identity before persistence',
);

requireMatch(
  /return \{ ok: true, data, error: null \};[\s\S]*return \{ ok: false, data: null, error: requestError \};/,
  'authority refresh must expose an observable success/failure result',
);

requireMatch(
  /await confirmVatCarryForwardAuthority\(payload\);[\s\S]*feedback\.actionSuccess\([\s\S]*const refreshResult = await load\(\);/,
  'persistence success must be acknowledged before post-success refresh',
);

requireMatch(
  /tax-vat-carry-forward:\$\{branchIdSnapshot\}:\$\{taxPeriodIdSnapshot\}:refresh:error/,
  'refresh-after-confirm failure must have a dedicated partial-success event key',
);

requireMatch(
  /ยืนยันเครดิต VAT ยกมาสำเร็จแล้ว แต่รีเฟรช Authority ล่าสุดไม่สำเร็จ/,
  'refresh-after-confirm failure must tell the user persistence already succeeded',
);

requireMatch(
  /finally \{\s*savingRef\.current = false;\s*setSaving\(false\);\s*\}/,
  'mutation ownership must remain held through post-success refresh lifecycle',
);

const earlyRelease = /await confirmVatCarryForwardAuthority\(payload\);[\s\S]{0,700}?finally \{\s*savingRef\.current = false;\s*setSaving\(false\);\s*\}[\s\S]{0,250}?feedback\.actionSuccess/;
if (earlyRelease.test(source)) {
  throw new Error('carry-forward confirmation must not release ownership before success and refresh handling');
}

console.log('VAT Carry-forward Partial-success Authority Contract: PASS');
