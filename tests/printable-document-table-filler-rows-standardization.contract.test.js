import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const includes = (source, token, message) => {
  if (!source.includes(token)) throw new Error(message || `Expected token: ${token}`);
};
const excludes = (source, token, message) => {
  if (source.includes(token)) throw new Error(message || `Unexpected token: ${token}`);
};

const quotation = read('src/features/quotation/pages/QuotationPrintPage.jsx');
const deliveryNote = read('src/features/deliveryNote/components/DeliveryNoteForm.jsx');
const fullTax = read('src/features/bill/components/FullTaxA4Document.jsx');
const consolidatedFullTax = read('src/features/combinedBilling/bill/components/FullTaxA4Document.jsx');

for (const token of [
  'const QUOTATION_TABLE_TARGET_ROWS = 18;',
  'const QUOTATION_FILLER_ROW_HEIGHT_MM = 6;',
  'const quotationFillerRowCount = (items = []) =>',
  'const fillerRowCount = quotationFillerRowCount(items);',
  'Array.from({ length: fillerRowCount }',
  'className="quotation-table-filler-row"',
]) includes(quotation, token, `Quotation filler-row standard missing: ${token}`);

excludes(
  quotation,
  'tableFillerHeightMm',
  'Quotation must not use one oversized filler row after filler-row standardization',
);
excludes(
  quotation,
  'className="quotation-table-filler"',
  'Legacy single oversized quotation filler row must be retired',
);

for (const source of [deliveryNote, fullTax, consolidatedFullTax]) {
  includes(source, 'const emptyRowCount = Math.max(', 'A4 item table must calculate presentation-only empty rows');
  includes(source, 'Array(emptyRowCount)', 'A4 item table must render repeated physical empty rows');
}

for (const source of [quotation, deliveryNote, fullTax, consolidatedFullTax]) {
  excludes(source, 'createProduct(', 'Filler rows must never create product data');
  excludes(source, 'reserveStock(', 'Filler rows must never reserve stock');
  excludes(source, 'deductStock(', 'Filler rows must never deduct stock');
}

console.log('Printable Document Table Filler Rows Standardization Contract: PASS');
