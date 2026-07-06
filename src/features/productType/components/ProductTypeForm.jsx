// src/features/productType/components/ProductTypeForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { parseApiError } from '@/utils/uiHelpers';
import { getGlobalProductTypeOptions } from '../api/productTypeApi';
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
}) => {
  const [formError, setFormError] = useState('');
  const [templateMode, setTemplateMode] = useState('manual'); // manual | template
  const [branchCategory, setBranchCategory] = useState(defaultValues?.category || null);
  const [globalOptions, setGlobalOptions] = useState([]);
  const [globalOptionsLoading, setGlobalOptionsLoading] = useState(false);
  const [selectedGlobalProductTypeId, setSelectedGlobalProductTypeId] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: rhfIsSubmitting },
    reset,
    watch,
    setValue,
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
      if (defaultValues?.category) setBranchCategory(defaultValues.category);
      if (defaultValues?.globalProductTypeId) setSelectedGlobalProductTypeId(String(defaultValues.globalProductTypeId));
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    let alive = true;

    const loadGlobalOptions = async () => {
      setGlobalOptionsLoading(true);
      setFormError('');
      try {
        const payload = await getGlobalProductTypeOptions();
        if (!alive) return;
        setBranchCategory(payload?.category || null);
        setGlobalOptions(Array.isArray(payload?.items) ? payload.items : []);
      } catch (err) {
        if (!alive) return;
        setFormError(parseApiError(err)?.message || 'ไม่สามารถโหลด Template ประเภทสินค้าได้');
      } finally {
        if (alive) setGlobalOptionsLoading(false);
      }
    };

    loadGlobalOptions();

    return () => {
      alive = false;
    };
  }, []);

  const resolvedCategoryId = useMemo(() => {
    const fromDefault = Number(defaultValues?.categoryId);
    if (Number.isFinite(fromDefault) && fromDefault > 0) return fromDefault;

    const fromBranch = Number(branchCategory?.id);
    return Number.isFinite(fromBranch) && fromBranch > 0 ? fromBranch : null;
  }, [defaultValues?.categoryId, branchCategory?.id]);

  const resolvedCategoryName = branchCategory?.name || defaultValues?.category?.name || '-';

  const selectedGlobalOption = useMemo(() => {
    const id = Number(selectedGlobalProductTypeId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return globalOptions.find((item) => Number(item.id) === id) || null;
  }, [globalOptions, selectedGlobalProductTypeId]);

  const templateCountLabel = globalOptionsLoading
    ? 'กำลังโหลด Template...'
    : `Template ประเภทสินค้า (${globalOptions.length} รายการ)`;

  const handleTemplateModeChange = (nextMode) => {
    setTemplateMode(nextMode);
    setFormError('');

    if (nextMode === 'manual') {
      setSelectedGlobalProductTypeId('');
    }
  };

  const handleTemplateChange = (event) => {
    const value = event.target.value;
    setSelectedGlobalProductTypeId(value);
    setFormError('');

    const selected = globalOptions.find((item) => String(item.id) === String(value));
    if (selected?.name) {
      setValue('name', selected.name, { shouldDirty: true, shouldValidate: true });
    }
  };

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

    if (templateMode === 'template' && !selectedGlobalOption?.id) {
      setFormError('กรุณาเลือก Template ประเภทสินค้า');
      return;
    }

    try {
      const payload = {
        name: data.name?.trim(),
        categoryId: Number(resolvedCategoryId),
        ...(templateMode === 'template' && selectedGlobalOption?.id
          ? { globalProductTypeId: Number(selectedGlobalOption.id) }
          : {}),
      };
      await onSubmit(payload);
    } catch (err) {
      setFormError(parseApiError(err)?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
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
        <div className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-100">{globalOptionsLoading ? 'กำลังโหลด...' : resolvedCategoryName}</div>
      </div>

      {mode === 'create' && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">วิธีเพิ่มประเภทสินค้า</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleTemplateModeChange('manual')}
              disabled={isBusy}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                templateMode === 'manual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="font-medium">สร้างเอง</div>
              <div className="mt-0.5 text-xs opacity-75">ร้านกำหนดชื่อประเภทสินค้าเอง</div>
            </button>

            <button
              type="button"
              onClick={() => handleTemplateModeChange('template')}
              disabled={isBusy}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                templateMode === 'template'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="font-medium">นำเข้าจาก Template</div>
              <div className="mt-0.5 text-xs opacity-75">อ้างอิง GlobalProductType แล้วสร้างเป็นของร้านนี้</div>
            </button>
          </div>
        </div>
      )}

      {templateMode === 'template' && mode === 'create' && (
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Template ประเภทสินค้า *</label>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{templateCountLabel}</span>
          </div>
          <select
            value={selectedGlobalProductTypeId}
            onChange={handleTemplateChange}
            disabled={isBusy || globalOptionsLoading}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
          >
            <option value="">-- เลือก Template ประเภทสินค้า --</option>
            {globalOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {selectedGlobalOption?.name && (
            <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
              จะสร้าง ProductType ของร้านนี้โดยอ้างอิง Template: <span className="font-semibold">{selectedGlobalOption.name}</span>
              <br />ชื่อด้านล่างสามารถแก้ไขให้เหมาะกับร้านนี้ได้ก่อนบันทึก
            </div>
          )}
          {!globalOptionsLoading && globalOptions.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">ยังไม่มี Template ประเภทสินค้าสำหรับประเภทธุรกิจนี้</p>
          )}
        </div>
      )}

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
        <Button
          type="submit"
          disabled={isBusy || globalOptionsLoading || !nameVal?.trim() || !resolvedCategoryId || (templateMode === 'template' && !selectedGlobalOption?.id)}
        >
          {isBusy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
        </Button>
      </div>
    </form>
  );
};

export default ProductTypeForm;