// src/components/shared/form/CascadingFilterGroupOnline.jsx

import { useMemo, useState } from 'react';

export default function CascadingFilterGroupOnline({
  value,
  onChange,
  dropdowns = {},  
  hiddenFields = [],
  className = '',
  placeholders = {
    category: '-- เลือกหมวดหมู่สินค้า --',
    productType: '-- เลือกประเภทสินค้า --',
    productProfile: '-- เลกลักษณะสินค้า --',
    template: '-- เลือกรูปแบบสินค้า --',
  },
  showReset = false,
  direction = 'column',
}) {
  const {
    categories = [],
    productTypes = [],
    productProfiles = [],
    templates = [],
  } = dropdowns || {}; // ✅ ปลอดภัยจาก null

  const [loading, setLoading] = useState(false);

  const filteredProductTypes = useMemo(() => {
    return value.categoryId
      ? productTypes.filter((t) => `${t.categoryId}` === `${value.categoryId}`)
      : productTypes;
  }, [productTypes, value.categoryId]);

  
  const filteredProductProfiles = useMemo(() => {
    return productProfiles.filter((p) => {
      const typeMatch = value.productTypeId
        ? `${p.productTypeId}` === `${value.productTypeId}`
        : !value.productTypeId && value.categoryId
          ? `${p.productType?.categoryId}` === `${value.categoryId}`
          : true;
      return typeMatch;
    });
  }, [productProfiles, value.categoryId, value.productTypeId]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const profile = t.productProfile;
      const type = profile?.productType;
      const categoryId = type?.categoryId;

      if (value.productProfileId) {
        return `${profile?.id}` === `${value.productProfileId}`;
      }

      if (!value.productProfileId && value.productTypeId) {
        return `${type?.id}` === `${value.productTypeId}`;
      }

      if (!value.productProfileId && !value.productTypeId && value.categoryId) {
        return `${categoryId}` === `${value.categoryId}`;
      }

      return true;
    });
  }, [templates, value]);

  const update = (field, val) => {
    setLoading(true);
    const next = { ...value, [field]: val };

    if (field === 'categoryId') {
      next.productTypeId = '';
      next.productProfileId = '';
      next.templateId = '';
    }
    if (field === 'productTypeId') {
      next.productProfileId = '';
      next.templateId = '';
    }
    if (field === 'productProfileId') {
      next.templateId = '';
    }

    onChange(value[field] === val ? { ...next } : next);
    setTimeout(() => setLoading(false), 200); // simulate slight delay for UX
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
            className="border px-3 py-2 rounded w-full text-sm"
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
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="">{placeholders.productType}</option>
            {filteredProductTypes.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredProductTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        )}

        {!hiddenFields.includes('productProfile') && (
          <select
            value={value.productProfileId || ''}
            onChange={(e) => update('productProfileId', e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="">{placeholders.productProfile}</option>
            {filteredProductProfiles.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredProductProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        )}

        {!hiddenFields.includes('template') && (
          <select
            value={value.templateId || ''}
            onChange={(e) => update('templateId', e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="">{placeholders.template}</option>
            {filteredTemplates.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
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

      {loading && (
        <div className="text-xs text-gray-500 italic">กำลังโหลด...</div>
      )}
    </div>
  );
}
