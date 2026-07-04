const toStrOrEmpty = (v) => (v === undefined || v === null || v === '' ? '' : String(v));

import React, { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productProfileSchema } from '../schema/productProfileSchema';
import { Button } from '@/components/ui/button';

const shallowEqual = (a, b) => {
  const ka = Object.keys(a || {});
  const kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
};

const ProductProfileForm = ({
  dropdowns,
  isSubmitting = false,
  isDropdownLoading = false,
  onSubmit: onSubmitProp,
  onCancel,
  defaultValues = {},
  mode,
}) => {
  const methods = useForm({
    resolver: zodResolver(productProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      categoryId: toStrOrEmpty(defaultValues?.categoryId ?? defaultValues?.productType?.categoryId ?? defaultValues?.productType?.category?.id),
      productTypeId: toStrOrEmpty(defaultValues?.productTypeId ?? defaultValues?.productType?.id),
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting: rhfSubmitting },
  } = methods;

  const busy = isSubmitting || rhfSubmitting;

  const stableDefaults = useMemo(() => ({
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    categoryId: toStrOrEmpty(defaultValues?.categoryId ?? defaultValues?.productType?.categoryId ?? defaultValues?.productType?.category?.id),
    productTypeId: toStrOrEmpty(defaultValues?.productTypeId ?? defaultValues?.productType?.id),
  }), [
    defaultValues?.name,
    defaultValues?.description,
    defaultValues?.categoryId,
    defaultValues?.productTypeId,
    defaultValues?.productType?.id,
    defaultValues?.productType?.categoryId,
    defaultValues?.productType?.category?.id,
  ]);

  useEffect(() => {
    const curr = getValues();
    if (!shallowEqual(curr, stableDefaults)) reset(stableDefaults);
  }, [stableDefaults, reset, getValues]);

  const { categories, productTypes } = useMemo(() => {
    const dd = dropdowns || {};
    const arr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

    const rawCategories = arr(dd.categories, dd.categoryList, dd.category_list, dd.data?.categories, dd.list?.categories, dd.categoriesList, dd.items?.categories);
    const rawTypes = arr(dd.productTypes, dd.productTypeList, dd.product_types, dd.types, dd.data?.productTypes, dd.list?.productTypes, dd.items?.productTypes, dd.list);

    return {
      categories: rawCategories
        .map((c) => ({
          id: c?.id ?? c?.value ?? c?.categoryId ?? c?.category_id,
          name: c?.name ?? c?.title ?? c?.label ?? c?.text ?? String(c?.id ?? c?.categoryId ?? ''),
        }))
        .filter((c) => c.id != null)
        .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''))),
      productTypes: rawTypes
        .map((t) => ({
          id: t?.id ?? t?.value ?? t?.productTypeId ?? t?.typeId ?? t?.product_type_id,
          name: t?.name ?? t?.title ?? t?.label ?? t?.text ?? String(t?.id ?? t?.productTypeId ?? ''),
          categoryId: t?.categoryId ?? t?.productCategoryId ?? t?.category_id ?? t?.catId ?? t?.category ?? null,
        }))
        .filter((t) => t.id != null)
        .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''))),
    };
  }, [dropdowns]);

  const categoryId = watch('categoryId');
  const productTypeId = watch('productTypeId');
  const nameVal = watch('name');

  const selectedCategoryId = categoryId === '' || categoryId == null ? '' : String(categoryId);
  const selectedProductTypeId = productTypeId === '' || productTypeId == null ? '' : String(productTypeId);

  const productTypesForCategory = useMemo(() => {
    if (!selectedCategoryId) return [];
    return productTypes.filter((type) => String(type.categoryId ?? '') === selectedCategoryId);
  }, [productTypes, selectedCategoryId]);

  useEffect(() => {
    if (!selectedProductTypeId || !selectedCategoryId) return;
    const ok = productTypesForCategory.some((type) => String(type.id) === selectedProductTypeId);
    if (!ok) setValue('productTypeId', '', { shouldValidate: true, shouldDirty: true });
  }, [selectedCategoryId, selectedProductTypeId, productTypesForCategory, setValue]);

  const onSubmit = async (data) => {
    await onSubmitProp({
      name: (data.name || '').trim(),
      description: (data.description || '').trim(),
      categoryId: data.categoryId === '' || data.categoryId == null ? null : Number(data.categoryId),
      productTypeId: data.productTypeId === '' || data.productTypeId == null ? null : Number(data.productTypeId),
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-4xl mx-auto">
        <div>
          <label className="block mb-1 font-medium">หมวดสินค้า * / ประเภทสินค้า *</label>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            เลือกประเภทสินค้าให้ถูกต้องก่อน แล้วค่อยสร้างโปรไฟล์เมื่อมีรูปแบบการใช้งานซ้ำจริง
          </p>

          {isDropdownLoading ? (
            <div className="mt-3 border rounded px-3 py-2 text-sm text-zinc-500 bg-zinc-50">กำลังโหลดตัวเลือก…</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="categoryId" className="block mb-1 text-sm text-zinc-700 dark:text-zinc-300">หมวดหมู่สินค้า *</label>
                <select
                  id="categoryId"
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setValue('categoryId', e.target.value, { shouldValidate: true, shouldDirty: true });
                    setValue('productTypeId', '', { shouldValidate: true, shouldDirty: true });
                  }}
                  disabled={busy}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                >
                  <option value="">-- เลือกหมวดหมู่สินค้า --</option>
                  {categories.map((category) => (
                    <option key={`category_${String(category.id)}`} value={String(category.id)}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="productTypeId" className="block mb-1 text-sm text-zinc-700 dark:text-zinc-300">ประเภทสินค้า *</label>
                <select
                  id="productTypeId"
                  value={selectedProductTypeId}
                  onChange={(e) => setValue('productTypeId', e.target.value, { shouldValidate: true, shouldDirty: true })}
                  disabled={busy || !selectedCategoryId}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                >
                  <option value="">-- เลือกประเภทสินค้า --</option>
                  {productTypesForCategory.map((type) => (
                    <option key={`type_${String(type.id)}`} value={String(type.id)}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {errors?.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
          {errors?.productTypeId && <p className="text-red-500 text-sm mt-1">{errors.productTypeId.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">ชื่อโปรไฟล์สินค้า *</label>
          <input
            type="text"
            {...methods.register('name')}
            disabled={busy}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
            placeholder="เช่น Laptop - Office, Laptop - Gaming"
          />
          {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">รายละเอียดเพิ่มเติม</label>
          <textarea
            rows={3}
            {...methods.register('description')}
            disabled={busy}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
            placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>ยกเลิก</Button>}
          <Button type="submit" disabled={busy || !selectedCategoryId || !selectedProductTypeId || !nameVal?.trim()}>
            {busy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductProfileForm;
