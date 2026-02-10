


// ✅ src/features/product/components/ProductForm.jsx

import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import _ from 'lodash';
import useProductStore from '../store/productStore';
import useBrandStore from '@/features/brand/store/brandStore';
import FormFields from './FormFields';
import ProcessingDialog from '@/components/shared/dialogs/ProcessingDialog';

const ProductForm = ({ onSubmit, defaultValues, mode }) => {
  const {
    dropdowns,
    dropdownsLoaded,
    dropdownsLoading,
    dropdownsError,
    ensureDropdownsAction,
    fetchDropdownsAction,
  } = useProductStore();

  // ✅ token gate (กันยิง API ก่อน auth พร้อม → 401)
  const getAuthToken = () => {
    if (typeof window === 'undefined') return ''
    // รองรับหลาย key เผื่อโปรเจกต์เคยเปลี่ยนชื่อ storage
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('posToken') ||
      ''
    )
  }

  const hasToken = Boolean(getAuthToken())
    

  // ✅ preload product dropdowns (idempotent) — Category/Type/Brand depend on this
  // กันยิงซ้ำใน StrictMode / re-render
  const dropdownsRequestedRef = useRef(false)

  useEffect(() => {
    if (!hasToken) return
    if (dropdownsRequestedRef.current) return

    const hasAny =
      (Array.isArray(dropdowns?.categories) ? dropdowns.categories.length : 0) > 0 ||
      (Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes.length : 0) > 0

    if (dropdownsLoaded || hasAny || dropdownsLoading) return

    const fn =
      (typeof ensureDropdownsAction === 'function' && ensureDropdownsAction) ||
      (typeof fetchDropdownsAction === 'function' && fetchDropdownsAction)

    if (!fn) return

    dropdownsRequestedRef.current = true
    Promise.resolve(fn()).catch(() => {
      // แค่ไม่ให้ throw กระทบ UI (401/timeout ฯลฯ)
    })
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
    if (!hasToken) dropdownsRequestedRef.current = false
  }, [hasToken]);


  // ✅ Brand reference data (idempotent, shared for Create/Edit)
  const brandItems = useBrandStore((s) => s?.items ?? s?.brands ?? s?.list ?? [])
  const fetchBrandsAction = useBrandStore(
    (s) => s?.fetchBrandsAction || s?.fetchBrands || s?.loadBrandsAction || s?.loadBrands
  )

  const hasReset = useRef(false);
  const prevDefaults = useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);

  // ✅ New: Cascading สำหรับ Product (Create/Edit) เหลือแค่ 2 ชั้น: Category → Type
  // Strict ยังมีประโยชน์ใน create เพื่อบังคับลำดับการเลือก (กันเลือก type ก่อน category)
  const [strict, setStrict] = React.useState(mode === 'create');
  useEffect(() => {
    setStrict(mode === 'create');
  }, [mode]);

  const prepareDefaults = useCallback((data) => {
    // Helpers
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

    // ---- seed ids จาก payload ----
    let catId =
      data?.categoryId !== '' && data?.categoryId != null
        ? data.categoryId
        : data?.category?.id ?? data?.category_id ?? '';

    let typeId =
      data?.productTypeId !== '' && data?.productTypeId != null
        ? data.productTypeId
        : data?.productType?.id ?? data?.typeId ?? data?.product_type_id ?? '';

    // ---- เพิ่ม fallback จากชื่อ (กรณี payload ไม่มี id) ----
    if (!catId) {
      catId = byName(dropdowns?.categories, data?.categoryName ?? data?.category?.name ?? data?.category_name);
    }
    if (!typeId) {
      typeId = byName(
        dropdowns?.productTypes,
        data?.productTypeName ?? data?.typeName ?? data?.productType?.name ?? data?.product_type_name
      );
    }

    // ---- เติมสายแม่จาก dropdowns ถ้าขาด ----
    const _types = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [];

    // จาก type → category
    if (!catId && typeId) {
      const ty = _types.find((t) => String(t.id) === String(typeId));
      if (ty) {
        catId = ty.categoryId ?? ty.category?.id ?? catId;
      }
    }

    return {
      ...data,
      name: data?.name || '',
      model: data?.model ?? data?.modelName ?? data?.productModel ?? data?.series ?? data?.variant ?? '',
      categoryId: (catId === '' || catId == null) ? '' : Number(catId),
      productTypeId: (typeId === '' || typeId == null) ? '' : Number(typeId),

      // ✅ Brand (optional) — Product-level
      brandId:
        (data?.brandId !== '' && data?.brandId != null)
          ? Number(data.brandId)
          : (data?.brand?.id != null ? Number(data.brand.id) : ''),

      mode: (data?.mode ? String(data.mode).toUpperCase() : (data?.noSN ? 'SIMPLE' : 'STRUCTURED')),
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
      spec: data?.spec ?? data?.specification ?? data?.specs ?? data?.detailSpec ?? data?.technicalSpec ?? data?.remarkSpec ?? data?.spec_detail ?? '',
    };
  }, [dropdowns]);

  // Helper สำหรับ normalize ค่า select ให้เป็น string เสมอ
  const toStr = (v) => (v === '' || v == null ? '' : String(v));

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

  useEffect(() => {
    if (mode !== 'edit') return;
    const prepared = prepareDefaults(defaultValues || {});
    if (!_.isEqual(prepared, prevDefaults.current)) {
      reset(prepared);
      prevDefaults.current = prepared;
      hasReset.current = true;
    }
  }, [
    mode,
    defaultValues,
    dropdowns?.categories?.length,
    dropdowns?.productTypes?.length,
    
    reset,
    prepareDefaults,
  ]);
  // 🔄 preload brands (idempotent) — แยกจาก product dropdowns เพื่อไม่ผูกกันผิดโมดูล
  const brandsRequestedRef = useRef(false)
  useEffect(() => {
    if (!hasToken) return
    if (brandsRequestedRef.current) return

    const ready = (Array.isArray(brandItems) ? brandItems.length : 0) > 0
    if (ready) return

    if (typeof fetchBrandsAction === 'function') {
      brandsRequestedRef.current = true
      Promise.resolve(fetchBrandsAction({ includeInactive: false })).catch(() => {})
    }
  }, [hasToken, brandItems?.length, fetchBrandsAction]);

  useEffect(() => {
    if (!hasToken) brandsRequestedRef.current = false
  }, [hasToken]);

  const handleFormSubmit = async (data) => {
    setShowDialog(true);
    const clean = _.omit(data || {}, ['initialQty']);
    await onSubmit(clean);
    setShowDialog(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* ✅ UI-based error (ห้าม dialog alert) */}
        {dropdownsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <div className="font-semibold">โหลดข้อมูล Dropdown ไม่สำเร็จ</div>
            <div className="text-sm opacity-90">{String(dropdownsError)}</div>
          </div>
        )}

        {/* ✅ 3-column row: หมวดหมู่ + ประเภท + แบรนด์ (บรรทัดเดียวกัน) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* หมวดหมู่ */}
          <div>
            <label htmlFor="categoryId" className="block font-medium mb-1 text-gray-700">หมวดหมู่</label>
            <Controller
              name="categoryId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <select
                  id="categoryId"
                  className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                  value={field.value === '' || field.value == null ? '' : String(field.value)}
                  onChange={(e) => {
                    const incoming = e.target.value
                    const currCat = toStr(watch('categoryId'))
                    const eq = (a, b) => String(a ?? '') === String(b ?? '')

                    if (eq(incoming, currCat)) {
                      field.onChange(incoming === '' ? '' : Number(incoming))
                      return
                    }

                    field.onChange(incoming === '' ? '' : Number(incoming))
                    // เปลี่ยนหมวดหมู่แล้ว เคลียร์ประเภท
                    setValue('productTypeId', '')
                    setStrict(true)
                  }}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {(Array.isArray(dropdowns?.categories) ? dropdowns.categories : []).map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* ประเภทสินค้า */}
          <div>
            <label htmlFor="productTypeId" className="block font-medium mb-1 text-gray-700">ประเภทสินค้า</label>
            <Controller
              name="productTypeId"
              control={control}
              defaultValue=""
              render={({ field }) => {
                const catIdStr = toStr(watch('categoryId'))
                const allTypes = Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : []
                const filteredTypes = catIdStr
                  ? allTypes.filter((t) => String(t?.categoryId ?? t?.category?.id ?? '') === String(catIdStr))
                  : allTypes

                const disabled = strict && !catIdStr

                return (
                  <select
                    id="productTypeId"
                    className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400 text-gray-800"
                    value={field.value === '' || field.value == null ? '' : String(field.value)}
                    onChange={(e) => {
                      const incoming = e.target.value
                      const currType = toStr(watch('productTypeId'))
                      const eq = (a, b) => String(a ?? '') === String(b ?? '')

                      if (eq(incoming, currType)) {
                        field.onChange(incoming === '' ? '' : Number(incoming))
                        return
                      }

                      field.onChange(incoming === '' ? '' : Number(incoming))
                      setStrict(true)
                    }}
                    disabled={disabled}
                    aria-disabled={disabled}
                  >
                    <option value="">-- เลือกประเภทสินค้า --</option>
                    {filteredTypes.map((t) => (
                      <option key={String(t.id)} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )
              }}
            />
          </div>

          {/* แบรนด์ */}
          <div>
            <label htmlFor="brandId" className="block font-medium mb-1 text-gray-700">แบรนด์</label>
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
                    const v = e.target.value
                    field.onChange(v === '' ? '' : Number(v))
                  }}
                >
                  <option value="">-- ไม่ระบุแบรนด์ --</option>
                  {(Array.isArray(brandItems) ? brandItems : []).map((b) => (
                    <option key={String(b.id)} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormFields
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            dropdowns={dropdowns}
            isEditMode={mode === 'edit'}
            defaultValues={prepareDefaults(defaultValues || {})}
            watch={watch}
            showInitialQty={false}
          />
        </div>

        <div className="flex justify-end border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>

      {showDialog && <ProcessingDialog message="กำลังบันทึกข้อมูลสินค้า..." />}
    </FormProvider>
  );
};

export default ProductForm;




