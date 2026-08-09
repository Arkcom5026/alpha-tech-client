import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const listPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveListPage.jsx');
const createPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceivePage.jsx');
const detail = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');
const printPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');

test('customer money module follows list-first navigation standard', () => {
  assert.match(routes, /path: 'customer-money-receive'[\s\S]*CustomerMoneyReceiveListPage/);
  assert.match(routes, /path: 'create', element: <CustomerMoneyReceivePage/);
  assert.match(routes, /path: ':id', element: <CustomerMoneyReceiveDetailPage/);
  assert.match(routes, /path: ':id\/print', element: <CustomerMoneyReceiptPrintPage/);
  assert.match(listPage, /ประวัติการรับเงินจากลูกค้า/);
  assert.match(listPage, /navigate\('\.\/create'\)/);
  assert.match(listPage, /<Plus[^>]*\/>\s*รับเงิน/);
  assert.match(createPage, /กลับประวัติการรับเงิน/);
  assert.match(detail, /กลับรายการรับเงิน/);
});

test('history list provides operational search and document actions', () => {
  assert.match(listPage, /เลข CMR, ชื่อลูกค้า, Tax ID, เลขอ้างอิง/);
  assert.match(listPage, /ทุกสถานะ/);
  assert.match(listPage, /ทุกช่องทาง/);
  assert.match(listPage, /type="date"/);
  assert.match(listPage, /รายละเอียด/);
  assert.match(listPage, /พิมพ์/);
});

test('customer money receive detail opens a dedicated receipt document route', () => {
  assert.match(routes, /path: ':id\/print'/);
  assert.match(routes, /CustomerMoneyReceiptPrintPage/);
  assert.match(detail, /navigate\('\.\/print'\)/);
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
