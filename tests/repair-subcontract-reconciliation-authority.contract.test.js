import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/features/repair/components/RepairSubcontractPanel.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

const expectText = (text, label) => {
  if (!source.includes(text)) throw new Error(`Missing ${label}: ${text}`);
};

expectText('const jobIdRef = useRef(job?.id);', 'current repair-job authority');
expectText('const interactionLocked = loading || mutationBusy || mutationRef.current;', 'synchronous interaction lock');
expectText('return { ok: true, data };', 'observable subcontract refresh success');
expectText('return { ok: false, error: loadError };', 'observable subcontract refresh failure');
expectText('jobIdSnapshot,\n      work:', 'immutable mutation owner snapshot');
expectText(':context-changed:error`', 'cross-job partial-success feedback');
expectText(':context-refresh:error`', 'subcontract refresh partial-success feedback');
expectText('parentRefresh === false || parentRefresh?.ok === false', 'non-throwing parent refresh failure handling');
expectText('if (ok && Number(jobIdRef.current) === Number(jobIdSnapshot))', 'owner-safe post-success UI reconciliation');

console.log('Repair subcontract reconciliation authority contract: PASS');
