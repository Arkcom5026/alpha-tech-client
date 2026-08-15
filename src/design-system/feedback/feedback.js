import { toast } from 'react-toastify';
import { getErrorMessage } from './errorPresentation.js';

const DEFAULT_DURATION = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 9000,
};

const normalizeContent = (content) => {
  if (typeof content === 'string') return content;
  return content?.description || content?.title || 'มีการอัปเดตสถานะ';
};

const emit = (variant, content, options = {}) => toast[variant](normalizeContent(content), {
  autoClose: DEFAULT_DURATION[variant],
  toastId: options.eventKey,
  ...options,
});

export const feedback = {
  success: (content, options) => emit('success', content, options),
  info: (content, options) => emit('info', content, options),
  warning: (content, options) => emit('warning', content, options),
  error: (content, options) => emit('error', content, options),
  actionSuccess: (message, eventKey) => emit('success', message, { eventKey }),
  actionError: (error, fallbackMessage, eventKey) =>
    emit('error', getErrorMessage(error, fallbackMessage), { eventKey }),
  dismiss: (eventKey) => toast.dismiss(eventKey),
  update: (eventKey, options) => toast.update(eventKey, options),
};

export const FEEDBACK_DURATION = DEFAULT_DURATION;
