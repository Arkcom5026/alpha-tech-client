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

const deliveryNoteTypographyToken = (presentation, key, fallback = 'md') => {
  const token = presentation?.resolved?.typography?.[key]
  return ['xs', 'sm', 'md', 'lg', 'xl'].includes(token) ? token : fallback
}

const deliveryNoteTypographyPx = (presentation, key, fallback = 'md') => (
  DELIVERY_NOTE_TYPOGRAPHY_PX[deliveryNoteTypographyToken(presentation, key, fallback)]
  || DELIVERY_NOTE_TYPOGRAPHY_PX.md
)

export {
  deliveryNoteTypographyPx,
  deliveryNoteTypographyToken,
  getDeliveryNoteSnapshotPresentation,
  resolveDeliveryNoteFooterContent,
  resolveDeliveryNotePresentation,
}
