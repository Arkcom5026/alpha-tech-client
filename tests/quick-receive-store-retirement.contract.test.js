import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('legacy Quick Receive store retirement', () => {
  it('retires the unconsumed Quick Receive Zustand store', () => {
    expect(exists('src/features/quickReceive/store/quickReceiveStore.js')).toBe(false);
  });

  it('keeps only live legacy Quick Receive API compatibility adapters available', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).not.toContain('getQuickReceiveDropdowns');
    expect(quickReceiveApi).toContain('quickStockIntakeExistingApi');
  });

  it('retires Quick Receive product adapters after Quick Stock assumes ownership', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveProductApi.js')).toBe(false);

    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).not.toContain('@/features/quickReceive/api/quickReceiveApi');
    expect(quickStockApi).not.toContain('@/features/quickReceive/api/quickReceiveProductApi');
    expect(quickStockApi).toContain("apiClient.get('products/pos/search'");
    expect(quickStockApi).toContain("apiClient.get('products/template/search'");
  });
});
