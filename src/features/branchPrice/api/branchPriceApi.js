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
    const allowedKeys = [
      'categoryId',
      'productTypeId',
      'brandId',
      'searchText',
      'includeInactive',
      'page',
      'limit',
    ];

    const cleanFilters = Object.fromEntries(
      allowedKeys
        .map((key) => [key, filters?.[key]])
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const queryParams = new URLSearchParams(
      Object.entries(cleanFilters).map(([key, value]) => [key, String(value)])
    ).toString();

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

// ✅ อัปเดตราคาหลายรายการพร้อมกัน (bulk update)
export const updateMultipleBranchPrices = async (data) => {
  try {
    return await apiClient.put('/branch-prices/bulk-update', data);
  } catch (err) {
    console.error('❌ updateMultipleBranchPrices error:', err);
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



