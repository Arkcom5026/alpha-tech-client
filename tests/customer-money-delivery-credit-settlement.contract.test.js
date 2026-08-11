import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const sidebar = read('src/config/sidebarFinanceItems.js');
const listPage = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementListPage.jsx');
const createPage = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx');
const detailPage = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementDetailPage.jsx');
const printPage = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');
const api = read('src/features/customerMoneySettlement/api/deliveryCreditSettlementApi.js');
const receiveListPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveListPage.jsx');
const receiveDetailPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');

test('delivery credit settlement follows list-first project standard', () => {
  assert.match(sidebar, /ตัดยอดใบส่งของเครดิต/);
  assert.match(routes, /path: 'customer-money-settlements'[\s\S]*DeliveryCreditSettlementListPage/);
  assert.match(routes, /path: 'create', element: <DeliveryCreditSettlementCreatePage/);
  assert.match(routes, /path: ':id', element: <DeliveryCreditSettlementDetailPage/);
  assert.match(routes, /path: ':id\/print', element: <DeliveryCreditSettlementPrintPage/);
  assert.match(listPage, /ประวัติการตัดยอดใบส่งของเครดิต/);
  assert.match(listPage, /navigate\('\.\/create'\)/);
});

test('create workspace uses customer money and item-level partial selections', () => {
  assert.match(createPage, /Customer Money พร้อมใช้/);
  assert.match(createPage, /workspace\.sales/);
  assert.match(createPage, /sale\.lines/);
  assert.match(createPage, /saleItemId/);
  assert.match(createPage, /lineType/);
  assert.match(createPage, /ยอดที่จะตัด/);
  assert.match(createPage, /remainingCustomerMoney/);
  assert.match(createPage, /createDeliveryCreditSettlement/);
  assert.match(createPage, /ยืนยันตัดยอดใบส่งของ/);
});

test('create workspace caps combined line selections by sale outstanding and customer money', () => {
  assert.match(createPage, /usedByOtherLines/);
  assert.match(createPage, /usedByOtherSelections/);
  assert.match(createPage, /remainingSaleCapacity/);
  assert.match(createPage, /remainingCustomerMoney/);
  assert.match(createPage, /Math\.min\(Number\(line\.remainingAmount \?\? line\.lineAmount\), remainingSaleCapacity, remainingCustomerMoney\)/);
});

test('create workspace can select or clear one whole delivery note in a single action', () => {
  assert.match(createPage, /const selectWholeSale = \(sale\)/);
  assert.match(createPage, /const clearWholeSale = \(saleId\)/);
  assert.match(createPage, /remainingSaleCapacity = Number\(sale\.outstandingAmount \|\| 0\)/);
  assert.match(createPage, /Math\.min\(remainingLineAmount, remainingSaleCapacity\)/);
  assert.match(createPage, /เลือกทั้งใบ/);
  assert.match(createPage, /ล้างทั้งใบ/);
  assert.match(createPage, /เลือกแล้ว ฿\{money\(saleSelectedAmount\)\}/);
});

test('whole-note action fails closed in the UI when remaining customer money cannot cover the note', () => {
  assert.match(createPage, /selectedOutsideSale/);
  assert.match(createPage, /customerMoneyAvailableForSale/);
  assert.match(createPage, /const canSelectWholeSale/);
  assert.match(createPage, /disabled=\{!isWholeSaleSelected && !canSelectWholeSale\}/);
  assert.match(createPage, /เงินไม่พอทั้งใบ/);
  assert.match(createPage, /Customer Money ที่เหลือไม่พอสำหรับตัดยอดทั้งใบ/);
});

test('settlement submit uses a durable idempotency key and reuses it after an uncertain response', () => {
  assert.match(createPage, /useRef/);
  assert.match(createPage, /submitKeyRef/);
  assert.match(createPage, /createCommandKey/);
  assert.match(createPage, /submitKeyRef\.current \|\| createCommandKey\(\)/);
  assert.match(createPage, /createDeliveryCreditSettlement\([\s\S]*idempotencyKey\)/);
  assert.match(createPage, /invalidateSubmitKey/);
  assert.match(api, /X-Idempotency-Key/);
});

test('history detail print and cancellation use the isolated settlement API', () => {
  assert.match(listPage, /listDeliveryCreditSettlements/);
  assert.match(detailPage, /getDeliveryCreditSettlement/);
  assert.match(detailPage, /cancelDeliveryCreditSettlement/);
  assert.match(detailPage, /ยกเลิกเอกสาร/);
  assert.match(detailPage, /ยืนยันยกเลิกเอกสาร/);
  assert.match(detailPage, /navigate\('\.\/print'\)/);
  assert.match(printPage, /80mm auto/);
  assert.match(printPage, /window\.print\(\)/);
  assert.match(printPage, /CANCELLED/);
  assert.match(api, /customer-money-settlements\/delivery-credit/);
  assert.match(api, /eligible-sales/);
  assert.match(api, /\$\{BASE_PATH\}\/\$\{id\}\/cancel/);
  assert.doesNotMatch(api, /customer-receipts/);
});

test('cancelled settlements remain auditable in list detail and print projections', () => {
  assert.match(listPage, /statusLabel/);
  assert.match(listPage, /ยกเลิกแล้ว/);
  assert.match(detailPage, /record\.status === 'CANCELLED'/);
  assert.match(detailPage, /record\.cancelReason/);
  assert.match(detailPage, /record\.cancelledAt/);
  assert.match(printPage, /record\.status === 'CANCELLED'/);
  assert.match(printPage, /เหตุผลการยกเลิก/);
});

test('fully allocated source receipts are visibly distinct from available receipts', () => {
  assert.match(receiveListPage, /FULLY_ALLOCATED/);
  assert.match(receiveListPage, /ใช้ครบแล้ว/);
  assert.match(receiveListPage, /row\.remainingAmount/);
  assert.match(receiveDetailPage, /isFullyAllocated/);
  assert.match(receiveDetailPage, /Customer Money จากใบรับเงินนี้ถูกนำไปใช้ครบแล้ว/);
  assert.match(receiveDetailPage, /record\.remainingAmount/);
  assert.match(receiveDetailPage, /record\.status === 'ACTIVE'/);
});

test('fully paid active sales hand off to the existing document workspace instead of creating tax documents here', () => {
  assert.match(detailPage, /payment\?\.taxDocumentReady/);
  assert.match(detailPage, /พร้อมนำไปรวมเอกสาร/);
  assert.match(detailPage, /Document Workspace/);
  assert.match(detailPage, /combined-billing/);
  assert.doesNotMatch(detailPage, /taxDocument\.create|taxInvoice\.create/);
});

test('flow explicitly avoids new stock movement semantics', () => {
  assert.match(createPage, /ไม่สร้าง stock movement ใหม่/);
  assert.match(detailPage, /ไม่สร้างการเคลื่อนไหวสินค้าและไม่ตัดสต๊อกซ้ำ/);
  assert.match(printPage, /ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ/);
  assert.doesNotMatch(`${createPage}\n${detailPage}\n${printPage}`, /stockItem\.update|stockMovement|inventoryMutation/);
});