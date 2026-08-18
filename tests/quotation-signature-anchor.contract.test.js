import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const source = fs.readFileSync(path.join(root, 'src/features/quotation/pages/QuotationPrintPage.jsx'), 'utf8');

const includes = (value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

includes('quotation-a4 relative', 'A4 quotation frame must establish the positioning context for absolute signatures');
includes('.quotation-a4 { position: relative;', 'Quotation A4 positioning context must also be explicit in document CSS');
includes('quotation-signatures absolute bottom-[5mm] left-[8mm] right-[8mm]', 'Quotation signatures must remain anchored inside the A4 frame');
includes('body .quotation-signatures { position: absolute !important; left: 8mm !important; right: 8mm !important; bottom: 5mm !important; }', 'Print layout must preserve the same signature anchor inside A4');

console.log('Quotation Signature Anchor Contract: PASS');