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

describe('branch price workspace behavior lock', () => {
  it('preserves token-scoped branch price loading and bulk mutation', () => {
    expect(source).toContain('fetchBranchPricesByTokenAction');
    expect(source).toContain('fetchAllProductsWithPriceByTokenAction');
    expect(source).toContain('upsertBranchPriceAction');
    expect(source).toContain('updateMultipleBranchPricesAction');
  });

  it('preserves catalog filter and committed-search behavior', () => {
    expect(source).toContain('categoryId');
    expect(source).toContain('productTypeId');
    expect(source).toContain('brandId');
    expect(source).toContain('committedSearchText');
    expect(source).toContain('ensureDropdownsAction');
  });

  it('preserves staged edit then save-all workflow', () => {
    expect(source).toContain('editablePrices');
    expect(source).toContain('pendingList');
    expect(source).toContain('handleConfirmOne');
    expect(source).toContain('handleRemoveOne');
    expect(source).toContain('handleSaveAll');
  });
});
