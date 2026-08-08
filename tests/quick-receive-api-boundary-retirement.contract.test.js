import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('legacy Quick Receive API boundary retirement', () => {
  it('retires the legacy Quick Receive API file', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);
  });

  it('moves idempotency key ownership into the Quick Receipt session boundary', () => {
    const sessionApi = read('src/features/receiving/quick-stock/api/quickReceiptSessionApi.js');
    expect(sessionApi).toContain('function makeIdempotencyKey');
    expect(sessionApi).not.toContain('@/features/quickReceive/api/quickReceiveApi');
    expect(sessionApi).toContain('globalThis.crypto?.randomUUID');
  });

  it('keeps existing-product intake transport owned by Quick Stock', () => {
    const intakeApi = read('src/features/receiving/quick-stock/api/quickStockIntakeApi.js');
    expect(intakeApi).toContain('commitQuickStockExistingIntakeApi');
    expect(intakeApi).toContain("apiClient.post('quick-stock/existing'");
  });
});
