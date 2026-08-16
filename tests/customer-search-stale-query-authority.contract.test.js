import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/customer/store/customerStore.js', 'utf8');

describe('customer search stale-query authority contract', () => {
  it('uses one shared sequence across customer search modes', () => {
    expect(source).toContain('let customerSearchRequestSequence = 0');
    expect(source.match(/const requestId = \+\+customerSearchRequestSequence/g)?.length).toBe(2);
    expect(source.match(/const ownsSearchRequest = \(\) => customerSearchRequestSequence === requestId/g)?.length).toBe(2);
  });

  it('discards stale success and stale error results before they mutate search state', () => {
    expect(source.match(/if \(!ownsSearchRequest\(\)\) return null;/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('does not allow stale finally to release the active search loading state', () => {
    expect(source.match(/if \(ownsSearchRequest\(\)\) set\(\{ isSearching: false \}\)/g)?.length).toBe(2);
  });

  it('invalidates outstanding searches when results are explicitly cleared', () => {
    expect(source).toContain('clearSearchedCustomers: () => {');
    expect(source).toContain('customerSearchRequestSequence += 1');
    expect(source).toContain('set({ searchedCustomers: [], searchError: null, isSearching: false })');
  });
});
