import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('ReceivedSNTable legacy StockItem fallback retirement contract', () => {
  it('uses props items as the only runtime data authority', () => {
    const table = read('src/features/barcode/controllers/ReceivedSNTable.jsx');

    expect(table).toContain('const ReceivedSNTable = ({ items = [] })');
    expect(table).toContain('Array.isArray(items) ? items : []');
    expect(table).not.toContain('useStockItemStore');
    expect(table).not.toContain('stockItems');
    expect(table).not.toContain('deleteStockItem');
    expect(table).not.toContain('_fromStore');
  });
});
