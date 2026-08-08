import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readFeatureSource = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  if (name === '__tests__') return [];
  return statSync(path).isDirectory() ? readFeatureSource(path) : [readFileSync(path, 'utf8')];
}).join('\n');

const source = readFeatureSource(featureRoot);

describe('purchase report workspace behavior lock', () => {
  it('preserves report filter and fetch authority', () => {
    expect(source).toContain('usePurchaseReportStore');
    expect(source).toContain('setFiltersAction');
    expect(source).toContain('fetchPurchaseReportAction');
    expect(source).toContain('PurchaseReportFilters');
    expect(source).toContain('PurchaseReportTable');
  });

  it('preserves summary projection', () => {
    expect(source).toContain('receiptCount');
    expect(source).toContain('itemCount');
    expect(source).toContain('totalAmount');
  });

  it('preserves tenant-aware receipt detail navigation', () => {
    expect(source).toContain('shopSlug');
    expect(source).toContain('/pos/reports/purchase/receipts/');
    expect(source).toContain('receiptId');
  });
});
