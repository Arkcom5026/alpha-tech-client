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

describe('employee workspace behavior lock', () => {
  it('preserves tenant-aware list loading and role/branch filtering', () => {
    const listPage = read('pages/ListEmployeePage.jsx');
    expect(listPage).toContain('useAuthStore');
    expect(listPage).toContain('shopSlug');
    expect(listPage).toContain("['admin', 'superadmin']");
    expect(listPage).toContain('getBranchDropdowns');
    expect(listPage).toContain('branchFilter');
    expect(listPage).toContain('getAllEmployees');
    expect(listPage).toContain('limit: 10000');
  });

  it('preserves client-side search, status filtering, and pagination semantics', () => {
    const listPage = read('pages/ListEmployeePage.jsx');
    expect(listPage).toContain("filters.search");
    expect(listPage).toContain("filters.status");
    expect(listPage).toContain('filtered.slice');
    expect(listPage).toContain('setPage(1)');
    expect(listPage).toContain('EmployeeTable');
  });

  it('preserves detail loading, status projection, and activate/deactivate lifecycle', () => {
    const viewPage = read('pages/ViewEmployeePage.jsx');
    expect(viewPage).toContain('getEmployeeById');
    expect(viewPage).toContain('setEmployeeActive');
    expect(viewPage).toContain("status === 'pending'");
    expect(viewPage).toContain('window.confirm');
    expect(viewPage).toContain("status: nextActive ? 'active' : 'inactive'");
    expect(viewPage).toContain('/pos/settings/employee/edit/');
  });

  it('preserves superadmin branch-edit authority on the canonical edit page', () => {
    const editPage = read('pages/EditEmployeePage.jsx');
    expect(editPage).toContain('useAuthStore');
    expect(editPage).toContain("=== 'superadmin'");
    expect(editPage).toContain('getBranchDropdowns');
    expect(editPage).toContain('updateEmployee');
    expect(editPage).toContain('canEditBranch={isSuperAdmin}');
    expect(editPage).toContain('branchOptions={branches}');
  });

  it('preserves the legacy employee form page as a distinct edit surface until retirement', () => {
    const formPage = read('pages/EmployeeFormPage.jsx');
    expect(formPage).toContain('getEmployeeById');
    expect(formPage).toContain('updateEmployee');
    expect(formPage).toContain("shopSlug || 'advancetech'");
    expect(formPage).toContain('showUserSearch={false}');
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
