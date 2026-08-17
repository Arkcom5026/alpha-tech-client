import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const printPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const layout = read('src/features/bill/components/BillLayoutFullTax.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  /@page\s*\{[\s\S]*?size:\s*A4;[\s\S]*?margin:\s*10mm;/m.test(layout),
  'Main-baseline BillLayoutFullTax must retain its A4 10mm page authority.'
);

assert(
  layout.includes('const maxRowCount = 20;'),
  'Main-baseline 20-row document preview must remain unchanged.'
);

assert(
  printPage.includes('const printableGridRows = Math.max(16, itemCount)'),
  'Printed short invoices must trim only enough trailing filler rows to reserve the footer area.'
);

assert(
  /\.bill-print-root \.print-a4\s*\{[\s\S]*?width:\s*190mm\s*!important;[\s\S]*?max-width:\s*190mm\s*!important;[\s\S]*?min-height:\s*277mm\s*!important;[\s\S]*?box-sizing:\s*border-box\s*!important;/m.test(printPage),
  'Printed full-tax shell must fit the A4 printable box created by 10mm page margins.'
);

assert(
  /tbody tr:nth-last-child\(-n\+\$\{printFillerRowsToHide\}\)[\s\S]*?display:\s*none\s*!important;/m.test(printPage),
  'Only computed trailing filler rows may be suppressed on paper.'
);

assert(
  !printPage.includes('position: absolute !important'),
  'Main-baseline pagination fix must not pin totals or signatures with absolute positioning.'
);

assert(
  !printPage.includes('margin: 0 !important;\n          }\n\n          html, body'),
  'Main-baseline pagination fix must not replace the layout page-margin authority.'
);

console.log('Full Tax Main-Baseline A4 Print Contract: PASS');
