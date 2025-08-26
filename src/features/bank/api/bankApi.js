// ✅ bankApi.js – ฟังก์ชันเรียกใช้งาน Bank API ให้ครบ CRUD ตาม backend
import apiClient from '@/utils/apiClient';

// GET /api/banks  → รองรับ q และ includeInactive
export const getAllBanks = async (params = {}) => {
  try {
    const { q, includeInactive } = params;
    const res = await apiClient.get('/banks', {
      params: {
        q: q || undefined,
        includeInactive: includeInactive ? 1 : undefined,
      },
    });
    return res.data;
  } catch (err) {
    console.error('❌ ไม่สามารถโหลดธนาคารได้:', err);
    return [];
  }
};

// GET /api/banks/:id
export const getBankById = async (id) => {
  if (!id) return null;
  try {
    const res = await apiClient.get(`/banks/${id}`);
    return res.data;
  } catch (err) {
    console.error('❌ ไม่พบธนาคารหรือโหลดไม่สำเร็จ:', err);
    return null;
  }
};

// POST /api/banks
export const createBank = async (payload) => {
  try {
    const res = await apiClient.post('/banks', payload);
    return res.data; // bank object ที่สร้าง
  } catch (err) {
    console.error('❌ สร้างธนาคารไม่สำเร็จ:', err);
    // ส่งผ่าน error response กลับไปให้ UI ตัดสินใจ (เช่น แสดงข้อความซ้ำซ้อน)
    throw err;
  }
};

// PATCH /api/banks/:id
export const updateBank = async (id, payload) => {
  try {
    const res = await apiClient.patch(`/banks/${id}`, payload);
    return res.data; // bank object ที่อัปเดต
  } catch (err) {
    console.error('❌ แก้ไขธนาคารไม่สำเร็จ:', err);
    throw err;
  }
};

// DELETE /api/banks/:id
export const deleteBank = async (id) => {
  try {
    const res = await apiClient.delete(`/banks/${id}`);
    return res.data; // { message: 'ลบธนาคารเรียบร้อย' }
  } catch (err) {
    console.error('❌ ลบธนาคารไม่สำเร็จ:', err);
    throw err;
  }
};
