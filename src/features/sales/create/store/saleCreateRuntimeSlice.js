import { executeSaleCompletion } from '../workflows/saleCompletionWorkflow';
import { clearSaleCompletionIdentity } from '../workflows/saleCompletionIdentity';
import { devError, normalizeStockItemId } from '../../shared/saleStoreSupport';

export const createSaleCreateRuntimeSlice = (set, get) => ({
  saleItems: [],

  customerId: null,

  lastCreatedSaleId: null,

  completionState: 'idle',

  completionCommandId: null,

  setLastCreatedSaleIdAction: (id) => set({ lastCreatedSaleId: id || null }),

  paymentList: [
    { method: 'CASH', amount: 0 },
    { method: 'TRANSFER', amount: 0 },
    { method: 'CREDIT', amount: 0 },
    { method: 'DEPOSIT', amount: 0 },
  ],

  cardRef: '',

  billDiscount: 0,

  sharedBillDiscountPerItem: 0,

  saleCompleted: false,

  setSaleCompleted: (val) => set({ saleCompleted: val }),

  setPaymentAmount: (method, amount) => {
    set((state) => {
      const exists = state.paymentList.some((p) => p.method === method);
      const newList = exists
        ? state.paymentList.map((p) => (p.method === method ? { ...p, amount: Number(amount) || 0 } : p))
        : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }];
      return { paymentList: newList };
    });
  },

  setPaymentAmountAction: (method, amount) => get().setPaymentAmount(method, amount),

  setBillDiscount: (amount) => {
    const billDiscount = Number(amount) || 0;
    const { saleItems } = get();

    if (!saleItems.length) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPrice = saleItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    if (totalPrice <= 0) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPriceSatang = Math.round(totalPrice * 100);
    const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0;

    if (totalDiscSatang <= 0) {
      const newItems = saleItems.map((item) => {
        const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
        return { ...item, billShare: 0, discountWithoutBill: baseDiscount, discount: baseDiscount };
      });
      set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: 0 });
      return;
    }

    const provisional = saleItems.map((item) => {
      const price = Number(item.price) || 0;
      const priceSatang = Math.max(0, Math.round(price * 100));
      const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
      const raw = (totalDiscSatang * priceSatang) / totalPriceSatang;
      const flo = Math.floor(raw);
      const frac = raw - flo;
      return { item, baseDiscount, flo, frac };
    });

    let used = provisional.reduce((s, x) => s + x.flo, 0);
    let remain = Math.max(0, totalDiscSatang - used);

    const order = [...provisional].sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < order.length && remain > 0; i += 1) {
      order[i].flo += 1;
      remain -= 1;
    }

    const floById = new Map(order.map((o) => [o.item.stockItemId, o.flo]));

    const newItems = provisional.map(({ item, baseDiscount, flo }) => {
      const finalFlo = floById.get(item.stockItemId) ?? flo;
      const billShare = finalFlo / 100;
      return { ...item, discountWithoutBill: baseDiscount, billShare, discount: baseDiscount + billShare };
    });

    const avg = Math.floor((billDiscount / saleItems.length) * 100) / 100;
    set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: avg });
  },

  setBillDiscountAction: (amount) => get().setBillDiscount(amount),

  setSharedBillDiscountPerItem: (value) => {
    const n = value == null ? null : Number(value);
    if (Number.isFinite(n)) {
      const safe = Math.floor(n * 100) / 100;
      set({ sharedBillDiscountPerItem: safe });
      return;
    }

    const { billDiscount, saleItems } = get();
    if (!saleItems?.length) {
      set({ sharedBillDiscountPerItem: 0 });
      return;
    }

    const avg = Math.floor(((Number(billDiscount) || 0) / saleItems.length) * 100) / 100;
    set({ sharedBillDiscountPerItem: avg });
  },

  setSharedBillDiscountPerItemAction: (value) => get().setSharedBillDiscountPerItem(value),

  sumPaymentList: () => {
    const list = get().paymentList || [];
    return list.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  },

  finalPrice: () => {
    const base = get().saleItems.reduce(
      (sum, i) => sum + (Number(i.price) || 0) - (Number(i.discount ?? 0) || 0),
      0
    );
    return Math.max(base, 0);
  },

  receivedAmount: () => get().sumPaymentList(),

  changeAmount: () => {
    const totalPaid = get().sumPaymentList();
    const final = get().finalPrice();
    return Math.max(totalPaid - final, 0);
  },

  setCardRef: (val) => set({ cardRef: val }),

  setCardRefAction: (val) => get().setCardRef(val),

  setCustomerIdAction: (id) => set({ customerId: id }),

  addSaleItemAction: (item) => {
    try {
      if (item?.kind === 'LOT' || item?.simpleLotId) {
        const msg = 'สินค้าประเภทจำนวน/LOT ยังไม่รองรับในหน้าขายนี้';
        set({ error: msg });
        return { ok: false, error: msg, code: 'SALE_SN_ONLY' };
      }

      const stockItemId = normalizeStockItemId(item);
      if (!stockItemId) {
        set({ error: 'ข้อมูลสินค้าไม่ครบ (ไม่มี stockItemId)' });
        return { ok: false, error: 'ข้อมูลสินค้าไม่ครบ (ไม่มี stockItemId)', code: 'MISSING_STOCK_ITEM_ID' };
      }

      const safeItem = { ...item, stockItemId };

      set((state) => {
        const exists = (state.saleItems || []).some((i) => normalizeStockItemId(i) === stockItemId);
        if (exists) return state;
        return { saleItems: [...(state.saleItems || []), safeItem] };
      });
    } catch (err) {
      set({ error: err?.message || 'เพิ่มรายการสินค้าไม่สำเร็จ' });
    }
  },

  removeSaleItemAction: (stockItemId) => {
    set((state) => ({ saleItems: state.saleItems.filter((i) => i.stockItemId !== stockItemId) }));
  },

  clearSaleItemsAction: () => {
    set({ saleItems: [], customerId: null });
  },

  updateItemDiscountAction: (stockItemId, discount) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid ? { ...item, stockItemId: sid, discount: Number(discount) || 0 } : item
      ),
    }));
  },

  updateSaleItemAction: (stockItemId, newData) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid ? { ...item, ...newData, stockItemId: sid } : item
      ),
    }));
  },

  confirmSaleOrderAction: async (saleMode, opts = {}) => {
    const { saleItems, customerId } = get();

    if (saleMode === 'CREDIT' && !customerId) {
      const msg = 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน';
      set({ error: msg });
      return { error: msg };
    }

    const unsupportedRows = (saleItems || [])
      .map((it, idx) => ({
        idx,
        kind: it?.kind,
        simpleLotId: it?.simpleLotId,
      }))
      .filter((x) => x.kind === 'LOT' || x.simpleLotId)
      .map((x) => x.idx + 1);

    if (unsupportedRows.length > 0) {
      const msg = `มีสินค้าประเภทจำนวน/LOT อยู่ในรายการขาย แถว: ${unsupportedRows.join(', ')} กรุณาลบออกก่อน`;
      set({ error: msg });
      return { error: msg, code: 'SALE_SN_ONLY' };
    }

    const missingRows = (saleItems || [])
      .map((it, idx) => ({ idx, stockItemId: normalizeStockItemId(it) }))
      .filter((x) => !x.stockItemId)
      .map((x) => x.idx + 1);

    if (missingRows.length > 0) {
      const msg = `มีบางรายการไม่มี stockItemId (ข้อมูลสินค้าไม่ครบ) แถว: ${missingRows.join(', ')}`;
      set({ error: msg });
      return { error: msg };
    }

    if (saleItems.length === 0) {
      const msg = 'ยังไม่มีรายการสินค้า';
      set({ error: msg });
      return { error: msg };
    }

    set({ loading: true, error: null, completionState: 'validating' });

    try {
      const vatRate = 7;

      const totalBeforeDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.price) || 0) * 100),
        0
      );
      const totalDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.discount) || 0) * 100),
        0
      );

      const totalAmountSatang = Math.max(totalBeforeDiscountSatang - totalDiscountSatang, 0);
      const vatSatang = Math.round((totalAmountSatang * vatRate) / (100 + vatRate));

      const totalBeforeDiscount = totalBeforeDiscountSatang / 100;
      const totalDiscount = totalDiscountSatang / 100;
      const vatAmount = vatSatang / 100;
      const totalAmount = totalAmountSatang / 100;

      const isCredit = saleMode === 'CREDIT';
      const saleType = opts?.saleType;

      const payload = {
        customerId: customerId ? Number(customerId) : null,
        totalBeforeDiscount: Number(totalBeforeDiscount),
        totalDiscount: Number(totalDiscount),
        vat: Number(vatAmount),
        vatRate: Number(vatRate),
        totalAmount: Number(totalAmount),
        note: '',
        items: saleItems.map((item) => {
          const itemBaseSatang = Math.round((Number(item.price) || 0) * 100);
          const itemDiscountSatang = Math.round((Number(item.discount) || 0) * 100);
          const itemGrossSatang = Math.max(itemBaseSatang - itemDiscountSatang, 0);
          const itemVatSatang = Math.round((itemGrossSatang * vatRate) / (100 + vatRate));
          const netPrice = itemGrossSatang / 100;

          return {
            stockItemId: normalizeStockItemId(item),
            // 🟢 FIXED PAYLOAD: ควานหาไอดีสินค้าตัวแม่ (productId) ส่งแนบคู่ไปให้หลังบ้าน Prisma ตัดคลังสต๊อกตรงล็อก
            productId: item?.productId ? Number(item.productId) : (item?.product?.id ? Number(item.product.id) : undefined),
            basePrice: Number(item.price) || 0,
            vatAmount: itemVatSatang / 100,
            price: Number(netPrice),
            discount: Number(item.discount) || 0,
            remark: '',
          };
        }),
        mode: saleMode,
        saleMode,
        isCredit,
        isTaxInvoice: isCredit ? false : undefined,
        saleType: saleType || undefined,
        deliveryNoteMode: isCredit ? 'PRINT' : undefined,
      };

      set({ completionState: 'submitting' });
      const data = await executeSaleCompletion({
        sale: payload,
        payment: opts.paymentIntent || { paymentItems: [] },
        onIdentity: ({ commandId }) => set({ completionCommandId: commandId }),
      });
      const saleId = data?.saleId ?? data?.id ?? data?.saleOrderId ?? data?.sale?.id ?? null;

      set({
        lastCreatedSaleId: saleId,
        completionState: 'succeeded',
      });

      return { saleId, data, deliveryNoteMode: isCredit ? 'PRINT' : undefined };
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data;

      if (status === 409) {
        const msg = payload?.message || 'มีบางรายการไม่สามารถทำรายการขายได้ (อาจถูกขายไปแล้ว)';
        set({ error: msg, completionState: 'failed' });
        return { error: msg, code: payload?.code, details: payload };
      }

      const msg = payload?.error || payload?.message || err?.message || 'เกิดข้อผิดพลาดในการขาย';
      devError('❌ [confirmSaleOrderAction]', err);
      set({ error: msg, completionState: 'failed' });
      return { error: msg, code: err?.code || payload?.code, details: err?.details || payload?.details };
    } finally {
      // 🟢 FIXED SYNTAX: คืนค่าไวยากรณ์สากล finally ครอบปิดบล็อกได้อย่างราบรื่น
      set({ loading: false });
    }
  },

  resetSaleOrderAction: () => {
    clearSaleCompletionIdentity();
    set({
      saleItems: [],
      paymentList: [
        { method: 'CASH', amount: 0 },
        { method: 'TRANSFER', amount: 0 },
        { method: 'CREDIT', amount: 0 },
        { method: 'DEPOSIT', amount: 0 },
      ],
      billDiscount: 0,
      sharedBillDiscountPerItem: 0,
      cardRef: '',
      customerId: null,
      completionState: 'idle',
      completionCommandId: null,
    });
  },
});
