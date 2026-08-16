const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/features/supplier/workspace/SupplierEditWorkspace.jsx'),
  'utf8',
);

const required = [
  'supplierContextRef',
  'loadRequestRef',
  'mutationRequestRef',
  'supplierIdSnapshot',
  'shopSlugSnapshot',
  'branchIdSnapshot',
  'payloadSnapshot',
  'supplier:update:${supplierIdSnapshot}:context-changed:error',
  'supplier:delete:${supplierIdSnapshot}:context-changed:error',
  'supplier:edit:${supplierIdSnapshot}:load:error',
];

for (const marker of required) {
  if (!source.includes(marker)) {
    throw new Error(`Missing Supplier Edit cross-entity authority marker: ${marker}`);
  }
}

console.log('Supplier Edit Cross-Entity Authority Contract: PASS');
