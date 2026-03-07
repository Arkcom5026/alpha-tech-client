






// src/features/customerReceipt/store/customerReceiptStore.js

import { create } from 'zustand';

import {
  allocateCustomerReceipt,
  cancelCustomerReceipt,
  createCustomerReceipt,
  getCustomerReceiptAllocationCandidates,
  getCustomerReceiptById,
  searchCustomerReceipts,
  searchCustomerProfilesForReceipt,
} from '../api/customerReceiptApi';

const DEFAULT_FILTERS = {
  keyword: '',
  status: '',
  customerId: '',
  paymentMethod: '',
  fromDate: '',
  toDate: '',
  page: 1,
  limit: 20,
};

const DEFAULT_CUSTOMER_SEARCH = {
  mode: 'NAME',
  keyword: '',
};

const extractErrorMessage = (error, fallbackMessage) => {
  return (
    error?.message ||
    error?.response?.data?.message ||
    fallbackMessage ||
    'เกิดข้อผิดพลาดภายในระบบ'
  );
};

const normalizeReceiptListPayload = (response) => {
  const items = response?.data?.items || [];
  const pagination = response?.data?.pagination || {
    total: items.length,
    page: 1,
    limit: items.length || DEFAULT_FILTERS.limit,
    totalPages: 1,
  };

  return {
    items,
    pagination,
  };
};

const normalizeAllocationCandidatesPayload = (response) => {
  if (Array.isArray(response?.data?.items)) {
    return {
      receipt: response?.data?.receipt || null,
      items: response.data.items,
      pagination: response?.data?.pagination || null,
      summary: response?.data?.summary || null,
    };
  }

  if (Array.isArray(response?.items)) {
    return {
      receipt: response?.receipt || null,
      items: response.items,
      pagination: response?.pagination || null,
      summary: response?.summary || null,
    };
  }

  if (Array.isArray(response?.data)) {
    return {
      receipt: null,
      items: response.data,
      pagination: null,
      summary: null,
    };
  }

  return {
    receipt: null,
    items: [],
    pagination: null,
    summary: null,
  };
};

