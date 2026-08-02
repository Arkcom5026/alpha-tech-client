// POS cash-sale Browser E2E.
// This test deliberately makes real requests to the local Server configured for the Test DB.
// It never intercepts API calls and requires a fresh fixture from
// `npm run provision:pos-sale-e2e-fixture` in alpha-tech-server.
//
// Required environment:
//   E2E_BASE_URL
//   E2E_TEST_USERNAME
//   E2E_TEST_PASSWORD
//   POS_SALE_E2E_BRANCH_SLUG
//   POS_SALE_E2E_STOCK_BARCODE
//   POS_SALE_E2E_EXPECTED_RETAIL_TOTAL

import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const operatorEmail = process.env.E2E_TEST_USERNAME;
const operatorPassword = process.env.E2E_TEST_PASSWORD;
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const stockBarcode = process.env.POS_SALE_E2E_STOCK_BARCODE;
const expectedRetailTotal = process.env.POS_SALE_E2E_EXPECTED_RETAIL_TOTAL;

const requiredEnvironment = {
  E2E_TEST_USERNAME: operatorEmail,
  E2E_TEST_PASSWORD: operatorPassword,
  POS_SALE_E2E_BRANCH_SLUG: branchSlug,
  POS_SALE_E2E_STOCK_BARCODE: stockBarcode,
  POS_SALE_E2E_EXPECTED_RETAIL_TOTAL: expectedRetailTotal,
};

const missingEnvironment = Object.entries(requiredEnvironment)
  .filter(([, value]) => !value)
  .map(([name]) => name);

test.describe('POS Sale cash happy path (Test DB)', () => {
  test('staff sells a fresh in-branch stock item and receives a receipt', async ({ page }) => {
    test.skip(
      missingEnvironment.length > 0,
      `Set ${missingEnvironment.join(', ')} from the Test-DB fixture before running this browser E2E.`
    );

    await page.goto(`${baseUrl}/login`);

    await page.locator('input[placeholder="อีเมลหรือเบอร์โทรศัพท์"]').fill(operatorEmail);
    await page.locator('input[type="password"]').fill(operatorPassword);
    await page.getByRole('button', { name: 'เข้าสู่ระบบด้วยรหัสผ่าน' }).click();

    await page.waitForURL(new RegExp(`/${branchSlug}/pos/`), { timeout: 15_000 });
    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale`);

    const barcodeInput = page.getByTestId('pos-sale-barcode-input');
    await expect(barcodeInput).toBeVisible();
    await barcodeInput.fill(stockBarcode);
    await barcodeInput.press('Enter');

    await expect(page.getByText(stockBarcode, { exact: true })).toBeVisible();

    const expectedTotal = Number(expectedRetailTotal).toFixed(2);
    await expect(page.getByTestId('pos-sale-total-due')).toContainText(expectedTotal);

    await page.getByTestId('pos-sale-cash-input').fill(expectedTotal);
    const confirm = page.getByTestId('pos-sale-confirm-button');
    await expect(confirm).toBeEnabled();

    const receiptPopup = page.waitForEvent('popup', { timeout: 10_000 }).catch(() => null);
    const [completion] = await Promise.all([
      page.waitForResponse(
        (response) => response.request().method() === 'POST'
          && response.url().includes('/api/sales/complete')
          && response.ok(),
        { timeout: 15_000 }
      ),
      confirm.click(),
    ]);

    const completionBody = await completion.json();
    const saleId = completionBody?.saleId || completionBody?.data?.saleId;
    expect(saleId, 'sale completion response must contain saleId').toBeTruthy();

    const receiptPage = await receiptPopup;
    if (receiptPage) {
      await receiptPage.waitForLoadState('domcontentloaded');
      await expect(receiptPage).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    } else {
      await expect(page).toHaveURL(new RegExp(`/(print-short|bill/print-short)/${saleId}`));
    }
  });
});
