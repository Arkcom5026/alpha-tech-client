
// ✅ src/features/productTemplate/components/ProductTemplateForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import useUnitStore from '@/features/unit/store/unitStore';
import useProductStore from '@/features/product/store/productStore';
import CascadingDropdowns from '@/components/shared/form/CascadingDropdowns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProductTemplateForm = ({ defaultValues = {}, onSubmit, mode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { units, fetchUnits } = useUnitStore();
  const { dropdowns, dropdownsLoaded, ensureDropdownsAction } = useProductStore();

  const toNumOrEmpty = (v) => (v === undefined || v === null || v === '' ? '' : Number(v));

  const formMethods = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      spec: defaultValues?.spec ?? '',
      warranty: defaultValues?.warranty ?? '',
      noSN: defaultValues?.noSN ?? false,
      codeType: defaultValues?.codeType ?? 'D',
      unitId: toNumOrEmpty(defaultValues?.unitId),
      categoryId: toNumOrEmpty(
        defaultValues?.categoryId ??
        defaultValues?.productType?.categoryId ??
        defaultValues?.productType?.category?.id
      ),
      productTypeId: toNumOrEmpty(
        defaultValues?.productTypeId ??
        defaultValues?.productType?.id
      ),
      productProfileId: toNumOrEmpty(
        defaultValues?.productProfileId ??
        defaultValues?.productProfile?.id
      ),
    },
  });

  const { watch, register, formState: { isSubmitting: rhfIsSubmitting } } = formMethods;

  const navigate = useNavigate();
  const isBusy = isSubmitting || rhfIsSubmitting;

  // watch cascading values
  const categoryId = watch('categoryId');
  const productTypeId = watch('productTypeId');
  const productProfileId = watch('productProfileId');

  useEffect(() => {
    if (!Array.isArray(units) || units.length === 0) {
      fetchUnits?.();
    }
    ensureDropdownsAction?.();
  }, [fetchUnits, ensureDropdownsAction, units]);

  const handleFormSubmit = async (formData) => {
    if (isSubmitting) return;

    const catOk = formData.categoryId !== '' && formData.categoryId != null;
    const typeOk = formData.productTypeId !== '' && formData.productTypeId != null;
    const profileOk = formData.productProfileId !== '' && formData.productProfileId != null;
    if (mode !== 'edit' && (!catOk || !typeOk || !profileOk)) {
      setFormError('กรุณาเลือก หมวดสินค้า → ประเภทสินค้า → รุ่นสินค้า ให้ครบก่อนบันทึก');
      return;
    }
    setFormError('');

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId === '' ? null : Number(formData.categoryId),
        productTypeId: formData.productTypeId === '' ? null : Number(formData.productTypeId),
        productProfileId: formData.productProfileId === '' ? null : Number(formData.productProfileId),
        unitId: formData.unitId === '' ? null : Number(formData.unitId),
        name: (formData.name || '').trim(),
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    !units || units.length === 0 ||
    !dropdowns ||
    !dropdowns.categories ||
    !dropdowns.productTypes ||
    !(dropdowns.productProfiles || dropdowns.profiles)
  ) {
    return <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" aria-live="assertive">
            {formError}
          </div>
        ) : null}
        {/* ⬆️ CascadingDropdowns สำหรับเลือก หมวดสินค้า → ประเภทสินค้า → รุ่นสินค้า */}
        <div className="grid grid-cols-1 gap-6 ">
          <CascadingDropdowns
            dropdowns={dropdowns}
            hiddenFields={['template']}
            isLoading={!dropdownsLoaded}
            selectClassName="min-w-[14rem]"
            containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            value={{
              categoryId: categoryId ?? '',
              productTypeId: productTypeId ?? '',
              productProfileId: productProfileId ?? '',
            }}
            onChange={(v) => {
              if (Object.prototype.hasOwnProperty.call(v, 'categoryId')) {
                formMethods.setValue('categoryId', v.categoryId ?? '', { shouldValidate: true, shouldDirty: true });
              }
              if (Object.prototype.hasOwnProperty.call(v, 'productTypeId')) {
                formMethods.setValue('productTypeId', v.productTypeId ?? '', { shouldValidate: true, shouldDirty: true });
              }
              if (Object.prototype.hasOwnProperty.call(v, 'productProfileId')) {
                formMethods.setValue('productProfileId', v.productProfileId ?? '', { shouldValidate: true, shouldDirty: true });
              }
            }}
          />
        </div>

        {/* ⬇️ Form ด้านล่าง */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="font-medium block mb-1">ชื่อสเปกสินค้า (SKU)</label>
            <p className="text-xs text-zinc-500 mb-2">สเปกสินค้า (SKU) = ตัวเลือกย่อยของรุ่นที่แยกราคา/สต๊อก เช่น 4GB/64GB, 4GB/128GB</p>
            <input
              {...register('name')}
              disabled={isBusy}
              className="input w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
              placeholder="เช่น 4GB/64GB"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">หน่วย</label>
            <select
              {...register('unitId')}
              disabled={isBusy}
              className="form-select w-full border px-3 py-2 rounded mb-4"
            >
              <option value="">-- เลือกหน่วยนับ --</option>
              {units.map((u) => (
                <option key={u.id} value={String(u.id)}>{u.name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isBusy}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isBusy || (mode !== 'edit' && (!categoryId || !productTypeId || !productProfileId))}>
                {isBusy ? 'กำลังบันทึก…' : (mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก')}
              </Button>
            </div>
          </div>
        </div>

        <input type="hidden" {...formMethods.register('categoryId')} />
        <input type="hidden" {...formMethods.register('productTypeId')} />
        <input type="hidden" {...formMethods.register('productProfileId')} />
      </form>
    </FormProvider>
  );
};

export default ProductTemplateForm;


