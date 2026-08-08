import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('quick stock dropdown boundary ownership', () => {
  it('keeps the QuickStock dropdown public boundary available', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).toContain('export const getQuickStockDropdowns');
  });

  it('requires QuickStock UI to consume the QuickStock boundary', () => {
    const panel = read('src/features/receiving/components/quick-stock/ProductFinderPanel.jsx');
    expect(panel).toContain('@/features/receiving/quick-stock/api/quickStockApi');
    expect(panel).toContain('getQuickStockDropdowns');
    expect(panel).not.toContain('@/features/quickReceive/api/quickReceiveApi');
    expect(panel).not.toContain('getQuickReceiveDropdowns');
  });

  it('requires the QuickStock API boundary to own dropdown transport directly', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).not.toContain('@/features/quickReceive/api/quickReceiveApi');
    expect(quickStockApi).not.toContain('getQuickReceiveDropdowns');
    expect(quickStockApi).toContain("apiClient.get('quick-stock/dropdowns'");
  });
});
