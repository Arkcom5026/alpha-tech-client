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
  test('module-owned content covers the end-to-end Core Sales operator flow', () => {
    const text = flatten(coreSalesHelpContent);

    expect(coreSalesHelpContent.title).toBe('คู่มือการขายสินค้าและปิดการขาย');
    expect(coreSalesHelpContent.steps.length).toBeGreaterThanOrEqual(8);
    expect(coreSalesHelpContent.lineTypes.length).toBeGreaterThanOrEqual(3);
    expect(coreSalesHelpContent.modes.some(([code]) => code === 'CASH')).toBe(true);
    expect(coreSalesHelpContent.modes.some(([code]) => code === 'CREDIT')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_PAID')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'COMPLETED_CREDIT')).toBe(true);
    expect(coreSalesHelpContent.statusGuide.some(([code]) => code === 'PARTIALLY_PAID')).toBe(true);
    expect(coreSalesHelpContent.paymentChecklist.length).toBeGreaterThanOrEqual(5);
    expect(coreSalesHelpContent.heldCartChecklist.length).toBeGreaterThanOrEqual(5);
    expect(coreSalesHelpContent.recovery.length).toBeGreaterThanOrEqual(5);
    expect(text).toMatch(/stock_item/);
    expect(text).toMatch(/simple lot/);
    expect(text).toMatch(/non_stock/);
    expect(text).toMatch(/command identity/);
    expect(text).toMatch(/ร้านปัจจุบัน/);
    expect(text).toMatch(/งานคืนสินค้าและคืนเงินเป็น workflow แยก/);
  });

  test('drawer exposes an accessible close boundary and consumes module-owned content', () => {
    const drawer = read('src/features/sales/help/CoreSalesHelpDrawer.jsx');

    expect(drawer).toMatch(/coreSalesHelpContent/);
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
