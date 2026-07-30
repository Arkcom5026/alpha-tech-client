const DEFAULT_PURCHASE_RECEIPT_ERROR = 'เกิดข้อผิดพลาดในการตรวจรับสินค้า';

export const projectPurchaseReceiptError = (error, fallback = DEFAULT_PURCHASE_RECEIPT_ERROR) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export { DEFAULT_PURCHASE_RECEIPT_ERROR };
