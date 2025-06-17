// src/components/shared/form/CascadingFilterGroupOnline.jsx

import { useMemo } from 'react';

export default function CascadingFilterGroupOnline({
  value,
  onChange,
  dropdowns = {},
  hiddenFields = [],
  className = '',
  placeholders = {
    category: '-- เลือกหมวดหมู่สินค้า --',
    productType: '-- เลือกประเภทสินค้า --',
    productProfile: '-- เลือกลักษณะสินค้า --',
    template: '-- เลือกรูปแบบสินค้า --',
  },
  showReset = false,
  direction = 'column',
}) {
  const { categories = [], productTypes = [], productProfiles = [], templates = [] } = dropdowns;

  const filteredProductTypes = useMemo(
    () => value.categoryId
      ? productTypes.filter((t) => `${t.categoryId}` === `${value.categoryId}`)
      : productTypes,
    [productTypes, value.categoryId]
  );

  const filteredProductProfiles = useMemo(
    () => {
      if (value.categoryId && value.productTypeId) {
        return productProfiles.filter((p) =>
          `${p.productTypeId}` === `${value.productTypeId}` &&
          `${p.productType?.categoryId}` === `${value.categoryId}`
        );
      }
      if (value.productTypeId) {
        return productProfiles.filter((p) =>
          `${p.productTypeId}` === `${value.productTypeId}`
        );
      }
      return productProfiles;
    },
    [productProfiles, value.categoryId, value.productTypeId]
  );

  const filteredTemplates = useMemo(
    () => value.productProfileId
      ? templates.filter((t) => `${t.productProfileId}` === `${value.productProfileId}`)
      : templates,
    [templates, value.productProfileId]
  );

  const update = (field, val) => {
    const next = { ...value, [field]: val };
    if (field === 'categoryId') {
      next.productTypeId = '';
      next.productProfileId = '';
      next.templateId = '';
    } else if (field === 'productTypeId') {
      next.productProfileId = '';
      next.templateId = '';
    } else if (field === 'productProfileId') {
      next.templateId = '';
    }
    onChange(next);
  };

  const handleReset = () => {
    onChange({
      categoryId: '',
      productTypeId: '',
      productProfileId: '',
      templateId: '',
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={direction === 'column' ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}>
        {!hiddenFields.includes('category') && (
          <select
            value={value.categoryId || ''}
            onChange={(e) => update('categoryId', e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">{placeholders.category}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}

        {!hiddenFields.includes('productType') && (
          <select
            value={value.productTypeId || ''}
            onChange={(e) => update('productTypeId', e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">{placeholders.productType}</option>
            {filteredProductTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        )}

        {!hiddenFields.includes('productProfile') && (
          <select
            value={value.productProfileId || ''}
            onChange={(e) => update('productProfileId', e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">{placeholders.productProfile}</option>
            {filteredProductProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        )}

        {!hiddenFields.includes('template') && (
          <select
            value={value.templateId || ''}
            onChange={(e) => update('templateId', e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">{placeholders.template}</option>
            {filteredTemplates.map((temp) => (
              <option key={temp.id} value={temp.id}>{temp.name}</option>
            ))}
          </select>
        )}
      </div>

      {showReset && (
        <div className="text-right">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:underline"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}


