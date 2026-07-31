export const QUICK_RECEIPT_LOCAL_DRAFT_STORAGE_KEY =
  'alpha-tech.quick-receipt.local-draft.v2';

export const normalizeQuickReceiptTaxDocumentMode = (value) =>
  value === 'RECEIVED_WITH_GOODS' ? 'RECEIVED' : (value || 'NOT_RECEIVED');

export const createEmptyQuickReceiptHeader = () => ({
  supplierId: '',
  deliveryNoteNumber: '',
  deliveryNoteDate: '',
  note: '',
  taxDocumentMode: 'NOT_RECEIVED',
  supplierTaxInvoiceNumber: '',
  supplierTaxInvoiceDate: '',
  taxPricingMode: 'VAT_INCLUDED',
  documentSubtotal: '',
  documentVatAmount: '',
  documentTotalAmount: '',
});

export const buildQuickReceiptLine = ({
  operationalProduct,
  barcodeQueue,
  defaultCost,
  priceForm,
  note,
}) => ({
  localId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productId: Number(operationalProduct.id),
  productName: operationalProduct.name,
  quantity: barcodeQueue.length,
  costPrice: Number(defaultCost ?? priceForm.costPrice),
  priceRetail: Number(priceForm.priceRetail),
  priceWholesale:
    priceForm.priceWholesale === '' ? null : Number(priceForm.priceWholesale),
  priceTechnician:
    priceForm.priceTechnician === '' ? null : Number(priceForm.priceTechnician),
  priceOnline: priceForm.priceOnline === '' ? null : Number(priceForm.priceOnline),
  note,
  items: barcodeQueue.map((item) => ({
    barcode: String(item.barcode || '').trim(),
    serialNumber: String(item.serialNumber || '').trim() || null,
  })),
});

export const projectQuickReceiptHeader = (detail) => ({
  supplierId: String(detail?.supplierId || ''),
  deliveryNoteNumber: detail?.deliveryNoteNumber || '',
  deliveryNoteDate: detail?.deliveryNoteDate
    ? String(detail.deliveryNoteDate).slice(0, 10)
    : '',
  note: detail?.note || '',
  taxDocumentMode: normalizeQuickReceiptTaxDocumentMode(detail?.taxDocumentMode),
  supplierTaxInvoiceNumber: detail?.supplierTaxInvoiceNumber || '',
  supplierTaxInvoiceDate: detail?.supplierTaxInvoiceDate
    ? String(detail.supplierTaxInvoiceDate).slice(0, 10)
    : '',
  taxPricingMode: detail?.taxPricingMode || 'VAT_INCLUDED',
  documentSubtotal: detail?.documentSubtotal ?? '',
  documentVatAmount: detail?.documentVatAmount ?? '',
  documentTotalAmount: detail?.documentTotalAmount ?? '',
});

export const stripQuickReceiptLocalLineMetadata = ({
  localId: _localId,
  productName: _productName,
  ...payload
}) => payload;

export const filterQuickReceiptDrafts = (drafts, keyword) => {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  if (!normalizedKeyword) return drafts;

  return drafts.filter((draft) =>
    `${draft.supplierName || ''} ${draft.deliveryNoteNumber || ''}`
      .toLowerCase()
      .includes(normalizedKeyword)
  );
};

export const getQuickReceiptTotalQuantity = (lines) =>
  lines.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

export const isQuickReceiptLocked = (receipt) =>
  receipt?.status === 'COMPLETED' || receipt?.status === 'CANCELLED';
