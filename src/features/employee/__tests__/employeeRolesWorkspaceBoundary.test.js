import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('employee roles workspace boundary', () => {
  it('preserves roles management behavior inside workspace authority', () => {
    const workspace = read('workspaces/ManageRolesWorkspace.jsx');
    expect(workspace).toContain('useAuthStore');
    expect(workspace).toContain("=== 'superadmin'");
    expect(workspace).toContain('getAllEmployees');
    expect(workspace).toContain('getBranchDropdowns');
    expect(workspace).toContain('updateUserRole');
    expect(workspace).toContain('setEmployeeActive');
    expect(workspace).toContain('branchFilter');
    expect(workspace).toContain("employee.status !== 'active'");
    expect(workspace).toContain("['admin', 'employee'].includes(employee.role)");
    expect(workspace).toContain('window.confirm');
  });

  it('keeps ManageRolesPage as a thin workspace adapter', () => {
    const page = read('pages/ManageRolesPage.jsx');
    expect(page).toContain("import ManageRolesWorkspace from '../workspaces/ManageRolesWorkspace'");
    expect(page).toContain('export default ManageRolesWorkspace');
    expect(page).not.toContain('useState');
    expect(page).not.toContain('updateUserRole');
  });
});
