import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx');
const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  shell.includes('purchase-order-a4-page')
    && shell.includes('@page { size: A4; margin: 4mm; }')
    && shell.includes('width: 201mm !important;')
    && shell.includes('height: 288mm !important;')
    && shell.includes('border: 0.3mm solid #444 !important;')
    && shell.includes('border-radius: 2.5mm !important;')
    && shell.includes('var(--document-font-family')
    && shell.includes('role="banner"')
    && shell.includes('position: relative !important;'),
  'Purchase Order A4 must own its print-safe geometry, rounded frame, TH Sarabun-first typography, and semantic-safe banner inside the purchaseOrder module.'
);

assert(
  shell.includes('w-[49%]')
    && shell.includes('w-[17%]')
    && shell.includes('signature-space absolute bottom-[8mm]'),
  'Purchase Order A4 must preserve a description-first table and a reserved signature zone inside its own sheet.'
);

assert(
  page.includes('const A4_SAFE_MARGIN_IN = 4 / 25.4;')
    && page.includes('margin: A4_SAFE_MARGIN_IN')
    && page.includes("format: 'a4'")
    && page.includes('PurchaseOrderPrintShell'),
  'Purchase Order PDF export must use the same 4mm paper boundary as browser print while retaining the module-owned shell.'
);

assert(
  !shell.includes('@/features/bill/')
    && !shell.includes('@/features/customerReceipt/')
    && !shell.includes('@/features/combinedBilling/'),
  'Purchase Order A4 renderer must not depend on document renderers from other feature modules.'
);

console.log('A4 Document Standardization Wave 3 Contract: PASS');
