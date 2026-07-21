import apiClient from '@/utils/apiClient';

const normalizeLookup = (value) => String(value ?? '').trim();

const extractApiMessage = (error) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  'ไม่สามารถโหลดประวัติสินค้าได้';

export const getProductTraceByBarcode = async (lookup) => {
  const normalized = normalizeLookup(lookup);

  if (!normalized) {
    const error = new Error('กรุณาระบุบาร์โค้ดหรือหมายเลขซีเรียล');
    error.code = 'BARCODE_REQUIRED';
    throw error;
  }

  try {
    const response = await apiClient.get(
      `/products/trace/by-barcode/${encodeURIComponent(normalized)}`
    );

    const payload = response?.data;
    const trace = payload?.data ?? payload;

    if (!trace || typeof trace !== 'object') {
      const error = new Error('รูปแบบข้อมูลประวัติสินค้าไม่ถูกต้อง');
      error.code = 'INVALID_PRODUCT_TRACE_RESPONSE';
      throw error;
    }

    return trace;
  } catch (error) {
    const normalizedError = new Error(extractApiMessage(error));
    normalizedError.code =
      error?.response?.data?.error?.code ||
      error?.code ||
      'PRODUCT_TRACE_REQUEST_FAILED';
    normalizedError.status = error?.response?.status ?? null;
    normalizedError.details = error?.response?.data?.error?.details ?? null;
    throw normalizedError;
  }
};

export default {
  getProductTraceByBarcode,
};
