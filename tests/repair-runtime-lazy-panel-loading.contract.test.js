import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('handover data is not fetched before the workflow can hand over a repair', () => {
  const source = read('src/features/repair/components/RepairHandoverPanel.jsx');
  assert.match(source, /const handoverRelevant = \['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED'\]\.includes\(workflowStatus\)/);
  assert.match(source, /if \(!handoverRelevant\) return;/);
  assert.match(source, /useEffect\(\(\) => \{\s*if \(!handoverRelevant\) return;/s);
});

test('estimate approval read is skipped before quotation approval becomes relevant', () => {
  const source = read('src/features/repair/customer-access/components/RepairEstimateApprovalPanel.jsx');
  assert.match(source, /const approvalReadRelevant =/);
  assert.match(source, /workflowStatus === 'WAITING_APPROVAL'/);
  assert.match(source, /workflowStatus === 'APPROVED'/);
  assert.match(source, /workflowStatus === 'REJECTED'/);
  assert.match(source, /if \(!approvalReadRelevant\) \{/);
});

test('repair subcontract and expense payee reads are not mandatory page-load dependencies', () => {
  const source = read('src/features/repair/components/RepairSubcontractPanel.jsx');
  assert.match(source, /const shouldLoadContext = Boolean\(activeFromJob \|\| expanded\)/);
  assert.match(source, /if \(!shouldLoadContext\) return;/);
  assert.match(source, /if \(!expanded \|\| activeFromJob\) return;/);
});
