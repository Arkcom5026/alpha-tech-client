import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const api = read('src/features/combinedBilling/api/combinedBillingApi.js')
const page = read('src/features/combinedBilling/pages/CombinedDocumentDetailPage.jsx')
const shell = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentInvoiceShell.jsx')
const presentation = read('src/features/combinedBilling/presentation/combinedBillingPresentation.js')
const footer = read('src/features/combinedBilling/detail/workspace/components/CombinedBillingPresentationFooter.jsx')
const settingsPage = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx')
const settingsCard = read('src/features/settings/components/CombinedBillingPresentationSettingsCard.jsx')

assert.match(api, /getCombinedBillingPresentation/)
assert.match(api, /Promise\.all\(\[/)
assert.match(api, /presentationAuthority:/)
assert.match(page, /combinedBilling: documentDetail/)
assert.match(page, /loadCombinedBillingByIdAction: fetchDocumentById/)
assert.match(shell, /resolveCombinedBillingHeader/)
assert.match(shell, /CombinedBillingPresentationFooter/)
assert.doesNotMatch(shell, /บริษัท ตัวอย่าง จำกัด/)
assert.doesNotMatch(shell, /0123456789012/)
assert.match(presentation, /presentationSnapshot/)
assert.match(footer, /data-testid="combined-billing-presentation-footer"/)
assert.match(settingsPage, /CombinedBillingPresentationSettingsCard/)
assert.match(settingsCard, /upsertDocumentPresentationLayer\(branch\.documentHeaderConfig, 'COMBINED_BILLING'/)

console.log('combined-billing-document-presentation-wave3.contract.test.js: PASS')
