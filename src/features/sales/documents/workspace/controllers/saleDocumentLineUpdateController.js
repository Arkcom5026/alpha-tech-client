import { saveSaleDocumentLines } from '../api/saleDocumentWorkspaceApi';

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
};

const mapLine = (id, draft = {}) => ({
  id,
  documentPrefix: normalizeDocumentText(draft.documentPrefix),
  documentDescription: normalizeDocumentText(draft.documentDescriptionRaw),
  documentSuffix: normalizeDocumentText(draft.documentSuffix),
});

export const executeSaleDocumentLineUpdate = async ({
  saleId,
  saleItemIds,
  simpleItemIds,
  draft,
  reload,
} = {}) => {
  if (!saleId) {
    return { ok: false, code: 'SALE_DOCUMENT_ID_REQUIRED', error: 'ไม่พบ saleId สำหรับบันทึกเอกสาร' };
  }

  const payload = {
    items: (Array.isArray(saleItemIds) ? saleItemIds : []).map((id) => mapLine(id, draft)),
    simpleItems: (Array.isArray(simpleItemIds) ? simpleItemIds : []).map((id) => mapLine(id, draft)),
  };

  if (payload.items.length === 0 && payload.simpleItems.length === 0) {
    return {
      ok: false,
      code: 'SALE_DOCUMENT_LINE_IDS_REQUIRED',
      error: 'ไม่พบรายการเอกสารสำหรับบันทึก',
    };
  }

  try {
    const data = await saveSaleDocumentLines({ saleId, payload });
    if (typeof reload === 'function') {
      try {
        await reload();
      } catch (error) {
        return {
          ok: false,
          mutationApplied: true,
          code: error?.code || error?.response?.data?.code || 'SALE_DOCUMENT_LINE_RELOAD_FAILED',
          error:
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            'บันทึกสำเร็จแล้ว แต่ไม่สามารถโหลดเอกสารล่าสุดได้',
        };
      }
    }
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      code: error?.code || error?.response?.data?.code || 'SALE_DOCUMENT_LINE_UPDATE_FAILED',
      error:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'บันทึกข้อความก่อน/หลังสินค้าไม่สำเร็จ',
    };
  }
};
