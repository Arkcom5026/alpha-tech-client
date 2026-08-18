import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateQuotationTotals,
  isVatInclusiveQuotation,
} from '../src/features/quotation/utils/quotationPricing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const inclusive = calculateQuotationTotals({
  grossTotal: 1000,
  vatEnabled: true,
  vatRate: 7,
  vatInclusive: true,
});

if (inclusive.taxableBase !== 934.58) throw new Error(`Expected VAT-inclusive taxable base 934.58, received ${inclusive.taxableBase}`);
if (inclusive.vatAmount !== 65.42) throw new Error(`Expected extracted VAT 65.42, received ${inclusive.vatAmount}`);
if (inclusive.grandTotal !== 1000) throw new Error(`VAT-inclusive grand total must remain 1000, received ${inclusive.grandTotal}`);

const legacy = calculateQuotationTotals({
  grossTotal: 1000,
  vatEnabled: true,
  vatRate: 7,
  vatInclusive: false,
});
if (legacy.grandTotal !== 1070) throw new Error('Legacy issued snapshot compatibility must remain tax-exclusive');

if (!isVatInclusiveQuotation({ status: 'DRAFT' })) throw new Error('New draft quotations must use VAT-inclusive pricing');
if (!isVatInclusiveQuotation({ status: 'ISSUED', issuedSnapshot: { totals: { vatInclusive: true } } })) {
  throw new Error('Issued schema-v2 quotations must retain VAT-inclusive pricing authority');
}
if (isVatInclusiveQuotation({ status: 'ISSUED', issuedSnapshot: { totals: {} } })) {
  throw new Error('Legacy issued snapshots must preserve their original tax-exclusive presentation');
}

const editor = read('src/features/quotation/pages/QuotationEditorPage.jsx');
const printPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');
for (const source of [editor, printPage]) {
  for (const token of ['calculateQuotationTotals', 'isVatInclusiveQuotation']) {
    if (!source.includes(token)) throw new Error(`Quotation pricing integration missing: ${token}`);
  }
}

if (!editor.includes("(รวมในราคา)")) throw new Error('Quotation intake must label extracted VAT as included in price');
if (!printPage.includes("(รวมในราคา)")) throw new Error('Quotation print must label extracted VAT as included in price');
if (!printPage.includes('มูลค่าก่อนภาษี')) throw new Error('Quotation print must show pre-tax value extracted from inclusive price');

console.log('Quotation VAT-Inclusive Pricing Client Contract: PASS');
