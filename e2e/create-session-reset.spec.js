// e2e/create-session-reset.spec.js
// 🏛️ Customer Receipt Operational E2E — Scenario A: Create Session Reset
//
// Verifies that after creating a receipt and returning to the create page,
// the form is fully reset — no stale customer ID, no retained search results.

import { test, expect } from './customer-receipt-e2e-fixture.js';
import { CUSTOMER_A, CUSTOMER_RECEIPT_CREATE_PATH } from './customer-receipt-e2e-fixture.js';

test.describe('CUSTOMER-RECEIPT-SESSION-001 — Create Session Reset', () => {
  test('A1: Create receipt, then verify form resets on return to create page', async ({ page }) => {
    // Navigate to create page
    await page.goto(CUSTOMER_RECEIPT_CREATE_PATH);
    await page.waitForLoadState('networkidle');

    // Verify we're on the create page
    await expect(page.locator('h1')).toContainText('สร้างใบรับเงิน');

    // --- Step 1: Search and select Customer A ---
    const searchInput = page.getByTestId('customer-search-input');
    await searchInput.fill('Customer A');
    await searchInput.press('Enter');

    // Wait for search results to appear
    await page.waitForTimeout(500);

    // Click on Customer A result row
    const customerARow = page.getByTestId('customer-result-row-1001');
    await expect(customerARow).toBeVisible({ timeout: 5000 });
    await customerARow.click();

    // Verify Customer A is selected
    const selectedCustomer = page.getByTestId('selected-customer-identity');
    await expect(selectedCustomer).toBeVisible();
    await expect(selectedCustomer).toContainText('Customer A');

    // --- Step 2: Enter amount and submit ---
    const amountInput = page.getByTestId('amount-input');
    await amountInput.fill('100');

    const submitButton = page.getByTestId('submit-receipt-button');
    await submitButton.click();

    // --- Step 3: Verify exactly one POST was made ---
    await page.waitForTimeout(1000);
    const postTracker = page.__postTracker;
    expect(postTracker.getPostCount()).toBe(1);

    // --- Step 4: Verify POST customerId = Customer A's ID ---
    const customerIds = postTracker.getPostCustomerIds();
    expect(customerIds[0]).toBe(CUSTOMER_A.id);

    // --- Step 5: Arrive at detail page ---
    // After successful creation, the app navigates to the detail page
    await page.waitForURL(/\/customer-receipts\/\d+/, { timeout: 10000 });
    const detailIdentity = page.getByTestId('detail-page-identity');
    await expect(detailIdentity).toBeVisible({ timeout: 5000 });

    // --- Step 6: Return to create page ---
    await page.goto(CUSTOMER_RECEIPT_CREATE_PATH);
    await page.waitForLoadState('networkidle');

    // --- Step 7: Verify selected customer is empty ---
    const selectedCustomerAfterReturn = page.getByTestId('selected-customer-identity');
    // The "ยังไม่ได้เลือกลูกค้า" text should appear when no customer is selected
    // We check that the selected customer identity section shows "กรุณาค้นหา" text
    await expect(selectedCustomerAfterReturn).not.toBeVisible();

    // --- Step 8: Verify customerId is not retained ---
    // The form should not have a pre-filled customerId
    const searchInputAfterReturn = page.getByTestId('customer-search-input');
    await expect(searchInputAfterReturn).toHaveValue('');

    // --- Step 9: Verify prior search results are not presented as active state ---
    // Search results should be cleared after navigating away and back
    const customerARowAfterReturn = page.getByTestId('customer-result-row-1001');
    await expect(customerARowAfterReturn).not.toBeVisible();

    // Verify no console errors
    const consoleMonitor = page.__consoleMonitor;
    expect(consoleMonitor.hasErrors()).toBe(false);
  });
});
