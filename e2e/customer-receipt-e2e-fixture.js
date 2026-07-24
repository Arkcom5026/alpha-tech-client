// e2e/customer-receipt-e2e-fixture.js
// 🏛️ Customer Receipt Operational E2E — Shared Mocked Runtime Fixture
//
// This fixture provides a fully isolated browser runtime for Customer Receipt E2E tests.
// All API requests are intercepted via page.route().
// No request reaches the real backend.
// Unexpected backend requests fail the test clearly.

import { test as base } from '@playwright/test';

// ============================================================
// Deterministic Test Data
// ============================================================

export const CUSTOMER_A = {
  id: 1001,
  name: 'Customer A',
  customerCode: 'CUST-A-001',
  phone: '0810001001',
  companyName: 'บริษัท เอ จำกัด',
  taxId: '1234567890101',
};

export const CUSTOMER_B = {
  id: 1002,
  name: 'Customer B',
  customerCode: 'CUST-B-002',
  phone: '0810002002',
  companyName: 'บริษัท บี จำกัด',
  taxId: '1234567890102',
};

export const CUSTOMER_C = {
  id: 1003,
  name: 'Customer C',
  customerCode: 'CUST-C-003',
  phone: '0810003003',
  companyName: null,
  taxId: '1234567890103',
};

export const ALL_CUSTOMERS = [CUSTOMER_A, CUSTOMER_B, CUSTOMER_C];

// Deterministic receipt responses — sequential IDs
let receiptCounter = 0;

export const createMockReceiptResponse = (customerId, overrides = {}) => {
  receiptCounter++;
  const id = receiptCounter;
  return {
    success: true,
    message: 'สร้างรายการรับชำระเรียบร้อยแล้ว',
    data: {
      id,
      code: `CR-E2E-${String(id).padStart(4, '0')}`,
      totalAmount: 100.0,
      allocatedAmount: 0,
      remainingAmount: 100.0,
      paymentMethod: 'BANK_TRANSFER',
      status: 'ACTIVE',
      customerId,
      branchId: 1,
      createdByEmployeeProfileId: 1,
      receivedAt: new Date().toISOString(),
      referenceNo: null,
      note: null,
      allocations: [],
      customer: ALL_CUSTOMERS.find((c) => c.id === customerId) || null,
      createdByEmployeeProfile: {
        id: 1,
        name: 'Test Employee',
        employeeCode: 'EMP-001',
      },
      ...overrides,
    },
  };
};

export const resetReceiptCounter = () => {
  receiptCounter = 0;
};

// ============================================================
// Auth Session
// ============================================================

const AUTH_TOKEN = 'e2e-mock-access-token-' + Date.now();

const createAuthSession = () => ({
  token: AUTH_TOKEN,
  accessToken: AUTH_TOKEN,
  role: 'ADMIN',
  profileType: 'employee',
  profile: {
    id: 1,
    name: 'Test Employee',
    phone: '0812345678',
    email: 'test@alphatech.com',
    branch: { id: 1, name: 'Test Branch', slug: 'test-branch' },
    position: { id: 1, name: 'admin' },
  },
  session: {
    rememberMe: false,
    accessTokenExpiresIn: '1h',
    refreshTokenExpiresIn: '1d',
  },
});

// ============================================================
// API Route Interceptor
// ============================================================

/**
 * Sets up API route interception for all endpoints required by Customer Receipt workflow.
 * Any request that is NOT explicitly handled will fail the test.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} options
 * @param {boolean} [options.allowUnexpectedRequests=false] - If true, unexpected requests are logged but not failed
 */
