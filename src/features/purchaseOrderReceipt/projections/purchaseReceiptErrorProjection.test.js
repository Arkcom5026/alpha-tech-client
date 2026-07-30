import { describe, expect, it } from 'vitest';

import { projectPurchaseReceiptError } from './purchaseReceiptErrorProjection';

describe('projectPurchaseReceiptError', () => {
  it('prefers the backend error contract over the generic Axios message', () => {
    const error = {
      message: 'Request failed with status code 500',
      response: { data: { error: 'ไม่สามารถเพิ่มรายการรับสินค้าได้' } },
    };

    expect(projectPurchaseReceiptError(error)).toBe('ไม่สามารถเพิ่มรายการรับสินค้าได้');
  });

  it('supports backend message and readable plain Error fallbacks', () => {
    expect(projectPurchaseReceiptError({ response: { data: { message: 'ข้อมูลไม่ครบ' } } })).toBe('ข้อมูลไม่ครบ');
    expect(projectPurchaseReceiptError(new Error('Network Error'))).toBe('Network Error');
  });

  it('uses the supplied workflow fallback instead of exposing a generic Axios status message', () => {
    const error = new Error('Request failed with status code 500');

    expect(projectPurchaseReceiptError(error, 'บันทึกรายการรับสินค้าไม่สำเร็จ'))
      .toBe('บันทึกรายการรับสินค้าไม่สำเร็จ');
  });

  it('returns a stable module fallback for unknown errors', () => {
    expect(projectPurchaseReceiptError(null)).toBe('เกิดข้อผิดพลาดในการตรวจรับสินค้า');
  });
});
