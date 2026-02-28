








// ✅ src/features/product/store/productStore.js
import { create } from 'zustand';
import _ from 'lodash';

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
  // ✅ Brand (optional extension)
  brands: [],
  // ✅ ProductType ↔ Brand mapping (auto-learn)
  productTypeBrands: [],
};

const useProductStore = create((set, get) => ({
  // -------- Shared utils (local to store) --------
  normalizeName: (v) => (v ?? '').toString().trim(),
  // ✅ Brand options must come from Brand table only (id + name)
  // (Do NOT merge legacy free-text brandName to avoid null/duplicate keys)
  normalizeBrandOptions: (brands = []) => {
    const arr = Array.isArray(brands) ? brands : []
    const filtered = arr.filter((b) => b && b.id != null)
    const uniq = _.uniqBy(filtered, (b) => String(b.id))
    return _.sortBy(uniq, (b) => String(b?.name ?? ''))
  },

  // ---- Lists / Entities ----
  products: [],              // รายการทั่วไปที่ใช้หลายหน้า
  simpleProducts: [],        // รายการเฉพาะหน้า Quick Receive (SIMPLE)
  currentProduct: null,

  // ---- Dropdowns ----
  dropdowns: initialDropdowns,
  dropdownsLoaded: false,

  // ✅ Fast lookup map for ProductType ↔ Brand (built from dropdowns.productTypeBrands)
  // shape: { [productTypeId:number]: { [brandId:number]: true } }
  productTypeBrandMap: {},

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
      const cleanedPayload = { ...payload };      // ✅ Template/Profile เป็น optional helper — อย่าทำ mapping บังคับ

      // ✅ ไม่ส่ง branchId ไป BE (BE อ่านจาก req.user.branchId ตาม BRANCH_SCOPE_ENFORCED)
      delete cleanedPayload.branchId;      // ✅ เคลียร์ field ที่ไม่ควรส่ง
      if (cleanedPayload?.templateId === '' || cleanedPayload?.templateId == null) delete cleanedPayload.templateId
      if (cleanedPayload?.productProfileId === '' || cleanedPayload?.productProfileId == null) delete cleanedPayload.productProfileId
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

  // -------- Dropdowns (โหลดครั้งเดียว ใช้ทั้งระบบ) --------
  fetchDropdownsAction: async (force = false) => {
    // prevent unnecessary reload
    if (get().dropdownsLoaded && !force) return get().dropdowns;
    try {
      // call API
      const raw = await getCatalogDropdowns();

      // normalize various possible shapes from BE
      const pickArr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

      // ✅ Accept wrapper shapes: { items: [] } / { data: [] }
      const pickArrDeep = (...xs) => {
        for (const x of xs) {
          if (Array.isArray(x)) return x;
          if (x && Array.isArray(x.items)) return x.items;
          if (x && Array.isArray(x.data)) return x.data;
          if (x && x.data && Array.isArray(x.data.items)) return x.data.items;
          if (x && x.data && Array.isArray(x.data.data)) return x.data.data;
        }
        return [];
      };

      const categories = pickArr(
        raw?.categories,
        raw?.categoryList,
        raw?.category_list,
        raw?.data?.categories,
        raw?.list?.categories,
        raw?.categoriesList,
        raw?.items?.categories
      );

      const productTypes = pickArrDeep(
        raw?.productTypes,
        raw?.productTypeList,
        raw?.product_types,
        raw?.types,
        raw?.data?.productTypes,
        raw?.data?.productTypes?.items,
        raw?.data?.productTypes?.data,
        raw?.list?.productTypes,
        raw?.items?.productTypes,
        raw?.categoriesList // (some legacy APIs misname keys)
      );

            const profiles = pickArrDeep(
        raw?.profiles,
        raw?.productProfiles,
        raw?.profileList,
        raw?.data?.profiles,
        raw?.data?.profiles?.items,
        raw?.data?.profiles?.data
      );

            const brands = pickArrDeep(
        raw?.brands,
        raw?.brandList,
        raw?.brand_list,
        raw?.data?.brands,
        raw?.data?.brands?.items,
        raw?.data?.brands?.data,
        raw?.items?.brands
      );

      const normalizedBrands = get().normalizeBrandOptions(brands);

      // ✅ ProductType ↔ Brand mapping (auto-learn)
      const productTypeBrandsRaw = pickArrDeep(
        raw?.productTypeBrands, // normalized [{productTypeId:number, brandId:number}]
        raw?.product_type_brands,
        raw?.typeBrandMap,
        raw?.type_brand_map,
        raw?.data?.productTypeBrands,
        raw?.data?.productTypeBrands?.items,
        raw?.data?.productTypeBrands?.data,
        raw?.items?.productTypeBrands,
        raw?.data?.productTypeBrand,
        raw?.data?.productTypeBrand?.items
      );

      // ✅ normalize mapping rows (ensure numeric ids)
      const productTypeBrands = (Array.isArray(productTypeBrandsRaw) ? productTypeBrandsRaw : [])
        .map((row) => {
          const productTypeId = row?.productTypeId ?? row?.product_type_id ?? row?.typeId ?? row?.productType?.id;
          const brandId = row?.brandId ?? row?.brand_id ?? row?.brand?.id;
          const pt = productTypeId == null || productTypeId === '' ? null : Number(productTypeId);
          const br = brandId == null || brandId === '' ? null : Number(brandId);
          if (!Number.isFinite(pt) || !Number.isFinite(br)) return null;
          return { productTypeId: pt, brandId: br };
        })
        .filter(Boolean);

      // ✅ Build fast lookup map for FE filtering
      const productTypeBrandMap = productTypeBrands.reduce((acc, row) => {
        const pt = Number(row.productTypeId);
        const br = Number(row.brandId);
        if (!Number.isFinite(pt) || !Number.isFinite(br)) return acc;
        if (!acc[pt]) acc[pt] = {};
        acc[pt][br] = true;
        return acc;
      }, {});

      const templates = pickArrDeep(
        raw?.templates,
        raw?.productTemplates,
        raw?.templateList,
        raw?.data?.templates,
        raw?.data?.templates?.items,
        raw?.data?.templates?.data
      );

                  const dropdowns = {
        categories,
        productTypes,
        profiles,
        productProfiles: profiles,
        templates,
        productTemplates: templates,
        brands: normalizedBrands,
        productTypeBrands,
      };

      set({ dropdowns, productTypeBrandMap, dropdownsLoaded: true, error: null });
      return dropdowns;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ fetchDropdownsAction error:', error);

      // ✅ Fail-soft: อย่า throw เพื่อกัน Uncaught promise และกันหน้า crash
      // เก็บ error แบบ normalize เพื่อให้ UI แสดงได้
      const normalized = get().normalizeError(error, 'โหลดรายการตัวเลือกไม่สำเร็จ');
      set({ error: normalized, dropdownsLoaded: false });

      // คืนค่าที่มีอยู่ (อาจเป็น empty) เพื่อไม่ให้ caller พัง
      return get().dropdowns;
    }
  },

  ensureDropdownsAction: async () => {
    if (!get().dropdownsLoaded) {
      // ✅ Fail-soft: fetchDropdownsAction ถูกทำให้ไม่ throw แล้ว
      await get().fetchDropdownsAction(true);
    }
    return get().dropdowns;
  },

  resetDropdowns: () => set({ dropdowns: initialDropdowns, dropdownsLoaded: false, productTypeBrandMap: {} }),

  // ✅ Brand options filtered by selected productTypeId
  // - If productTypeId is empty => return all brands
  // - If type has no mapping yet => return all brands (fail-soft; mapping auto-learns)
  getBrandOptionsByProductTypeIdAction: (productTypeId) => {
    const ptId = productTypeId == null || productTypeId === '' ? null : Number(productTypeId);
    const st = get();
    const brands = Array.isArray(st?.dropdowns?.brands) ? st.dropdowns.brands : [];

    if (!Number.isFinite(ptId) || ptId == null) return brands;

    const map = st?.productTypeBrandMap || {};
    const allowed = map?.[ptId];

    // fail-soft: if no mapping for this type yet, show all brands
    if (!allowed) return brands;

    return brands.filter((b) => {
      const bid = b?.id == null || b?.id === '' ? null : Number(b.id);
      if (!Number.isFinite(bid) || bid == null) return false;
      return allowed[bid] === true;
    });
  },

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

      // ✅ Normalize params (PO/Stock search ต้องส่งเลขเป็น number และไม่ส่งค่าว่าง)
      const toNum = (v) => {
        if (v == null) return undefined;
        const s = String(v).trim();
        if (!s) return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      };

            const rawBrandId = filters?.brandId;
      const brandIdNum = toNum(rawBrandId);

      const params = {
        ...filters,
        categoryId: toNum(filters?.categoryId),
        productTypeId: toNum(filters?.productTypeId),

        // ✅ Brand filter
        // - numeric => brandId
        // - non-numeric string => brandName (รองรับ legacy product.brandName)
        brandId: brandIdNum ?? undefined,

        // normalize searchText
        searchText: (filters?.searchText ?? '').toString().trim() || undefined,
      };

      // ลบ key ที่เป็น undefined เพื่อไม่ให้ BE แปลผิด
      Object.keys(params).forEach((k) => {
        if (params[k] === undefined) delete params[k];
      });

      // eslint-disable-next-line no-console
      console.log('🧪 [productStore] fetchProductsAction params', params);

      const raw = await getProductsForPos(params);
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
  




