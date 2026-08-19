import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  applyCustomerReceiptHeaderPresentation,
  customerReceiptTypographyPx,
  resolveCustomerReceiptFooterContent,
  resolveCustomerReceiptPresentation,
} from '../src/features/customerReceipt/presentation/customerReceiptPresentation.js'

const branch = {
  documentHeaderConfig: {
    version: 2,
    shared: { header: { storeName: 'ร้านปัจจุบัน' } },
    documents: {
      CUSTOMER_RECEIPT: {
        typography: { footer: 'lg' },
        blocks: {
          NOTES: { visible: true, content: 'หมายเหตุปัจจุบัน' },
          CUSTOM_FOOTER: { visible: true, content: 'ขอบคุณที่ใช้บริการ' },
        },
      },
    },
  },
}

const current = resolveCustomerReceiptPresentation({ branch })
assert.equal(current.documentPurpose, 'CUSTOMER_RECEIPT')
assert.equal(resolveCustomerReceiptFooterContent(current).notes, 'หมายเหตุปัจจุบัน')
assert.equal(customerReceiptTypographyPx(current, 'footer'), 12)

const historicalPresentation = {
  version: 2,
  documentPurpose: 'CUSTOMER_RECEIPT',
  resolved: {
    header: { storeName: 'ร้าน ณ วันที่รับเงิน', showStoreName: true },
    typography: { footer: 'sm' },
    blocks: {
      NOTES: { visible: true, content: 'หมายเหตุเดิม' },
      CUSTOM_FOOTER: { visible: true, content: 'ข้อความเดิม' },
    },
  },
}
const receipt = {
  presentationSnapshot: {
    snapshotVersion: 1,
    documentPurpose: 'CUSTOMER_RECEIPT',
    rendererFamily: 'A4',
    presentation: historicalPresentation,
  },
}
const issued = resolveCustomerReceiptPresentation({ receipt, branch })
assert.deepEqual(issued, historicalPresentation)
assert.equal(resolveCustomerReceiptFooterContent(issued).customFooter, 'ข้อความเดิม')
assert.equal(customerReceiptTypographyPx(issued, 'footer'), 10)

const config = applyCustomerReceiptHeaderPresentation({
  config: { branchName: 'ชื่อสด', headerStyle: { storeName: 'ชื่อสด' } },
  presentation: issued,
})
assert.equal(config.branchName, 'ร้าน ณ วันที่รับเงิน')

const layout = readFileSync(new URL('../src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx', import.meta.url), 'utf8')
const a4 = readFileSync(new URL('../src/features/customerReceipt/components/CustomerReceiptA4Document.jsx', import.meta.url), 'utf8')
const footer = readFileSync(new URL('../src/features/customerReceipt/components/CustomerReceiptPresentationFooter.jsx', import.meta.url), 'utf8')
const settingsPage = readFileSync(new URL('../src/features/settings/pages/DocumentFormatSettingsPage.jsx', import.meta.url), 'utf8')
const settingsCard = readFileSync(new URL('../src/features/settings/components/CustomerReceiptPresentationSettingsCard.jsx', import.meta.url), 'utf8')

assert.match(layout, /resolveCustomerReceiptPresentation/)
assert.match(layout, /applyCustomerReceiptHeaderPresentation/)
assert.match(layout, /CustomerReceiptPresentationFooter/)
assert.match(layout, /presentationFooter=\{presentationFooter\}/)
assert.match(a4, /presentationFooter = null/)
assert.match(a4, /bottom-\[31mm\]/, 'Customer Receipt totals geometry must remain unchanged')
assert.match(a4, /bottom-\[5mm\]/, 'Customer Receipt signatures geometry must remain unchanged')
assert.match(a4, /\{presentationFooter \? <div className="mt-1">\{presentationFooter\}<\/div> : null\}/, 'footer must reuse the existing left summary zone rather than changing pagination')
assert.match(footer, /max-h-\[11mm\] overflow-hidden/, 'custom footer must be bounded inside its physical safe area')
assert.match(footer, /--customer-receipt-footer-font-size/)
assert.match(settingsPage, /CustomerReceiptPresentationSettingsCard/)
assert.match(settingsCard, /upsertDocumentPresentationLayer/)
assert.match(settingsCard, /'CUSTOMER_RECEIPT'/)
assert.match(settingsCard, /maxLength=\{240\}/, 'settings must constrain footer content for A4 safety')
assert.match(settingsCard, /CustomerReceiptPresentationFooter/, 'settings preview must reuse the same semantic footer')

console.log('customer-receipt-document-presentation-wave2.contract.test.js: PASS')
