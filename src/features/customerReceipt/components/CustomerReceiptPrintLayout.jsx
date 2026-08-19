import React from 'react'

import CustomerReceiptA4Document from './CustomerReceiptA4Document'
import CustomerReceiptPresentationFooter from './CustomerReceiptPresentationFooter'
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope'
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
import {
  applyCustomerReceiptHeaderPresentation,
  customerReceiptTypographyPx,
  resolveCustomerReceiptFooterContent,
  resolveCustomerReceiptPresentation,
} from '../presentation/customerReceiptPresentation'
import {
  buildCustomerReceiptLineItems,
  getCustomerReceiptVatSummary,
} from '../utils/customerReceiptDocumentMapper'

const formatThaiDate = (iso) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long', year: 'numeric',
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
  return { ...receiptBranch, ...saleBranch, documentHeaderConfig: saleBranch?.documentHeaderConfig || receiptBranch?.documentHeaderConfig || null }
}

const buildPrintConfig = (receipt, branch, vatRate, total, beforeVat, vatAmount) => {
  const receiptBranch = receipt?.branch || null
  const receiptConfig = branch?.receiptConfig || receiptBranch?.receiptConfig || {}
  const legacyConfig = {
    branchName: receiptConfig?.branchName || branch?.name || branch?.branchName || receiptBranch?.name || receiptBranch?.branchName || '-',
    address: receiptConfig?.address || branch?.fullAddress || branch?.addressText || branch?.address || receiptBranch?.fullAddress || receiptBranch?.addressText || receiptBranch?.address || '-',
    phone: receiptConfig?.phone || branch?.phone || receiptBranch?.phone || '-',
    taxId: receiptConfig?.taxId || branch?.taxId || receiptBranch?.taxId || '-',
    footerNote: receiptConfig?.footerNote || '',
    logoUrl: receiptConfig?.logoUrl || branch?.logoUrl || receiptBranch?.logoUrl || null,
    vatRate,
    formatThaiDate,
    totals: { total, beforeVat, vatAmount },
  }
  return buildStoreDocumentHeader({ branch: branch || receiptBranch, documentType: 'CUSTOMER_RECEIPT', legacyConfig })
}

const CustomerReceiptPrintLayout = ({ receipt }) => {
  const allocations = Array.isArray(receipt?.allocations) ? receipt.allocations : []
  const lineItems = buildCustomerReceiptLineItems(allocations)
  const { total, vatRate, vatAmount, beforeVat } = getCustomerReceiptVatSummary(receipt)
  const branch = resolvePrintBranch(receipt, allocations)
  const presentation = resolveCustomerReceiptPresentation({ receipt, branch })
  const config = applyCustomerReceiptHeaderPresentation({
    config: buildPrintConfig(receipt, branch, vatRate, total, beforeVat, vatAmount),
    presentation,
  })
  const footerContent = resolveCustomerReceiptFooterContent(presentation)
  const footerFontSize = customerReceiptTypographyPx(presentation, 'footer', 'md')
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
  const presentationFooter = (
    <CustomerReceiptPresentationFooter
      content={footerContent}
      fontSizePx={footerFontSize}
    />
  )

  return (
    <StoreDocumentHeaderScope config={config}>
      <CustomerReceiptA4Document
        sale={sale}
        saleItems={saleItems}
        config={config}
        presentationFooter={presentationFooter}
      />
    </StoreDocumentHeaderScope>
  )
}

export default React.memo(CustomerReceiptPrintLayout)
