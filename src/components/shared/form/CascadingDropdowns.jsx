// ✅ src/components/shared/form/CascadingDropdowns.jsx

import { useFormContext } from 'react-hook-form';
import { useEffect, useRef } from 'react';

export default function CascadingDropdowns({ dropdowns, errors, defaultValues }) {
  const { watch, setValue } = useFormContext();

  const categoryId = watch('categoryId') || '';
  const productTypeId = watch('productTypeId') || '';
  const productProfileId = watch('productProfileId') || '';
  const templateId = watch('templateId') || '';

  const filteredProductTypes = dropdowns.productTypes?.filter(
    (type) => String(type.categoryId) === String(categoryId)
  );

  const filteredProfiles = dropdowns.productProfiles?.filter(
    (pf) => String(pf.productTypeId) === String(productTypeId)
  );

  const filteredTemplates = dropdowns.templates?.filter(
    (tpl) => String(tpl.productProfileId) === String(productProfileId)
  );

  const loadedRef = useRef(false);

  useEffect(() => {
    if (
      dropdowns &&
      dropdowns.templates?.length > 0 &&
      !loadedRef.current &&
      templateId === '' &&
      defaultValues?.templateId
    ) {
      setValue('categoryId', String(defaultValues.categoryId));
      setValue('productTypeId', String(defaultValues.productTypeId));
      setValue('productProfileId', String(defaultValues.productProfileId));
      setValue('templateId', String(defaultValues.templateId));
      loadedRef.current = true;
    }
  }, [dropdowns, defaultValues]);

  return (
    <>
      {/* หมวดหมู่สินค้า */}
      <div>
        <label className="block font-medium mb-1">หมวดหมู่สินค้า</label>
        <select
          value={categoryId}
          onChange={(e) => {
            const newVal = e.target.value;
            setValue('categoryId', newVal);
            setValue('productTypeId', '');
            setValue('productProfileId', '');
            setValue('templateId', '');
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">-- เลือกหมวดหมู่สินค้า --</option>
          {dropdowns.categories?.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
      </div>

      {/* ประเภทสินค้า */}
      <div>
        <label className="block font-medium mb-1">ประเภทสินค้า</label>
        <select
          value={productTypeId}
          onChange={(e) => {
            const newVal = e.target.value;
            setValue('productTypeId', newVal);
            setValue('productProfileId', '');
            setValue('templateId', '');
          }}
          disabled={!categoryId || filteredProductTypes.length === 0}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกประเภทสินค้า --</option>
          {filteredProductTypes.map((type) => (
            <option key={type.id} value={String(type.id)}>{type.name}</option>
          ))}
        </select>
        {errors.productTypeId && <p className="text-red-500 text-sm">{errors.productTypeId.message}</p>}
      </div>

      {/* ลักษณะสินค้า */}
      <div>
        <label className="block font-medium mb-1">ลักษณะสินค้า</label>
        <select
          value={productProfileId}
          onChange={(e) => {
            const newVal = e.target.value;
            setValue('productProfileId', newVal);
            setValue('templateId', '');
          }}
          disabled={!productTypeId || filteredProfiles.length === 0}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกลักษณะสินค้า --</option>
          {filteredProfiles.map((pf) => (
            <option key={pf.id} value={String(pf.id)}>{pf.name}</option>
          ))}
        </select>
        {errors.productProfileId && <p className="text-red-500 text-sm">{errors.productProfileId.message}</p>}
      </div>

      {/* สินค้า */}
      <div>
        <label className="block font-medium mb-1">รูปแบบสินค้า</label>
        <select
          value={templateId}
          onChange={(e) => {
            const newVal = e.target.value;
            setValue('templateId', newVal);
          }}
          disabled={!productProfileId || filteredTemplates.length === 0}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกรูปแบบสินค้า --</option>
          {filteredTemplates.map((tpl) => (
            <option key={tpl.id} value={String(tpl.id)}>{tpl.name}</option>
          ))}
        </select>
        {errors.templateId && <p className="text-red-500 text-sm">{errors.templateId.message}</p>}
      </div>
    </>
  );
}
