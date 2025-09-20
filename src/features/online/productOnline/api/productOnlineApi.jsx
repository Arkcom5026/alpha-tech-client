// 📁 FILE: features/online/productOnline/api/productOnlineApi.js
import apiClient from '@/utils/apiClient';

// 🛠️ helper: แปลง/คัดกรองพารามิเตอร์ให้สะอาดก่อนยิง API
const sanitizeParams = (raw = {}) => {
  const out = {};

  // --- numbers: ids & pagination ---
  const assignNum = (k) => {
    if (raw[k] === 0 || raw[k] === '0') { out[k] = 0; return; }
    if (raw[k] !== undefined && raw[k] !== null && raw[k] !== '') {
      const n = Number(raw[k]);
      if (!Number.isNaN(n)) out[k] = n;
    }
  };
  ['branchId','categoryId','productTypeId','productProfileId','productTemplateId','page','pageSize']
    .forEach(assignNum);
  if (out.page === undefined) out.page = 1;        // sensible defaults
  if (out.pageSize === undefined) out.pageSize = 50;

  // --- text: search --- (prefer `search`, then `searchText`, then `q`)
  const s = typeof raw.search === 'string' ? raw.search
          : typeof raw.searchText === 'string' ? raw.searchText
          : typeof raw.q === 'string' ? raw.q
          : undefined;
  if (typeof s === 'string' && s.trim()) out.search = s.trim();

  // --- sort --- (e.g. newest | priceAsc | priceDesc)
  if (typeof raw.sort === 'string' && raw.sort.trim()) out.sort = raw.sort.trim();

  // --- branch (slug) ---
  if (typeof raw.branch === 'string' && raw.branch.trim()) out.branch = raw.branch.trim();

  // --- boolean flags (optional) ---
  ['inStockOnly','activeOnly'].forEach((k) => {
    if (raw[k] !== undefined) out[k] = Boolean(raw[k]);
  });

  // cache buster
  out._ts = Date.now();
  return out;
};

// ✅ ค้นหาสินค้าออนไลน์ (ใช้ใน Sidebar / Filter)
export const getProductsForOnline = async (filters = {}) => {
  try {
    const params = sanitizeParams(filters);
    const res = await apiClient.get('/products/online/search', { params });
    return res.data;
  } catch (err) {
    console.error('❌ [getProductsForOnline]', err);
    throw err;
  }
};

// ✅ ดูรายละเอียดสินค้าออนไลน์รายตัว (ต้องส่ง branchId)
export const getProductOnlineById = async (id, opts = {}) => {
  try {
    const nId = Number(id);
    // Back-compat: ถ้า caller ส่งมาเป็นตัวเลขดิบ ให้ map เป็น { branchId }
    if (typeof opts === 'number') opts = { branchId: opts };
    const params = sanitizeParams(opts); // รองรับทั้ง branch และ branchId
    const res = await apiClient.get(`/products/online/detail/${nId}`, { params });
    return res.data;
  } catch (err) {
    console.error(`❌ [getProductOnlineById] (id: ${id})`, err);
    throw err;
  }
};





