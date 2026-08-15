import { beforeEach, describe, expect, it, vi } from 'vitest';

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
  update: vi.fn(),
}));

vi.mock('react-toastify', () => ({ toast: toastMock }));

import { feedback } from './feedback.js';

describe('feedback adapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('applies the success duration and dedupe event key', () => {
    feedback.success('บันทึกแล้ว', { eventKey: 'save-product' });
    expect(toastMock.success).toHaveBeenCalledWith('บันทึกแล้ว', expect.objectContaining({
      autoClose: 4000,
      toastId: 'save-product',
    }));
  });

  it('uses description from structured content', () => {
    feedback.warning({ title: 'ตรวจสอบข้อมูล', description: 'ยังไม่ได้เลือกสาขา' });
    expect(toastMock.warning).toHaveBeenCalledWith('ยังไม่ได้เลือกสาขา', expect.objectContaining({
      autoClose: 7000,
    }));
  });

  it('emits standardized action success feedback', () => {
    feedback.actionSuccess('บันทึกข้อมูลเรียบร้อยแล้ว', 'unit:create:success');
    expect(toastMock.success).toHaveBeenCalledWith(
      'บันทึกข้อมูลเรียบร้อยแล้ว',
      expect.objectContaining({ autoClose: 4000, toastId: 'unit:create:success' })
    );
  });

  it('reads the server operational error envelope for action failures', () => {
    const error = {
      response: {
        data: {
          error: {
            message: 'ไม่สามารถลบรายการที่ถูกใช้งานแล้ว',
          },
        },
      },
    };

    feedback.actionError(error, 'ลบรายการไม่สำเร็จ', 'unit:delete:error');
    expect(toastMock.error).toHaveBeenCalledWith(
      'ไม่สามารถลบรายการที่ถูกใช้งานแล้ว',
      expect.objectContaining({ autoClose: 9000, toastId: 'unit:delete:error' })
    );
  });
});
