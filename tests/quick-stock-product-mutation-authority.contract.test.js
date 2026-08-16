import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/receiving/quick-stock/hooks/useQuickStockProductController.js');
const source = fs.readFileSync(target, 'utf8');

const required = [
  'const productMutationRef = useRef(false);',
  'if (productMutationRef.current) return;',
  'const productIdSnapshot = Number(operationalProduct.id);',
  'const productFormSnapshot = { ...productForm };',
  'const priceFormSnapshot = { ...priceForm };',
  'quick-stock:product:${productIdSnapshot}:save:success',
  'quick-stock:product:${productIdSnapshot}:delete:success',
  'quick-stock:product:local-create:success',
  'delete:refresh:error',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing Quick Stock product mutation authority token: ${token}`);
}

console.log('Quick Stock product mutation authority contract: PASS');
