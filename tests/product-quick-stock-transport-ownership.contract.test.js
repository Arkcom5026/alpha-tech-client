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
  });

  it('requires Product compatibility flow to consume QuickStock public transport boundary', () => {
    const productStore = read('src/features/product/store/productStore.js');
    expect(productStore).toContain('@/features/receiving/quick-stock/api/quickStockIntakeApi');
    expect(productStore).toContain('commitQuickStockExistingIntakeApi');
    expect(productStore).not.toContain('quickReceiveExistingProductApi');
  });
});
