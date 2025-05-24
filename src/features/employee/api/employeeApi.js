// ✅ @filename: employeeApi.js
// ✅ @folder: src/features/employee/api/

import apiClient from '@/utils/apiClient';

export const getAllEmployees = async (token, branchId) => {
  try {
    const res = await apiClient.get(`/employees?branchId=${branchId}`);
    return res.data;
  } catch (err) {
    console.error('❌ getAllEmployees error:', err);
    throw err;
  }
};

export const getEmployeeById = async (token, id) => {
  try {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ getEmployeeById error:', err);
    throw err;
  }
};

export const createEmployee = async (token, data) => {
  try {
    const res = await apiClient.post('/employees', data);
    return res.data;
  } catch (err) {
    console.error('❌ createEmployee error:', err);
    throw err;
  }
};

export const updateEmployee = async (token, id, data) => {
  try {
    const res = await apiClient.put(`/employees/${id}`, data);
    return res.data;
  } catch (err) {
    console.error('❌ updateEmployee error:', err);
    throw err;
  }
};

export const deleteEmployee = async (token, id) => {
  try {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ deleteEmployee error:', err);
    throw err;
  }
};

