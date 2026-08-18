import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = fs.readFileSync(path.join(__dirname, '../src/features/quotation/pages/QuotationPrintPage.jsx'), 'utf8');

const includes = (value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

includes("const showContactName = Boolean(", 'Quotation must decide whether contact name is meaningful before printing it');
includes("normalizedContactName !== normalizedRecipientName", 'Quotation must suppress contact name when it duplicates the printed customer name');
includes("normalizedContactName !== normalizedCustomerName", 'Quotation must suppress contact name when it duplicates the customer profile name');
includes("<strong>ที่อยู่:</strong> {quotation.customerAddress || '-'}", 'Quotation customer block must always carry the delivery-note address row');
includes("<strong>โทร:</strong> {quotation.customerPhone || '-'}", 'Quotation customer block must always carry the delivery-note phone row');
includes("<strong>เลขประจำตัวผู้เสียภาษี:</strong> {quotation.customerTaxId || '-'}", 'Quotation customer block must always carry the delivery-note tax id row');

if (source.includes("quotation.customerDepartment ? <p><strong>แผนก:</strong>")) {
  throw new Error('Quotation customer block must stay aligned with the delivery-note presentation standard');
}

console.log('Quotation Customer Block Delivery Standard Contract: PASS');
