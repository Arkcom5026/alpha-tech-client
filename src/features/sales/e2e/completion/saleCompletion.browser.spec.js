// POS sale completion Browser E2E.
// Module-owned E2E package migrated from the legacy e2e folder.
// This test uses the real UI and real Test DB runtime.

import process from 'node:process';
import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const operatorEmail = process.env.E2E_TEST_USERNAME;
const operatorPassword = process.env.E2E_TEST_PASSWORD;
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const stockBarcode = process.env.POS_SALE_E2E_STOCK_BARCODE;
const expectedRetailTotal = process.env.POS_SALE_E2E_EXPECTED_RETAIL_TOTAL;
const customerName = process.env.POS_SALE_E2E_CUSTOMER_NAME;
const customerPhone = process.env.POS_SALE_E2E_CUSTOMER_PHONE;

const requiredEnvironment = {
  E2E_TEST_USERNAME: operatorEmail,
  E2E_TEST_PASSWORD: operatorPassword,
  POS_SALE_E2E_BRANCH_SLUG: branchSlug,
  POS_SALE_E2E_STOCK_BARCODE: stockBarcode,
  POS_SALE_E2E_EXPECTED_RETAIL_TOTAL: expectedRetailTotal,
  POS_SALE_E2E_CUSTOMER_NAME: customerName,
  POS_SALE_E2E_CUSTOMER_PHONE: customerPhone,
};

test.describe('POS Sale completion (Test DB)', () => {
  test('staff completes cash sale and receives receipt', async ({ page }) => {
    const missing = Object.entries(requiredEnvironment).filter(([, value]) => !value).map(([name]) => name);
    test.skip(missing.length > 0, `Set ${missing.join(', ')} before running this browser E2E.`);

    await page.goto(`${baseUrl}/login`);
    await page.locator('input[placeholder="อีเมลหรือเบอร์โทรศัพท์"]').fill(operatorEmail);
    await page.locator('input[type="password"]').fill(operatorPassword);
    await page.getByRole('button', { name: 'เข้าสู่ระบบด้วยรหัสผ่าน' }).click();

    await page.waitForURL(new RegExp(`/${branchSlug}/pos/`), { timeout: 15000 });
    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale`);

    await page.locator('#sale-customer-search-input').fill(customerPhone);
    await page.locator('#sale-customer-search-input').press('Enter');
    await expect(page.getByText('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มลูกค้าใหม่ได้')).toBeVisible();

    await page.locator('#customer-name-input').fill(customerName);
    await page.getByRole('button', { name: 'บันทึกลูกค้าใหม่' }).click();

    await page.getByTestId('pos-sale-barcode-input').fill(stockBarcode);
    await page.getByTestId('pos-sale-barcode-input').press('Enter');

    const expectedTotal = Number(expectedRetailTotal).toFixed(2);
    await page.getByTestId('pos-sale-cash-input').fill(expectedTotal);

    const popup = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
    const completion = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes('/api/sales/complete') && response.ok());
    await page.getByTestId('pos-sale-confirm-button').click();
    const completionBody = await (await completion).json();

    const saleId = completionBody?.saleId || completionBody?.data?.saleId;
    expect(saleId).toBeTruthy();

    const receiptPage = await popup;
    if (receiptPage) {
      await expect(receiptPage).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    } else {
      await expect(page).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    }
  });
});
