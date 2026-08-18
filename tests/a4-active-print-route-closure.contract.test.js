import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const salesRoutes = read('src/routes/partner/salesRoutes.jsx')
const purchasesRoutes = read('src/routes/partner/purchasesRoutes.jsx')
const posRoutes = read('src/routes/partner/posPartnerRoutes.jsx')

const fullTax = read('src/features/bill/pages/PrintBillPageFullTax.jsx')
const creditNote = read('src/features/sales/return/pages/PrintCreditNotePage.jsx')
const purchaseOrder = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx')
const salesTax = read('src/features/salesTaxReport/pages/PrintSalesTaxReportPage.jsx')
const customerMoney = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx')
const settlement = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx')
const barcodeBatch = read('src/features/barcode/pages/PrintBarcodeBatchPage.jsx')
const barcodeRange = read('src/features/barcode/pages/BarcodeRangePrintPage.jsx')

assert(salesRoutes.includes('PrintBillPageFullTax'), 'Full-tax print route must remain active.')
assert(salesRoutes.includes('PrintCreditNotePage'), 'Credit-note print route must remain active.')
assert(salesRoutes.includes('PrintDeliveryNotePage'), 'Delivery-note print route must remain active.')
assert(salesRoutes.includes('PrintConsolidatedBillPage') && salesRoutes.includes('PrintConsolidatedTaxPage') && salesRoutes.includes('PrintConsolidatedDeliveryPage'), 'Consolidated print routes must remain active.')
assert(purchasesRoutes.includes('PrintPurchaseOrderPage'), 'Purchase-order print route must remain active.')
assert(purchasesRoutes.includes('PrintBarcodeBatchPage') && purchasesRoutes.includes('BarcodeRangePrintPage'), 'Barcode utility print routes must remain active.')
assert(posRoutes.includes('CustomerMoneyReceiptPrintPage') && posRoutes.includes('DeliveryCreditSettlementPrintPage'), 'Customer-money A4 routes must remain active.')
assert(posRoutes.includes('PrintCustomerReceiptPage') && posRoutes.includes('ReprintCustomerReceiptPage'), 'Customer-receipt print routes must remain active.')
assert(posRoutes.includes('PrintSalesTaxReportPage'), 'Sales-tax report print route must remain active.')

assert(fullTax.includes('FullTaxA4Document'), 'Active full-tax route must use deterministic A4 authority.')
assert(creditNote.includes('credit-note-a4-page') && creditNote.includes('@page { size: A4; margin: 4mm; }'), 'Active credit-note route must use module-owned A4 authority.')
assert(purchaseOrder.includes('purchase-order-a4-page') && purchaseOrder.includes('@page { size: A4; margin: 4mm; }'), 'Active purchase-order route must use module-owned A4 authority.')
assert(salesTax.includes('sales-tax-report-a4-page'), 'Active sales-tax report must use module-owned A4 authority.')
assert(customerMoney.includes('credit-collection-a4'), 'Active customer-money receipt must use its A4 presentation authority.')
assert(settlement.includes('credit-collection-a4'), 'Active settlement print must use its A4 presentation authority.')
assert(barcodeBatch.includes('@page { margin: 2mm; size: A4; }'), 'Barcode batch must preserve approved utility geometry.')
assert(barcodeRange.includes('@page { margin: 0mm; size: A4; }'), 'Barcode range print must preserve approved utility geometry.')

assert(!salesRoutes.includes('PrintRefundReceiptPage'), 'Inactive refund receipt must not be treated as an active route authority.')
assert(!purchasesRoutes.includes('features/pos/purchase/pages/PrintPurchaseOrder'), 'Legacy POS purchase print must not be routed.')
assert(!purchasesRoutes.includes('PrintPurchaseOrderReceiptTemplate'), 'Unrouted purchase-receipt template must not be treated as active authority.')

console.log('A4 Active Print Route Closure Contract: PASS')
