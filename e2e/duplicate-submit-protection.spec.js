// e2e/duplicate-submit-protection.spec.js
// 🏛️ Customer Receipt Operational E2E — Scenario C: Duplicate Submit Protection
//
// Verifies that rapid/double-click submission does not result in multiple POSTs.
// If the current product does not protect against duplicate submission,
// this test will FAIL — documenting the gap.

import { test, expect } from './customer-receipt-e2e-fixture.js';
import { CUSTOMER_A, CUSTOMER_RECEIPT_CREATE_PATH } from './customer-receipt-e2e-fixture.js';

test.describe('CUSTOMER-RECEIPT-SESSION-001 — Duplicate Submit Protection', () => {
  test('C1: Rapid double-click should not create duplicate receipts', async ({ page }) => {
    // Navigate to create page
    await page.goto(CUSTOMER_RECEIPT_CREATE_PATH);
    await page.waitForLoadState('networkidle');

    // Verify we're on the create page
    await expect(page.locator('h1')).toContainText('สร้างใบรับเงิน');

    // --- Step 1: Search and select Customer A ---
    const searchInput = page.getByTestId('customer-search-input');
    await searchInput.fill('Customer A');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(500);

    // Click on Customer A result row
    const customerARow = page.getByTestId('customer-result-row-1001');
    await expect(customerARow).toBeVisible({ timeout: 5000 });
    await customerARow.click();

    // Verify Customer A is selected
    const selectedCustomer = page.getByTestId('selected-customer-identity');
    await expect(selectedCustomer).toBeVisible();
    await expect(selectedCustomer).toContainText('Customer A');

    // --- Step 2: Enter amount ---
    const amountInput = page.getByTestId('amount-input');
    await amountInput.fill('100');

    // --- Step 3: Rapid double-click submit ---
    const submitButton = page.getByTestId('submit-receipt-button');
    
    // Click rapidly twice
    await submitButton.click({ clickCount: 2 });
    
    // Wait for any navigation or response
    await page.waitForTimeout(2000);

    // --- Step 4: Verify no more than one POST was made ---
    const postTracker = page.__postTracker;
    const postCount = postTracker.getPostCount();
    
    // ⚠️ REGRESSION ASSERTION:
    // If this test fails, it means the product does NOT protect against
    // duplicate submission. The submit button should be disabled after
    // the first click (submitting=true), preventing a second POST.
    //
    // Current behavior: The button has disabled={submitting} which should
    // prevent double-clicks from triggering multiple submissions.
    // However, if the state update is asynchronous, rapid clicks may
    // bypass this protection.
    //
    // This is a KNOWN GAP if the test fails here.
    expect(postCount).toBeLessThanOrEqual(1);
    
    if (postCount > 1) {
      // This is a regression report — the product allows duplicate submissions
      console.error(
        `[DUPLICATE SUBMIT GAP DETECTED] ${postCount} POSTs were created from rapid double-click. ` +
        'The submit button disabled state may not be applied synchronously enough ' +
        'to prevent rapid double-clicks. Consider adding a debounce or a submitting flag ' +
        'check at the beginning of the submit handler.'
      );
    }

    // --- Step 5: Verify no console errors ---
    const consoleMonitor = page.__consoleMonitor;
    expect(consoleMonitor.hasErrors()).toBe(false);
  });
});
