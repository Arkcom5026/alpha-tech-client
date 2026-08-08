import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('dead Quick Receive API retirement', () => {
  it('retires unused preview and commit APIs from the legacy Quick Receive boundary', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).not.toContain('previewQuickReceive');
    expect(quickReceiveApi).not.toContain('createQuickReceive');
    expect(quickReceiveApi).not.toContain('stock/simple/quick-receive/preview');
    expect(quickReceiveApi).not.toContain("apiClient.post('stock/simple/quick-receive'");
  });

  it('retires only helpers that became orphaned while preserving live command-key support', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    const quickReceiptSessionApi = read('src/features/receiving/quick-stock/api/quickReceiptSessionApi.js');
    expect(quickReceiveApi).not.toContain('normalizeItems');
    expect(quickReceiveApi).toContain('makeIdempotencyKey');
    expect(quickReceiptSessionApi).toContain('makeIdempotencyKey');
  });

  it('keeps only live Quick Stock compatibility adapters available', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).not.toContain('getQuickReceiveDropdowns');
    expect(quickReceiveApi).toContain('quickReceiveExistingProduct');
    expect(quickReceiveApi).toContain('quickStockIntakeExistingApi');
    expect(quickReceiveApi).toContain('commitQuickStockExistingIntakeApi');
  });
});
