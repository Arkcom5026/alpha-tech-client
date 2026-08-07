import { readSaleCustomerFirstAssociation } from '../../customer/services/saleCustomerFirstAssociationSession';
import { summarizeSalePriceAdjustments } from '../../cart/services/salePriceAdjustmentPolicy';

const round2 = (value) => Number((Number(value) || 0).toFixed(2));

export const buildSaleCompletionPayload = ({
  saleItems,
  customerId,
  activeHeldCart,
  saleMode,
  options = {},
}) => {
  const vatRate = 7;
  const pricing = summarizeSalePriceAdjustments(saleItems || []);
  if (!pricing.ok) {
    const error = new Error(pricing.message || 'ข้อมูลการปรับราคาไม่ถูกต้อง');
    error.code = pricing.code || 'INVALID_PRICE_ADJUSTMENT';
    throw error;
  }

  const lines = (saleItems || []).map((item, index) => {
    const projected = pricing.lines[index];
    const quantity = item.lineType === 'SIMPLE' ? Number(item.quantity || 1) : 1;
    const price = projected.finalPrice;
    const vatAmount = round2((price * vatRate) / (100 + vatRate));

    return {
      lineId: item.lineId,
      lineType: item.lineType,
      stockItemId: item.lineType === 'STOCK_ITEM' ? Number(item.stockItemId) : null,
      productId: Number(item.productId),
      simpleLotId: item.lineType === 'SIMPLE' ? Number(item.simpleLotId) : null,
      quantity,
      basePrice: projected.basePrice,
      priceAdjustment: projected.priceAdjustment,
      adjustmentReason: projected.adjustmentReason,
      discount: projected.discount,
      price,
      vatAmount,
      remark: '',
    };
  });

  const totalBeforeDiscount = pricing.totalBeforeAdjustment;
  const totalPriceAdjustment = pricing.totalPriceAdjustment;
  const totalDiscount = pricing.totalDiscount;
  const totalAmount = pricing.totalAmount;
  const vat = round2((totalAmount * vatRate) / (100 + vatRate));
  const isCredit = saleMode === 'CREDIT';

  return {
    customerId: customerId ? Number(customerId) : null,
    customerFirstAssociationToken: readSaleCustomerFirstAssociation(customerId) || undefined,
    sourceHeldCartId: activeHeldCart?.id || null,
    totalBeforeDiscount,
    totalPriceAdjustment,
    totalDiscount,
    vat,
    vatRate,
    totalAmount,
    note: '',
    lines,
    mode: saleMode,
    saleMode,
    isCredit,
    isTaxInvoice: isCredit ? false : undefined,
    saleType: options.saleType || undefined,
    deliveryNoteMode: isCredit ? 'PRINT' : options.deliveryNoteMode,
  };
};
