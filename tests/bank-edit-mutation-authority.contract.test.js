import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = fs.readFileSync(
  path.join(root, 'src/features/bank/workspace/EditBankWorkspace.jsx'),
  'utf8',
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(source.includes('useRef'), 'bank edit workspace must import useRef');
assert(source.includes('const savingRef = useRef(false);'), 'bank edit workspace must own a synchronous mutation ref');
assert(source.includes('if (bankSaving || savingRef.current || !bankId) return;'), 'bank edit submit must block duplicate submission synchronously');
assert(source.includes('const bankIdSnapshot = bankId;'), 'bank edit must freeze the target bank id');
assert(source.includes('const formSnapshot = { ...form, name: form.name.trim() };'), 'bank edit must freeze the payload before persistence');
assert(source.includes('await updateBankAction(bankIdSnapshot, formSnapshot);'), 'bank edit must persist the immutable snapshots');
assert(source.includes('`bank:update:${bankIdSnapshot}:success`'), 'bank edit success feedback must identify the target bank');
assert(source.includes('`bank:update:${bankIdSnapshot}:error`'), 'bank edit error feedback must identify the target bank');
assert(source.includes('const cancel = () => {'), 'bank edit workspace must own guarded cancel navigation');
assert(source.includes('<fieldset disabled={mutationBusy}'), 'bank edit form must freeze while persistence is in flight');
assert(source.includes('disabled={mutationBusy}'), 'bank edit actions must freeze while persistence is in flight');

console.log('Bank Edit Mutation Authority Contract: PASS');
