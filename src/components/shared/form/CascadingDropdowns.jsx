// ✅ components/shared/form/CascadingDropdowns.jsx

import React, { useMemo, useCallback } from 'react'

// =====================================================
// CascadingDropdowns (v2.1)
// ✅ ลำดับขั้นสินค้า: Category → Type → Product เท่านั้น
// ✅ Profile / Template ถูกถอดออกจากการเลือก (ไม่ได้อยู่ใน flow นี้แล้ว)
//
// Props
// - dropdowns: { categories, productTypes, products (or productItems) }
// - value: { categoryId, productTypeId, productId }
// - onChange(patch)
// - strict: true (Create) => disable downstream จนกว่าจะเลือก parent ครบ
// - hiddenFields: ['category','type','product']
// =====================================================

export default function CascadingDropdowns({
  dropdowns,
  value = {},
  onChange,
  isLoading = false,
  strict = false,
  hiddenFields = [],
  placeholders = {},
  direction = 'row',
  selectClassName = 'min-w-[14rem]',
  containerClassName,
}) {
  const toId = (v) => (v === undefined || v === null || v === '' ? '' : String(v))

  // ---- Same-style coercion (preserve number/null/string style per existing state) ----
  const coerceNext = useCallback((prev, nextStr) => {
    if (typeof prev === 'number') {
      return nextStr === '' ? null : Number(nextStr)
    }
    if (prev === null) {
      if (nextStr === '') return null
      const asNum = Number(nextStr)
      return Number.isFinite(asNum) ? asNum : nextStr
    }
    return nextStr
  }, [])

  const emitPatch = useCallback((patchStrMap) => {
    const patch = {}
    for (const [key, nextStr] of Object.entries(patchStrMap)) {
      patch[key] = coerceNext(value?.[key], nextStr)
    }
    onChange(patch)
  }, [coerceNext, onChange, value])

  // ---- Relationship helpers (supports both direct FK and nested) ----
  const getCategoryIdOfType = (t) => t?.categoryId ?? t?.category?.id ?? t?.category_id ?? undefined
  const getCategoryIdOfProduct = (p) => p?.categoryId ?? p?.category?.id ?? p?.category_id ?? undefined
  const getTypeIdOfProduct = (p) => p?.productTypeId ?? p?.productType?.id ?? p?.product_type_id ?? undefined

  // ---- Lists ----
  const categories = useMemo(() => (Array.isArray(dropdowns?.categories) ? dropdowns.categories : []), [dropdowns?.categories])
  const productTypes = useMemo(() => (Array.isArray(dropdowns?.productTypes) ? dropdowns.productTypes : []), [dropdowns?.productTypes])
  const products = useMemo(() => {
    const arr = dropdowns?.products ?? dropdowns?.productItems
    return Array.isArray(arr) ? arr : []
  }, [dropdowns?.products, dropdowns?.productItems])

  // ---- Selected ----
  const selectedCatId = toId(value?.categoryId)
  const selectedTypeId = toId(value?.productTypeId)
  const selectedProductId = toId(value?.productId)

  // ---- Fallback option for Edit (strict=false) ----
  const ensureSelectedOption = useCallback((list, selectedId) => {
    if (!selectedId) return list
    const exists = list.some((x) => String(x.id) === String(selectedId))
    return exists ? list : (strict ? list : [{ id: selectedId, name: '— กำลังโหลดค่าเดิม —' }, ...list])
  }, [strict])

  // ---- Cascade lists ----
  const filteredTypes = useMemo(() => {
    if (strict && !selectedCatId) return []
    if (!selectedCatId) return ensureSelectedOption(productTypes, selectedTypeId)
    return ensureSelectedOption(
      productTypes.filter((t) => String(getCategoryIdOfType(t)) === selectedCatId),
      selectedTypeId
    )
  }, [productTypes, selectedCatId, selectedTypeId, strict, ensureSelectedOption])

  const filteredProducts = useMemo(() => {
    if (strict && (!selectedCatId || !selectedTypeId)) return []

    // ถ้าไม่เลือก parent → ใน non-strict ให้คง selected เดิมได้
    if (!selectedCatId && !selectedTypeId) return ensureSelectedOption(products, selectedProductId)

    let out = products

    // filter by category if chosen
    if (selectedCatId) {
      out = out.filter((p) => String(getCategoryIdOfProduct(p)) === selectedCatId)
    }

    // filter by type if chosen
    if (selectedTypeId) {
      out = out.filter((p) => String(getTypeIdOfProduct(p)) === selectedTypeId)
    }

    return ensureSelectedOption(out, selectedProductId)
  }, [products, selectedCatId, selectedTypeId, selectedProductId, strict, ensureSelectedOption])

  // ---- UI rules ----
  const categoryDisabled = isLoading
  const typeDisabled = isLoading || (strict && !selectedCatId)
  const productDisabled = isLoading || (strict && (!selectedCatId || !selectedTypeId))

  const hide = (k) => hiddenFields.includes(k) || (k === 'type' && hiddenFields.includes('productType'))

  const showCategory = !hide('category')
  const showType = !hide('type')
  const showProduct = !hide('product')

  const ph = {
    category: placeholders.category ?? '-- เลือกหมวดหมู่ --',
    type: placeholders.type ?? '-- เลือกประเภทสินค้า --',
    product: placeholders.product ?? '-- เลือกสินค้า --',
  }

  const visibleCount = (showCategory ? 1 : 0) + (showType ? 1 : 0) + (showProduct ? 1 : 0)

  const containerClass = containerClassName
    ? containerClassName
    : (direction === 'col'
      ? 'grid grid-cols-1 gap-3'
      : `grid grid-cols-1 md:grid-cols-${visibleCount} lg:grid-cols-${visibleCount} xl:grid-cols-${visibleCount} gap-3`)

  // ---- Downstream reset (Production rule) ----
  const onCategoryChange = (next) => {
    // Category → reset Type + Product
    emitPatch({
      categoryId: next,
      productTypeId: '',
      productId: '',
    })
  }

  const onTypeChange = (next) => {
    // Type → reset Product
    emitPatch({
      productTypeId: next,
      productId: '',
    })
  }

  const onProductChange = (next) => {
    emitPatch({ productId: next })
  }

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
            onChange={(e) => onCategoryChange(e.target.value)}
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
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${typeDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedTypeId}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={typeDisabled}
          >
            <option value="">{ph.type}</option>
            {filteredTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {showProduct && (
        <div>
          <label htmlFor="cdg-product" className="sr-only">สินค้า</label>
          <select
            id="cdg-product"
            aria-label="เลือกสินค้า"
            className={`border rounded px-3 py-2 w-full ${selectClassName} ${productDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={selectedProductId}
            onChange={(e) => onProductChange(e.target.value)}
            disabled={productDisabled}
          >
            <option value="">{ph.product}</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

