import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  'src/features/customerMoneyReceive/customer/useCustomerMoneyReceiveCustomerSearch.js',
  'utf8',
);

describe('customer money receive search authority contract', () => {
  it('owns each submitted search with a synchronous request ref', () => {
    expect(source).toContain("import { useCallback, useRef, useState } from 'react'");
    expect(source).toContain('const requestRef = useRef(0)');
    expect(source).toContain('const requestId = ++requestRef.current');
    expect(source).toContain('const ownsRequest = () => requestRef.current === requestId');
  });

  it('suppresses stale success, error, and finally outcomes', () => {
    expect(source).toMatch(/if \(!ownsRequest\(\)\) return;/);
    expect(source).toContain('if (ownsRequest()) setLoading(false)');
  });

  it('invalidates pending searches when query, selection, or clear context changes', () => {
    expect(source.match(/requestRef\.current \+= 1/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source).toContain('const setQuery = useCallback((value) => {');
    expect(source).toContain('const select = useCallback((customer) => {');
    expect(source).toContain('const clear = useCallback(() => {');
  });
});
