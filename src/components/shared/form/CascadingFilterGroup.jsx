
// ✅ src/components/shared/form/CascadingFilterGroup.jsx (Prisma‑strict)
// ✅ New hierarchy: Category → Type → Product only

import { useMemo } from 'react'

export default function CascadingFilterGroup({
  value = {},
  onChange,
  dropdowns = {},
  hiddenFields = [],
  className = '',
  placeholders = {
    category: '-- เลือกหมวดสินค้า --',
    productType: '-- เลือกประเภทสินค้า --',
    product: '-- เลือกสินค้า --',
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
  // รองรับทั้งค่า 'col' และ 'column' เพื่อกันหลุดจาก component อื่น
  const __direction = (direction ?? (variant === 'online' ? 'col' : 'row'))
  const __isColumn = __direction === 'col' || __direction === 'column'

  // ───────────────── Prisma schema only — no alias/fallback ─────────────────
  const {
    categories = [],
    productTypes = [],
    products = [],
  } = dropdowns || {}

  const toNumOrEmpty = (v) => (v === '' || v === null || v === undefined ? '' : Number(v))

  const getCatIdOfType = (t) => t?.categoryId
  const getCatIdOfProduct = (p) => p?.categoryId
  const getTypeIdOfProduct = (p) => p?.productTypeId

  const categoryId = toNumOrEmpty(value.categoryId)
  const productTypeId = toNumOrEmpty(value.productTypeId)
  const productId = toNumOrEmpty(value.productId)

  // ───────────────── Filters (strict to Prisma keys) ─────────────────
  const filteredProductTypes = useMemo(() => {
    if (!Array.isArray(productTypes)) return []
    if (categoryId === '') return productTypes
    return productTypes.filter((t) => Number(getCatIdOfType(t)) === Number(categoryId))
  }, [productTypes, categoryId])

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []

    let out = products

    if (categoryId !== '') {
      out = out.filter((p) => Number(getCatIdOfProduct(p)) === Number(categoryId))
    }

    if (productTypeId !== '') {
      out = out.filter((p) => Number(getTypeIdOfProduct(p)) === Number(productTypeId))
    }

    return out
  }, [products, categoryId, productTypeId])

  // ───────────────── Update cascade ─────────────────
  const update = (field, rawVal) => {
    const val = toNumOrEmpty(rawVal)
    if (value[field] === val) return

    const next = { ...value, [field]: val }
    if (field === 'categoryId') {
      next.productTypeId = ''
      next.productId = ''
    } else if (field === 'productTypeId') {
      next.productId = ''
    }
    onChange?.(next)
  }

  const handleReset = () => {
    onChange?.({ categoryId: '', productTypeId: '', productId: '' })
  }

  // ───────────────── Disabled flags (keep flexible) ─────────────────
  const typeDisabled = false
  const productDisabled = false

  const hide = (k) => hiddenFields.includes(k)
    || (k === 'productType' && hiddenFields.includes('type'))

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={__isColumn ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
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

        {!hide('product') && (
          <select
            aria-label="สินค้า"
            value={productId === '' ? '' : productId}
            onChange={(e) => update('productId', e.target.value)}
            disabled={productDisabled}
            className={`border px-3 py-2 rounded w-full text-sm ${productDisabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">{placeholders.product}</option>
            {filteredProducts.length === 0 && <option disabled value="">ไม่มีข้อมูล</option>}
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
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
                e.preventDefault()
                onSearchCommit(searchText.trim())
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
  )
}


