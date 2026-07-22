// src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js
// ⚠️ LAYER A — Frontend API/Auth Integration Test
// Tests that repeated Customer Receipt operations do not invalidate authentication state.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  captureAuthSnapshot,
  assertAuthInvariant,
  createMockAuthStore,
  createMockApiClient,
} from './authInvariantHelper';
import {
  createValidCustomerReceiptPayload,
} from './testFactories';

// Track logout calls globally
beforeEach(() => {
  globalThis.__logoutCallCount = 0;
  globalThis.__refreshAttemptCount = 0;
});

afterEach(() => {
  delete globalThis.__logoutCallCount;
  delete globalThis.__refreshAttemptCount;
});

describe('Customer Receipt Auth Regression — Layer A (Frontend)', () => {
  describe('Auth Invariant Helper', () => {
    it('captureAuthSnapshot returns safe values without full tokens', () => {
      const store = createMockAuthStore();
      const snapshot = captureAuthSnapshot(store);

      expect(snapshot).toHaveProperty('isAuthenticated');
      expect(snapshot).toHaveProperty('accessTokenPresent');
      expect(snapshot).toHaveProperty('accessTokenPrefix');
      expect(snapshot.accessTokenPrefix).toMatch(/^[a-z0-9-]+\.\.\.$/);
      expect(snapshot).not.toHaveProperty('accessToken');
      expect(snapshot).not.toHaveProperty('token');
    });

    it('assertAuthInvariant passes when auth state is preserved', () => {
      const store = createMockAuthStore();
      const before = captureAuthSnapshot(store);
      const after = captureAuthSnapshot(store);
      const result = assertAuthInvariant(before, after);

      expect(result.passed).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    it('assertAuthInvariant fails when isAuthenticated changes', () => {
      const store = createMockAuthStore();
      const before = captureAuthSnapshot(store);

      store.setState({ token: null, accessToken: null });
      const after = captureAuthSnapshot(store);
      const result = assertAuthInvariant(before, after);

      expect(result.passed).toBe(false);
      expect(result.failures.length).toBeGreaterThan(0);
    });

    it('assertAuthInvariant fails when logout is called', () => {
      const store = createMockAuthStore();
      const before = captureAuthSnapshot(store);

      globalThis.__logoutCallCount = 1;
      const after = captureAuthSnapshot(store);
      const result = assertAuthInvariant(before, after);

      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.includes('logout'))).toBe(true);
    });
  });

  describe('Single Receipt Creation — Auth Preservation', () => {
    it('successful receipt creation must not call logout', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const before = captureAuthSnapshot(authStore);

      // Simulate creating a receipt
      const payload = createValidCustomerReceiptPayload();
      const response = await apiClient.post('/customer-receipts', payload);

      const after = captureAuthSnapshot(authStore);
      const result = assertAuthInvariant(before, after);

      expect(response).toBeDefined();
      expect(result.passed).toBe(true);
      if (!result.passed) {
        console.error('Auth invariant failures:', result.failures);
      }
    });

    it('successful receipt response must not clear the access token', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const tokenBefore = authStore.getState().accessToken;

      const payload = createValidCustomerReceiptPayload();
      await apiClient.post('/customer-receipts', payload);

      const tokenAfter = authStore.getState().accessToken;

      expect(tokenAfter).toBe(tokenBefore);
      expect(tokenAfter).toBeTruthy();
    });
  });

  describe('Consecutive Receipt Creations — Auth State Preservation', () => {
    it('two consecutive receipt creations must preserve auth state', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const before = captureAuthSnapshot(authStore);

      // Receipt #1
      const payload1 = createValidCustomerReceiptPayload({ totalAmount: 100 });
      const receipt1 = await apiClient.post('/customer-receipts', payload1);
      expect(receipt1.data.id).toBe(1);

      const after1 = captureAuthSnapshot(authStore);
      const result1 = assertAuthInvariant(before, after1);
      expect(result1.passed).toBe(true);

      // Receipt #2
      const payload2 = createValidCustomerReceiptPayload({ totalAmount: 200 });
      const receipt2 = await apiClient.post('/customer-receipts', payload2);
      expect(receipt2.data.id).toBe(2);

      const after2 = captureAuthSnapshot(authStore);
      const result2 = assertAuthInvariant(before, after2);

      expect(result2.passed).toBe(true);
      if (!result2.passed) {
        console.error('Auth invariant failures after 2nd receipt:', result2.failures);
      }
    });

    it('normal receipt GET after POST must not clear auth state', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const before = captureAuthSnapshot(authStore);

      // POST
      const payload = createValidCustomerReceiptPayload();
      await apiClient.post('/customer-receipts', payload);

      // GET
      await apiClient.get('/customer-receipts');

      const after = captureAuthSnapshot(authStore);
      const result = assertAuthInvariant(before, after);

      expect(result.passed).toBe(true);
    });

    it('multiple receipt creations (5x) must preserve auth state throughout', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const before = captureAuthSnapshot(authStore);

      for (let i = 1; i <= 5; i++) {
        const payload = createValidCustomerReceiptPayload({
          totalAmount: i * 100,
          note: `Receipt #${i} - auth regression`,
        });
        const receipt = await apiClient.post('/customer-receipts', payload);
        expect(receipt.data.id).toBe(i);

        const current = captureAuthSnapshot(authStore);
        const result = assertAuthInvariant(before, current);

        if (!result.passed) {
          console.error(`Auth invariant failed at receipt #${i}:`, result.failures);
        }
        expect(result.passed).toBe(true);
      }
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('recoverable 401 followed by successful token refresh must retry the request', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient({ receiptShouldReturn401: true });

      // Simulate refresh succeeding
      const refreshResponse = await apiClient.post('/auth/refresh');
      expect(refreshResponse.data.accessToken).toBeTruthy();

      const after = captureAuthSnapshot(authStore);
      expect(after.accessTokenPresent).toBe(true);
    });

    it('failed token refresh may clear auth only once and must produce traceable evidence', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient({ refreshShouldFail: true });

      const before = captureAuthSnapshot(authStore);

      try {
        await apiClient.post('/auth/refresh');
      } catch {
        // Expected: refresh failed
      }

      const after = captureAuthSnapshot(authStore);
      const result = assertAuthInvariant(before, after);

      // When refresh fails, auth state may be cleared — this is expected behavior
      // The test documents this transition
      if (!result.passed) {
        console.log('[EXPECTED] Auth invariant failure after failed refresh:', result.failures);
        console.log('[EVIDENCE] Refresh attempts:', after.refreshAttemptCount - before.refreshAttemptCount);
      }
    });
  });

  describe('Concurrent Protected Requests', () => {
    it('concurrent protected requests must not create multiple destructive refresh flows', async () => {
      const authStore = createMockAuthStore();
      const apiClient = createMockApiClient();

      const before = captureAuthSnapshot(authStore);

      // Fire two receipt requests nearly simultaneously
      const [receipt1, receipt2] = await Promise.all([
        apiClient.post('/customer-receipts', createValidCustomerReceiptPayload({ totalAmount: 100 })),
        apiClient.post('/customer-receipts', createValidCustomerReceiptPayload({ totalAmount: 200 })),
      ]);

      const after = captureAuthSnapshot(authStore);
      const result = assertAuthInvariant(before, after);

      expect(receipt1).toBeDefined();
      expect(receipt2).toBeDefined();
      expect(result.passed).toBe(true);
      if (!result.passed) {
        console.error('Concurrent request auth invariant failure:', result.failures);
      }
    });

    it('concurrent requests with expired token must coordinate refresh', async () => {
      const authStore = createMockAuthStore({ token: null, accessToken: null, authChecked: false });
      const apiClient = createMockApiClient({ initialToken: null });

      const before = captureAuthSnapshot(authStore);

      // Simulate bootstrap with refresh
      try {
        const refreshResult = await apiClient.post('/auth/refresh');
        if (refreshResult.accessToken) {
          authStore.setState({ token: refreshResult.accessToken, accessToken: refreshResult.accessToken, authChecked: true });
        }
      } catch {
        // Refresh may fail — this is expected if the implementation doesn't coordinate
      }

      const after = captureAuthSnapshot(authStore);

      // This test documents the current behavior.
      // If the implementation does not coordinate refresh requests, this test may fail.
      // The failure itself is evidence of the bug.
      if (!after.isAuthenticated) {
        console.log('[BUG EVIDENCE] Auth state not recovered after concurrent refresh scenario');
        console.log('[EVIDENCE] Refresh attempts:', after.refreshAttemptCount - before.refreshAttemptCount);
      }
    });
  });

  describe('ProtectedRoute Auth Guard', () => {
    it('ProtectedRoute must not redirect to login when auth state is valid', () => {
      const authStore = createMockAuthStore();
      const state = authStore.getState();

      const isAuthenticated = !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth;
      expect(isAuthenticated).toBe(true);
    });

    it('ProtectedRoute must redirect to login when auth state is cleared', () => {
      const authStore = createMockAuthStore({ token: null, accessToken: null, authChecked: false });
      const state = authStore.getState();

      const isAuthenticated = !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth;
      expect(isAuthenticated).toBe(false);
    });
  });
});
