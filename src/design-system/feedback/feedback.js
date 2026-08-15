import { toast } from 'react-toastify';

const normalizeMessage = (message, fallback) => {
  if (typeof message === 'string' && message.trim()) return message.trim();
  return fallback;
};

const notify = (level, message, options) => {
  const fallback = level === 'error' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'ดำเนินการเรียบร้อย';
  return toast[level](normalizeMessage(message, fallback), options);
};

export const feedback = {
  success(message, options) {
    return notify('success', message, options);
  },
  info(message, options) {
    return notify('info', message, options);
  },
  warning(message, options) {
    return notify('warning', message, options);
  },
  error(message, options) {
    return notify('error', message, options);
  },
  dismiss(id) {
    return toast.dismiss(id);
  },
};

export default feedback;
