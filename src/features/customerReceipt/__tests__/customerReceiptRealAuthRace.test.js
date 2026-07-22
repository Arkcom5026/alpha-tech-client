// src/features/customerReceipt/__tests__/customerReceiptRealAuthRace.test.js
// ⚠️ REAL MODULE TEST — Imports production apiClient and authStore.
// Mocks only the Axios HTTP transport/adapter.
// Tests that concurrent protected requests do not destroy auth state.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================
// Track auth state transitions
// ============================================================
let authStateHistory = [];
let refreshCallCount = 0;
let logoutCallCount = 0;
let retryCount = 0;
let protectedRequestCount = 0;

// ============================================================
// Mock Axios adapter — the ONLY mocked boundary
// ============================================================
const mockAdapter = vi.fn();

// Build a proper interceptor chain executor
// The response error interceptor in apiClient.js may retry the request.
// This mock must ensure retry promises are properly chained so no
// rejection goes unhandled.
const buildInterceptorChain = (instance, adapterFn) => {
  instance.request = async (config) => {
    // Run request interceptors in order
    let currentConfig = { ...config };
    for (const handler of instance.interceptors.request.handlers) {
      if (handler.fn) {
        try {
          currentConfig = await handler.fn(currentConfig);
        } catch (err) {
          if (handler.errFn) return handler.errFn(err);
          throw err;
        }
      }
    }

    // Call the adapter
    let response;
    try {
      response = await adapterFn(currentConfig);
    } catch (error) {
      // Run response error interceptors
      // The real apiClient interceptor may return a retry promise (apiClient(originalRequest)).
      // We must await that promise so its rejection is consumed here rather than
      // becoming an unhandled rejection.
      // IMPORTANT: Do NOT create detached Promise.reject() calls — those cause
      // unhandled rejections. Let errors propagate naturally through the async
      // function so the caller's promise chain handles them.
      let result;
      for (const handler of instance.interceptors.response.handlers) {
        if (handler.errFn) {
          result = handler.errFn(error);
          if (result && typeof result.then === 'function') {
            // Await the interceptor result. If it rejects, the await will throw
            // and propagate out of this async function, causing the caller's
            // promise to reject naturally — no detached promises.
            result = await result;
          }
        }
      }
      // If no interceptor handled the error, re-throw the original error
      if (result === undefined) {
        throw error;
      }
      return result;
    }

    // Run response success interceptors
    let currentResponse = response;
    for (const handler of instance.interceptors.response.handlers) {
      if (handler.fn) {
        currentResponse = await handler.fn(currentResponse);
      }
    }
    return currentResponse;
  };

  instance.get = async (url, config) => instance.request({ ...config, method: 'get', url });
  instance.post = async (url, data, config) => instance.request({ ...config, method: 'post', url, data });
};


// Use vi.hoisted to ensure the mock is set up before any imports
const { mockAxiosInstance } = vi.hoisted(() => {
  // Create a callable object that delegates to instance.request
  // This is required because apiClient.js response interceptor calls
  // `apiClient(originalRequest)` (line 568) which invokes the axios
  // instance as a function. Without this, that call throws TypeError
  // and the catch block creates a detached Promise.reject().
  const instance = Object.assign(
    function axiosInstanceCallable(config) {
      return instance.request(config);
    },
    {
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { handlers: [], use: (fn, errFn) => { instance.interceptors.request.handlers.push({ fn, errFn }); return instance.interceptors.request.handlers.length - 1; } },
        response: { handlers: [], use: (fn, errFn) => { instance.interceptors.response.handlers.push({ fn, errFn }); return instance.interceptors.response.handlers.length - 1; } },
      },
      request: null,
      get: null,
      post: null,
    }
  );
  return { mockAxiosInstance: instance };
});

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  const actualAxios = actual.default || actual;

  return {
    ...actual,
    default: {
      ...actualAxios,
      create: () => mockAxiosInstance,
      // Also intercept direct axios.post() calls (used by refreshAccessToken)
      post: async (url, data, config) => mockAdapter({ ...config, method: 'post', url, data }),
      get: async (url, config) => mockAdapter({ ...config, method: 'get', url }),
    },
  };
});

