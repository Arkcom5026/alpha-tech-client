import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('purchase report workspace boundary', () => {
  it('keeps route-facing pages as thin workspace adapters', () => {
    const listPage = read('pages/ListPurchaseReportPage.jsx');
    const detailPage = read('pages/PurchaseReceiptReportDetailPage.jsx');

    expect(listPage).toContain('PurchaseReportListWorkspace');
    expect(listPage).not.toContain('usePurchaseReportStore');
    expect(detailPage).toContain('PurchaseReceiptReportDetailWorkspace');
    expect(detailPage).not.toContain('usePurchaseReportStore');
  });

  it('keeps report orchestration inside workspaces', () => {
    const listWorkspace = read('workspaces/PurchaseReportListWorkspace.jsx');
    const detailWorkspace = read('workspaces/PurchaseReceiptReportDetailWorkspace.jsx');

    expect(listWorkspace).toContain('fetchPurchaseReportAction');
    expect(listWorkspace).toContain('shopSlug');
    expect(detailWorkspace).toContain('fetchPurchaseReceiptDetailAction');
    expect(detailWorkspace).toContain('receiptId');
  });
});
