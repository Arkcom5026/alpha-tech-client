import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('stock item search runtime ownership contract', () => {
  it('owns search transport behind the StockItem search slice', () => {
    const searchApi = read('src/features/stockItem/search/api/searchStockItemApi.js');
    const searchService = read('src/features/stockItem/search/services/searchStockItem.js');
    const searchIndex = read('src/features/stockItem/search/index.js');

    expect(searchApi).toContain('/stock-items/search');
    expect(searchService).toContain('searchStockItemApi');
    expect(searchService).toContain('projectStockItemSearchError');
    expect(searchIndex).toContain('searchStockItem');
  });

  it('routes the compatibility store through the owned search store slice', () => {
    const stockItemStore = read('src/features/stockItem/store/stockItemStore.js');
    const searchStoreSlice = read(
      'src/features/stockItem/search/store/createStockItemSearchSlice.js'
    );

    expect(stockItemStore).toContain("from '../search/store/createStockItemSearchSlice'");
    expect(stockItemStore).toContain('...createStockItemSearchSlice(set, get)');
    expect(stockItemStore).not.toContain('searchStockItemAction: async');
    expect(stockItemStore).not.toContain('/stock-items/search');

    expect(searchStoreSlice).toContain("from '..'");
    expect(searchStoreSlice).toContain('searchStockItemAction: async');
    expect(searchStoreSlice).toContain('searchStockItem(query)');
  });

  it('preserves not-sellable and not-found query semantics in the slice', () => {
    const projection = read('src/features/stockItem/search/projections/stockItemSearchProjection.js');

    expect(projection).toContain('statusCode === 409');
    expect(projection).toContain('notSellable: true');
    expect(projection).toContain('statusCode === 404');
    expect(projection).toContain('result: null');
  });
});
