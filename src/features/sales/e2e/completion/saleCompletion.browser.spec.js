// POS sale completion Browser E2E.
// Module-owned E2E aligned with Repair E2E authority pattern.
// No API interception, mock response, store injection, or browser-side DB access.

import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { saleMerchantAuthStatePath } from './saleMerchantAuthState.js';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const branchId = process.env.POS_SALE_E2E_BRANCH_ID;
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const stockBarcode = process.env.POS_SALE_E2E_STOCK_BARCODE;
const expectedRetailTotal = process.env.POS_SALE_E2E_EXPECTED_RETAIL_TOTAL;
const customerName = process.env.POS_SALE_E2E_CUSTOMER_NAME;
const customerPhone = process.env.POS_SALE_E2E_CUSTOMER_PHONE;
const resultPath = process.env.POS_SALE_E2E_RESULT_PATH;

const requiredEnvironment = {
  POS_SALE_E2E_BRANCH_ID: branchId,
  POS_SALE_E2E_BRANCH_SLUG: branchSlug,
  POS_SALE_E2E_STOCK_BARCODE: stockBarcode,
  POS_SALE_E2E_EXPECTED_RETAIL_TOTAL: expectedRetailTotal,
  POS_SALE_E2E_CUSTOMER_NAME: customerName,
  POS_SALE_E2E_CUSTOMER_PHONE: customerPhone,
  POS_SALE_E2E_RESULT_PATH: resultPath,
};

const isAuthenticationRoute = (url) => (
  /\/login(?:\?|$)|\/partner-portal(?:\/login)?(?:\?|$)/i.test(url)
);

const publishResult = (result) => {
  const absolutePath = path.resolve(resultPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
};

test.use({ storageState: saleMerchantAuthStatePath });

test.describe('POS sale completion (selected E2E authority)', () => {
  test('staff completes cash sale and receipt keeps the merchant session', async ({ page }) => {
    const missing = Object.entries(requiredEnvironment)
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`Missing Sale Browser E2E environment: ${missing.join(', ')}`);
    }

    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale`);

    if (isAuthenticationRoute(page.url())) {
      throw new Error(
        'Sale E2E authentication is unavailable or expired. Run the Sale auth bootstrap before this spec.'
      );
    }

    await page.locator('#sale-customer-search-input').fill(customerPhone);
    await page.locator('#sale-customer-search-input').press('Enter');
    await expect(page.getByText(/ไม่พบลูกค้าในร้านนี้/)).toBeVisible();

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
    const saleId = Number(completionBody?.saleId || completionBody?.data?.saleId);
    expect(Number.isInteger(saleId) && saleId > 0).toBeTruthy();

    const receiptPage = await popup;
    const documentPage = receiptPage || page;
    if (receiptPage) await receiptPage.waitForLoadState('domcontentloaded');

    if (isAuthenticationRoute(documentPage.url())) {
      throw new Error(
        `Receipt document handoff lost the Sale session and reached ${documentPage.url()}`
      );
    }

    await expect(documentPage).toHaveURL(
      new RegExp(`/(print-short|bill/print-short)/${saleId}`)
    );

    publishResult({
      result: 'PASS',
      databaseModified: true,
      saleId,
      branchId: Number(branchId),
      branchSlug,
      stockBarcode,
      customerPhone,
      receiptMode: receiptPage ? 'POPUP' : 'SAME_TAB',
      receiptUrl: documentPage.url(),
      authRedirectObserved: false,
    });
  });
});
