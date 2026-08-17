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

export const buildGeneratedDeliveryPrintPath = (shopSlug, documentId) => {
  const sourceId = Number(documentId);
  return `/${shopSlug || 'advancetech'}/pos/sales/delivery-note/print/${sourceId}?sourceType=CONSOLIDATED_DELIVERY&sourceId=${sourceId}`;
};
