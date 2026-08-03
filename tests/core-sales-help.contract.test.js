import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coreSalesHelpContent from '../src/features/sales/help/coreSalesHelpContent.js';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const flatten = (value) => JSON.stringify(value).toLowerCase();

describe('Core Sales Help contract', () => {
  test('module-owned content covers unified store-scoped customer selection and Core Sales completion', () => {
    const text = flatten(coreSalesHelpContent);

    expect(coreSalesHelpContent.title).toBe('คู่มือการขายสินค้าและปิดการขาย');
    expect(coreSalesHelpContent.customerSearch.length).toBeGreaterThanOrEqual(5);
    expect(coreSalesHelpContent.steps.length).toBeGreaterThanOrEqual(10);
    expect(coreSalesHelpContent.lineTypes.length).toBeGreaterThanOrEqual(3);
    expect(coreSalesHelpContent.modes.some(([code]) => code === 'CASH')).toBe(true);
    expect(coreSalesHelpContent.modes.some(([code]) => code === 'CREDIT')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_PAID')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_CREDIT')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'PARTIALLY_PAID')).toBe(true);
    expect(coreSalesHelpContent.paymentChecklist.length).toBeGreaterThanOrEqual(5);
    expect(coreSalesHelpContent.heldCartChecklist.length).toBeGreaterThanOrEqual(5);
    expect(coreSalesHelpContent.recovery.length).toBeGreaterThanOrEqual(8);

    expect(text).toMatch(/ช่องค้นหาเดียว/);
    expect(text).toMatch(/ชื่อ.*เบอร์โทร.*บริษัท.*อีเมล.*เลขผู้เสียภาษี/);
    expect(text).toMatch(/ร้านปัจจุบัน/);
    expect(text).toMatch(/เพิ่มลูกค้าใหม่/);
    expect(text).toMatch(/first association|first-association/);
    expect(text).toMatch(/ไม่ค้นหาสินค้า.*barcode.*serial number.*imei.*service tag/);
    expect(text).toMatch(/ลูกค้าใช้กับร้านนี้ไม่ได้/);
    expect(text).toMatch(/คงตะกร้าและข้อมูลชำระไว้/);
    expect(text).toMatch(/stock_item/);
    expect(text).toMatch(/simple lot/);
    expect(text).toMatch(/non_stock/);
    expect(text).toMatch(/command identity/);
    expect(text).toMatch(/งานคืนสินค้าและคืนเงินเป็น workflow แยก/);
    expect(text).toMatch(/ใบกำกับภาษีอย่างย่อหรือเต็มรูปได้เมื่อสถานะชำระเป็น paid เท่านั้น/);
    expect(text).toMatch(/ห้ามออกใบกำกับภาษีก่อนชำระครบ/);
  });

  test('operational guide documents search authority, tenant guards, and paid-only tax eligibility', () => {
    const guide = read('docs/workflows/core-sales-operational-user-guide.md');

    expect(guide).toMatch(/## 4\. Customer Search and Selection/);
    expect(guide).toMatch(/พนักงานไม่ต้องเลือกโหมดชื่อหรือเบอร์โทร/);
    expect(guide).toMatch(/ระบบค้นหาเฉพาะลูกค้าที่มีความสัมพันธ์กับร้านปัจจุบัน/);
    expect(guide).toMatch(/ไม่ค้นหา:[\s\S]*Barcode[\s\S]*Serial Number[\s\S]*IMEI[\s\S]*Service Tag/);
    expect(guide).toMatch(/first-association evidence/);
    expect(guide).toMatch(/SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH/);
    expect(guide).not.toMatch(/SALE_CUSTOMER_FIRST_ASSOCIATION_REQUIRED/);
    expect(guide).toMatch(/CUSTOMER_PHONE_NOT_AVAILABLE_IN_BRANCH/);
    expect(guide).toMatch(/คงตะกร้าและข้อมูลการชำระไว้/);
    expect(guide).toMatch(/ใบกำกับภาษีอย่างย่อและเต็มรูปออกได้เฉพาะ Sale สถานะ `PAID`/);
    expect(guide).toMatch(/`CREDIT`, `UNPAID`, `PARTIALLY_PAID` ใช้ได้เฉพาะ `DELIVERY_NOTE`/);
  });

  test('human operational pack requires customer search, negative isolation, and Test-DB evidence', () => {
    const pack = read('docs/workflows/core-sales-human-operational-test-pack.md');

    expect(pack).toMatch(/Scenario B — Unified Customer Search by Name/);
    expect(pack).toMatch(/Scenario D — Search Domain Boundary/);
    expect(pack).toMatch(/Scenario E — Cross-store Customer Isolation/);
    expect(pack).toMatch(/Scenario F — Create New Customer and First Sale/);
    expect(pack).toMatch(/Scenario G — First-association Negative Cases/);
    expect(pack).toMatch(/Scenario N — Repair\/Claim Regression/);
    expect(pack).toMatch(/Test-DB Post-condition Authority/);
    expect(pack).toMatch(/Sale\.branchId ตรง authenticated Branch/);
    expect(pack).toMatch(/Customer มี branch evidence จาก Sale ที่เพิ่งสร้าง/);
    expect(pack).toMatch(/Browser PASS โดยไม่มี Test-DB post-condition ยังไม่ถือว่า E2E PASS/);
  });

  test('drawer exposes customer-search guidance and an accessible close boundary', () => {
    const drawer = read('src/features/sales/help/CoreSalesHelpDrawer.jsx');

    expect(drawer).toMatch(/coreSalesHelpContent/);
    expect(drawer).toMatch(/coreSalesHelpContent\.customerSearch/);
    expect(drawer).toMatch(/การค้นหาและเลือกลูกค้า/);
    expect(drawer).toMatch(/role="dialog"/);
    expect(drawer).toMatch(/aria-modal="true"/);
    expect(drawer).toMatch(/onClose/);
  });

  test('Create Sale exposes contextual help without absorbing Sale Return ownership', () => {
    const page = read('src/features/sales/create/pages/CreateSalePage.jsx');

    expect(page).toMatch(/CoreSalesHelpDrawer/);
    expect(page).toMatch(/isHelpOpen/);
    expect(page).toMatch(/เปิดคู่มือการขายสินค้า/);
    expect(page).toMatch(/<PaymentSection/);
    expect(page).toMatch(/<PosHeldCartPanel/);
    expect(page).not.toMatch(/SaleReturn|return workflow|คืนสินค้าและคืนเงิน/);
  });

  test('package command and CI gate execute the focused contract before Production Build', () => {
    const packageJson = JSON.parse(read('package.json'));
    const workflow = read('.github/workflows/frontend-ci.yml');

    expect(packageJson.scripts['test:core-sales-help']).toBe(
      'vitest run tests/core-sales-help.contract.test.js',
    );
    expect(workflow).toMatch(/npm run test:core-sales-help/);
    expect(workflow.indexOf('npm run test:core-sales-help')).toBeLessThan(
      workflow.indexOf('npm run build'),
    );
  });
});
