import test from 'node:test';
import assert from 'node:assert/strict';

import { getProductInventoryBehavior } from '../utils/quickStockRuntimeUtils.js';

test('NON_STOCK product is detected from projected field', () => {
  assert.equal(
    getProductInventoryBehavior({ mode: 'SIMPLE', inventoryBehavior: 'NON_STOCK' }),
    'NON_STOCK'
  );
});

test('legacy SIMPLE product remains TRACKED', () => {
  assert.equal(getProductInventoryBehavior({ mode: 'SIMPLE' }), 'TRACKED');
});

test('STRUCTURED product never becomes NON_STOCK from stale config', () => {
  assert.equal(
    getProductInventoryBehavior({
      mode: 'STRUCTURED',
      productConfig: { inventoryBehavior: 'NON_STOCK' },
    }),
    'TRACKED'
  );
});
