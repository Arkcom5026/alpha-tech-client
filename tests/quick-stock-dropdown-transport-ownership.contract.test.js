import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
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

  it('keeps Quick Stock independent from the retired Quick Receive API boundary', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    const intakeApi = read('src/features/receiving/quick-stock/api/quickStockIntakeApi.js');
    expect(quickStockApi).not.toContain('@/features/quickReceive/api/quickReceiveApi');
    expect(intakeApi).toContain('commitQuickStockExistingIntakeApi');
  });
});
