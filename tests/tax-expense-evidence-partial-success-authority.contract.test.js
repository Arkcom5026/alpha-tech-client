import fs from 'node:fs';
import assert from 'node:assert/strict';

const page = fs.readFileSync('src/features/taxExpense/pages/TaxExpenseWorkspacePage.jsx', 'utf8');
const hook = fs.readFileSync('src/features/taxExpense/hooks/useTaxExpenseWorkspace.js', 'utf8');

assert.match(page, /const evidenceMutationRef = useRef\(false\)/, 'evidence verification must own a synchronous mutation ref');
assert.match(page, /const expenseId = Number\(expense\.id\)/, 'verification must snapshot the expense id before persistence');
assert.match(page, /evidenceMutationRef\.current = true[\s\S]*verifyTaxExpenseEvidence\(expenseId/, 'ownership must be acquired before persistence');
assert.match(page, /feedback\.actionSuccess\([\s\S]*await load\(\{ reportError: false \}\)/, 'success feedback must precede post-success refresh');
assert.match(page, /evidence-verify:refresh:error/, 'refresh failure after successful verification needs a dedicated ADS event');
assert.match(page, /finally \{[\s\S]*evidenceMutationRef\.current = false/, 'synchronous ownership must release in finally');
assert.match(hook, /const load = useCallback\(async \(\{ payeeQuery = '', reportError = true \} = \{\}\) =>/, 'workspace load must expose reportError control');
assert.match(hook, /return \{ ok: true,[\s\S]*expenses: nextExpenses/, 'workspace load must return an observable success result');
assert.match(hook, /return \{ ok: false, error: requestError, message \}/, 'workspace load must return an observable failure result');

console.log('Tax Expense Evidence Partial-success Authority Contract: PASS');
