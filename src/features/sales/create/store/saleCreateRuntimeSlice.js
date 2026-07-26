import { executeSaleCompletion } from '../workflows/saleCompletionWorkflow';
import { clearSaleCompletionIdentity } from '../workflows/saleCompletionIdentity';
import { devError, normalizeStockItemId } from '../../shared/saleStoreSupport';

const normalizeProductId = (item) => {
  const raw = item?.productId ?? item?.product?.id ?? item?.simpleLot?.productId ?? null;
  const value = raw == null ? null : Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
};

const normalizeSimpleLotId = (item) => {
  const raw = item?.simpleLotId ?? item?.simpleLot?.id ?? null;
  const value = raw == null ? null : Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
};

const resolveLineType = (item) => {
  const explicit = String(item?.lineType || '').toUpperCase();
  if (explicit === 'STOCK_ITEM' || explicit === 'SIMPLE') return explicit;
  return normalizeStockItemId(item) ? 'STOCK_ITEM' : 'SIMPLE';
};

const resolveLineId = (item) => {
  const explicit = String(item?.lineId || '').trim();
  if (explicit) return explicit;
  const lineType = resolveLineType(item);
  if (lineType === 'STOCK_ITEM') return `stock-${normalizeStockItemId(item)}`;
  const productId = normalizeProductId(item);
  const simpleLotId = normalizeSimpleLotId(item);
  return simpleLotId ? `simple-${productId}-lot-${simpleLotId}` : `simple-${productId}`;
};

