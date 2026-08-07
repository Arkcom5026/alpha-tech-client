const round2 = (value) => Math.round(Number(value) * 100) / 100

export const normalizePriceAdjustmentInput = ({ basePrice, adjustment }) => {
  const base = Number(basePrice)
  const nextAdjustment = Number(adjustment)

  if (!Number.isFinite(base) || base < 0) {
    return { ok: false, code: 'INVALID_BASE_PRICE', message: 'ราคาตั้งต้นไม่ถูกต้อง' }
  }
  if (!Number.isFinite(nextAdjustment)) {
    return { ok: false, code: 'INVALID_PRICE_ADJUSTMENT', message: 'จำนวนปรับราคาไม่ถูกต้อง' }
  }

  const normalizedBase = round2(base)
  const normalizedAdjustment = round2(nextAdjustment)
  const finalPrice = round2(normalizedBase + normalizedAdjustment)
  if (finalPrice < 0) {
    return {
      ok: false,
      code: 'FINAL_PRICE_BELOW_ZERO',
      message: 'การปรับราคาต้องไม่ทำให้ราคาสุทธิติดลบ',
    }
  }

  return {
    ok: true,
    basePrice: normalizedBase,
    priceAdjustment: normalizedAdjustment,
    finalPrice,
    discount: normalizedAdjustment < 0 ? round2(-normalizedAdjustment) : 0,
  }
}

export const projectSaleLinePrice = (item = {}) => {
  const quantity = item.lineType === 'SIMPLE' ? Number(item.quantity || 1) : 1
  const basePrice = round2((Number(item.price) || 0) * quantity)
  const explicit = Number(item.priceAdjustment)
  const legacyDiscount = Number(item.discountWithoutBill ?? item.discount ?? 0) || 0
  const priceAdjustment = Number.isFinite(explicit) ? round2(explicit) : round2(-legacyDiscount)
  const result = normalizePriceAdjustmentInput({ basePrice, adjustment: priceAdjustment })

  if (!result.ok) return result
  return {
    ...result,
    adjustmentReason: String(item.adjustmentReason || '').trim() || null,
  }
}

export const summarizeSalePriceAdjustments = (items = []) => {
  const lines = items.map(projectSaleLinePrice)
  const invalid = lines.find((line) => !line.ok)
  if (invalid) return invalid

  const totalBeforeAdjustment = round2(lines.reduce((sum, line) => sum + line.basePrice, 0))
  const totalPriceAdjustment = round2(lines.reduce((sum, line) => sum + line.priceAdjustment, 0))
  const totalDiscount = round2(lines.reduce((sum, line) => sum + line.discount, 0))
  const totalAmount = round2(totalBeforeAdjustment + totalPriceAdjustment)

  return {
    ok: true,
    lines,
    totalBeforeAdjustment,
    totalPriceAdjustment,
    totalDiscount,
    totalAmount,
  }
}
