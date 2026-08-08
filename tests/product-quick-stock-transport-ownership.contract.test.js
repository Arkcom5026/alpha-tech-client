import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('product to quick stock transport ownership', () => {
  it('keeps quick-stock/existing transport owned by QuickStock', () => {
    const quickStockIntakeApi = read('src/features/receiving/quick-stock/api/quickStockIntakeApi.js');
    expect(quickStockIntakeApi).toContain("apiClient.post('quick-stock/existing'");
  });

  it('prevents Product API from owning quick-stock/existing transport', () => {
    const productApi = read('src/features/product/api/productApi.js');
    expect(productApi).not.toContain("apiClient.post('quick-stock/existing'");
    expect(productApi).toContain('@/features/receiving/quick-stock/api/quickStockIntakeApi');
    expect(productApi).toContain('commitQuickStockExistingIntakeApi');
  });

  it('preserves Product compatibility export without duplicating transport behavior', () => {
    const productApi = read('src/features/product/api/productApi.js');
    const productStore = read('src/features/product/store/productStore.js');

    expect(productApi).toContain('export const quickReceiveExistingProductApi');
    expect(productApi).toContain('commitQuickStockExistingIntakeApi(payload)');
    expect(productStore).toContain('quickReceiveExistingProductApi');
  });
});
