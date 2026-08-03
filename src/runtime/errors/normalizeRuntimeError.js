const DEFAULT_ERROR_MESSAGE = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

const STATUS_KIND_MAP = {
  400: 'validation',
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
  408: 'timeout',
  409: 'conflict',
  422: 'validation',
  429: 'rate_limited',
};

const pickMessage = (error) => {
  if (!error) return DEFAULT_ERROR_MESSAGE;

  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();

  return DEFAULT_ERROR_MESSAGE;
};

const resolveKind = (error, status) => {
  if (STATUS_KIND_MAP[status]) return STATUS_KIND_MAP[status];

  const code = String(error?.code || '').toUpperCase();
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') return 'timeout';
  if (code === 'ERR_NETWORK' || !error?.response) return 'network';
  if (status >= 500) return 'server';

  return 'unknown';
};

export const normalizeRuntimeError = (error) => {
  const status = Number(error?.response?.status || error?.status || 0) || null;

  return {
    kind: resolveKind(error, status),
    message: pickMessage(error),
    status,
    code: error?.response?.data?.code || error?.code || null,
    retryable:
      !status ||
      status === 408 ||
      status === 429 ||
      status >= 500 ||
      ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'].includes(
        String(error?.code || '').toUpperCase(),
      ),
    cause: error ?? null,
  };
};

export const getRuntimeErrorMessage = (error) => normalizeRuntimeError(error).message;
