import { updateSaleDocumentLines } from '../api/saleDocumentApi';
import { devError } from '../../shared/saleStoreSupport';

export const createSaleDocumentRuntimeSlice = (set, get) => ({
  updateSaleDocumentLinesAction: async (saleId, payload, options = {}) => {
    try {
      const normalizedSaleId = Number(saleId);

      if (!Number.isInteger(normalizedSaleId) || normalizedSaleId <= 0) {
        const msg = 'Sale ID ไม่ถูกต้อง';
        set({ error: msg });
        return { ok: false, error: msg };
      }

      set({ loading: true, error: null });

      const result = await updateSaleDocumentLines(normalizedSaleId, payload || {});

      if (options?.refresh !== false) {
        await get().getSaleByIdAction(normalizedSaleId);
      }

      return {
        ok: true,
        data: result,
      };
    } catch (err) {
      devError('[updateSaleDocumentLinesAction]', err);

      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ';

      set({ error: msg });

      return {
        ok: false,
        error: msg,
      };
    } finally {
      set({ loading: false });
    }
  },
});
