



// ✅ src/features/product/store/productStore.js
import { create } from 'zustand';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsForPos,
  getCatalogDropdowns,
  disableProduct,
  enableProduct,
} from '../api/productApi';
import { migrateSnToSimple } from '../api/productApi';
import {
  uploadImagesProduct,
  uploadImagesProductFull,
  deleteImageProduct,
  setProductCoverImage,
} from '../api/productImagesApi';

const initialDropdowns = {
  categories: [],
  productTypes: [],
  // รองรับทั้งชื่อเก่าและใหม่ให้ component ใช้งานร่วมกันได้
  productProfiles: [],
  profiles: [],
  templates: [],
  productTemplates: [],
};

const useProductStore = create((set, get) => ({
  // ---- Lists / Entities ----
  products: [],              // รายการทั่วไปที่ใช้หลายหน้า
  simpleProducts: [],        // รายการเฉพาะหน้า Quick Receive (SIMPLE)
  currentProduct: null,

  // ---- Dropdowns ----
  dropdowns: initialDropdowns,
  dropdownsLoaded: false,

  // ---- UI State ----
  searchResults: [],
  isLoading: false,
  error: null,

  // -------- Products (List/Read) --------
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProducts(filters);
      set({ products: data, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchProducts error:', error);
      set({ error: get().normalizeError(error, 'โหลดสินค้าสำหรับ POS ไม่สำเร็จ'), isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductById(id);
      set({ currentProduct: data, isLoading: false });
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchProductById error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const data = await getProductById(id);
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ getProductById error:', error);
      throw error;
    }
  },

  // -------- Products (Create/Update/Delete) --------
  saveProduct: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };

      // ✅ BE createProduct ใช้ data.templateId (ไม่ใช่ productTemplateId)
      // ดังนั้นต้อง map ให้ถูกก่อนยิง API เพื่อกัน PRODUCT_TEMPLATE_REQUIRED
      if (!cleanedPayload.templateId && cleanedPayload.productTemplateId) {
        cleanedPayload.templateId = cleanedPayload.productTemplateId;
      }

      // ✅ ไม่ส่ง branchId ไป BE (BE อ่านจาก req.user.branchId ตาม BRANCH_SCOPE_ENFORCED)
      delete cleanedPayload.branchId;

      // ✅ เคลียร์ field ที่ไม่ควรส่ง
      delete cleanedPayload.productTemplateId;
      delete cleanedPayload.unit;
      delete cleanedPayload.unitId;
      delete cleanedPayload.unit;
      delete cleanedPayload.unitId;

      const data = await createProduct(cleanedPayload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ [Store] saveProduct ล้มเหลว:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };
      delete cleanedPayload.unit;
      delete cleanedPayload.unitId;

      try {
        const data = await updateProduct(id, cleanedPayload);
        set({ isLoading: false });
        return data;
      } catch (err) {
        // Try auto-migrate if switching to SIMPLE (noSN=true) but SNs still exist
        const code = err?.code || err?.error || err?.data?.error || err?.response?.data?.error;
        const switchingToSimple = cleanedPayload?.noSN === true;
        if (switchingToSimple && code === 'MODE_SWITCH_REQUIRES_CONVERSION') {
          await migrateSnToSimple(id);
          const data = await updateProduct(id, cleanedPayload);
          set({ isLoading: false });
          return data;
        }
        throw err;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ updateProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ deleteProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  // -------- Products (Enable/Disable) --------
  // ✅ แยก API ชัดเจน ไม่ใช้ delete แล้ว
  disableProductAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await disableProduct(id);
      const pid = Number(id);
      set((state) => ({
        products: Array.isArray(state.products)
          ? state.products.map((p) => (Number(p.id) === pid ? { ...p, active: false } : p))
          : state.products,
        currentProduct:
          state.currentProduct && Number(state.currentProduct?.id) === pid
            ? { ...state.currentProduct, active: false }
            : state.currentProduct,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ disableProductAction error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  enableProductAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await enableProduct(id);
      const pid = Number(id);
      set((state) => ({
        products: Array.isArray(state.products)
          ? state.products.map((p) => (Number(p.id) === pid ? { ...p, active: true } : p))
          : state.products,
        currentProduct:
          state.currentProduct && Number(state.currentProduct?.id) === pid
            ? { ...state.currentProduct, active: true }
            : state.currentProduct,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ enableProductAction error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  // -------- Dropdowns (โหลดครั้งเดียว ใช้ทั้งระบบ) -------- (โหลดครั้งเดียว ใช้ทั้งระบบ) --------
  fetchDropdownsAction: async (force = false) => {
    // prevent unnecessary reload
    if (get().dropdownsLoaded && !force) return get().dropdowns;
    try {
      // call API
      const raw = await getCatalogDropdowns();

      // normalize various possible shapes from BE
      const pickArr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

      const categories = pickArr(
        raw?.categories,
        raw?.categoryList,
        raw?.category_list,
        raw?.data?.categories,
        raw?.list?.categories,
        raw?.categoriesList,
        raw?.items?.categories
      );

      const productTypes = pickArr(
        raw?.productTypes,
        raw?.productTypeList,
        raw?.product_types,
        raw?.types,
        raw?.data?.productTypes,
        raw?.list?.productTypes,
        raw?.items?.productTypes,
        raw?.list // some APIs return `list` for types
      );

      const profiles = pickArr(
        raw?.profiles,
        raw?.productProfiles,
        raw?.profileList,
        raw?.data?.profiles
      );

      const templates = pickArr(
        raw?.templates,
        raw?.productTemplates,
        raw?.templateList,
        raw?.data?.templates
      );

      const dropdowns = { categories, productTypes, profiles, productProfiles: profiles, templates, productTemplates: templates };
      set({ dropdowns, dropdownsLoaded: true });
      return dropdowns;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchDropdownsAction error:', error);
      set({ error });
      throw error;
    }
  },

  ensureDropdownsAction: async () => {
    if (!get().dropdownsLoaded) {
      await get().fetchDropdownsAction(true);
    }
    return get().dropdowns;
  },

  resetDropdowns: () => set({ dropdowns: initialDropdowns, dropdownsLoaded: false }),

  // -------- Image Uploads --------
  uploadImages: async (files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProduct(files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ [Store] uploadImages ล้มเหลว:', error);
      throw error;
    }
  },

  uploadImagesFull: async (productId, files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProductFull(productId, files, captions, coverIndex);

      // ✅ ถ้า currentProduct คือสินค้าตัวเดียวกัน ให้รีเฟรช images ทันที (กัน UI เพี้ยน)
      set((state) => {
        if (!state.currentProduct || Number(state.currentProduct?.id) !== Number(productId)) return {};
        return {
          currentProduct: {
            ...state.currentProduct,
            images: uploaded?.images ?? state.currentProduct?.images,
          },
        };
      });

      return uploaded;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ uploadImagesFull error:', error);
      throw error;
    }
  },

  // ✅ ตั้งรูปหน้าปกหลังอัปโหลด (PATCH /products/:id/images/:imageId/cover)
  setCoverImageAction: async ({ productId, imageId }) => {
    try {
      const pid = productId != null ? Number(productId) : null;
      const imgId = imageId != null && imageId !== '' ? Number(imageId) : null;

      if (!pid || !imgId) throw new Error('Missing data');

      const result = await setProductCoverImage(pid, imgId);

      // ✅ sync currentProduct.images ให้ทันที
      if (result?.images) {
        set((state) => {
          if (!state.currentProduct || Number(state.currentProduct?.id) !== pid) return {};
          return {
            currentProduct: {
              ...state.currentProduct,
              images: result.images,
            },
          };
        });
      }

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ setCoverImageAction error:', error);
      throw error;
    }
  },

  deleteImage: async ({ productId, imageId, publicId, public_id, id }) => {
    try {
      const pid = productId != null ? Number(productId) : null;
      const imgIdRaw = imageId ?? id;
      const imgId = imgIdRaw != null && imgIdRaw !== '' ? Number(imgIdRaw) : null;
      const pub = (public_id ?? publicId ?? '').toString().trim();

      if (!pid || (!imgId && !pub)) throw new Error('Missing data');

      // ✅ รองรับทั้ง imageId (number) หรือ public_id (string)
      const payload = imgId ? { imageId: imgId } : { public_id: pub };
      return await deleteImageProduct(pid, payload);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ deleteImage error:', error);
      throw error;
    }
  },




  // -------- POS Search / List for POS --------

  // ✅ Normalize API responses (array-first) เพื่อให้ Store ไม่เดารูปแบบ response
  // รองรับทั้ง: array, { data: array }, { items: array }, { products: array }
  normalizePosProductList: (raw) => {
    const payload = raw?.data ?? raw;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.products)) return payload.products;

    // nested shapes (เผื่อบาง wrapper คืน data ซ้อน)
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    if (Array.isArray(payload?.data?.products)) return payload.data.products;

    return [];
  },

  // ✅ Standardize error object (แสดงใน UI ได้ง่าย)
  normalizeError: (err, fallbackMessage = 'เกิดข้อผิดพลาด') => {
    const code = err?.code || err?.error || err?.response?.data?.error || err?.data?.error;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      (typeof err === 'string' ? err : '') ||
      fallbackMessage;

    return { code, message, raw: err };
  },

  fetchProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // 🧪 Debug (restore-only): ดู filter ที่ถูกส่งเข้ามาจริง
      // eslint-disable-next-line no-console
      console.log('🧪 [productStore] fetchProductsAction input', filters);

      const raw = await getProductsForPos(filters);
      const list = get().normalizePosProductList(raw);

      // 🧪 Debug (restore-only): ดู shape เบื้องต้นของ response
      // eslint-disable-next-line no-console
      console.log('🧪 [productStore] fetchProductsAction responseKeys', {
        isArrayTop: Array.isArray(raw),
        isArrayPayload: Array.isArray(raw?.data ?? raw),
        listCount: Array.isArray(list) ? list.length : 0,
        topKeys: raw && typeof raw === 'object' ? Object.keys(raw).slice(0, 10) : typeof raw,
      });

      // ✅ Production-safety: กันข้อมูลซ้ำจาก BE (เช่น JOIN แล้วได้แถวซ้ำ)
      // - ยึด product.id เป็น key
      // - ถ้าเจอซ้ำ: เลือกตัวที่มี costPrice > 0 ก่อน (กันกรณี 0.00 มาทับ)
      const deduped = (() => {
        const map = new Map();
        for (const item of list) {
          const key = item?.id;
          if (!key) continue;

          const prev = map.get(key);
          if (!prev) {
            map.set(key, item);
            continue;
          }

          const prevCost = Number(prev?.costPrice ?? 0);
          const nextCost = Number(item?.costPrice ?? 0);

          // ถ้าตัวใหม่มีราคา > 0 และตัวเดิมราคาเป็น 0 ให้ replace
          if (
            (Number.isFinite(nextCost) && nextCost > 0) &&
            (!Number.isFinite(prevCost) || prevCost <= 0)
          ) {
            map.set(key, { ...prev, ...item });
          } else {
            // ไม่ replace แต่ merge field ที่ขาดหาย (กันบาง query คืน field ไม่ครบ)
            map.set(key, { ...item, ...prev });
          }
        }
        return Array.from(map.values());
      })();

      // eslint-disable-next-line no-console
      console.log(
        '🧪 [productStore] fetchProductsAction listCount',
        list.length,
        'dedupedCount',
        deduped.length
      );

      // ✅ สำคัญ: replace list เสมอ (ไม่ append) เพื่อกันข้อมูลค้าง/ซ้ำ
      set({ products: deduped, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchProductsAction error:', error);
      set({ error: get().normalizeError(error, 'โหลดสินค้าสำหรับ POS ไม่สำเร็จ'), isLoading: false });
    }
  },

  // ✅ Only SIMPLE products for Quick Receive (เก็บแยก state)
  fetchSimpleProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = { ...filters, mode: 'SIMPLE' }; // force SIMPLE
      const raw = await getProductsForPos(params);
      const list = get().normalizePosProductList(raw);
      set({ simpleProducts: list, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchSimpleProductsAction error:', error);
      set({ error: get().normalizeError(error, 'โหลดสินค้ากลุ่ม SIMPLE ไม่สำเร็จ'), isLoading: false });
    }
  },

  refreshProductList: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const raw = await getProductsForPos(filters);
      const products = get().normalizePosProductList(raw);
      set({ products, isLoading: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ refreshProductList error:', error);
      set({ error: get().normalizeError(error, 'รีเฟรชรายการสินค้าไม่สำเร็จ'), isLoading: false });
    }
  },
}));

export default useProductStore;
  





