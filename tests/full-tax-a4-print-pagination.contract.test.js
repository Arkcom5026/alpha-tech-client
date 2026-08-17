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
  'Legacy full-tax layout may retain its 10mm page rule as a fallback.'
);
assert(
  /@page\s*\{[\s\S]*?size:\s*A4;[\s\S]*?margin:\s*0\s*!important;/m.test(printPage),
  'Full-tax print page must own the physical A4 sheet and neutralize external page margins.'
);
assert(
  /\.bill-print-page-shell\s*\{[\s\S]*?width:\s*210mm\s*!important;[\s\S]*?min-height:\s*0\s*!important;[\s\S]*?padding:\s*0\s*!important;/m.test(printPage),
  'Print shell must match physical A4 width without adding outer print padding.'
);
assert(
  /\.bill-print-root\s+\.print-a4\s*\{[\s\S]*?width:\s*210mm\s*!important;[\s\S]*?min-height:\s*296mm\s*!important;[\s\S]*?padding:\s*10mm\s*!important;[\s\S]*?box-sizing:\s*border-box\s*!important;[\s\S]*?border:\s*0\s*!important;[\s\S]*?border-radius:\s*0\s*!important;/m.test(printPage),
  'Physical A4 geometry must own internal margins without drawing a rasterized outer component border.'
);
assert(
  printPage.includes('const printableGridRows = Math.max(12, itemCount)'),
  'Short full-tax documents must reserve the lower A4 area by limiting printed filler rows.'
);
assert(
  /const pinPrintFooter = useMemo\([\s\S]*?saleItems\.length <= 12/m.test(printPage),
  'Footer-zone mode must be limited to short invoices.'
);
assert(
  /\.bill-print-short-document \.print-a4\s*\{[\s\S]*?position:\s*relative\s*!important;[\s\S]*?height:\s*296mm\s*!important;[\s\S]*?padding:\s*10mm 10mm 58mm\s*!important;/m.test(printPage),
  'Short invoices must reserve a deterministic lower A4 footer area inside the physical sheet.'
);
assert(
  /\.bill-print-short-document \.print-a4 > table \+ div\s*\{[\s\S]*?left:\s*10mm\s*!important;[\s\S]*?right:\s*10mm\s*!important;[\s\S]*?top:\s*214mm\s*!important;/m.test(printPage),
  'Totals must use the internal 10mm horizontal margin and fixed in-page zone.'
);
assert(
  /\.bill-print-short-document \.print-a4 > table \+ div \+ div\s*\{[\s\S]*?top:\s*246mm\s*!important;[\s\S]*?height:\s*20mm\s*!important;[\s\S]*?page-break-inside:\s*auto\s*!important;[\s\S]*?break-inside:\s*auto\s*!important;/m.test(printPage),
  'Signatures must stay inside the first physical A4 frame with explicit safety space.'
);
assert(
  !/position:\s*fixed\s*!important/.test(printPage),
  'Print footer zones must not use position:fixed because browsers may repeat them on every page.'
);

console.log('Full Tax A4 Print Pagination Contract: PASS');
