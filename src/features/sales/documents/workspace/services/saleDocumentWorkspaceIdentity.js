export const resolveSaleDocumentWorkspaceIdentity = ({ routeSaleId, paymentId, source } = {}) => {
  const saleId = routeSaleId == null ? '' : String(routeSaleId).trim();
  if (!saleId) {
    return {
      ok: false,
      error: 'ไม่พบ saleId สำหรับเปิดเอกสาร',
      code: 'SALE_DOCUMENT_ID_REQUIRED',
    };
  }

  return {
    ok: true,
    saleId,
    paymentId: paymentId == null || paymentId === '' ? null : String(paymentId),
    source: source || 'HISTORY_SEARCH',
    dataAuthority: 'SERVER_REVALIDATED_SALE',
  };
};
