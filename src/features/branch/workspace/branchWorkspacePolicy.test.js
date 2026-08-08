import { describe, expect, it } from 'vitest';
import {
  filterBranchesForShop,
  isBranchSuperAdmin,
  projectBranchEditDefaults,
  resolveBranchSlug,
} from './branchWorkspacePolicy';

describe('branch workspace policy', () => {
  const branches = [
    { id: 1, slug: 'advancetech', name: 'Advance' },
    { id: 2, shopSlug: 'partner-b', name: 'Partner B' },
    { id: 3, partnerSlug: 'partner-c', name: 'Partner C' },
  ];

  it('preserves case-insensitive superadmin authority', () => {
    expect(isBranchSuperAdmin('SUPERADMIN')).toBe(true);
    expect(isBranchSuperAdmin('superadmin')).toBe(true);
    expect(isBranchSuperAdmin('admin')).toBe(false);
  });

  it('preserves canonical slug fallback order', () => {
    expect(resolveBranchSlug({ slug: 'A', shopSlug: 'B', partnerSlug: 'C' })).toBe('a');
    expect(resolveBranchSlug({ shopSlug: 'B', partnerSlug: 'C' })).toBe('b');
    expect(resolveBranchSlug({ partnerSlug: 'C' })).toBe('c');
  });

  it('shows every branch to superadmin and only the active shop to other roles', () => {
    expect(filterBranchesForShop({ branches, shopSlug: 'missing', isSuperAdmin: true })).toBe(branches);
    expect(filterBranchesForShop({ branches, shopSlug: ' ADVANCETECH ', isSuperAdmin: false }))
      .toEqual([branches[0]]);
    expect(filterBranchesForShop({ branches, shopSlug: 'partner-b', isSuperAdmin: false }))
      .toEqual([branches[1]]);
  });

  it('preserves edit-form fallback values', () => {
    expect(projectBranchEditDefaults({ name: 'A', telephone: '0123', address: 'Road' })).toEqual({
      name: 'A',
      phone: '0123',
      address: 'Road',
    });
    expect(projectBranchEditDefaults(null)).toEqual({ name: '', phone: '', address: '' });
  });
});
