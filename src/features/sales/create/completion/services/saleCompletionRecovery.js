const UNCERTAIN_STATUS_CODES = new Set([0, 408, 425, 429, 500, 502, 503, 504]);

export const classifySaleCompletionFailure = (error = {}) => {
  const status = Number(error?.status ?? error?.response?.status ?? 0);
  const code = String(error?.code || error?.response?.data?.code || '').trim();
  const hasResponse = Boolean(error?.response);

  if (code === 'SALE_COMPLETION_COMMAND_CONFLICT') {
    return {
      kind: 'CONFLICT',
      retryable: false,
      uncertain: false,
      code,
      status,
    };
  }

  if (!hasResponse || UNCERTAIN_STATUS_CODES.has(status)) {
    return {
      kind: 'UNCERTAIN',
      retryable: true,
      uncertain: true,
      code: code || 'SALE_COMPLETION_RESULT_UNCERTAIN',
      status,
    };
  }

  return {
    kind: 'DETERMINISTIC',
    retryable: false,
    uncertain: false,
    code: code || 'SALE_COMPLETION_REJECTED',
    status,
  };
};

export const projectSaleCompletionRecovery = ({
  identity = null,
  failure = null,
  isSubmitting = false,
} = {}) => {
  const uncertain = failure?.kind === 'UNCERTAIN';
  return {
    state: isSubmitting ? 'SUBMITTING' : uncertain ? 'UNCERTAIN' : failure ? 'FAILED' : identity ? 'PENDING' : 'IDLE',
    commandId: identity?.commandId || null,
    receivedAt: identity?.receivedAt || null,
    retryable: Boolean(uncertain && identity?.commandId),
    preserveCheckout: Boolean(uncertain),
    message: uncertain
      ? 'ผลการยืนยันการขายยังไม่แน่นอน ระบบจะใช้คำสั่งเดิมเพื่อตรวจสอบหรือทำรายการต่ออย่างปลอดภัย'
      : failure
        ? 'ยืนยันการขายไม่สำเร็จ กรุณาตรวจสอบข้อมูลก่อนลองใหม่'
        : '',
  };
};
