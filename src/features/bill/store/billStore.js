




// ===============================
// features/bill/store/billStore.js
// ===============================
import { create } from 'zustand';
import { getSaleById } from '@/features/sales/api/saleApi';

// 🔒 In-flight guard: กันยิงซ้ำจากหลาย render/หลาย effect (print window มัก call ซ้ำ)
// IMPORTANT: ต้องรองรับการเรียกพร้อมกันหลาย saleId ได้ (เช่น user เปิดหลายแท็บ)
const _inflightBySaleId = new Map();

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isUnauthorizedError = (err) => {
  const status = err?.response?.status ?? err?.status;
  return Number(status) === 401;
};

const getFriendlyBillErrorMessage = (err) => {
  if (isUnauthorizedError(err)) {
    return 'สิทธิ์การใช้งานหมดอายุชั่วคราว กรุณารอสักครู่แล้วลองโหลดใบเสร็จใหม่อีกครั้ง';
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return 'ไม่สามารถโหลดข้อมูลใบเสร็จได้';
};

const loadSaleForPrintWithAuthRetry = async (saleId, params) => {
  try {
    return await getSaleById(saleId, params);
  } catch (err) {
    if (!isUnauthorizedError(err)) {
      throw err;
    }

    // หน้า print อาจ mount ระหว่าง apiClient กำลัง refresh token
    // retry เฉพาะ transient 401 หนึ่งครั้ง เพื่อไม่ให้ผู้ใช้เจอ error ที่ recover ได้เอง
    await delay(300);
    return getSaleById(saleId, params);
  }
};

export const useBillStore = create((set, get) => ({
  sale: null,
  payment: null,
  saleItems: [],
  config: null,
  loading: false,
  error: null,

  resetAction: () => set({ sale: null, payment: null, saleItems: [], config: null, loading: false, error: null }),

  // Load sale by id and normalize for bill layout (Production standard)
  loadSaleByIdAction: async (saleId, options) => {
    if (!saleId) {
      const message = 'ไม่พบ saleId สำหรับการพิมพ์บิล';
      set({ loading: false, error: message });
      throw new Error(message);
    }

    // optional: used to disambiguate payment selection on print pages (e.g., refresh with ?paymentId=...)
    const requestedPaymentId = options?.paymentId ? String(options.paymentId) : '';

    // ✅ cache: ถ้าโหลด saleId เดิมแล้ว ไม่ต้องยิงซ้ำ (แต่ถ้ามี paymentId มา ต้องตรงกันด้วย)
    const current = get();
    const currentPaymentId = current?.payment?.id != null ? String(current.payment.id) : '';
    if (current?.sale?.id != null && String(current.sale.id) === String(saleId) && !current?.error) {
      if (!requestedPaymentId || requestedPaymentId === currentPaymentId) {
        return { sale: current.sale, payment: current.payment, saleItems: current.saleItems, config: current.config };
      }
      // paymentId ไม่ตรง → ต้องรีโหลดเพื่อเลือก payment ที่ถูกต้อง
    }

    // 🔒 in-flight: ถ้ามี request ของ saleId เดิมอยู่ ให้รอผลเดิม
    const requestKey = `${String(saleId)}:${requestedPaymentId}`;
    const inflight = _inflightBySaleId.get(requestKey);
    if (inflight) {
      return inflight;
    }

    set({ loading: true, error: null });

    try {
      const job = (async () => {
        const sale = await loadSaleForPrintWithAuthRetry(saleId, {
          // ✅ print pages always need payments for correct receipt selection
          includePayments: 1,
          ...(requestedPaymentId ? { paymentId: requestedPaymentId } : {}),
          // ✅ support apiClient params shape as well
          params: {
            includePayments: 1,
            ...(requestedPaymentId ? { paymentId: requestedPaymentId } : {}),
          },
        });

        // payments (defensive): รองรับหลาย payment ต่อ 1 sale (กรณีพิมพ์ย้อนหลัง)
        const payments = Array.isArray(sale?.payments)
          ? sale.payments
          : Array.isArray(sale?.paymentItems)
            ? sale.paymentItems
            : [];
        const pickPaymentById = (list, id) => {
          if (!id) return null;
          const sid = String(id);
          return list.find((p) => String(p?.id) === sid) || null;
        };

        // branch + receipt config
        const branch = sale?.branch || {};
        const rc = branch?.receiptConfig || {};
        const vatRate = typeof rc.vatRate === 'number' ? rc.vatRate : 7;

        // normalize sale items: NOTE our SaleItem.amount is VAT-included per piece
        // UI wording: name => คำเรียก, model => สเปกสินค้า (SKU)
        const items = Array.isArray(sale?.items) ? sale.items : [];
        const saleItems = items.map((i) => {
          const qty = 1; // by design: 1 SaleItem = 1 unit (serial-based)
          const amountVatIncl = Number(i?.price ?? i?.amount ?? 0);
          const unitIncl = qty ? amountVatIncl / qty : 0;
          const unitEx = unitIncl / (1 + vatRate / 100);
          const lineEx = unitEx * qty;
          return {
            id: i?.id,
            productName: i?.stockItem?.product?.name || 'ไม่พบคำเรียกสินค้า',
            productModel: i?.stockItem?.product?.model || 'ไม่พบสเปกสินค้า (SKU)',
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

        // default payment object (เลือกจาก paymentId ถ้ามี) เพื่อรองรับ refresh / เปิดลิงก์ตรง
        const picked = pickPaymentById(payments, requestedPaymentId);
        const paymentMethodSafe = picked?.paymentMethod || sale?.paymentMethod || '-';
        const noteSafe = picked?.note ?? sale?.note ?? '';
        const receivedAtSafe = picked?.receivedAt || sale?.createdAt || null;
        const paymentAmountSafe = round2(picked?.amount ?? picked?.paidAmount ?? total);

        const payment = {
          id: picked?.id ?? null,
          saleId: sale?.id,
          paymentMethod: paymentMethodSafe,
          amount: paymentAmountSafe,
          note: noteSafe,
          receivedAt: receivedAtSafe,
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
      })();

      _inflightBySaleId.set(requestKey, job);
      return await job;
    } catch (err) {
      const message = getFriendlyBillErrorMessage(err);
      set({ error: message, loading: false });
      throw err;
    } finally {
      // 🔓 clear in-flight (สำเร็จหรือ fail ก็ต้อง clear เฉพาะ key นี้)
      _inflightBySaleId.delete(requestKey);
    }
  },
}));













