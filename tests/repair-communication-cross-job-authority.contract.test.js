const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/repair/components/RepairCommunicationPanel.jsx'),
  'utf8',
);

const required = [
  'const repairJobIdRef = useRef(repairJobId);',
  'const loadRequestRef = useRef(0);',
  'repairJobIdRef.current = repairJobId;',
  'const jobIdSnapshot = jobId;',
  'const requestId = ++loadRequestRef.current;',
  'repairJobIdRef.current !== jobIdSnapshot || loadRequestRef.current !== requestId',
  'return { ok: false, stale: true };',
  'const repairJobIdSnapshot = repairJobId;',
  'load({ jobId: repairJobIdSnapshot, reportError: false })',
  '`repair:communication:${repairJobIdSnapshot}:refresh:error`',
  'const mutationBusy = saving || savingRef.current;',
];

for (const marker of required) {
  if (!source.includes(marker)) {
    throw new Error(`Missing Repair Communication authority contract marker: ${marker}`);
  }
}

console.log('Repair Communication Cross-Job Authority Contract: PASS');
