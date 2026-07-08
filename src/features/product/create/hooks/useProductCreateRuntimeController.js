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

const normalizeDropdownPayload = (raw = {}, branchId) => {
  const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;

  return {
    categories: keepOperationalItemsForBranch(
      Array.isArray(payload?.categories) ? payload.categories : [],
      branchId
    ),
    productTypes: keepOperationalItemsForBranch(
      Array.isArray(payload?.productTypes)
        ? payload.productTypes
        : Array.isArray(payload?.productTypeList)
          ? payload.productTypeList
          : [],
      branchId
    ),
    brands: keepOperationalItemsForBranch(
      Array.isArray(payload?.brands)
        ? payload.brands
        : Array.isArray(payload?.brandList)
          ? payload.brandList
          : [],
      branchId
    ),
    units: Array.isArray(payload?.units)
      ? payload.units
      : Array.isArray(payload?.unitList)
        ? payload.unitList
        : [],
  };
};

const normalizeBrandsPayload = (raw = {}, branchId) => {
  const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.brands)
        ? payload.brands
        : Array.isArray(payload?.brandList)
          ? payload.brandList
          : [];

  return keepOperationalItemsForBranch(items, branchId);
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

const isTemplateSource = (item = {}) => {
  const source = String(item?.source || '').trim().toUpperCase();
  const branchCode = String(item?.branch?.branchCode || item?.branchCode || '').trim().toUpperCase();

  return (
    source.includes('TEMPLATE') ||
    branchCode === 'T01' ||
    item?.isTemplate === true ||
    item?.template === true
  );
};

const keepOperationalItemsForBranch = (items = [], branchId) => {
  const brId = toNumberOrNull(branchId);

  return items.filter((item) => {
    if (!item?.id) return false;
    if (isTemplateSource(item)) return false;

    const itemBranchId = toNumberOrNull(item.branchId);
    if (!itemBranchId) return true;

    return !brId || itemBranchId === brId;
  });
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

const getApiErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.message ||
  fallback;

const useProductCreateRuntimeController = () => {
  const branchId = useBranchStore((state) => state.selectedBranchId);
  const runtime = useProductCreateRuntimeStore();
  const imageRef = useRef();
  const latestFormValuesRef = useRef(runtime.formValues);

  const {
    formValues,

    setRuntimeError,
    clearRuntimeError,
    setDropdownsLoading,
    setDropdowns,
    setBrandsLoading,
    setBrands,
    setExistingModelsLoading,
    setExistingModels,

    setFormValue,
    setFormErrors,
    unlockAfterChange,
    beginCreate,
    finishCreateSuccess,
    finishCreateError,
    resetForNextCreate,
    resetRuntime,
  } = runtime;

  useEffect(() => {
    latestFormValuesRef.current = formValues;
  }, [formValues]);

  const loadDropdowns = useCallback(async () => {
    if (!branchId) return null;

    setDropdownsLoading(true);

    try {
      const raw = await getProductCreateDropdowns({ branchId });
      const dropdowns = normalizeDropdownPayload(raw, branchId);
      setDropdowns(dropdowns);
      clearRuntimeError();
      return dropdowns;
    } catch (err) {
      setDropdownsLoading(false);
      setRuntimeError(
        getApiErrorMessage(err, 'โหลดรายการตัวเลือกสำหรับเพิ่มสินค้าไม่สำเร็จ')
      );
      return null;
    }
  }, [branchId, setDropdownsLoading, setDropdowns, setRuntimeError, clearRuntimeError]);

  const loadBrands = useCallback(async () => {
    const productTypeId = formValues.productTypeId;

    if (!productTypeId) {
      setBrands([]);
      return [];
    }

    setBrandsLoading(true);

    try {
      const raw = await getProductCreateBrands({ productTypeId, branchId });
      const brands = normalizeBrandsPayload(raw, branchId);
      setBrands(brands);
      clearRuntimeError();
      return brands;
    } catch (err) {
      setBrandsLoading(false);
      setRuntimeError(
        getApiErrorMessage(err, 'โหลดแบรนด์ตามประเภทสินค้าไม่สำเร็จ')
      );
      return [];
    }
  }, [
    formValues.productTypeId,
    setBrands,
    setBrandsLoading,
    setRuntimeError,
    clearRuntimeError,
  ]);

  const loadExistingModels = useCallback(async () => {
    const latestFormValues = latestFormValuesRef.current || {};

    if (!branchId || !latestFormValues.productTypeId) {
      setExistingModels([]);
      return [];
    }

    setExistingModelsLoading(true);

    try {
      const raw = await getExistingOperationalModels({
        targetBranchId: branchId,
        productTypeId: latestFormValues.productTypeId,
        brandId: latestFormValues.brandId,
        search: latestFormValues.name,
      });
      const items = normalizeExistingModelsPayload(raw);
      setExistingModels(items);
      return items;
    } catch (_) {
      setExistingModels([]);
      return [];
    }
  }, [
    branchId,
    formValues.productTypeId,
    formValues.brandId,
    setExistingModels,
    setExistingModelsLoading,
  ]);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Existing model check should not run on every product-name keystroke.
  // It refreshes when ProductType/Brand changes and can still be triggered manually by the panel button.
  useEffect(() => {
    loadExistingModels();
  }, [loadExistingModels]);

  useEffect(() => {
    return () => {
      resetRuntime();
    };
  }, [resetRuntime]);

  const handleFieldChange = useCallback((field, value) => {
    unlockAfterChange();
    clearRuntimeError();
    setFormValue(field, value);
  }, [unlockAfterChange, clearRuntimeError, setFormValue]);

  const handleSelectExistingModel = useCallback((item) => {
    if (!item) return;
    setFormValue('name', item.name || '');
    if (item.unitId) setFormValue('unitId', String(item.unitId));
  }, [setFormValue]);

  const handleCreate = useCallback(async (event) => {
    event?.preventDefault?.();

    const errors = validateForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      finishCreateError('กรุณาตรวจสอบข้อมูลที่จำเป็นก่อนบันทึก');
      return;
    }

    beginCreate();

    try {
      const payload = buildPayload(formValues, branchId);
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

      finishCreateSuccess(created);
    } catch (err) {
      finishCreateError(
        getApiErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกสินค้า')
      );
    }
  }, [
    formValues,
    branchId,
    runtime.selectedFiles,
    runtime.captions,
    runtime.coverIndex,
    setFormErrors,
    beginCreate,
    finishCreateSuccess,
    finishCreateError,
  ]);

  const handleStartNextCreate = useCallback(() => {
    resetForNextCreate();

    if (imageRef.current && typeof imageRef.current.reset === 'function') {
      try {
        imageRef.current.reset();
      } catch (_) {}
    }

    loadDropdowns();
  }, [resetForNextCreate, loadDropdowns]);

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
