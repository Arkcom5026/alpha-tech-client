import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('quick stock existing-product intake ownership behavior lock', () => {
  it('preserves the existing-product intake endpoint and FE-owned payload sanitization', () => {
    const intakeApi = read('src/features/receiving/quick-stock/api/quickStockIntakeApi.js');

    expect(intakeApi).toContain("apiClient.post('quick-stock/existing'");
    expect(intakeApi).toContain('delete sanitizedPayload.branchId');
    expect(intakeApi).toContain('delete sanitizedPayload.movementType');
    expect(intakeApi).toContain('delete sanitizedPayload.source');
    expect(intakeApi).toContain('normalizeBarcodeItems');
    expect(intakeApi).toContain('sanitizedPayload.items ?? sanitizedPayload.barcodes ?? sanitizedPayload.queue');
  });

  it('preserves QuickStock runtime orchestration through commitQuickStockExistingIntake', () => {
    const runtimeApi = read('src/features/receiving/quick-stock/api/quickStockApi.js');
    const runtimeStore = read('src/features/receiving/quick-stock/store/quickStockRuntimeStore.js');

    expect(runtimeApi).toContain('commitQuickStockExistingIntakeApi');
    expect(runtimeApi).toContain('commitQuickStockExistingIntake');
    expect(runtimeStore).toContain('quickStockIntakeExistingAction');
    expect(runtimeStore).toContain('commitQuickStockExistingIntake(payload)');
  });

  it('retires the Quick Receive compatibility boundary while preserving Product delegation', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);

    const productApi = read('src/features/product/api/productApi.js');
    expect(productApi).toContain("from '@/features/receiving/quick-stock/api/quickStockIntakeApi'");
    expect(productApi).toContain('commitQuickStockExistingIntakeApi');
    expect(productApi).not.toContain("apiClient.post('quick-stock/existing'");
  });
});
