// src/components/shared/form/CascadingDropdownGroup.jsx

import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

export default function CascadingDropdownGroup({
  control,
  register,
  errors,
  setValue,
  dropdowns,
  isEditMode = false,
  onSelectionChange = () => {},
}) {
  const categoryId = useWatch({ control, name: 'categoryId' });
  const productTypeId = useWatch({ control, name: 'productTypeId' });
  const productProfileId = useWatch({ control, name: 'productProfileId' });

  const filteredProductTypes = (dropdowns.productTypes || []).filter(
    (type) => type.categoryId === Number(categoryId)
  );

  const filteredProductProfiles = (dropdowns.productProfiles || []).filter(
    (profile) => profile.productTypeId === Number(productTypeId)
  );

  const filteredTemplates = (dropdowns.templates || []).filter(
    (template) => template.productProfileId === Number(productProfileId)
  );

  useEffect(() => {
    onSelectionChange({ categoryId });
    if (!isEditMode) {
      setValue('productTypeId', '');
      setValue('productProfileId', '');
      setValue('templateId', '');
    }
  }, [categoryId, isEditMode, setValue, onSelectionChange]);

  useEffect(() => {
    onSelectionChange({ productTypeId });
    if (!isEditMode) {
      setValue('productProfileId', '');
      setValue('templateId', '');
    }
  }, [productTypeId, isEditMode, setValue, onSelectionChange]);

  useEffect(() => {
    onSelectionChange({ productProfileId });
  }, [productProfileId, onSelectionChange]);

  return (
    <>
      <div>
        <label className="block font-medium mb-1">หมวดหมู่สินค้า</label>
        <select
          {...register('categoryId', { required: 'กรุณาเลือกหมวดหมู่สินค้า' })}
          className="w-full p-2 border rounded"
        >
          <option value="">-- เลือกหมวดหมู่สินค้า --</option>
          {(dropdowns.categories || []).map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">ประเภทสินค้า</label>
        <select
          {...register('productTypeId', { required: 'กรุณาเลือกประเภทสินค้า' })}
          disabled={!categoryId}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกประเภทสินค้า --</option>
          {filteredProductTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {errors.productTypeId && <p className="text-red-500 text-sm">{errors.productTypeId.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">ลักษณะสินค้า</label>
        <select
          {...register('productProfileId', { required: 'กรุณาเลือกลักษณะสินค้า' })}
          disabled={!productTypeId}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกลักษณะสินค้า --</option>
          {filteredProductProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          ))}
        </select>
        {errors.productProfileId && <p className="text-red-500 text-sm">{errors.productProfileId.message}</p>}
      </div>

      <div>
        <label className="block font-medium mb-1">รูปแบบสินค้า</label>
        <select
          {...register('templateId', { required: 'กรุณาเลือกรูปแบบสินค้า' })}
          disabled={!productProfileId}
          className="w-full p-2 border rounded bg-gray-100 disabled:opacity-70"
        >
          <option value="">-- เลือกรูปแบบสินค้า --</option>
          {filteredTemplates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        {errors.templateId && <p className="text-red-500 text-sm">{errors.templateId.message}</p>}
      </div>
    </>
  );
}