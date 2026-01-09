


// ✅ components/shared/form/CascadingDropdowns.jsx

import React, {  useMemo, useCallback } from "react";

export default function CascadingDropdowns({ dropdowns, value = {}, onChange, isLoading = false,
  strict = false,
  hiddenFields = [],
  placeholders = {},
  direction = 'row',
  selectClassName = 'min-w-[14rem]',
  containerClassName,
}) {
  const toId = (v) => (v === undefined || v === null || v === '' ? '' : String(v));

  const sameStyleEmit = useCallback((key, nextStr) => {
    const prev = value?.[key];
    if (typeof prev === 'number') {
      onChange({ [key]: nextStr === '' ? null : Number(nextStr) });
    } else if (prev === null) {
      onChange({ [key]: nextStr === '' ? null : (Number.isFinite(Number(nextStr)) ? Number(nextStr) : nextStr) });
    } else {
      onChange({ [key]: nextStr });
    }
  }, [onChange, value]);

  const getCategoryIdOfType = (t) => t?.categoryId ?? t?.category?.id ?? t?.category_id ?? undefined;
  const getTypeIdOfProfile = (p) => p?.productTypeId ?? p?.productType?.id ?? p?.product_type_id ?? undefined;
  const getProfileIdOfTemplate = (tp) => tp?.productProfileId ?? tp?.productProfile?.id ?? tp?.product_profile_id ?? undefined;

  const categories = useMemo(() => Array.isArray(dropdowns?.categories) ? dropdowns.categories : [], [dropdowns?.categories]);
  const productTypes = useMemo(() => Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : [], [dropdowns?.productTypes]);
  const productProfiles = useMemo(() => {
    const arr = dropdowns?.productProfiles ?? dropdowns?.profiles;
    return Array.isArray(arr) ? arr : [];
  }, [dropdowns?.productProfiles, dropdowns?.profiles]);
  const productTemplates = useMemo(() => {
    const arr = dropdowns?.productTemplates ?? dropdowns?.templates;
    return Array.isArray(arr) ? arr : [];
  }, [dropdowns?.productTemplates, dropdowns?.templates]);

  const selectedCatId = toId(value?.categoryId);
  const selectedTypeId = toId(value?.productTypeId);
  const selectedProfileId = toId(value?.productProfileId);
  const selectedProductTemplateId = toId(value?.productTemplateId);

  const ensureSelectedOption = (list, selectedId) => {
    if (!selectedId) return list;
    const exists = list.some((x) => String(x.id) === String(selectedId));
    // ⛔ ในโหมด strict (เช่นหน้า Create) ไม่เพิ่ม option "กำลังโหลดค่าเดิม"
    // ✅ ในโหมดแก้ไข (strict=false) จะคง fallback เดิมไว้ได้ หากต้องการ
    return exists ? list : (strict ? list : [{ id: selectedId, name: '— กำลังโหลดค่าเดิม —' }, ...list]);
  };

  const filteredTypes = useMemo(() => {
    if (strict && !selectedCatId) return [];
    if (!selectedCatId) return ensureSelectedOption(productTypes, selectedTypeId);
    return ensureSelectedOption(
      productTypes.filter((t) => String(getCategoryIdOfType(t)) === selectedCatId),
      selectedTypeId
    );
  }, [productTypes, selectedCatId, selectedTypeId, strict]);

  const filteredProfiles = useMemo(() => {
    if (strict && !selectedTypeId) return [];
    if (selectedTypeId) {
      return ensureSelectedOption(
        productProfiles.filter((p) => String(getTypeIdOfProfile(p)) === selectedTypeId),
        selectedProfileId
      );
    }
    if (selectedCatId) {
      if (strict) return [];
    }
    return ensureSelectedOption(productProfiles, selectedProfileId);
  }, [productProfiles, selectedTypeId, selectedCatId, selectedProfileId, strict]);

  const filteredTemplates = useMemo(() => {
    if (strict && !selectedProfileId) return [];
    const pro = selectedProfileId;
    const typ = selectedTypeId;
    const cat = selectedCatId;

    let out = [];
    if (pro) {
      out = productTemplates.filter((tp) => String(getProfileIdOfTemplate(tp)) === pro);
    } else if (selectedProductTemplateId && !strict) {
      out = productTemplates.filter((tp) => String(tp?.id) === selectedProductTemplateId);
    } else if (typ && !strict) {
      out = productTemplates.filter((tp) => String(tp?.productTypeId ?? tp?.productType?.id) === typ);
    } else if (cat && !strict) {
      out = productTemplates.filter((tp) => String(tp?.categoryId ?? tp?.category?.id) === cat);
    } else {
      out = strict ? [] : productTemplates;
    }

    if ((!out || out.length === 0) && productTemplates.length > 0 && !strict) out = productTemplates;
    return ensureSelectedOption(out, selectedProductTemplateId);
  }, [productTemplates, selectedCatId, selectedTypeId, selectedProfileId, selectedProductTemplateId, strict]);

  const categoryDisabled = isLoading;
  const typeDisabled = isLoading || (strict && !selectedCatId);
  const profileDisabled = isLoading || (strict && !selectedTypeId);
  const templateDisabled = isLoading || (strict && !selectedProfileId);

  const showCategory = !hiddenFields.includes('category');
  const showType = !hiddenFields.includes('type');
  const showProfile = !hiddenFields.includes('profile');
  const showTemplate = !hiddenFields.includes('template');

  const ph = {
    category: placeholders.category ?? '-- เลือกหมวดหมู่ --',
    type: placeholders.type ?? '-- เลือกประเภทสินค้า --',
    profile: placeholders.profile ?? '-- เลือกแบรนด์ --',
    template: placeholders.template ?? '-- เลือกสเปกสินค้า (SKU) --',
  };

  const containerClass = containerClassName
    ? containerClassName
    : (direction === 'col'
        ? 'grid grid-cols-1 gap-3'
        : 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3');

  return (
    <div className={containerClass}>
      {showCategory && (
        <div>
          <label htmlFor="cdg-category" className="sr-only">หมวดหมู่</label>
          <select
            id="cdg-category"
            aria-label="เลือกหมวดหมู่"
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${categoryDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedCatId}
            onChange={(e) => {
              const next = e.target.value;
              sameStyleEmit('categoryId', next);
            }}
            disabled={categoryDisabled}
          >
            <option value="">{ph.category}</option>
            {ensureSelectedOption(categories, selectedCatId).map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {showType && (
        <div>
          <label htmlFor="cdg-type" className="sr-only">ประเภทสินค้า</label>
          <select
            id="cdg-type"
            aria-label="เลือกประเภทสินค้า"
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${typeDisabled ? 'opacity-50 cursor-not-allowed' : ''}` }
            value={selectedTypeId}
            onChange={(e) => {
              const next = e.target.value;
              sameStyleEmit('productTypeId', next);
            }}
            disabled={typeDisabled}
          >
            <option value="">{ph.type}</option>
            {filteredTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {showProfile && (
        <div>
          <label htmlFor="cdg-profile" className="sr-only">แบรนด์</label>
          <select
            id="cdg-profile"
            aria-label="เลือกแบรนด์"
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${profileDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedProfileId}
            onChange={(e) => {
              const next = e.target.value;
              sameStyleEmit('productProfileId', next);
            }}
            disabled={profileDisabled}
          >
            <option value="">{ph.profile}</option>
            {filteredProfiles.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {showTemplate && (
        <div>
          <label htmlFor="cdg-template" className="sr-only">สเปกสินค้า (SKU)</label>
          <select
            id="cdg-template"
            aria-label="เลือกสเปกสินค้า (SKU)"
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${templateDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedProductTemplateId}
            onChange={(e) => {
              const next = e.target.value;
              sameStyleEmit('productTemplateId', next);
            }}
            disabled={templateDisabled}
          >
            <option value="">{ph.template}</option>
            {filteredTemplates.map((tp) => (
              <option key={tp.id} value={String(tp.id)}>{tp.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

