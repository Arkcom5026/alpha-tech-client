import { notification } from '../feedback/notification';
import { normalizeRuntimeError } from './normalizeRuntimeError';

export function handleRuntimeError(error, options = {}) {
  const runtimeError = normalizeRuntimeError(error);

  if (options.notify !== false) {
    notification.error(runtimeError.message, options.notification);
  }

  return runtimeError;
}
