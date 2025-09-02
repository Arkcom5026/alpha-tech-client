// ✅ @filename: employeeApi.js
// ✅ @folder: src/features/employee/api/
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
    return res.data; // อาจเป็น {items,total,...} หรือ array (รองรับทั้งสองในหน้า List)
  } catch (err) {
    console.error('❌ getAllEmployees error:', err);
    throw err;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getEmployeeById error:', err);
    throw err;
  }
};

export const createEmployee = async (data) => {
  try {
    const res = await apiClient.post('/employees', data);
    return res.data;
  } catch (err) {
    console.error('❌ createEmployee error:', err);
    throw err;
  }
};

export const updateEmployee = async (id, data) => {
  try {
    const res = await apiClient.put(`/employees/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateEmployee error:', err);
    throw err;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteEmployee error:', err);
    throw err;
  }
};

// ✅ โหลดตำแหน่งพนักงานทั้งหมด
export const getPositions = async () => {
  try {
    const res = await apiClient.get('/employees/positions');
    return res.data;
  } catch (err) {
    console.error('❌ getPositions error:', err);
    throw err;
  }
};

// ✅ อนุมัติพนักงานใหม่
export const approveEmployee = async (data) => {
  try {
    const res = await apiClient.post('/employees/approve-employee', data);
    return res.data;
  } catch (err) {
    console.error('❌ approveEmployee error:', err);
    throw err;
  }
};

// ✅ ค้นหา user จากอีเมล (ใช้ในหน้าอนุมัติ)
export const findUserByEmail = async (email) => {
  try {
    const res = await apiClient.get(`/auth/users/find?email=${encodeURIComponent(email)}`);
    return res.data;
  } catch (err) {
    console.error('❌ findUserByEmail error:', err);
    throw err;
  }
};

// ✅ เปลี่ยน role ได้เฉพาะ admin ↔ employee (ฝั่งเซิร์ฟเวอร์จะบังคับตรวจซ้ำ)
export const updateUserRole = async (userId, role) => {
  try {
    const res = await apiClient.patch(`/employees/roles/users/${userId}/role`, { role });
    return res.data;
  } catch (err) {
    console.error('❌ updateUserRole error:', err);
    throw err;
  }
};

// ✅ Dropdown รายชื่อสาขา (เฉพาะ superadmin)
export const getBranchDropdowns = async () => {
  try {
    const res = await apiClient.get('/employees/branches/dropdowns');
    return res.data; // [{ id, name }]
  } catch (err) {
    console.error('❌ getBranchDropdowns error:', err);
    throw err;
  }
};



