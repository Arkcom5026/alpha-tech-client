const text = (value) => String(value ?? '').trim()
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const COMBINED_BILLING_TYPOGRAPHY_PX = Object.freeze({ xs: 9, sm: 10, md: 11, lg: 12, xl: 13 })

const resolveCombinedBillingPresentation = (documentDetail) => {
  const snapshot = documentDetail?.presentationAuthority?.presentationSnapshot
  if (!isObject(snapshot) || !isObject(snapshot.presentation)) return null
  return snapshot.presentation
}

const visibleBlockContent = (presentation, type) => {
  const block = presentation?.resolved?.blocks?.[type]
  if (!isObject(block) || block.visible === false) return ''
  return text(block.content)
}

const resolveCombinedBillingHeader = (documentDetail) => {
  const presentation = resolveCombinedBillingPresentation(documentDetail)
  const header = presentation?.resolved?.header || {}
  const branch = documentDetail?.branch || {}
  return {
    branchName: header.showStoreName === false ? '' : (text(header.storeName) || text(branch.name) || '-'),
    address: header.showAddress === false ? '' : (text(header.address) || text(branch.address) || '-'),
    phone: header.showPhone === false ? '' : (text(header.phone) || text(branch.phone) || ''),
    taxId: header.showTaxId === false ? '' : (text(header.taxId) || text(branch.taxId) || ''),
    logoUrl: header.showLogo === false ? null : (text(header.logoUrl) || text(branch.logoUrl) || null),
    headerNote: text(header.headerNote),
  }
}

const resolveCombinedBillingFooter = (documentDetail) => {
  const presentation = resolveCombinedBillingPresentation(documentDetail)
  return {
    commercialTerms: visibleBlockContent(presentation, 'COMMERCIAL_TERMS'),
    paymentTerms: visibleBlockContent(presentation, 'PAYMENT_TERMS'),
    deliveryTerms: visibleBlockContent(presentation, 'DELIVERY_TERMS'),
    notes: visibleBlockContent(presentation, 'NOTES'),
    customFooter: visibleBlockContent(presentation, 'CUSTOM_FOOTER'),
  }
}

const combinedBillingTypographyPx = (documentDetail, key = 'footer', fallback = 'md') => {
  const presentation = resolveCombinedBillingPresentation(documentDetail)
  const token = presentation?.resolved?.typography?.[key]
  return COMBINED_BILLING_TYPOGRAPHY_PX[token] || COMBINED_BILLING_TYPOGRAPHY_PX[fallback] || 11
}

export {
  combinedBillingTypographyPx,
  resolveCombinedBillingFooter,
  resolveCombinedBillingHeader,
  resolveCombinedBillingPresentation,
}
