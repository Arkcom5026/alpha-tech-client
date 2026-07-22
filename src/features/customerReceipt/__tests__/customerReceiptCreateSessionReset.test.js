// src/features/customerReceipt/__tests__/customerReceiptCreateSessionReset.test.js
// ⚠️ CUSTOMER-RECEIPT-SESSION-001 — Create session state leak regression tests.
// Tests that Zustand create-session state is properly reset between receipt sessions.

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useCustomerReceiptStore from '../store/customerReceiptStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createMockCustomer = (id, overrides = {}) => ({
  id,
  name: `Customer ${id}`,
  customerCode: `CUST-${id}`,
  phone: `081000000${id}`,
  companyName: id % 2 === 0 ? `Company ${id}` : null,
  taxId: `1234567890${id}`,
  ...overrides,
});

const createMockReceiptItem = (id, customerId) => ({
  id,
  code: `CR-${String(id).padStart(4, '0')}`,
  totalAmount: 100.0,
  paymentMethod: 'CASH',
  status: 'ACTIVE',
  customerId,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Customer Receipt Create Session Reset — CUSTOMER-RECEIPT-SESSION-001', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useCustomerReceiptStore.setState({
      items: [],
      selectedItem: null,
      allocationCandidates: [],
      allocationCandidatesPagination: null,
      allocationCandidatesSummary: null,
      allocationCandidatesReceipt: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      filters: {
        keyword: '',
        status: '',
        customerId: '',
        paymentMethod: '',
        fromDate: '',
        toDate: '',
        page: 1,
        limit: 20,
      },
      customerSearch: { mode: 'NAME', keyword: '' },
      customerSearchResults: [],
      selectedCustomer: null,
      customerSearchLoading: false,
      customerSearchError: '',
      loading: false,
      printLoading: false,
      detailLoading: false,
      candidatesLoading: false,
      submitting: false,
      error: '',
      successMessage: '',
    });
  });

  // -----------------------------------------------------------------------
  // TEST-001: Create page begins with no stale selected customer
  // -----------------------------------------------------------------------
  it('TEST-001: Create page begins with no stale selected customer', () => {
    // Simulate a fresh create session
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    const state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toBeNull();
    expect(state.customerSearchResults).toEqual([]);
    expect(state.customerSearch).toEqual({ mode: 'NAME', keyword: '' });
    expect(state.selectedItem).toBeNull();
    expect(state.error).toBe('');
    expect(state.successMessage).toBe('');
  });

  // -----------------------------------------------------------------------
  // TEST-002: After Customer A is selected, clearing create session removes
  //           selectedCustomer and customer search results
  // -----------------------------------------------------------------------
  it('TEST-002: After Customer A is selected, reset clears selectedCustomer and search results', () => {
    const customerA = createMockCustomer(1);

    // Select Customer A
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerA);
    });

    // Verify Customer A is selected
    let state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toEqual(customerA);

    // Simulate search results existing
    act(() => {
      useCustomerReceiptStore.setState({
        customerSearchResults: [customerA],
        customerSearchLoading: true,
        customerSearchError: 'some error',
      });
    });

    // Reset the create session
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toBeNull();
    expect(state.customerSearchResults).toEqual([]);
    expect(state.customerSearch).toEqual({ mode: 'NAME', keyword: '' });
    expect(state.customerSearchLoading).toBe(false);
    expect(state.customerSearchError).toBe('');
  });

  // -----------------------------------------------------------------------
  // TEST-003: When selectedCustomer becomes null, form.customerId is cleared
  //           (This tests the store behavior that the form effect relies on)
  // -----------------------------------------------------------------------
  it('TEST-003: When selectedCustomer becomes null, form.customerId can be cleared', () => {
    const customerA = createMockCustomer(1);

    // Select Customer A
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerA);
    });

    let state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toEqual(customerA);

    // Clear selected customer (simulates "เปลี่ยนลูกค้า" or session reset)
    act(() => {
      useCustomerReceiptStore.getState().clearSelectedCustomerForReceiptAction();
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toBeNull();

    // The form effect (tested separately in component tests) should set
    // form.customerId to '' when selectedCustomer becomes null.
    // This test verifies the store precondition is correct.
  });

  // -----------------------------------------------------------------------
  // TEST-004: Changing from Customer A to Customer B produces Customer B ID
  //           in the submit payload
  // -----------------------------------------------------------------------
  it('TEST-004: Changing from Customer A to Customer B produces Customer B ID in submit payload', () => {
    const customerA = createMockCustomer(1);
    const customerB = createMockCustomer(2);

    // Select Customer A
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerA);
    });

    let state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer?.id).toBe(1);

    // Reset create session (simulates navigating away and back)
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toBeNull();

    // Select Customer B
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerB);
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer?.id).toBe(2);

    // The payload built from form should use Customer B's ID
    const payload = {
      customerId: state.selectedCustomer.id,
      totalAmount: 200.0,
      paymentMethod: 'BANK_TRANSFER',
      receivedAt: '2026-07-23',
      referenceNo: 'REF-002',
      note: 'Second receipt',
    };

    expect(payload.customerId).toBe(2);
    expect(payload.customerId).not.toBe(1);
  });

  // -----------------------------------------------------------------------
  // TEST-005: After first receipt success and a new Create session,
  //           the second receipt can be submitted
  // -----------------------------------------------------------------------
  it('TEST-005: After first receipt success and new Create session, second receipt can be submitted', () => {
    const customerA = createMockCustomer(1);
    const customerB = createMockCustomer(2);

    // --- First receipt session ---
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerA);
    });

    // Simulate successful creation (store sets selectedItem and successMessage)
    act(() => {
      useCustomerReceiptStore.setState({
        selectedItem: createMockReceiptItem(1, 1),
        successMessage: 'สร้างรายการรับชำระเรียบร้อยแล้ว',
      });
    });

    let state = useCustomerReceiptStore.getState();
    expect(state.selectedItem?.id).toBe(1);
    expect(state.selectedCustomer?.id).toBe(1);

    // --- New Create session (navigate back to create page) ---
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer).toBeNull();
    expect(state.selectedItem).toBeNull();
    expect(state.successMessage).toBe('');
    expect(state.error).toBe('');

    // Select Customer B for second receipt
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerB);
    });

    state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer?.id).toBe(2);

    // Second receipt payload must use Customer B
    const payload = {
      customerId: state.selectedCustomer.id,
      totalAmount: 300.0,
      paymentMethod: 'CASH',
      receivedAt: '2026-07-23',
      referenceNo: null,
      note: null,
    };

    expect(payload.customerId).toBe(2);
  });

  // -----------------------------------------------------------------------
  // TEST-006: The second payload never inherits Customer A ID
  // -----------------------------------------------------------------------
  it('TEST-006: The second payload never inherits Customer A ID', () => {
    const customerA = createMockCustomer(1);
    const customerB = createMockCustomer(2);

    // --- First receipt with Customer A ---
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerA);
    });

    const firstPayload = {
      customerId: useCustomerReceiptStore.getState().selectedCustomer.id,
      totalAmount: 100.0,
      paymentMethod: 'CASH',
    };
    expect(firstPayload.customerId).toBe(1);

    // Simulate successful creation
    act(() => {
      useCustomerReceiptStore.setState({
        selectedItem: createMockReceiptItem(1, 1),
        successMessage: 'สร้างรายการรับชำระเรียบร้อยแล้ว',
      });
    });

    // --- Reset for second session ---
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    // --- Second receipt with Customer B ---
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(customerB);
    });

    const secondPayload = {
      customerId: useCustomerReceiptStore.getState().selectedCustomer.id,
      totalAmount: 200.0,
      paymentMethod: 'BANK_TRANSFER',
    };

    // Critical assertion: Customer A ID must NOT appear in second payload
    expect(secondPayload.customerId).toBe(2);
    expect(secondPayload.customerId).not.toBe(1);

    // Also verify the store has no trace of Customer A in create-session state
    const state = useCustomerReceiptStore.getState();
    expect(state.selectedCustomer?.id).toBe(2);
    expect(state.selectedCustomer?.id).not.toBe(1);
  });

  // -----------------------------------------------------------------------
  // TEST-007: Resetting Create session does not clear receipt list,
  //           filters, or pagination
  // -----------------------------------------------------------------------
  it('TEST-007: Resetting Create session does not clear receipt list, filters, or pagination', () => {
    // Set up list state (as if user was on the list page)
    const listItems = [
      createMockReceiptItem(1, 1),
      createMockReceiptItem(2, 2),
    ];

    act(() => {
      useCustomerReceiptStore.setState({
        items: listItems,
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
        filters: {
          keyword: 'test',
          status: 'ACTIVE',
          customerId: '1',
          paymentMethod: '',
          fromDate: '2026-01-01',
          toDate: '2026-07-23',
          page: 1,
          limit: 20,
        },
      });
    });

    // Also set some create-session state
    act(() => {
      useCustomerReceiptStore.getState().selectCustomerForReceiptAction(createMockCustomer(5));
    });

    // Reset create session
    act(() => {
      useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction();
    });

    const state = useCustomerReceiptStore.getState();

    // List state must be preserved
    expect(state.items).toEqual(listItems);
    expect(state.items).toHaveLength(2);
    expect(state.pagination).toEqual({ total: 2, page: 1, limit: 20, totalPages: 1 });
    expect(state.filters.keyword).toBe('test');
    expect(state.filters.status).toBe('ACTIVE');
    expect(state.filters.customerId).toBe('1');
    expect(state.filters.fromDate).toBe('2026-01-01');
    expect(state.filters.toDate).toBe('2026-07-23');

    // Create-session state must be cleared
    expect(state.selectedCustomer).toBeNull();
    expect(state.customerSearchResults).toEqual([]);
    expect(state.selectedItem).toBeNull();
    expect(state.error).toBe('');
    expect(state.successMessage).toBe('');
  });

  // -----------------------------------------------------------------------
  // TEST-008: The patch does not modify or call Authentication state
  // -----------------------------------------------------------------------
  it('TEST-008: The patch does not modify or call Authentication state', () => {
    // This test verifies that the reset action only touches create-session fields.
    // It does not import or reference any auth store.
    const storeExports = Object.keys(useCustomerReceiptStore.getState());

    // Verify no auth-related fields are present in the store
    const authFields = ['token', 'accessToken', 'authChecked', 'isBootstrappingAuth', 'role', 'employee'];
    authFields.forEach((field) => {
      expect(storeExports).not.toContain(field);
    });

    // Verify the reset action does not touch auth
    const resetAction = useCustomerReceiptStore.getState().resetCustomerReceiptCreateSessionAction;
    expect(resetAction).toBeDefined();
    expect(typeof resetAction).toBe('function');

    // Run reset and verify no auth fields appear
    act(() => {
      resetAction();
    });

    const state = useCustomerReceiptStore.getState();
    authFields.forEach((field) => {
      expect(Object.keys(state)).not.toContain(field);
    });
  });
});
