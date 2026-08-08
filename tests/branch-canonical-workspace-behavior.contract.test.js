import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('canonical branch runtime behavior lock', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  const page = read('src/features/settings/pages/ListBranchPage.jsx');

  it('keeps settings branches routed to the canonical settings adapter', () => {
    expect(routes).toContain("import ListBranchPage from '@/features/settings/pages/ListBranchPage';");
    expect(routes).toContain("{ path: 'branches', element: <ListBranchPage /> }");
  });

  it('keeps branch data and auth reads at their existing public stores', () => {
    expect(page).toContain("useBranchStore");
    expect(page).toContain("fetchBranchesAction");
    expect(page).toContain("useAuthStore");
    expect(page).toContain("String(role || '').toLowerCase() === 'superadmin'");
  });

  it('preserves tenant visibility by shop slug for non-superadmin users', () => {
    expect(page).toContain("const targetSlug = String(shopSlug || '').trim().toLowerCase()");
    expect(page).toContain("b?.slug || b?.shopSlug || b?.partnerSlug");
    expect(page).toContain('if (isSuperAdmin) return rawBranches');
    expect(page).toContain('return branchSlug === targetSlug');
  });

  it('preserves branch refresh and inline edit affordances', () => {
    expect(page).toContain('fetchBranches?.()');
    expect(page).toContain('แก้ไขข้อมูลร้าน/บริษัท');
    expect(page).toContain("register('name'");
    expect(page).toContain("register('phone'");
    expect(page).toContain("register('address'");
  });

  it('preserves current simulated save behavior without inventing persistence', () => {
    expect(page).toContain('await new Promise((resolve) => setTimeout(resolve, 600))');
    expect(page).toContain('selectedShop.name = data.name');
    expect(page).toContain('selectedShop.phone = data.phone');
    expect(page).toContain('selectedShop.address = data.address');
    expect(page).toContain('แก้ไขข้อมูลร้าน/บริษัท เรียบร้อยแล้ว');
  });

  it('does not promote the misplaced legacy branch page files into routed authority', () => {
    expect(routes).not.toContain("@/features/branch/page/CreateBranchPage");
    expect(routes).not.toContain("@/features/branch/page/EditBranchPage");
    expect(routes).not.toContain("@/features/branch/page/ListBranchPage");
  });
});
