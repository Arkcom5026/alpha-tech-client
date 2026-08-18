import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const full = read('src/features/bill/pages/PrintBillPageFullTax.jsx')
const delivery = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx')

// Full Tax: visually verified hardware-safe geometry.
assert(
  full.includes('@page { size: A4; margin: 0 !important; }'),
  'Full Tax must keep the verified zero-margin physical page contract'
)
assert(
  full.includes('width: 201mm !important;'),
  'Full Tax must keep the verified 201mm document width'
)
assert(
  full.includes('height: 288mm !important;'),
  'Full Tax must keep the verified 288mm document height'
)
assert(
  full.includes('body:has(.full-tax-print-shell) #root *:has(.full-tax-print-shell)'),
  'Full Tax must isolate itself from POS ancestor pagination'
)
assert(
  full.includes('page-break-after: auto !important;'),
  'Full Tax final page must not force a trailing sheet'
)
assert(
  full.includes('break-after: auto !important;'),
  'Full Tax final page must not force a trailing break'
)

// Delivery Note keeps its independently verified A4 geometry.
assert(
  delivery.includes('@page { size: A4; margin: 6mm !important; }'),
  'Delivery Note must keep its verified 6mm page margin'
)
assert(
  delivery.includes('width: 195mm !important;'),
  'Delivery Note must keep its verified 195mm document width'
)
assert(
  delivery.includes('height: 280mm !important;'),
  'Delivery Note must keep its verified 280mm document height'
)
assert(
  delivery.includes('body:has(.a4-standard-delivery-shell) #root *:has(.a4-standard-delivery-shell)'),
  'Delivery Note ancestor pagination isolation must remain intact'
)

// Module ownership remains independent.
assert(
  !full.includes('@/features/deliveryNote/'),
  'Full Tax must remain bill-module owned'
)

console.log('Full Tax Frame Alignment Contract: PASS')
