import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');
const readFeatureSource = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  if (name === '__tests__') return [];
  return statSync(path).isDirectory() ? readFeatureSource(path) : [readFileSync(path, 'utf8')];
}).join('\n');

const source = readFeatureSource(featureRoot);

const expectThinAdapter = (pagePath, workspaceName) => {
  const page = read(pagePath);
  expect(page).toContain(`import ${workspaceName} from '../workspaces/${workspaceName}'`);
  expect(page).toContain(`export default ${workspaceName}`);
};

describe('employee workspace behavior lock', () => {
  it('preserves tenant-aware list loading and role/branch filtering', () => {
    const listWorkspace = read('workspaces/EmployeeListWorkspace.jsx');
    expect(listWorkspace).toContain('useAuthStore');
    expect(listWorkspace).toContain('shopSlug');
    expect(listWorkspace).toContain("['admin', 'superadmin']");
    expect(listWorkspace).toContain('getBranchDropdowns');
    expect(listWorkspace).toContain('branchFilter');
    expect(listWorkspace).toContain('getAllEmployees');
    expect(listWorkspace).toContain('limit: 10000');
    expectThinAdapter('pages/ListEmployeePage.jsx', 'EmployeeListWorkspace');
  });

  it('preserves client-side search, status filtering, and pagination semantics', () => {
    const listWorkspace = read('workspaces/EmployeeListWorkspace.jsx');
    expect(listWorkspace).toContain('filters.search');
    expect(listWorkspace).toContain('filters.status');
    expect(listWorkspace).toContain('filtered.slice');
    expect(listWorkspace).toContain('setPage(1)');
    expect(listWorkspace).toContain('EmployeeTable');
  });

  it('preserves detail loading, status projection, and activate/deactivate lifecycle', () => {
    const detailWorkspace = read('workspaces/EmployeeDetailWorkspace.jsx');
    expect(detailWorkspace).toContain('getEmployeeById');
    expect(detailWorkspace).toContain('setEmployeeActive');
    expect(detailWorkspace).toContain("status === 'pending'");
    expect(detailWorkspace).toContain('window.confirm');
    expect(detailWorkspace).toContain("status: nextActive ? 'active' : 'inactive'");
    expect(detailWorkspace).toContain('/pos/settings/employee/edit/');
    expectThinAdapter('pages/ViewEmployeePage.jsx', 'EmployeeDetailWorkspace');
  });

  it('preserves superadmin branch-edit authority on the canonical edit workspace', () => {
    const editWorkspace = read('workspaces/EmployeeEditWorkspace.jsx');
    expect(editWorkspace).toContain('useAuthStore');
    expect(editWorkspace).toContain("=== 'superadmin'");
    expect(editWorkspace).toContain('getBranchDropdowns');
    expect(editWorkspace).toContain('updateEmployee');
    expect(editWorkspace).toContain('canEditBranch={isSuperAdmin}');
    expect(editWorkspace).toContain('branchOptions={branches}');
    expectThinAdapter('pages/EditEmployeePage.jsx', 'EmployeeEditWorkspace');
  });

  it('preserves the legacy employee form workspace as a distinct edit surface until retirement', () => {
    const legacyWorkspace = read('workspaces/LegacyEmployeeFormWorkspace.jsx');
    expect(legacyWorkspace).toContain('getEmployeeById');
    expect(legacyWorkspace).toContain('updateEmployee');
    expect(legacyWorkspace).toContain("shopSlug || 'advancetech'");
    expect(legacyWorkspace).toContain('showUserSearch={false}');
    expectThinAdapter('pages/EmployeeFormPage.jsx', 'LegacyEmployeeFormWorkspace');
  });

  it('preserves employee form normalization and branch submission policy', () => {
    const form = read('components/EmployeeForm.jsx');
    expect(form).toContain('name: formData.name.trim()');
    expect(form).toContain('phone: formData.phone.trim()');
    expect(form).toContain('positionId: Number(formData.positionId)');
    expect(form).toContain('canEditBranch && formData.branchId');
    expect(form).toContain('branchId: Number(formData.branchId)');
  });

  it('preserves employee API and store lifecycle authority without hard delete', () => {
    const api = read('api/employeeApi.js');
    const store = read('store/employeeStore.js');
    expect(api).toContain("apiClient.patch(`/employees/${id}/status`");
    expect(api).toContain('EMPLOYEE_HARD_DELETE_DISABLED');
    expect(store).toContain('Auth store remains session authority');
    expect(store).toContain('setEmployeeActiveAction');
    expect(store).toContain('Never delete employee history');
    expect(store).toContain('return false');
    expect(source).toContain('employee-storage');
  });
});
