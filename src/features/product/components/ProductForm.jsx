






// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import _ from 'lodash';

import useProductStore from '../store/productStore';
import useBrandStore from '@/features/brand/store/brandStore';

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

const ProductForm = ({ onSubmit, defaultValues, mode }) => {
  const {
    dropdowns,
    dropdownsLoaded,
    dropdownsLoading,
    dropdownsError,
    ensureDropdownsAction,
    fetchDropdownsAction,

    // ✅ optional: mapping fetchers (ProductTypeBrand)
    fetchProductTypeBrandsAction,
    ensureProductTypeBrandsAction,
    fetchTypeBrandsAction,
    ensureTypeBrandsAction,
  } = useProductStore();

  // ✅ token gate (กันยิง API ก่อน auth พร้อม → 401)
  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    // รองรับหลาย key เผื่อโปรเจกต์เคยเปลี่ยนชื่อ storage
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('posToken') ||
      ''
    );
  };

  const hasToken = Boolean(getAuthToken());

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
  const fetchBrandsAction = useBrandStore(
    (s) =>
      s?.fetchBrandDropdownsAction ||
      s?.fetchBrandDropdowns ||
      s?.fetchBrandsAction ||
      s?.fetchBrands ||
      s?.loadBrandsAction ||
      s?.loadBrands
  );

  // ✅ Cascading สำหรับ Product (Create/Edit) เหลือแค่ 2 ชั้น: Category → Type
  const [strict, setStrict] = useState(mode === 'create');
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

        // ✅ Brand (optional) — Product-level
        brandId:
          data?.brandId !== '' && data?.brandId != null
            ? Number(data.brandId)
            : data?.brand?.id != null
              ? Number(data.brand.id)
              : '',

        mode: data?.mode ? String(data.mode).toUpperCase() : data?.noSN ? 'SIMPLE' : 'STRUCTURED',
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
  // NOTE: keep this declared exactly once (avoid "already been declared")
  const watchedProductTypeId = useWatch({ control, name: 'productTypeId' });

  function toStr(v) {
    return v === '' || v == null ? '' : String(v);
  }

  // ✅ brand fetch guards (avoid duplicate requests / support refetch on type change)
  const brandsRequestedRef = useRef(false);
  const lastBrandTypeIdRef = useRef('__INIT__');

  const requestBrands = useCallback(
    (productTypeId) => {
      if (typeof fetchBrandsAction !== 'function') return Promise.resolve();

      // รองรับหลายรูปแบบของ store/API (บางโปรเจกต์ใช้ key = typeId)
      const typeKey = productTypeId === '' || productTypeId == null ? undefined : productTypeId;
      const args = {
        includeInactive: false,
        productTypeId: typeKey,
        typeId: typeKey,
      };

      return Promise.resolve(fetchBrandsAction(args)).catch(() => {
        // swallow (401/timeout) - UI should not crash
      });
    },
    [fetchBrandsAction]
  );

  // ✅ Normalize brands for <select> (prevent null/duplicate keys)
  const safeBrands = useMemo(() => {
    const arr = Array.isArray(brandItems) ? brandItems : [];
    const filtered = arr.filter((b) => b && b.id != null);
    const uniq = _.uniqBy(filtered, (b) => String(b.id));
    return _.sortBy(uniq, (b) => String(b?.name ?? ''));
  }, [brandItems]);

    // ✅ Type → Brand mapping (ProductTypeBrand)
  // - ถ้า BE ส่ง mapping มาพร้อม dropdowns → ใช้กรองแบรนด์ใน FE
  // - ถ้าไม่มี mapping → อย่างน้อยเราจะพยายามให้ BE ส่งแบรนด์แบบ filter ตาม productTypeId (ผ่าน /api/brands/dropdowns)
  const pickFirstArray = (...candidates) => {
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }
    return [];
  };

  const productTypeBrandsRaw = useMemo(() => {
    // tolerate many possible payload shapes/keys (minimal disruption)
    return pickFirstArray(
      dropdowns?.productTypeBrands,
      dropdowns?.productTypeBrand,
      dropdowns?.typeBrands,
      dropdowns?.typeBrand,
      dropdowns?.productTypeBrandMappings,
      dropdowns?.typeBrandMappings,
      dropdowns?.productTypeBrandRows,
      dropdowns?.typeBrandRows,
      dropdowns?.mappings?.productTypeBrands,
      dropdowns?.mappings?.typeBrands,
      dropdowns?.data?.productTypeBrands,
      dropdowns?.data?.typeBrands
    );
  }, [dropdowns]);

  const allowedBrandIdSet = useMemo(() => {
    const typeIdStr = watchedProductTypeId === '' || watchedProductTypeId == null ? '' : String(watchedProductTypeId);
    const arr = Array.isArray(productTypeBrandsRaw) ? productTypeBrandsRaw : [];

    // ยังไม่เลือก type → ไม่กรอง
    if (!typeIdStr) return null;

    // ไม่มี mapping → ไม่กรอง (ปล่อยให้ BE-filter หรือแสดงทั้งหมด)
    if (arr.length === 0) return null;

    const set = new Set();
    for (const row of arr) {
      // tolerate row shapes
      const pt = row?.productTypeId ?? row?.typeId ?? row?.product_type_id ?? row?.product_typeId;
      const bid = row?.brandId ?? row?.brand_id ?? row?.brand?.id;
      if (pt == null || bid == null) continue;
      if (String(pt) === String(typeIdStr)) set.add(String(bid));
    }

    // mapping ถูกโหลดแล้ว แต่ไม่มีแถวของ type นี้จริง ๆ → กรองเป็น “ว่าง”
    return set;
  }, [productTypeBrandsRaw, watchedProductTypeId]);

  const brandsForSelect = useMemo(() => {
    // 1) ถ้ามี mapping → กรองใน FE
    if (allowedBrandIdSet) {
      return safeBrands.filter((b) => allowedBrandIdSet.has(String(b.id)));
    }
    // 2) ถ้าไม่มี mapping → ใช้รายการจาก store ตามที่ BE ส่งมา (อาจจะ filter แล้ว)
    return safeBrands;
  }, [safeBrands, allowedBrandIdSet]);

  // ✅ Ensure brands dropdown is requested with productTypeId (BE-side filter)
  // หมายเหตุ: เราไม่ "ensure mapping" ที่นี่เพื่อไม่ไปผูกกับ action ใหม่/เก่าใน productStore
  useEffect(() => {
    if (!hasToken) return;
    if (typeof fetchBrandsAction !== 'function') return;

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
  }, [hasToken, fetchBrandsAction, requestBrands, watchedProductTypeId, brandItems]);

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

    // ✅ SSoT: noSN (โหมด SIMPLE = นับจำนวน, STRUCTURED = มี SN รายชิ้น)
    const modeVal = String(cleanBase?.mode ?? '').trim().toUpperCase();
    const derivedNoSN = modeVal === 'SIMPLE';

    const normalizeId = (v) => (v === '' || v == null ? null : Number(v));
    const normalizeText = (v) => {
      const s = (v ?? '').toString().trim();
      return s.length ? s : null;
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
      noSN: derivedNoSN,
    };

    delete payload.mode;

    await onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* ✅ UI-based status/error (ห้าม dialog alert) */}
        {isSubmitting && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
            <div className="font-semibold">กำลังบันทึกข้อมูลสินค้า…</div>
            <div className="text-sm opacity-90">ระบบกำลังประมวลผล กรุณารอสักครู่</div>
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

                        // create: บังคับลำดับให้ชัด
                        if (mode === 'create') setStrict(true);

                        // ถ้าเพิ่งเริ่มเลือกหมวด (จากว่าง → มีค่า) ก็ถือว่า strict ได้
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

            {/* แบรนด์ */}
            <div>
              <label htmlFor="brandId" className="block font-medium mb-1 text-gray-700">
                แบรนด์
              </label>
              <Controller
                name="brandId"
                control={control}
                defaultValue=""
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
                    <option value="">-- ไม่ระบุแบรนด์ --</option>
                    {brandsForSelect.map((b) => (
                      <option key={`brand_${String(b.id)}`} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {/* ✅ ช่วย debug ทันทีว่า filter ทำงานหรือยัง */}
              {toStr(watch('productTypeId')) ? (
                <div className="mt-1 text-xs text-gray-500">
                  แบรนด์ที่แสดง: {brandsForSelect.length} รายการ
                  {allowedBrandIdSet ? ` (ตาม mapping ของประเภทสินค้า)` : ' (ยังไม่พบ mapping → แสดงทั้งหมด)'}
                </div>
              ) : null}
            </div>
          </div>
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
                placeholder="เช่น V04, NV2, G102"
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
                placeholder="เช่น i5-12400, NVMe 1TB, Gen4"
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

                      // ถ้าเปลี่ยน profile แล้ว template ที่เลือกอยู่ไม่สอดคล้อง → เคลียร์
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

                        // ถ้าเลือก template แล้ว profile ยังว่าง → auto-fill profile จาก template
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
                        placeholder="เช่น Kingston NV2 1TB, Acer Nitro 5"
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
                        <span className="ml-1">(ถ้ากรอกไว้ในช่องแยกแล้ว สามารถเอาออกจากชื่อสินค้าได้)</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-500">
                        Tip: เลือกแบรนด์/ใส่คำเรียกสั้นหรือ Model แล้วกด “เติมชื่อจากข้อมูลที่เลือก” เพื่อลดการพิมพ์ซ้ำ
                      </div>
                    )}
                  </>
                );
              })()}
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div />
          </div>

          {/* ===================== Stock Behavior (Helper ด้านสต๊อก) ===================== */}
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4">
              <div className="font-semibold text-gray-800 flex items-center gap-2">⚙️ <span>Stock Behavior</span></div>
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
                      <option value="STRUCTURED">Structured (มี Serial Number รายชิ้น)</option>
                      <option value="SIMPLE">Simple (นับจำนวน ไม่ใช้ Serial Number)</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* ราคาต่อสาขา (BranchPrice) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 ">
              <div>
                <Controller
                  name="branchPrice.costPrice"
                  control={control}
                  rules={{
                    valueAsNumber: true,
                    validate: (v) => {
                      const n = Number.parseFloat(String(v ?? ''));
                      if (!Number.isFinite(n)) return 'กรุณาระบุราคาทุน';
                      return n > 0 || 'ต้องกำหนดราคาทุนมากกว่า 0';
                    },
                  }}
                  render={({ field }) => (
                    <PaymentInput
                      title="ราคาทุน"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                    />
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
                  rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายส่งต้องไม่ติดลบ' } }}
                  render={({ field }) => (
                    <PaymentInput
                      title="ราคาขายส่ง"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                    />
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
                  rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาช่างต้องไม่ติดลบ' } }}
                  render={({ field }) => (
                    <PaymentInput
                      title="ราคาช่าง"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                    />
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
                  rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาขายปลีกต้องไม่ติดลบ' } }}
                  render={({ field }) => (
                    <PaymentInput
                      title="ราคาขายปลีก"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                    />
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
                  rules={{ valueAsNumber: true, min: { value: 0, message: 'ราคาออนไลน์ต้องไม่ติดลบ' } }}
                  render={({ field }) => (
                    <PaymentInput
                      title="ราคาออนไลน์"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(val) => field.onChange(val === '' ? 0 : parseFloat(val))}
                    />
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
            disabled={isSubmitting}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;





