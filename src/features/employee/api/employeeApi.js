
// ✅ @filename: employeeApi.js
// ✅ @folder: src/features/employee/api/
import apiClient from '@/utils/apiClient';

export const getAllEmployees = async () => {
  try {
    const res = await apiClient.get('/employees');
    return res.data;
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

// ✅ ค้นหา user
export const findUserByEmail = async (email) => {
  try {
    const res = await apiClient.get(`/auth/users/find?email=${email}`);
    return res.data;
  } catch (err) {
    console.error('❌ findUserByEmail error:', err);
    throw err;
  }
};
