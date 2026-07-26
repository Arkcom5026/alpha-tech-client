import { toast } from 'react-toastify';
import { getRuntimeErrorMessage } from '../errors/normalizeRuntimeError';

const DEFAULT_OPTIONS = {
  position: 'top-right',
  closeOnClick: true,
  pauseOnHover: true,
};

const notify = (type, message, options = {}) => {
  const safeMessage = String(message || '').trim();
  if (!safeMessage) return null;

  return toast[type](safeMessage, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
};

export const notification = {
  success(message, options) {
    return notify('success', message, options);
  },

  info(message, options) {
    return notify('info', message, options);
  },

  warning(message, options) {
    return notify('warning', message, options);
  },

  error(errorOrMessage, options) {
    const message =
      typeof errorOrMessage === 'string'
        ? errorOrMessage
        : getRuntimeErrorMessage(errorOrMessage);

    return notify('error', message, {
      autoClose: false,
      ...options,
    });
  },

  dismiss(id) {
    toast.dismiss(id);
  },

  promise(promise, messages, options) {
    return toast.promise(promise, messages, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
  },
};
