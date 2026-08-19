import { resolveDocumentPresentation } from '../../printing/presentation/presentationConfig.js'

const text = (value) => String(value ?? '').trim()
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const DELIVERY_NOTE_TYPOGRAPHY_PX = Object.freeze({
  xs: 9,
  sm: 10,
  md: 11,
  lg: 12,
  xl: 13,
})

const getDeliveryNoteSnapshotPresentation = (authority) => {
  const snapshot = authority?.presentationSnapshot
  if (!isObject(snapshot)) return null
  if (isObject(snapshot.presentation)) return snapshot.presentation
  return null
}

const resolveDeliveryNotePresentation = ({ authority, branch } = {}) => {
  const issued = getDeliveryNoteSnapshotPresentation(authority)
  if (issued) return issued

  return resolveDocumentPresentation({
    storeConfig: branch?.documentHeaderConfig,
    documentPurpose: 'DELIVERY_NOTE',
  })
}

const visibleBlockContent = (presentation, blockType) => {
  const block = presentation?.resolved?.blocks?.[blockType]
  if (!isObject(block) || block.visible === false) return ''
  return text(block.content)
}

const resolveDeliveryNoteFooterContent = (presentation) => ({
  deliveryTerms: visibleBlockContent(presentation, 'DELIVERY_TERMS'),
  notes: visibleBlockContent(presentation, 'NOTES'),
  customFooter: visibleBlockContent(presentation, 'CUSTOM_FOOTER'),
})

const applyDeliveryNoteHeaderPresentation = ({ config = {}, presentation } = {}) => {
  const header = presentation?.resolved?.header
  if (!isObject(header) || !Object.keys(header).length) return config

  const currentStyle = isObject(config?.headerStyle) ? config.headerStyle : {}
  const storeName = text(header.storeName) || text(currentStyle.storeName) || text(config.branchName)
  const address = text(header.address) || text(currentStyle.address) || text(config.address)
  const phone = text(header.phone) || text(currentStyle.phone) || text(config.phone)
  const taxId = text(header.taxId) || text(currentStyle.taxId) || text(config.taxId)
  const logoUrl = text(header.logoUrl) || text(currentStyle.logoUrl) || text(config.logoUrl) || null

  return {
    ...config,
    branchName: header.showStoreName === false ? '' : storeName,
    address: header.showAddress === false ? '' : address,
    phone: header.showPhone === false ? '' : phone,
    taxId: header.showTaxId === false ? '' : taxId,
    logoUrl: header.showLogo === false ? null : logoUrl,
    headerStyle: {
      ...currentStyle,
      ...header,
      storeName,
      address,
      phone,
      taxId,
      logoUrl,
    },
  }
}

const deliveryNoteTypographyToken = (presentation, key, fallback = 'md') => {
  const token = presentation?.resolved?.typography?.[key]
  return ['xs', 'sm', 'md', 'lg', 'xl'].includes(token) ? token : fallback
}

const deliveryNoteTypographyPx = (presentation, key, fallback = 'md') => (
  DELIVERY_NOTE_TYPOGRAPHY_PX[deliveryNoteTypographyToken(presentation, key, fallback)]
  || DELIVERY_NOTE_TYPOGRAPHY_PX.md
)

export {
  applyDeliveryNoteHeaderPresentation,
  deliveryNoteTypographyPx,
  deliveryNoteTypographyToken,
  getDeliveryNoteSnapshotPresentation,
  resolveDeliveryNoteFooterContent,
  resolveDeliveryNotePresentation,
}
