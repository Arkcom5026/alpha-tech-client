import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(
  process.cwd(),
  'src/features/customerDeposit/pages/ListCustomerDepositPage.jsx',
);
const source = fs.readFileSync(filePath, 'utf8');

const assertIncludes = (snippet, message) => {
  if (!source.includes(snippet)) {
    throw new Error(message);
  }
};

assertIncludes(
  'const cancelingRef = useRef(false);',
  'customer deposit cancel flow must use a synchronous duplicate-submit guard',
);
assertIncludes(
  'if (!id || isCanceling || cancelingRef.current) return;',
  'customer deposit cancel flow must reject duplicate cancel attempts before mutation',
);
assertIncludes(
  'const depositId = id;',
  'customer deposit cancel flow must snapshot the target id before awaiting mutation',
);
assertIncludes(
  'const updated = await cancelCustomerDepositAction(depositId);',
  'customer deposit cancel flow must await the persistence mutation',
);
assertIncludes(
  'setDeposits(deposits.map((deposit) => (',
  'successful customer deposit cancellation must reconcile local list state immediately',
);
assertIncludes(
  "const isCancelled = d.status === 'CANCELLED';",
  'cancelled customer deposits must be rendered from persisted status',
);
assertIncludes(
  'ยกเลิกแล้ว',
  'cancelled customer deposits must expose a visible terminal state',
);
assertIncludes(
  'if (!isCanceling && !cancelingRef.current) setPendingCancelId(null);',
  'cancel dialog must remain frozen while cancellation is in flight',
);

console.log('Customer Deposit Cancel Reconciliation Contract: PASS');
