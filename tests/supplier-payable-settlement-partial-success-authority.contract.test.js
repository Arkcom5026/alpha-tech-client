import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(
  path.join(root, 'src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx'),
  'utf8',
);

const assertIncludes = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message || `Missing contract: ${needle}`);
};

assertIncludes('const settlementMutationRef = useRef(false);', 'settlement mutation requires synchronous ownership');
assertIncludes('const load = useCallback(async ({ reportError = true } = {}) => {', 'workspace load must expose refresh control');
assertIncludes('return { ok: false, error };', 'workspace load must expose refresh failure outcome');
assertIncludes('const supplierIdSnapshot = paymentSupplierId;', 'settlement create must snapshot supplier authority');
assertIncludes('const allocationsSnapshot = paymentSelection.map', 'settlement create must snapshot allocations before persistence');
assertIncludes('const paymentIdSnapshot = paymentId;', 'settlement reversal must snapshot settlement identity');
assertIncludes('const reasonSnapshot = voidReason.trim();', 'settlement reversal must snapshot reversal reason');
assertIncludes('settlement:create:refresh:error', 'settlement create needs partial-success refresh feedback');
assertIncludes('void:refresh:error', 'settlement reversal needs partial-success refresh feedback');
assertIncludes('disabled={loading || saving}', 'manual refresh must be frozen while financial mutation owns the workspace');

console.log('Supplier Payable Settlement Partial-Success Authority Contract: PASS');
