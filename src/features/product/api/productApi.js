// src/features/product/api/productApi.js
import apiClient from '@/utils/apiClient';
import { parseApiError } from '@/utils/uiHelpers';

// LIST
export const getProducts = async ({ search, status, categoryId, productTypeId, brandId, take, takeNum, page, skipNum } = {}) => {
  try {
    const params = { _ts: Date.now() };
    if (search?.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;
    if (categoryId) params.categoryId = categoryId;
    if (productTypeId) params.productTypeId = productTypeId;
    if (brandId) params.brandId = brandId;
    if (take || takeNum) params.take = take || takeNum;
    if (page) params.page = page;
    if (skipNum !== undefined) params.skipNum = skipNum;
    const { data } = await apiClient.get('products', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' }});
    if (import.meta.env?.DEV) console.log('[productApi] getProductById', id, data);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const createProduct = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createProduct payload', payload);
    const { data } = await apiClient.post('products', payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProduct = async (id, payload) => {
  try {
    const { data } = await apiClient.patch(`products/${id}`, payload);
    return data;
  } catch (err) { throw parseApiError(err); }
};
  
export const updateProductAndGet = async (id, payload) => {
  try {
    await apiClient.patch(`products/${id}`, payload);
    const { data: fresh } = await apiClient.get(`products/${id}`, { params: { _ts: Date.now(), v: 'full' } });
    if (import.meta.env?.DEV) console.log('[productApi] updateProductAndGet fresh', id, fresh);
    return fresh;
  } catch (err) { throw parseApiError(err); }
};

// alias สั้น ๆ
export const saveProduct = updateProductAndGet;

export const deleteProduct = async (id) => {
  try {
    const { data } = await apiClient.delete(`products/${id}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// =============================
// Enable / Disable (แยก API)
// =============================
export const disableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/disable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const enableProduct = async (id) => {
  try {
    const { data } = await apiClient.post(`products/${id}/enable`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Dropdowns (โหลดครั้งเดียว ใช้ทั้งระบบ)
export const getProductDropdownsPublic = async () => {
  try {
    const { data } = await apiClient.get('products/online/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductDropdowns = async () => {
  try {
    const { data } = await apiClient.get('products/dropdowns', { params: { _ts: Date.now() }});
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

export const getCatalogDropdowns = async ({ scope = 'pos' } = {}) => {
  try {
    const raw = scope === 'online'
      ? await getProductDropdownsPublic()
      : await getProductDropdowns();

    const {
      categories = [],
      productTypes = [],
      productProfiles = [],
      brands = [],
      productTypeBrands = [],
      productTypeBrandMap = {},
      units = [],
      productTemplates,
      templates = [],
    } = raw || {};

    const tpl = Array.isArray(productTemplates) ? productTemplates : (templates || []);

    return {
      categories,
      productTypes,
      profiles: productProfiles,
      productProfiles,
      brands,
      productTypeBrands,
      productTypeBrandMap,
      units,
      templates: tpl,
      productTemplates: tpl,
    };
  } catch (err) { throw parseApiError(err); }
};

// =============================
// Online Catalog
// =============================
const __buildOnlineParams = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null)
);

export const getOnlineProducts = async ({
  search,
  page = 1,
  pageSize = 24,
  sort = 'newest',
  categoryId,
  productTypeId,
  productProfileId,
  productTemplateId,
  branch,
} = {}) => {
  try {
    const params = __buildOnlineParams({ search, page, pageSize, sort, categoryId, productTypeId, productProfileId, productTemplateId, branch, _ts: Date.now() });
    const { data } = await apiClient.get('products/online/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const getProductOnlineById = async (id, { branch } = {}) => {
  try {
    const params = __buildOnlineParams({ branch, _ts: Date.now() });
    const { data = {} } = await apiClient.get(`products/online/detail/${id}`, { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Prices
export const getProductPrices = async (productId) => {
  try {
    const { data } = await apiClient.get(`products/${productId}/prices`, { params: { _ts: Date.now() }});
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const updateProductPrices = async (productId, prices) => {
  try {
    const { data } = await apiClient.put(`products/${productId}/prices`, { prices });
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const addProductPrice = async (productId, priceData) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] addProductPrice', { productId, priceData });
    const { data } = await apiClient.post(`products/${productId}/prices`, priceData);
    return data;
  } catch (err) { throw parseApiError(err); }
};

export const deleteProductPrice = async (productId, priceId) => {
  try {
    const { data } = await apiClient.delete(`products/${productId}/prices/${priceId}`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// POS Search
export const getProductsForPos = async (filters = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    
    // 🟢 SECURITY SANITIZATION: ตัด branchId ออกก่อนยิงส่ง เพื่อปล่อยให้ระบบหลังบ้านแกะเช็กสิทธิ์พนักงานตรง ป้องกัน 401 ลูปค้าง
    delete sanitized.branchId;

    const params = { ...sanitized, _ts: Date.now() };
    const { data } = await apiClient.get('products/pos/search', { params });
    return data;
  } catch (err) { throw parseApiError(err); }
};

// Migration
export const migrateSnToSimple = async (productId) => {
  try {
    const { data } = await apiClient.post(`products/${productId}/migrate-to-simple`);
    return data;
  } catch (err) { throw parseApiError(err); }
};

// ==================================================
// Ready-to-sell (summary)
// ==================================================
export const getReadyToSell = async ({ branchId, q = '', mode = 'ALL', page = 1, pageSize = 50, sort = 'receivedAt_desc' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      mode,
      page,
      pageSize,
      sort,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get('products/ready-to-sell', { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// Ready-to-sell (STRUCTURED details)
// ==================================================
export const getReadyToSellStructuredDetails = async ({ branchId, productId, q = '' } = {}) => {
  try {
    if (!branchId) {
      const e = new Error('ไม่พบ branchId กรุณา login ใหม่');
      e.code = 'BRANCH_ID_MISSING';
      throw e;
    }
    if (!productId) {
      const e = new Error('ไม่พบ productId');
      e.code = 'PRODUCT_ID_MISSING';
      throw e;
    }

    const params = {
      branchId,
      q: q?.trim() ? q.trim() : undefined,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get(`products/ready-to-sell/structured/${productId}`, { params });
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// QUICK STOCK IMPORT (กู้คืนสต๊อกด่วนรายเม็ด)
// ==================================================
export const enrollQuickStock = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] enrollQuickStock payload', payload);
    const { data } = await apiClient.post('quick-stock/quick-enroll', payload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// 🟢 QUICK STOCK ALL-IN-ONE (เพิ่มสินค้าแม่และเปิดบิลคลังด่วน)
// ==================================================
export const quickStockInAllInOneApi = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] quickStockInAllInOneApi payload', payload);
    
    // 🛡️ ป้องกันความปลอดภัยสากล: ลบข้อมูลสาขาออกจาก payload ก่อนส่งข้ามฝั่ง ปล่อยหลังบ้านคัดกรองจาก Token เอง
    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('quick-stock/all-in-one', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};


// ==================================================
// RUNTIME PRODUCT LOOKUP
// หา Operational Product ของ Branch ปัจจุบันจาก Template Product
// ==================================================
export const getOperationalProductByTemplateId = async (templateProductId) => {
  try {
    if (!templateProductId) {
      const e = new Error('ไม่พบ templateProductId');
      e.code = 'TEMPLATE_PRODUCT_ID_MISSING';
      throw e;
    }

    const { data } = await apiClient.get(`products/pos/runtime-by-template/${templateProductId}`, {
      params: { _ts: Date.now() },
    });

    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// CREATE OPERATIONAL PRODUCT FROM TEMPLATE
// สร้าง Operational Product ของ Branch ปัจจุบันจาก Template Product
// ==================================================
export const createOperationalProductFromTemplateApi = async (payload = {}) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createOperationalProductFromTemplateApi payload', payload);

    const sanitizedPayload = { ...payload };

    // Runtime Contract:
    // templateProductId ต้องคงอยู่เพื่อระบุต้นทาง Template
    // branchId ต้องให้ Backend แกะจาก session/runtime context เท่านั้น
    delete sanitizedPayload.branchId;

    const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// CREATE LOCAL OPERATIONAL PRODUCT
// สร้าง Operational Product เฉพาะ Branch ปัจจุบันเมื่อไม่มี Template ที่เหมาะสม
// ==================================================
export const createLocalOperationalProductApi = async (payload = {}) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] createLocalOperationalProductApi payload', payload);

    const sanitizedPayload = { ...payload };

    // Runtime Contract:
    // Local product ต้องไม่มี templateProductId และ branchId ต้องมาจาก backend session เท่านั้น
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.templateProductId;
    delete sanitizedPayload.productTemplateId;
    delete sanitizedPayload.items;
    delete sanitizedPayload.barcodes;
    delete sanitizedPayload.queue;
    delete sanitizedPayload.quantity;
    delete sanitizedPayload.stock;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    const { data } = await apiClient.post('products/pos/create-local', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// QUICK STOCK EXISTING PRODUCT INTAKE
// รับสินค้าเข้าจาก Product เดิม: Recovery / Quick Receive / Manufacture
// ==================================================
export const quickReceiveExistingProductApi = async (payload) => {
  try {
    if (import.meta.env?.DEV) console.log('[productApi] quickReceiveExistingProductApi payload', payload);

    const sanitizedPayload = { ...payload };

    // Security / Runtime Contract:
    // branchId และ movementType ต้องถูกกำหนดโดย Backend จาก session/runtime context เท่านั้น
    delete sanitizedPayload.branchId;
    delete sanitizedPayload.movementType;
    delete sanitizedPayload.source;

    // Quick Receive Runtime v2:
    // Queue Item ต้องมีเฉพาะ barcode / serialNumber
    // ราคาทั้งหมดอยู่ระดับ Runtime Session เท่านั้น
    const queue = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.queue)
        ? payload.queue
        : Array.isArray(payload?.barcodes)
          ? payload.barcodes
          : [];

    const cleanItems = queue
      .map((item) => {
        if (typeof item === 'string') {
          return {
            barcode: item.trim(),
            serialNumber: null,
          };
        }

        return {
          barcode: String(item?.barcode || item?.code || '').trim(),
          serialNumber: item?.serialNumber || item?.sn || null,
        };
      })
      .filter((item) => item.barcode);

    sanitizedPayload.items = cleanItems;
    sanitizedPayload.barcodes = cleanItems;

    const { data } = await apiClient.post('quick-stock/existing', sanitizedPayload);
    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// ==================================================
// TEMPLATE PRODUCT SEARCH / INTAKE CATALOG
// ใช้เฉพาะ QuickStock / PO / Recovery / Clone Flow
// ห้ามใช้กับ Product List / Product Detail / Store Runtime
// ==================================================
export const searchTemplateProducts = async (filters = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== '' && value !== undefined && value !== null
      )
    );

    // Security: ไม่ให้ FE ส่ง branchId เอง
    delete sanitized.branchId;

    // Runtime Catalog Separation:
    // Template Catalog ต้องยิงเข้า endpoint แยกโดยตรง
    // ไม่ใช้ products/pos/search?template=true อีกต่อไป
    delete sanitized.template;

    const params = {
      ...sanitized,
      _ts: Date.now(),
    };

    const { data } = await apiClient.get('products/template/search', {
      params,
    });

    return data;
  } catch (err) {
    throw parseApiError(err);
  }
};

// Backward-compatible alias for current QuickStockPage / legacy callers
export const getTemplateProductsForPos = searchTemplateProducts;

// Backward-compatible alias for current QuickStockPage
export const quickStockIntakeExistingApi = quickReceiveExistingProductApi;
