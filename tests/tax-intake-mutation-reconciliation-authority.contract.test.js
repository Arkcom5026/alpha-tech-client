import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(here, '../src/features/tax/intake/hooks/useTaxIntakeWorkspaceController.js'),
  'utf8',
);

const mustInclude = [
  'const branchIdRef = useRef(branchId);',
  'const loadRequestRef = useRef(0);',
  'const requestId = ++loadRequestRef.current;',
  'return { ok: false, stale: true };',
  'const refreshAfterMutation = useCallback(async ({',
  'toast.actionSuccess(successMessage, `${eventKey}:success`);',
  '`${eventKey}:context-changed:error`',
  '`${eventKey}:detail-refresh:error`',
  'const listRefresh = await loadData({ reportError: false });',
  '`${eventKey}:refresh:error`',
  'const branchIdSnapshot = branchId;',
  'const targetStatusSnapshot = targetStatus;',
  'const taxInvoiceKindSnapshot = taxInvoiceKind;',
  'toast.actionError(requestError, message, `${eventKey}:error`);',
];

for (const needle of mustInclude) {
  if (!source.includes(needle)) {
    throw new Error(`Tax Intake mutation reconciliation authority contract missing: ${needle}`);
  }
}

console.log('Tax Intake Mutation Reconciliation Authority Contract: PASS');
