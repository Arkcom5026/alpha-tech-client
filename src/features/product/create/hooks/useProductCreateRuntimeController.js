// src/features/product/create/hooks/useProductCreateRuntimeController.js

import { useCallback, useEffect, useRef } from 'react';

import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  createLocalOperationalProductCreateApi,
  getExistingOperationalModels,
  getProductCreateBrands,
  getProductCreateDropdowns,
  uploadProductCreateImages,
} from '../api/productCreateApi';
import useProductCreateRuntimeStore from '../store/productCreateRuntimeStore';

const extractCreatedProduct = (response) => {
  if (!response) return null;
  if (response?.data && typeof response.data === 'object') return response.data;
  if (response?.product && typeof response.product === 'object') return response.product;
  if (response?.item && typeof response.item === 'object') return response.item;
  if (response?.id) return response;
  return null;
};

const normalizeDropdownPayload = (raw = {}) => {
  const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;

  return {
    categories: Array.isArray(payload?.categories) ? payload.categories : [],
    productTypes: Array.isArray(payload?.productTypes)
      ? payload.productTypes
      : Array.isArray(payload?.productTypeList)
        ? payload.productTypeList
        : [],
    brands: Array.isArray(payload?.brands)
      ? payload.brands
      : Array.isArray(payload?.brandList)
        ? payload.brandList
        : [],
    units: Array.isArray(payload?.units)
      ? payload.units
      : Array.isArray(payload?.unitList)
        ? payload.unitList
        : [],
  };
};

const normalizeBrandsPayload = (raw = {}) => {
  const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.brands)) return payload.brands;
  if (Array.isArray(payload?.brandList)) return payload.brandList;
  return [];
};