const normalizeCustomerSearchPayload = (response) => {
  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const useCustomerReceiptStore = create((set, get) => ({
  items: [],
  selectedItem: null,
  allocationCandidates: [],
  allocationCandidatesPagination: null,
  allocationCandidatesSummary: null,
  allocationCandidatesReceipt: null,
  pagination: {
    total: 0,
    page: 1,
    limit: DEFAULT_FILTERS.limit,
    totalPages: 1,
  },
  filters: { ...DEFAULT_FILTERS },
  customerSearch: { ...DEFAULT_CUSTOMER_SEARCH },
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

  setCustomerReceiptFiltersAction: (partialFilters = {}) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...partialFilters,
      },
    }));
  },

  setCustomerReceiptCustomerSearchAction: (partialSearch = {}) => {
    set((state) => ({
      customerSearch: {
        ...state.customerSearch,
        ...partialSearch,
      },
    }));
  },

  clearCustomerReceiptCustomerSearchAction: () => {
    set({
      customerSearch: { ...DEFAULT_CUSTOMER_SEARCH },
      customerSearchResults: [],
      customerSearchError: '',
      customerSearchLoading: false,
    });
  },

  clearSelectedCustomerForReceiptAction: () => {
    set({
      selectedCustomer: null,
    });
  },

  selectCustomerForReceiptAction: (customer) => {
    set({
      selectedCustomer: customer || null,
      customerSearchError: '',
    });
  },

  searchCustomersForReceiptAction: async (overrideSearch = {}) => {
    const mergedSearch = {
      ...get().customerSearch,
      ...overrideSearch,
    };

    const rawKeyword = String(mergedSearch.keyword || '').trim();
    const mode = String(mergedSearch.mode || 'NAME').toUpperCase();

    if (!rawKeyword) {
      set({
        customerSearch: {
          ...mergedSearch,
          keyword: '',
          mode,
        },
        customerSearchResults: [],
        customerSearchLoading: false,
        customerSearchError: 'กรุณากรอกคำค้นลูกค้า',
      });
      return [];
    }

    set({
      customerSearch: {
        ...mergedSearch,
        keyword: rawKeyword,
        mode,
      },
      customerSearchLoading: true,
      customerSearchError: '',
    });

    try {
      const response = await searchCustomerProfilesForReceipt({
        mode,
        keyword: rawKeyword,
      });

      const items = normalizeCustomerSearchPayload(response);

      set({
        customerSearchResults: items,
        customerSearchLoading: false,
        customerSearchError: '',
      });

      return items;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถค้นหาลูกค้าได้');
      set({
        customerSearchResults: [],
        customerSearchLoading: false,
        customerSearchError: message,
      });
      throw error;
    }
  },

  resetCustomerReceiptFiltersAction: () => {
    set({
      filters: { ...DEFAULT_FILTERS },
    });
  },

  clearCustomerReceiptMessagesAction: () => {
    set({
      error: '',
      successMessage: '',
    });
  },

  clearSelectedCustomerReceiptAction: () => {
    set({
      selectedItem: null,
    });
  },

  clearAllocationCandidatesAction: () => {
    set({
      allocationCandidates: [],
      allocationCandidatesPagination: null,
      allocationCandidatesSummary: null,
      allocationCandidatesReceipt: null,
    });
  },

  searchCustomerReceiptsAction: async (overrideFilters = {}) => {
    set({
      loading: true,
      error: '',
    });

    try {
      const mergedFilters = {
        ...get().filters,
        ...overrideFilters,
      };

      const response = await searchCustomerReceipts(mergedFilters);
      const normalized = normalizeReceiptListPayload(response);

      set({
        items: normalized.items,
        pagination: normalized.pagination,
        filters: mergedFilters,
        loading: false,
      });

      return normalized;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถค้นหารายการรับชำระได้');
      set({
        items: [],
        loading: false,
        error: message,
      });
      throw error;
    }
  },

  getCustomerReceiptByIdAction: async (receiptId, params = {}) => {
    set({
      detailLoading: true,
      error: '',
    });

    try {
      const response = await getCustomerReceiptById(receiptId, params);
      const item = response?.data || null;

      set((state) => ({
        selectedItem: item,
        items: item
          ? state.items.some((existing) => existing.id === item.id)
            ? state.items.map((existing) => (existing.id === item.id ? item : existing))
            : [item, ...state.items]
          : state.items,
        detailLoading: false,
      }));

      return item;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถโหลดรายละเอียดใบรับเงินได้');
      set({
        selectedItem: null,
        detailLoading: false,
        error: message,
      });
      throw error;
    }
  },

  loadCustomerReceiptForPrintAction: async (receiptId) => {
    set({
      printLoading: true,
      error: '',
    });

    try {
      const item = await get().getCustomerReceiptByIdAction(receiptId);
      set({
        printLoading: false,
      });
      return item;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถโหลดข้อมูลใบเสร็จเพื่อพิมพ์ได้');
      set({
        printLoading: false,
        error: message,
      });
      throw error;
    }
  },

  createCustomerReceiptAction: async (payload) => {
    set({
      submitting: true,
      error: '',
      successMessage: '',
    });

    try {
      const response = await createCustomerReceipt(payload);
      const createdItem = response?.data || null;

      set({
        selectedItem: createdItem,
        submitting: false,
        successMessage: response?.message || 'สร้างรายการรับชำระเรียบร้อยแล้ว',
      });

      return createdItem;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถสร้างรายการรับชำระได้');
      set({
        submitting: false,
        error: message,
      });
      throw error;
    }
  },

  loadAllocationCandidateSalesAction: async (receiptId, filters = {}) => {
    set({
      candidatesLoading: true,
      error: '',
    });

    try {
      const response = await getCustomerReceiptAllocationCandidates(receiptId, filters);
      const normalized = normalizeAllocationCandidatesPayload(response);

      set({
        allocationCandidates: normalized.items,
        allocationCandidatesPagination: normalized.pagination,
        allocationCandidatesSummary: normalized.summary,
        allocationCandidatesReceipt: normalized.receipt,
        candidatesLoading: false,
      });

      return normalized;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถโหลดบิลค้างชำระได้');
      set({
        allocationCandidates: [],
        allocationCandidatesPagination: null,
        allocationCandidatesSummary: null,
        allocationCandidatesReceipt: null,
        candidatesLoading: false,
        error: message,
      });
      throw error;
    }
  },

  allocateCustomerReceiptAction: async ({ receiptId, saleId, amount, note }) => {
    set({
      submitting: true,
      error: '',
      successMessage: '',
    });

    try {
      const response = await allocateCustomerReceipt(receiptId, {
        saleId,
        amount,
        note,
      });

      const updatedReceipt = response?.data?.receipt || null;

      set((state) => ({
        selectedItem: updatedReceipt || state.selectedItem,
        items: state.items.map((item) =>
          item.id === updatedReceipt?.id ? updatedReceipt : item
        ),
        submitting: false,
        successMessage: response?.message || 'ตัดชำระจากใบรับเงินเรียบร้อยแล้ว',
      }));

      return response?.data || null;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถตัดชำระจากใบรับเงินได้');
      set({
        submitting: false,
        error: message,
      });
      throw error;
    }
  },

  cancelCustomerReceiptAction: async ({ receiptId, cancelReason }) => {
    set({
      submitting: true,
      error: '',
      successMessage: '',
    });

    try {
      const response = await cancelCustomerReceipt(receiptId, {
        cancelReason,
      });

      const cancelledItem = response?.data || null;

      set((state) => ({
        selectedItem: cancelledItem || state.selectedItem,
        items: state.items.map((item) =>
          item.id === cancelledItem?.id ? cancelledItem : item
        ),
        submitting: false,
        successMessage: response?.message || 'ยกเลิกรายการรับชำระเรียบร้อยแล้ว',
      }));

      return cancelledItem;
    } catch (error) {
      const message = extractErrorMessage(error, 'ไม่สามารถยกเลิกรายการรับชำระได้');
      set({
        submitting: false,
        error: message,
      });
      throw error;
    }
  },
}));

export default useCustomerReceiptStore;




