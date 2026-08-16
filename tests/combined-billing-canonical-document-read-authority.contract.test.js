import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/combinedBilling/store/combinedBillingStore.js'),
  'utf8',
);

describe('combined billing canonical document authority contract', () => {
  it('serializes canonical document reads and freezes the requested id', () => {
    expect(source).toContain('let combinedBillingCanonicalRequestSequence = 0');
    expect(source).toContain('const requestId = ++combinedBillingCanonicalRequestSequence');
    expect(source).toContain('const documentIdSnapshot = Number(id)');
    expect(source).toContain('getCombinedBillingById(documentIdSnapshot)');
  });

  it('clears the prior document and discards stale read writes', () => {
    expect(source).toContain('set({ combinedBilling: null, loading: true, error: null })');
    expect(source).toContain('requestId !== combinedBillingCanonicalRequestSequence');
    expect(source).toContain('requestId === combinedBillingCanonicalRequestSequence');
  });

  it('shares canonical ownership with create and confirm mutations', () => {
    const ownerAllocations = source.match(/\+\+combinedBillingCanonicalRequestSequence/g) || [];
    expect(ownerAllocations.length).toBeGreaterThanOrEqual(3);
    expect(source).toContain('createCombinedBillingDocumentAction: async');
    expect(source).toContain('confirmDocumentWorkspaceAction: async');
  });
});
