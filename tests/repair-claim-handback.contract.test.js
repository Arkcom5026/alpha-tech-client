const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const overview = fs.readFileSync(
  path.join(process.cwd(), 'src/features/repair/components/RepairWorkflowOverview.jsx'),
  'utf8'
);

test('repair workflow overview exposes active claim hold and direct claim navigation', () => {
  assert.match(overview, /claimContext\?\.active/);
  assert.match(overview, /ใบงานพักระหว่างกระบวนการเคลม/);
  assert.match(overview, /\/warranty-claims\/\$\{claimContext\.claimId\}/);
  assert.match(overview, /หยุด action งานซ่อมและการเบิกอะไหล่ไว้ชั่วคราว/);
});

test('repair workflow overview explains claim handback after resolution', () => {
  assert.match(overview, /claimContext\?\.handbackPending/);
  assert.match(overview, /เคลมจบแล้ว · กลับมาดำเนินใบงานซ่อม/);
  assert.match(overview, /เมื่อมี workflow action ใหม่ ระบบจะถือว่ารับงานกลับจากเคลมแล้ว/);
});
