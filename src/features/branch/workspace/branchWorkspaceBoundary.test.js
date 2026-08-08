import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('branch workspace ownership boundary', () => {
  const adapter = read('src/features/settings/pages/ListBranchPage.jsx');
  const workspace = read('src/features/branch/workspace/BranchListWorkspace.jsx');
  const policy = read('src/features/branch/workspace/branchWorkspacePolicy.js');

  it('keeps the canonical settings page as a thin runtime adapter', () => {
    expect(adapter).toContain("@/features/branch/workspace/BranchListWorkspace");
    expect(adapter).toContain("@/features/branch/workspace/branchWorkspacePolicy");
    expect(adapter).not.toContain('<table');
    expect(adapter).not.toContain('Building2');
    expect(adapter).not.toContain('CheckCircle');
  });

  it('keeps presentation inside the branch-owned workspace', () => {
    expect(workspace).toContain('<table');
    expect(workspace).toContain("register('name'");
    expect(workspace).toContain("register('phone'");
    expect(workspace).toContain("register('address'");
  });

  it('keeps tenant visibility as a pure branch-owned policy', () => {
    expect(policy).toContain('filterBranchesForShop');
    expect(policy).not.toContain('useBranchStore');
    expect(policy).not.toContain('useAuthStore');
    expect(policy).not.toContain('react-router-dom');
  });

  it('does not move auth or branch-store runtime into the workspace presentation', () => {
    expect(workspace).not.toContain('useAuthStore');
    expect(workspace).not.toContain('useBranchStore');
    expect(workspace).not.toContain('fetchBranchesAction');
  });
});
