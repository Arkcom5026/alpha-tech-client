// ✅ components/shared/form/CascadingDropdowns.jsx — FORM‑CENTRIC (aligned with CascadingFilterGroup)
// Now supports full chain: Category → ProductType → ProductProfile → ProductTemplate
import React, { useEffect, useMemo } from "react";

/**
 * Props (backward compatible):
 *  - dropdowns: {
 *      categories?: Array<{ id:number|string, name:string }>,
 *      productTypes?: Array<{ id:number|string, name:string, categoryId?:number|string, category?:{id} }>,
 *      productProfiles?: Array<{ id:number|string, name:string, productTypeId?:number|string, productType?:{id} }>|Array, // accepts `profiles` alias
 *      productTemplates?: Array<{ id:number|string, name:string, productProfileId?:number|string, productProfile?:{id} }>|Array // accepts `templates` alias
 *    }
 *  - value: {
 *      categoryId?: number|string|null,
 *      productTypeId?: number|string|null,
 *      productProfileId?: number|string|null,
 *      productTemplateId?: number|string|null,
 *    }
 *    • Accepts number | string | null. Internally normalized to string ('' when empty).
 *  - onChange: (partial: {categoryId?, productTypeId?, productProfileId?, productTemplateId?}) => void
 *  - isLoading?: boolean  // disable selects while loading
 *  - hiddenFields?: Array<'category' | 'type' | 'profile' | 'template'>
 *  - placeholders?: Partial<{ category: string; type: string; profile: string; template: string }>
 *  - direction?: 'row' | 'col'  // layout hint (default: 'row')
 *  - disableUrlSync?: boolean   // default: true (don’t sync URL here)
 *  - selectClassName?: string   // extra Tailwind classes for <select> width, e.g. 'min-w-[22rem]'
 *  - containerClassName?: string // static grid classes e.g. 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' (preferred)
 */
