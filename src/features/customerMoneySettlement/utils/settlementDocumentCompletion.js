export const getSettlementDocumentCompletion = (record) => {
  const document = record?.generatedDocument || null;
  if (!document) return { mode: 'MANUAL_FALLBACK', document: null };

  const cancelled = record?.status === 'CANCELLED'
    || document.status === 'CANCELLED'
    || document.generationStatus === 'CANCELLED';

  return {
    mode: cancelled ? 'AUTO_CANCELLED' : 'AUTO_GENERATED',
    document,
  };
};

const buildSourceQuery = (documentId) => {
  const sourceId = Number(documentId);
  return `sourceType=CONSOLIDATED_DELIVERY&sourceId=${sourceId}`;
};

export const buildGeneratedDeliveryPrintPath = (shopSlug, documentId) => {
  const sourceId = Number(documentId);
  return `/${shopSlug || 'advancetech'}/pos/sales/delivery-note/print/${sourceId}?${buildSourceQuery(sourceId)}`;
};

export const buildGeneratedBillPrintPath = (shopSlug, documentId, format = 'full') => {
  const sourceId = Number(documentId);
  const normalizedFormat = String(format || 'full').toLowerCase() === 'short' ? 'short' : 'full';
  return `/${shopSlug || 'advancetech'}/pos/sales/bill/print-${normalizedFormat}/${sourceId}?${buildSourceQuery(sourceId)}`;
};

export const buildDeliveryHistoryPath = (shopSlug) => (
  `/${shopSlug || 'advancetech'}/pos/sales/delivery-note`
);

export const buildBillHistoryPath = (shopSlug) => (
  `/${shopSlug || 'advancetech'}/pos/sales/bill`
);
