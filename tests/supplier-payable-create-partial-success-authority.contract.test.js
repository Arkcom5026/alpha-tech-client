import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(here, '../src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx'),
  'utf8',
);

const mustInclude = [
  'const payableMutationRef = useRef(false);',
  'if (payableMutationRef.current || !selected.length) return;',
  'const supplierIdSnapshot = selectedSupplierId;',
  'const receiptIdsSnapshot = [...selectedIds];',
  'const formSnapshot = { ...form };',
  'payableMutationRef.current = true;',
  'receiptIds: receiptIdsSnapshot,',
  '...formSnapshot,',
  'supplier-payable:${supplierIdSnapshot}:payable:create:success',
  'const refresh = await load({ reportError: false });',
  'supplier-payable:${supplierIdSnapshot}:payable:create:refresh:error',
  'supplier-payable:${supplierIdSnapshot}:payable:create:error',
  'payableMutationRef.current = false;',
  'disabled={saving}',
  '<fieldset disabled={saving}',
];

for (const needle of mustInclude) {
  if (!source.includes(needle)) {
    throw new Error(`Supplier payable create authority contract missing: ${needle}`);
  }
}

console.log('Supplier Payable Create Partial-Success Authority Contract: PASS');
