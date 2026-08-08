import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('quick stock existing-product intake ownership behavior lock', () => {
  it('preserves the existing-product intake endpoint and FE-owned payload sanitization', () => {
    const legacyApi = read('src/features/quickReceive/api/quickReceiveApi.js');

    expect(legacyApi).toContain("apiClient.post('quick-stock/existing'");
    expect(legacyApi).toContain('delete sanitizedPayload.branchId');
    expect(legacyApi).toContain('delete sanitizedPayload.movementType');
    expect(legacyApi).toContain('delete sanitizedPayload.source');
    expect(legacyApi).toContain('normalizeBarcodeItems');
  });

  it('preserves QuickStock runtime orchestration through commitQuickStockExistingIntake', () => {
    const runtimeApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    const runtimeStore = read('src/features/receiving/quick-stock/store/quickStockRuntimeStore.js');

    expect(runtimeApi).toContain('commitQuickStockExistingIntake');
    expect(runtimeStore).toContain('quickStockIntakeExistingAction');
    expect(runtimeStore).toContain('commitQuickStockExistingIntake(payload)');
  });
});
