// src/features/bill/utils/receiptGrouping.js

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const getUnitPrice = (item) => {
  if (!item) return 0

  const candidates = [
    item.unitPriceIncVat,
    item.unitPrice,
    item.lineUnitPrice,
  ]

  for (const v of candidates) {
    const num = n(v)
    if (num > 0) return num
  }

  const qty = n(item?.quantity)
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount)
  if (qty > 0 && amount > 0) return round2(amount / qty)

  return 0
}

const getLineTotalSatang = (item) => {
  const amount = n(item?.amount ?? item?.total ?? item?.totalAmount)
  if (amount > 0) return Math.round(amount * 100)

  const qty = n(item?.quantity) || 1
  const unit = getUnitPrice(item)
  const unitSatang = Math.round(unit * 100)
  return unitSatang * qty
}

const normalizeGroupText = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const getGroupProductId = (item) =>
  item?.productId ??
  item?.product?.id ??
  item?.stockItem?.productId ??
  item?.simpleItem?.productId ??
  null

const getGroupUnitKey = (item) => Math.round(getUnitPrice(item) * 100)

const getFirstTextValue = (...values) => {
  for (const value of values) {
    const text = normalizeGroupText(value)
    if (text) return text
  }

  return ''
}

const getSerialIdentity = (item) =>
  getFirstTextValue(
    item?.serialNo,
    item?.serialNumber,
    item?.serial,
    item?.sn,
    item?.imei,
    item?.imei1,
    item?.imei2,
    item?.stockItem?.serialNo,
    item?.stockItem?.serialNumber,
    item?.stockItem?.serial,
    item?.stockItem?.sn,
    item?.stockItem?.imei,
    item?.stockItem?.imei1,
    item?.stockItem?.imei2,
    item?.simpleItem?.serialNo,
    item?.simpleItem?.serialNumber,
    item?.simpleItem?.serial,
    item?.simpleItem?.sn,
    item?.simpleItem?.imei
  )

const isExplicitSerializedItem = (item) => {
  const flags = [
    item?.isSerialized,
    item?.hasSerial,
    item?.requireSerial,
    item?.requiresSerial,
    item?.trackSerial,
    item?.trackingSerial,
    item?.product?.isSerialized,
    item?.product?.hasSerial,
    item?.product?.requireSerial,
    item?.product?.requiresSerial,
    item?.product?.trackSerial,
    item?.product?.trackingSerial,
  ]

  if (flags.some((v) => v === true)) return true

  const codeType = normalizeGroupText(item?.codeType || item?.product?.codeType).toUpperCase()
  return ['S', 'SN', 'SERIAL', 'IMEI'].includes(codeType)
}

const canMergeReceiptItem = (item) => {
  if (getSerialIdentity(item)) return false
  if (isExplicitSerializedItem(item)) return false

  return true
}

const getReceiptGroupKey = (item, index = 0) => {
  const productId = getGroupProductId(item)
  const description = normalizeGroupText(
    item?.documentDescription ||
    item?.productName ||
    item?.documentDescriptionRaw
  )
  const prefix = normalizeGroupText(item?.documentPrefix)
  const suffix = normalizeGroupText(item?.documentSuffix)
  const unitKey = getGroupUnitKey(item)
  const baseKey = [productId || description || item?.id || 'unknown', unitKey, prefix, description, suffix].join('|')

  if (canMergeReceiptItem(item)) return baseKey

  const serialIdentity = getSerialIdentity(item)
  return `${baseKey}|serial:${serialIdentity || item?.id || index}`
}

const appendUnique = (base = [], values = []) => {
  const set = new Set(base.filter((v) => v != null))
  values.forEach((v) => {
    if (v != null) set.add(v)
  })
  return Array.from(set)
}

const getItemOwnIdList = (item) => {
  if (Array.isArray(item?.saleItemIds) && item.saleItemIds.length) return item.saleItemIds
  return item?.id != null ? [item.id] : []
}

const getItemSimpleIdList = (item) => {
  if (Array.isArray(item?.simpleItemIds) && item.simpleItemIds.length) return item.simpleItemIds

  const candidates = [
    item?.simpleItemId,
    item?.stockItemId,
    item?.serialItemId,
    item?.stockItem?.id,
    item?.simpleItem?.id,
  ]

  return candidates.filter((v) => v != null)
}

export const buildReceiptItems = (items = []) => {
  if (!Array.isArray(items)) return []

  const map = new Map()

  items.forEach((item, index) => {
    if (!item) return

    const key = getReceiptGroupKey(item, index)
    const qty = n(item?.quantity) || 1
    const lineTotalSatang = getLineTotalSatang(item)
    const saleItemIds = getItemOwnIdList(item)
    const simpleItemIds = getItemSimpleIdList(item)

    if (!map.has(key)) {
      map.set(key, {
        ...item,
        id: item?.id ?? `receipt-line-${index}`,
        documentLineKey: key,
        quantity: qty,
        amount: lineTotalSatang / 100,
        total: lineTotalSatang / 100,
        totalAmount: lineTotalSatang / 100,
        saleItemIds,
        simpleItemIds,
        hasDocumentLine: Boolean(item?.hasDocumentLine || item?.documentPrefix || item?.documentSuffix),
      })
      return
    }

    const current = map.get(key)
    const currentTotalSatang = Math.round(n(current?.amount ?? current?.total ?? current?.totalAmount) * 100)
    const nextTotalSatang = currentTotalSatang + lineTotalSatang

    map.set(key, {
      ...current,
      quantity: n(current.quantity) + qty,
      amount: nextTotalSatang / 100,
      total: nextTotalSatang / 100,
      totalAmount: nextTotalSatang / 100,
      saleItemIds: appendUnique(current.saleItemIds, saleItemIds),
      simpleItemIds: appendUnique(current.simpleItemIds, simpleItemIds),
      hasDocumentLine: Boolean(
        current?.hasDocumentLine ||
        item?.hasDocumentLine ||
        item?.documentPrefix ||
        item?.documentSuffix
      ),
    })
  })

  return Array.from(map.values())
}

export default buildReceiptItems
