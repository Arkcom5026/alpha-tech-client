const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx'),
  'utf8',
);

const requiredFragments = [
  'const advanceMutationRef = useRef(false);',
  'if (advanceMutationRef.current) return;',
  'const advanceFormSnapshot = { ...advanceForm };',
  'const allocationsSnapshot = advanceSelection.map((item) => ({',
  'const availableAmountSnapshot = Number(reviewAmount);',
  'const reasonSnapshot = advanceVoidReason.trim();',
  'const refresh = await load({ reportError: false });',
  'advance:create:refresh:error',
  'apply:refresh:error',
  'activate:refresh:error',
  'void:refresh:error',
];

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Supplier Advance authority contract missing: ${fragment}`);
  }
}

const directLegacySuccess = [
  "toast.success('บันทึกเงินจ่ายล่วงหน้า Supplier แล้ว')",
  "toast.success('นำ Advance ไปตัดยอดเจ้าหนี้แล้ว')",
  "toast.success('รับรองยอด Advance เดิมแล้ว')",
  "toast.success('ยกเลิก Advance และย้อนยอดที่จัดสรรแล้ว')",
];

for (const fragment of directLegacySuccess) {
  if (source.includes(fragment)) {
    throw new Error(`Supplier Advance still uses legacy success boundary: ${fragment}`);
  }
}

console.log('Supplier Advance Partial-Success Authority Contract: PASS');
