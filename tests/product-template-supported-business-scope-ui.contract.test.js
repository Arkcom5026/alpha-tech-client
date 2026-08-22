import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../src/features/templateCandidate/utils/businessType.js', import.meta.url),
  'utf8'
);

describe('product template supported business scope UI contract', () => {
  it('exposes only business scopes backed by a configured template branch mapping', () => {
    expect(source).toContain("{ value: 'IT', label: BUSINESS_TYPE_LABELS.IT }");
    expect(source).not.toContain("{ value: 'GENERAL', label:");
    expect(source).not.toContain("{ value: 'ELECTRONICS', label:");
    expect(source).not.toContain("{ value: 'CONSTRUCTION', label:");
    expect(source).not.toContain("{ value: 'GROCERY', label:");
    expect(source).toContain("GENERAL: 'ธุรกิจทั่วไป'");
  });
});