const normalizeExistingModelsPayload = (raw = {}) => {
  const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const validateForm = (values = {}) => {
  const errors = {};

  if (!String(values.name || '').trim()) errors.name = 'กรุณากรอกชื่อสินค้า';
  if (!toNumberOrNull(values.productTypeId)) errors.productTypeId = 'กรุณาเลือกประเภทสินค้า';
  if (!toNumberOrNull(values.brandId)) errors.brandId = 'กรุณาเลือกแบรนด์';
  if (!toNumberOrNull(values.unitId)) errors.unitId = 'กรุณาเลือกหน่วยนับ';

  const priceRetail = toNumberOrNull(values.branchPrice?.priceRetail);
  if (priceRetail == null || priceRetail < 0) {
    errors.branchPrice = {
      ...(errors.branchPrice || {}),
      priceRetail: 'กรุณากรอกราคาขายปลีก',
    };
  }

  return errors;
};

const buildPayload = (values = {}, branchId) => ({
  name: String(values.name || '').trim(),
  description: String(values.description || '').trim() || undefined,
  spec: String(values.spec || '').trim() || undefined,

  productTypeId: toNumberOrNull(values.productTypeId),
  brandId: toNumberOrNull(values.brandId),
  unitId: toNumberOrNull(values.unitId),

  mode: values.mode || 'STRUCTURED',
  noSN: Boolean(values.noSN),
  trackSerialNumber: values.mode === 'SIMPLE' ? false : values.trackSerialNumber !== false,
  active: values.active !== false,
  branchId,

  branchPrice: {
    costPrice: toNumberOrNull(values.branchPrice?.costPrice),
    priceRetail: toNumberOrNull(values.branchPrice?.priceRetail),
    priceTechnician: toNumberOrNull(values.branchPrice?.priceTechnician),
    priceOnline: toNumberOrNull(values.branchPrice?.priceOnline),
    priceWholesale: toNumberOrNull(values.branchPrice?.priceWholesale),
  },
});

const useProductCreateRuntimeController = () => {
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const runtime = useProductCreateRuntimeStore();
  const resetRuntime = useProductCreateRuntimeStore((state) => state.resetRuntime);
  const imageRef = useRef();

  const loadDropdowns = useCallback(async () => {
    if (!branchId) return null;

    runtime.setDropdownsLoading(true);

    try {
      const raw = await getProductCreateDropdowns();
      const dropdowns = normalizeDropdownPayload(raw);
      runtime.setDropdowns(dropdowns);
      return dropdowns;
    } catch (err) {
      runtime.setDropdownsLoading(false);
      runtime.finishCreateError(
        err?.response?.data?.message ||
          err?.message ||
          'โหลดรายการตัวเลือกสำหรับเพิ่มสินค้าไม่สำเร็จ'
      );
      return null;
    }
  }, [branchId, runtime]);

  const loadBrands = useCallback(async () => {
    const productTypeId = runtime.formValues.productTypeId;
    if (!productTypeId) {
      runtime.setBrands([]);
      return [];
    }

    runtime.setBrandsLoading(true);

    try {
      const raw = await getProductCreateBrands({ productTypeId });
      const brands = normalizeBrandsPayload(raw);
      runtime.setBrands(brands);
      return brands;
    } catch (err) {
      runtime.setBrandsLoading(false);
      runtime.finishCreateError(
        err?.response?.data?.message ||
          err?.message ||
          'โหลดแบรนด์ตามประเภทสินค้าไม่สำเร็จ'
      );
      return [];
    }
  }, [runtime]);

  const loadExistingModels = useCallback(async () => {
    if (!branchId || !runtime.formValues.productTypeId) {
      runtime.setExistingModels([]);
      return [];
    }

    runtime.setExistingModelsLoading(true);

    try {
      const raw = await getExistingOperationalModels({
        targetBranchId: branchId,
        productTypeId: runtime.formValues.productTypeId,
        brandId: runtime.formValues.brandId,
        search: runtime.formValues.name,
      });
      const items = normalizeExistingModelsPayload(raw);
      runtime.setExistingModels(items);
      return items;
    } catch (_) {
      runtime.setExistingModels([]);
      return [];
    }
  }, [branchId, runtime]);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  useEffect(() => {
    loadBrands();
  }, [runtime.formValues.productTypeId]);

  useEffect(() => {
    loadExistingModels();
  }, [runtime.formValues.productTypeId, runtime.formValues.brandId]);

  useEffect(() => {
    return () => {
      resetRuntime();
    };
  }, [resetRuntime]);

  const handleFieldChange = (field, value) => {
    runtime.unlockAfterChange();
    runtime.setFormValue(field, value);
  };

  const handleSelectExistingModel = (item) => {
    if (!item) return;
    runtime.setFormValue('name', item.name || '');
    if (item.unitId) runtime.setFormValue('unitId', String(item.unitId));
  };

  const handleCreate = async (event) => {
    event?.preventDefault?.();

    const errors = validateForm(runtime.formValues);
    runtime.setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      runtime.finishCreateError('กรุณาตรวจสอบข้อมูลที่จำเป็นก่อนบันทึก');
      return;
    }

    runtime.beginCreate();

    try {
      const payload = buildPayload(runtime.formValues, branchId);
      const response = await createLocalOperationalProductCreateApi(payload);
      const created = extractCreatedProduct(response);

      if (!created?.id) {
        throw new Error('สร้างสินค้าแล้วแต่ไม่พบ productId สำหรับอัปโหลดรูปภาพ');
      }

      if (runtime.selectedFiles.length) {
        await uploadProductCreateImages(created.id, {
          files: runtime.selectedFiles,
          captions: runtime.captions,
          coverIndex: runtime.coverIndex,
        });
      }

      runtime.finishCreateSuccess(created);
    } catch (err) {
      runtime.finishCreateError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    }
  };

  const handleStartNextCreate = () => {
    runtime.resetForNextCreate();

    if (imageRef.current && typeof imageRef.current.reset === 'function') {
      try {
        imageRef.current.reset();
      } catch (_) {}
    }

    loadDropdowns();
  };

  return {
    branchId,
    dropdownsLoaded: runtime.dropdownsLoaded,
    storeError: runtime.errorMessage ? { message: runtime.errorMessage } : null,
    imageRef,
    runtime,
    handleFieldChange,
    handleCreate,
    handleStartNextCreate,
    retryLoadDropdowns: loadDropdowns,
    refreshBrands: loadBrands,
    refreshExistingModels: loadExistingModels,
    selectExistingModel: handleSelectExistingModel,
  };
};

export default useProductCreateRuntimeController;
