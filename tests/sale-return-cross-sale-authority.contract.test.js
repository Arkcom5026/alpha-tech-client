import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/sales/return/pages/CreateReturnPage.jsx');
const source = fs.readFileSync(target, 'utf8');

const required = [
  'const saleContextRef = useRef({ saleId, shopSlug });',
  'const eligibilityRequestRef = useRef(0);',
  'const targetSaleId = saleId;',
  'const targetShopSlug = shopSlug;',
  'sale-return:${targetSaleId}',
  'context-changed-after-complete:error',
  'credit-note:context-changed:error',
  'feedback.actionSuccess',
  'feedback.actionError',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing sale-return authority token: ${token}`);
}

if (source.includes('getSaleReturnEligibility(saleId).then(setEligibility)')) {
  throw new Error('Sale return eligibility still allows unowned stale response writes.');
}

console.log('Sale return cross-sale authority contract: PASS');
