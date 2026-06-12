// ===============================
// features/bill/store/billStore.js
// ===============================
import { create } from 'zustand';
import { getSaleById } from '@/features/sales/api/saleApi';

const _inflightBySaleId = new Map();

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

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const resolveSaleItemProductName = (item) =>
  item?.stockItem?.product?.name ||
  item?.product?.name ||
  item?.productName ||
  'ไม่พบคำเรียกสินค้า';

const buildSaleDocumentLineDescription = (item) => {
  const documentDescription = normalizeDocumentText(item?.documentDescription);
  return documentDescription || resolveSaleItemProductName(item);
};

const loadSaleForPrintWithAuthRetry = async (saleId, params) => {
  try {
    return await getSaleById(saleId, params);
  } catch (err) {
    if (!isUnauthorizedError(err)) throw err;

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

  resetAction: () =>
    set({
      sale: null,
      payment: null,
      saleItems: [],
      config: null,
      loading: false,
      error: null,
    }),

  loadSaleByIdAction: async (saleId, options) => {
    if (!saleId) {
      const message = 'ไม่พบ saleId สำหรับการพิมพ์บิล';
      set({ loading: false, error: message });
      throw new Error(message);
    }

    const requestedPaymentId = options?.paymentId ? String(options.paymentId) : '';

    const current = get();
    const currentPaymentId = current?.payment?.id != null ? String(current.payment.id) : '';
    if (current?.sale?.id != null && String(current.sale.id) === String(saleId) && !current?.error) {
      if (!requestedPaymentId || requestedPaymentId === currentPaymentId) {
        return {
          sale: current.sale,
          payment: current.payment,
          saleItems: current.saleItems,
          config: current.config,
        };
      }
    }

    const requestKey = `${String(saleId)}:${requestedPaymentId}`;
    const inflight = _inflightBySaleId.get(requestKey);
    if (inflight) return inflight;

    set({ loading: true, error: null });

    try {
      const job = (async () => {
        const sale = await loadSaleForPrintWithAuthRetry(saleId, {
          includePayments: 1,
          ...(requestedPaymentId ? { paymentId: requestedPaymentId } : {}),
          params: {
            includePayments: 1,
            ...(requestedPaymentId ? { paymentId: requestedPaymentId } : {}),
          },
        });

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

        const branch = sale?.branch || {};
        const rc = branch?.receiptConfig || {};
        const vatRate = typeof rc.vatRate === 'number' ? rc.vatRate : 7;

        const items = Array.isArray(sale?.items) ? sale.items : [];

        const saleItems = items.map((i) => {
          const qty = 1;
          const amountVatIncl = Number(i?.price ?? i?.amount ?? 0);
          const unitIncl = qty ? amountVatIncl / qty : 0;
          const unitEx = unitIncl / (1 + vatRate / 100);
          const lineEx = unitEx * qty;

          const documentDescriptionRaw = normalizeDocumentText(i?.documentDescription);
          const documentDescription = buildSaleDocumentLineDescription(i);

          return {
            id: i?.id,
            documentLineKey: `sale-item-${i?.id}`,

            saleItemIds: i?.id ? [Number(i.id)] : [],
            simpleItemIds: [],

            documentPrefix: normalizeDocumentText(i?.documentPrefix),
            documentDescriptionRaw,
            documentDescription,
            documentSuffix: normalizeDocumentText(i?.documentSuffix),
            hasDocumentLine: Boolean(
              normalizeDocumentText(i?.documentPrefix) ||
                documentDescriptionRaw ||
                normalizeDocumentText(i?.documentSuffix)
            ),

            productName: resolveSaleItemProductName(i),
            productModel: i?.stockItem?.product?.model || 'ไม่พบสเปกสินค้า (SKU)',
            quantity: qty,
            unit: i?.stockItem?.product?.template?.unit?.name || i?.stockItem?.product?.unit?.name || '-',
            amount: amountVatIncl,
            unitPriceExVat: round2(unitEx),
            totalExVat: round2(lineEx),
          };
        });

        const total = round2(saleItems.reduce((s, x) => s + (Number(x.amount) || 0), 0));
        const beforeVat = round2(saleItems.reduce((s, x) => s + (Number(x.totalExVat) || 0), 0));
        const vatAmount = round2(total - beforeVat);

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
          formatThaiDate,
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
      _inflightBySaleId.delete(requestKey);
    }
  },
}));