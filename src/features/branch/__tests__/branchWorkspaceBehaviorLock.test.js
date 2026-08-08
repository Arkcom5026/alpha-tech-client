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

describe('branch workspace behavior lock', () => {
  it('preserves branch CRUD and selection runtime actions', () => {
    expect(source).toContain('loadAllBranchesAction');
    expect(source).toContain('getBranchByIdAction');
    expect(source).toContain('createBranchAction');
    expect(source).toContain('updateBranchAction');
    expect(source).toContain('deleteBranchAction');
    expect(source).toContain('ensureSelectedBranchAction');
  });

  it('preserves management authority and tenant navigation', () => {
    expect(source).toContain('isSuperAdmin');
    expect(source).toContain('/pos/settings/branches/create');
    expect(source).toContain('/pos/settings/branches/edit/');
    expect(source).toContain('currentBranchId');
  });

  it('preserves address and branch-feature editing integration', () => {
    expect(source).toContain('AddressForm');
    expect(source).toContain('AddressDisplay');
    expect(source).toContain('businessType');
    expect(source).toContain('trackSerialNumber');
    expect(source).toContain('enableTemplates');
  });
});
