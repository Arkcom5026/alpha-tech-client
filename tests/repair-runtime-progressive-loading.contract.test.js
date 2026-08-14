import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('repair detail defers below-fold runtime panels until they approach the viewport', () => {
  const source = read('src/features/repair/detail/workspace/components/DeferredRepairSection.jsx');

  assert.match(source, /IntersectionObserver/);
  assert.match(source, /rootMargin = '320px 0px'/);
  assert.match(source, /if \(ready\) return children/);
  assert.match(source, /observer\.disconnect\(\)/);
});

test('repair detail mounts optional runtime domains only when workflow makes them relevant', () => {
  const source = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

  assert.match(source, /SUBCONTRACT_VISIBLE_STATUSES = new Set\(\['APPROVED', 'REPAIRING'\]\)/);
  assert.match(source, /ESTIMATE_VISIBLE_STATUSES = new Set\(\[/);
  assert.match(source, /'WAITING_APPROVAL'/);
  assert.match(source, /'APPROVED'/);
  assert.match(source, /'REJECTED'/);
  assert.match(source, /HANDOVER_VISIBLE_STATUSES = new Set\(\['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED'\]\)/);
  assert.match(source, /subcontractRelevant \?/);
  assert.match(source, /estimateRelevant \?/);
  assert.match(source, /handoverRelevant \?/);
});

test('communication and intake evidence are progressive while warnings force immediate recovery UI', () => {
  const source = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

  assert.match(source, /force=\{Boolean\(communicationWarning\)\}/);
  assert.match(source, /force=\{Boolean\(evidenceWarning \|\| pendingIntakeEvidence\)\}/);
  assert.match(source, /<RepairCommunicationPanel repairJobId=\{repairJobId\} \/>/);
  assert.match(source, /<IntakeEvidencePanel/);
});

test('handover is not mounted for early repair workflow states', () => {
  const source = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

  const guardedHandover = /!subcontractActive && handoverRelevant[\s\S]*?<RepairHandoverPanel/;
  assert.match(source, guardedHandover);
  assert.doesNotMatch(source, /<RepairHandoverPanel[\s\S]*?\/>\s*\n\s*\) : null\}\s*\n\s*<IntakeEvidencePanel/);
});

test('repair runtime keeps user-facing Thai copy encoded as UTF-8', () => {
  const source = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

  assert.match(source, /title="รายละเอียดงานซ่อม"/);
  assert.match(source, /description="พื้นที่ปฏิบัติงานหลักที่พาผู้ใช้ทำงานตามขั้นตอน ตั้งแต่ตรวจสอบจนถึงส่งมอบ"/);
  assert.match(source, /emptyText="ไม่พบงานซ่อม"/);
  assert.match(source, /เปิดงานซ่อมสำเร็จ แต่ยังบันทึกช่องทางติดต่อไม่ได้/);
  assert.doesNotMatch(source, /à¸|à¹/);
});
