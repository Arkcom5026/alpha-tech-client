import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('StockItem sold lifecycle runtime ownership contract', () => {
  it('owns the mark-sold transport inside the sold slice', () => {
    const apiSource = read(
      'src/features/stockItem/sold/api/markStockItemsAsSoldApi.js'
    );

    expect(apiSource).toContain("apiClient.patch('/stock-items/mark-sold'");
    expect(apiSource).toContain('stockItemIds');
  });

  it('owns ID normalization and conflict projection inside the sold slice', () => {
    const projectionSource = read(
      'src/features/stockItem/sold/projections/stockItemSoldProjection.js'
    );
    const serviceSource = read(
      'src/features/stockItem/sold/services/markStockItemsAsSold.js'
    );

    expect(projectionSource).toContain('normalizeStockItemIdsForSold');
    expect(projectionSource).toContain("mappedError.name = 'StockItemNotSellableError'");
    expect(projectionSource).toContain('mappedError.status = 409');
    expect(serviceSource).toContain('projectStockItemSoldError');
    expect(serviceSource).toContain('ไม่มีรายการสินค้าที่ต้องอัปเดตเป็นขายแล้ว');
  });

  it('owns the sold action runtime directly in its store slice', () => {
    const soldStoreSlice = read(
      'src/features/stockItem/sold/store/createStockItemSoldSlice.js'
    );

    expect(soldStoreSlice).toContain("from '..'");
    expect(soldStoreSlice).toContain('updateStockItemsToSoldAction: async');
    expect(soldStoreSlice).toContain('markStockItemsAsSold(stockItemIds)');
    expect(soldStoreSlice).not.toContain("from '../api/stockItemApi'");
    expect(soldStoreSlice).not.toContain("'/stock-items/mark-sold'");
  });
});
