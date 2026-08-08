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

describe('sales tax report workspace behavior lock', () => {
  it('preserves date-range driven report loading', () => {
    expect(source).toContain('loadSalesTaxDataAction');
    expect(source).toContain('salesTaxData');
    expect(source).toContain('startDate');
    expect(source).toContain('endDate');
  });

  it('preserves sales and return projections', () => {
    expect(source).toContain("type=\"sales\"");
    expect(source).toContain("type=\"returns\"");
    expect(source).toContain('salesTaxData?.sales');
    expect(source).toContain('salesTaxData?.returns');
  });

  it('preserves print handoff with date query parameters', () => {
    expect(source).toContain('/pos/reports/sales-tax/print?startDate=');
    expect(source).toContain('endDate=');
    expect(source).toContain('SalesTaxTable');
  });
});
