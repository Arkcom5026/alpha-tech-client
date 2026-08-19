import { resolveDocumentPresentation } from '@/features/printing/presentation/presentationConfig'

const text = (value) => String(value ?? '').trim()
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getIssuedPresentation = (quotation) => {
  const snapshot = quotation?.issuedSnapshot?.presentation
  if (!isObject(snapshot)) return null
  if (isObject(snapshot.presentation)) return snapshot.presentation
  return snapshot
}

const resolveQuotationPresentation = ({ quotation, branch } = {}) => {
  const issued = getIssuedPresentation(quotation)
  if (issued) return issued

  return resolveDocumentPresentation({
    storeConfig: branch?.documentHeaderConfig,
    documentPurpose: 'QUOTATION',
  })
}

const visibleBlockContent = (presentation, blockType) => {
  const block = presentation?.resolved?.blocks?.[blockType]
  if (!isObject(block) || block.visible === false) return ''
  return text(block.content)
}

const resolveQuotationTerms = ({ quotation, presentation } = {}) => ({
  commercialTerms: visibleBlockContent(presentation, 'COMMERCIAL_TERMS'),
  paymentTerms: text(quotation?.paymentTerms) || visibleBlockContent(presentation, 'PAYMENT_TERMS'),
  deliveryTerms: visibleBlockContent(presentation, 'DELIVERY_TERMS'),
  notes: text(quotation?.notes) || visibleBlockContent(presentation, 'NOTES'),
  closingNote: text(quotation?.closingNote),
  customFooter: visibleBlockContent(presentation, 'CUSTOM_FOOTER'),
})

const resolveQuotationPaymentAccounts = ({ quotation, activeAccounts = [], presentation } = {}) => {
  const issuedAccounts = quotation?.issuedSnapshot?.paymentAccounts
  if (Array.isArray(issuedAccounts)) return issuedAccounts

  const ids = presentation?.resolved?.paymentAccountSelection?.accountIds
  if (!Array.isArray(ids) || !ids.length) return []
  const byId = new Map((Array.isArray(activeAccounts) ? activeAccounts : []).map((account) => [Number(account.id), account]))
  return ids.map(Number).map((id) => byId.get(id)).filter(Boolean)
}

const quotationTypographyToken = (presentation, key, fallback = 'md') => {
  const token = presentation?.resolved?.typography?.[key]
  return ['xs', 'sm', 'md', 'lg', 'xl'].includes(token) ? token : fallback
}

export {
  getIssuedPresentation,
  quotationTypographyToken,
  resolveQuotationPaymentAccounts,
  resolveQuotationPresentation,
  resolveQuotationTerms,
  visibleBlockContent,
}
