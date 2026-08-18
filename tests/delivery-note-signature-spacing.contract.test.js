import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const shell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');

assert(
  shell.includes('body .a4-standard-delivery-frame .dn-signatures')
    && shell.includes('bottom: 1mm !important;'),
  'Delivery Note signature block must stay close to the physical page edge for handwritten signing space.'
);

assert(
  shell.includes('@page { size: A4; margin: 6mm !important; }')
    && shell.includes('width: 195mm !important;')
    && shell.includes('height: 280mm !important;'),
  'Delivery Note verified A4 geometry must remain unchanged while adjusting signature spacing.'
);

assert(
  shell.includes('page-break-after: auto !important;')
    && shell.includes('break-after: auto !important;'),
  'Delivery Note trailing-blank-page protection must remain intact.'
);

console.log('Delivery Note Signature Spacing Contract: PASS');
