import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveListPage.jsx', 'utf8');

describe('customer money receive list read authority contract', () => {
  it('uses synchronous request ownership for list loads', () => {
    expect(source).toContain('const loadRequestRef = useRef(0)');
    expect(source).toContain('const requestId = ++loadRequestRef.current');
    expect(source).toContain('const ownsRequest = () => loadRequestRef.current === requestId');
  });

  it('freezes the applied filter intent before persistence-free async work', () => {
    expect(source).toContain('const filterSnapshot = { ...appliedFilters }');
    expect(source).toContain('Object.entries(filterSnapshot)');
    expect(source).toContain('setAppliedFilters({ ...filters })');
  });

  it('discards stale success, stale error, and stale finally outcomes', () => {
    expect(source).toContain("if (!ownsRequest()) return { ok: false, stale: true, rows: [] }");
    expect(source).toContain('if (ownsRequest()) setLoading(false)');
  });

  it('invalidates outstanding list reads on effect cleanup/context replacement', () => {
    expect(source).toContain('loadRequestRef.current += 1');
  });
});
