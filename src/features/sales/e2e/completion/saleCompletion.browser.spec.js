// POS sale completion Browser E2E.
// Module-owned E2E aligned with Repair E2E authority pattern.
// No API interception, mock response, store injection, or browser-side DB access.

import { test, expect } from '@playwright/test';
import { merchantAuthStatePath } from '../../../e2e/auth/merchantAuthState.js';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const stockBarcode = process.env.POS_SALE_E2E_STOCK_BARCODE;
const expectedRetailTotal = process.env.POS_SALE_E2E_EXPECTED_RETAIL_TOTAL;
const customerName = process.env.POS_SALE_E2E_CUSTOMER_NAME;
const customerPhone = process.env.POS_SALE_E2E_CUSTOMER_PHONE;

const requiredEnvironment = {
  POS_SALE_E2E_BRANCH_SLUG: branchSlug,
  POS_SALE_E2E_STOCK_BARCODE: stockBarcode,
  POS_SALE_E2E_EXPECTED_RETAIL_TOTAL: expectedRetailTotal,
  POS_SALE_E2E_CUSTOMER_NAME: customerName,
  POS_SALE_E2E_CUSTOMER_PHONE: customerPhone,
};

test.use({ storageState: merchantAuthStatePath });

test.describe('POS sale completion (Test DB)', () => {
  test('staff completes cash sale and receives receipt with existing merchant session', async ({ page }) => {
    const missing = Object.entries(requiredEnvironment)
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`Missing Sale Browser E2E environment: ${missing.join(', ')}`);
    }

    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale`);

    if (/\/login(?:\?|$)/i.test(page.url())) {
      throw new Error('Merchant E2E authentication is unavailable or expired. Bootstrap auth state before running this spec.');
    }

    await page.locator('#sale-customer-search-input').fill(customerPhone);
    await page.locator('#sale-customer-search-input').press('Enter');
    await expect(page.getByText('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มลูกค้าใหม่ได้')).toBeVisible();

    await page.locator('#customer-name-input').fill(customerName);
    await page.getByRole('button', { name: 'บันทึกลูกค้าใหม่' }).click();

    const barcodeInput = page.getByTestId('pos-sale-barcode-input');
    await barcodeInput.fill(stockBarcode);
    await barcodeInput.press('Enter');

    const expectedTotal = Number(expectedRetailTotal).toFixed(2);
    await page.getByTestId('pos-sale-cash-input').fill(expectedTotal);

    const popup = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
    const completion = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes('/api/sales/complete')
        && response.ok(),
      { timeout: 15000 }
    );

    await page.getByTestId('pos-sale-confirm-button').click();

    const completionBody = await (await completion).json();
    const saleId = completionBody?.saleId || completionBody?.data?.saleId;
    expect(saleId).toBeTruthy();

    const receiptPage = await popup;
    if (receiptPage) {
      await receiptPage.waitForLoadState('domcontentloaded');
      await expect(receiptPage).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    } else {
      await expect(page).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    }
  });
});
