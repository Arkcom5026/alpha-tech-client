// Credit Note Browser E2E against the local Test-DB API.
// No request interception or mocked tax document is used. The test creates a paid sale,
// configures the Test-DB issuer profile through the authenticated API, issues the
// original FULL invoice, completes the full return in the browser, then checks
// the printable Credit Note page.

import process from 'node:process';
import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const apiBaseUrl = (process.env.E2E_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const operatorEmail = process.env.E2E_TEST_USERNAME;
const operatorPassword = process.env.E2E_TEST_PASSWORD;
const branchSlug = process.env.POS_SALE_E2E_BRANCH_SLUG;
const branchId = Number(process.env.POS_SALE_E2E_BRANCH_ID);
const stockBarcode = process.env.POS_SALE_E2E_STOCK_BARCODE;
const expectedRetailTotal = Number(process.env.POS_SALE_E2E_EXPECTED_RETAIL_TOTAL);

const requiredEnvironment = {
  E2E_TEST_USERNAME: operatorEmail,
  E2E_TEST_PASSWORD: operatorPassword,
  POS_SALE_E2E_BRANCH_SLUG: branchSlug,
  POS_SALE_E2E_BRANCH_ID: branchId > 0 ? String(branchId) : '',
  POS_SALE_E2E_STOCK_BARCODE: stockBarcode,
  POS_SALE_E2E_EXPECTED_RETAIL_TOTAL: expectedRetailTotal > 0 ? String(expectedRetailTotal) : '',
};
const missingEnvironment = Object.entries(requiredEnvironment)
  .filter(([, value]) => !value)
  .map(([name]) => name);

const requestJson = async (page, { token, method, path, body }) => page.evaluate(
  async ({ apiBaseUrl, token, method, path, body }) => {
    const response = await fetch(`${apiBaseUrl}/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`${method} ${path} failed: ${json.code || json.error || json.message || response.status}`);
    return json.data || json;
  },
  { apiBaseUrl, token, method, path, body },
);

test.describe('Output-tax Credit Note full-return flow (Test DB)', () => {
  test('cash sale -> full tax invoice -> full refund -> printable Credit Note', async ({ page }) => {
    test.skip(
      missingEnvironment.length > 0,
      `Set ${missingEnvironment.join(', ')} from the fresh Test-DB fixture before running this browser E2E.`,
    );

    const runId = Date.now().toString();
    const customerPhone = `09${runId.slice(-8)}`;
    const customerName = `E2E Credit Note ${runId}`;
    const expectedTotal = expectedRetailTotal.toFixed(2);

    await page.goto(`${baseUrl}/login`);

    // The active Merchant Center login has no legacy placeholder. Role locators
    // deliberately support both its current accessible fields and the former POS login.
    const loginTextboxes = page.getByRole('textbox');
    await expect(loginTextboxes.first()).toBeVisible();
    await loginTextboxes.first().fill(operatorEmail);
    await page.locator('input[type="password"]').fill(operatorPassword);

    const loginResponse = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes('/api/auth/login')
        && response.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /เข้าสู่ระบบ(?:ด้วยรหัสผ่าน)?/ }).click();
    const loginBody = await (await loginResponse).json();
    const accessToken = loginBody?.accessToken || loginBody?.data?.accessToken;
    expect(accessToken, 'login must return an access token for live Test-DB setup').toBeTruthy();

    await page.waitForURL(new RegExp(`/${branchSlug}/pos/`), { timeout: 15_000 });
    await requestJson(page, {
      token: accessToken,
      method: 'PUT',
      path: '/tax/issuer-profile',
      body: {
        branchId,
        legalName: 'Alpha-Tech Test Issuer',
        taxId: '0105560123456',
        registeredAddress: 'Test DB only, Bangkok 10100',
        branchCode: '00000',
        isHeadOffice: true,
        shortTaxInvoicePrefix: 'E2E-SHORT-',
        fullTaxInvoicePrefix: 'E2E-FULL-',
        creditNotePrefix: 'E2E-CN-',
        status: 'ACTIVE',
      },
    });

    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale`);
    const customerSearch = page.locator('#sale-customer-search-input');
    await expect(customerSearch).toBeVisible();
    await customerSearch.fill(customerPhone);
    await customerSearch.press('Enter');
    await expect(page.getByText('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มลูกค้าใหม่ได้')).toBeVisible();
    await page.locator('#customer-name-input').fill(customerName);

    const customerCreate = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes('/api/customers')
        && response.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: 'บันทึกลูกค้าใหม่' }).click();
    await customerCreate;

    const barcodeInput = page.getByTestId('pos-sale-barcode-input');
    await barcodeInput.fill(stockBarcode);
    await barcodeInput.press('Enter');
    await expect(page.getByText(stockBarcode, { exact: true })).toBeVisible();
    await expect(page.getByTestId('pos-sale-total-due')).toContainText(expectedTotal);
    await page.getByTestId('pos-sale-cash-input').fill(expectedTotal);

    const completion = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes('/api/sales/complete')
        && response.ok(),
      { timeout: 15_000 },
    );
    await page.getByTestId('pos-sale-confirm-button').click();
    const saleBody = await (await completion).json();
    const saleId = saleBody?.saleId || saleBody?.data?.saleId;
    expect(saleId, 'sale completion must return saleId').toBeTruthy();

    const candidate = await requestJson(page, {
      token: accessToken,
      method: 'POST',
      path: `/tax/candidates/register-sale/${saleId}`,
      body: { branchId },
    });
    const originalTaxDocumentId = candidate?.document?.id;
    expect(originalTaxDocumentId, 'sale tax candidate must create a draft document').toBeTruthy();

    const originalInvoice = await requestJson(page, {
      token: accessToken,
      method: 'POST',
      path: `/tax/documents/${originalTaxDocumentId}/issue`,
      body: {
        branchId,
        taxInvoiceKind: 'FULL',
        recipient: {
          legalName: 'E2E Full-tax Recipient',
          taxId: '0105560123456',
          registeredAddress: 'Test DB only, Bangkok 10100',
          branchCode: '00000',
          isHeadOffice: true,
        },
      },
    });
    const originalNumber = originalInvoice?.document?.issuedDocumentNumber;
    expect(originalNumber, 'original full invoice must be issued before return').toBeTruthy();

    await page.goto(`${baseUrl}/${branchSlug}/pos/sales/sale-return/create/${saleId}`);
    await expect(page.getByRole('heading', { name: /คืนสินค้าจากใบขาย/ })).toBeVisible();
    await page.locator('input[type="checkbox"]').first().check();

    const editableAmounts = page.locator('input[type="number"]:not([disabled])');
    await expect(editableAmounts).toHaveCount(2);
    await editableAmounts.nth(0).fill(expectedTotal);
    await editableAmounts.nth(1).fill(expectedTotal);

    const creditNoteResponse = page.waitForResponse(
      (response) => response.request().method() === 'POST'
        && response.url().includes('/api/tax/credit-notes/from-sale-return/')
        && response.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('button', { name: 'ยืนยันคืนสินค้าและคืนเงิน' }).click();
    const creditNoteBody = await (await creditNoteResponse).json();
    const creditNoteId = creditNoteBody?.data?.document?.id || creditNoteBody?.document?.id;
    expect(creditNoteId, 'Credit Note issuance must return document identity').toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/credit-note/print/${creditNoteId}\\?branchId=${branchId}`));
    await expect(page.getByRole('heading', { name: 'ใบลดหนี้' })).toBeVisible();
    await expect(page.getByText(originalNumber, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'พิมพ์ใบลดหนี้' })).toBeVisible();

    process.stdout.write(JSON.stringify({
      result: 'PASS',
      saleId: Number(saleId),
      originalTaxDocumentId: Number(originalTaxDocumentId),
      creditNoteId: Number(creditNoteId),
      branchId,
      databaseModified: true,
    }) + '\n');
  });
});
