import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const printPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const fullTaxLayout = read('src/features/bill/components/BillLayoutFullTax.jsx');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  /@page\s*\{[\s\S]*?size:\s*A4;[\s\S]*?margin:\s*10mm;/m.test(fullTaxLayout),
  'Full-tax layout must retain the explicit A4 10mm page margin authority.'
);
assert(
  printPage.includes('bill-print-page-shell'),
  'Full-tax print page must own a print-only page shell guard.'
);
assert(
  /\.bill-print-page-shell\s*\{[\s\S]*?min-height:\s*0\s*!important;/m.test(printPage),
  'Print shell must neutralize min-h-screen during paged printing.'
);
assert(
  /\.bill-print-root\s+\.print-a4\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?max-width:\s*190mm\s*!important;[\s\S]*?min-height:\s*calc\(297mm\s*-\s*20mm\)\s*!important;[\s\S]*?box-sizing:\s*border-box\s*!important;/m.test(printPage),
  'Full-tax A4 shell must fit the 190 x 277 mm printable area including its own padding/border.'
);
assert(
  printPage.includes('const printableGridRows = Math.max(12, itemCount)'),
  'Short full-tax documents must reserve the lower A4 area by limiting printed filler rows.'
);
assert(
  printPage.includes('return Math.max(20 - printableGridRows, 0)'),
  'Filler-row suppression must never exceed the legacy 20-row grid.'
);
assert(
  /tbody tr:nth-last-child\(-n\+\$\{printFillerRowsToHide\}\)[\s\S]*?display:\s*none\s*!important;/m.test(printPage),
  'Only computed trailing rows may be suppressed during print.'
);

console.log('Full Tax A4 Print Pagination Contract: PASS');
