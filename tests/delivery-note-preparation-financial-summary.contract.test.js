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

assert.match(
  page,
  /const lockedDocumentAuthority = replacementAuthorityActive \|\| preparation\?\.status === 'LOCKED'/,
  'locked preparation or replacement must own the printable financial summary'
);
assert.match(
  page,
  /const preparedDocumentTotal = useMemo\(\(\) => \{/,
  'delivery note must derive a printable document total separately from Sale authority'
);
assert.match(
  page,
  /preparedSaleItems\.reduce\(/,
  'printable total must reconcile from the lines actually printed on the delivery note'
);
assert.match(
  page,
  /return \{ \.\.\.currentSale, totalAmount: preparedDocumentTotal \};/,
  'delivery note presentation must override only the printable sale total'
);
assert.match(
  page,
  /<DeliveryNotePrintShell[\s\S]*sale=\{printableSale\}/,
  'delivery note print shell must receive the presentation-only financial projection'
);
assert.doesNotMatch(
  page,
  /currentSale\s*=\s*\{[^}]*totalAmount:/,
  'the source Sale object must not be mutated in place'
);

console.log('Delivery note locked preparation financial summary contract: PASS');
