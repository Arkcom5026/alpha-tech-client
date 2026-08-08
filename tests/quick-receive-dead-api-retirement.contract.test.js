import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('dead Quick Receive API retirement', () => {
  it('retires the final legacy Quick Receive API boundary', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);
  });

  it('keeps command-key behavior inside the Quick Receipt owner', () => {
    const quickReceiptSessionApi = read('src/features/receiving/quick-stock/api/quickReceiptSessionApi.js');
    expect(quickReceiptSessionApi).toContain('makeIdempotencyKey');
    expect(quickReceiptSessionApi).toContain('globalThis.crypto?.randomUUID');
    expect(quickReceiptSessionApi).not.toContain('@/features/quickReceive/api/quickReceiveApi');
  });

  it('keeps existing-product intake transport inside Quick Stock', () => {
    const intakeApi = read('src/features/receiving/quick-stock/api/quickStockIntakeApi.js');
    expect(intakeApi).toContain('commitQuickStockExistingIntakeApi');
    expect(intakeApi).toContain("apiClient.post('quick-stock/existing'");
  });
});
