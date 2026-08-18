import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const batch = read('src/features/barcode/pages/PrintBarcodeBatchPage.jsx')
const preview = read('src/features/barcode/pages/PreviewBarcodePage.jsx')
const css = read('src/index.css')

assert(batch.includes('@page { margin: 2mm; size: A4; }'), 'Barcode batch must keep its 2mm A4 label-sheet geometry.')
assert(preview.includes('@page { margin: 0mm; size: A4; }'), 'Barcode preview must keep its edge-to-edge A4 preview geometry.')
assert(batch.includes('.c39-barcode') && batch.includes('C39HrP24DhTt'), 'Barcode batch must keep Code39 font authority.')
assert(preview.includes('.c39-barcode') && preview.includes('C39HrP24DhTt'), 'Barcode preview must keep Code39 font authority.')
assert(!batch.includes('FullTaxA4Document') && !preview.includes('FullTaxA4Document'), 'Barcode utility sheets must remain module owned.')
assert(css.includes('--document-font-family: "TH Sarabun New", "Sarabun"'), 'General printed text must retain TH Sarabun-first typography.')

console.log('A4 Document Standardization Wave 5 Utility Contract: PASS')
