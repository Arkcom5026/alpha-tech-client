import { readSaleCustomerFirstAssociation } from '../../customer/services/saleCustomerFirstAssociationSession';

const round2 = (value) => Number((Number(value) || 0).toFixed(2));

export const buildSaleCompletionPayload = ({
  saleItems,
  customerId,
  activeHeldCart,
  saleMode,
  options = {},
}) => {
  const vatRate = 7;
  const lines = (saleItems || []).map((item) => {
    const quantity = item.lineType === 'SIMPLE' ? Number(item.quantity || 1) : 1;
    const basePrice = round2((Number(item.price) || 0) * quantity);
    const discount = round2(Number(item.discount) || 0);
    const price = round2(Math.max(basePrice - discount, 0));
    const vatAmount = round2((price * vatRate) / (100 + vatRate));

    return {
      lineId: item.lineId,
      lineType: item.lineType,
      stockItemId: item.lineType === 'STOCK_ITEM' ? Number(item.stockItemId) : null,
      productId: Number(item.productId),
      simpleLotId: item.lineType === 'SIMPLE' ? Number(item.simpleLotId) : null,
      quantity,
      basePrice,
      discount,
      price,
      vatAmount,
      remark: '',
    };
  });

  const totalBeforeDiscount = round2(lines.reduce((sum, line) => sum + line.basePrice, 0));
  const totalDiscount = round2(lines.reduce((sum, line) => sum + line.discount, 0));
  const totalAmount = round2(Math.max(totalBeforeDiscount - totalDiscount, 0));
  const vat = round2((totalAmount * vatRate) / (100 + vatRate));
  const isCredit = saleMode === 'CREDIT';

  return {
    customerId: customerId ? Number(customerId) : null,
    customerFirstAssociationToken: readSaleCustomerFirstAssociation(customerId) || undefined,
    sourceHeldCartId: activeHeldCart?.id || null,
    totalBeforeDiscount,
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
