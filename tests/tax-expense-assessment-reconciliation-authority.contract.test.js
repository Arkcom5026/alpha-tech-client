import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'src/features/taxExpense/components/TaxExpenseAssessmentPanel.jsx'),
  'utf8',
);

const expectSource = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

expectSource('const savingRef = useRef(false);', 'assessment confirmation must keep synchronous mutation ownership');
expectSource('const expenseIdSnapshot = expenseId;', 'assessment command must snapshot expense identity');
expectSource('const load = useCallback(async ({ reportError = true } = {}) => {', 'assessment refresh must expose an observable result');
expectSource('return { ok: true, data: response };', 'assessment load must report successful refresh');
expectSource('return { ok: false, error };', 'assessment load must report failed refresh');
expectSource("const assessmentRefresh = await load({ reportError: false });", 'post-confirm assessment refresh must be checked separately');
expectSource('tax-expense:assessment:${expenseIdSnapshot}:refresh:error', 'assessment refresh failure needs a dedicated partial-success event');
expectSource('const parentRefresh = await onConfirmed?.();', 'parent reconciliation outcome must be observed');
expectSource('if (parentRefresh?.ok === false)', 'non-throwing parent refresh failure must be handled');
expectSource('savingRef.current = false;', 'mutation ownership must be released explicitly');

console.log('Tax Expense Assessment Reconciliation Authority Contract: PASS');
