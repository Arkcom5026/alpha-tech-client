import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clearRepairReadDedupe,
  dedupeRepairRead,
} from '../src/features/repair/api/repairRequestCoordinator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('concurrent reads with the same repair runtime key share one in-flight request', async () => {
  clearRepairReadDedupe();
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const work = async () => {
    calls += 1;
    await gate;
    return { ok: true };
  };

  const first = dedupeRepairRead('repair:job:24', work);
  const second = dedupeRepairRead('repair:job:24', work);
  assert.equal(calls, 0);
  await Promise.resolve();
  assert.equal(calls, 1);
  release();

  const [left, right] = await Promise.all([first, second]);
  assert.deepEqual(left, { ok: true });
  assert.deepEqual(right, { ok: true });
  assert.equal(calls, 1);
});

test('completed reads are not cached beyond the in-flight window', async () => {
  clearRepairReadDedupe();
  let calls = 0;
  const work = async () => ++calls;
  assert.equal(await dedupeRepairRead('repair:handover:24', work), 1);
  assert.equal(await dedupeRepairRead('repair:handover:24', work), 2);
});

test('repair API routes duplicate-prone GETs through the read coordinator', () => {
  const source = read('src/features/repair/api/repairApi.js');
  assert.match(source, /dedupeRepairRead/);
  assert.match(source, /repair:list-jobs:/);
  assert.match(source, /repair:job:/);
  assert.match(source, /repair:intake-evidence:/);
  assert.match(source, /repair:estimate-approval:/);
  assert.match(source, /repair:handover:/);
  assert.match(source, /repair:subcontract-context:/);
});

test('communication panel participates in repair runtime read dedupe', () => {
  const source = read('src/features/repair/components/RepairCommunicationPanel.jsx');
  assert.match(source, /repair:communication-preference:/);
  assert.match(source, /repair:communication-activities:/);
  assert.match(source, /dedupeRepairRead/);
});

test('detail workspace only mounts expensive secondary panels when workflow makes them relevant', () => {
  const source = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

  assert.match(source, /const subcontractRelevant =/);
  assert.match(source, /\['APPROVED', 'REPAIRING'\]\.includes\(workflowStatus\)/);
  assert.match(source, /const estimateRelevant =/);
  assert.match(source, /ESTIMATE_RUNTIME_STATUSES\.has\(workflowStatus\)/);
  assert.match(source, /const handoverRelevant = HANDOVER_RUNTIME_STATUSES\.has\(workflowStatus\)/);
  assert.match(source, /\{subcontractRelevant \? \(/);
  assert.match(source, /\{estimateRelevant \? \(/);
  assert.match(source, /!subcontractActive && handoverRelevant/);
  assert.match(source, /'READY_FOR_DELIVERY'/);
  assert.match(source, /'DELIVERED'/);
  assert.match(source, /'CLOSED'/);
});

test('repair runtime Thai presentation source remains valid UTF-8 and free of mojibake markers', () => {
  const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');
  const shell = read('src/features/repair/components/RepairShellHeader.jsx');
  const combined = `${workspace}\n${shell}`;

  assert.match(workspace, /รายละเอียดงานซ่อม/);
  assert.match(workspace, /พื้นที่ปฏิบัติงานหลักที่พาผู้ใช้ทำงานตามขั้นตอน/);
  assert.match(shell, /รับเรื่อง/);
  assert.match(shell, /คิวงานซ่อม/);
  assert.doesNotMatch(combined, /(?:à¸|à¹|Ã|Â|â€|ï¿½)/);
});
