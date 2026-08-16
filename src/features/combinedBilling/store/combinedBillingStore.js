import { create } from 'zustand';
import {
  getCombinableSales,
  createCombinedBillingDocument,
  getCombinedBillingById,
  getCustomersWithPendingSales,
  getDocumentWorkspace,
  confirmDocumentWorkspace,
  listConsolidatedDeliveries,
  getConsolidatedDelivery,
} from '../api/combinedBillingApi';

let combinedBillingCanonicalRequestSequence = 0;
let combinedBillingHistoryRequestSequence = 0;
let combinedBillingDetailRequestSequence = 0;

const useCombinedBillingStore = create((set, get) => ({
  combinableSales: [],
  combinedBilling: null,
  customersWithPendingSales: [],
  customer: null,
  loading: false,
  error: null,
  workspace: [],
  history: [],
  selectedDocument: null,

  // ✅ โหลดรายการใบส่งของที่รวมบิลได้
  loadCombinableSalesAction: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getCombinableSales();
      set({ combinableSales: data });
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ สร้างเอกสารรวมใบส่งของ
  createCombinedBillingDocumentAction: async (saleIds, note = '') => {
    const requestId = ++combinedBillingCanonicalRequestSequence;
    set({ loading: true, error: null });
    try {
      const document = await createCombinedBillingDocument(saleIds, note);
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ combinedBilling: document });
      }
      return document;
    } catch (error) {
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ error });
      }
      throw error;
    } finally {
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ loading: false });
      }
    }
  },

  // ✅ ดึงข้อมูลเอกสารรวมตาม id
  loadCombinedBillingByIdAction: async (id) => {
    const requestId = ++combinedBillingCanonicalRequestSequence;
    const documentIdSnapshot = Number(id);
    set({ combinedBilling: null, loading: true, error: null });
    try {
      const document = await getCombinedBillingById(documentIdSnapshot);
      if (requestId !== combinedBillingCanonicalRequestSequence) return null;
      set({ combinedBilling: document });
      return document;
    } catch (error) {
      if (requestId !== combinedBillingCanonicalRequestSequence) return null;
      set({ error });
      return null;
    } finally {
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ loading: false });
      }
    }
  },

  // ✅ โหลดลูกค้าที่มีใบส่งของค้างรวมบิล
  loadCustomersWithPendingSalesAction: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await getCustomersWithPendingSales();
      set({ customersWithPendingSales: customers });
      return customers;
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ ตั้งค่าลูกค้าที่ถูกเลือก
  setCustomer: (customer) => set({ customer, workspace: [], error: null, loading: false }),

  loadDocumentWorkspaceAction: async (customerId) => {
    const requestedCustomerId = Number(customerId);
    set({ loading: true, error: null });
    try {
      const workspace = await getDocumentWorkspace(customerId);
      const activeCustomerId = Number(get().customer?.id || 0);
      if (activeCustomerId !== requestedCustomerId) {
        return null;
      }
      set({ workspace });
      return workspace;
    } catch (error) {
      const activeCustomerId = Number(get().customer?.id || 0);
      if (activeCustomerId === requestedCustomerId) {
        set({ error });
      }
      throw error;
    } finally {
      const activeCustomerId = Number(get().customer?.id || 0);
      if (activeCustomerId === requestedCustomerId) {
        set({ loading: false });
      }
    }
  },

  confirmDocumentWorkspaceAction: async (payload) => {
    if (get().loading) return null;
    const requestId = ++combinedBillingCanonicalRequestSequence;
    set({ loading: true, error: null });
    try {
      const document = await confirmDocumentWorkspace(payload);
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ combinedBilling: document });
      }
      return document;
    } catch (error) {
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ error });
      }
      throw error;
    } finally {
      if (requestId === combinedBillingCanonicalRequestSequence) {
        set({ loading: false });
      }
    }
  },

  loadHistoryAction: async () => {
    const requestId = ++combinedBillingHistoryRequestSequence;
    try {
      const history = await listConsolidatedDeliveries();
      if (requestId !== combinedBillingHistoryRequestSequence) return null;
      set({ history });
      return history;
    } catch (error) {
      if (requestId !== combinedBillingHistoryRequestSequence) return null;
      throw error;
    }
  },

  loadDocumentDetailAction: async (id) => {
    const requestId = ++combinedBillingDetailRequestSequence;
    const documentIdSnapshot = Number(id);
    set({ selectedDocument: null });
    try {
      const selectedDocument = await getConsolidatedDelivery(documentIdSnapshot);
      if (requestId !== combinedBillingDetailRequestSequence) return null;
      set({ selectedDocument });
      return selectedDocument;
    } catch (error) {
      if (requestId !== combinedBillingDetailRequestSequence) return null;
      throw error;
    }
  },
}));

export default useCombinedBillingStore;
