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

  it('preserves canonical workspace management authority', () => {
    expect(source).toContain('BranchListWorkspace');
    expect(source).toContain('filterBranchesForShop');
    expect(source).toContain('isBranchSuperAdmin');
    expect(source).toContain('projectBranchEditDefaults');
    expect(source).not.toContain('/pos/settings/branches/create');
    expect(source).not.toContain('/pos/settings/branches/edit/');
  });

  it('preserves active branch workspace edit affordances without promoting legacy pages', () => {
    expect(source).toContain("register('name'");
    expect(source).toContain("register('phone'");
    expect(source).toContain("register('address'");
    expect(source).toContain('แก้ไขข้อมูลร้าน/บริษัท');
  });
});
