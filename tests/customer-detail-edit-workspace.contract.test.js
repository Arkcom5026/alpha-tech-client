import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const apiSource = read('src', 'features', 'customer', 'api', 'customerApi.js');
const workspaceSource = read('src', 'features', 'customer', 'components', 'workspace', 'CustomerDetailWorkspace.jsx');

test('customer detail workspace reads managed customer detail and saves through staff update authority', () => {
  assert.match(apiSource, /getManagedCustomerDetail/);
  assert.match(apiSource, /\/customers\/management\//);
  assert.match(apiSource, /updateCustomerProfilePos/);
  assert.match(workspaceSource, /getManagedCustomerDetail/);
  assert.match(workspaceSource, /updateCustomerProfilePos/);
});

test('customer detail workspace exposes editable tax identity and address fields', () => {
  assert.match(workspaceSource, /เลขประจำตัวผู้เสียภาษี/);
  assert.match(workspaceSource, /ประเภทลูกค้า/);
  assert.match(workspaceSource, /AddressForm/);
  assert.match(workspaceSource, /บันทึกการแก้ไข/);
  assert.match(workspaceSource, /ORGANIZATION/);
  assert.match(workspaceSource, /GOVERNMENT/);
});

test('customer detail workspace no longer renders the disconnected placeholder state', () => {
  assert.doesNotMatch(workspaceSource, /ยังไม่มีข้อมูลรายละเอียดที่เชื่อมต่อกับหน้านี้/);
  assert.match(workspaceSource, /กำลังโหลดข้อมูลลูกค้า/);
  assert.match(workspaceSource, /โหลดรายละเอียดลูกค้าไม่สำเร็จ/);
});
