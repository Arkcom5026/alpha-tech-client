import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (c, m) => { if (!c) throw new Error(m) }

const full = read('src/features/bill/pages/PrintBillPageFullTax.jsx')
const delivery = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx')

for (const src of [full, delivery]) {
  assert(src.includes('@page { size: A4; margin: 6mm !important; }'), 'A4 margin must be 6mm')
  assert(src.includes('width: 195mm !important;'), 'frame width must be 195mm')
  assert(src.includes('height: 280mm !important;'), 'frame height must be 280mm')
  assert(src.includes('min-height: 0 !important;'), 'print ancestor min-height must collapse')
  assert(src.includes('height: auto !important;'), 'print ancestor height must collapse')
  assert(src.includes('position: static !important;'), 'print ancestor positioning must be normalized')
  assert(src.includes('transform: none !important;'), 'print ancestor transforms must be neutralized')
}

assert(full.includes('body:has(.full-tax-print-shell) #root *:has(.full-tax-print-shell)'), 'full tax must isolate itself from POS layout pagination')
assert(delivery.includes('body:has(.a4-standard-delivery-shell) #root *:has(.a4-standard-delivery-shell)'), 'delivery note reference isolation must remain intact')
assert(!full.includes('@/features/deliveryNote/'), 'bill must remain module owned')

console.log('Full Tax Frame Alignment Contract: PASS')