export default function CascadingDropdowns({
  dropdowns,
  value,
  onChange,
  isLoading = false,
  hiddenFields = [],
  placeholders = {},
  direction = 'row',
  disableUrlSync = true,
  selectClassName = 'min-w-[14rem]',
  containerClassName,
}) {
  // ---------- helpers ----------
  const toId = (v) => (v === undefined || v === null || v === '' ? '' : String(v));
  const sameStyleEmit = (key, nextStr) => {
    // emit using the same primitive style as incoming value[key]
    const prev = value?.[key];
    if (typeof prev === 'number') {
      onChange({ [key]: nextStr === '' ? null : Number(nextStr) });
    } else if (prev === null) {
      onChange({ [key]: nextStr === '' ? null : Number.isFinite(Number(nextStr)) ? Number(nextStr) : nextStr });
    } else {
      onChange({ [key]: nextStr }); // string style ('' empty)
    }
  };
  const getCategoryIdOfType = (t) => t?.categoryId ?? t?.category?.id ?? t?.category_id ?? undefined;
  const getTypeIdOfProfile = (p) => p?.productTypeId ?? p?.productType?.id ?? p?.product_type_id ?? undefined;
  const getProfileIdOfTemplate = (tp) => tp?.productProfileId ?? tp?.productProfile?.id ?? tp?.product_profile_id ?? undefined;

  // ---------- normalize collections ----------
  const categories = useMemo(
    () => (Array.isArray(dropdowns?.categories) ? dropdowns.categories : []),
    [dropdowns?.categories]
  );
  const productTypes = useMemo(
    () => (Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : []),
    [dropdowns?.productTypes]
  );
  const productProfiles = useMemo(() => {
    const arr = dropdowns?.productProfiles ?? dropdowns?.profiles;
    return Array.isArray(arr) ? arr : [];
  }, [dropdowns?.productProfiles, dropdowns?.profiles]);
  const productTemplates = useMemo(() => {
    const arr = dropdowns?.productTemplates ?? dropdowns?.templates;
    return Array.isArray(arr) ? arr : [];
  }, [dropdowns?.productTemplates, dropdowns?.templates]);

  // ---------- normalize selected values to string ('' = empty) ----------
  const selectedCatId = toId(value?.categoryId);
  const selectedTypeId = toId(value?.productTypeId);
  const selectedProfileId = toId(value?.productProfileId);
  const selectedTemplateId = toId(value?.productTemplateId);

  // ---------- filtered lists (strict by parent) ----------
  const filteredTypes = useMemo(() => {
    if (!selectedCatId) return [];
    return productTypes.filter((t) => String(getCategoryIdOfType(t)) === selectedCatId);
  }, [productTypes, selectedCatId]);

  const filteredProfiles = useMemo(() => {
    if (!selectedTypeId) return [];
    return productProfiles.filter((p) => String(getTypeIdOfProfile(p)) === selectedTypeId);
  }, [productProfiles, selectedTypeId]);

  const filteredTemplates = useMemo(() => {
    if (!selectedProfileId) return [];
    return productTemplates.filter((tp) => String(getProfileIdOfTemplate(tp)) === selectedProfileId);
  }, [productTemplates, selectedProfileId]);

  // ---------- effects: validate and clear when parent/collections change ----------
  // Category change → validate/clear Type; also clear Profile & Template downstream
  useEffect(() => {
    if (!selectedCatId) {
      if (selectedTypeId) sameStyleEmit('productTypeId', '');
      if (selectedProfileId) sameStyleEmit('productProfileId', '');
      if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
      return;
    }
    if (selectedTypeId && !isLoading && productTypes.length > 0) {
      const ok = productTypes.some(
        (t) => String(t?.id) === selectedTypeId && String(getCategoryIdOfType(t)) === selectedCatId
      );
      if (!ok) {
        sameStyleEmit('productTypeId', '');
        if (selectedProfileId) sameStyleEmit('productProfileId', '');
        if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatId]);

  // Type change → validate/clear Profile & Template
  useEffect(() => {
    if (!selectedTypeId) {
      if (selectedProfileId) sameStyleEmit('productProfileId', '');
      if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
      return;
    }
    if (selectedProfileId && !isLoading && productProfiles.length > 0) {
      const ok = productProfiles.some(
        (p) => String(p?.id) === selectedProfileId && String(getTypeIdOfProfile(p)) === selectedTypeId
      );
      if (!ok) {
        sameStyleEmit('productProfileId', '');
        if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeId]);

  // Profile change → validate/clear Template
  useEffect(() => {
    if (!selectedProfileId) {
      if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
      return;
    }
    if (selectedTemplateId && !isLoading && productTemplates.length > 0) {
      const ok = productTemplates.some(
        (tp) => String(tp?.id) === selectedTemplateId && String(getProfileIdOfTemplate(tp)) === selectedProfileId
      );
      if (!ok) sameStyleEmit('productTemplateId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId]);

  // Collections late/async updates: re-validate existing selections
  useEffect(() => {
    if (!selectedTypeId || !selectedCatId || isLoading || productTypes.length === 0) return;
    const ok = productTypes.some(
      (t) => String(t?.id) === selectedTypeId && String(getCategoryIdOfType(t)) === selectedCatId
    );
    if (!ok) {
      sameStyleEmit('productTypeId', '');
      if (selectedProfileId) sameStyleEmit('productProfileId', '');
      if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypes]);

  useEffect(() => {
    if (!selectedProfileId || !selectedTypeId || isLoading || productProfiles.length === 0) return;
    const ok = productProfiles.some(
      (p) => String(p?.id) === selectedProfileId && String(getTypeIdOfProfile(p)) === selectedTypeId
    );
    if (!ok) {
      sameStyleEmit('productProfileId', '');
      if (selectedTemplateId) sameStyleEmit('productTemplateId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productProfiles]);

  useEffect(() => {
    if (!selectedTemplateId || !selectedProfileId || isLoading || productTemplates.length === 0) return;
    const ok = productTemplates.some(
      (tp) => String(tp?.id) === selectedTemplateId && String(getProfileIdOfTemplate(tp)) === selectedProfileId
    );
    if (!ok) sameStyleEmit('productTemplateId', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTemplates]);

  // Explicitly avoid URL sync here (left for List pages only)
  useEffect(() => {
    if (disableUrlSync) return; // purposely do nothing
  }, [disableUrlSync]);

  // ---------- UI controls ----------
  const categoryDisabled = isLoading;
  const typeDisabled = isLoading || !selectedCatId;
  const profileDisabled = isLoading || !selectedTypeId;
  const templateDisabled = isLoading || !selectedProfileId;

  const showCategory = !hiddenFields.includes('category');
  const showType = !hiddenFields.includes('type');
  const showProfile = !hiddenFields.includes('profile');
  const showTemplate = !hiddenFields.includes('template');

  const ph = {
    category: placeholders.category ?? '-- เลือกหมวดหมู่ --',
    type: placeholders.type ?? '-- เลือกประเภทสินค้า --',
    profile: placeholders.profile ?? '-- เลือกลักษณะสินค้า (Profile) --',
    template: placeholders.template ?? '-- เลือกรูปแบบสินค้า (Template) --',
  };

  // container layout: prefer static Tailwind classes so the JIT compiler can see them
  const containerClass = containerClassName
    ? containerClassName
    : (direction === 'col'
        ? 'grid grid-cols-1 gap-3'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3');

  return (
    <div className={containerClass}>
      {showCategory && (
        <div>
          <label htmlFor="cdg-category" className="sr-only">หมวดหมู่</label>
          <select
            id="cdg-category"
            aria-label="เลือกหมวดหมู่"
            className={`border rounded px-3 py-2 w-full ${selectClassName}`}
            value={selectedCatId}
            onChange={(e) => {
              const next = e.target.value; // string | ''
              if (next !== selectedCatId) {
                sameStyleEmit('categoryId', next);
              }
            }}
            disabled={categoryDisabled}
          >
            <option value="">{ph.category}</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
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
            className={`border rounded px-3 py-2 w-full ${selectClassName}`}
            value={selectedTypeId}
            onChange={(e) => {
              const next = e.target.value; // string | ''
              if (next !== selectedTypeId) {
                sameStyleEmit('productTypeId', next);
              }
            }}
            disabled={typeDisabled}
          >
            <option value="">{ph.type}</option>
            {filteredTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showProfile && (
        <div>
          <label htmlFor="cdg-profile" className="sr-only">ลักษณะสินค้า (Profile)</label>
          <select
            id="cdg-profile"
            aria-label="เลือกลักษณะสินค้า (Profile)"
            className={`border rounded px-3 py-2 w-full ${selectClassName}`}
            value={selectedProfileId}
            onChange={(e) => {
              const next = e.target.value; // string | ''
              if (next !== selectedProfileId) {
                sameStyleEmit('productProfileId', next);
              }
            }}
            disabled={profileDisabled}
          >
            <option value="">{ph.profile}</option>
            {filteredProfiles.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showTemplate && (
        <div>
          <label htmlFor="cdg-template" className="sr-only">รูปแบบสินค้า (Template)</label>
          <select
            id="cdg-template"
            aria-label="เลือกรูปแบบสินค้า (Template)"
            className={`border rounded px-3 py-2 w-full ${selectClassName}`}
            value={selectedTemplateId}
            onChange={(e) => {
              const next = e.target.value; // string | ''
              if (next !== selectedTemplateId) {
                sameStyleEmit('productTemplateId', next);
              }
            }}
            disabled={templateDisabled}
          >
            <option value="">{ph.template}</option>
            {filteredTemplates.map((tp) => (
              <option key={tp.id} value={String(tp.id)}>
                {tp.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
