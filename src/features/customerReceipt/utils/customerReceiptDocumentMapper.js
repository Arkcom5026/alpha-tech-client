import { buildCanonicalSaleDocumentLines } from '@/features/sales/documents/utils/saleDocumentLineMapper'
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName'

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
  return getCustomerDisplayName(customer)
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
    const saleItems = buildCanonicalSaleDocumentLines(allocation?.sale)

    if (saleItems.length > 0) {
      saleItems.forEach((saleItem, saleItemIndex) => {
        const quantity = saleItem.quantity
        const unitPrice = saleItem.unitPrice
        const amount = saleItem.lineTotal

        lines.push({
          key: `${allocation?.id || allocationIndex}-${saleItem?.id || saleItemIndex}`,
          saleCode: allocation?.sale?.code || allocation?.saleCode || '-',
          productName: saleItem.productName,
          productModel: saleItem.productModel,
          quantity,
          unit: saleItem.unit,
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
