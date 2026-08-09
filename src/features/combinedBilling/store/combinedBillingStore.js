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

const useCombinedBillingStore = create((set) => ({
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
    set({ loading: true, error: null });
    try {
      const document = await createCombinedBillingDocument(saleIds, note);
      set({ combinedBilling: document });
      return document;
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ ดึงข้อมูลเอกสารรวมตาม id
  loadCombinedBillingByIdAction: async (id) => {
    set({ loading: true, error: null });
    try {
      const document = await getCombinedBillingById(id);
      set({ combinedBilling: document });
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ โหลดลูกค้าที่มีใบส่งของค้างรวมบิล
  loadCustomersWithPendingSalesAction: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await getCustomersWithPendingSales();
      set({ customersWithPendingSales: customers });
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ ตั้งค่าลูกค้าที่ถูกเลือก
  setCustomer: (customer) => set({ customer, workspace: [] }),
  loadDocumentWorkspaceAction: async (customerId) => {
    set({ loading: true, error: null });
    try { const workspace = await getDocumentWorkspace(customerId); set({ workspace }); return workspace; }
    catch (error) { set({ error }); throw error; }
    finally { set({ loading: false }); }
  },
  confirmDocumentWorkspaceAction: async (payload) => {
    set({ loading: true, error: null });
    try { const document = await confirmDocumentWorkspace(payload); set({ combinedBilling: document }); return document; }
    catch (error) { set({ error }); throw error; }
    finally { set({ loading: false }); }
  },
  loadHistoryAction: async () => { const history = await listConsolidatedDeliveries(); set({ history }); return history; },
  loadDocumentDetailAction: async (id) => { const selectedDocument = await getConsolidatedDelivery(id); set({ selectedDocument }); return selectedDocument; },
}));

export default useCombinedBillingStore;
