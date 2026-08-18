import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const consolidatedBill = read('src/features/combinedBilling/pages/PrintConsolidatedBillPage.jsx');
const consolidatedTax = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');
const deliveryShell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  consolidatedBill.includes("import FullTaxA4Document from '@/features/bill/components/FullTaxA4Document'")
    && consolidatedBill.includes("if (kind === 'FULL') return <FullTaxA4Document")
    && !consolidatedBill.includes('BillLayoutFullTax'),
  'Consolidated FULL bills must use the shared deterministic A4 renderer instead of the legacy full-tax layout.'
);

assert(
  consolidatedTax.includes("import FullTaxA4Document from '@/features/bill/components/FullTaxA4Document'")
    && consolidatedTax.includes('return <FullTaxA4Document')
    && !consolidatedTax.includes('BillLayoutFullTax'),
  'Consolidated full tax documents must use the shared deterministic A4 renderer instead of the legacy full-tax layout.'
);

assert(
  deliveryShell.includes('a4-standard-delivery-shell')
    && deliveryShell.includes('@page { size: A4; margin: 4mm !important; }')
    && deliveryShell.includes('width: 201mm !important;')
    && deliveryShell.includes('height: 288mm !important;')
    && deliveryShell.includes('border: 0.3mm solid #444 !important;')
    && deliveryShell.includes('border-radius: 2.5mm !important;')
    && deliveryShell.includes('font-family: var(--document-font-family) !important;'),
  'Delivery-note A4 output must adopt the shared print-safe geometry, rounded frame, and document font authority.'
);

console.log('A4 Document Standardization Wave 1 Contract: PASS');
