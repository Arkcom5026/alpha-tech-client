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

describe('unit workspace behavior lock', () => {
  it('preserves unit CRUD actions', () => {
    expect(source).toContain('addUnit');
    expect(source).toContain('getUnitById');
    expect(source).toContain('updateUnit');
    expect(source).toContain('deleteUnitAction');
  });

  it('preserves tenant-aware unit navigation', () => {
    expect(source).toContain('/pos/stock/units');
    expect(source).toContain('shopSlug');
  });
});
