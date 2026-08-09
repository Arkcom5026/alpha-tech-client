export const resolveSaleDocumentRoute = ({ shopSlug, saleId, option, paymentId }) => {
  if (!shopSlug || !saleId) return null;
  const slug = encodeURIComponent(String(shopSlug));
  const id = encodeURIComponent(String(saleId));
  if (option === 'ORDINARY_RECEIPT') {
    const receiptPaymentId = encodeURIComponent(String(paymentId || ''));
    return `/${slug}/pos/sales/print-short/${id}?document=receipt&paymentId=${receiptPaymentId}`;
  }
  if (option === 'RECEIPT') return `/${slug}/pos/sales/print-short/${id}`;
  if (option === 'TAX_INVOICE') return `/${slug}/pos/sales/print-full/${id}`;
  if (option === 'DELIVERY_NOTE') return `/${slug}/pos/sales/delivery-note/print/${id}`;
  if (option === 'TAX_DOCUMENT_SHORT' || option === 'TAX_DOCUMENT_FULL') {
    return `/${slug}/pos/sales/tax-document/print/${id}`;
  }
  return null;
};
