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
const api = read('src/features/customerMoneySettlement/api/deliveryCreditSettlementApi.js');

test('delivery credit settlement follows list-first project standard', () => {
  assert.match(sidebar, /ตัดยอดใบส่งของเครดิต/);
  assert.match(routes, /path: 'customer-money-settlements'[\s\S]*DeliveryCreditSettlementListPage/);
  assert.match(routes, /path: 'create', element: <DeliveryCreditSettlementCreatePage/);
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
});

test('client calls isolated customer money settlement endpoints', () => {
  assert.match(api, /customer-money-settlements\/delivery-credit/);
  assert.match(api, /eligible-sales/);
  assert.doesNotMatch(api, /customer-receipts/);
});

test('flow explicitly avoids new stock movement semantics', () => {
  assert.match(createPage, /ไม่สร้าง stock movement ใหม่/);
  assert.doesNotMatch(createPage, /stockItem\.update|stockMovement|inventoryMutation/);
});
