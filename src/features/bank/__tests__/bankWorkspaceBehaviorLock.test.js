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

describe('bank workspace behavior lock', () => {
  it('preserves bank runtime actions and management policy', () => {
    expect(source).toContain('fetchBanksAction');
    expect(source).toContain('createBankAction');
    expect(source).toContain('updateBankAction');
    expect(source).toContain('toggleBankActiveAction');
    expect(source).toContain('isSuperAdmin');
  });

  it('preserves the tenant bank settings navigation contract', () => {
    expect(source).toContain('/pos/settings/bank');
    expect(source).toContain('window.location.pathname');
  });
});
