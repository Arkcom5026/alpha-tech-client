import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const consolidatedBill = read('src/features/combinedBilling/pages/PrintConsolidatedBillPage.jsx');
const consolidatedTax = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');
const combinedRenderer = read('src/features/combinedBilling/bill/components/FullTaxA4Document.jsx');
const deliveryShell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');

const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  consolidatedBill.includes("import FullTaxA4Document from '../bill/components/FullTaxA4Document'")
    && consolidatedBill.includes("if (kind === 'FULL') return <FullTaxA4Document")
    && !consolidatedBill.includes("@/features/bill/components/FullTaxA4Document")
    && !consolidatedBill.includes('BillLayoutFullTax'),
  'Consolidated FULL bills must use the Combined Billing module-owned A4 renderer.'
);

assert(
  consolidatedTax.includes("import FullTaxA4Document from '../bill/components/FullTaxA4Document'")
    && consolidatedTax.includes('return <FullTaxA4Document')
    && !consolidatedTax.includes("@/features/bill/components/FullTaxA4Document")
    && !consolidatedTax.includes('BillLayoutFullTax'),
  'Consolidated full tax documents must use the Combined Billing module-owned A4 renderer.'
);

assert(
  combinedRenderer.includes('MAX_ROWS_LAST_PAGE = 20')
    && combinedRenderer.includes('PRINT_PAGE_MARGIN_MM = 4')
    && combinedRenderer.includes('PRINT_SHEET_WIDTH_MM = 201')
    && combinedRenderer.includes('PRINT_SHEET_HEIGHT_MM = 288'),
  'Combined Billing must own its deterministic A4 geometry and row capacity.'
);

assert(
  deliveryShell.includes('a4-standard-delivery-shell')
    && deliveryShell.includes('@page { size: A4; margin: 6mm !important; }')
    && deliveryShell.includes('width: 195mm !important;')
    && deliveryShell.includes('height: 280mm !important;')
    && deliveryShell.includes('max-height: 280mm !important;')
    && deliveryShell.includes('border: 0.3mm solid #444 !important;')
    && deliveryShell.includes('border-radius: 2.5mm !important;')
    && deliveryShell.includes('font-family: var(--document-font-family) !important;')
    && deliveryShell.includes('.dn-print-page:last-of-type'),
  'Delivery-note A4 output must retain module-owned hardware-printer-safe geometry without a trailing blank sheet.'
);

console.log('A4 Document Standardization Wave 1 Contract: PASS');
