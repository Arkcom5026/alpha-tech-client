import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const salesRoutes = read('src/routes/partner/salesRoutes.jsx')
const purchasesRoutes = read('src/routes/partner/purchasesRoutes.jsx')
const creditNote = read('src/features/sales/return/pages/PrintCreditNotePage.jsx')
const inputVat = read('src/features/tax/inputVatReport/pages/InputVatReportPage.jsx')

assert(
  salesRoutes.includes("{ path: 'credit-note/print/:taxDocumentId', element: <PrintCreditNotePage /> }"),
  'Credit Note must remain an explicit active sales print route.'
)
assert(creditNote.includes('credit-note-a4-page'), 'Credit Note must own its A4 presentation namespace.')
assert(creditNote.includes('@page { size: A4; margin: 4mm; }'), 'Credit Note must use the 4mm A4 paper boundary.')
assert(creditNote.includes('width: 201mm !important;'), 'Credit Note must use the print-safe 201mm sheet width.')
assert(creditNote.includes('min-height: 288mm !important;'), 'Credit Note must use the print-safe 288mm sheet height authority.')
assert(creditNote.includes('border: 0.3mm solid #444 !important;'), 'Credit Note must use the standardized document frame.')
assert(creditNote.includes('border-radius: 2.5mm !important;'), 'Credit Note must use the standardized rounded frame.')
assert(creditNote.includes('<div role="banner"'), 'Credit Note must avoid semantic header print suppression.')
assert(!creditNote.includes('FullTaxA4Document'), 'Credit Note must remain module owned.')

assert(
  purchasesRoutes.includes("{ path: 'range-print', element: <BarcodeRangePrintPage /> }"),
  'Barcode range print must remain an active utility print route.'
)
assert(
  purchasesRoutes.includes("{ path: 'print/:id', element: <ListPurchaseOrderReceiptPage /> }"),
  'Purchase receipt print route must not be mistaken for the unrouted legacy receipt template.'
)
assert(
  !inputVat.includes('window.print') && !inputVat.includes('@page'),
  'Active Input VAT report page is a viewer, not an A4 print authority.'
)

console.log('A4 Document Standardization Wave 6 Residual Contract: PASS')
