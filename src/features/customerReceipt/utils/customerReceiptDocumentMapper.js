const normalizeText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatCustomerReceiptCurrency = (value) =>
  numberValue(value).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const formatCustomerReceiptDate = (value) => {
  if (!value) return '-'

  try {
    return new Date(value).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    })
  } catch {
    return String(value)
  }
}

export const buildCustomerReceiptBranchAddress = (branch, fallbackAddress = '-') => {
  const subdistrict = branch?.subdistrict || null
  const district = subdistrict?.district || null
  const province = district?.province || null

  const structuredAddress = [
    branch?.address,
    subdistrict?.nameTh ? `ต.${subdistrict.nameTh}` : null,
    district?.nameTh ? `อ.${district.nameTh}` : null,
    province?.nameTh ? `จ.${province.nameTh}` : null,
    subdistrict?.postcode,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  if (structuredAddress) return structuredAddress

  const fallback = normalizeText(fallbackAddress)
  return fallback || '-'
}

export const buildCustomerReceiptCustomerName = (customer) => {
  if (!customer) return '-'

  if (['ORGANIZATION', 'GOVERNMENT'].includes(customer.type)) {
    return customer.companyName || customer.name || '-'
  }

  return customer.name || customer.companyName || '-'
}

export const buildCustomerReceiptCustomerAddress = (customer) => {
  if (!customer) return '-'

  const parts = [
    customer.customerAddress,
    customer.address,
    customer.addressDetail,
    customer.subdistrictName ? `ต.${customer.subdistrictName}` : null,
    customer.districtName ? `อ.${customer.districtName}` : null,
    customer.provinceName ? `จ.${customer.provinceName}` : null,
    customer.postcode,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return parts || '-'
}

export const buildCustomerReceiptLineItems = (allocations = []) => {
  const lines = []

  allocations.forEach((allocation, allocationIndex) => {
    const saleItems = Array.isArray(allocation?.sale?.saleItems)
      ? allocation.sale.saleItems
      : []

    if (saleItems.length > 0) {
      saleItems.forEach((saleItem, saleItemIndex) => {
        const quantity = numberValue(
          saleItem?.quantity ?? saleItem?.qty ?? saleItem?.count ?? saleItem?.itemQty ?? 1
        )
        const unitPrice = numberValue(
          saleItem?.unitPriceIncVat ??
            saleItem?.unitPrice ??
            saleItem?.price ??
            saleItem?.sellingPrice ??
            saleItem?.salePrice
        )
        const amount = numberValue(
          saleItem?.amount ??
            saleItem?.totalAmount ??
            saleItem?.total ??
            saleItem?.lineTotal ??
            saleItem?.subtotal ??
            unitPrice * quantity
        )

        lines.push({
          key: `${allocation?.id || allocationIndex}-${saleItem?.id || saleItemIndex}`,
          saleCode: allocation?.sale?.code || allocation?.saleCode || '-',
          productName:
            saleItem?.documentDescription ||
            saleItem?.productName ||
            saleItem?.name ||
            saleItem?.description ||
            saleItem?.title ||
            saleItem?.itemName ||
            saleItem?.stockItem?.product?.name ||
            saleItem?.product?.name ||
            '-',
          productModel:
            saleItem?.productModel ||
            saleItem?.model ||
            saleItem?.stockItem?.product?.productModel ||
            saleItem?.product?.productModel ||
            '',
          quantity,
          unit:
            saleItem?.unit ||
            saleItem?.unitName ||
            saleItem?.stockItem?.product?.unit?.name ||
            saleItem?.product?.unit?.name ||
            saleItem?.unitObj?.name ||
            '-',
          unitPrice,
          amount,
        })
      })
      return
    }

    const amount = numberValue(allocation?.amount)
    lines.push({
      key: `${allocation?.id || allocationIndex}-fallback`,
      saleCode: allocation?.sale?.code || allocation?.saleCode || '-',
      productName: `ชำระตามบิล ${allocation?.sale?.code || allocation?.saleCode || '-'}`,
      productModel: '',
      quantity: 1,
      unit: 'งวด',
      unitPrice: amount,
      amount,
    })
  })

  return lines
}

export const getCustomerReceiptVatSummary = (receipt) => {
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const firstSale = allocations?.[0]?.sale || null
  const total = Math.round(numberValue(receipt?.totalAmount) * 100) / 100
  const vatRate = Number.isFinite(Number(firstSale?.vatRate)) ? Number(firstSale.vatRate) : 7
  const vatAmount = Number.isFinite(Number(firstSale?.vat))
    ? Math.round(Number(firstSale.vat) * 100) / 100
    : Math.round(((total * vatRate) / (100 + vatRate)) * 100) / 100
  const beforeVat = Math.round((total - vatAmount) * 100) / 100

  return { total, vatRate, vatAmount, beforeVat }
}
