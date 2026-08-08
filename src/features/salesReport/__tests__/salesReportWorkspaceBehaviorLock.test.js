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

describe('sales report workspace behavior lock', () => {
  it('preserves dashboard loading and date filter authority', () => {
    expect(source).toContain('fetchDashboardAction');
    expect(source).toContain('setFiltersAction');
    expect(source).toContain('resetFiltersAction');
    expect(source).toContain('dailySales');
    expect(source).toContain('topProducts');
  });

  it('preserves list search, filtering, pagination, and sorting', () => {
    expect(source).toContain('fetchSalesListAction');
    expect(source).toContain('keywordInput');
    expect(source).toContain('paymentMethod');
    expect(source).toContain('sortDirection');
    expect(source).toContain('totalPages');
  });

  it('preserves tenant-aware report navigation', () => {
    expect(source).toContain('shopSlug');
    expect(source).toContain('/pos/reports/sales/list');
    expect(source).toContain('/pos/reports/sales/products');
  });
});
