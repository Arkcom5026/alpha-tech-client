// src/features/product/store/productStore.js
// 🏛️ Clean Architecture Edition - Dynamic Multi-Tier Filtering

import { create } from 'zustand';
import _ from 'lodash';

import {
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  getProductById,
  getProducts,
  getProductsForPos,
  getTemplateProductsForPos,
  getCatalogDropdowns,
  disableProduct,
  enableProduct,
  getReadyToSell,
  getReadyToSellStructuredDetails,
  enrollQuickStock, 
  quickStockInAllInOneApi, // 🟢 IMPORT: ตัวเชื่อมพอร์ต All-in-One ชุดใหม่
  quickReceiveExistingProductApi,
  createOperationalProductFromTemplateApi,
  createLocalOperationalProductApi,
} from '../api/productApi';

import {
  uploadImagesProduct,
  uploadImagesProductFull,
  setProductCoverImage,
  deleteImageProduct,
} from '../api/productImagesApi';

const initialDropdowns = {
  categories: [],
  productTypes: [],
  brands: [],
  units: [],
  productTypeBrands: [],
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeProductTypeBrandRows = (input = []) => {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .map((row) => {
      const productTypeId =
        row?.productTypeId ??
        row?.product_type_id ??
        row?.typeId ??
        row?.type_id ??
        row?.productType?.id ??
        row?.product_type?.id;

      const brandId =
        row?.brandId ??
        row?.brand_id ??
        row?.brand?.id;

      const pt = toFiniteNumber(productTypeId);
      const br = toFiniteNumber(brandId);
      if (pt == null || br == null) return null;
      return { productTypeId: pt, brandId: br };
    })
    .filter(Boolean);
};

const normalizeProductTypeBrandMapFromObject = (input = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return [];
  const rows = [];
  Object.entries(input).forEach(([rawProductTypeId, rawBrandMap]) => {
    const productTypeId = toFiniteNumber(rawProductTypeId);
    if (productTypeId == null) return;

    if (Array.isArray(rawBrandMap)) {
      rawBrandMap.forEach((rawBrandId) => {
        const brandId = toFiniteNumber(rawBrandId?.brandId ?? rawBrandId?.brand_id ?? rawBrandId?.id ?? rawBrandId);
        if (brandId != null) rows.push({ productTypeId, brandId });
      });
      return;
    }

    if (rawBrandMap && typeof rawBrandMap === 'object') {
      Object.entries(rawBrandMap).forEach(([rawBrandId, enabled]) => {
        if (enabled !== true) return;
        const brandId = toFiniteNumber(rawBrandId);
        if (brandId != null) rows.push({ productTypeId, brandId });
      });
    }
  });
  return rows;
};

const normalizeProductTypeRows = (input = []) => {
  const rows = Array.isArray(input) ? input : [];
  return rows
    .map((row) => {
      const id = toFiniteNumber(row?.id ?? row?.productTypeId ?? row?.typeId ?? row?.product_type_id);
      const name = String(row?.name ?? row?.title ?? row?.label ?? row?.productTypeName ?? row?.typeName ?? '').trim();
      if (id == null || !name) return null;
      return { ...row, id, name };
    })
    .filter(Boolean);
};

const normalizeProductTypeBrandRowsFromTypes = (productTypes = []) => {
  const types = Array.isArray(productTypes) ? productTypes : [];
  const rows = [];
  types.forEach((type) => {
    const productTypeId = toFiniteNumber(type?.id ?? type?.productTypeId ?? type?.typeId);
    if (productTypeId == null) return;

    const nestedBrands =
      (Array.isArray(type?.brands) && type.brands) ||
      (Array.isArray(type?.brandOptions) && type.brandOptions) ||
      (Array.isArray(type?.allowedBrands) && type.allowedBrands) ||
      (Array.isArray(type?.typeBrands) && type.typeBrands) ||
      [];

    nestedBrands.forEach((brand) => {
      const brandId = toFiniteNumber(
        brand?.id ??
        brand?.brandId ??
        brand?.brand_id ??
        brand?.brand?.id ??
        brand
      );
      if (brandId != null) rows.push({ productTypeId, brandId });
    });
  });
  return rows;
};

const buildProductTypeBrandMap = (rows = []) => {
  const list = Array.isArray(rows) ? rows : [];
  return list.reduce((acc, row) => {
    const pt = toFiniteNumber(row?.productTypeId);
    const br = toFiniteNumber(row?.brandId);
    if (pt == null || br == null) return acc;
    if (!acc[pt]) acc[pt] = {};
    acc[pt][br] = true;
    return acc;
  }, {});
};

const useProductStore = create((set, get) => ({
  normalizeName: (v) => (v ?? '').toString().trim(),
  normalizeBrandOptions: (brands = []) => {
    const arr = Array.isArray(brands) ? brands : [];
    const filtered = arr.filter((b) => b && b.id != null);
    const uniq = _.uniqBy(filtered, (b) => String(b.id));
    return _.sortBy(uniq, (b) => String(b?.name ?? ''));
  },

  hasUsableDropdowns: () => {
    const dropdowns = get().dropdowns || {};
    return {
      productTypes: Array.isArray(dropdowns.productTypes) && dropdowns.productTypes.length > 0,
      brands: Array.isArray(dropdowns.brands) && dropdowns.brands.length > 0,
      units: Array.isArray(dropdowns.units) && dropdowns.units.length > 0,
    };
  },

  products: [],              
  simpleProducts: [],        
  currentProduct: null,

  dropdowns: initialDropdowns,
  dropdownsLoaded: false,
  dropdownsLoading: false,

  productTypeBrandMap: {},
  productTypeBrandMeta: { rows: 0, types: 0 },

  searchResults: [],
  isLoading: false,
  error: null,

  readyToSellData: { items: [], page: 1, pageSize: 50, total: 0 },
  readyToSellLoading: false,
  readyToSellError: null,
  
  readyToSellStructuredDetails: { items: [], total: 0, productId: null },
  readyToSellStructuredDetailsLoading: false,
  readyToSellStructuredDetailsError: null,

  // ==================================================
  // 🟢 QUICK STOCK INDEPENDENT STATE & ACTIONS
  // ==================================================
  quickStockLoading: false,
  quickStockError: null,
  quickStockResult: null, 

  enrollQuickStockAction: async ({ barcode, productId }) => {
    set({ quickStockLoading: true, quickStockError: null });
    try {
      if (!productId) {
        throw Object.assign(new Error('กรุณาเลือกสินค้าแม่ (Product Template) ก่อนทำรายการ'), { code: 'PRODUCT_ID_MISSING' });
      }
      if (!barcode || !barcode.trim()) {
        throw Object.assign(new Error('ข้อมูลบาร์โค้ดไม่ถูกต้อง'), { code: 'BARCODE_INVALID' });
      }

      const response = await enrollQuickStock({
        barcode: barcode.trim(),
        productId: Number(productId)
      });

      if (response?.success) {
        set({
          quickStockResult: response.data,
          quickStockLoading: false,
          quickStockError: null
        });
        return response.data;
      }

      throw new Error(response?.message || 'เกิดความล้มเหลวในการบันทึกข้อมูลควิกสต๊อก');
    } catch (error) {
      console.error('❌ enrollQuickStockAction error:', error);
      const mappedError = get().normalizeError(error, 'นำเข้าสต๊อกด่วนล้มเหลว');
      set({ quickStockLoading: false, quickStockError: mappedError });
      throw error;
    }
  },

  // 🟢 [เพิ่มใหม่] คุมสถานะและการส่งผ่านชุดฟอร์มสินค้าด่วน All-In-One รายสาขาเข้าสู่คลัง
  quickStockInAllInOneAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });
    try {
      const response = await quickStockInAllInOneApi(payload);
      set({ quickStockLoading: false, quickStockError: null });
      return response;
    } catch (error) {
      console.error('❌ quickStockInAllInOneAction error:', error);
      const mappedError = get().normalizeError(error, 'ดำเนินการระบบควิกสต๊อกออลอินวันล้มเหลว');
      set({ quickStockLoading: false, quickStockError: mappedError });
      throw error;
    }
  },

  createOperationalProductFromTemplateAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });
    try {
      const response = await createOperationalProductFromTemplateApi(payload);
      set({
        quickStockLoading: false,
        quickStockError: null,
        quickStockResult: response?.data ?? response,
      });
      return response;
    } catch (error) {
      console.error('❌ createOperationalProductFromTemplateAction error:', error);
      const mappedError = get().normalizeError(error, 'สร้าง Operational Product จาก Template ไม่สำเร็จ');
      set({ quickStockLoading: false, quickStockError: mappedError });
      throw error;
    }
  },


  createLocalOperationalProductAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });
    try {
      const response = await createLocalOperationalProductApi(payload);
      set({
        quickStockLoading: false,
        quickStockError: null,
        quickStockResult: response?.data ?? response,
      });
      return response;
    } catch (error) {
      console.error('❌ createLocalOperationalProductAction error:', error);
      const mappedError = get().normalizeError(error, 'สร้าง Operational Product ใหม่ไม่สำเร็จ');
      set({ quickStockLoading: false, quickStockError: mappedError });
      throw error;
    }
  },



  // 🟢 รับสินค้าเข้าจาก Product เดิม: Recovery / Quick Receive / Manufacture
  quickReceiveExistingProductAction: async (payload) => {
    set({ quickStockLoading: true, quickStockError: null });
    try {
      const response = await quickReceiveExistingProductApi(payload);
      set({
        quickStockLoading: false,
        quickStockError: null,
        quickStockResult: response?.data ?? response,
      });
      return response;
    } catch (error) {
      console.error('❌ quickReceiveExistingProductAction error:', error);
      const mappedError = get().normalizeError(error, 'รับสินค้าเข้าจาก Product เดิมล้มเหลว');
      set({ quickStockLoading: false, quickStockError: mappedError });
      throw error;
    }
  },

  // Alias ให้ QuickStockPage เวอร์ชันปัจจุบันเรียกได้ทันที
  quickStockIntakeExistingAction: async (payload) => {
    return get().quickReceiveExistingProductAction(payload);
  },

  resetQuickStockStateAction: () => {
    set({
      quickStockLoading: false,
      quickStockError: null,
      quickStockResult: null
    });
  },

  // ==================================================
  // CORE FUNCTIONS (ระบบเดิมทั้งหมด)
  // ==================================================
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const isTemplateSearch = filters?.template === true || String(filters?.template).toLowerCase() === 'true';
      const data = isTemplateSearch
        ? await getTemplateProductsForPos(filters)
        : await getProducts(filters);

      set({ products: get().normalizePosProductList(data), isLoading: false });
    } catch (error) {
      console.error('❌ fetchProducts error:', error);
      set({ error: get().normalizeError(error, 'โหลดสินค้าภาพรวมไม่สำเร็จ'), isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProductById(id);
      set({ currentProduct: data, isLoading: false });
      return data;
    } catch (error) {
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
      console.error('❌ getProductById error:', error);
      throw error;
    }
  },

  saveProduct: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };
      delete cleanedPayload.branchId;
      delete cleanedPayload.categoryId;
      delete cleanedPayload.productProfileId;
      delete cleanedPayload.productTemplateId;
      delete cleanedPayload.templateId;
      delete cleanedPayload.templateProductId;
      delete cleanedPayload.category;
      delete cleanedPayload.productType;
      delete cleanedPayload.brand;
      delete cleanedPayload.unit;
      delete cleanedPayload.templateProduct;

      const data = await createProduct(cleanedPayload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      console.error('❌ [Store] saveProduct ล้มเหลว:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleanedPayload = { ...payload };
      delete cleanedPayload.branchId;
      delete cleanedPayload.categoryId;
      delete cleanedPayload.productProfileId;
      delete cleanedPayload.productTemplateId;
      delete cleanedPayload.templateId;
      delete cleanedPayload.templateProductId;
      delete cleanedPayload.category;
      delete cleanedPayload.productType;
      delete cleanedPayload.brand;
      delete cleanedPayload.unit;
      delete cleanedPayload.templateProduct;

      try {
        const data = await updateProduct(id, cleanedPayload);
        set({ isLoading: false });
        return data;
      } catch (err) {
        const code = err?.code || err?.error || err?.data?.error || err?.response?.data?.error;
        const switchingToSimple = cleanedPayload?.noSN === true;
        if (switchingToSimple && code === 'MODE_SWITCH_REQUIRES_CONVERSION') {
          if (typeof get().migrateSnToSimpleAction !== 'function') {
            throw Object.assign(new Error('ยังไม่พบ action สำหรับแปลง SN → SIMPLE'), {
              code: 'MIGRATE_ACTION_MISSING',
            });
          }
          await get().migrateSnToSimpleAction(id);
          const data = await updateProduct(id, cleanedPayload);
          set({ isLoading: false });
          return data;
        }
        throw err;
      }
    } catch (error) {
      console.error('❌ updateProduct error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  migrateSnToSimpleAction: async () => {
    throw Object.assign(new Error('โฟลว์แปลง SN → SIMPLE ยังไม่ถูก implement ในเวอร์ชันนี้'), {
      code: 'MIGRATE_SN_TO_SIMPLE_NOT_IMPLEMENTED',
    });
  },

  deleteProduct: async (id) => {
    await deleteProductApi(id);
    return true;
  },

  deleteProductAction: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await get().deleteProduct(id);
      set((state) => ({
        products: Array.isArray(state.products)
          ? state.products.filter((p) => Number(p?.id) !== Number(id))
          : state.products,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'ลบสินค้าไม่สำเร็จ';
      set({ error: get().normalizeError(error, message), isLoading: false });
      return false;
    }
  },

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
      console.error('❌ enableProductAction error:', error);
      set({ error, isLoading: false });
      throw error;
    }
  },

  fetchDropdownsAction: async (force = false) => {
    if (get().dropdownsLoaded && !force) return get().dropdowns;
    set({ dropdownsLoading: true, error: null });

    try {
      const raw = await getCatalogDropdowns();
      const pickArr = (...xs) => xs.find((x) => Array.isArray(x)) || [];
      const pickArrDeep = (...xs) => {
        for (const x of xs) {
          if (Array.isArray(x)) return x;
          if (x && Array.isArray(x.items)) return x.items;
          if (x && Array.isArray(x.rows)) return x.rows;
          if (x && Array.isArray(x.records)) return x.records;
          if (x && Array.isArray(x.data)) return x.data;
          if (x && x.data && Array.isArray(x.data.items)) return x.data.items;
          if (x && x.data && Array.isArray(x.data.rows)) return x.data.rows;
          if (x && x.data && Array.isArray(x.data.records)) return x.data.records;
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

      const productTypes = _.sortBy(
        _.uniqBy(
          normalizeProductTypeRows([
            ...pickArrDeep(raw?.productTypes),
            ...pickArrDeep(raw?.productTypeList),
            ...pickArrDeep(raw?.product_type_list),
            ...pickArrDeep(raw?.product_types),
            ...pickArrDeep(raw?.ProductType),
            ...pickArrDeep(raw?.productType),
            ...pickArrDeep(raw?.types),
            ...pickArrDeep(raw?.typeList),
            ...pickArrDeep(raw?.data?.productTypes),
            ...pickArrDeep(raw?.data?.productTypeList),
            ...pickArrDeep(raw?.data?.product_type_list),
            ...pickArrDeep(raw?.data?.product_types),
            ...pickArrDeep(raw?.data?.ProductType),
            ...pickArrDeep(raw?.data?.productType),
            ...pickArrDeep(raw?.list?.productTypes),
            ...pickArrDeep(raw?.items?.productTypes),
          ]),
          (item) => String(item.id)
        ),
        (item) => String(item?.name ?? '')
      );

      const brands = pickArrDeep(
        raw?.brands,
        raw?.brandList,
        raw?.brand_list,
        raw?.data?.brands,
        raw?.items?.brands
      );

      const normalizedBrands = get().normalizeBrandOptions(brands);

      const productTypeBrandsRaw = pickArrDeep(
        raw?.productTypeBrands,
        raw?.product_type_brands,
        raw?.data?.productTypeBrands,
        raw?.items?.productTypeBrands
      );

      const productTypeBrandMapRaw =
        raw?.productTypeBrandMap ??
        raw?.product_type_brand_map ??
        raw?.typeBrandMap ??
        raw?.data?.productTypeBrandMap ??
        null;

      const productTypeBrands = _.uniqBy(
        [
          ...normalizeProductTypeBrandRows(productTypeBrandsRaw),
          ...normalizeProductTypeBrandMapFromObject(productTypeBrandMapRaw),
          ...normalizeProductTypeBrandRowsFromTypes(productTypes),
        ],
        (row) => `${row.productTypeId}:${row.brandId}`
      );

      const productTypeBrandMap = buildProductTypeBrandMap(productTypeBrands);

      const units = pickArrDeep(
        raw?.units,
        raw?.unitList,
        raw?.productUnits,
        raw?.data?.units
      );

      const dropdowns = {
        categories,
        productTypes,
        units,
        brands: normalizedBrands,
        productTypeBrands,
      };

      set({
        dropdowns,
        productTypeBrandMap,
        productTypeBrandMeta: {
          rows: productTypeBrands.length,
          types: Object.keys(productTypeBrandMap).length,
        },
        dropdownsLoaded: true,
        dropdownsLoading: false,
        error: null,
      });
      return dropdowns;
    } catch (error) {
      console.error('❌ fetchDropdownsAction error:', error);
      const normalized = get().normalizeError(error, 'โหลดรายการตัวเลือกไม่สำเร็จ');
      set({
        error: normalized,
        dropdownsLoaded: false,
        dropdownsLoading: false,
      });
      return get().dropdowns;
    }
  },

  ensureDropdownsAction: async ({ force = false } = {}) => {
    const usable = get().hasUsableDropdowns();

    // A previous dropdown request may have completed with an empty ProductType list.
    // In that state dropdownsLoaded can be true, but the Create Product page still
    // has no usable "ประเภทสินค้า" options. Treat that state as stale and reload.
    if (force || !get().dropdownsLoaded || !usable.productTypes) {
      await get().fetchDropdownsAction(true);
    }

    return get().dropdowns;
  },

  resetDropdowns: () => set({
    dropdowns: initialDropdowns,
    dropdownsLoaded: false,
    dropdownsLoading: false,
    productTypeBrandMap: {},
    productTypeBrandMeta: { rows: 0, types: 0 },
  }),

  getBrandOptionsByProductTypeIdAction: (productTypeId) => {
    const ptId = toFiniteNumber(productTypeId);
    const st = get();
    const brands = Array.isArray(st?.dropdowns?.brands) ? st.dropdowns.brands : [];

    if (ptId == null) return brands;

    const computedMap =
      st?.productTypeBrandMap && Object.keys(st.productTypeBrandMap).length > 0
        ? st.productTypeBrandMap
        : buildProductTypeBrandMap(st?.dropdowns?.productTypeBrands || []);

    const allowed = computedMap?.[ptId];
    if (!allowed || typeof allowed !== 'object') return brands;

    const filtered = brands.filter((b) => {
      const bid = toFiniteNumber(b?.id);
      if (bid == null) return false;
      return allowed[bid] === true;
    });
    return filtered;
  },

  hasBrandMappingByProductTypeIdAction: (productTypeId) => {
    const ptId = toFiniteNumber(productTypeId);
    if (ptId == null) return false;
    const st = get();
    const computedMap =
      st?.productTypeBrandMap && Object.keys(st.productTypeBrandMap).length > 0
        ? st.productTypeBrandMap
        : buildProductTypeBrandMap(st?.dropdowns?.productTypeBrands || []);
    const allowed = computedMap?.[ptId];
    return !!(allowed && typeof allowed === 'object' && Object.keys(allowed).length > 0);
  },

  getSafeBrandOptionsByProductTypeIdAction: (productTypeId) => {
    const st = get();
    const allBrands = Array.isArray(st?.dropdowns?.brands) ? st.dropdowns.brands : [];
    const filtered = st.getBrandOptionsByProductTypeIdAction(productTypeId);
    if (Array.isArray(filtered) && filtered.length > 0) return filtered;
    return allBrands;
  },

  uploadImages: async (files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProduct(files, captions, coverIndex);
      return uploaded;
    } catch (error) {
      console.error('❌ [Store] uploadImages ล้มเหลว:', error);
      throw error;
    }
  },

  uploadImagesFull: async (productId, files, captions, coverIndex) => {
    try {
      const uploaded = await uploadImagesProductFull(productId, files, captions, coverIndex);
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
      console.error('❌ uploadImagesFull error:', error);
      throw error;
    }
  },

  setCoverImageAction: async ({ productId, imageId }) => {
    try {
      const pid = productId != null ? Number(productId) : null;
      const imgId = imageId != null && imageId !== '' ? Number(imageId) : null;
      if (!pid || !imgId) throw new Error('Missing data');

      const result = await setProductCoverImage(pid, imgId);
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

      const payload = imgId ? { imageId: imgId } : { public_id: pub };
      return await deleteImageProduct(pid, payload);
    } catch (error) {
      console.error('❌ deleteImage error:', error);
      throw error;
    }
  },

  normalizePosProductList: (raw) => {
    const payload = raw?.data ?? raw;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.products)) return payload.products;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  },

  normalizeError: (err, fallbackMessage = 'เกิดข้อผิดพลาด') => {
    const code = err?.code || err?.error || err?.data?.error || err?.response?.data?.error;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      (typeof err === 'string' ? err : '') ||
      fallbackMessage;
    return { code, message, raw: err };
  },

  normalizeReadyToSellResponse: (raw) => {
    const payload = raw?.data ?? raw;
    const items = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];

    const page = Number(payload?.page ?? 1);
    const pageSize = Number(payload?.pageSize ?? 50);
    const total = Number(payload?.total ?? items.length);

    return {
      items,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
      total: Number.isFinite(total) ? total : items.length,
    };
  },

  fetchReadyToSellAction: async ({
    q = '',
    mode = 'ALL',
    page = 1,
    pageSize = 50,
    sort = 'receivedAt_desc',
  } = {}) => {
    set({ readyToSellLoading: true, readyToSellError: null });
    try {
      const data = await getReadyToSell({
        q: (q ?? '').toString().trim(),
        mode,
        page,
        pageSize,
        sort,
      });
      const normalized = get().normalizeReadyToSellResponse(data);
      set({ readyToSellData: normalized, readyToSellLoading: false, readyToSellError: null });
      return normalized;
    } catch (error) {
      const mapped = get().normalizeError(error, 'โหลดรายการสินค้าพร้อมขายไม่สำเร็จ');
      set({ readyToSellLoading: false, readyToSellError: mapped });
      return null;
    }
  },

  fetchReadyToSellStructuredDetailsAction: async ({ productId, q = '' } = {}) => {
    set({ readyToSellStructuredDetailsLoading: true, readyToSellStructuredDetailsError: null });
    try {
      if (!productId) throw Object.assign(new Error('ไม่พบ productId'), { code: 'PRODUCT_ID_MISSING' });

      const data = await getReadyToSellStructuredDetails({ productId, q });
      const payload = data?.data ?? data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const total = Number(payload?.total ?? items.length);

      const normalized = {
        items,
        total: Number.isFinite(total) ? total : items.length,
        productId: Number(productId),
      };
      set({ readyToSellStructuredDetails: normalized, readyToSellStructuredDetailsLoading: false, readyToSellStructuredDetailsError: null });
      return normalized;
    } catch (error) {
      const mapped = get().normalizeError(error, 'โหลดรายละเอียดสินค้าแบบ SN ไม่สำเร็จ');
      set({ readyToSellStructuredDetailsLoading: false, readyToSellStructuredDetailsError: mapped });
      return null;
    }
  },

  resetReadyToSellAction: () => {
    set({
      readyToSellData: { items: [], page: 1, pageSize: 50, total: 0 },
      readyToSellLoading: false,
      readyToSellError: null,
    });
  },
  
  resetReadyToSellStructuredDetailsAction: () => {
    set({
      readyToSellStructuredDetails: { items: [], total: 0, productId: null },
      readyToSellStructuredDetailsLoading: false,
      readyToSellStructuredDetailsError: null,
    });
  },


  // ==================================================
  // PRODUCT CATALOG ACTIONS — EXPLICIT RUNTIME SPLIT
  // ==================================================
  // Operational Product = สินค้าที่ถูกใช้งานจริงใน Branch ปัจจุบัน
  // ใช้กับ Stock / Sales / Repair / Service / Product List
  fetchOperationalProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const toNum = (v) => {
        if (v == null) return undefined;
        const s = String(v).trim();
        if (!s) return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      };

      const params = {
        ...filters,
        productTypeId: toNum(filters?.productTypeId),
        brandId: toNum(filters?.brandId),
        searchText: (filters?.searchText ?? filters?.search ?? '').toString().trim() || undefined,
      };

      delete params.categoryId;
      delete params.template;

      Object.keys(params).forEach((k) => {
        if (params[k] === undefined) delete params[k];
      });

      const raw = await getProductsForPos(params);
      const list = get().normalizePosProductList(raw);

      set({ products: list, isLoading: false, error: null });
      return list;
    } catch (error) {
      console.error('❌ fetchOperationalProductsAction error:', error);
      set({ error: get().normalizeError(error, 'โหลด Operational Products ไม่สำเร็จ'), isLoading: false });
      return [];
    }
  },

  // Template Product = สินค้าต้นแบบจาก T01
  // ใช้กับ QuickStock / PO Runtime / Recovery / Clone Flow เท่านั้น
  fetchTemplateProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const toNum = (v) => {
        if (v == null) return undefined;
        const s = String(v).trim();
        if (!s) return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      };

      const params = {
        ...filters,
        productTypeId: toNum(filters?.productTypeId),
        brandId: toNum(filters?.brandId),
        search: (filters?.search ?? filters?.searchText ?? '').toString().trim() || undefined,
      };

      delete params.categoryId;

      Object.keys(params).forEach((k) => {
        if (params[k] === undefined) delete params[k];
      });

      const raw = await getTemplateProductsForPos(params);
      const list = get().normalizePosProductList(raw);

      set({ products: list, isLoading: false, error: null });
      return list;
    } catch (error) {
      console.error('❌ fetchTemplateProductsAction error:', error);
      set({ error: get().normalizeError(error, 'โหลด Template Products ไม่สำเร็จ'), isLoading: false });
      return [];
    }
  },

  fetchProductsAction: async (filters = {}) => {
    // Deprecated compatibility layer:
    // - template=true  -> Template Runtime Search
    // - otherwise      -> Operational Branch Search
    const isTemplateSearch =
      filters?.template === true || String(filters?.template).toLowerCase() === 'true';

    if (isTemplateSearch) {
      return get().fetchTemplateProductsAction(filters);
    }

    return get().fetchOperationalProductsAction(filters);
  },

  fetchSimpleProductsAction: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = { ...filters, mode: 'SIMPLE' }; 
      delete params.categoryId;
      const raw = await getProductsForPos(params);
      const list = get().normalizePosProductList(raw);
      set({ simpleProducts: list, isLoading: false });
    } catch (error) {
      console.error('❌ fetchSimpleProductsAction error:', error);
      set({ error: get().normalizeError(error, 'โหลดสินค้ากลุ่ม SIMPLE ไม่สำเร็จ'), isLoading: false });
    }
  },

  refreshProductList: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = { ...filters };
      delete params.categoryId;
      const raw = await getProductsForPos(params);
      const products = get().normalizePosProductList(raw);
      set({ products, isLoading: false });
    } catch (error) {
      console.error('❌ refreshProductList error:', error);
      set({ error: get().normalizeError(error, 'รีเฟรชรายการสินค้าไม่สำเร็จ'), isLoading: false });
    }
  },
}));

export default useProductStore;
