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
export const getAllProductsWithBranchPrice = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined)
    );
    const queryParams = new URLSearchParams(cleanFilters).toString();
    console.log('✅ getAllProductsWithBranchPrice queryParams:', queryParams);

    const url = `/branch-prices/all-products${queryParams ? `?${queryParams}` : ''}`;
    return await apiClient.get(url);
  } catch (err) {
    console.error('❌ getAllProductsWithBranchPrice error:', err);
    throw err;
  }
};
    

// ✅ ดึงราคาตาม branchId ที่ระบุ (ใช้ในฝั่ง Online)
export const getBranchPricesByBranchId = async (branchId) => {
  try {
    return await apiClient.get(`/branch-prices/by-branch/${branchId}`);
  } catch (err) {
    console.error('❌ getBranchPricesByBranchId error:', err);
    throw err;
  }
};

// ✅ ดึงสินค้าทั้งหมดพร้อมราคาตาม branchId
export const getAllProductsWithBranchPriceByBranchId = async (branchId) => {
  try {
    return await apiClient.get(`/branch-prices/all-products/${branchId}`);
  } catch (err) {
    console.error('❌ getAllProductsWithBranchPriceByBranchId error:', err);
    throw err;
  }
};
