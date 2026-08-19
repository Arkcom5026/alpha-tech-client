import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('Statutory Document Presentation Wave 4', () => {
  const guard = read('src/features/printing/presentation/statutoryPresentation.js')
  const capability = read('src/features/printing/presentation/presentationCapabilityRegistry.js')
  const creditNote = read('src/features/sales/return/pages/PrintCreditNotePage.jsx')
  const taxApi = read('src/features/tax/intake/api/taxIntakeApi.js')
  const canonicalPrintPage = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx')
  const canonicalFullTaxRenderer = read('src/features/combinedBilling/bill/components/FullTaxA4Document.jsx')
  const statutorySettings = read('src/features/settings/components/StatutoryPresentationSettingsCard.jsx')
  const settingsPage = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx')

  it('keeps statutory document classes restricted', () => {
    expect(capability).toContain('FULL_TAX_INVOICE: STATUTORY_A4')
    expect(capability).toContain('CREDIT_NOTE: STATUTORY_A4')
    expect(capability).toContain('SHORT_TAX_INVOICE: STATUTORY_THERMAL')
    expect(capability).toContain("protectedBlocks: ['DOCUMENT_META', 'PARTY', 'ITEM_TABLE', 'TOTALS', 'SYSTEM_NOTICE']")
  })

  it('allows only visual header properties through the statutory guard', () => {
    expect(guard).toContain('STATUTORY_HEADER_VISUAL_KEYS')
    expect(guard).toContain("'showLogo'")
    expect(guard).toContain("'logoUrl'")
    expect(guard).toContain("'logoPosition'")
    expect(guard).toContain("'logoSize'")
    expect(guard).toContain("'textAlign'")
    expect(guard).not.toContain("STATUTORY_HEADER_VISUAL_KEYS = Object.freeze([\n  'storeName'")
    expect(guard).toContain('storeName: text(issuer?.legalName)')
    expect(guard).toContain('address: text(issuer?.registeredAddress)')
    expect(guard).toContain('taxId: text(issuer?.taxId)')
    expect(guard).toContain('showStoreName: true')
    expect(guard).toContain('showAddress: true')
    expect(guard).toContain('showTaxId: true')
  })

  it('renders credit-note legal facts from tax projection, never store overrides', () => {
    expect(creditNote).toContain("documentPurpose: 'CREDIT_NOTE'")
    expect(creditNote).toContain('presentationSnapshot: projection?.presentationSnapshot')
    expect(creditNote).toContain('{projection.issuer.legalName}')
    expect(creditNote).toContain('{projection.issuer.taxId}')
    expect(creditNote).toContain('{projection.issuer.registeredAddress}')
    expect(creditNote).toContain('credit-note-presentation-footer')
    expect(creditNote).not.toContain('{legalHeader.storeName}')
    expect(creditNote).not.toContain('{legalHeader.taxId}')
  })

  it('loads canonical issued tax facts and presentation authority independently', () => {
    expect(taxApi).toContain('getTaxDocumentPresentation')
    expect(taxApi).toContain('/presentation`')
    expect(canonicalPrintPage).toContain('Promise.all([')
    expect(canonicalPrintPage).toContain('getOutputTaxPrintable({ branchId, taxDocumentId })')
    expect(canonicalPrintPage).toContain('getTaxDocumentPresentation({ branchId, taxDocumentId })')
    expect(canonicalPrintPage).toContain('resolveStatutoryPresentation')
    expect(canonicalPrintPage).toContain('presentationSnapshot: presentationAuthority?.presentationSnapshot')
  })

  it('keeps full and short tax legal issuer facts bound to TaxDocument printable authority', () => {
    expect(canonicalPrintPage).toContain("branchName: issuer.legalName || '-'")
    expect(canonicalPrintPage).toContain("address: issuer.registeredAddress || '-'")
    expect(canonicalPrintPage).toContain("taxId: issuer.taxId || '-'")
    expect(canonicalPrintPage).toContain("const actualDocumentType = data.document?.type")
    expect(canonicalPrintPage).toContain("actualDocumentType === 'SHORT_TAX_INVOICE'")
    expect(canonicalPrintPage).toContain("actualDocumentType === 'FULL_TAX_INVOICE'")
    expect(canonicalPrintPage).toContain('expectedDocumentType && actualDocumentType !== expectedDocumentType')
    expect(canonicalPrintPage).toContain('<BillLayoutShortTax')
    expect(canonicalPrintPage).toContain('<FullTaxA4Document')
    expect(canonicalPrintPage).not.toContain('getConsolidatedTaxPrintable')
    expect(canonicalPrintPage).not.toContain('branchName: legalHeader.storeName')
    expect(canonicalPrintPage).not.toContain('taxId: legalHeader.taxId')
  })

  it('reserves bounded last-page geometry in the canonical full-tax renderer only when a footer is visible', () => {
    expect(canonicalPrintPage).toContain('presentationFooter={view.presentationFooter}')
    expect(canonicalFullTaxRenderer).toContain('const MAX_ROWS_LAST_PAGE = 20;')
    expect(canonicalFullTaxRenderer).toContain('const MAX_ROWS_NORMAL_PAGE = 24;')
    expect(canonicalFullTaxRenderer).toContain('const MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER = 17;')
    expect(canonicalFullTaxRenderer).toContain('const PRESENTATION_FOOTER_HEIGHT_MM = 18;')
    expect(canonicalFullTaxRenderer).toContain('paginateItemsWithReservedFooter(displayItems)')
    expect(canonicalFullTaxRenderer).toContain('hasPresentationFooter ? MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER : MAX_ROWS_LAST_PAGE')
    expect(canonicalFullTaxRenderer).toContain('data-testid="full-tax-presentation-footer-zone"')
    expect(canonicalFullTaxRenderer).toContain('bottom-[50mm]')
    expect(canonicalFullTaxRenderer).toContain('overflow-hidden')
    expect(canonicalFullTaxRenderer).toContain('height: `${PRESENTATION_FOOTER_HEIGHT_MM}mm`')
    expect(canonicalFullTaxRenderer).toContain('className="absolute bottom-[28mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-5 text-[13px]"')
    expect(canonicalFullTaxRenderer).toContain('className="absolute bottom-[5mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[15px]"')
  })

  it('keeps statutory footer content structured and never enables arbitrary markup or style injection', () => {
    expect(canonicalFullTaxRenderer).toContain('<StatutoryTaxPresentationFooter')
    expect(canonicalFullTaxRenderer).toContain('notes={normalizedPresentationFooter.notes}')
    expect(canonicalFullTaxRenderer).toContain('customFooter={normalizedPresentationFooter.customFooter}')
    expect(canonicalFullTaxRenderer).not.toContain('dangerouslySetInnerHTML')
    expect(canonicalFullTaxRenderer).not.toContain('presentationFooter?.html')
    expect(canonicalFullTaxRenderer).not.toContain('presentationFooter?.css')
  })

  it('exposes statutory settings without legal identity edit fields', () => {
    expect(statutorySettings).toContain('getDocumentPresentationCapability')
    expect(statutorySettings).toContain("capability?.storeBlocks?.includes('NOTES')")
    expect(statutorySettings).toContain("capability?.storeBlocks?.includes('CUSTOM_FOOTER')")
    expect(statutorySettings).toContain('header: {')
    expect(statutorySettings).toContain('showLogo: form.showLogo')
    expect(statutorySettings).toContain('logoPosition: form.logoPosition')
    expect(statutorySettings).toContain('textAlign: form.textAlign')
    expect(statutorySettings).not.toContain('headerStoreName')
    expect(statutorySettings).not.toContain('headerTaxId')
    expect(statutorySettings).not.toContain('headerAddress')
    expect(statutorySettings).toContain('ข้อมูลภาษีถูกล็อกโดยระบบ')
  })

  it('mounts full tax, credit note, and short tax controls in the single document settings surface', () => {
    expect(settingsPage).toContain('StatutoryPresentationSettingsCard')
    expect(settingsPage).toContain('documentPurpose="FULL_TAX_INVOICE"')
    expect(settingsPage).toContain('documentPurpose="CREDIT_NOTE"')
    expect(settingsPage).toContain('documentPurpose="SHORT_TAX_INVOICE"')
  })
})
