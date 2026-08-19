import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
import { resolveDocumentPresentation } from '@/features/printing/presentation/presentationConfig'

const text = (value) => String(value ?? '').trim()
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const PURCHASE_ORDER_TYPOGRAPHY_PX = Object.freeze({ xs: 9, sm: 10, md: 11, lg: 12, xl: 13 })

const getPurchaseOrderSnapshotPresentation = (authority) => {
  const snapshot = authority?.presentationSnapshot
  if (!isObject(snapshot)) return null
  return isObject(snapshot.presentation) ? snapshot.presentation : null
}

const resolvePurchaseOrderPresentation = ({ authority, branch } = {}) => {
  const issued = getPurchaseOrderSnapshotPresentation(authority)
  if (issued) return issued
  return resolveDocumentPresentation({
    storeConfig: branch?.documentHeaderConfig,
    documentPurpose: 'PURCHASE_ORDER',
  })
}

const visibleBlockContent = (presentation, blockType) => {
  const block = presentation?.resolved?.blocks?.[blockType]
  if (!isObject(block) || block.visible === false) return ''
  return text(block.content)
}

const resolvePurchaseOrderFooterContent = (presentation) => ({
  commercialTerms: visibleBlockContent(presentation, 'COMMERCIAL_TERMS'),
  paymentTerms: visibleBlockContent(presentation, 'PAYMENT_TERMS'),
  deliveryTerms: visibleBlockContent(presentation, 'DELIVERY_TERMS'),
  notes: visibleBlockContent(presentation, 'NOTES'),
  customFooter: visibleBlockContent(presentation, 'CUSTOM_FOOTER'),
})

const applyPurchaseOrderHeaderPresentation = ({ branch, presentation } = {}) => {
  const base = buildStoreDocumentHeader({ branch, documentType: 'PURCHASE_ORDER' })
  const header = presentation?.resolved?.header
  if (!isObject(header)) return base

  const style = isObject(base.headerStyle) ? base.headerStyle : {}
  const storeName = text(header.storeName) || text(style.storeName) || text(base.branchName)
  const address = text(header.address) || text(style.address) || text(base.address)
  const phone = text(header.phone) || text(style.phone) || text(base.phone)
  const taxId = text(header.taxId) || text(style.taxId) || text(base.taxId)
  const logoUrl = text(header.logoUrl) || text(style.logoUrl) || text(base.logoUrl) || null

  return {
    ...base,
    branchName: header.showStoreName === false ? '' : storeName,
    address: header.showAddress === false ? '' : address,
    phone: header.showPhone === false ? '' : phone,
    taxId: header.showTaxId === false ? '' : taxId,
    logoUrl: header.showLogo === false ? null : logoUrl,
    headerStyle: { ...style, ...header, storeName, address, phone, taxId, logoUrl },
  }
}

const purchaseOrderTypographyPx = (presentation, key, fallback = 'md') => {
  const token = presentation?.resolved?.typography?.[key]
  return PURCHASE_ORDER_TYPOGRAPHY_PX[token] || PURCHASE_ORDER_TYPOGRAPHY_PX[fallback] || 11
}

export {
  applyPurchaseOrderHeaderPresentation,
  getPurchaseOrderSnapshotPresentation,
  purchaseOrderTypographyPx,
  resolvePurchaseOrderFooterContent,
  resolvePurchaseOrderPresentation,
}