const normalizeQuantity = (item) => {
  if (resolveLineType(item) === 'STOCK_ITEM') return 1;
  const quantity = Number(item?.quantity ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const normalizeCartLine = (item) => {
  const lineType = resolveLineType(item);
  const stockItemId = normalizeStockItemId(item);
  const productId = normalizeProductId(item);
  const simpleLotId = normalizeSimpleLotId(item);
  const quantity = normalizeQuantity(item);
  const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0) || 0;
  const price = lineType === 'SIMPLE' && item?.unitPrice != null
    ? Math.round(unitPrice * quantity * 100) / 100
    : Number(item?.price ?? unitPrice) || 0;

  if (lineType === 'STOCK_ITEM' && !stockItemId) {
    throw Object.assign(new Error('ข้อมูลสินค้าไม่ครบ (ไม่มี stockItemId)'), { code: 'MISSING_STOCK_ITEM_ID' });
  }
  if (lineType === 'SIMPLE' && !productId) {
    throw Object.assign(new Error('ข้อมูลสินค้าแบบจำนวนไม่ครบ (ไม่มี productId)'), { code: 'MISSING_PRODUCT_ID' });
  }

  return {
    ...item,
    lineType,
    lineId: resolveLineId({ ...item, lineType, stockItemId, productId, simpleLotId }),
    stockItemId: lineType === 'STOCK_ITEM' ? stockItemId : null,
    productId,
    simpleLotId: lineType === 'SIMPLE' ? simpleLotId : null,
    quantity,
    unitPrice,
    price,
  };
};

const updateLineByIdentity = (items, identity, updater) => {
  const key = String(identity || '');
  return (items || []).map((item) => {
    const matches = item.lineId === key || String(item.stockItemId || '') === key;
    return matches ? updater(item) : item;
  });
};

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
      return {
        paymentList: exists
          ? state.paymentList.map((p) => (p.method === method ? { ...p, amount: Number(amount) || 0 } : p))
          : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }],
      };
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
    const totalPriceSatang = saleItems.reduce((sum, item) => sum + Math.max(0, Math.round((Number(item.price) || 0) * 100)), 0);
    const totalDiscSatang = Math.max(0, Math.round(billDiscount * 100));
    if (totalPriceSatang <= 0 || totalDiscSatang <= 0) {
      set({
        billDiscount,
        sharedBillDiscountPerItem: 0,
        saleItems: saleItems.map((item) => {
          const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
          return { ...item, billShare: 0, discountWithoutBill: baseDiscount, discount: baseDiscount };
        }),
      });
      return;
    }

    const allocation = saleItems.map((item) => {
      const raw = (totalDiscSatang * Math.max(0, Math.round((Number(item.price) || 0) * 100))) / totalPriceSatang;
      return { lineId: item.lineId, floor: Math.floor(raw), fraction: raw - Math.floor(raw) };
    });
    let remaining = Math.max(0, totalDiscSatang - allocation.reduce((sum, row) => sum + row.floor, 0));
    allocation.sort((a, b) => b.fraction - a.fraction);
    for (let index = 0; index < allocation.length && remaining > 0; index += 1) {
      allocation[index].floor += 1;
      remaining -= 1;
    }
    const shareByLineId = new Map(allocation.map((row) => [row.lineId, row.floor / 100]));
    set({
      billDiscount,
      sharedBillDiscountPerItem: Math.floor((billDiscount / saleItems.length) * 100) / 100,
      saleItems: saleItems.map((item) => {
        const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
        const billShare = shareByLineId.get(item.lineId) || 0;
        return { ...item, discountWithoutBill: baseDiscount, billShare, discount: baseDiscount + billShare };
      }),
    });
  },
  setBillDiscountAction: (amount) => get().setBillDiscount(amount),
  setSharedBillDiscountPerItem: (value) => {
    const number = Number(value);
    if (Number.isFinite(number)) {
      set({ sharedBillDiscountPerItem: Math.floor(number * 100) / 100 });
      return;
    }
    const { billDiscount, saleItems } = get();
    set({ sharedBillDiscountPerItem: saleItems?.length ? Math.floor(((Number(billDiscount) || 0) / saleItems.length) * 100) / 100 : 0 });
  },
  setSharedBillDiscountPerItemAction: (value) => get().setSharedBillDiscountPerItem(value),

  sumPaymentList: () => (get().paymentList || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
  finalPrice: () => Math.max(get().saleItems.reduce((sum, item) => sum + (Number(item.price) || 0) - (Number(item.discount) || 0), 0), 0),
  receivedAmount: () => get().sumPaymentList(),
  changeAmount: () => Math.max(get().sumPaymentList() - get().finalPrice(), 0),
  setCardRef: (val) => set({ cardRef: val }),
  setCardRefAction: (val) => get().setCardRef(val),
  setCustomerIdAction: (id) => set({ customerId: id }),

  addSaleItemAction: (item) => {
    try {
      const safeItem = normalizeCartLine(item);
      let added = false;
      set((state) => {
        const exists = (state.saleItems || []).some((row) => row.lineId === safeItem.lineId);
        if (exists) return state;
        added = true;
        return { saleItems: [...(state.saleItems || []), safeItem], error: null };
      });
      return { ok: true, added, lineId: safeItem.lineId };
    } catch (error) {
      const message = error?.message || 'เพิ่มรายการสินค้าไม่สำเร็จ';
      set({ error: message });
      return { ok: false, error: message, code: error?.code };
    }
  },

  removeSaleItemAction: (lineId) => {
    const key = String(lineId || '');
    set((state) => ({
      saleItems: (state.saleItems || []).filter((item) => item.lineId !== key && String(item.stockItemId || '') !== key),
    }));
  },
  clearSaleItemsAction: () => set({ saleItems: [], customerId: null }),
  updateItemDiscountAction: (lineId, discount) => {
    set((state) => ({
      saleItems: updateLineByIdentity(state.saleItems, lineId, (item) => ({ ...item, discount: Number(discount) || 0 })),
    }));
  },
  updateSaleItemAction: (lineId, newData) => {
    set((state) => ({
      saleItems: updateLineByIdentity(state.saleItems, lineId, (item) => normalizeCartLine({ ...item, ...newData, lineId: item.lineId })),
    }));
  },
  updateQuantityAction: (lineId, quantity) => {
    set((state) => ({
      saleItems: updateLineByIdentity(state.saleItems, lineId, (item) => normalizeCartLine({ ...item, quantity, lineId: item.lineId })),
    }));
  },

  confirmSaleOrderAction: async (saleMode, opts = {}) => {
    const { saleItems, customerId } = get();
    if (saleMode === 'CREDIT' && !customerId) {
      const message = 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน';
      set({ error: message });
      return { error: message };
    }
    if (!saleItems.length) {
      const message = 'ยังไม่มีรายการสินค้า';
      set({ error: message });
      return { error: message };
    }

    const normalizedLines = [];
    try {
      saleItems.forEach((item) => normalizedLines.push(normalizeCartLine(item)));
    } catch (error) {
      const message = error?.message || 'ข้อมูลรายการขายไม่ครบ';
      set({ error: message });
      return { error: message, code: error?.code };
    }

    set({ loading: true, error: null, completionState: 'validating' });
    try {
      const vatRate = 7;
      const totalBeforeDiscountSatang = normalizedLines.reduce((sum, item) => sum + Math.round((Number(item.price) || 0) * 100), 0);
      const totalDiscountSatang = normalizedLines.reduce((sum, item) => sum + Math.round((Number(item.discount) || 0) * 100), 0);
      const totalAmountSatang = Math.max(totalBeforeDiscountSatang - totalDiscountSatang, 0);
      const vatSatang = Math.round((totalAmountSatang * vatRate) / (100 + vatRate));
      const isCredit = saleMode === 'CREDIT';

      const lines = normalizedLines.map((item) => {
        const basePriceSatang = Math.round((Number(item.price) || 0) * 100);
        const discountSatang = Math.round((Number(item.discount) || 0) * 100);
        const netSatang = Math.max(basePriceSatang - discountSatang, 0);
        return {
          lineId: item.lineId,
          lineType: item.lineType,
          stockItemId: item.lineType === 'STOCK_ITEM' ? item.stockItemId : undefined,
          productId: item.productId,
          simpleLotId: item.lineType === 'SIMPLE' ? item.simpleLotId || undefined : undefined,
          quantity: item.quantity,
          basePrice: basePriceSatang / 100,
          vatAmount: Math.round((netSatang * vatRate) / (100 + vatRate)) / 100,
          price: netSatang / 100,
          discount: discountSatang / 100,
          remark: item.remark || '',
          documentPrefix: item.documentPrefix ?? undefined,
          documentDescription: item.documentDescription ?? undefined,
          documentSuffix: item.documentSuffix ?? undefined,
        };
      });

      const payload = {
        customerId: customerId ? Number(customerId) : null,
        totalBeforeDiscount: totalBeforeDiscountSatang / 100,
        totalDiscount: totalDiscountSatang / 100,
        vat: vatSatang / 100,
        vatRate,
        totalAmount: totalAmountSatang / 100,
        note: '',
        lines,
        mode: saleMode,
        saleMode,
        isCredit,
        isTaxInvoice: isCredit ? false : undefined,
        saleType: opts?.saleType || undefined,
        deliveryNoteMode: isCredit ? 'PRINT' : undefined,
      };

      set({ completionState: 'submitting' });
      const data = await executeSaleCompletion({
        sale: payload,
        payment: opts.paymentIntent || { paymentItems: [] },
        onIdentity: ({ commandId }) => set({ completionCommandId: commandId }),
      });
      const saleId = data?.saleId ?? data?.id ?? data?.saleOrderId ?? data?.sale?.id ?? null;
      set({ lastCreatedSaleId: saleId, completionState: 'succeeded' });
      return { saleId, data, deliveryNoteMode: isCredit ? 'PRINT' : undefined };
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data;
      const message = status === 409
        ? payload?.message || 'มีบางรายการไม่สามารถทำรายการขายได้ (อาจถูกขายไปแล้วหรือจำนวนคงเหลือเปลี่ยนแปลง)'
        : payload?.error || payload?.message || error?.message || 'เกิดข้อผิดพลาดในการขาย';
      devError('❌ [confirmSaleOrderAction]', error);
      set({ error: message, completionState: 'failed' });
      return { error: message, code: payload?.code || error?.code, details: payload?.details || error?.details || payload };
    } finally {
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
