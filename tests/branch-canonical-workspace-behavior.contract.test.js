import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('canonical branch runtime behavior lock', () => {
  const routes = read('src/routes/partner/posPartnerRoutes.jsx');
  const page = read('src/features/settings/pages/ListBranchPage.jsx');
  const workspace = read('src/features/branch/workspace/BranchListWorkspace.jsx');
  const policy = read('src/features/branch/workspace/branchWorkspacePolicy.js');
  const runtimeSource = `${page}\n${workspace}\n${policy}`;

  it('keeps settings branches routed to the canonical settings adapter', () => {
    expect(routes).toContain("import ListBranchPage from '@/features/settings/pages/ListBranchPage';");
    expect(routes).toContain("{ path: 'branches', element: <ListBranchPage /> }");
    expect(page).toContain("BranchListWorkspace");
  });

  it('keeps branch data and auth reads at their existing public stores', () => {
    expect(page).toContain('useBranchStore');
    expect(page).toContain('fetchBranchesAction');
    expect(page).toContain('useAuthStore');
    expect(policy).toContain("normalizeBranchSlug(role) === 'superadmin'");
  });

  it('preserves tenant visibility by shop slug for non-superadmin users', () => {
    expect(policy).toContain("normalizeBranchSlug(shopSlug)");
    expect(policy).toContain('branch?.slug || branch?.shopSlug || branch?.partnerSlug');
    expect(policy).toContain('if (isSuperAdmin) return source');
    expect(policy).toContain('resolveBranchSlug(branch) === targetSlug');
    expect(page).toContain('filterBranchesForShop({');
  });

  it('preserves branch refresh and inline edit affordances', () => {
    expect(page).toContain('fetchBranches?.()');
    expect(workspace).toContain('แก้ไขข้อมูลร้าน/บริษัท');
    expect(workspace).toContain("register('name'");
    expect(workspace).toContain("register('phone'");
    expect(workspace).toContain("register('address'");
  });

  it('preserves current simulated save behavior without inventing persistence', () => {
    expect(page).toContain('await new Promise((resolve) => setTimeout(resolve, 600))');
    expect(page).toContain('selectedShop.name = data.name');
    expect(page).toContain('selectedShop.phone = data.phone');
    expect(page).toContain('selectedShop.address = data.address');
    expect(page).toContain('แก้ไขข้อมูลร้าน/บริษัท เรียบร้อยแล้ว');
  });

  it('preserves table, loading, empty and verified presentation states', () => {
    for (const token of [
      'กำลังดึงข้อมูลพิกัดโครงสร้างระบบจากคลาวด์...',
      'ไม่พบข้อมูลโครงสร้างออนไลน์ที่ลงทะเบียนภายใต้สิทธิ์ของแบรนด์นี้',
      'Verified',
      'ข้อมูลชุดนี้ได้รับการจำกัดสิทธิ์ความปลอดภัยในรูปแบบ Multi-Tenant',
    ]) {
      expect(workspace).toContain(token);
    }
  });

  it('does not promote the misplaced legacy branch page files into routed authority', () => {
    expect(routes).not.toContain('@/features/branch/page/CreateBranchPage');
    expect(routes).not.toContain('@/features/branch/page/EditBranchPage');
    expect(routes).not.toContain('@/features/branch/page/ListBranchPage');
  });

  it('keeps all migrated behavior within the branch workspace and canonical adapter', () => {
    expect(runtimeSource).toContain('projectBranchEditDefaults');
    expect(runtimeSource).toContain('BranchListWorkspace');
  });
});
