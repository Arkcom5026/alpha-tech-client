import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/supplier/store/supplierStore.js', 'utf8');

describe('supplier list cross-branch read authority contract', () => {
  it('sequences supplier-list reads and snapshots the requested branch', () => {
    expect(source).toContain('let supplierListRequestSequence = 0');
    expect(source).toContain('const requestedBranchId = resolveSupplierBranchId(explicitBranchId)');
    expect(source).toContain('const requestId = ++supplierListRequestSequence');
    expect(source).toContain('branchId: requestedBranchId');
  });

  it('discards stale success and stale error outcomes', () => {
    expect(source).toContain('const ownsRequest = () =>');
    expect(source).toContain('supplierListRequestSequence === requestId');
    expect(source).toContain('resolveSupplierBranchId() === requestedBranchId');
    expect(source).toMatch(/if \(!ownsRequest\(\)\) return null;/);
  });

  it('does not let stale finally release the active branch loading state', () => {
    expect(source).toContain('if (ownsRequest()) set({ isSupplierLoading: false })');
  });

  it('invalidates outstanding reads when supplier state is reset', () => {
    expect(source).toContain('supplierListRequestSequence += 1');
  });
});
