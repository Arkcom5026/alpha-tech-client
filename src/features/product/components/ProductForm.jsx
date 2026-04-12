

// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import _ from 'lodash';

import useProductStore from '../store/productStore';
import useBrandStore from '@/features/brand/store/brandStore';
import { useAuthStore } from '@/features/auth/store/authStore';

// ✅ Standard money input (0.00 placeholder + text-right) — local to this form
const PaymentInput = ({ title, value, onChange, disabled = false }) => {
  return (
    <div>
      <label className="block font-medium mb-1 text-gray-700">{title}</label>
      <input
        type="number"
        className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800 text-right"
        placeholder="0.00"
        step="0.01"
        min="0"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

const ProductForm = ({
  onSubmit,
  defaultValues,
  mode,
  // ✅ allow parent page to lock submit after successful save
  submitDisabled = false,
  submitLabel,
  // ✅ notify parent when any field changes (used to unlock submit)
  onAnyChange,
}) => {
  const {
    // ✅ dropdowns (category/type/profile/template/mappings)
    dropdowns,
    dropdownsLoaded,
    dropdownsLoading,
    dropdownsError,
    ensureDropdownsAction,
    fetchDropdownsAction,
    getSafeBrandOptionsByProductTypeIdAction,
    getBrandOptionsByProductTypeIdAction,
    hasBrandMappingByProductTypeIdAction,
  } = useProductStore();  // ✅ auth gate จาก store กลางเท่านั้น (ห้ามอ่าน localStorage ตรงใน component)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticatedSelector?.());
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const hasToken = Boolean(isAuthenticated) && !isBootstrappingAuth;

  // ✅ preload product dropdowns (idempotent) — Category/Type depend on this
  // กันยิงซ้ำใน StrictMode / re-render
  const dropdownsRequestedRef = useRef(false);

  useEffect(() => {
    if (!hasToken) return;
    if (dropdownsRequestedRef.current) return;

    const hasAny =
      (Array.isArray(dropdowns?.categories) ? dropdowns.categories.length : 0) > 0 ||
      (Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes.length : 0) > 0;

    if (dropdownsLoaded || hasAny || dropdownsLoading) return;

    const fn =
      (typeof ensureDropdownsAction === 'function' && ensureDropdownsAction) ||
      (typeof fetchDropdownsAction === 'function' && fetchDropdownsAction);

    if (!fn) return;

    dropdownsRequestedRef.current = true;
    Promise.resolve(fn()).catch(() => {
      // แค่ไม่ให้ throw กระทบ UI (401/timeout ฯลฯ)
    });
  }, [
    hasToken,
    dropdownsLoaded,
    dropdownsLoading,
    dropdowns?.categories?.length,
    dropdowns?.productTypes?.length,
    ensureDropdownsAction,
    fetchDropdownsAction,
  ]);

  // ถ้า token หายระหว่างทาง ให้เปิดทาง retry ได้
  useEffect(() => {
    if (!hasToken) dropdownsRequestedRef.current = false;
  }, [hasToken]);

  // ✅ Brand reference data (idempotent, shared for Create/Edit)
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

  // ✅ Cascading สำหรับ Product (Create/Edit) เหลือแค่ 2 ชั้น: Category → Type
  const [strict, setStrict] = useState(mode === 'create');
  const [showBrandDebug, setShowBrandDebug] = useState(false);
  const [showCreateBrandHelper, setShowCreateBrandHelper] = useState(false);
  const [showExistingBrandHelper, setShowExistingBrandHelper] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [brandHelperError, setBrandHelperError] = useState('');
  const [brandHelperSuccess, setBrandHelperSuccess] = useState('');
  const [brandHelperSaving, setBrandHelperSaving] = useState(false);
  useEffect(() => {
    setStrict(mode === 'create');
  }, [mode]);

  const prepareDefaults = useCallback(
    (data) => {
      const byName = (list, name) => {
        if (!name) return '';
        const n = String(name).trim().toLowerCase();
        const arr = Array.isArray(list) ? list : [];
        const hit = arr.find((x) => String(x?.name ?? '').trim().toLowerCase() === n);
        return hit ? hit.id : '';
      };

      const _bp = data?.branchPrice?.[0] || data?.branchPrice || {};
      const branchPrice = {
        costPrice: _bp.costPrice ?? data?.costPrice ?? data?.cost ?? '',
        priceWholesale: _bp.priceWholesale ?? data?.priceWholesale ?? '',
        priceTechnician: _bp.priceTechnician ?? data?.priceTechnician ?? '',
        priceRetail: _bp.priceRetail ?? data?.priceRetail ?? '',
        priceOnline: _bp.priceOnline ?? data?.priceOnline ?? '',
      };

      let catId =
        data?.categoryId !== '' && data?.categoryId != null
          ? data.categoryId
          : data?.category?.id ?? data?.category_id ?? '';

      let typeId =
        data?.productTypeId !== '' && data?.productTypeId != null
          ? data.productTypeId
          : data?.productType?.id ?? data?.typeId ?? data?.product_type_id ?? '';

      if (!catId) {
        catId = byName(dropdowns?.categories, data?.categoryName ?? data?.category?.name ?? data?.category_name);
      }
      if (!typeId) {
        typeId = byName(
          dropdowns?.productTypes,
          data?.productTypeName ?? data?.typeName ?? data?.productType?.name ?? data?.product_type_name
        );
      }

      const _types = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [];
      if (!catId && typeId) {
        const ty = _types.find((t) => String(t.id) === String(typeId));
        if (ty) catId = ty.categoryId ?? ty.category?.id ?? catId;
      }

      return {
        ...data,
        name: data?.name || '',
        model: data?.model ?? data?.modelName ?? data?.productModel ?? data?.series ?? data?.variant ?? '',
        // ✅ ชื่อเรียกสั้น (optional)
        shortName:
          data?.shortName ??
          data?.short_name ??
          data?.alias ??
          data?.displayName ??
          data?.display_name ??
          '',

        categoryId: catId === '' || catId == null ? '' : Number(catId),
        productTypeId: typeId === '' || typeId == null ? '' : Number(typeId),

        // ✅ Brand — required by UX (but allow name to include brand as well)
        brandId:
          data?.brandId !== '' && data?.brandId != null
            ? Number(data.brandId)
            : data?.brand?.id != null
              ? Number(data.brand.id)
              : '',

        mode: data?.mode
          ? String(data.mode).toUpperCase()
          : data?.trackSerialNumber
            ? 'STRUCTURED'
            : data?.noSN
              ? 'SIMPLE'
              : 'STRUCTURED',
        noSN: !!data?.noSN,
        active: data?.active !== false,
        branchPrice: {
          costPrice: branchPrice.costPrice ?? '',
          priceWholesale: branchPrice.priceWholesale ?? '',
          priceTechnician: branchPrice.priceTechnician ?? '',
          priceRetail: branchPrice.priceRetail ?? '',
          priceOnline: branchPrice.priceOnline ?? '',
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

        // ✅ Optional helpers (do not change Product SSoT)
        productProfileId:
          data?.productProfileId !== '' && data?.productProfileId != null
            ? Number(data.productProfileId)
            : data?.profileId != null
              ? Number(data.profileId)
              : '',
        productTemplateId:
          data?.productTemplateId !== '' && data?.productTemplateId != null
            ? Number(data.productTemplateId)
            : data?.templateId != null
              ? Number(data.templateId)
              : '',
      };
    },
    [dropdowns]
  );

  const methods = useForm({ mode: 'onChange', defaultValues: prepareDefaults(defaultValues || {}) });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
    control,
    setValue,
    watch,
    reset,
  } = methods;

  // ✅ watch productTypeId safely (react-hook-form)
  const watchedProductTypeId = useWatch({ control, name: 'productTypeId' });

  function toStr(v) {
    return v === '' || v == null ? '' : String(v);
  }

  // ✅ brand fetch guards (avoid duplicate requests / support refetch on type change)
  const brandsRequestedRef = useRef(false);
  const lastBrandTypeIdRef = useRef('__INIT__');

  const requestBrands = useCallback(
    (productTypeId) => {
      const typeKey = productTypeId === '' || productTypeId == null ? undefined : Number(productTypeId);
      const args = {
        includeInactive: false,
        productTypeId: Number.isFinite(typeKey) ? typeKey : undefined,
        typeId: Number.isFinite(typeKey) ? typeKey : undefined,
      };

      const runner =
        (typeof ensureBrandDropdownsAction === 'function' && ensureBrandDropdownsAction) ||
        (typeof fetchBrandsAction === 'function' && fetchBrandsAction) ||
        null;

      if (!runner) return Promise.resolve();

      return Promise.resolve(runner(args)).catch(() => {
        // swallow (401/timeout) - UI should not crash
      });
    },
    [ensureBrandDropdownsAction, fetchBrandsAction]
  );

  // ✅ Normalize brands for <select> (prevent null/duplicate keys)
  // priority:
  // 1) brandStore items (when loaded successfully)
  // 2) productStore dropdowns.brands fallback (fail-soft)
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
    const filtered = (Array.isArray(source) ? source : []).filter((b) => b && b.id != null);
    const uniq = _.uniqBy(filtered, (b) => String(b.id));
    return _.sortBy(uniq, (b) => String(b?.name ?? ''));
  }, [
    brandItems,
    dropdowns?.brands,
    getSafeBrandOptionsByProductTypeIdAction,
    watchedProductTypeId,
    hasBrandDropdownsAction,
  ]);

  // ✅ Type → Brand mapping (ProductTypeBrand)
  // ใช้ helper จาก productStore เป็น source of truth หลัก
  // และกรองซ้ำที่ FE เสมอ แม้ source หลักจะมาจาก brandStore
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
    return new Set(arr.map((b) => String(b?.id)).filter(Boolean));
  }, [hasBrandMapping, strictMappedBrands]);

  const brandsForSelect = useMemo(() => {
    // ✅ ถ้ามี mapping → กรองเสมอ ไม่ว่า source จะมาจาก brandStore หรือ fallback
    if (allowedBrandIdSet) {
      return safeBrands.filter((b) => allowedBrandIdSet.has(String(b.id)));
    }

    // ✅ ไม่มี mapping จริง → ใช้ fallback ที่ fail-soft ได้
    const fallbackSet = new Set(
      (Array.isArray(mappedFallbackBrands) ? mappedFallbackBrands : [])
        .map((b) => String(b?.id))
        .filter(Boolean)
    );

    if (fallbackSet.size > 0) {
      return safeBrands.filter((b) => fallbackSet.has(String(b.id)));
    }

    return safeBrands;
  }, [safeBrands, allowedBrandIdSet, mappedFallbackBrands]);

  // ✅ Ensure brands dropdown is requested with productTypeId (BE-side filter)
  useEffect(() => {
    if (!hasToken) return;
    if (typeof requestBrands !== 'function') return;

    const nextTypeKey = watchedProductTypeId === '' || watchedProductTypeId == null ? '' : String(watchedProductTypeId);
    const typeChanged = lastBrandTypeIdRef.current !== nextTypeKey;

    // เปลี่ยน type → ให้ refetch ทุกครั้ง (BE จะ filter ให้)
    if (typeChanged) {
      lastBrandTypeIdRef.current = nextTypeKey;
      requestBrands(nextTypeKey ? Number(nextTypeKey) : undefined);
      return;
    }

    // preload ครั้งแรกเฉพาะตอน list ว่าง
    if (brandsRequestedRef.current) return;
    const ready = (Array.isArray(brandItems) ? brandItems.length : 0) > 0;
    if (ready) return;

    brandsRequestedRef.current = true;
    requestBrands(nextTypeKey ? Number(nextTypeKey) : undefined);
  }, [hasToken, requestBrands, watchedProductTypeId, brandItems]);

  // ✅ If type changes and selected brand is not allowed → clear brandId
  useEffect(() => {
    const typeIdStr = watchedProductTypeId === '' || watchedProductTypeId == null ? '' : String(watchedProductTypeId);
    if (!typeIdStr) return;
    if (!allowedBrandIdSet) return; // mapping not loaded → don't clear

    const currBrandIdStr = toStr(watch('brandId'));
    if (!currBrandIdStr) return;
    if (!allowedBrandIdSet.has(String(currBrandIdStr))) {
      setValue('brandId', '');
    }
  }, [watchedProductTypeId, allowedBrandIdSet, setValue, watch]);

  // ✅ Optional helpers: Profile / Template (from product dropdowns)
  const safeProfiles = useMemo(() => {
    const raw = dropdowns?.productProfiles ?? dropdowns?.profiles ?? dropdowns?.productProfileItems ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    const filtered = arr.filter((p) => p && p.id != null);
    const uniq = _.uniqBy(filtered, (p) => String(p.id));
    return _.sortBy(uniq, (p) => String(p?.name ?? ''));
  }, [dropdowns?.productProfiles, dropdowns?.profiles, dropdowns?.productProfileItems]);

  const safeTemplates = useMemo(() => {
    const raw = dropdowns?.productTemplates ?? dropdowns?.templates ?? dropdowns?.productTemplateItems ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    const filtered = arr.filter((t) => t && t.id != null);
    const uniq = _.uniqBy(filtered, (t) => String(t.id));
    return _.sortBy(uniq, (t) => String(t?.name ?? ''));
  }, [dropdowns?.productTemplates, dropdowns?.templates, dropdowns?.productTemplateItems]);

  // ✅ Selected brand name (for UX helpers / de-dup hints)
  const selectedBrandIdStr = toStr(watch('brandId'));
  const selectedBrandName = useMemo(() => {
    if (!selectedBrandIdStr) return '';
    const hit = safeBrands.find((b) => String(b.id) === String(selectedBrandIdStr));
    return (hit?.name ?? '').toString().trim();
  }, [safeBrands, selectedBrandIdStr]);

  const allBrandsMaster = useMemo(() => {
    const arr = Array.isArray(dropdowns?.brands) ? dropdowns.brands : [];
    const filtered = arr.filter((b) => b && b.id != null);
    const uniq = _.uniqBy(filtered, (b) => String(b.id));
    return _.sortBy(uniq, (b) => String(b?.name ?? ''));
  }, [dropdowns?.brands]);

  const unmappedExistingBrands = useMemo(() => {
    const mappedIds = new Set((Array.isArray(strictMappedBrands) ? strictMappedBrands : []).map((b) => String(b?.id)).filter(Boolean));
    const q = brandSearch.trim().toLowerCase();
    return allBrandsMaster.filter((b) => {
      const idStr = String(b?.id ?? '');
      const name = String(b?.name ?? '').trim();
      if (!name) return false;
      if (mappedIds.has(idStr)) return false;
      if (!q) return true;
      return name.toLowerCase().includes(q);
    });
  }, [allBrandsMaster, strictMappedBrands, brandSearch]);

  const activeProductTypeId = useMemo(() => {
    const n = Number(watchedProductTypeId);
    return Number.isFinite(n) ? n : null;
  }, [watchedProductTypeId]);

  const refreshBrandsForCurrentType = useCallback(async () => {
    // ✅ สำคัญ: force refresh product dropdowns เพื่อดึง ProductTypeBrand mapping ล่าสุดกลับมา
    try {
      if (typeof fetchDropdownsAction === 'function') {
        await Promise.resolve(fetchDropdownsAction(true));
      }
    } catch (_) {
      // ignore
    }

    // ✅ reset preload guard แล้วดึง brand dropdown ของ type ปัจจุบันใหม่
    brandsRequestedRef.current = false;
    try {
      await Promise.resolve(requestBrands(activeProductTypeId ?? undefined));
    } catch (_) {
      // ignore
    }
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
        attachBrandToProductTypeAction({ productTypeId: activeProductTypeId, brandId: Number(brand?.id) })
      );
      await refreshBrandsForCurrentType();
      // ✅ ให้ form ใช้ brandId ใหม่หลัง store sync รอบล่าสุดแล้ว
      setValue('brandId', Number(brand?.id), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
        attachBrandToProductTypeAction({ productTypeId: activeProductTypeId, brandId })
      );

      await refreshBrandsForCurrentType();
      // ✅ ให้ form ใช้ brandId ใหม่หลัง store sync รอบล่าสุดแล้ว
      setValue('brandId', brandId, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      setBrandHelperSuccess(`สร้างแบรนด์ใหม่ “${name}” และเพิ่มเข้า mapping แล้ว`);
      setNewBrandName('');
      setShowCreateBrandHelper(false);
    } catch (error) {
      setBrandHelperError(error?.message || 'สร้างแบรนด์ใหม่ไม่สำเร็จ');
    } finally {
      setBrandHelperSaving(false);
    }
  }, [activeProductTypeId, newBrandName, createBrandAction, attachBrandToProductTypeAction, refreshBrandsForCurrentType, setValue]);

  // ✅ reset form เมื่อ edit + defaultValues เปลี่ยน (รองรับ dropdowns มาทีหลัง)
  const prevDefaults = useRef(null);
  useEffect(() => {
    if (mode !== 'edit') return;
    const prepared = prepareDefaults(defaultValues || {});
    if (!_.isEqual(prepared, prevDefaults.current)) {
      reset(prepared);
      prevDefaults.current = prepared;
    }
  }, [mode, defaultValues, dropdowns?.categories?.length, dropdowns?.productTypes?.length, reset, prepareDefaults]);

  const handleFormSubmit = async (data) => {
    const cleanBase = _.omit(data || {}, ['initialQty']);

    // ✅ SSoT: mode (SIMPLE = นับจำนวน, STRUCTURED = มี SN รายชิ้น)
    const modeVal = String(cleanBase?.mode ?? '').trim().toUpperCase();
    const resolvedMode = modeVal === 'SIMPLE' ? 'SIMPLE' : 'STRUCTURED';

    const normalizeId = (v) => (v === '' || v == null ? null : Number(v));
    const normalizeText = (v) => {
      const s = (v ?? '').toString().trim();
      return s.length ? s : null;
    };

    const bp = cleanBase?.branchPrice ?? {};
    const numOrNull = (v) => {
      if (v === '' || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      ...cleanBase,
      categoryId: normalizeId(cleanBase.categoryId),
      productTypeId: normalizeId(cleanBase.productTypeId),
      brandId: normalizeId(cleanBase.brandId),
      productProfileId: normalizeId(cleanBase.productProfileId),
      productTemplateId: normalizeId(cleanBase.productTemplateId),

      shortName: normalizeText(cleanBase.shortName),
      model: normalizeText(cleanBase.model),

      mode: resolvedMode,
      noSN: resolvedMode === 'SIMPLE',
      trackSerialNumber: resolvedMode === 'STRUCTURED',

      // ✅ ราคาต่อสาขา (BranchPrice) — BE resolve branch context
      branchPrice: {
        costPrice: numOrNull(bp.costPrice),
        priceWholesale: numOrNull(bp.priceWholesale),
        priceTechnician: numOrNull(bp.priceTechnician),
        priceRetail: numOrNull(bp.priceRetail),
        priceOnline: numOrNull(bp.priceOnline),
      },
    };

    await onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onChange={() => {
          // ✅ parent unlock hook (do not crash UI if handler throws)
          try {
            if (!isSubmitting && typeof onAnyChange === 'function') onAnyChange();
          } catch (_) {
            // ignore
          }
        }}
        className="space-y-6"
      >
        {/* ✅ UI-based status/error (ห้าม dialog alert) */}
        {isSubmitting && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
            <div className="font-semibold">กำลังบันทึกข้อมูลสินค้า…</div>
            <div className="text-sm opacity-90">ระบบกำลังประมวลผล กรุณารอสักครู่</div>
          </div>
        )}

                {isBootstrappingAuth && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
            <div className="font-semibold">กำลังตรวจสอบสิทธิ์การใช้งาน…</div>
            <div className="text-sm opacity-90">ระบบกำลังเตรียมข้อมูลก่อนโหลดรายการอ้างอิงของสินค้า</div>
          </div>
        )}

        {dropdownsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <div className="font-semibold">โหลดข้อมูล Dropdown ไม่สำเร็จ</div>
            <div className="text-sm opacity-90">{String(dropdownsError)}</div>
          </div>
        )}

        {(errors?.categoryId || errors?.productTypeId) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="font-semibold">กรุณากรอกข้อมูลหมวดหมู่/ประเภทสินค้าให้ครบ</div>
            <div className="text-sm opacity-90">
              {errors?.categoryId?.message ? `• ${String(errors.categoryId.message)} ` : ''}
              {errors?.productTypeId?.message ? `• ${String(errors.productTypeId.message)}` : ''}
            </div>
          </div>
        )}

        {/* ===================== Identity (ข้อมูลหลักสินค้า) ===================== */}
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-4">
            <div className="font-semibold text-gray-800 flex items-center gap-2">
              🧱 <span>Identity (ข้อมูลหลักสินค้า)</span>
            </div>
            <div className="text-sm text-gray-500">ข้อมูลที่เป็นตัวตนของสินค้าและใช้เป็นโครงสร้างหลักของระบบ</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* หมวดหมู่ */}
            <div>
              <label htmlFor="categoryId" className="block font-medium mb-1 text-gray-700">
                หมวดหมู่
              </label>
              <Controller
                name="categoryId"
                control={control}
                defaultValue=""
                rules={mode === 'create' ? { required: 'กรุณาเลือกหมวดหมู่' } : undefined}
                render={({ field }) => {
                  const allCats = Array.isArray(dropdowns?.categories) ? dropdowns.categories : [];

                  return (
                    <select
                      id="categoryId"
                      className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                      value={field.value === '' || field.value == null ? '' : String(field.value)}
                      onChange={(e) => {
                        const nextCat = e.target.value;
                        const nextCatVal = nextCat === '' ? '' : Number(nextCat);

                        const prevCatStr = toStr(watch('categoryId'));
                        const prevTypeStr = toStr(watch('productTypeId'));

                        field.onChange(nextCatVal);

                        // ถ้าเปลี่ยนหมวด → type เดิมไม่อยู่ในหมวดใหม่ ให้เคลียร์
                        if (prevTypeStr) {
                          const allTypes = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [];
                          const hit = allTypes.find((t) => String(t.id) === String(prevTypeStr));
                          const hitCatId = String(hit?.categoryId ?? hit?.category?.id ?? '');
                          if (nextCat && hit && hitCatId !== String(nextCat)) {
                            setValue('productTypeId', '');
                          }
                        }

                        if (mode === 'create') setStrict(true);
                        if (!prevCatStr && nextCat) setStrict(true);
                      }}
                    >
                      <option value="">-- เลือกหมวดหมู่ --</option>
                      {allCats
                        .filter((c) => c && c.id != null)
                        .map((c) => (
                          <option key={`cat_${String(c.id)}`} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  );
                }}
              />
            </div>

            {/* ประเภทสินค้า */}
            <div>
              <label htmlFor="productTypeId" className="block font-medium mb-1 text-gray-700">
                ประเภทสินค้า
              </label>
              <Controller
                name="productTypeId"
                control={control}
                defaultValue=""
                rules={mode === 'create' ? { required: 'กรุณาเลือกประเภทสินค้า' } : undefined}
                render={({ field }) => {
                  const catIdStr = toStr(watch('categoryId'));
                  const allTypes = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [];
                  const filteredTypes = catIdStr
                    ? allTypes.filter((t) => String(t?.categoryId ?? t?.category?.id ?? '') === String(catIdStr))
                    : allTypes;

                  const disabled = strict && !catIdStr;

                  return (
                    <select
                      id="productTypeId"
                      className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                      value={field.value === '' || field.value == null ? '' : String(field.value)}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === '' ? '' : Number(v));
                        setStrict(true);
                      }}
                      disabled={disabled}
                      aria-disabled={disabled}
                    >
                      <option value="">-- เลือกประเภทสินค้า --</option>
                      {filteredTypes
                        .filter((t) => t && t.id != null)
                        .map((t) => (
                          <option key={`type_${String(t.id)}`} value={String(t.id)}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                  );
                }}
              />
              {strict && !toStr(watch('categoryId')) ? (
                <div className="mt-1 text-xs text-gray-500">* กรุณาเลือกหมวดหมู่ก่อน</div>
              ) : null}
            </div>

            {/* แบรนด์ (required) */}
            <div>
              <label htmlFor="brandId" className="block font-medium mb-1 text-gray-700">
                แบรนด์ <span className="text-red-500">*</span>
              </label>
              <Controller
                name="brandId"
                control={control}
                defaultValue=""
                rules={{ required: 'กรุณาเลือกแบรนด์' }}
                render={({ field }) => (
                  <select
                    id="brandId"
                    className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                    value={field.value === '' || field.value == null ? '' : String(field.value)}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === '' ? '' : Number(v));
                    }}
                  >
                    <option value="">-- เลือกแบรนด์ --</option>
                    {brandsForSelect.map((b) => (
                      <option key={`brand_${String(b.id)}`} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors?.brandId && <p className="text-red-500 text-sm mt-1">{String(errors.brandId.message)}</p>}

              {/* ✅ ช่วย debug ทันทีว่า filter ทำงานหรือยัง */}
              <div className="mt-2 flex items-center gap-3">
                {toStr(watch('productTypeId')) ? (
                  <div className="text-xs text-gray-500">แบรนด์ที่พร้อมใช้งาน: {brandsForSelect.length} รายการ</div>
                ) : null}

                <button
                  type="button"
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
                  onClick={() => setShowBrandDebug((prev) => !prev)}
                >
                  {showBrandDebug ? 'ซ่อนข้อมูลการตรวจสอบแบรนด์' : 'แสดงข้อมูลการตรวจสอบแบรนด์'}
                </button>
              </div>

              {showBrandDebug && toStr(watch('productTypeId')) ? (
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <div>
                    แบรนด์ที่แสดง: {brandsForSelect.length} รายการ
                    {allowedBrandIdSet ? ' (ตาม mapping ของประเภทสินค้า)' : ' (ยังไม่พบ mapping → fallback ตามข้อมูลที่มี)'}
                  </div>
                  <div>
                    แหล่งข้อมูล: {Array.isArray(brandItems) && brandItems.length > 0 ? 'brandStore (primary)' : 'product dropdowns fallback'}
                  </div>
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  className="text-blue-700 underline underline-offset-2 hover:text-blue-900 disabled:text-gray-400"
                  disabled={!activeProductTypeId || brandHelperSaving}
                  onClick={() => {
                    setBrandHelperError('');
                    setBrandHelperSuccess('');
                    setShowCreateBrandHelper((prev) => !prev);
                    if (showExistingBrandHelper) setShowExistingBrandHelper(false);
                  }}
                >
                  + เพิ่มแบรนด์ใหม่
                </button>

                <button
                  type="button"
                  className="text-blue-700 underline underline-offset-2 hover:text-blue-900 disabled:text-gray-400"
                  disabled={!activeProductTypeId || brandHelperSaving}
                  onClick={() => {
                    setBrandHelperError('');
                    setBrandHelperSuccess('');
                    setShowExistingBrandHelper((prev) => !prev);
                    if (showCreateBrandHelper) setShowCreateBrandHelper(false);
                  }}
                >
                  ไม่พบแบรนด์ที่ต้องการ?
                </button>

                {!activeProductTypeId ? <span className="text-gray-500">* กรุณาเลือกประเภทสินค้าก่อน</span> : null}
              </div>

              {brandHelperError ? (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{brandHelperError}</div>
              ) : null}
              {brandHelperSuccess ? (
                <div className="mt-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">{brandHelperSuccess}</div>
              ) : null}

              {showCreateBrandHelper ? (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="font-medium text-sm text-blue-900">เพิ่มแบรนด์ใหม่</div>
                  <div className="mt-1 text-xs text-blue-800">ระบบจะสร้างแบรนด์ใหม่ แล้วเพิ่มเข้า mapping ของประเภทสินค้าที่เลือกให้อัตโนมัติ</div>
                  <div className="mt-3 flex flex-col gap-2 md:flex-row">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="เช่น Sony, JBL, Logitech"
                      className="w-full rounded-md border border-blue-200 bg-white p-2 text-sm text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={handleCreateBrandAndAttach}
                      disabled={brandHelperSaving || !activeProductTypeId}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {brandHelperSaving ? 'กำลังบันทึก...' : 'สร้างแบรนด์และเพิ่มเข้า mapping'}
                    </button>
                  </div>
                </div>
              ) : null}

              {showExistingBrandHelper ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="font-medium text-sm text-amber-900">ค้นหาแบรนด์ที่มีอยู่แล้วในระบบ แต่ยังไม่ได้ผูกกับประเภทสินค้านี้</div>
                  <div className="mt-1 text-xs text-amber-800">เลือกแบรนด์จากรายการด้านล่างเพื่อเพิ่มเข้า mapping แล้วใช้งานได้ทันที</div>
                  <div className="mt-3">
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="ค้นหาชื่อแบรนด์..."
                      className="w-full rounded-md border border-amber-200 bg-white p-2 text-sm text-gray-800"
                    />
                  </div>
                  <div className="mt-3 max-h-56 overflow-auto rounded-md border border-amber-200 bg-white">
                    {unmappedExistingBrands.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-500">ไม่พบแบรนด์ที่ยังไม่ได้ผูกกับประเภทสินค้านี้</div>
                    ) : (
                      unmappedExistingBrands.slice(0, 50).map((brand) => (
                        <div key={`unmapped_brand_${String(brand.id)}`} className="flex items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0">
                          <div className="text-sm text-gray-800">{brand.name}</div>
                          <button
                            type="button"
                            onClick={() => handleAttachExistingBrand(brand)}
                            disabled={brandHelperSaving}
                            className="rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            เพิ่มเข้า mapping และเลือกใช้งาน
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ✅ Rest of fields (inlined - no FormFields component) */}
        <div className="grid grid-cols-1 gap-6">
          {/* ชื่อสินค้า (SSoT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block font-medium mb-1 text-gray-700">
                ชื่อสินค้า
              </label>
              {(() => {
                const nameVal = (watch('name') || '').toString();
                const lower = nameVal.trim().toLowerCase();
                const brandLower = (selectedBrandName || '').toString().trim().toLowerCase();
                const snLower = (watch('shortName') || '').toString().trim().toLowerCase();
                const mdLower = (watch('model') || '').toString().trim().toLowerCase();

                const hasBrandInName = !!(brandLower && lower.includes(brandLower));
                const hasShortInName = !!(snLower && lower.includes(snLower));
                const hasModelInName = !!(mdLower && lower.includes(mdLower));
                const showDupHint = !!(nameVal && (hasBrandInName || hasShortInName || hasModelInName));

                return (
                  <>
                    <div className="flex gap-2">
                      <input
                        id="name"
                        type="text"
                        placeholder="เช่น CANON CL-811 COL, Kingston NV2 1TB"
                        {...register('name', { required: 'กรุณาระบุชื่อสินค้า' })}
                        className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                      />
                      <button
                        type="button"
                        className="whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                        onClick={() => {
                          const parts = [];
                          if (selectedBrandName) parts.push(selectedBrandName);
                          const sn = (watch('shortName') || '').toString().trim();
                          const md = (watch('model') || '').toString().trim();
                          if (sn) parts.push(sn);
                          if (md) parts.push(md);
                          const suggested = parts.join(' ').split(' ').filter(Boolean).join(' ');
                          if (!suggested) return;
                          setValue('name', suggested, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                        }}
                        disabled={!selectedBrandName && !toStr(watch('shortName')) && !toStr(watch('model'))}
                      >
                        เติมจาก Helper
                      </button>
                    </div>

                    {showDupHint ? (
                      <div className="mt-1 text-xs text-gray-500">
                        พบข้อมูลซ้ำในชื่อสินค้า: {hasBrandInName ? 'แบรนด์ ' : ''}
                        {hasShortInName ? 'คำเรียกสั้น ' : ''}
                        {hasModelInName ? 'Model ' : ''}
                        <span className="ml-1">(ถ้าชื่อสินค้ามียี่ห้อซ้ำอยู่แล้วถือว่าใช้ได้ ไม่จำเป็นต้องแก้)</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-500">
                        Tip: เลือกแบรนด์/ใส่คำเรียกสั้นหรือ Model แล้วกด “เติมจาก Helper” เพื่อช่วยกรอกชื่อให้เร็วขึ้น (ถ้าชื่อมีแบรนด์ซ้ำอยู่แล้วถือว่าใช้ได้)
                      </div>
                    )}
                  </>
                );
              })()}
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div />
          </div>

          {/* ===================== Helper Layer ===================== */}
          <div className="rounded-lg border bg-white p-4">
            <div>
              <div className="font-semibold text-gray-700 flex items-center gap-2">
                🧰 <span>ข้อมูลเพิ่มเติม / ตัวช่วย (ไม่บังคับ)</span>
              </div>
              <div className="text-sm text-gray-500">ช่วยให้ค้นหา/จัดกลุ่ม/กรอกได้เร็วขึ้น และลดการพิมพ์ซ้ำใน “ชื่อสินค้า”</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shortName" className="block font-medium mb-1 text-gray-700">
                  คำเรียกสินค้า (ชื่อเรียกสั้น)
                </label>
                <input
                  id="shortName"
                  type="text"
                  placeholder="เช่น 811, V04, NV2"
                  className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                  {...register('shortName')}
                />
                <div className="mt-1 text-xs text-gray-500">
                  * แนะนำกรอกอย่างใดอย่างหนึ่ง: <span className="font-medium">คำเรียกสั้น</span> หรือ{' '}
                  <span className="font-medium">Model</span> (กรอกทั้งคู่ได้ถ้าจำเป็น)
                </div>
              </div>

              <div>
                <label htmlFor="model" className="block font-medium mb-1 text-gray-700">
                  รุ่น / Model (optional)
                </label>
                <input
                  id="model"
                  type="text"
                  placeholder="เช่น CL-811, i5-12400, Gen4"
                  className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                  {...register('model')}
                />
                <div className="mt-1 text-xs text-gray-500">* ถ้าใส่รุ่นไว้ในชื่อสินค้าอยู่แล้ว ช่องนี้ปล่อยว่างได้ (ลดการกรอกซ้ำ)</div>
              </div>

              <div>
                <label htmlFor="productProfileId" className="block font-medium mb-1 text-gray-700">
                  โปรไฟล์ (optional)
                </label>
                <Controller
                  name="productProfileId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      id="productProfileId"
                      className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                      value={field.value === '' || field.value == null ? '' : String(field.value)}
                      onChange={(e) => {
                        const v = e.target.value;
                        const next = v === '' ? '' : Number(v);
                        field.onChange(next);

                        const currTemplateId = toStr(watch('productTemplateId'));
                        if (!currTemplateId) return;

                        const tpl = safeTemplates.find((t) => String(t.id) === String(currTemplateId));
                        const tplProfileId = tpl?.productProfileId ?? tpl?.profileId;
                        if (next && tplProfileId != null && String(tplProfileId) !== String(next)) {
                          setValue('productTemplateId', '');
                        }
                      }}
                    >
                      <option value="">-- ไม่ระบุโปรไฟล์ --</option>
                      {safeProfiles.map((p) => (
                        <option key={`profile_${String(p.id)}`} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div>
                <label htmlFor="productTemplateId" className="block font-medium mb-1 text-gray-700">
                  เทมเพลต (optional)
                </label>
                <Controller
                  name="productTemplateId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => {
                    const profileIdStr = toStr(watch('productProfileId'));
                    const filteredTemplates = profileIdStr
                      ? safeTemplates.filter((t) => String(t?.productProfileId ?? t?.profileId ?? '') === String(profileIdStr))
                      : safeTemplates;

                    return (
                      <select
                        id="productTemplateId"
                        className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                        value={field.value === '' || field.value == null ? '' : String(field.value)}
                        onChange={(e) => {
                          const v = e.target.value;
                          const next = v === '' ? '' : Number(v);
                          field.onChange(next);

                          if (!next) return;
                          const tpl = safeTemplates.find((t) => String(t.id) === String(next));
                          const tplProfileId = tpl?.productProfileId ?? tpl?.profileId;
                          if (tplProfileId != null && !toStr(watch('productProfileId'))) {
                            setValue('productProfileId', Number(tplProfileId));
                          }
                        }}
                      >
                        <option value="">-- ไม่ระบุเทมเพลต --</option>
                        {filteredTemplates.map((t) => (
                          <option key={`template_${String(t.id)}`} value={String(t.id)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    );
                  }}
                />
                {toStr(watch('productProfileId')) ? (
                  <div className="mt-1 text-xs text-gray-500">* แสดงเทมเพลตที่อยู่ภายใต้โปรไฟล์ที่เลือก</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* ===================== Stock Behavior (Helper ด้านสต๊อก) ===================== */}
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4">
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                ⚙️ <span>Stock Behavior</span>
              </div>
              <div className="text-sm text-gray-500">กำหนดพฤติกรรมการจัดการสต๊อก ไม่ใช่ตัวตนของสินค้า</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label htmlFor="product-mode" className="block font-medium mb-1 text-gray-700">
                  โหมดสต๊อกสินค้า
                </label>
                <Controller
                  name="mode"
                  control={control}
                  defaultValue="STRUCTURED"
                  render={({ field }) => (
                    <select
                      id="product-mode"
                      className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                      value={field.value || 'STRUCTURED'}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="STRUCTURED">SN (แยกรายชิ้น)</option>
                      <option value="SIMPLE">No SN (นับจำนวน)</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* ราคาสินค้า (BranchPrice) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
              <div>
                <Controller
                  name="branchPrice.costPrice"
                  control={control}
                  rules={{
                    validate: (v) => {
                      const n = Number.parseFloat(String(v ?? ''));
                      if (!Number.isFinite(n)) return 'กรุณาระบุราคาทุน';
                      return n > 0 || 'ต้องกำหนดราคาทุนมากกว่า 0';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput title="ราคาทุน" value={field.value ?? ''} onChange={(val) => field.onChange(val)} />
                  )}
                />
                {errors.branchPrice?.costPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.branchPrice.costPrice.message}</p>
                )}
              </div>

              <div>
                <Controller
                  name="branchPrice.priceWholesale"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (v === '' || v == null) return true;
                      const n = Number(v);
                      if (!Number.isFinite(n)) return 'รูปแบบตัวเลขไม่ถูกต้อง';
                      return n >= 0 || 'ราคาขายส่งต้องไม่ติดลบ';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput title="ราคาขายส่ง" value={field.value ?? ''} onChange={(val) => field.onChange(val)} />
                  )}
                />
                {errors.branchPrice?.priceWholesale && (
                  <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceWholesale.message}</p>
                )}
              </div>

              <div>
                <Controller
                  name="branchPrice.priceTechnician"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (v === '' || v == null) return true;
                      const n = Number(v);
                      if (!Number.isFinite(n)) return 'รูปแบบตัวเลขไม่ถูกต้อง';
                      return n >= 0 || 'ราคาช่างต้องไม่ติดลบ';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput title="ราคาช่าง" value={field.value ?? ''} onChange={(val) => field.onChange(val)} />
                  )}
                />
                {errors.branchPrice?.priceTechnician && (
                  <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceTechnician.message}</p>
                )}
              </div>

              <div>
                <Controller
                  name="branchPrice.priceRetail"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (v === '' || v == null) return true;
                      const n = Number(v);
                      if (!Number.isFinite(n)) return 'รูปแบบตัวเลขไม่ถูกต้อง';
                      return n >= 0 || 'ราคาขายปลีกต้องไม่ติดลบ';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput title="ราคาขายปลีก" value={field.value ?? ''} onChange={(val) => field.onChange(val)} />
                  )}
                />
                {errors.branchPrice?.priceRetail && (
                  <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceRetail.message}</p>
                )}
              </div>

              <div>
                <Controller
                  name="branchPrice.priceOnline"
                  control={control}
                  rules={{
                    validate: (v) => {
                      if (v === '' || v == null) return true;
                      const n = Number(v);
                      if (!Number.isFinite(n)) return 'รูปแบบตัวเลขไม่ถูกต้อง';
                      return n >= 0 || 'ราคาออนไลน์ต้องไม่ติดลบ';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput title="ราคาออนไลน์" value={field.value ?? ''} onChange={(val) => field.onChange(val)} />
                  )}
                />
                {errors.branchPrice?.priceOnline && (
                  <p className="text-red-500 text-sm mt-1">{errors.branchPrice.priceOnline.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block font-medium mb-1 text-gray-700">
                รายละเอียดสินค้า
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={2}
                placeholder="แนะนำสินค้าโดยย่อ เช่น ขนาด น้ำหนัก ความสามารถ"
                className="w-full p-3 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="spec" className="block font-medium mb-1 text-gray-700">
                รายละเอียดสเปก
              </label>
              <textarea
                id="spec"
                {...register('spec')}
                rows={3}
                placeholder="รายละเอียดเชิงเทคนิค เช่น CPU, RAM, ความจุ, จอภาพ"
                className="w-full p-3 border rounded-md font-mono focus:ring-blue-400 focus:border-blue-400 text-gray-800"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input id="active" type="checkbox" className="h-4 w-4" {...register('active')} />
              <label htmlFor="active" className="text-sm text-gray-700">
                เปิดใช้งานสินค้า
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-6">
          <button
            type="submit"
            disabled={Boolean(isSubmitting || submitDisabled)}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${
              isSubmitting || submitDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting
              ? 'กำลังบันทึก...'
              : submitLabel
                ? submitLabel
                : mode === 'edit'
                  ? 'บันทึกการแก้ไข'
                  : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;







