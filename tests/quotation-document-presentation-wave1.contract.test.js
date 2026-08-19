import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const printPageSource = readFileSync(
  new URL('../src/features/quotation/pages/QuotationPrintPage.jsx', import.meta.url),
  'utf8',
)
const footerSource = readFileSync(
  new URL('../src/features/quotation/components/QuotationPresentationFooter.jsx', import.meta.url),
  'utf8',
)
const settingsPageSource = readFileSync(
  new URL('../src/features/settings/pages/DocumentFormatSettingsPage.jsx', import.meta.url),
  'utf8',
)
const settingsCardSource = readFileSync(
  new URL('../src/features/settings/components/QuotationPresentationSettingsCard.jsx', import.meta.url),
  'utf8',
)

assert.match(printPageSource, /resolveQuotationPresentation/, 'quotation renderer must resolve Draft vs Issued presentation authority')
assert.match(printPageSource, /listStorePaymentAccounts/, 'draft quotation must resolve selected active store payment accounts')
assert.match(printPageSource, /QuotationPresentationFooter/, 'quotation renderer must use the semantic presentation footer')
assert.match(printPageSource, /quotationTerms\.paymentTerms/, 'payment-term display must use document-over-store presentation precedence')
assert.match(footerSource, /บัญชีรับโอน/, 'semantic footer must render selected payment accounts')
assert.match(footerSource, /--quotation-footer-font-size/, 'semantic footer must consume constrained typography tokens')
assert.match(settingsPageSource, /QuotationPresentationSettingsCard/, 'document format settings must remain the single entry point for quotation presentation settings')
assert.match(settingsPageSource, /const sharedPresentationProps = \{[\s\S]*onBranchChange: setBranch,[\s\S]*\};/, 'document workspaces must share branch-authority updates without resetting the header form')
assert.match(settingsPageSource, /activeWorkspace === 'QUOTATION'[\s\S]*<QuotationPresentationSettingsCard \{\.\.\.sharedPresentationProps\} \/>/, 'quotation workspace must consume the shared branch-authority callback')
assert.match(settingsCardSource, /onBranchChange\?\.\(updated \|\| \{ \.\.\.branch, documentHeaderConfig \}\)/, 'saving quotation settings must update parent branch authority without resetting unsaved header form state')
assert.match(settingsCardSource, /upsertDocumentPresentationLayer/, 'quotation settings must write through the V2 compatibility-safe layer writer')
assert.match(settingsCardSource, /createStorePaymentAccount/, 'quotation settings must create branch-owned payment-account authority instead of free-text account blocks')
assert.match(settingsCardSource, /บันทึกใบเสนอราคา/, 'quotation settings must expose a dedicated document-type save action')

console.log('quotation-document-presentation-wave1.contract.test.js: PASS')
