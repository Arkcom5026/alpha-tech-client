import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(here, '../src/features/repair/components/ExpensePayeeQuickCreateDialog.jsx'),
  'utf8',
);

const mustInclude = [
  'const savingRef = useRef(false);',
  'const formSnapshot = { ...form };',
  "const createdId = created?.id || 'new';",
  'const selectionOutcome = await onCreated?.(created);',
  'selectionOutcome === false || selectionOutcome?.ok === false',
  'selectionOutcome?.error instanceof Error',
  'repair:expense-payee:${createdId}:create:success',
  'repair:expense-payee:${createdId}:select:error',
  'savingRef.current = false;',
];

for (const needle of mustInclude) {
  if (!source.includes(needle)) {
    throw new Error(`Repair expense payee selection authority contract missing: ${needle}`);
  }
}

console.log('Repair Expense Payee Selection Outcome Authority Contract: PASS');
