import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = fs.readFileSync(
  path.join(process.cwd(), 'src', 'features', 'tax', 'intake', 'components', 'TaxIntakeDocumentDetailPanel.jsx'),
  'utf8',
);

test('full output tax invoice UX mirrors backend recipient completeness rules', () => {
  assert.match(source, /projectFullTaxRecipientReadiness/);
  assert.match(source, /ชื่อผู้รับ\/ชื่อนิติบุคคล/);
  assert.match(source, /เลขประจำตัวผู้เสียภาษี 13 หลัก/);
  assert.match(source, /ที่อยู่จดทะเบียน/);
  assert.match(source, /รหัสสาขา 5 หลัก/);
  assert.match(source, /taxId\.length !== 13/);
  assert.match(source, /!\/\^\[0-9\]\{5\}\$\/\.test\(branchCode\)/);
});

test('full invoice action is disabled until recipient readiness passes while short remains available', () => {
  assert.match(source, /disabled=\{transitioning \|\| !fullTaxReadiness\.ready\}/);
  assert.match(source, /onClick=\{\(\) => onIssue\('FULL'\)\}/);
  assert.match(source, /onClick=\{\(\) => onIssue\('SHORT'\)\}/);
  assert.match(source, /ยังออกใบกำกับภาษีเต็มรูปไม่ได้/);
  assert.match(source, /ข้อมูลผู้รับสำหรับใบกำกับภาษีเต็มรูป/);
});
