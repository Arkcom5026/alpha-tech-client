// ✅ @filename: employeeApi.js
// ✅ @folder: src/features/employee/api/
import apiClient from '@/utils/apiClient';

// ✅ ดึงพนักงานทั้งหมด (รองรับค้นหา/กรอง/แบ่งหน้า)
export const getAllEmployees = async ({ page = 1, limit = 20, search = '', status = 'all', role = 'all', branchId } = {}) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('q', search);
  if (status && status !== 'all') params.set('status', status);
  if (role && role !== 'all') params.set('role', role);
  if (branchId) params.set('branchId', String(branchId));

  const res = await apiClient.get(`/employees?${params.toString()}`);
  return res.data;
};

export const getEmployeeById = async (id) => {
  const res = await apiClient.get(`/employees/${id}`);
  return res.data;
};

export const createEmployee = async (data) => {
  const res = await apiClient.post('/employees', data);
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await apiClient.put(`/employees/${id}`, data);
  return res.data;
};

export const setEmployeeActive = async (id, active) => {
  const res = await apiClient.patch(`/employees/${id}/status`, { active: Boolean(active) });
  return res.data;
};

// Compatibility guard: physical deletion is no longer part of employee lifecycle.
export const deleteEmployee = async () => {
  throw new Error('EMPLOYEE_HARD_DELETE_DISABLED');
};

export const getPositions = async () => {
  const res = await apiClient.get('/employees/positions');
  return res.data;
};

export const approveEmployee = async (data) => {
  const res = await apiClient.post('/employees/approve-employee', data);
  return res.data;
};

export const findUserByEmail = async (email) => {
  const res = await apiClient.get(`/auth/users/find?email=${encodeURIComponent(email)}`);
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await apiClient.patch(`/employees/roles/users/${userId}/role`, { role });
  return res.data;
};

export const getBranchDropdowns = async () => {
  const res = await apiClient.get('/employees/branches/dropdowns');
  return res.data;
};
