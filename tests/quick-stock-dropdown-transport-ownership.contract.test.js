import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('quick stock dropdown transport ownership', () => {
  it('keeps the Quick Stock dropdown public boundary available', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).toContain('export const getQuickStockDropdowns');
  });

  it('requires Quick Stock to own quick-stock/dropdowns transport', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).toContain("apiClient.get('quick-stock/dropdowns'");
    expect(quickStockApi).toContain('productTypeId');
    expect(quickStockApi).toContain('_ts: Date.now()');
    expect(quickStockApi).toContain('parseApiError');
  });

  it('retires the legacy Quick Receive dropdown transport while preserving live compatibility helpers', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).not.toContain('getQuickReceiveDropdowns');
    expect(quickReceiveApi).not.toContain('quick-stock/dropdowns');
    expect(quickReceiveApi).toContain('makeIdempotencyKey');
    expect(quickReceiveApi).toContain('quickStockIntakeExistingApi');
  });
});
