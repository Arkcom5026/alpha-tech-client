import { updateConsolidatedDeliveryDocumentLine } from '../api/combinedBillingApi';

const normalizeDocumentText = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
};

export const executeConsolidatedDocumentLineUpdate = async ({
  documentId,
  lineId,
  draft,
  reload,
} = {}) => {
  const normalizedDocumentId = Number(documentId);
  const normalizedLineId = Number(lineId);
  const description = normalizeDocumentText(draft?.documentDescriptionRaw);

  if (!Number.isInteger(normalizedDocumentId) || normalizedDocumentId <= 0) {
    return {
      ok: false,
      code: 'CONSOLIDATED_DOCUMENT_ID_REQUIRED',
      error: 'ไม่พบเอกสารรวมสำหรับบันทึก',
    };
  }
  if (!Number.isInteger(normalizedLineId) || normalizedLineId <= 0) {
    return {
      ok: false,
      code: 'CONSOLIDATED_DOCUMENT_LINE_ID_REQUIRED',
      error: 'ไม่พบรายการเอกสารสำหรับบันทึก',
    };
  }
  if (!description) {
    return {
      ok: false,
      code: 'CONSOLIDATED_DOCUMENT_LINE_DESCRIPTION_REQUIRED',
      error: 'กรุณาระบุคำอธิบายรายการเอกสาร',
    };
  }

  try {
    const data = await updateConsolidatedDeliveryDocumentLine({
      documentId: normalizedDocumentId,
      lineId: normalizedLineId,
      description,
    });

    if (typeof reload === 'function') {
      try {
        await reload();
      } catch (error) {
        return {
          ok: false,
          mutationApplied: true,
          code: error?.code || error?.response?.data?.code || 'CONSOLIDATED_DOCUMENT_LINE_RELOAD_FAILED',
          error:
            error?.response?.data?.message
            || error?.response?.data?.error
            || error?.message
            || 'บันทึกสำเร็จแล้ว แต่ไม่สามารถโหลดเอกสารล่าสุดได้',
        };
      }
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      code: error?.code || error?.response?.data?.code || 'CONSOLIDATED_DOCUMENT_LINE_UPDATE_FAILED',
      error:
        error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'บันทึกคำอธิบายรายการเอกสารรวมไม่สำเร็จ',
    };
  }
};
