// src/features/customerReceipt/__tests__/testFactories.js
// ⚠️ TEST FACTORIES — Reusable payload builders for Customer Receipt auth regression tests.

/**
 * Creates the smallest valid Customer Receipt payload.
 * @param {object} overrides - Override specific fields
 * @returns {object} Valid receipt creation payload
 */
export const createValidCustomerReceiptPayload = (overrides = {}) => ({
  customerId: 1,
  totalAmount: 100.0,
  paymentMethod: 'CASH',
  receivedAt: new Date().toISOString(),
  note: 'Test receipt - auth regression',
  ...overrides,
});

/**
 * Creates a mock authenticated session state.
 * @param {object} overrides - Override specific fields
 * @returns {object} Authenticated session state
 */
export const createAuthenticatedTestSession = (overrides = {}) => ({
  token: 'test-access-token-' + Date.now(),
  accessToken: 'test-access-token-' + Date.now(),
  authChecked: true,
  isBootstrappingAuth: false,
  role: 'admin',
  employee: {
    id: 1,
    name: 'Test Employee',
    branchId: 1,
    positionName: 'admin',
    positionKey: 'admin',
  },
  customer: null,
  authError: null,
  rememberMe: false,
  session: {
    rememberMe: false,
    accessTokenExpiresIn: '1h',
    refreshTokenExpiresIn: '1d',
  },
  ...overrides,
});

/**
 * Creates a session with an expired access token (simulates need for refresh).
 * @param {object} overrides - Override specific fields
 * @returns {object} Session with expired token
 */
export const createExpiredAccessTokenSession = (overrides = {}) => ({
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
  ...overrides,
});

/**
 * Creates a mock successful login response.
 * @param {object} overrides - Override specific fields
 * @returns {object} Login response
 */
export const createMockLoginResponse = (overrides = {}) => ({
  token: 'login-access-token-xyz',
  accessToken: 'login-access-token-xyz',
  role: 'ADMIN',
  profileType: 'employee',
  profile: {
    id: 1,
    name: 'Test User',
    phone: '0812345678',
    branch: { id: 1, name: 'Test Branch', slug: 'test-branch' },
    position: { id: 1, name: 'admin' },
  },
  session: {
    rememberMe: false,
    accessTokenExpiresIn: '1h',
    refreshTokenExpiresIn: '1d',
  },
  ...overrides,
});

/**
 * Creates a mock successful receipt creation response.
 * @param {number} receiptNumber - Sequential receipt number
 * @param {object} overrides - Override specific fields
 * @returns {object} Receipt creation response
 */
export const createMockReceiptResponse = (receiptNumber = 1, overrides = {}) => ({
  success: true,
  message: 'สร้างรายการรับชำระเรียบร้อยแล้ว',
  data: {
    id: receiptNumber,
    code: `CR-TEST-${String(receiptNumber).padStart(4, '0')}`,
    totalAmount: 100.0,
    allocatedAmount: 0,
    remainingAmount: 100.0,
    paymentMethod: 'CASH',
    status: 'ACTIVE',
    customerId: 1,
    branchId: 1,
    createdByEmployeeProfileId: 1,
    ...overrides,
  },
});

/**
 * Creates a mock 401 error response.
 * @param {string} message - Error message
 * @returns {Error} Error with response
 */
export const createMock401Error = (message = 'unauthorized') => {
  const error = new Error(`Request failed with status code 401`);
  error.response = { status: 401, data: { message } };
  return error;
};

/**
 * Creates a mock refresh token response.
 * @param {object} overrides - Override specific fields
 * @returns {object} Refresh response
 */
export const createMockRefreshResponse = (overrides = {}) => ({
  token: 'refreshed-token-' + Date.now(),
  accessToken: 'refreshed-token-' + Date.now(),
  role: 'ADMIN',
  profileType: 'employee',
  profile: {
    id: 1,
    name: 'Test User',
    branch: { id: 1, name: 'Test Branch' },
    position: { name: 'admin' },
  },
  session: {
    rememberMe: false,
    accessTokenExpiresIn: '1h',
    refreshTokenExpiresIn: '1d',
  },
  ...overrides,
});
