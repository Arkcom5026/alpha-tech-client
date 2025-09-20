// ✅ src/components/shared/form/CascadingFilterGroup.jsx (Prisma‑strict)

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
  direction,
  variant = 'pos',
  showSearch = false,
  searchText = '',
  onSearchTextChange = () => {},
  onSearchCommit = () => {},
}) {
  // Layout: derive direction. Default POS=row; Online stacks to column.
  const __direction = (direction ?? (variant === 'online' ? 'column' : 'row'));

  // ───────────────── Prisma schema only — no alias/fallback ─────────────────
  const {
    categories = [],
    productTypes = [],
    productProfiles = [],
    productTemplates = [],
  } = dropdowns || {};

  const toNumOrEmpty = (v) => (v === '' || v === null || v === undefined ? '' : Number(v));
  const getCatIdOfType = (t) => t?.categoryId; // Prisma: productType.categoryId

  const categoryId = toNumOrEmpty(value.categoryId);
  const productTypeId = toNumOrEmpty(value.productTypeId);
  const productProfileId = toNumOrEmpty(value.productProfileId);
  const productTemplateId = toNumOrEmpty(value.productTemplateId);

  // ───────────────── Filters (strict to Prisma keys) ─────────────────
  const filteredProductTypes = useMemo(() => {
    if (!Array.isArray(productTypes)) return [];
    if (categoryId === '') return productTypes;
    return productTypes.filter((t) => Number(getCatIdOfType(t)) === Number(categoryId));
  }, [productTypes, categoryId]);

  const filteredProductProfiles = useMemo(() => {
    if (!Array.isArray(productProfiles)) return [];
    if (productTypeId === '') {
      if (categoryId === '' || !Array.isArray(productTypes)) return productProfiles;
      const allowedTypeIds = new Set((productTypes || [])
        .filter((t) => Number(getCatIdOfType(t)) === Number(categoryId))
        .map((t) => Number(t.id))
      );
      return productProfiles.filter((p) => allowedTypeIds.has(Number(p.productTypeId)));
    }
    return productProfiles.filter((p) => Number(p.productTypeId) === Number(productTypeId));
  }, [productProfiles, productTypes, categoryId, productTypeId]);

  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(productTemplates)) return [];

    // 1) เลือกตาม profile โดยตรง
    if (productProfileId !== '') {
      return productTemplates.filter((t) => Number(t.productProfileId) === Number(productProfileId));
    }

    // 2) ยังไม่เลือก profile แต่เลือก type → template ที่ profile อยู่ใน type นั้น
    if (productTypeId !== '') {
      const allowedProfileIds = new Set((productProfiles || [])
        .filter((p) => Number(p.productTypeId) === Number(productTypeId))
        .map((p) => Number(p.id))
      );
      return productTemplates.filter((t) => allowedProfileIds.has(Number(t.productProfileId)));
    }

    // 3) ยังไม่เลือก type แต่เลือก category → template ที่ profile อยู่ใน type ของหมวดนั้น
    if (categoryId !== '' && Array.isArray(productTypes)) {
      const allowedTypeIds = new Set((productTypes || [])
        .filter((t) => Number(getCatIdOfType(t)) === Number(categoryId))
        .map((t) => Number(t.id))
      );
      const allowedProfileIds = new Set((productProfiles || [])
        .filter((p) => allowedTypeIds.has(Number(p.productTypeId)))
        .map((p) => Number(p.id))
      );
      return productTemplates.filter((t) => allowedProfileIds.has(Number(t.productProfileId)));
    }

    // 4) ไม่เลือกอะไรเลย → ทั้งหมด
    return productTemplates;
  }, [productTemplates, productProfiles, productTypes, productProfileId, productTypeId, categoryId]);

  // ───────────────── Update cascade ─────────────────
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

  // ───────────────── Disabled flags (keep flexible) ─────────────────
  const typeDisabled = false;
  const profileDisabled = false;
  const templateDisabled = false;

  const hide = (k) => hiddenFields.includes(k)
    || (k === 'productProfile' && hiddenFields.includes('profile'))
    || (k === 'productType' && hiddenFields.includes('type'));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={__direction === 'column' ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}>
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
            value={productTemplateId === '' ? '' : productTemplateId }
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


 
 
