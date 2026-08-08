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

describe('product type workspace behavior lock', () => {
  it('preserves product-type CRUD and management authority', () => {
    expect(source).toContain('createProductTypeAction');
    expect(source).toContain('fetchByIdAction');
    expect(source).toContain('updateProductTypeAction');
    expect(source).toContain('canManageProductOrdering()');
  });

  it('preserves list URL-state and tenant route intent', () => {
    expect(source).toContain('useSearchParams');
    expect(source).toContain('includeInactive');
    expect(source).toContain("next.delete('categoryId')");
    expect(source).toContain('/pos/stock/types');
  });
});
