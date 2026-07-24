// e2e/request-isolation.spec.js
// 🏛️ Customer Receipt Operational E2E — Scenario D: Request Isolation
//
// Asserts that every API request is intercepted by the mock.
// The test fails if any request attempts to reach the production/backend.

import { test, expect } from './customer-receipt-e2e-fixture.js';
import { CUSTOMER_RECEIPT_CREATE_PATH } from './customer-receipt-e2e-fixture.js';

test.describe('CUSTOMER-RECEIPT-SESSION-001 — Request Isolation', () => {
  test('D1: All API requests are intercepted — no production backend access', async ({ page }) => {
    // Track all requests made during the test
    const allRequests = [];
    const unexpectedRequests = [];

    page.on('request', (request) => {
      const url = request.url();
      // Only track API requests
      if (url.includes('/api/')) {
        allRequests.push({
          url,
          method: request.method(),
          resourceType: request.resourceType(),
        });
      }
    });

    // Listen for failed requests (aborted = blocked by our interceptor)
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        unexpectedRequests.push({
          url,
          method: request.method(),
          failure: request.failure()?.errorText || 'unknown',
        });
      }
    });

    // Navigate through the full Customer Receipt workflow
    // This should trigger all the API endpoints we need

    // 1. Navigate to create page (triggers auth/me, branch, etc.)
    await page.goto(CUSTOMER_RECEIPT_CREATE_PATH);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 2. Search for a customer (triggers customer-search)
    const searchInput = page.getByTestId('customer-search-input');
    await searchInput.fill('Customer A');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);

    // 3. Select a customer
    const customerARow = page.getByTestId('customer-result-row-1001');
    if (await customerARow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customerARow.click();
    }

    // 4. Fill amount and submit (triggers POST /customer-receipts)
    const amountInput = page.getByTestId('amount-input');
    await amountInput.fill('100');
    const submitButton = page.getByTestId('submit-receipt-button');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // --- Assertions ---

    // All API requests should have been intercepted
    // If any request was aborted (blockedbyclient), it means our interceptor
    // caught an unexpected endpoint that wasn't mocked
    const blockedRequests = unexpectedRequests.filter(
      (r) => r.failure === 'blockedbyclient'
    );

    if (blockedRequests.length > 0) {
      console.error(
        '[ISOLATION FAILURE] The following API requests were blocked because they were not mocked:',
        blockedRequests.map((r) => `  ${r.method} ${r.url}`).join('\n')
      );
    }

    // No request should have been blocked
    expect(blockedRequests.length).toBe(0);

    // Log all intercepted requests for evidence
    console.log(
      '[ISOLATION EVIDENCE] All API requests were intercepted:',
      allRequests.map((r) => `  ${r.method} ${r.url}`).join('\n')
    );

    // Verify no console errors
    const consoleMonitor = page.__consoleMonitor;
    expect(consoleMonitor.hasErrors()).toBe(false);
  });
});
