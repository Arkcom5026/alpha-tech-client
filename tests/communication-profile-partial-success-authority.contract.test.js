import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = fs.readFileSync(
  path.join(root, 'src/features/communication/pages/CommunicationProfileSettingsPage.jsx'),
  'utf8',
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(source.includes('const savingRef = useRef(false);'), 'communication profile save must keep synchronous mutation ownership');
assert(source.includes('const payload = {'), 'communication profile save must snapshot its payload before persistence');
assert(source.includes('await saveCommunicationProfile(payload);'), 'communication profile save must persist the immutable payload snapshot');
assert(source.includes('feedback.actionSuccess('), 'communication profile save must emit persistent success feedback');
assert(source.includes(':save:success`'), 'communication profile save must use a stable success event key');
assert(source.includes(':save:error`'), 'communication profile save must use a stable mutation error event key');
assert(source.includes(':refresh:error`'), 'post-save refresh failure must have a distinct partial-success event key');
assert(source.includes('บันทึกช่องทางติดต่อสำเร็จแล้ว แต่รีเฟรชรายการช่องทางไม่สำเร็จ'), 'post-save refresh failure must explain that persistence already succeeded');
assert(source.includes('return { ok: false, error: loadError, message };'), 'load must return structured refresh failure authority');

const successIndex = source.indexOf('feedback.actionSuccess(');
const refreshIndex = source.indexOf('const refreshResult = await load();', successIndex);
const refreshErrorIndex = source.indexOf(':refresh:error`', refreshIndex);
assert(successIndex >= 0 && refreshIndex > successIndex, 'refresh must occur only after server-confirmed save success');
assert(refreshErrorIndex > refreshIndex, 'refresh failure authority must live after the post-success refresh');

console.log('Communication Profile Partial-Success Authority Contract: PASS');
