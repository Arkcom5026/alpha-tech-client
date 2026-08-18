'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'src/features/sales/create/pages/CreateSalePage.jsx'),
  'utf8'
);
const checklist = fs.readFileSync(
  path.join(root, 'src/features/sales/create/components/SaleQuotationReferenceChecklist.jsx'),
  'utf8'
);

assert.match(page, /SaleQuotationReferenceChecklist/);
assert.match(page, /quotationId=\{sourceQuotationId\}/);
assert.match(page, /sale-source-quotation-select/);

assert.match(checklist, /getQuotation\(quotationId\)/);
assert.match(checklist, /quotation\?\.items/);
assert.match(checklist, /useState\(false\)/);
assert.match(checklist, /aria-expanded=\{expanded\}/);
assert.match(checklist, /ใช้เป็นเช็คลิสต์เตรียมสินค้าเท่านั้น/);
assert.match(checklist, /ไม่เชื่อมกับตะกร้าขาย/);
assert.match(checklist, /สถานะชั่วคราวบนหน้าจอนี้เท่านั้น/);
assert.match(checklist, /item\?\.title/);
assert.match(checklist, /item\?\.quantity/);
assert.match(checklist, /item\?\.unitName/);

assert.doesNotMatch(checklist, /addSale|addCart|sourceProductId|stockItemId|barcode|serialNumber|reserveStock|deductStock/);
assert.doesNotMatch(page, /quotation\.items.*sale\.cart|sourceProductId.*sourceQuotationId/);

console.log('Sale Quotation Reference Picking Checklist Contract: PASS');
