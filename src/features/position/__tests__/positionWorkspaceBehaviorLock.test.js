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

describe('position workspace behavior lock', () => {
  it('preserves position create, edit and active-state actions', () => {
    expect(source).toContain('createAction');
    expect(source).toContain('fetchByIdAction');
    expect(source).toContain('updateAction');
    expect(source).toContain('toggleActiveAction');
  });

  it('preserves history-based create/edit return behavior', () => {
    expect(source).toContain('navigate(-1)');
  });
});