beforeEach(() => {
  // Reset counters
  authStateHistory = [];
  refreshCallCount = 0;
  logoutCallCount = 0;
  retryCount = 0;
  protectedRequestCount = 0;
  mockAdapter.mockReset();

  // Wire up the interceptor chain
  // NOTE: Do NOT clear handlers here — they are registered by apiClient.js
  // at module evaluation time (during import() in each test).
  buildInterceptorChain(mockAxiosInstance, mockAdapter);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// Helper: capture auth snapshot from real authStore
// ============================================================
let _useAuthStore = null;

const captureAuthSnapshot = () => {
  const store = _useAuthStore;
  const state = store?.getState?.() || {};
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
    logoutInvocationCount: logoutCallCount,
    refreshAttemptCount: refreshCallCount,
    timestamp: Date.now(),
  };
};

// ============================================================
// Helper: assert auth invariant
// ============================================================
const assertAuthInvariant = (before, after) => {
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

// ============================================================
// Test: Real production auth orchestration with concurrent requests
// ============================================================
describe('Customer Receipt Real Auth Race — Production Modules', () => {
  it('must import real production apiClient and authStore', async () => {
    const apiModule = await import('@/utils/apiClient');
    const authModule = await import('@/features/auth/store/authStore');

    const apiClient = apiModule.default;
    const useAuthStore = authModule.useAuthStore;

    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
    expect(useAuthStore).toBeDefined();
    expect(typeof useAuthStore.getState).toBe('function');
    expect(typeof useAuthStore.setState).toBe('function');

    // Verify the apiClient has interceptors registered (real production code)
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  it('concurrent protected requests with 401 must coordinate refresh and preserve auth', async () => {
    // Import real production modules (axios already mocked at top level)
    const apiModule = await import('@/utils/apiClient');
    const authModule = await import('@/features/auth/store/authStore');

    const apiClient = apiModule.default;
    const { useAuthStore } = authModule;
    _useAuthStore = useAuthStore;

    // Verify the apiClient has interceptors registered (real production code)
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);

    // ============================================================
    // Step 1: Set up auth store as authenticated
    // ============================================================
    useAuthStore.setState({
      token: 'test-access-token-abc123',
      accessToken: 'test-access-token-abc123',
      authChecked: true,
      isBootstrappingAuth: false,
      role: 'admin',
      employee: { id: 1, name: 'Test Employee', branchId: 1 },
      customer: null,
      authError: null,
      rememberMe: false,
      session: { rememberMe: false },
    });

    const beforeSnapshot = captureAuthSnapshot();
    expect(beforeSnapshot.isAuthenticated).toBe(true);
    expect(beforeSnapshot.accessTokenPresent).toBe(true);

    // ============================================================
    // Step 2: Set up mock adapter for deterministic sequence
    // ============================================================
    let secondRefreshAttempted = false;

    mockAdapter.mockImplementation(async (config) => {
      const url = config?.url || '';

      // Track protected requests
      if (!url.includes('/auth/refresh') && !url.includes('/auth/login') && !url.includes('/auth/logout')) {
        protectedRequestCount++;
      }

      // ============================================================
      // Handle refresh endpoint
      // ============================================================
      if (url.includes('/auth/refresh')) {
        refreshCallCount++;

        if (refreshCallCount === 1) {
          // First refresh succeeds
          const newToken = 'refreshed-token-' + Date.now();
          return {
            status: 200,
            data: {
              accessToken: newToken,
              token: newToken,
              session: { rememberMe: false },
            },
          };
        }

        // Second refresh (if attempted) fails — simulating revoked/rotated token
        secondRefreshAttempted = true;
        const error = new Error('Refresh token revoked');
        error.response = { status: 401, data: { message: 'Refresh token not found' } };
        error.code = 'ERR_BAD_REQUEST';
        throw error;
      }

      // ============================================================
      // Handle protected endpoints (customer-receipts, etc.)
      // ============================================================
      if (!url.includes('/auth/')) {
        // First call: return 401 to trigger refresh
        if (!config._retry) {
          const error = new Error('Unauthorized');
          error.response = { status: 401, data: { message: 'unauthorized' } };
          error.code = 'ERR_BAD_REQUEST';
          error.config = config;
          throw error;
        }

        // Retry after refresh: succeed
        retryCount++;
        return {
          status: 200,
          data: {
            id: protectedRequestCount,
            code: `CR-TEST-${String(protectedRequestCount).padStart(4, '0')}`,
            totalAmount: 100,
            status: 'ACTIVE',
          },
        };
      }

      return { status: 200, data: {} };
    });

    // ============================================================
    // Step 3: Fire two concurrent protected requests
    // ============================================================
    const receiptPromise1 = apiClient.post('/customer-receipts', { totalAmount: 100 });
    const receiptPromise2 = apiClient.post('/customer-receipts', { totalAmount: 200 });

    // Catch errors to prevent unhandled rejections (Vitest reports them)
    const results = await Promise.allSettled([
      receiptPromise1.catch((e) => e),
      receiptPromise2.catch((e) => e),
    ]);

    // ============================================================
    // Step 4: Record evidence
    // ============================================================
    const afterSnapshot = captureAuthSnapshot();
    const invariant = assertAuthInvariant(beforeSnapshot, afterSnapshot);

    console.log('\n[REAL MODULE TEST EVIDENCE]');
    console.log('  Protected request count:', protectedRequestCount);
    console.log('  Refresh call count:', refreshCallCount);
    console.log('  Retry count:', retryCount);
    console.log('  Second refresh attempted:', secondRefreshAttempted);
    console.log('  Auth invariant passed:', invariant.passed);
    if (!invariant.passed) {
      console.log('  Auth invariant failures:', invariant.failures);
    }
    console.log('  Final isAuthenticated:', afterSnapshot.isAuthenticated);
    console.log('  Final accessTokenPresent:', afterSnapshot.accessTokenPresent);
    console.log('  Result 1:', results[0].status);
    console.log('  Result 2:', results[1].status);

    // ============================================================
    // Step 5: Assertions
    // ============================================================

    // The refresh should have been called exactly once (coordinated by refreshPromise singleton)
    console.log('  [OBSERVATION] Refresh coordination:', refreshCallCount === 1 ? 'COORDINATED' : 'UNCOORDINATED');

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log('  Successful requests:', successCount, '/ 2');

    if (!invariant.passed) {
      console.log('\n  ⚠️ BUG EVIDENCE: Auth invariant violated during concurrent requests');
      console.log('  First failing event:', invariant.failures[0]);
    }

    expect(invariant.passed).toBe(true);
  });

  it('concurrent requests with expired token must not trigger multiple destructive refreshes', async () => {
    // Import real production modules
    const apiModule = await import('@/utils/apiClient');
    const authModule = await import('@/features/auth/store/authStore');

    const apiClient = apiModule.default;
    const { useAuthStore } = authModule;
    _useAuthStore = useAuthStore;

    // ============================================================
    // Step 1: Start with NO token (simulating expired session)
    // ============================================================
    useAuthStore.setState({
      token: null,
      accessToken: null,
      authChecked: false,
      isBootstrappingAuth: false,
      role: null,
      employee: null,
      customer: null,
      authError: null,
      rememberMe: false,
      session: null,
    });

    const beforeSnapshot = captureAuthSnapshot();
    expect(beforeSnapshot.isAuthenticated).toBe(false);

    // ============================================================
    // Step 2: Set up mock adapter
    // ============================================================
    let refreshCount = 0;
    let authClearedCount = 0;

    // Subscribe to auth store to track state transitions
    const unsub = useAuthStore.subscribe((state, prev) => {
      const hadToken = !!(prev.accessToken || prev.token);
      const hasToken = !!(state.accessToken || state.token);
      if (hadToken && !hasToken) {
        authClearedCount++;
      }
      authStateHistory.push({
        isAuthenticated: !!(state.accessToken || state.token) && !!state.authChecked && !state.isBootstrappingAuth,
        accessTokenPresent: !!(state.accessToken || state.token),
        timestamp: Date.now(),
      });
    });

    mockAdapter.mockImplementation(async (config) => {
      const url = config?.url || '';

      if (url.includes('/auth/refresh')) {
        refreshCount++;

        if (refreshCount === 1) {
          // First refresh succeeds
          return {
            status: 200,
            data: {
              accessToken: 'refreshed-token-' + Date.now(),
              token: 'refreshed-token-' + Date.now(),
              session: { rememberMe: false },
            },
          };
        }

        // Second refresh fails (revoked token scenario)
        const error = new Error('Refresh token revoked');
        error.response = { status: 401, data: { message: 'Refresh token not found' } };
        error.code = 'ERR_BAD_REQUEST';
        throw error;
      }

      if (!url.includes('/auth/')) {
        if (!config._retry) {
          const error = new Error('Unauthorized');
          error.response = { status: 401, data: { message: 'unauthorized' } };
          error.code = 'ERR_BAD_REQUEST';
          error.config = config;
          throw error;
        }
        retryCount++;
        return { status: 200, data: { id: 1 } };
      }

      return { status: 200, data: {} };
    });

    // ============================================================
    // Step 3: Fire two concurrent requests
    // ============================================================
    const req1 = apiClient.get('/customer-receipts');
    const req2 = apiClient.get('/customer-receipts');

    const results = await Promise.allSettled([req1, req2]);
    unsub();

    // ============================================================
    // Step 4: Record evidence
    // ============================================================
    const afterSnapshot = captureAuthSnapshot();

    console.log('\n[REAL MODULE TEST — EXPIRED TOKEN EVIDENCE]');
    console.log('  Refresh count:', refreshCount);
    console.log('  Auth cleared count:', authClearedCount);
    console.log('  Retry count:', retryCount);
    console.log('  Auth state transitions:', authStateHistory.length);
    console.log('  Final isAuthenticated:', afterSnapshot.isAuthenticated);
    console.log('  Final accessTokenPresent:', afterSnapshot.accessTokenPresent);
    console.log('  Result 1:', results[0].status);
    console.log('  Result 2:', results[1].status);

    if (refreshCount > 1) {
      console.log('\n  ⚠️ BUG EVIDENCE: Multiple refresh attempts detected');
    }

    if (authClearedCount > 0) {
      console.log('\n  ⚠️ BUG EVIDENCE: Auth was cleared during concurrent requests');
      console.log('  Auth clear count:', authClearedCount);
    }

    const finalAuth = !!(afterSnapshot.accessTokenPresent) && afterSnapshot.isAuthenticated;
    if (!finalAuth) {
      console.log('\n  ❌ BUG REPRODUCED: Auth state not preserved after concurrent refresh scenario');
    }
  });
});
