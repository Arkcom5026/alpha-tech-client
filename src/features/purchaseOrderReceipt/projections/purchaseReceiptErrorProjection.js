const DEFAULT_PURCHASE_RECEIPT_ERROR = 'เกิดข้อผิดพลาดในการตรวจรับสินค้า';

const AXIOS_STATUS_MESSAGE = /^Request failed with status code \d+$/i;

export const projectPurchaseReceiptError = (error, fallback = DEFAULT_PURCHASE_RECEIPT_ERROR) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
  if (backendMessage) return backendMessage;

  const message = error?.message;
  if (!message || AXIOS_STATUS_MESSAGE.test(message)) return fallback;

  return message;
};

export { DEFAULT_PURCHASE_RECEIPT_ERROR };
