import React from 'react'

import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import {
  buildCustomerReceiptLineItems,
  getCustomerReceiptVatSummary,
} from '../utils/customerReceiptDocumentMapper'

const formatThaiDate = (iso) => {
  if (!iso) return '-'

  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(iso)
  }
}

const resolvePrintBranch = (receipt, allocations) => {
  const saleBranch = allocations.find((allocation) => allocation?.sale?.branch)?.sale?.branch || null
  const receiptBranch = receipt?.branch || null

  // Sale print data normally carries the same structured branch relation used by BillLayoutFullTax.
  // Prefer it over the lighter Customer Receipt branch projection when available.
  return saleBranch || receiptBranch || null
}

const buildPrintConfig = (receipt, branch, vatRate, total, beforeVat, vatAmount) => {
  const receiptBranch = receipt?.branch || null
  const receiptConfig = branch?.receiptConfig || receiptBranch?.receiptConfig || {}

  return {
    branchName:
      receiptConfig?.branchName ||
      branch?.name ||
      branch?.branchName ||
      receiptBranch?.name ||
      receiptBranch?.branchName ||
      '-',
    address:
      receiptConfig?.address ||
      branch?.fullAddress ||
      branch?.addressText ||
      branch?.address ||
      receiptBranch?.fullAddress ||
      receiptBranch?.addressText ||
      receiptBranch?.address ||
      '-',
    phone: receiptConfig?.phone || branch?.phone || receiptBranch?.phone || '-',
    taxId: receiptConfig?.taxId || branch?.taxId || receiptBranch?.taxId || '-',
    footerNote: receiptConfig?.footerNote || '',
    logoUrl: receiptConfig?.logoUrl || branch?.logoUrl || receiptBranch?.logoUrl || null,
    vatRate,
    formatThaiDate,
    totals: { total, beforeVat, vatAmount },
  }
}

const CustomerReceiptPrintLayout = ({ receipt }) => {
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const branch = resolvePrintBranch(receipt, allocations)
  const config = buildPrintConfig(receipt, branch, vatRate, total, beforeVat, vatAmount)

  const saleItems = lineItems.map((item, index) => {
    const saleCode = item?.saleCode && item.saleCode !== '-' ? `[${item.saleCode}] ` : ''
    const model = item?.productModel ? ` รุ่น ${item.productModel}` : ''
    const description = `${saleCode}${item?.productName || '-'}${model}`.trim()

    return {
      id: item?.key || `customer-receipt-line-${index}`,
      documentLineKey: item?.key || `customer-receipt-line-${index}`,
      documentDescription: description,
      productName: description,
      quantity: Number(item?.quantity || 0),
      unit: item?.unit || '-',
      unitPrice: Number(item?.unitPrice || 0),
      unitPriceIncVat: Number(item?.unitPrice || 0),
      amount: Number(item?.amount || 0),
      totalAmount: Number(item?.amount || 0),
    }
  })

  const sale = {
    id: receipt?.id,
    code: receipt?.code || receipt?.id || '-',
    soldAt: receipt?.receivedAt || receipt?.createdAt || null,
    createdAt: receipt?.createdAt || receipt?.receivedAt || null,
    customer: receipt?.customer || null,
    branch,
    paymentTerms: receipt?.paymentMethod || '-',
    paymentMethod: receipt?.paymentMethod || '-',
    totalAmount: total,
    vat: vatAmount,
    vatRate,
  }

  const payments = [
    {
      id: receipt?.id || null,
      paymentMethod: receipt?.paymentMethod || '-',
      amount: total,
      receivedAt: receipt?.receivedAt || receipt?.createdAt || null,
    },
  ]

  return (
    <BillLayoutFullTax
      sale={sale}
      saleItems={saleItems}
      payments={payments}
      config={config}
      editableDocumentLines={false}
    />
  )
}

export default React.memo(CustomerReceiptPrintLayout)
