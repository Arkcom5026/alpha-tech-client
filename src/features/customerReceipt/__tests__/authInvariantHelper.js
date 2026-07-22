// src/features/customerReceipt/__tests__/authInvariantHelper.js
// ⚠️ TEST HELPER — Captures auth state snapshots for regression detection.
// Never logs full token values. Only safe metadata.

/**
 * Captures a safe snapshot of the current auth state.
 * @param {object} authStore - Zustand auth store instance
 * @returns {object} Safe auth snapshot
 */
export const captureAuthSnapshot = (authStore) => {
  const state = authStore.getState?.() || authStore;
  const token = state.accessToken || state.token || null;

  return {
    isAuthenticated: !!(token) && !!state.authChecked && !state.isBootstrappingAuth,
    userId: state.employee?.id || state.customer?.id || null,
    accessTokenPresent: !!token,
    accessTokenPrefix: token ? token.slice(0, 8) + '...' : null,
    accessTokenLength: token ? token.length : 0,
    authChecked: !!state.authChecked,
    isBootstrappingAuth: !!state.isBootstrappingAuth,
    role: state.role || null,
    logoutInvocationCount: globalThis.__logoutCallCount || 0,
    refreshAttemptCount: globalThis.__refreshAttemptCount || 0,
    timestamp: Date.now(),
  };
};

/**
 * Asserts that auth state is preserved between two snapshots.
 * @param {object} before - Snapshot before operation
 * @param {object} after - Snapshot after operation
 * @returns {{ passed: boolean, failures: string[] }}
 */
export const assertAuthInvariant = (before, after) => {
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

  if (after.logoutInvocationCount > before.logoutInvocationCount) {
    failures.push(`logout was called: ${before.logoutInvocationCount} → ${after.logoutInvocationCount}`);
  }

  if (after.refreshAttemptCount > before.refreshAttemptCount + 2) {
    failures.push(`excessive refresh attempts: ${before.refreshAttemptCount} → ${after.refreshAttemptCount}`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
};

/**
 * Creates a mock auth store with controllable state.
 * @param {object} overrides - State overrides
 * @returns {object} Mock auth store
 */
export const createMockAuthStore = (overrides = {}) => {
  const defaultState = {
    token: 'mock-access-token-abc123',
    accessToken: 'mock-access-token-abc123',
    authChecked: true,
    isBootstrappingAuth: false,
    role: 'admin',
    employee: { id: 1, name: 'Test Employee', branchId: 1 },
    customer: null,
    authError: null,
    rememberMe: false,
    session: null,
    ...overrides,
  };

  const listeners = new Set();
  let state = { ...defaultState };

  return {
    getState: () => ({ ...state }),
    setState: (partial) => {
      const prev = { ...state };
      if (typeof partial === 'function') {
        state = { ...state, ...partial(state) };
      } else {
        state = { ...state, ...partial };
      }
      listeners.forEach((fn) => fn(state, prev));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset: (overrides2 = {}) => {
      state = { ...defaultState, ...overrides2 };
    },
  };
};

/**
 * Creates a mock apiClient that can simulate various auth scenarios.
 * @param {object} options - Configuration
 * @returns {object} Mock apiClient
 */
export const createMockApiClient = (options = {}) => {
  const {
    initialToken = 'mock-access-token-abc123',
    refreshShouldFail = false,
    refreshShouldReturnNull = false,
    receiptShouldFail = false,
    receiptShouldReturn401 = false,
  } = options;

  let currentToken = initialToken;
  let refreshCount = 0;
  let receiptCount = 0;

  const mockAxiosInstance = {
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: () => {} },
      response: { use: () => {} },
    },
    get: async (url) => {
      if (url.includes('/auth/me')) {
        if (!currentToken) {
          const err = new Error('Unauthorized');
          err.response = { status: 401, data: { message: 'unauthorized' } };
          throw err;
        }
        return {
          data: {
            role: 'ADMIN',
            profileType: 'employee',
            profile: { id: 1, name: 'Test', branchId: 1 },
          },
        };
      }
      if (url.includes('/customer-receipts')) {
        receiptCount++;
        if (receiptShouldReturn401) {
          const err = new Error('Unauthorized');
          err.response = { status: 401, data: { message: 'unauthorized' } };
          throw err;
        }
        if (receiptShouldFail) {
          throw new Error('Server error');
        }
        return {
          data: {
            id: receiptCount,
            code: `CR-TEST-${receiptCount}`,
            totalAmount: 100,
            status: 'ACTIVE',
          },
        };
      }
      return { data: {} };
    },
    post: async (url) => {
      if (url.includes('/auth/refresh')) {
        refreshCount++;
        globalThis.__refreshAttemptCount = (globalThis.__refreshAttemptCount || 0) + 1;
        if (refreshShouldFail) {
          throw new Error('Refresh failed');
        }
        if (refreshShouldReturnNull) {
          return { data: {} };
        }
        currentToken = `refreshed-token-${Date.now()}`;
        return {
          data: {
            accessToken: currentToken,
            token: currentToken,
            session: { rememberMe: false },
          },
        };
      }
      if (url.includes('/auth/login')) {
        currentToken = 'post-login-token-xyz';
        return {
          data: {
            accessToken: currentToken,
            token: currentToken,
            role: 'ADMIN',
            profileType: 'employee',
            profile: {
              id: 1,
              name: 'Test User',
              branch: { id: 1, name: 'Test Branch' },
              position: { name: 'admin' },
            },
            session: { rememberMe: false },
          },
        };
      }
      if (url.includes('/customer-receipts')) {
        receiptCount++;
        if (receiptShouldReturn401) {
          const err = new Error('Unauthorized');
          err.response = { status: 401, data: { message: 'unauthorized' } };
          throw err;
        }
        return {
          data: {
            id: receiptCount,
            code: `CR-TEST-${receiptCount}`,
            totalAmount: 100,
            status: 'ACTIVE',
          },
        };
      }
      return { data: {} };
    },
    getRefreshCount: () => refreshCount,
    getReceiptCount: () => receiptCount,
    getCurrentToken: () => currentToken,
  };

  return mockAxiosInstance;
};
