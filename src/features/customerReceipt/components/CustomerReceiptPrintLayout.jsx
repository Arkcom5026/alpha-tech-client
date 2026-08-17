import React from 'react'

import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
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

  if (!saleBranch) return receiptBranch
  if (!receiptBranch) return saleBranch

  return {
    ...receiptBranch,
    ...saleBranch,
    documentHeaderConfig: saleBranch?.documentHeaderConfig || receiptBranch?.documentHeaderConfig || null,
  }
}

const buildPrintConfig = (receipt, branch, vatRate, total, beforeVat, vatAmount) => {
  const receiptBranch = receipt?.branch || null
  const receiptConfig = branch?.receiptConfig || receiptBranch?.receiptConfig || {}

  const legacyConfig = {
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

  return buildStoreDocumentHeader({
    branch: branch || receiptBranch,
    documentType: 'CUSTOMER_RECEIPT',
    legacyConfig,
  })
}

const getHeaderScopeClassName = (style = {}) => [
  'store-document-header-scope',
  `store-document-header-logo-${style.logoPosition || 'left'}`,
  `store-document-header-text-${style.textAlign || 'left'}`,
  `store-document-header-name-${style.storeNameSize || 'md'}`,
  style.showAddress === false ? 'store-document-header-hide-address' : '',
  style.showPhone === false ? 'store-document-header-hide-phone' : '',
  style.showTaxId === false ? 'store-document-header-hide-tax-id' : '',
].filter(Boolean).join(' ')

const CustomerReceiptPrintLayout = ({ receipt }) => {
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const branch = resolvePrintBranch(receipt, allocations)
  const config = buildPrintConfig(receipt, branch, vatRate, total, beforeVat, vatAmount)
  const headerStyle = config?.headerStyle || {}

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

  const headerNote = String(headerStyle?.headerNote || '').trim()
  const headerNoteCss = JSON.stringify(headerNote)

  return (
    <div
      className={getHeaderScopeClassName(headerStyle)}
      style={{ '--store-document-header-note': headerNoteCss }}
    >
      <style>{`
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > div {
          text-align: left;
        }
        .store-document-header-text-center .print-a4 > div:first-child > div:first-child > div {
          text-align: center;
        }
        .store-document-header-text-right .print-a4 > div:first-child > div:first-child > div {
          text-align: right;
        }
        .store-document-header-logo-center .print-a4 > div:first-child > div:first-child {
          flex-direction: column;
          align-items: center;
        }
        .store-document-header-logo-right .print-a4 > div:first-child > div:first-child {
          flex-direction: row-reverse;
        }
        .store-document-header-name-sm .print-a4 > div:first-child h2 { font-size: 13px !important; }
        .store-document-header-name-md .print-a4 > div:first-child h2 { font-size: 16px !important; }
        .store-document-header-name-lg .print-a4 > div:first-child h2 { font-size: 20px !important; }
        .store-document-header-name-xl .print-a4 > div:first-child h2 { font-size: 24px !important; }
        .store-document-header-hide-address .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(1) { display: none; }
        .store-document-header-hide-phone .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(2) { display: none; }
        .store-document-header-hide-tax-id .print-a4 > div:first-child > div:first-child > div > p:nth-of-type(3) { display: none; }
        .store-document-header-scope .print-a4 > div:first-child > div:first-child > div::after {
          content: var(--store-document-header-note);
          display: ${headerNote ? 'block' : 'none'};
          margin-top: 2px;
          white-space: pre-wrap;
        }
      `}</style>
      <BillLayoutFullTax
        sale={sale}
        saleItems={saleItems}
        payments={payments}
        config={config}
        editableDocumentLines={false}
      />
    </div>
  )
}

export default React.memo(CustomerReceiptPrintLayout)
