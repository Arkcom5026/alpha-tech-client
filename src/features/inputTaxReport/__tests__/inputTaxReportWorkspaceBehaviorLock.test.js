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

describe('input tax report workspace behavior lock', () => {
  it('preserves branch-scoped report loading', () => {
    expect(source).toContain('useBranchStore');
    expect(source).toContain('branchIdSafe');
    expect(source).toContain('fetchInputTaxReportAction');
    expect(source).toContain('reportData');
  });

  it('preserves local date-range semantics', () => {
    expect(source).toContain('parseLocalDateInput');
    expect(source).toContain("format(startDate, 'yyyy-MM-dd')");
    expect(source).toContain("format(endDate, 'yyyy-MM-dd')");
    expect(source).toContain('rangeParams');
  });

  it('preserves print handoff with date query parameters', () => {
    expect(source).toContain('URLSearchParams');
    expect(source).toContain('/pos/reports/inputtax/print?');
    expect(source).toContain('InputTaxReportTable');
  });
});
