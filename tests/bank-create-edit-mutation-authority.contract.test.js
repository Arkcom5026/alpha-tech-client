import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = fs.readFileSync(
  path.join(root, 'src/features/bank/workspace/CreateBankWorkspace.jsx'),
  'utf8',
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(source.includes('useRef'), 'bank create/edit workspace must import useRef');
assert(source.includes('const savingRef = useRef(false);'), 'bank create/edit workspace must own a synchronous mutation ref');
assert(source.includes('if (bankSaving || savingRef.current) return;'), 'bank submit must block duplicate submission synchronously');
assert(source.includes('const formSnapshot = { ...form, name: form.name.trim() };'), 'bank submit must freeze the form payload before persistence');
assert(source.includes("const modeSnapshot = isEdit ? 'edit' : 'create';"), 'bank submit must freeze create/edit mode authority');
assert(source.includes('await updateBankAction(idSnapshot, formSnapshot);'), 'bank edit must persist the frozen payload');
assert(source.includes('await createBankAction(formSnapshot);'), 'bank create must persist the frozen payload');
assert(source.includes('feedback.actionSuccess('), 'bank create/edit must keep persistent success feedback');
assert(source.includes('feedback.actionError('), 'bank create/edit must keep persistent error feedback');
assert(source.includes('const cancel = () => {'), 'bank workspace must own guarded cancel navigation');
assert(source.includes('if (bankSaving || savingRef.current) return;\n    navigate(getListUrl());'), 'cancel navigation must be blocked while a mutation owns the workspace');
assert(source.includes('<fieldset disabled={mutationBusy}'), 'bank inputs must freeze while persistence is in flight');
assert(source.includes('disabled={mutationBusy}'), 'bank action controls must freeze while persistence is in flight');

console.log('Bank Create/Edit Mutation Authority Contract: PASS');
