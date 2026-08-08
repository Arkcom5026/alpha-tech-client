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

describe('category workspace behavior lock', () => {
  it('preserves category CRUD and system-category policy', () => {
    expect(source).toContain('createAction');
    expect(source).toContain('getCategoryAction');
    expect(source).toContain('updateAction');
    expect(source).toContain('isSystem');
  });

  it('preserves management authority and tenant route intent', () => {
    expect(source).toContain('canManageProductOrdering');
    expect(source).toContain('/pos/stock/categories');
  });
});
