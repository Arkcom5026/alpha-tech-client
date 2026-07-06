// src/features/productType/components/ProductTypeForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { parseApiError } from '@/utils/uiHelpers';
import useProductStore from '@/features/product/store/productStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อประเภทสินค้า'),
});

const ProductTypeForm = ({
  defaultValues = {},
  onSubmit,
  onCancel,
  mode = 'create',
  isSubmitting = false,
  dropdowns = {},
}) => {
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: rhfIsSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
    },
  });

  const isBusy = isSubmitting || rhfIsSubmitting;

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        name: defaultValues?.name ?? '',
      });
    }
  }, [defaultValues, reset]);

  const { dropdowns: storeDropdowns = {}, ensureDropdownsAction } = useProductStore();

  useEffect(() => {
    const propEmpty = !Array.isArray(dropdowns?.categories) || dropdowns.categories.length === 0;
    const storeEmpty = !Array.isArray(storeDropdowns?.categories) || storeDropdowns.categories.length === 0;
    if (propEmpty && storeEmpty) {
      ensureDropdownsAction?.();
    }
  }, [dropdowns?.categories, storeDropdowns?.categories, ensureDropdownsAction]);

  const categories = useMemo(() => {
    const source = Array.isArray(dropdowns?.categories) && dropdowns.categories.length > 0
      ? dropdowns.categories
      : storeDropdowns?.categories || [];

    return source
      .filter((category) => category && category.id != null)
      .sort((a, b) => String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'th'));
  }, [dropdowns?.categories, storeDropdowns?.categories]);

  const resolvedCategoryId = useMemo(() => {
    const fromDefault = Number(defaultValues?.categoryId);
    if (Number.isFinite(fromDefault) && fromDefault > 0) return fromDefault;

    const first = Number(categories?.[0]?.id);
    return Number.isFinite(first) && first > 0 ? first : null;
  }, [defaultValues?.categoryId, categories]);

  const resolvedCategoryName = useMemo(() => {
    const found = categories.find((category) => Number(category.id) === Number(resolvedCategoryId));
    return found?.name || defaultValues?.category?.name || '-';
  }, [categories, resolvedCategoryId, defaultValues?.category?.name]);

  const handleFormSubmit = async (data) => {
    setFormError('');

    const nameOk = (data.name || '').trim().length > 0;
    if (!nameOk) {
      setFormError('กรุณากรอกชื่อประเภทสินค้า');
      return;
    }

    if (!resolvedCategoryId) {
      setFormError('ไม่พบประเภทธุรกิจของร้าน กรุณาตรวจสอบข้อมูลพื้นฐานก่อนบันทึก');
      return;
    }

    try {
      const payload = {
        name: data.name?.trim(),
        categoryId: Number(resolvedCategoryId),
      };
      await onSubmit(payload);
    } catch (err) {
      setFormError(parseApiError(err) || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    }
  };

  const nameVal = watch('name');
  const effectiveOnCancel = onCancel ?? (() => navigate(-1));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {formError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {formError}
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">ประเภทธุรกิจของร้าน</div>
        <div className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-100">{resolvedCategoryName}</div>
      </div>

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
        <Button type="submit" disabled={isBusy || !nameVal?.trim() || !resolvedCategoryId}>
          {isBusy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
};

export default ProductTypeForm;
