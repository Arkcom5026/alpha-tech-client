import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const slicePath = path.resolve('src/features/stockItem/receive/store/createStockItemReceiveSlice.js');
const source = fs.readFileSync(slicePath, 'utf8');

describe('Stock receive mutation serialization authority', () => {
  it('owns receive mutations with one synchronous store-level authority', () => {
    expect(source).toContain('mutationAction: null');
    expect(source).toContain("mutationAction: 'RECEIVE_SCAN'");
    expect(source).toContain("mutationAction: 'RECEIVE_ALL_PENDING'");
    expect(source).toContain('if (get().mutationAction) throw busyError();');
  });

  it('snapshots scan command data before persistence', () => {
    expect(source).toContain('const command = {');
    expect(source).toContain("barcode: String(barcode || '').trim()");
    expect(source).toContain("serialNumber: String(serialNumber || '').trim() || null");
    expect(source).toContain('receiptItemId: receiptItemId ?? null');
    expect(source).toContain('await receiveScannedStockItem(command)');
  });

  it('snapshots receive-all authority before persistence', () => {
    expect(source).toContain('const command = { receiptId: receiptId ?? null };');
    expect(source).toContain('await receiveAllPendingStockItems(command)');
  });

  it('releases only the mutation action that still owns the boundary', () => {
    expect(source).toContain("if (get().mutationAction === 'RECEIVE_SCAN')");
    expect(source).toContain("if (get().mutationAction === 'RECEIVE_ALL_PENDING')");
    expect(source).toContain('set({ loading: false, mutationAction: null });');
  });
});
