import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const printPage = fs.readFileSync(
  path.join(root, 'src/features/quotation/pages/QuotationPrintPage.jsx'),
  'utf8',
);

if (printPage.includes('เงื่อนไขชำระเงิน:')) {
  throw new Error('Quotation top information panel must not repeat payment terms');
}

if (!printPage.includes('<QuotationPresentationFooter')) {
  throw new Error('Quotation payment/terms authority must remain in the presentation footer');
}

if (!printPage.includes('terms={quotationTerms}')) {
  throw new Error('Quotation footer must continue receiving resolved quotation terms');
}

console.log('Quotation Payment Terms Header Dedup Contract: PASS');
