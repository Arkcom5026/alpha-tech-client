import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('StockItem availability runtime ownership contract', () => {
  it('owns the availability endpoint inside the availability slice', () => {
    const api = read('src/features/stockItem/availability/api/getAvailableStockItemsApi.js');

    expect(api).toContain("apiClient.get('/stock-items/available'");
  });

  it('routes availability consumers through the public boundary', () => {
    const store = read('src/features/stockItem/store/stockItemStore.js');

    expect(store).toContain("from '../availability'");
    expect(store).toContain('loadAvailableStockItems(productId)');
    expect(store).not.toContain('getAvailableStockItemsByProduct');
  });

  it('keeps validation and result projection inside the availability slice', () => {
    const projection = read(
      'src/features/stockItem/availability/projections/stockItemAvailabilityProjection.js'
    );
    const service = read(
      'src/features/stockItem/availability/services/loadAvailableStockItems.js'
    );

    expect(projection).toContain('productId ต้องไม่ว่าง');
    expect(projection).toContain('Array.isArray(sourceResponse)');
    expect(service).toContain('projectAvailableStockItemsCommand');
    expect(service).toContain('projectAvailableStockItemsResult');
  });
});
