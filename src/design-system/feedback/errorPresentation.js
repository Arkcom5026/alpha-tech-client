const DEFAULT_ERROR = {
  code: 'UNKNOWN_ERROR',
  title: 'ไม่สามารถดำเนินการได้',
  description: 'กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่โปรดติดต่อผู้ดูแลระบบ',
  severity: 'error',
  retryable: true,
  fieldErrors: {},
};

const STATUS_MESSAGES = {
  400: ['ข้อมูลไม่ถูกต้อง', 'กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง'],
  401: ['เซสชันหมดอายุ', 'กรุณาเข้าสู่ระบบอีกครั้ง'],
  403: ['ไม่มีสิทธิ์ดำเนินการ', 'บัญชีนี้ไม่มีสิทธิ์สำหรับการทำรายการนี้'],
  404: ['ไม่พบข้อมูล', 'ข้อมูลที่ต้องการอาจถูกย้ายหรือลบไปแล้ว'],
  409: ['ข้อมูลมีการเปลี่ยนแปลง', 'กรุณาโหลดข้อมูลล่าสุดแล้วลองใหม่อีกครั้ง'],
  422: ['ข้อมูลไม่ผ่านการตรวจสอบ', 'กรุณาตรวจสอบช่องที่ระบุแล้วลองใหม่อีกครั้ง'],
  429: ['มีคำขอมากเกินไป', 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'],
  500: ['ระบบขัดข้องชั่วคราว', 'กรุณาลองใหม่อีกครั้ง'],
};

const firstMeaningfulMessage = (...values) =>
  values.find((value) => typeof value === 'string' && value.trim())?.trim();

export function getErrorMessage(error, fallback = DEFAULT_ERROR.description) {
  return firstMeaningfulMessage(
    error?.response?.data?.error?.message,
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.message,
    fallback
  ) || fallback;
}

export function presentError(error, overrides = {}) {
  const status = error?.response?.status;
  const responseCode = error?.response?.data?.error?.code || error?.response?.data?.code;
  const approved = overrides.byCode?.[error?.code || responseCode];
  const statusCopy = STATUS_MESSAGES[status];
  const fieldErrors =
    error?.response?.data?.error?.fieldErrors ||
    error?.response?.data?.fieldErrors ||
    error?.fieldErrors ||
    {};
  const serverMessage = getErrorMessage(error, '');

  return {
    ...DEFAULT_ERROR,
    code: error?.code || responseCode || (status ? `HTTP_${status}` : DEFAULT_ERROR.code),
    title: approved?.title || statusCopy?.[0] || overrides.title || DEFAULT_ERROR.title,
    description:
      approved?.description ||
      overrides.description ||
      serverMessage ||
      statusCopy?.[1] ||
      DEFAULT_ERROR.description,
    retryable: overrides.retryable ?? ![400, 401, 403, 404, 422].includes(status),
    fieldErrors,
    correlationId: error?.response?.headers?.['x-correlation-id'] || error?.correlationId,
  };
}
