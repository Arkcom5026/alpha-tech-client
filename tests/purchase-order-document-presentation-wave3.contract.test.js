import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx')
const api = read('src/features/purchaseOrder/api/purchaseOrderApi.js')
const presentation = read('src/features/purchaseOrder/presentation/purchaseOrderPresentation.js')
const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx')
const footer = read('src/features/purchaseOrder/components/PurchaseOrderPresentationFooter.jsx')
const settingsPage = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx')
const settingsCard = read('src/features/settings/components/PurchaseOrderPresentationSettingsCard.jsx')

assert.match(api, /getPurchaseOrderPresentation/)
assert.match(api, /\/purchase-orders\/\$\{id\}\/presentation/)
assert.match(page, /Promise\.all\(\[/)
assert.match(page, /getPurchaseOrderPresentation\(id\)/)
assert.match(page, /presentationAuthority/)

assert.match(presentation, /presentationSnapshot/)
assert.match(presentation, /documentPurpose:\s*'PURCHASE_ORDER'/)
assert.match(page, /resolvePurchaseOrderPresentation/)
assert.match(page, /applyPurchaseOrderHeaderPresentation/)

assert.doesNotMatch(shell, /Branch ID:/)
assert.doesNotMatch(shell, /วันที่พิมพ์:/)
assert.match(shell, /headerConfig/)
assert.match(shell, /PurchaseOrderPresentationFooter/)
assert.match(footer, /data-testid="purchase-order-presentation-footer"/)

assert.match(shell, /@page \{ size: A4; margin: 4mm; \}/)
assert.match(shell, /width: 201mm !important/)
assert.match(shell, /height: 288mm !important/)
assert.match(shell, /signature-space absolute bottom-\[8mm\]/)

assert.match(settingsPage, /PurchaseOrderPresentationSettingsCard/)
assert.match(settingsCard, /upsertDocumentPresentationLayer\(branch\.documentHeaderConfig, 'PURCHASE_ORDER'/)
assert.match(settingsCard, /PurchaseOrderPresentationFooter/)

console.log('purchase-order-document-presentation-wave3.contract.test.js: PASS')
