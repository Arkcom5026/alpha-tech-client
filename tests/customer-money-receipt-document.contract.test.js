import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const detail = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');
const printPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');

test('customer money receive detail opens a dedicated receipt document route', () => {
  assert.match(routes, /customer-money-receive\/:id\/print/);
  assert.match(routes, /CustomerMoneyReceiptPrintPage/);
  assert.match(detail, /navigate\(`\.\/print`\)/);
  assert.doesNotMatch(detail, /onClick=\{\(\) => window\.print\(\)\}/);
});

test('receipt document supports full A4 and short 80mm print modes', () => {
  assert.match(printPage, /mode === 'SHORT'/);
  assert.match(printPage, /80mm auto/);
  assert.match(printPage, /'A4'/);
  assert.match(printPage, /CUSTOMER MONEY RECEIPT/);
  assert.match(printPage, /record\.branch/);
  assert.match(printPage, /record\.receivedBy/);
  assert.match(printPage, /การรับเงินจริงจากลูกค้า/);
});
