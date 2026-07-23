export const resolveSaleDocumentRoute = ({ shopSlug, saleId, option }) => {
  if (!shopSlug || !saleId) return null;
  const slug = encodeURIComponent(String(shopSlug));
  const id = encodeURIComponent(String(saleId));
  if (option === 'RECEIPT') return `/${slug}/pos/sales/print-short/${id}`;
  if (option === 'TAX_INVOICE') return `/${slug}/pos/sales/print-full/${id}`;
  if (option === 'DELIVERY_NOTE') return `/${slug}/pos/sales/delivery-note/print/${id}`;
  return null;
};
