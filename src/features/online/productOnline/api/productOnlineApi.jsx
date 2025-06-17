import apiClient from '@/utils/apiClient';

// ✅ ค้นหาสินค้าออนไลน์ (ใช้ใน Sidebar / Filter)
export const getProductsForOnline = async (filters) => {
  try {
    const res = await apiClient.get('/products/online/search', { params: filters });
    return res.data;
  } catch (err) {
    console.error('❌ getProductsForOnline error:', err);
    throw err;
  }
};

// ✅ ดูรายละเอียดสินค้าออนไลน์รายตัว
export const getProductOnlineById = async (id) => {
  try {
    const res = await apiClient.get(`/products/online/detail/${id}`);
    console.log('getProductOnlineById : ', res);
    return res.data;
  } catch (err) {
    console.error(`❌ getProductOnlineById error (id: ${id}):`, err);
    throw err;
  }
};

// ✅ (Deprecated) — ไม่ใช้แล้ว แนะนำให้ใช้ getProductsForOnline แทน
export const searchOnlineProducts = async (query) => {
  try {
    const res = await apiClient.get(`/products/online/search?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    console.error(`❌ searchOnlineProducts error (query: ${query}):`, err);
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
    console.log('getProductDropdownsForOnline : ',res)
    return res.data;
  } catch (err) {
    console.error('❌ getProductDropdownsForOnline error:', err);
    throw err;
  }
};
