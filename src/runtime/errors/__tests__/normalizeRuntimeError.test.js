import { describe, expect, it } from 'vitest';
import {
  getRuntimeErrorMessage,
  normalizeRuntimeError,
} from '../normalizeRuntimeError';

describe('normalizeRuntimeError', () => {
  it('normalizes backend validation errors', () => {
    const error = {
      response: {
        status: 422,
        data: {
          code: 'INVALID_INPUT',
          message: 'ข้อมูลไม่ถูกต้อง',
        },
      },
    };

    expect(normalizeRuntimeError(error)).toMatchObject({
      kind: 'validation',
      message: 'ข้อมูลไม่ถูกต้อง',
      status: 422,
      code: 'INVALID_INPUT',
      retryable: false,
    });
  });

  it('marks network failures as retryable', () => {
    const error = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };

    expect(normalizeRuntimeError(error)).toMatchObject({
      kind: 'network',
      message: 'Network Error',
      status: null,
      retryable: true,
    });
  });

  it('uses a safe fallback message', () => {
    expect(getRuntimeErrorMessage(null)).toBe(
      'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    );
  });
});
