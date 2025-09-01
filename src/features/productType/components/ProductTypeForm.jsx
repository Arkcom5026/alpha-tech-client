

// ✅ src/features/productType/components/ProductTypeForm.jsx (updated to use CascadingFilterGroup)
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// มาตรฐานระบบ:
// - ไม่ยิง API จากฟอร์มซ้ำ ใช้ dropdowns ที่เพจ/สโตร์โหลดมาแล้ว
// - ใช้ CascadingFilterGroup เพื่อเลือกเฉพาะ "หมวดหมู่" (ซ่อนระดับอื่น)
// - ครอบ try...catch และแสดงข้อความ error บนหน้าเพจ

import { parseApiError } from '@/utils/uiHelpers';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';
import useProductStore from '@/features/product/store/productStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// ใช้ coerce เพื่อแปลงค่าจาก <select> เป็น number อัตโนมัติ
const schema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อประเภทสินค้า'),
  categoryId: z.coerce.number({ required_error: 'กรุณาเลือกหมวดหมู่สินค้า' })
    .int('หมวดหมู่ไม่ถูกต้อง')
    .positive('หมวดหมู่ไม่ถูกต้อง'),
});

/**
 * @param {{
 *  defaultValues?: { name?: string; categoryId?: number | '' },
 *  onSubmit: (payload: { name: string; categoryId: number }) => Promise<any> | any,
 *  mode?: 'create'|'edit',
 *  isSubmitting?: boolean,
 *  dropdowns: { categories?: any[]; productTypes?: any[]; profiles?: any[]; productProfiles?: any[]; templates?: any[]; },
 * }} props
 */
const ProductTypeForm = ({ defaultValues = {}, onSubmit, onCancel, mode = 'create', isSubmitting = false, dropdowns = {} }) => {
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: rhfIsSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      categoryId: defaultValues?.categoryId ?? '', // จะถูก coerce เป็น number ตอน validate
    },
  });

  const isBusy = isSubmitting || rhfIsSubmitting;

  // อัปเดตค่าเมื่อ defaultValues เปลี่ยน (เช่นกรณีแก้ไข)
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        name: defaultValues?.name ?? '',
        categoryId: defaultValues?.categoryId ?? '',
      });
    }
  }, [defaultValues, reset]);

  // ✅ Fallback: โหลดหมวดหมู่จาก store หาก parent ไม่ได้ส่งมาหรือยังว่าง
  const { dropdowns: storeDropdowns = {}, dropdownsLoaded, ensureDropdownsAction } = useProductStore();

  useEffect(() => {
    const propEmpty = !Array.isArray(dropdowns?.categories) || dropdowns.categories.length === 0;
    const storeEmpty = !Array.isArray(storeDropdowns?.categories) || storeDropdowns.categories.length === 0;
    if (propEmpty && storeEmpty) {
      ensureDropdownsAction?.();
    }
  }, [dropdowns?.categories, storeDropdowns?.categories, ensureDropdownsAction]);

  const categoriesSrc = (Array.isArray(dropdowns?.categories) && dropdowns.categories.length > 0)
    ? dropdowns.categories
    : (storeDropdowns?.categories || []);

  const handleFormSubmit = async (data) => {
    setFormError('');

    // ✅ Pre-check แบบเดียวกับ ProductTemplateForm
    const nameOk = (data.name || '').trim().length > 0;
    const catOk = data.categoryId !== '' && data.categoryId != null;
    if (mode !== 'edit' && (!catOk || !nameOk)) {
      alert('กรุณาเลือกหมวดหมู่และกรอกชื่อให้ครบก่อนบันทึก');
      return;
    }
    try {
      const payload = {
        name: data.name?.trim(),
        categoryId: Number(data.categoryId),
      };
      await onSubmit(payload);
    } catch (err) {
      setFormError(parseApiError(err) || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    }
  };

  // hook form state สำหรับ binding กับ Cascading
  const categoryId = watch('categoryId');
  const nameVal = watch('name');

  const effectiveOnCancel = onCancel ?? (() => navigate(-1));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Error Block (no dialogs) */}
      {formError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {formError}
        </div>
      )}

      {/* หมวดหมู่สินค้า: ใช้ CascadingFilterGroup แต่ซ่อนระดับอื่นทั้งหมด */}
      <div>
        <label className="block mb-1 text-sm text-zinc-700 dark:text-zinc-300">หมวดหมู่สินค้า *</label>
        <CascadingDropdowns
          dropdowns={{ categories: categoriesSrc }}
          hiddenFields={['type', 'profile', 'template']}
          value={{ categoryId: categoryId ?? '' }}
          isLoading={!dropdownsLoaded}
          onChange={(v) => setValue('categoryId', v.categoryId ?? '', { shouldValidate: true })}
        />
        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
      </div>


      {/* ชื่อประเภทสินค้า */}
      <div>
        <label className="block mb-1 text-sm text-zinc-700 dark:text-zinc-300">ชื่อประเภทสินค้า *</label>
        <input
          type="text"
          {...register('name')}
          className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
          disabled={isBusy}
          placeholder="เช่น อะแดปเตอร์มือถือ"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>


      <div className="flex justify-end gap-2 pt-2">
        {effectiveOnCancel && (
          <Button type="button" variant="outline" onClick={effectiveOnCancel} disabled={isBusy}>
            ยกเลิก
          </Button>
        )}
        <Button type="submit" disabled={isBusy || !nameVal?.trim() || categoryId === '' || categoryId == null}>
          {isBusy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
};

export default ProductTypeForm;



