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
}
assert(!full.includes('@/features/deliveryNote/'), 'bill must remain module owned')
console.log('Full Tax Frame Alignment Contract: PASS')
