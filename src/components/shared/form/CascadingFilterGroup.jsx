

// ✅ src/components/shared/form/CascadingFilterGroup.jsx

import { useMemo } from 'react';

export default function CascadingFilterGroup({
  value = {},
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
  direction = 'row',
  showSearch = false,
  searchText = '',
  onSearchTextChange = () => {},
  onSearchCommit = () => {},
}) {
  const {
    categories = [],
    productTypes = [],
    productProfiles: productProfilesRaw = [],
    profiles: profilesAlt = [],
    templates: templatesRaw = [],
    productTemplates: productTemplatesAlt = [],
  } = dropdowns || {};

  const productProfiles = useMemo(() => {
    if (Array.isArray(productProfilesRaw) && productProfilesRaw.length > 0) return productProfilesRaw;
    return Array.isArray(profilesAlt) ? profilesAlt : [];
  }, [productProfilesRaw, profilesAlt]);

  const templates = useMemo(() => {
    if (Array.isArray(templatesRaw) && templatesRaw.length > 0) return templatesRaw;
    return Array.isArray(productTemplatesAlt) ? productTemplatesAlt : [];
  }, [templatesRaw, productTemplatesAlt]);

  const toNumOrEmpty = (v) => (v === '' || v === null || v === undefined ? '' : Number(v));

  // helper: get category id from productType (supports nested shapes)
  const getCatIdOfType = (t) => t?.categoryId ?? t?.category?.id ?? t?.category_id;

  const categoryId = value.categoryId === '' || value.categoryId == null ? '' : Number(value.categoryId);
  const productTypeId = value.productTypeId === '' || value.productTypeId == null ? '' : Number(value.productTypeId);
  const productProfileId = value.productProfileId === '' || value.productProfileId == null ? '' : Number(value.productProfileId);
  const productTemplateId = value.productTemplateId === '' || value.productTemplateId == null ? '' : Number(value.productTemplateId);

  // ----- Filters (ผ่อนคลายสำหรับแผงค้นหา) -----
  const filteredProductTypes = useMemo(() => {
    if (!Array.isArray(productTypes)) return [];
    // ยืดหยุ่น: ถ้ายังไม่เลือกหมวด ให้แสดงทุกประเภท
    if (categoryId === '') return productTypes;
    return productTypes.filter((t) => Number(getCatIdOfType(t)) === Number(categoryId));
  }, [productTypes, categoryId]);

  const filteredProductProfiles = useMemo(() => {
    if (!Array.isArray(productProfiles)) return [];
    // ยืดหยุ่น: ถ้ายังไม่เลือกประเภท ให้แสดงทั้งหมด หรือถ้าเลือกหมวดแล้วแต่ยังไม่เลือกประเภท ให้กรองตามประเภทที่อยู่ในหมวดนั้น
    if (productTypeId === '') {
      if (categoryId === '' || !Array.isArray(productTypes)) return productProfiles;
      const allowedTypeIds = new Set((productTypes || [])
        .filter((t) => Number(getCatIdOfType(t)) === Number(categoryId))
        .map((t) => Number(t.id))
      );
      return productProfiles.filter((p) => allowedTypeIds.has(Number(p.productTypeId ?? p.productType?.id)));
    }
    return productProfiles.filter((p) => Number(p.productTypeId ?? p.productType?.id) === Number(productTypeId));
  }, [productProfiles, productTypes, categoryId, productTypeId]);

  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return [];
    // ยืดหยุ่น: ลอจิกกรองตามลำดับที่เลือกไว้ ถ้าไม่เลือกอะไรเลย แสดงทั้งหมด
    if (productProfileId !== '') {
      return templates.filter((t) => Number(t.productProfile?.id ?? t.productProfileId) === Number(productProfileId));
    }
    if (productTypeId !== '') {
      return templates.filter((t) => Number(t.productType?.id ?? t.productTypeId) === Number(productTypeId));
    }
    if (categoryId !== '' && Array.isArray(productTypes)) {
      const allowedTypeIds = new Set((productTypes || [])
        .filter((t) => Number(getCatIdOfType(t)) === Number(categoryId))
        .map((t) => Number(t.id))
      );
      return templates.filter((t) => allowedTypeIds.has(Number(t.productType?.id ?? t.productTypeId)));
    }
    return templates; // ยังไม่เลือกอะไรเลย → ทั้งหมด
  }, [templates, productProfileId, productTypeId, categoryId, productTypes]);

  // ----- Update cascade -----
  const update = (field, rawVal) => {
    const val = toNumOrEmpty(rawVal);
    if (value[field] === val) return;

    const next = { ...value, [field]: val };
    if (field === 'categoryId') {
      next.productTypeId = '';
      next.productProfileId = '';
      next.productTemplateId = '';
    } else if (field === 'productTypeId') {
      next.productProfileId = '';
      next.productTemplateId = '';
    } else if (field === 'productProfileId') {
      next.productTemplateId = '';
    }
    onChange?.(next);
  };

  const handleReset = () => {
    onChange?.({ categoryId: '', productTypeId: '', productProfileId: '', productTemplateId: '' });
  };

  // ----- Disabled (ยืดหยุ่น: ไม่ปิดตามลำดับ) -----
  const typeDisabled = false;
  const profileDisabled = false;
  const templateDisabled = false;

  // alias-aware hidden field checker
  const hide = (k) => hiddenFields.includes(k)
    || (k === 'productProfile' && hiddenFields.includes('profile'))
    || (k === 'productType' && hiddenFields.includes('type'));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={direction === 'column' ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}>
        {!hide('category') && (
          <select
            aria-label="หมวดหมู่สินค้า"
            value={categoryId === '' ? '' : categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="">{placeholders.category}</option>
            {(categories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}

        {!hide('productType') && (
          <select
            aria-label="ประเภทสินค้า"
            value={productTypeId === '' ? '' : productTypeId}
            onChange={(e) => update('productTypeId', e.target.value)}
            disabled={typeDisabled}
            className={`border px-3 py-2 rounded w-full text-sm ${typeDisabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">{placeholders.productType}</option>
            {filteredProductTypes.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredProductTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        )}

        {!hide('productProfile') && (
          <select
            aria-label="ลักษณะสินค้า"
            value={productProfileId === '' ? '' : productProfileId}
            onChange={(e) => update('productProfileId', e.target.value)}
            disabled={profileDisabled}
            className={`border px-3 py-2 rounded w-full text-sm ${profileDisabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">{placeholders.productProfile}</option>
            {filteredProductProfiles.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredProductProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        )}

        {!hide('template') && (
          <select
            aria-label="รูปแบบสินค้า (Template)"
            value={productTemplateId === '' ? '' : productTemplateId}
            onChange={(e) => update('productTemplateId', e.target.value)}
            disabled={templateDisabled}
            className={`border px-3 py-2 rounded w-full text-sm ${templateDisabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">{placeholders.template}</option>
            {filteredTemplates.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredTemplates.map((temp) => (
              <option key={temp.id} value={temp.id}>{temp.name}</option>
            ))}
          </select>
        )}
      </div>

      {showSearch && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อสินค้า / บาร์โค้ด"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSearchCommit(searchText.trim());
              }
            }}
            className="border px-3 py-2 rounded w-full text-sm"
          />
        </div>
      )}

      {showReset && (
        <div className="text-right">
          <button
            type="button"
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

