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
  document.includes("@page { size: A4; margin: 0; }")
    && document.includes('width: 210mm !important;')
    && document.includes('height: 297mm !important;')
    && document.includes('padding: 6mm !important;')
    && document.includes('overflow: hidden !important;'),
  'Each printed full-tax sheet must own a fixed physical A4 box without browser margins.'
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
