const clampLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  const safe = Number.isFinite(parsed) ? parsed : 100;
  return Math.min(Math.max(safe, 1), 500);
};

export const validateSaleDocumentSearchQuery = ({ fromDate, toDate } = {}) => {
  if (fromDate && toDate && fromDate > toDate) {
    return {
      ok: false,
      error: 'ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด',
    };
  }

  return { ok: true };
};

export const projectSaleDocumentSearchQuery = ({
  keyword = '',
  fromDate,
  toDate,
  limit = 100,
  policy,
} = {}) => ({
  keyword: String(keyword || '').trim(),
  fromDate: fromDate || undefined,
  toDate: toDate || undefined,
  limit: clampLimit(limit),
  ...(policy?.queryParams || {}),
});

export const normalizeSaleDocumentSearchRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.sales)) return response.sales;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  if (Array.isArray(response?.result?.sales)) return response.result.sales;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  return [];
};
