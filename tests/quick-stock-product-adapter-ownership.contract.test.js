import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('quick stock product adapter ownership', () => {
  it('requires Quick Stock to own product search transports directly', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).toContain("apiClient.get('products/pos/search'");
    expect(quickStockApi).toContain("apiClient.get('products/template/search'");
    expect(quickStockApi).toContain('hasSearchIntent');
    expect(quickStockApi).toContain('source: "quick-receive-idle"');
    expect(quickStockApi).toContain('delete sanitized.branchId');
    expect(quickStockApi).toContain('_ts: Date.now()');
  });

  it('requires Quick Stock to own template-on-demand and local-create transports directly', () => {
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).not.toContain('runtime-by-template');
    expect(quickStockApi).toContain("apiClient.post('products/pos/create-from-template'");
    expect(quickStockApi).toContain("apiClient.post('products/pos/create-local'");
    expect(quickStockApi).toContain('delete sanitizedPayload.branchId');
    expect(quickStockApi).toContain('delete sanitizedPayload.items');
    expect(quickStockApi).toContain('delete sanitizedPayload.movementType');
  });

  it('retires the legacy Quick Receive product adapter boundary', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveProductApi.js')).toBe(false);
    const quickStockApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    expect(quickStockApi).not.toContain('@/features/quickReceive/api/quickReceiveProductApi');
  });
});
