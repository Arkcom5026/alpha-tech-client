// ✅ bankApi.js – สำหรับโหลดรายชื่อธนาคารทั้งหมดจาก backend
import apiClient from '@/utils/apiClient';

// ดึงรายชื่อธนาคารทั้งหมด (active เท่านั้น ถ้ามี filter ฝั่ง backend)
export const getAllBanks = async () => {
  try {
    const res = await apiClient.get('/banks');
    return res.data;
  } catch (err) {
    console.error('❌ ไม่สามารถโหลดธนาคารได้:', err);
    return [];
  }
};