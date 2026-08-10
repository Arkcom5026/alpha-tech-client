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
const saleDocumentRoute = read('src/features/sales/documents/saleDocumentRoute.js');

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
  assert.match(createPage, /selectedTotal > balance/);
  assert.match(createPage, /createDeliveryCreditSettlement/);
  assert.match(createPage, /ยืนยันตัดยอดใบส่งของ/);
});

test('history detail and print use the isolated settlement API', () => {
  assert.match(listPage, /listDeliveryCreditSettlements/);
  assert.match(detailPage, /getDeliveryCreditSettlement/);
  assert.match(detailPage, /navigate\('\.\/print'\)/);
  assert.match(printPage, /80mm auto/);
  assert.match(printPage, /window\.print\(\)/);
  assert.match(api, /customer-money-settlements\/delivery-credit/);
  assert.match(api, /eligible-sales/);
  assert.doesNotMatch(api, /customer-receipts/);
});

test('fully paid sales reuse the existing short and full tax document routes', () => {
  assert.match(detailPage, /resolveSaleDocumentRoute/);
  assert.match(detailPage, /payment\?\.taxDocumentReady/);
  assert.match(detailPage, /ใบกำกับภาษีอย่างย่อ/);
  assert.match(detailPage, /openTaxDocument\(payment\.saleId, 'RECEIPT'\)/);
  assert.match(detailPage, /ใบกำกับภาษีเต็มรูป/);
  assert.match(detailPage, /openTaxDocument\(payment\.saleId, 'TAX_INVOICE'\)/);
  assert.match(saleDocumentRoute, /option === 'RECEIPT'[\s\S]*print-short/);
  assert.match(saleDocumentRoute, /option === 'TAX_INVOICE'[\s\S]*print-full/);
});

test('flow explicitly avoids new stock movement semantics', () => {
  assert.match(createPage, /ไม่สร้าง stock movement ใหม่/);
  assert.match(detailPage, /ไม่สร้างการเคลื่อนไหวสินค้าและไม่ตัดสต๊อกซ้ำ/);
  assert.match(printPage, /ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ/);
  assert.doesNotMatch(`${createPage}\n${detailPage}\n${printPage}`, /stockItem\.update|stockMovement|inventoryMutation/);
});
