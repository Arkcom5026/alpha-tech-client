const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const resolveLineType = (item, fallbackLineType) => {
  if (item?.lineType) return String(item.lineType).toUpperCase()
  if (fallbackLineType) return fallbackLineType
  return item?.stockItemId || item?.stockItem?.id ? 'STOCK_ITEM' : 'SIMPLE'
}

const resolveProduct = (item) => item?.product || item?.stockItem?.product || item?.productSnapshot || null

const resolveLegacySaleLines = (sale) => {
  if (Array.isArray(sale?.saleLines) && sale.saleLines.length > 0) {
    return sale.saleLines.map((item) => ({ item, fallbackLineType: null }))
  }

  const stockItems = Array.isArray(sale?.saleItems)
    ? sale.saleItems
    : Array.isArray(sale?.items)
      ? sale.items
      : []
  const simpleItems = Array.isArray(sale?.simpleItems) ? sale.simpleItems : []

  return [
    ...stockItems.map((item) => ({ item, fallbackLineType: 'STOCK_ITEM' })),
    ...simpleItems.map((item) => ({ item, fallbackLineType: 'SIMPLE' })),
  ]
}

// Document consumers use this projection instead of deciding whether an API
// response carries saleLines, saleItems, items, or simpleItems. `price` is a
// unit price unless an explicit line-total field is present.
export const buildCanonicalSaleDocumentLines = (sale) =>
  resolveLegacySaleLines(sale).map(({ item, fallbackLineType }, index) => {
    const product = resolveProduct(item)
    const quantity = numberValue(item?.quantity ?? item?.qty ?? item?.count ?? item?.itemQty ?? 1)
    const unitPrice = numberValue(
      item?.unitPriceIncVat ?? item?.unitPrice ?? item?.price ?? item?.sellingPrice ?? item?.salePrice
    )
    const lineTotal = numberValue(
      item?.lineTotal ??
        item?.totalAmount ??
        item?.amount ??
        item?.total ??
        item?.subtotal ??
        unitPrice * quantity
    )

    return {
      key: String(item?.id ?? index),
      id: item?.id ?? null,
      lineType: resolveLineType(item, fallbackLineType),
      productId: item?.productId ?? item?.stockItem?.productId ?? product?.id ?? null,
      stockItemId: item?.stockItemId ?? item?.stockItem?.id ?? null,
      simpleLotId: item?.simpleLotId ?? null,
      productName:
        item?.documentDescription ||
        item?.productName ||
        item?.name ||
        item?.description ||
        item?.title ||
        item?.itemName ||
        product?.name ||
        '-',
      productModel: item?.productModel || item?.model || product?.productModel || product?.model || '',
      quantity,
      unit: item?.unit || item?.unitName || product?.unit?.name || item?.unitObj?.name || '-',
      unitPrice,
      discount: numberValue(item?.discount ?? item?.discountAmount),
      vatAmount: numberValue(item?.vatAmount ?? item?.vat),
      lineTotal,
    }
  })
