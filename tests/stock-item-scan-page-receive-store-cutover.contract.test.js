import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('StockItem scan page receive store cutover contract', () => {
  it('routes ScanBarcodeListPage through the receive-owned store boundary', () => {
    const page = read('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
    const store = read('src/features/stockItem/receive/store/useStockItemReceiveStore.js');

    expect(page).toContain("from '@/features/stockItem/receive/store/useStockItemReceiveStore'");
    expect(page).toContain('useStockItemReceiveStore()');
    expect(page).toContain('receiveSNAction');
    expect(page).toContain('receiveAllPendingNoSNAction');
    expect(page).not.toContain("from '@/features/stockItem/store/stockItemStore'");
    expect(page).not.toContain('useStockItemStore()');

    expect(store).toContain('createStockItemReceiveSlice');
    expect(store).toContain('...createStockItemReceiveSlice(set, get)');
  });
});
