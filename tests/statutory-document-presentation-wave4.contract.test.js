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
    expect(canonicalPrintPage).toContain('data.document.type === \'SHORT_TAX_INVOICE\'')
    expect(canonicalPrintPage).toContain('<BillLayoutShortTax')
    expect(canonicalPrintPage).toContain('<FullTaxA4Document')
    expect(canonicalPrintPage).not.toContain('getConsolidatedTaxPrintable')
    expect(canonicalPrintPage).not.toContain('branchName: legalHeader.storeName')
    expect(canonicalPrintPage).not.toContain('taxId: legalHeader.taxId')
  })
})
