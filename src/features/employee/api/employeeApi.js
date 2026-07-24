// ✅ @filename: employeeApi.js
// ✅ @folder: src/features/employee/api/
// ChatGPT write permission test (no runtime impact)
import apiClient from '@/utils/apiClient';

// ✅ ดึงพนักงานทั้งหมด (รองรับค้นหา/กรอง/แบ่งหน้า)
export const getAllEmployees = async ({ page = 1, limit = 20, search = '', status = 'all', role = 'all', branchId } = {}) => {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('q', search);
    if (status && status !== 'all') params.set('status', status);
    if (role && role !== 'all') params.set('role', role);
    if (branchId) params.set('branchId', String(branchId));

    const res = await apiClient.get(`/employees?${params.toString()}`);
    return res.data;
  } catch (err) { throw err; }
};