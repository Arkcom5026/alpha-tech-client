import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

const legacyPaths = [
  'src/features/branch/page/CreateBranchPage.jsx',
  'src/features/branch/page/EditBranchPage.jsx',
  'src/features/branch/page/ListBranchPage.jsx',
];

describe('branch legacy page retirement', () => {
  it('keeps obsolete branch page surfaces retired', () => {
    for (const relativePath of legacyPaths) {
      expect(fs.existsSync(path.join(root, relativePath))).toBe(false);
    }
  });

  it('keeps canonical branch management on the settings workspace adapter', () => {
    const routes = fs.readFileSync(path.join(root, 'src/routes/partner/posPartnerRoutes.jsx'), 'utf8');
    const page = fs.readFileSync(path.join(root, 'src/features/settings/pages/ListBranchPage.jsx'), 'utf8');

    expect(routes).toContain("import ListBranchPage from '@/features/settings/pages/ListBranchPage';");
    expect(routes).toContain("{ path: 'branches', element: <ListBranchPage /> }");
    expect(page).toContain('BranchListWorkspace');
  });
});
