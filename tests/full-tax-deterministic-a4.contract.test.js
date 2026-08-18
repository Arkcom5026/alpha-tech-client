import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const document = read('src/features/bill/components/FullTaxA4Document.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  page.includes("import FullTaxA4Document from '@/features/bill/components/FullTaxA4Document'")
    && !page.includes('BillLayoutFullTax'),
  'Full-tax workspace must render the deterministic A4 document instead of the legacy auto-fragmenting layout.'
);

assert(
  document.includes('const MAX_ROWS_LAST_PAGE = 16;')
    && document.includes('const MAX_ROWS_NORMAL_PAGE = 24;')
    && document.includes('paginateItems(displayItems)'),
  'Full-tax A4 pagination must be decided before render with explicit last/normal page capacities.'
);

assert(
  document.includes('const PHYSICAL_PAGE_HEIGHT_MM = 296;')
    && document.includes('const PRINT_PAGE_MARGIN_MM = 4;')
    && document.includes('const PRINT_SHEET_WIDTH_MM = 201;')
    && document.includes('const PRINT_SHEET_HEIGHT_MM = 288;')
    && document.includes('@page { size: A4; margin: ${PRINT_PAGE_MARGIN_MM}mm; }')
    && document.includes('width: ${PRINT_SHEET_WIDTH_MM}mm !important;')
    && document.includes('height: ${PRINT_SHEET_HEIGHT_MM}mm !important;')
    && document.includes('min-height: ${PRINT_SHEET_HEIGHT_MM}mm !important;')
    && document.includes('padding: 5mm !important;')
    && document.includes('overflow: hidden !important;'),
  'Printed full-tax sheets must live inside an explicit print-safe A4 content box instead of touching physical paper edges.'
);

assert(
  document.includes('<div role="banner"')
    && !document.includes('<header className='),
  'Document identity must not use the global semantic header selector that the application hides during printing.'
);

assert(
  page.includes('full-tax-print-shell')
    && page.includes('full-tax-print-frame')
    && page.includes('min-height: 0 !important;')
    && page.includes('height: auto !important;')
    && page.includes('overflow: visible !important;'),
  'The surrounding application shell must collapse out of print pagination so it cannot create a trailing blank page.'
);

assert(
  document.includes("className=\"absolute bottom-[31mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-5 text-[13px]\"")
    && document.includes("className=\"absolute bottom-[5mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[15px]\""),
  'Totals and signatures must occupy reserved last-page zones instead of participating in browser fragmentation.'
);

assert(
  document.includes("pageBreakAfter: page.isLast ? 'auto' : 'always'")
    && document.includes("breakAfter: page.isLast ? 'auto' : 'page'"),
  'Multi-page full-tax output must define page boundaries explicitly.'
);

assert(
  document.includes('print:hidden')
    && document.includes('documentPrefix')
    && document.includes('documentSuffix')
    && document.includes('onSaveDocumentLine?.(item)'),
  'Deterministic A4 rendering must preserve the existing document-line editor workspace while hiding controls on paper.'
);

console.log('Full Tax Deterministic A4 Contract: PASS');