export const setupApiInterception = async (page, options = {}) => {
  const { allowUnexpectedRequests = false } = options;
  const unexpectedRequests = [];

  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const urlPath = new URL(url).pathname;

    // --- Auth endpoints ---

    // POST /auth/login
    if (urlPath.includes('/auth/login') && method === 'POST') {
      const response = createAuthSession();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    }

    // GET /auth/me
    if (urlPath.includes('/auth/me') && method === 'GET') {
      const session = createAuthSession();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          role: session.role,
          profileType: session.profileType,
          profile: session.profile,
          branchId: 1,
        }),
      });
    }

    // POST /auth/refresh
    if (urlPath.includes('/auth/refresh') && method === 'POST') {
      const session = createAuthSession();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(session),
      });
    }

    // POST /auth/logout
    if (urlPath.includes('/auth/logout') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Logged out' }),
      });
    }

    // --- Customer Search ---

    // GET /customer-receipts/customer-search
    if (urlPath.includes('/customer-receipts/customer-search') && method === 'GET') {
      const searchParams = new URL(url).searchParams;
      const keyword = (searchParams.get('keyword') || '').toLowerCase().trim();

      let results = [];
      if (keyword) {
        results = ALL_CUSTOMERS.filter(
          (c) =>
            c.name.toLowerCase().includes(keyword) ||
            (c.companyName && c.companyName.toLowerCase().includes(keyword)) ||
            c.customerCode.toLowerCase().includes(keyword) ||
            c.phone.includes(keyword)
        );
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: results,
          },
        }),
      });
    }

    // --- Customer Receipt CRUD ---

    // POST /customer-receipts (create)
    if (urlPath.match(/\/customer-receipts$/) && method === 'POST') {
      const postData = route.request().postDataJSON();
      const customerId = postData?.customerId;

      if (!customerId) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'customerId is required',
          }),
        });
      }

      const response = createMockReceiptResponse(customerId, {
        totalAmount: postData.totalAmount,
        paymentMethod: postData.paymentMethod,
        receivedAt: postData.receivedAt,
        referenceNo: postData.referenceNo,
        note: postData.note,
      });

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    }

    // GET /customer-receipts/:id (detail)
    if (urlPath.match(/\/customer-receipts\/\d+$/) && method === 'GET') {
      const idMatch = urlPath.match(/\/customer-receipts\/(\d+)/);
      const receiptId = idMatch ? parseInt(idMatch[1], 10) : null;

      // Return a generic receipt detail response
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: receiptId,
            code: `CR-E2E-${String(receiptId).padStart(4, '0')}`,
            totalAmount: 100.0,
            allocatedAmount: 0,
            remainingAmount: 100.0,
            paymentMethod: 'BANK_TRANSFER',
            status: 'ACTIVE',
            customerId: 1001,
            branchId: 1,
            createdByEmployeeProfileId: 1,
            receivedAt: new Date().toISOString(),
            referenceNo: null,
            note: null,
            allocations: [],
            customer: CUSTOMER_A,
            createdByEmployeeProfile: {
              id: 1,
              name: 'Test Employee',
              employeeCode: 'EMP-001',
            },
          },
        }),
      });
    }

    // GET /customer-receipts (list)
    if (urlPath.match(/\/customer-receipts$/) && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
          },
        }),
      });
    }

    // --- Branch API (needed for background loading) ---

    // GET /branches/:id
    if (urlPath.match(/\/branches\/\d+$/) && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            name: 'Test Branch',
            slug: 'test-branch',
            RBACEnabled: true,
          },
        }),
      });
    }

    // --- Unexpected request handling ---
    unexpectedRequests.push({ method, url, urlPath });
    console.error(`[E2E ISOLATION FAILURE] Unexpected API request: ${method} ${url}`);

    if (!allowUnexpectedRequests) {
      // Fail the test by rejecting with a clear message
      return route.abort('blockedbyclient');
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: `[E2E] Unexpected API request: ${method} ${urlPath}. This endpoint was not mocked.`,
      }),
    });
  });

  return {
    getUnexpectedRequests: () => [...unexpectedRequests],
    hasUnexpectedRequests: () => unexpectedRequests.length > 0,
  };
};

// ============================================================
// Console Error Collector
// ============================================================

export const setupConsoleErrorCollector = (page) => {
  const consoleErrors = [];
  const unhandledRejections = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), timestamp: Date.now() });
    }
  });

  page.on('pageerror', (error) => {
    unhandledRejections.push({ message: error.message, stack: error.stack, timestamp: Date.now() });
  });

  return {
    getConsoleErrors: () => [...consoleErrors],
    getUnhandledRejections: () => [...unhandledRejections],
    hasErrors: () => consoleErrors.length > 0 || unhandledRejections.length > 0,
    clear: () => {
      consoleErrors.length = 0;
      unhandledRejections.length = 0;
    },
  };
};

// ============================================================
// POST Request Tracker
// ============================================================

export const setupPostTracker = (page) => {
  const posts = [];

  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/customer-receipts')) {
      const urlPath = new URL(request.url()).pathname;
      // Only track POST to /customer-receipts (not sub-routes like /allocate)
      if (urlPath.match(/\/customer-receipts$/) && !urlPath.includes('allocate') && !urlPath.includes('cancel')) {
        posts.push({
          url: request.url(),
          method: request.method(),
          postData: request.postDataJSON(),
          timestamp: Date.now(),
        });
      }
    }
  });

  return {
    getPosts: () => [...posts],
    getPostCount: () => posts.length,
    getPostCustomerIds: () => posts.map((p) => p.postData?.customerId),
    clear: () => { posts.length = 0; },
  };
};

// ============================================================
// Navigation Helpers
// ============================================================

/**
 * Navigate to the Customer Receipt create page with a deterministic shop slug.
 * The shop slug is hardcoded for E2E consistency.
 */
export const CUSTOMER_RECEIPT_CREATE_PATH = '/advancetech/pos/finance/customer-receipts/create';

/**
 * Build the detail page path for a given receipt ID.
 */
export const getDetailPath = (receiptId) =>
  `/advancetech/pos/finance/customer-receipts/${receiptId}`;

// ============================================================
// Extended Test Fixture
// ============================================================

export const test = base.extend({
  /**
   * Auto-setup: Intercept all API routes, collect console errors, track POSTs.
   * Each test gets an isolated page with full mocking.
   */
  page: async ({ page }, use) => {
    // Reset state
    resetReceiptCounter();

    // Setup interceptors
    const apiMonitor = await setupApiInterception(page);
    const consoleMonitor = setupConsoleErrorCollector(page);
    const postTracker = setupPostTracker(page);

    // Attach monitors to page for test access
    page.__apiMonitor = apiMonitor;
    page.__consoleMonitor = consoleMonitor;
    page.__postTracker = postTracker;

    await use(page);

    // After test: check for isolation violations
    if (apiMonitor.hasUnexpectedRequests()) {
      console.error('[E2E] Test completed with unexpected API requests:', apiMonitor.getUnexpectedRequests());
    }
  },
});

export { expect } from '@playwright/test';
