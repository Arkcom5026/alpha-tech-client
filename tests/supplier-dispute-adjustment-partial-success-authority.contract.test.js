import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(here, '../src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx'),
  'utf8',
);

const mustInclude = [
  'const disputeMutationRef = useRef(false);',
  'if (disputeMutationRef.current) return;',
  'const formSnapshot = { ...disputeForm };',
  'const formSnapshot = { ...adjustmentForm };',
  'const formSnapshot = { ...resolutionForm };',
  'const reasonSnapshot = adjustmentVoidReason.trim();',
  'disputeMutationRef.current = true;',
  'const refresh = await load({ reportError: false });',
  'supplier-payable:${payableIdSnapshot}:dispute:open:success',
  'supplier-payable:${payableIdSnapshot}:dispute:open:refresh:error',
  'supplier-payable:${payableIdSnapshot}:adjustment:create:success',
  'supplier-payable:${payableIdSnapshot}:adjustment:create:refresh:error',
  'supplier-payable:dispute:${disputeIdSnapshot}:resolve:success',
  'supplier-payable:dispute:${disputeIdSnapshot}:resolve:refresh:error',
  'supplier-payable:adjustment:${adjustmentIdSnapshot}:void:success',
  'supplier-payable:adjustment:${adjustmentIdSnapshot}:void:refresh:error',
  'disputeMutationRef.current = false;',
];

for (const needle of mustInclude) {
  if (!source.includes(needle)) {
    throw new Error(`Supplier dispute/adjustment authority contract missing: ${needle}`);
  }
}

console.log('Supplier Dispute Adjustment Partial-Success Authority Contract: PASS');
