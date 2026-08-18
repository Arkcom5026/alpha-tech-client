import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const sales = read('src/features/salesTaxReport/pages/PrintSalesTaxReportPage.jsx')
const input = read('src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx')

const assertA4ReportStandard = (source, namespace, label) => {
  assert(source.includes(`@page { size: A4 portrait; margin: 4mm; }`), `${label} must use the 4mm A4 paper boundary.`)
  assert(source.includes(`${namespace}-a4-page`), `${label} must own a namespaced A4 page surface.`)
  assert(source.includes('width: 201mm !important;'), `${label} must use the 201mm print-safe width.`)
  assert(source.includes('min-height: 288mm !important;'), `${label} must use the 288mm print-safe height.`)
  assert(source.includes('height: 288mm !important;'), `${label} must lock the printable page height.`)
  assert(source.includes('padding: 5mm !important;'), `${label} must reserve the standard internal content padding.`)
  assert(source.includes('border: 0.3mm solid #444 !important;'), `${label} must print the standard document frame.`)
  assert(source.includes('border-radius: 2.5mm !important;'), `${label} must print the standard rounded frame.`)
  assert(source.includes('var(--document-font-family'), `${label} must use the TH Sarabun-first document typography authority.`)
  assert(source.includes('role="banner"'), `${label} must use print-safe banner semantics instead of a global header element.`)
  assert(!source.includes("height: '297mm'"), `${label} must not retain the legacy 297mm content box.`)
  assert(!source.includes('@page { size: A4 portrait; margin: 0; }'), `${label} must not retain zero-margin A4 geometry.`)
}

assertA4ReportStandard(sales, 'sales-tax-report', 'Sales Tax Report')
assertA4ReportStandard(input, 'input-tax-report', 'Input Tax Report')

assert(sales.includes('<SalesTaxTable'), 'Sales Tax Report must preserve its module-owned sales/returns table behavior.')
assert(sales.includes('totalBase') && sales.includes('totalVat') && sales.includes('totalAmount'), 'Sales Tax Report must preserve its report summary calculations.')
assert(input.includes('<InputTaxReportTable'), 'Input Tax Report must preserve its module-owned report table behavior.')
assert(input.includes('fetchInputTaxReportAction') && input.includes('summary.grandTotal'), 'Input Tax Report must preserve its fetch authority and summary behavior.')

console.log('A4 Document Standardization Wave 4 Contract: PASS')
