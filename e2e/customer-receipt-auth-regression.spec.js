// e2e/customer-receipt-auth-regression.spec.js
// ⚠️ LAYER C — Browser Runtime E2E Test
// Tests that repeated Customer Receipt operations do not invalidate authentication state.
//
// Requires Playwright: npm install -D @playwright/test
// Requires environment variables:
//   E2E_BASE_URL - Base URL of the application
//   E2E_TEST_USERNAME - Test account username
//   E2E_TEST_PASSWORD - Test account password
//
// Usage: npx playwright test e2e/customer-receipt-auth-regression.spec.js

// @ts-check
const { test, expect } = require('@playwright/test');

// ============================================================
// Configuration
// ============================================================
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const TEST_USERNAME = process.env.E2E_TEST_USERNAME;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

// ============================================================
// Auth Snapshot Helper (browser-context version)
// ============================================================

/**
 * Captures auth state from the browser's auth store.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<object>} Safe auth snapshot
 */
async function captureAuthSnapshot(page) {
  return await page.evaluate(() => {
    // Try to access Zustand store from window
    const store = window.__ZUSTAND_STORE__ || window.__AUTH_STORE__;
    const state = store?.getState?.() || {};

    return {
      isAuthenticated: !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth,
      userId: state.employee?.id || state.customer?.id || null,
      accessTokenPresent: !!(state.accessToken || state.token),
      accessTokenPrefix: (state.accessToken || state.token || '').slice(0, 8) + '...',
      authChecked: !!state.authChecked,
      isBootstrappingAuth: !!state.isBootstrappingAuth,
      role: state.role || null,
      currentPath: window.location.pathname,
      timestamp: Date.now(),
    };
  });
}

/**
 * Asserts that auth state is preserved between two snapshots.
 * @param {object} before - Snapshot before operation
 * @param {object} after - Snapshot after operation
 * @returns {{ passed: boolean, failures: string[] }}
 */
