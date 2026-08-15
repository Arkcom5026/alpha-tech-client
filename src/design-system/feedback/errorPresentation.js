const DEFAULT_ERROR_MESSAGE = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

const isSafeMessage = (value) => {
  if (typeof value !== 'string') return false;
  const message = value.trim();
  if (!message || message.length > 240) return false;
  return !/(stack|sql|prisma|database|token|authorization|bearer|password|secret|internal server)/i.test(message);
};

export function getSafeErrorMessage(error, fallback = DEFAULT_ERROR_MESSAGE) {
  const candidates = [
    error?.response?.data?.message,
    error?.response?.data?.error?.message,
    error?.message,
  ];

  const safeMessage = candidates.find(isSafeMessage);
  return safeMessage ? safeMessage.trim() : fallback;
}

export default getSafeErrorMessage;
