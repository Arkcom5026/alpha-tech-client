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
  /\.bill-print-root \.print-a4\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?max-width:\s*100%\s*!important;[\s\S]*?box-sizing:\s*border-box\s*!important;/m.test(printPage),
  'Screen paper preview must contain the full-tax frame inside its paper area.'
);
assert(
  /\.bill-print-root \.print-a4 tbody tr:nth-last-child\(-n\+\$\{printFillerRowsToHide\}\)[\s\S]*?display:\s*none\s*!important;/m.test(printPage),
  'Screen preview and native print preview must use the same short-document filler-row capacity.'
);
assert(
  /\.bill-print-short-document \.print-a4\s*\{[\s\S]*?position:\s*relative\s*!important;[\s\S]*?height:\s*296mm\s*!important;[\s\S]*?padding:\s*10mm 10mm 58mm\s*!important;/m.test(printPage),
  'Short-document A4 geometry must be shared by the on-screen preview.'
);
assert(
  /\.bill-print-short-document \.print-a4 > table \+ div\s*\{[\s\S]*?left:\s*10mm\s*!important;[\s\S]*?right:\s*10mm\s*!important;[\s\S]*?top:\s*214mm\s*!important;/m.test(printPage),
  'Totals must occupy the same in-page zone before and during printing.'
);
assert(
  /\.bill-print-short-document \.print-a4 > table \+ div \+ div\s*\{[\s\S]*?top:\s*246mm\s*!important;[\s\S]*?height:\s*20mm\s*!important;/m.test(printPage),
  'Signatures must occupy the same in-page zone before and during printing.'
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
  /@media print\s*\{[\s\S]*?\.bill-print-root\s+\.print-a4\s*\{[\s\S]*?width:\s*210mm\s*!important;[\s\S]*?min-height:\s*296mm\s*!important;[\s\S]*?padding:\s*10mm\s*!important;[\s\S]*?border:\s*0\s*!important;/m.test(printPage),
  'Native print must keep the same physical A4 frame while removing only the screen paper border.'
);
assert(
  printPage.includes("p-0 rounded-2xl border border-zinc-200"),
  'The outer preview wrapper must not add padding that shrinks the document relative to print.'
);
assert(
  /const pinPrintFooter = useMemo\([\s\S]*?saleItems\.length <= 12/m.test(printPage),
  'Footer-zone mode must remain limited to short invoices.'
);
assert(
  !/position:\s*fixed\s*!important/.test(printPage),
  'Print footer zones must not use position:fixed because browsers may repeat them on every page.'
);

console.log('Full Tax A4 Preview/Print Parity Contract: PASS');
