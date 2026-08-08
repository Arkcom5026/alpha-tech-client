import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

const expectThinAdapter = (pagePath, workspaceName) => {
  const page = read(pagePath);
  expect(page).toContain(`import ${workspaceName} from '../workspaces/${workspaceName}'`);
  expect(page).toContain(`export default ${workspaceName}`);
  expect(page).not.toContain('useState');
  expect(page).not.toContain('useEffect');
};

describe('employee workspace boundary', () => {
  it('keeps list, detail, and edit pages as thin adapters', () => {
    expectThinAdapter('pages/ListEmployeePage.jsx', 'EmployeeListWorkspace');
    expectThinAdapter('pages/ViewEmployeePage.jsx', 'EmployeeDetailWorkspace');
    expectThinAdapter('pages/EditEmployeePage.jsx', 'EmployeeEditWorkspace');
  });

  it('keeps legacy employee form isolated from canonical edit authority', () => {
    expectThinAdapter('pages/EmployeeFormPage.jsx', 'LegacyEmployeeFormWorkspace');
    const legacyWorkspace = read('workspaces/LegacyEmployeeFormWorkspace.jsx');
    const canonicalEdit = read('workspaces/EmployeeEditWorkspace.jsx');
    expect(legacyWorkspace).toContain("shopSlug || 'advancetech'");
    expect(canonicalEdit).toContain('canEditBranch={isSuperAdmin}');
    expect(canonicalEdit).toContain('branchOptions={branches}');
  });

  it('keeps runtime orchestration out of route-facing pages', () => {
    const listPage = read('pages/ListEmployeePage.jsx');
    const detailPage = read('pages/ViewEmployeePage.jsx');
    const editPage = read('pages/EditEmployeePage.jsx');
    const combined = `${listPage}\n${detailPage}\n${editPage}`;
    expect(combined).not.toContain('getAllEmployees');
    expect(combined).not.toContain('setEmployeeActive');
    expect(combined).not.toContain('getBranchDropdowns');
    expect(combined).not.toContain('updateEmployee');
    expect(combined).not.toContain('useAuthStore');
  });
});
