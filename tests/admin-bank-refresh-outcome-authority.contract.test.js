import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const page = fs.readFileSync(
  path.resolve(here, '../src/features/admin/components/FormBank.jsx'),
  'utf8',
);
const store = fs.readFileSync(
  path.resolve(here, '../src/store/bankStore.js'),
  'utf8',
);

const pageNeedles = [
  'const refresh = await fetchBanks(tokenSnapshot);',
  'if (!refresh?.ok) {',
  'เพิ่มธนาคารสำเร็จแล้ว แต่รีเฟรชรายการธนาคารไม่สำเร็จ',
  'ลบธนาคารสำเร็จแล้ว แต่รีเฟรชรายการธนาคารไม่สำเร็จ',
  ':refresh:error',
];

const storeNeedles = [
  'return { ok: true, data: res.data };',
  'return { ok: false, error: err };',
  'set({ loading: true, error: null });',
];

for (const needle of pageNeedles) {
  if (!page.includes(needle)) throw new Error(`Admin bank page authority missing: ${needle}`);
}
for (const needle of storeNeedles) {
  if (!store.includes(needle)) throw new Error(`Bank store refresh authority missing: ${needle}`);
}

console.log('Admin Bank Refresh Outcome Authority Contract: PASS');
