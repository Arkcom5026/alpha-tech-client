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
});
