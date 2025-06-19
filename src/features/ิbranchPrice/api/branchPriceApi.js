// 📦 branchPriceApi.js
import apiClient from '@/utils/apiClient';

// ✅ โหลดราคาทั้งหมดของสาขาที่ login อยู่ (จาก token)
export const getBranchPricesByBranch = async () => {
  try {
    return await apiClient.get('/branch-prices/by-branch');
  } catch (err) {
    console.error('❌ getBranchPricesByBranch error:', err);
    throw err;
  }
};

// ✅ เพิ่มหรือแก้ไขราคาของสินค้าในสาขาปัจจุบัน
export const upsertBranchPrice = async (data) => {
  try {
    return await apiClient.post('/branch-prices', data);
  } catch (err) {
    console.error('❌ upsertBranchPrice error:', err);
    throw err;
  }
};

// ✅ ดึงราคาที่ใช้งานจริงตามวัน (ใช้ในฝั่ง Online สำหรับแสดงราคาล่าสุด)
export const getActiveBranchPrice = async (productId) => {
  try {
    return await apiClient.get(`/branch-prices/me/${productId}`);
  } catch (err) {
    console.error('❌ getActiveBranchPrice error:', err);
    throw err;
  }
};

// ✅ ดึงสินค้าทั้งหมด พร้อมราคาสำหรับสาขานี้ (แม้บางตัวจะยังไม่มีราคา)
export const getAllProductsWithBranchPrice = async () => {
  try {
    return await apiClient.get('/branch-prices/all-products');
  } catch (err) {
    console.error('❌ getAllProductsWithBranchPrice error:', err);
    throw err;
  }
};
