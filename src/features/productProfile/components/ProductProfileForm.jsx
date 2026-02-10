const toStrOrEmpty = (v) => (v === undefined || v === null || v === '' ? '' : String(v));
// ✅ src/features/productProfile/components/ProductProfileForm.jsx — standard form with CascadingDropdowns (loop-safe)
import React, { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productProfileSchema } from '../schema/productProfileSchema';
import { Button } from '@/components/ui/button';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';

// —— helpers ——
const shallowEqual = (a, b) => {
  const ka = Object.keys(a || {});
  const kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
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
      categoryId: toStrOrEmpty(
      defaultValues?.categoryId ??
      defaultValues?.productType?.categoryId ??
      defaultValues?.productType?.category?.id
    ),
      productTypeId: toStrOrEmpty(
      defaultValues?.productTypeId ??
      defaultValues?.productType?.id
    ),
    },
  });

  const { handleSubmit, reset, setValue, watch, getValues, formState: { errors, isSubmitting: rhfSubmitting } } = methods;
  const busy = isSubmitting || rhfSubmitting;

  // ⚠️ Guarded reset: recalc only when primitive fields actually change
  const stableDefaults = useMemo(() => ({
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    categoryId: toStrOrEmpty(
    defaultValues?.categoryId ??
    defaultValues?.productType?.categoryId ??
    defaultValues?.productType?.category?.id
  ),
    productTypeId: toStrOrEmpty(
    defaultValues?.productTypeId ??
    defaultValues?.productType?.id
  ),
  }), [
    defaultValues?.name,
    defaultValues?.description,
    // ⚠️ ครอบคลุมทุก field ที่ใช้คำนวณ categoryId / productTypeId เพื่อให้ reset นิ่งเวลา edit
    defaultValues?.categoryId,
    defaultValues?.productTypeId,
    defaultValues?.productType?.id,
    defaultValues?.productType?.categoryId,
    defaultValues?.productType?.category?.id,
  ]);

  useEffect(() => {
    const curr = getValues();
    if (!shallowEqual(curr, stableDefaults)) {
      reset(stableDefaults);
    }
  }, [stableDefaults, reset, getValues]);

  // dropdowns memo — normalize many possible shapes from store
  const cascaded = useMemo(() => {
    const dd = dropdowns || {};
    const arr = (...xs) => xs.find((x) => Array.isArray(x)) || [];

    // pick candidates in case store uses different keys
    const rawCategories = arr(
      dd.categories,
      dd.categoryList,
      dd.category_list,
      dd.data?.categories,
      dd.list?.categories,
      dd.categoriesList,
      dd.items?.categories,
    );
    const rawTypes = arr(
      dd.productTypes,
      dd.productTypeList,
      dd.product_types,
      dd.types,
      dd.data?.productTypes,
      dd.list?.productTypes,
      dd.items?.productTypes,
      dd.list,
    );

    const categories = rawCategories
      .map((c) => ({
        id: c?.id ?? c?.value ?? c?.categoryId ?? c?.category_id,
        name: c?.name ?? c?.title ?? c?.label ?? c?.text ?? String(c?.id ?? c?.categoryId ?? ''),
      }))
      .filter((c) => c.id != null);

    const productTypes = rawTypes
      .map((t) => ({
        id: t?.id ?? t?.value ?? t?.productTypeId ?? t?.typeId ?? t?.product_type_id,
        name: t?.name ?? t?.title ?? t?.label ?? t?.text ?? String(t?.id ?? t?.productTypeId ?? ''),
        categoryId: t?.categoryId ?? t?.productCategoryId ?? t?.category_id ?? t?.catId ?? t?.category ?? null,
      }))
      .filter((t) => t.id != null);

    return { categories, productTypes };
  }, [dropdowns]);

  const categoryId = watch('categoryId');
  const productTypeId = watch('productTypeId');
  const nameVal = watch('name');

  const cascadeValue = useMemo(() => ({
    categoryId: categoryId === '' ? null : Number(categoryId),
    productTypeId: productTypeId === '' ? null : Number(productTypeId),
  }), [categoryId, productTypeId]);

  const onSubmit = async (data) => {
    const payload = {
      name: (data.name || '').trim(),
      description: (data.description || '').trim(),
      // ✅ กัน Number('') เป็น NaN (แม้ UI จะกันไว้แล้ว แต่ทำให้ BE สะอาดและปลอดภัยขึ้น)
      categoryId: data.categoryId === '' || data.categoryId == null ? null : Number(data.categoryId),
      productTypeId: data.productTypeId === '' || data.productTypeId == null ? null : Number(data.productTypeId),
    };
    await onSubmitProp(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-4xl mx-auto">

        {/* cascading dropdowns */}
        <div>
          <label className="block mb-1 font-medium">หมวดสินค้า * / ประเภทสินค้า *</label>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            เลือกประเภทสินค้าให้ถูกต้องก่อน แล้วค่อยสร้างโปรไฟล์เมื่อมีรูปแบบการใช้งาน <span className="font-medium">ซ้ำจริง</span> (โปรไฟล์ไม่ใช่แบรนด์ และไม่จำเป็นต้องมีทุกสินค้า)
          </p>
          {(!isDropdownLoading && (cascaded?.categories?.length || 0) > 0) ? (
            <CascadingDropdowns
              dropdowns={cascaded}
              hiddenFields={['profile', 'template']}
              value={cascadeValue}
              isLoading={isDropdownLoading}
              selectClassName="min-w-[14rem]"
              containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
              onChange={(v) => {
                if (Object.prototype.hasOwnProperty.call(v, 'categoryId')) {
                  const nextRaw = v.categoryId ?? '';
                  const next = (nextRaw === '' || nextRaw == null) ? '' : String(nextRaw);
                  if (next !== getValues('categoryId')) {
                    setValue('categoryId', next, { shouldValidate: true, shouldDirty: true });
                  }
                }
                if (Object.prototype.hasOwnProperty.call(v, 'productTypeId')) {
                  const nextRaw = v.productTypeId ?? '';
                  const next = (nextRaw === '' || nextRaw == null) ? '' : String(nextRaw);
                  if (next !== getValues('productTypeId')) {
                    setValue('productTypeId', next, { shouldValidate: true, shouldDirty: true });
                  }
                }
              }}
            />
          ) : (
            <div className="border rounded px-3 py-2 text-sm text-zinc-500 bg-zinc-50">กำลังโหลดตัวเลือก…</div>
          )}
          {errors?.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
          {errors?.productTypeId && <p className="text-red-500 text-sm mt-1">{errors.productTypeId.message}</p>}
        </div>

        {/* profile name */}
        <div>
          <label className="block mb-1 font-medium">ชื่อโปรไฟล์สินค้า *</label>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            ตั้งชื่อให้สื่อ “กลุ่มมาตรฐานภายในประเภทสินค้า” เช่น Office / Gaming / Heavy-Duty เพื่อใช้ซ้ำได้ในอนาคต
          </p>
          <input
            type="text"
            {...methods.register('name')}
            disabled={busy}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
            placeholder="เช่น Laptop - Office, Laptop - Gaming, ปริ้นเตอร์ - Inkjet, ปริ้นเตอร์ - Laser"
          />
          {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* description */}
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>ยกเลิก</Button>
          )}
          <Button type="submit" disabled={busy || !cascadeValue.categoryId || !cascadeValue.productTypeId || !nameVal?.trim()}>
            {busy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductProfileForm;