function assertAuthInvariant(before, after) {
  const failures = [];

  if (!after.isAuthenticated) {
    failures.push(`isAuthenticated changed: ${before.isAuthenticated} → ${after.isAuthenticated}`);
  }

  if (before.accessTokenPresent && !after.accessTokenPresent) {
    failures.push('accessToken was cleared after operation');
  }

  if (before.userId && before.userId !== after.userId) {
    failures.push(`userId changed: ${before.userId} → ${after.userId}`);
  }

  if (after.currentPath === '/login' || after.currentPath === '/') {
    failures.push(`redirected to login: ${before.currentPath} → ${after.currentPath}`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

// ============================================================
// Tests
// ============================================================

test.describe('Customer Receipt Auth Regression — Layer C (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({ text: msg.text(), timestamp: Date.now() });
      }
    });

    // Collect failed network requests
    const failedRequests = [];
    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: Date.now(),
      });
    });

    // Store for test access
    page.__consoleErrors = consoleErrors;
    page.__failedRequests = failedRequests;
  });

  test('Login and verify authenticated state', async ({ page }) => {
    test.skip(!TEST_USERNAME || !TEST_PASSWORD, 'E2E_TEST_USERNAME and E2E_TEST_PASSWORD must be set');

    await page.goto(BASE_URL + '/login');
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="loginId"]', { timeout: 10000 });

    // Fill login form
    await page.fill('input[type="text"], input[name="username"], input[name="loginId"]', TEST_USERNAME);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation to protected route
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    const snapshot = await captureAuthSnapshot(page);
    expect(snapshot.isAuthenticated).toBe(true);
    expect(snapshot.accessTokenPresent).toBe(true);
    expect(snapshot.currentPath).not.toBe('/login');
  });

  test('First Customer Receipt preserves auth state', async ({ page }) => {
    test.skip(!TEST_USERNAME || !TEST_PASSWORD, 'E2E_TEST_USERNAME and E2E_TEST_PASSWORD must be set');

    // Login first
    await page.goto(BASE_URL + '/login');
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="loginId"]', { timeout: 10000 });
    await page.fill('input[type="text"], input[name="username"], input[name="loginId"]', TEST_USERNAME);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Navigate to Customer Receipt workflow
    await page.goto(BASE_URL + '/customer-receipts/create');
    await page.waitForLoadState('networkidle');

    const before = await captureAuthSnapshot(page);

    // Complete Customer Receipt #1
    // Note: Selectors depend on the actual UI implementation
    try {
      // Try common form patterns
      const customerInput = await page.$('input[placeholder*="ลูกค้า"], input[placeholder*="customer"], [data-testid="customer-select"]');
      if (customerInput) {
        await customerInput.fill('1');
      }

      const amountInput = await page.$('input[type="number"], input[placeholder*="จำนวน"], input[placeholder*="amount"]');
      if (amountInput) {
        await amountInput.fill('100');
      }

      const submitButton = await page.$('button[type="submit"], button:has-text("บันทึก"), button:has-text("สร้าง"), button:has-text("save"), button:has-text("create")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('[E2E] Form interaction note:', e.message);
    }

    const after = await captureAuthSnapshot(page);
    const result = assertAuthInvariant(before, after);

    // Assert auth state preserved
    expect(after.isAuthenticated).toBe(true);
    expect(after.accessTokenPresent).toBe(true);
    expect(after.currentPath).not.toBe('/login');

    if (!result.passed) {
      console.log('[E2E EVIDENCE] First receipt auth invariant failures:', result.failures);
      console.log('[E2E EVIDENCE] Console errors:', page.__consoleErrors);
      console.log('[E2E EVIDENCE] Failed requests:', page.__failedRequests);
    }

    // Fail immediately if redirected to login
    if (after.currentPath === '/login' || after.currentPath === '/') {
      test.fail(true, 'Redirected to login after first receipt');
    }
  });

  test('Second Customer Receipt preserves auth state', async ({ page }) => {
    test.skip(!TEST_USERNAME || !TEST_PASSWORD, 'E2E_TEST_USERNAME and E2E_TEST_PASSWORD must be set');

    // Login first
    await page.goto(BASE_URL + '/login');
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="loginId"]', { timeout: 10000 });
    await page.fill('input[type="text"], input[name="username"], input[name="loginId"]', TEST_USERNAME);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Navigate to Customer Receipt workflow
    await page.goto(BASE_URL + '/customer-receipts/create');
    await page.waitForLoadState('networkidle');

    // Complete Receipt #1
    try {
      const customerInput = await page.$('input[placeholder*="ลูกค้า"], input[placeholder*="customer"], [data-testid="customer-select"]');
      if (customerInput) await customerInput.fill('1');
      const amountInput = await page.$('input[type="number"], input[placeholder*="จำนวน"], input[placeholder*="amount"]');
      if (amountInput) await amountInput.fill('100');
      const submitButton = await page.$('button[type="submit"], button:has-text("บันทึก"), button:has-text("สร้าง"), button:has-text("save"), button:has-text("create")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('[E2E] First receipt interaction note:', e.message);
    }

    const before = await captureAuthSnapshot(page);

    // Complete Receipt #2
    try {
      const customerInput = await page.$('input[placeholder*="ลูกค้า"], input[placeholder*="customer"], [data-testid="customer-select"]');
      if (customerInput) await customerInput.fill('2');
      const amountInput = await page.$('input[type="number"], input[placeholder*="จำนวน"], input[placeholder*="amount"]');
      if (amountInput) await amountInput.fill('200');
      const submitButton = await page.$('button[type="submit"], button:has-text("บันทึก"), button:has-text("สร้าง"), button:has-text("save"), button:has-text("create")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('[E2E] Second receipt interaction note:', e.message);
    }

    const after = await captureAuthSnapshot(page);
    const result = assertAuthInvariant(before, after);

    // Assert auth state preserved after second receipt
    expect(after.isAuthenticated).toBe(true);
    expect(after.accessTokenPresent).toBe(true);
    expect(after.currentPath).not.toBe('/login');

    if (!result.passed) {
      console.log('[E2E EVIDENCE] Second receipt auth invariant failures:', result.failures);
      console.log('[E2E EVIDENCE] Console errors:', page.__consoleErrors);
      console.log('[E2E EVIDENCE] Failed requests:', page.__failedRequests);
    }

    // Fail immediately if redirected to login (this is the bug signature)
    if (after.currentPath === '/login' || after.currentPath === '/') {
      // Take screenshot on failure
      await page.screenshot({ path: 'e2e/screenshots/second-receipt-redirect.png', fullPage: true });
      test.fail(true, 'Redirected to login after second receipt — BUG REPRODUCED');
    }
  });

  test('Multiple receipts (5x) preserve auth state throughout', async ({ page }) => {
    test.skip(!TEST_USERNAME || !TEST_PASSWORD, 'E2E_TEST_USERNAME and E2E_TEST_PASSWORD must be set');

    // Login
    await page.goto(BASE_URL + '/login');
    await page.waitForSelector('input[type="text"], input[name="username"], input[name="loginId"]', { timeout: 10000 });
    await page.fill('input[type="text"], input[name="username"], input[name="loginId"]', TEST_USERNAME);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    const before = await captureAuthSnapshot(page);

    for (let i = 1; i <= 5; i++) {
      // Navigate to Customer Receipt workflow
      await page.goto(BASE_URL + '/customer-receipts/create');
      await page.waitForLoadState('networkidle');

      // Complete receipt
      try {
        const customerInput = await page.$('input[placeholder*="ลูกค้า"], input[placeholder*="customer"], [data-testid="customer-select"]');
        if (customerInput) await customerInput.fill(String(i));
        const amountInput = await page.$('input[type="number"], input[placeholder*="จำนวน"], input[placeholder*="amount"]');
        if (amountInput) await amountInput.fill(String(i * 100));
        const submitButton = await page.$('button[type="submit"], button:has-text("บันทึก"), button:has-text("สร้าง"), button:has-text("save"), button:has-text("create")');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        console.log(`[E2E] Receipt #${i} interaction note:`, e.message);
      }

      const current = await captureAuthSnapshot(page);
      const result = assertAuthInvariant(before, current);

      if (!result.passed) {
        console.log(`[E2E EVIDENCE] Auth invariant failed at receipt #${i}:`, result.failures);
        await page.screenshot({ path: `e2e/screenshots/receipt-${i}-failure.png`, fullPage: true });
      }

      expect(current.isAuthenticated).toBe(true);
      expect(current.accessTokenPresent).toBe(true);
      expect(current.currentPath).not.toBe('/login');

      if (current.currentPath === '/login' || current.currentPath === '/') {
        await page.screenshot({ path: `e2e/screenshots/receipt-${i}-redirect.png`, fullPage: true });
        test.fail(true, `Redirected to login at receipt #${i} — BUG REPRODUCED`);
      }
    }
  });
});
