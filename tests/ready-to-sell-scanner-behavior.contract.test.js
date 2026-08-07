import { describe, expect, it } from 'vitest';
import {
  READY_TO_SELL_SORT_MODE,
  findReadyToSellScanMatch,
  normalizeReadyToSellScan,
  resolveReadyToSellScanOutcome,
  sortReadyToSellItems,
} from '../src/features/product/ready-to-sell/scan-workflow/policies/readyToSellScannerPolicy';

describe('ready-to-sell scanner behavior contract', () => {
  const rows = [
    {
      id: 1,
      barcode: 'ABC-001-999',
      serialNumber: 'SN-ONE',
      receivedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 2,
      barcode: 'xyz-002',
      serialNumber: 'sn-two-555',
      receivedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('normalizes scanner input without changing its business identity', () => {
    expect(normalizeReadyToSellScan('  SN-ONE  ')).toBe('SN-ONE');
    expect(normalizeReadyToSellScan(null)).toBe('');
  });

  it('matches barcode or serial case-insensitively and preserves digit-only scanner fallback', () => {
    expect(findReadyToSellScanMatch(rows, 'sn-one')?.id).toBe(1);
    expect(findReadyToSellScanMatch(rows, 'XYZ-002')?.id).toBe(2);
    expect(findReadyToSellScanMatch(rows, '001999')?.id).toBe(1);
    expect(findReadyToSellScanMatch(rows, '555')?.id).toBe(2);
  });

  it('returns a non-blocking not-found outcome and clears highlight ownership', () => {
    expect(resolveReadyToSellScanOutcome(rows, 'missing')).toEqual({
      matchedItem: null,
      highlightId: null,
      message: 'ไม่พบรายการสำหรับ “missing”',
      shouldScroll: false,
    });
  });

  it('returns highlight and scroll intent for a matched stock item', () => {
    const outcome = resolveReadyToSellScanOutcome(rows, 'SN-TWO-555');
    expect(outcome.matchedItem?.id).toBe(2);
    expect(outcome.highlightId).toBe(2);
    expect(outcome.message).toBe('');
    expect(outcome.shouldScroll).toBe(true);
  });

  it('preserves newest-first and FIFO ordering without mutating source rows', () => {
    const originalIds = rows.map((row) => row.id);
    expect(sortReadyToSellItems(rows, READY_TO_SELL_SORT_MODE.NEWEST).map((row) => row.id)).toEqual([1, 2]);
    expect(sortReadyToSellItems(rows, READY_TO_SELL_SORT_MODE.FIFO).map((row) => row.id)).toEqual([2, 1]);
    expect(rows.map((row) => row.id)).toEqual(originalIds);
  });
});
