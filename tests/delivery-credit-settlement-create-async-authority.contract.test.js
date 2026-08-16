import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx');
const source = fs.readFileSync(file, 'utf8');

const required = [
  'const mountedRef = useRef(true);',
  'const creditContextRef = useRef(null);',
  'const creditRequestRef = useRef(0);',
  'const createRequestRef = useRef(0);',
  'const customerIdSnapshot = Number(customer?.id);',
  'creditContextRef.current === customerIdSnapshot',
  "setWorkspace(null);",
  'if (!ownsRequest()) return { ok: false, stale: true };',
  "customer-money-settlement:create:${customerIdSnapshot}:credits-load:error",
  'const requestId = ++createRequestRef.current;',
  'if (ownsRequest()) navigate(`../${result.id}`);',
  'if (ownsRequest()) setCreditError(',
  'if (ownsRequest()) {\n        savingRef.current = false;',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing create async authority contract token: ${token}`);
  }
}

if (!source.includes('creditRequestRef.current += 1;') || !source.includes('createRequestRef.current += 1;')) {
  throw new Error('Unmount must invalidate both credit-load and create requests');
}

console.log('Delivery Credit Settlement Create Async Authority Contract: PASS');
