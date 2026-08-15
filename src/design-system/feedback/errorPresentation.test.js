import { describe, expect, it } from 'vitest';
import { getErrorMessage, presentError } from './errorPresentation.js';

describe('presentError', () => {
  it('maps HTTP status to safe actionable copy', () => {
    expect(presentError({ response: { status: 403, data: {} } })).toMatchObject({
      code: 'HTTP_403',
      title: 'ไม่มีสิทธิ์ดำเนินการ',
      retryable: false,
    });
  });

  it('uses approved domain copy without exposing raw server messages', () => {
    const result = presentError(
      { code: 'STALE_DATA', message: 'internal database detail' },
      { byCode: { STALE_DATA: { title: 'ข้อมูลเปลี่ยนแปลงแล้ว', description: 'กรุณาโหลดข้อมูลล่าสุด' } } },
    );

    expect(result).toMatchObject({
      code: 'STALE_DATA',
      title: 'ข้อมูลเปลี่ยนแปลงแล้ว',
      description: 'กรุณาโหลดข้อมูลล่าสุด',
    });
    expect(JSON.stringify(result)).not.toContain('internal database detail');
  });

  it('keeps field errors and correlation id for form/support handling', () => {
    const result = presentError({
      response: {
        status: 422,
        data: { fieldErrors: { taxId: 'รูปแบบไม่ถูกต้อง' } },
        headers: { 'x-correlation-id': 'trace-123' },
      },
    });

    expect(result.fieldErrors).toEqual({ taxId: 'รูปแบบไม่ถูกต้อง' });
    expect(result.correlationId).toBe('trace-123');
  });

  it('normalizes the server operational error envelope for action feedback', () => {
    expect(getErrorMessage({
      response: {
        data: {
          error: {
            message: 'รายการนี้ถูกใช้งานแล้วและไม่สามารถลบได้',
          },
        },
      },
    }, 'ลบรายการไม่สำเร็จ')).toBe('รายการนี้ถูกใช้งานแล้วและไม่สามารถลบได้');
  });
});
