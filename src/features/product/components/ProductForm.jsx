// ✅ src/features/product/components/ProductForm.jsx
// ✅ Product Master Form — Current hierarchy:
// Business → ProductType → Brand → Product
// Removed legacy Category / Profile / Template / SKU helper layers from normal create/edit flow.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import _ from 'lodash';

import useProductStore from '../store/productStore';
import useBrandStore from '@/features/brand/store/brandStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import ProductPriceSection from './form/ProductPriceSection';
import ProductInventorySection from './form/ProductInventorySection';
import ProductSubmitBar from './form/ProductSubmitBar';
import ProductDetailsSection from './form/ProductDetailsSection';
import ProductBasicSection from './form/ProductBasicSection';
import ProductExistingModelsPanel from './form/ProductExistingModelsPanel';


const toId = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
};

const toNullableId = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toNullableText = (value) => {
  const s = String(value ?? '').trim();
  return s.length ? s : null;
};

const toNullableMoney = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const ProductForm = ({
  onSubmit,
  defaultValues,
  mode,
  submitDisabled = false,
  submitLabel,
  onAnyChange,
}) => {
  const {
    dropdowns,
    dropdownsLoaded,
    dropdownsLoading,
    dropdownsError,
    ensureDropdownsAction,
    fetchDropdownsAction,
    getSafeBrandOptionsByProductTypeIdAction,
    getBrandOptionsByProductTypeIdAction,
    hasBrandMappingByProductTypeIdAction,
  } = useProductStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticatedSelector?.());
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const hasToken = Boolean(isAuthenticated) && !isBootstrappingAuth;

  const dropdownsRequestedRef = useRef(false);

  useEffect(() => {
    // Product Create runs inside POS. Do not gate dropdown loading only by online/customer auth state.
    // apiClient handles employee session / silent refresh; while auth is bootstrapping, wait.
    if (isBootstrappingAuth) return;
    if (dropdownsRequestedRef.current) return;

    const hasAny =
      (Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes.length : 0) > 0 ||
      (Array.isArray(dropdowns?.brands) ? dropdowns.brands.length : 0) > 0 ||
      (Array.isArray(dropdowns?.units) ? dropdowns.units.length : 0) > 0;

    if (dropdownsLoaded || hasAny || dropdownsLoading) return;

    const fn =
      (typeof ensureDropdownsAction === 'function' && ensureDropdownsAction) ||
      (typeof fetchDropdownsAction === 'function' && fetchDropdownsAction);

    if (!fn) return;

    dropdownsRequestedRef.current = true;
    Promise.resolve(fn()).catch(() => {
      dropdownsRequestedRef.current = false;
    });
  }, [
    isBootstrappingAuth,
    dropdownsLoaded,
    dropdownsLoading,
    dropdowns?.productTypes?.length,
    dropdowns?.brands?.length,
    dropdowns?.units?.length,
    ensureDropdownsAction,
    fetchDropdownsAction,
  ]);

  useEffect(() => {
    if (!hasToken && !isBootstrappingAuth) dropdownsRequestedRef.current = false;
  }, [hasToken, isBootstrappingAuth]);

  const brandItems = useBrandStore((s) => s?.items ?? s?.brands ?? s?.list ?? []);
  const createBrandAction = useBrandStore(
    (s) => s?.createBrandAction || s?.createBrand || s?.addBrandAction || s?.addBrand
  );
  const attachBrandToProductTypeAction = useBrandStore(
    (s) =>
      s?.attachBrandToProductTypeAction ||
      s?.addBrandToProductTypeAction ||
      s?.createProductTypeBrandAction ||
      s?.attachBrandAction
  );
  const ensureBrandDropdownsAction = useBrandStore((s) => s?.ensureBrandDropdownsAction);
  const fetchBrandsAction = useBrandStore(
    (s) =>
      s?.fetchBrandDropdownsAction ||
      s?.fetchBrandDropdowns ||
      s?.fetchBrandsAction ||
      s?.fetchBrands ||
      s?.loadBrandsAction ||
      s?.loadBrands
  );
  const hasBrandDropdownsAction = useBrandStore((s) => s?.hasBrandDropdownsAction);

  const [showCreateBrandHelper, setShowCreateBrandHelper] = useState(false);
  const [showExistingBrandHelper, setShowExistingBrandHelper] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [brandHelperError, setBrandHelperError] = useState('');
  const [brandHelperSuccess, setBrandHelperSuccess] = useState('');
  const [brandHelperSaving, setBrandHelperSaving] = useState(false);

  const productTypes = useMemo(() => {
    const raw = dropdowns?.productTypes ?? dropdowns?.types ?? [];
    const arr = Array.isArray(raw) ? raw : [];

    const normalized = arr
      .filter((item) => item && item.id != null)
      .map((item) => ({
        ...item,
        name: String(item?.name ?? '').trim(),
      }))
      .filter((item) => item.name);

    const unique = _.uniqBy(
      normalized,
      (item) => item.name.toLowerCase()
    );

    return _.sortBy(unique, (item) => item.name);
  }, [dropdowns?.productTypes, dropdowns?.types]);

  const units = useMemo(() => {
    const raw = dropdowns?.units ?? dropdowns?.unitItems ?? dropdowns?.productUnits ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    return _.sortBy(arr.filter((item) => item && item.id != null), (item) => String(item?.name ?? ''));
  }, [dropdowns?.units, dropdowns?.unitItems, dropdowns?.productUnits]);

  const prepareDefaults = useCallback((data) => {
    const branchPriceSource = Array.isArray(data?.branchPrice)
      ? data.branchPrice[0] || {}
      : data?.branchPrice || {};

    const resolvedMode = data?.mode
      ? String(data.mode).toUpperCase()
      : data?.trackSerialNumber
        ? 'STRUCTURED'
        : data?.noSN
          ? 'SIMPLE'
          : 'STRUCTURED';

    return {
      name: data?.name ?? '',
      productTypeId: toId(data?.productTypeId ?? data?.productType?.id ?? data?.typeId ?? data?.product_type_id),
      brandId: toId(data?.brandId ?? data?.brand?.id),
      unitId: toId(data?.unitId ?? data?.unit?.id),
      mode: resolvedMode === 'SIMPLE' ? 'SIMPLE' : 'STRUCTURED',
      active: data?.active !== false,
      branchPrice: {
        costPrice: branchPriceSource?.costPrice ?? data?.costPrice ?? data?.cost ?? '',
        priceRetail: branchPriceSource?.priceRetail ?? data?.priceRetail ?? '',
        priceTechnician: branchPriceSource?.priceTechnician ?? data?.priceTechnician ?? '',
        priceOnline: branchPriceSource?.priceOnline ?? data?.priceOnline ?? '',
        priceWholesale: branchPriceSource?.priceWholesale ?? data?.priceWholesale ?? '',
      },
      description: data?.description ?? data?.desc ?? data?.shortDescription ?? '',
      spec:
        data?.spec ??
        data?.specification ??
        data?.specs ??
        data?.detailSpec ??
        data?.technicalSpec ??
        data?.remarkSpec ??
        data?.spec_detail ??
        '',
    };
  }, []);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: prepareDefaults(defaultValues || {}),
  });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    control,
    setValue,
    watch,
    reset,
  } = methods;

  const watchedProductTypeId = useWatch({ control, name: 'productTypeId' });
  const watchedBrandId = useWatch({ control, name: 'brandId' });

  const toStr = (value) => (value === '' || value == null ? '' : String(value));

  const requestBrands = useCallback(
    (productTypeId) => {
      const n = Number(productTypeId);
      const typeId = Number.isFinite(n) ? n : undefined;

      const runner =
        (typeof ensureBrandDropdownsAction === 'function' && ensureBrandDropdownsAction) ||
        (typeof fetchBrandsAction === 'function' && fetchBrandsAction) ||
        null;

      if (!runner) return Promise.resolve();

      return Promise.resolve(
        runner({
          includeInactive: false,
          productTypeId: typeId,
          typeId,
        })
      ).catch(() => {});
    },
    [ensureBrandDropdownsAction, fetchBrandsAction]
  );

  const brandsRequestedRef = useRef(false);
  const lastBrandTypeIdRef = useRef('__INIT__');

  useEffect(() => {
    if (isBootstrappingAuth) return;

    const nextTypeKey = watchedProductTypeId === '' || watchedProductTypeId == null ? '' : String(watchedProductTypeId);
    const typeChanged = lastBrandTypeIdRef.current !== nextTypeKey;

    if (typeChanged) {
      lastBrandTypeIdRef.current = nextTypeKey;
      requestBrands(nextTypeKey ? Number(nextTypeKey) : undefined);
      return;
    }

    if (brandsRequestedRef.current) return;
    const ready = (Array.isArray(brandItems) ? brandItems.length : 0) > 0;
    if (ready) return;

    brandsRequestedRef.current = true;
    requestBrands(nextTypeKey ? Number(nextTypeKey) : undefined);
  }, [isBootstrappingAuth, requestBrands, watchedProductTypeId, brandItems]);

  const safeBrands = useMemo(() => {
    const storeBrands = Array.isArray(brandItems) ? brandItems : [];

    const fallbackBrands =
      typeof getSafeBrandOptionsByProductTypeIdAction === 'function'
        ? getSafeBrandOptionsByProductTypeIdAction(watchedProductTypeId)
        : Array.isArray(dropdowns?.brands)
          ? dropdowns.brands
          : [];

    const hasPrimary =
      (typeof hasBrandDropdownsAction === 'function' && hasBrandDropdownsAction()) ||
      storeBrands.length > 0;

    const source = hasPrimary ? storeBrands : fallbackBrands;
    const filtered = (Array.isArray(source) ? source : []).filter((brand) => brand && brand.id != null);
    const uniq = _.uniqBy(filtered, (brand) => String(brand.id));
    return _.sortBy(uniq, (brand) => String(brand?.name ?? ''));
  }, [
    brandItems,
    dropdowns?.brands,
    getSafeBrandOptionsByProductTypeIdAction,
    watchedProductTypeId,
    hasBrandDropdownsAction,
  ]);

  const strictMappedBrands = useMemo(() => {
    if (typeof getBrandOptionsByProductTypeIdAction === 'function') {
      return getBrandOptionsByProductTypeIdAction(watchedProductTypeId);
    }
    return [];
  }, [getBrandOptionsByProductTypeIdAction, watchedProductTypeId]);

  const mappedFallbackBrands = useMemo(() => {
    if (typeof getSafeBrandOptionsByProductTypeIdAction === 'function') {
      return getSafeBrandOptionsByProductTypeIdAction(watchedProductTypeId);
    }
    return Array.isArray(dropdowns?.brands) ? dropdowns.brands : [];
  }, [getSafeBrandOptionsByProductTypeIdAction, watchedProductTypeId, dropdowns?.brands]);

  const hasBrandMapping = useMemo(() => {
    if (typeof hasBrandMappingByProductTypeIdAction !== 'function') return false;
    return hasBrandMappingByProductTypeIdAction(watchedProductTypeId);
  }, [hasBrandMappingByProductTypeIdAction, watchedProductTypeId]);

  const allowedBrandIdSet = useMemo(() => {
    if (!hasBrandMapping) return null;
    const arr = Array.isArray(strictMappedBrands) ? strictMappedBrands : [];
    return new Set(arr.map((brand) => String(brand?.id)).filter(Boolean));
  }, [hasBrandMapping, strictMappedBrands]);

  const brandsForSelect = useMemo(() => {
    if (allowedBrandIdSet) {
      return safeBrands.filter((brand) => allowedBrandIdSet.has(String(brand.id)));
    }

    const fallbackSet = new Set(
      (Array.isArray(mappedFallbackBrands) ? mappedFallbackBrands : [])
        .map((brand) => String(brand?.id))
        .filter(Boolean)
    );

    if (fallbackSet.size > 0) {
      return safeBrands.filter((brand) => fallbackSet.has(String(brand.id)));
    }

    return safeBrands;
  }, [safeBrands, allowedBrandIdSet, mappedFallbackBrands]);

  useEffect(() => {
    const selectedType = toStr(watchedProductTypeId);
    if (!selectedType) return;
    if (!allowedBrandIdSet) return;

    const currentBrandId = toStr(watch('brandId'));
    if (!currentBrandId) return;

    if (!allowedBrandIdSet.has(currentBrandId)) {
      setValue('brandId', '', { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  }, [watchedProductTypeId, allowedBrandIdSet, setValue, watch]);

  const activeProductTypeId = useMemo(() => {
    const n = Number(watchedProductTypeId);
    return Number.isFinite(n) ? n : null;
  }, [watchedProductTypeId]);

  const allBrandsMaster = useMemo(() => {
    const arr = Array.isArray(dropdowns?.brands) ? dropdowns.brands : [];
    const filtered = arr.filter((brand) => brand && brand.id != null);
    const uniq = _.uniqBy(filtered, (brand) => String(brand.id));
    return _.sortBy(uniq, (brand) => String(brand?.name ?? ''));
  }, [dropdowns?.brands]);

  const unmappedExistingBrands = useMemo(() => {
    const mappedIds = new Set(
      (Array.isArray(strictMappedBrands) ? strictMappedBrands : [])
        .map((brand) => String(brand?.id))
        .filter(Boolean)
    );

    const query = brandSearch.trim().toLowerCase();

    return allBrandsMaster.filter((brand) => {
      const id = String(brand?.id ?? '');
      const name = String(brand?.name ?? '').trim();

      if (!name) return false;
      if (mappedIds.has(id)) return false;
      if (!query) return true;

      return name.toLowerCase().includes(query);
    });
  }, [allBrandsMaster, strictMappedBrands, brandSearch]);

  const refreshBrandsForCurrentType = useCallback(async () => {
    try {
      if (typeof fetchDropdownsAction === 'function') {
        await Promise.resolve(fetchDropdownsAction(true));
      }
    } catch (_) {}

    brandsRequestedRef.current = false;

    try {
      await Promise.resolve(requestBrands(activeProductTypeId ?? undefined));
    } catch (_) {}
  }, [fetchDropdownsAction, requestBrands, activeProductTypeId]);

  const handleAttachExistingBrand = useCallback(async (brand) => {
    setBrandHelperError('');
    setBrandHelperSuccess('');

    if (!activeProductTypeId) {
      setBrandHelperError('กรุณาเลือกประเภทสินค้าก่อน');
      return;
    }

    if (typeof attachBrandToProductTypeAction !== 'function') {
      setBrandHelperError('ยังไม่พร้อมใช้งานการเพิ่ม mapping ของแบรนด์');
      return;
    }

    try {
      setBrandHelperSaving(true);
      await Promise.resolve(
        attachBrandToProductTypeAction({
          productTypeId: activeProductTypeId,
          brandId: Number(brand?.id),
        })
      );

      await refreshBrandsForCurrentType();

      setValue('brandId', Number(brand?.id), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setBrandHelperSuccess(`เพิ่มแบรนด์ “${String(brand?.name ?? '')}” เข้า mapping และเลือกใช้งานแล้ว`);
      setShowExistingBrandHelper(false);
      setBrandSearch('');
    } catch (error) {
      setBrandHelperError(error?.message || 'เพิ่มแบรนด์เข้า mapping ไม่สำเร็จ');
    } finally {
      setBrandHelperSaving(false);
    }
  }, [activeProductTypeId, attachBrandToProductTypeAction, refreshBrandsForCurrentType, setValue]);

  const handleCreateBrandAndAttach = useCallback(async () => {
    setBrandHelperError('');
    setBrandHelperSuccess('');

    const name = String(newBrandName || '').trim();

    if (!activeProductTypeId) {
      setBrandHelperError('กรุณาเลือกประเภทสินค้าก่อน');
      return;
    }

    if (!name) {
      setBrandHelperError('กรุณาระบุชื่อแบรนด์ใหม่');
      return;
    }

    if (typeof createBrandAction !== 'function') {
      setBrandHelperError('ยังไม่พร้อมใช้งานการสร้างแบรนด์ใหม่');
      return;
    }

    if (typeof attachBrandToProductTypeAction !== 'function') {
      setBrandHelperError('ยังไม่พร้อมใช้งานการเพิ่ม mapping ของแบรนด์');
      return;
    }

    try {
      setBrandHelperSaving(true);

      const created = await Promise.resolve(createBrandAction({ name }));
      const brandId = Number(created?.data?.id ?? created?.id ?? created?.brand?.id);

      if (!Number.isFinite(brandId)) {
        throw new Error('สร้างแบรนด์สำเร็จแต่ไม่พบ brandId ที่จะนำไปผูก mapping');
      }

      await Promise.resolve(
        attachBrandToProductTypeAction({
          productTypeId: activeProductTypeId,
          brandId,
        })
      );

      await refreshBrandsForCurrentType();

      setValue('brandId', brandId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setBrandHelperSuccess(`สร้างแบรนด์ใหม่ “${name}” และเพิ่มเข้า mapping แล้ว`);
      setNewBrandName('');
      setShowCreateBrandHelper(false);
    } catch (error) {
      setBrandHelperError(error?.message || 'สร้างแบรนด์ใหม่ไม่สำเร็จ');
    } finally {
      setBrandHelperSaving(false);
    }
  }, [activeProductTypeId, newBrandName, createBrandAction, attachBrandToProductTypeAction, refreshBrandsForCurrentType, setValue]);

  const prevDefaults = useRef(null);

  useEffect(() => {
    if (mode !== 'edit') return;

    const prepared = prepareDefaults(defaultValues || {});
    if (!_.isEqual(prepared, prevDefaults.current)) {
      reset(prepared);
      prevDefaults.current = prepared;
    }
  }, [
    mode,
    defaultValues,
    dropdowns?.productTypes?.length,
    dropdowns?.brands?.length,
    dropdowns?.units?.length,
    reset,
    prepareDefaults,
  ]);

  const handleFormSubmit = async (data) => {
    const modeValue = String(data?.mode || '').trim().toUpperCase();
    const resolvedMode = modeValue === 'SIMPLE' ? 'SIMPLE' : 'STRUCTURED';

    const payload = {
      name: toNullableText(data.name),
      productTypeId: toNullableId(data.productTypeId),
      brandId: toNullableId(data.brandId),
      unitId: toNullableId(data.unitId),
      mode: resolvedMode,
      noSN: resolvedMode === 'SIMPLE',
      trackSerialNumber: resolvedMode === 'STRUCTURED',
      active: data.active !== false,
      branchPrice: {
        costPrice: toNullableMoney(data.branchPrice?.costPrice),
        priceRetail: toNullableMoney(data.branchPrice?.priceRetail),
        priceTechnician: toNullableMoney(data.branchPrice?.priceTechnician),
        priceOnline: toNullableMoney(data.branchPrice?.priceOnline),
        priceWholesale: toNullableMoney(data.branchPrice?.priceWholesale),
        isActive: true,
      },
      description: toNullableText(data.description),
      spec: toNullableText(data.spec),
    };

    await onSubmit(payload);
  };

  const isBusy = isSubmitting || submitDisabled;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" onChange={onAnyChange}>
        {dropdownsError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            โหลดรายการตัวเลือกไม่สำเร็จ: {dropdownsError?.message || String(dropdownsError)}
          </div>
        )}

        <ProductBasicSection
          register={register}
          errors={errors}
          productTypes={productTypes}
          brands={brandsForSelect}
          units={units}
          watchedProductTypeId={watchedProductTypeId}
          showCreateBrandHelper={showCreateBrandHelper}
          setShowCreateBrandHelper={setShowCreateBrandHelper}
          showExistingBrandHelper={showExistingBrandHelper}
          setShowExistingBrandHelper={setShowExistingBrandHelper}
          brandSearch={brandSearch}
          setBrandSearch={setBrandSearch}
          newBrandName={newBrandName}
          setNewBrandName={setNewBrandName}
          brandHelperError={brandHelperError}
          brandHelperSuccess={brandHelperSuccess}
          brandHelperSaving={brandHelperSaving}
          onCreateBrandAndAttach={handleCreateBrandAndAttach}
          onAttachExistingBrand={handleAttachExistingBrand}
          unmappedExistingBrands={unmappedExistingBrands}
        />

        <ProductExistingModelsPanel
          productTypeId={watchedProductTypeId}
          brandId={watchedBrandId}
        />

        <ProductInventorySection register={register} errors={errors} />
        <ProductPriceSection register={register} errors={errors} />
        <ProductDetailsSection register={register} errors={errors} />
        <ProductSubmitBar isBusy={isBusy} submitLabel={submitLabel} mode={mode} />
      </form>
    </FormProvider>
  );
};

export default ProductForm;
