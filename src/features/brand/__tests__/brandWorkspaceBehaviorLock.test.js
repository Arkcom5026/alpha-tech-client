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

describe('brand workspace behavior lock', () => {
  it('preserves brand lifecycle actions', () => {
    expect(source).toContain('createBrandAction');
    expect(source).toContain('updateBrandAction');
    expect(source).toContain('toggleBrandActiveAction');
  });

  it('preserves product-type brand mapping management', () => {
    expect(source).toContain('attachBrandToProductTypeAction');
    expect(source).toContain('detachBrandFromProductTypeAction');
    expect(source).toContain('productTypeBrandLinks');
  });

  it('preserves the brand list route intent', () => {
    expect(source).toContain('/pos/stock/brands');
  });
});
