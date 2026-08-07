import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('completed sale documents stay in the current browser tab', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const workflowPath = path.join(
    root,
    'src/features/sales/documents/services/saleDocumentWorkflow.js'
  );
  const workflow = fs.readFileSync(workflowPath, 'utf8');

  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  assert(workflow.includes('navigate(route);'), 'completed sale documents must use same-tab navigation');
  assert(workflow.includes("mode: 'same-tab'"), 'workflow result must identify same-tab navigation');
  assert(workflow.includes('reservedWindow.close?.();'), 'legacy reserved windows must be closed before navigation');
  assert(!workflow.includes("'_blank'"), 'completed sale documents must not target a new tab');
  assert(!workflow.includes('browser?.open'), 'completed sale documents must not call window.open');

  console.log('Sale document same-tab contract: PASS');
});
