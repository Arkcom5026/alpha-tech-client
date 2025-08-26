// ===============================
// features/bill/store/useBillStore.js
// ===============================
import { create } from 'zustand';
import { getSaleById } from '@/features/sales/api/saleApi';

// Helpers (scoped here to avoid leaking to components)
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const formatThaiDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const useBillStore = create((set) => ({
  sale: null,
  payment: null,
  saleItems: [],
  config: null,
  loading: false,
  error: null,

  resetAction: () => set({ sale: null, payment: null, saleItems: [], config: null, loading: false, error: null }),

  // Load sale by id and normalize for bill layout (Production standard)
  loadSaleByIdAction: async (saleId) => {
    set({ loading: true, error: null });
    try {
      const sale = await getSaleById(saleId);

      // branch + receipt config
      const branch = sale?.branch || {};
      const rc = branch?.receiptConfig || {};
      const vatRate = typeof rc.vatRate === 'number' ? rc.vatRate : 7;

      // normalize sale items: NOTE our SaleItem.amount is VAT-included per piece
      const items = Array.isArray(sale?.items) ? sale.items : [];
      const saleItems = items.map((i) => {
        const qty = 1; // by design: 1 SaleItem = 1 unit (serial-based)
        const amountVatIncl = Number(i?.price ?? i?.amount ?? 0);
        const unitIncl = qty ? amountVatIncl / qty : 0;
        const unitEx = unitIncl / (1 + vatRate / 100);
        const lineEx = unitEx * qty;
        return {
          id: i?.id,
          productName: i?.stockItem?.product?.name || 'ไม่พบชื่อสินค้า',
          productModel: i?.stockItem?.product?.model || 'ไม่พบรุ่นสินค้า',
          quantity: qty,
          unit: i?.stockItem?.product?.template?.unit?.name || '-',
          amount: amountVatIncl, // VAT-included per line (for summary totalling)
          unitPriceExVat: round2(unitEx),
          totalExVat: round2(lineEx),
        };
      });

      // totals
      const total = round2(saleItems.reduce((s, x) => s + (Number(x.amount) || 0), 0));
      const beforeVat = round2(saleItems.reduce((s, x) => s + (Number(x.totalExVat) || 0), 0));
      const vatAmount = round2(total - beforeVat);

      // default payment object if not provided by caller route state
      const payment = {
        saleId: sale?.id,
        paymentMethod: sale?.paymentMethod || '-',
        amount: total,
        note: sale?.note || '',
        sale,
      };

      const config = {
        branchName: rc.branchName || branch.name || '-',
        address: rc.address || branch.address || '-',
        phone: rc.phone || branch.phone || '-',
        taxId: rc.taxId || branch.taxId || '-',
        footerNote: rc.footerNote || '',
        logoUrl: rc.logoUrl || null,
        vatRate,
        formatThaiDate, // pass helper for components if needed
        totals: { total, beforeVat, vatAmount },
      };

      set({ sale, payment, saleItems, config, loading: false });
      return { sale, payment, saleItems, config };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลใบเสร็จได้';
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
