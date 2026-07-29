const numberValue = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const isSimpleSaleLine = (item) => item?.lineType === 'SIMPLE'

export const getSimpleQuantityLimit = (item) => Math.max(0, numberValue(item?.quantityAvailable))

export const clampSimpleQuantity = (item, requestedQuantity) => {
  const limit = getSimpleQuantityLimit(item)
  const requested = numberValue(requestedQuantity, 1)

  if (limit <= 0) return { quantity: 1, limited: true, available: limit }

  const quantity = Math.min(Math.max(1, requested), limit)
  return { quantity, limited: quantity !== requested, available: limit }
}

export const incrementSimpleQuantity = (item) =>
  clampSimpleQuantity(item, numberValue(item?.quantity, 1) + 1)
