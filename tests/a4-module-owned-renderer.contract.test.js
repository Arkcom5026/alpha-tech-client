import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const consolidatedBill = read('src/features/combinedBilling/pages/PrintConsolidatedBillPage.jsx')
const consolidatedTax = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx')
const combinedRenderer = read('src/features/combinedBilling/bill/components/FullTaxA4Document.jsx')
const customerReceiptLayout = read('src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx')
const customerReceiptRenderer = read('src/features/customerReceipt/components/CustomerReceiptA4Document.jsx')
const purchaseOrderShell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx')
const salesTaxReport = read('src/features/salesTaxReport/pages/PrintSalesTaxReportPage.jsx')
const inputTaxReport = read('src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx')
const creditNote = read('src/features/sales/return/pages/PrintCreditNotePage.jsx')

assert(!consolidatedBill.includes("@/features/bill/components/FullTaxA4Document"), 'Consolidated Bill A4 must not import the bill module document renderer.')
assert(!consolidatedTax.includes("@/features/bill/components/FullTaxA4Document"), 'Consolidated Tax A4 must not import the bill module document renderer.')
assert(consolidatedBill.includes("../bill/components/FullTaxA4Document"), 'Consolidated Bill A4 must use its module-owned renderer.')
assert(consolidatedTax.includes("../bill/components/FullTaxA4Document"), 'Consolidated Tax A4 must use its module-owned renderer.')
assert(combinedRenderer.includes('MAX_ROWS_LAST_PAGE = 20'), 'Combined Billing renderer must own its row capacity.')
assert(combinedRenderer.includes('PRINT_PAGE_MARGIN_MM = 4'), 'Combined Billing renderer must own its print-safe A4 geometry.')

assert(!customerReceiptLayout.includes("@/features/bill/components/FullTaxA4Document"), 'Customer Receipt A4 must not import the bill module document renderer.')
assert(customerReceiptLayout.includes("./CustomerReceiptA4Document"), 'Customer Receipt must use its module-owned A4 renderer.')
assert(customerReceiptRenderer.includes('customer-receipt-a4-page'), 'Customer Receipt renderer must own a namespaced A4 presentation surface.')
assert(customerReceiptRenderer.includes('LAST_PAGE_ROWS = 20'), 'Customer Receipt renderer must own its row capacity.')
assert(customerReceiptRenderer.includes('@page { size: A4; margin: 4mm; }'), 'Customer Receipt renderer must own its print-safe A4 geometry.')

assert(purchaseOrderShell.includes('purchase-order-a4-page'), 'Purchase Order must own a namespaced A4 presentation surface.')
assert(purchaseOrderShell.includes('@page { size: A4; margin: 4mm; }'), 'Purchase Order must own its print-safe A4 geometry.')
assert(!purchaseOrderShell.includes('@/features/bill/'), 'Purchase Order must not import document renderers from the bill module.')
assert(!purchaseOrderShell.includes('@/features/customerReceipt/'), 'Purchase Order must not import document renderers from the customerReceipt module.')
assert(!purchaseOrderShell.includes('@/features/combinedBilling/'), 'Purchase Order must not import document renderers from the combinedBilling module.')

assert(salesTaxReport.includes('sales-tax-report-a4-page'), 'Sales Tax Report must own a namespaced A4 presentation surface.')
assert(salesTaxReport.includes('@page { size: A4 portrait; margin: 4mm; }'), 'Sales Tax Report must own its print-safe A4 geometry.')
assert(!salesTaxReport.includes('@/features/bill/'), 'Sales Tax Report must not import document renderers from the bill module.')
assert(!salesTaxReport.includes('@/features/inputTaxReport/'), 'Sales Tax Report must not import the input-tax report renderer.')

assert(inputTaxReport.includes('input-tax-report-a4-page'), 'Input Tax Report must own a namespaced A4 presentation surface.')
assert(inputTaxReport.includes('@page { size: A4 portrait; margin: 4mm; }'), 'Input Tax Report must own its print-safe A4 geometry.')
assert(!inputTaxReport.includes('@/features/bill/'), 'Input Tax Report must not import document renderers from the bill module.')
assert(!inputTaxReport.includes('@/features/salesTaxReport/'), 'Input Tax Report must not import the sales-tax report renderer.')

assert(creditNote.includes('credit-note-a4-page'), 'Credit Note must own a namespaced A4 presentation surface.')
assert(creditNote.includes('@page { size: A4; margin: 4mm; }'), 'Credit Note must own its print-safe A4 geometry.')
assert(!creditNote.includes('@/features/bill/'), 'Credit Note must not import document renderers from the bill module.')
assert(!creditNote.includes('@/features/customerReceipt/'), 'Credit Note must not import document renderers from the customer receipt module.')
assert(!creditNote.includes('@/features/combinedBilling/'), 'Credit Note must not import document renderers from the combined billing module.')

console.log('A4 Module-Owned Renderer Contract: PASS')
