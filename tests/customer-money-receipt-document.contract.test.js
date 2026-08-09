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
});

test('receipt document represents generic customer money and not debt allocation semantics', () => {
  assert.match(printPage, /รับเข้า Customer Money และยังไม่กำหนดการนำไปใช้/);
  assert.match(printPage, /เงินที่รับยังไม่ผูกกับยอดหนี้ ใบส่งของ การขาย หรือวัตถุประสงค์การใช้เงินใด ๆ/);
  assert.match(printPage, /ไม่ใช่ใบกำกับภาษี/);
  assert.doesNotMatch(printPage, /allocationId|saleId|deliveryId/);
});

test('receipt document includes legal presentation essentials', () => {
  assert.match(printPage, /เลขประจำตัวผู้เสียภาษี/);
  assert.match(printPage, /จำนวนเงินที่รับ/);
  assert.match(printPage, /thaiBahtText\(record\.amount\)/);
  assert.match(printPage, /ช่องทางรับเงิน/);
  assert.match(printPage, /เลขอ้างอิง/);
  assert.match(printPage, /ผู้ชำระเงิน \/ ผู้ส่งมอบเงิน/);
  assert.match(printPage, /ผู้รับเงิน/);
  assert.match(printPage, /ยกเลิกแล้ว \/ CANCELLED/);
});
