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

  it('retires helpers that existed only for the dead preview/commit flow', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).not.toContain('makeIdempotencyKey');
    expect(quickReceiveApi).not.toContain('normalizeItems');
  });

  it('keeps Quick Stock compatibility adapters available', () => {
    const quickReceiveApi = read('src/features/quickReceive/api/quickReceiveApi.js');
    expect(quickReceiveApi).toContain('getQuickReceiveDropdowns');
    expect(quickReceiveApi).toContain('quickReceiveExistingProduct');
    expect(quickReceiveApi).toContain('quickStockIntakeExistingApi');
    expect(quickReceiveApi).toContain('commitQuickStockExistingIntakeApi');
  });
});
