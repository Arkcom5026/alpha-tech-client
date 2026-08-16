const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/supplier/workspace/SupplierLegacyUpdateWorkspace.jsx'),
  'utf8',
);

const required = [
  'const mutationRef = useRef(false);',
  'const supplierContextRef = useRef({ id, shopSlug, branchId });',
  'const loadRequestRef = useRef(0);',
  'const updateRequestRef = useRef(0);',
  'const supplierIdSnapshot = id;',
  'const shopSlugSnapshot = shopSlug;',
  'const branchIdSnapshot = branchId;',
  'const payloadSnapshot = sanitizeLegacySupplierUpdatePayload(formData);',
  'requestId === updateRequestRef.current',
  '`supplier:legacy:${supplierIdSnapshot}:update:context-changed:error`',
  '`supplier:legacy:${supplierIdSnapshot}:update:success`',
  '`supplier:legacy:${supplierIdSnapshot}:update:error`',
];

for (const fragment of required) {
  if (!source.includes(fragment)) {
    throw new Error(`Missing Supplier legacy authority contract fragment: ${fragment}`);
  }
}

console.log('Supplier legacy update cross-context authority contract: PASS');
