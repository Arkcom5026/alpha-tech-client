// features/unit/api/unitApi.js
import apiClient from '@/utils/apiClient';

// ✅ GET: ดึงรายการหน่วยนับทั้งหมด
export const fetchUnits = async () => {
  try {
    const res = await apiClient.get('/units');
    return res.data;
  } catch (err) {
    console.error('fetchUnits error:', err);
    throw err;
  }
};

// ✅ GET: ดึงหน่วยนับตาม id
export const fetchUnitById = async (id) => {
  try {
    const res = await apiClient.get(`/units/${id}`);
    return res.data;
  } catch (err) {
    console.error('fetchUnitById error:', err);
    throw err;
  }
};

// ✅ POST: สร้างหน่วยนับใหม่
export const createUnit = async (payload) => {
  try {
    const res = await apiClient.post('/units', payload);
    return res.data;
  } catch (err) {
    console.error('createUnit error:', err);
    throw err;
  }
};

// ✅ PUT: แก้ไขหน่วยนับ
export const updateUnit = async (id, payload) => {
  try {
    const res = await apiClient.put(`/units/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error('updateUnit error:', err);
    throw err;
  }
};

// ✅ DELETE: ลบหน่วยนับ
export const deleteUnit = async (id) => {
  try {
    const res = await apiClient.delete(`/units/${id}`);
    return res.data;
  } catch (err) {
    console.error('deleteUnit error:', err);
    throw err;
  }
};
