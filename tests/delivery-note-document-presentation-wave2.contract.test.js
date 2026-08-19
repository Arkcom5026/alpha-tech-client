import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  applyDeliveryNoteHeaderPresentation,
  deliveryNoteTypographyPx,
  resolveDeliveryNoteFooterContent,
  resolveDeliveryNotePresentation,
} from '../src/features/deliveryNote/presentation/deliveryNotePresentation.js'

const branch = {
  documentHeaderConfig: {
    version: 2,
    shared: { header: { storeName: 'ร้านปัจจุบัน' } },
    documents: {
      DELIVERY_NOTE: {
        typography: { footer: 'lg' },
        blocks: {
          DELIVERY_TERMS: { visible: true, content: 'ตรวจสอบสินค้าก่อนลงนาม' },
          NOTES: { visible: true, content: 'หมายเหตุปัจจุบัน' },
          CUSTOM_FOOTER: { visible: true, content: 'ขอบคุณที่ใช้บริการ' },
        },
      },
    },
  },
}

const currentPresentation = resolveDeliveryNotePresentation({ branch })
assert.equal(currentPresentation.documentPurpose, 'DELIVERY_NOTE')
assert.equal(resolveDeliveryNoteFooterContent(currentPresentation).deliveryTerms, 'ตรวจสอบสินค้าก่อนลงนาม')
assert.equal(deliveryNoteTypographyPx(currentPresentation, 'footer'), 12)

const historicalPresentation = {
  version: 2,
  documentPurpose: 'DELIVERY_NOTE',
  resolved: {
    header: { storeName: 'ชื่อร้าน ณ วันที่ออกเอกสาร', showStoreName: true },
    typography: { footer: 'sm' },
    blocks: {
      DELIVERY_TERMS: { visible: true, content: 'เงื่อนไขเดิม' },
      CUSTOM_FOOTER: { visible: true, content: 'ข้อความเดิม' },
    },
  },
}
const authority = {
  presentationSnapshot: {
    snapshotVersion: 1,
    documentPurpose: 'DELIVERY_NOTE',
    rendererFamily: 'A4',
    presentation: historicalPresentation,
  },
}
const issuedPresentation = resolveDeliveryNotePresentation({ authority, branch })
assert.deepEqual(issuedPresentation, historicalPresentation)
assert.equal(resolveDeliveryNoteFooterContent(issuedPresentation).deliveryTerms, 'เงื่อนไขเดิม')
assert.equal(deliveryNoteTypographyPx(issuedPresentation, 'footer'), 10)

const projectedHeader = applyDeliveryNoteHeaderPresentation({
  config: { branchName: 'ชื่อสด', address: 'ที่อยู่สด', headerStyle: { storeName: 'ชื่อสด', address: 'ที่อยู่สด' } },
  presentation: issuedPresentation,
})
assert.equal(projectedHeader.branchName, 'ชื่อร้าน ณ วันที่ออกเอกสาร')

const page = readFileSync(new URL('../src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx', import.meta.url), 'utf8')
const shell = readFileSync(new URL('../src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../src/features/deliveryNote/components/DeliveryNotePresentationFooter.jsx', import.meta.url), 'utf8')
const workspaceApi = readFileSync(new URL('../src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js', import.meta.url), 'utf8')
const settingsPage = readFileSync(new URL('../src/features/settings/pages/DocumentFormatSettingsPage.jsx', import.meta.url), 'utf8')
const settingsCard = readFileSync(new URL('../src/features/settings/components/DeliveryNotePresentationSettingsCard.jsx', import.meta.url), 'utf8')

assert.match(workspaceApi, /\/sales\/\$\{saleId\}\/delivery-note/)
assert.match(page, /loadSaleDeliveryNoteAuthority/)
assert.match(page, /resolveDeliveryNotePresentation/)
assert.match(page, /applyDeliveryNoteHeaderPresentation/)
assert.match(page, /DeliveryNotePresentationFooter/)
assert.match(shell, /presentationFooter/)
assert.match(shell, /dn-presentation-footer-slot/)
assert.match(shell, /bottom:\s*24mm/, 'delivery-note semantic footer must stay inside the reserved final-page footer zone')
assert.match(footer, /--delivery-note-footer-font-size/)
assert.match(footer, /เงื่อนไขการส่งมอบ/)
assert.match(settingsPage, /DeliveryNotePresentationSettingsCard/)
assert.match(settingsCard, /upsertDocumentPresentationLayer/)
assert.match(settingsCard, /'DELIVERY_NOTE'/)
assert.match(settingsCard, /DeliveryNotePresentationFooter/, 'settings preview must reuse the renderer primitive')

console.log('delivery-note-document-presentation-wave2.contract.test.js: PASS')
