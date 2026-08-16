import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/tax/inputDocuments/hooks/useInputTaxReceiptWorkspaceController.js', 'utf8');

assert.match(source, /const mutationRef = useRef\(false\)/, 'expected synchronous mutation ownership');
assert.match(source, /const branchIdRef = useRef\(branchId\)/, 'expected current branch authority');
assert.match(source, /loadReceipts = useCallback\(async \(criteria = filters, \{ reportError = true, branchIdOverride \} = \{\}\)/, 'expected observable receipt refresh');
assert.match(source, /return \{ ok: true, data \}/, 'expected success refresh outcome');
assert.match(source, /return \{ ok: false, error \}/, 'expected failure refresh outcome');
assert.match(source, /receiptReferencesSnapshot = selectedReceipts\.map/, 'expected immutable attach command snapshot');
assert.match(source, /invoiceSnapshot = \{ \.\.\.invoice \}/, 'expected immutable invoice command snapshot');
assert.match(source, /allocationSnapshot = \{ \.\.\.allocation \}/, 'expected immutable reallocation command snapshot');
assert.match(source, /reasonSnapshot = String\(reason \|\| ''\)\.trim\(\)/, 'expected immutable cancel reason snapshot');
assert.match(source, /attach:refresh:error/, 'expected attach partial-success refresh event');
assert.match(source, /document:create:refresh:error/, 'expected document-create partial-success refresh event');
assert.match(source, /reallocate:refresh:error/, 'expected reallocation partial-success refresh event');
assert.match(source, /cancel:refresh:error/, 'expected cancellation partial-success refresh event');
assert.match(source, /context-changed:error/, 'expected cross-branch post-success authority');

console.log('Input Tax Receipt Link Reconciliation Authority Contract: PASS');
