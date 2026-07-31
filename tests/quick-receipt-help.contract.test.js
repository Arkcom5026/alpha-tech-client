import { describe, expect, it } from 'vitest';

import quickReceiptHelpContent from '../src/features/receiving/quick-stock/help/quickReceiptHelpContent.js';

describe('Quick Receipt DDWD help contract', () => {
  it('documents both supported operating modes', () => {
    expect(quickReceiptHelpContent.modes.map((mode) => mode.code)).toEqual([
      'RESUMABLE_SESSION',
      'ONE_SHOT_COMPLETE',
    ]);
  });

  it('covers the complete receipt lifecycle and authority guidance', () => {
    const statusCodes = quickReceiptHelpContent.statuses.map(([code]) => code);
    for (const requiredStatus of ['LOCAL_DRAFT', 'DRAFT', 'FINALIZING', 'COMPLETED', 'CANCELLED']) {
      expect(statusCodes, `missing status guidance: ${requiredStatus}`).toContain(requiredStatus);
    }

    const searchableText = JSON.stringify(quickReceiptHelpContent).toLowerCase();
    for (const requiredText of [
      'supplier',
      'เลขที่ใบส่งของ',
      'ร้านปัจจุบัน',
      'structured product',
      'simple product',
      'barcode',
      'serial',
      'idempotency',
      'local storage',
      'เก็บไว้รับต่อภายหลัง',
      'ยืนยันรับสินค้าครบ',
    ]) {
      expect(searchableText, `missing DDWD guidance: ${requiredText}`).toContain(requiredText.toLowerCase());
    }
  });

  it('provides operationally complete steps, checklist, recovery and authority notes', () => {
    expect(quickReceiptHelpContent.steps.length).toBeGreaterThanOrEqual(6);
    expect(quickReceiptHelpContent.checklist.length).toBeGreaterThanOrEqual(8);
    expect(quickReceiptHelpContent.faq.length).toBeGreaterThanOrEqual(5);
    expect(quickReceiptHelpContent.notes.length).toBeGreaterThanOrEqual(4);
  });
});
