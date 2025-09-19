import apiClient from '@/utils/apiClient';

// ✅ ค้นหาสินค้าออนไลน์ (ใช้ใน Sidebar / Filter)
export const getProductsForOnline = async (filters = {}) => {
  try {
    const params = {};
    if (filters.branchId) params.branchId = filters.branchId; // ✅ เพิ่ม branchId
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.productTypeId) params.productTypeId = filters.productTypeId;
    if (filters.productProfileId) params.productProfileId = filters.productProfileId;
    if (filters.productTemplateId) params.productTemplateId = filters.productTemplateId;
    if (filters.searchText) params.searchText = filters.searchText;

    const res = await apiClient.get('/products/online/search', { params });
    return res.data;
  } catch (err) {
    console.error('❌ getProductsForOnline error:', err);
    throw err;
  }
};


// ✅ ดูรายละเอียดสินค้าออนไลน์รายตัว (ส่ง branchId)
export const getProductOnlineById = async (id, branchId) => {
  try {
    if (!branchId) throw new Error('branchId is required');
    const res = await apiClient.get(`/products/online/detail/${id}`, {
      params: { branchId },
    });
    return res.data;
  } catch (err) {
    console.error(`❌ getProductOnlineById error (id: ${id}):`, err);
    throw err;
  }
};


// ✅ เคลียร์ cache สินค้าออนไลน์ (ถ้ามี)
export const clearOnlineProductCache = async () => {
  try {
    const res = await apiClient.post('/products/online/clear-cache');
    return res.data;
  } catch (err) {
    console.error('❌ clearOnlineProductCache error:', err);
    throw err;
  }
};

// ✅ ดึง dropdown สำหรับกรองสินค้าออนไลน์
export const getProductDropdownsForOnline = async () => {
  try {
    const res = await apiClient.get('/products/online/dropdowns');
    
    return res.data;
  } catch (err) {
    console.error('❌ getProductDropdownsForOnline error:', err);
    throw err;
  }
};
