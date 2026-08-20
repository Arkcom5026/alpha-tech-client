import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const page = fs.readFileSync(
  path.join(root, 'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx'),
  'utf8'
);
const authority = fs.readFileSync(
  path.join(root, 'src/features/deliveryNote/print/workspace/policies/deliveryNoteFinancialAuthority.js'),
  'utf8'
);

assert.match(
  page,
  /resolveDeliveryNotePrintableSale/,
  'delivery note page must delegate printable financial authority to the dedicated policy'
);
assert.match(
  page,
  /sale=\{printableSale\}/,
  'delivery note print shell must receive the presentation-only financial projection'
);
assert.match(
  authority,
  /const lockedDocumentAuthority = replacementAuthorityActive \|\| preparationStatus === 'LOCKED'/,
  'locked preparation or replacement must own the printable financial summary'
);
assert.match(
  authority,
  /calculatePrintableDocumentTotal\(printableItems\)/,
  'printable total must reconcile from the lines actually printed on the delivery note'
);
assert.match(
  authority,
  /return \{[\s\S]*\.\.\.sale,[\s\S]*totalAmount: calculatePrintableDocumentTotal\(printableItems\)/,
  'delivery note presentation must override only the printable sale total'
);
assert.doesNotMatch(
  authority,
  /sale\.totalAmount\s*=/,
  'the source Sale object must not be mutated in place'
);

console.log('Delivery note locked preparation financial summary contract: PASS');
