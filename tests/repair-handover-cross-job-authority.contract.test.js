import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const sourcePath = path.resolve('src/features/repair/components/RepairHandoverPanel.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

assert.match(source, /const repairJobIdRef = useRef\(repairJobId\)/, 'handover owner must track the current repair job');
assert.match(source, /const loadRequestRef = useRef\(0\)/, 'handover reads must be request-sequenced');
assert.match(source, /repairJobIdRef\.current !== repairJobIdSnapshot \|\| loadRequestRef\.current !== requestId/, 'stale handover reads must be rejected');
assert.match(source, /context-changed-after-finalize:error/, 'finalize success followed by a job-context switch must have a dedicated partial-success event');
assert.match(source, /if \(repairJobIdRef\.current !== repairJobIdSnapshot\)[\s\S]*?return;/, 'automatic close must not continue after the page moves to another repair job');
assert.match(source, /closed === false \|\| closed\?\.ok === false/, 'non-throwing close failures must be observable');
assert.match(source, /reloadResult === false \|\| reloadResult\?\.ok === false/, 'non-throwing parent refresh failures must be observable');
assert.match(source, /repair:handover:\$\{repairJobIdSnapshot\}:close-after-finalize:error/, 'close-after-finalize partial success must remain entity-scoped');
assert.match(source, /repair:handover:\$\{repairJobIdSnapshot\}:refresh:error/, 'refresh-after-finalize partial success must remain entity-scoped');

console.log('Repair Handover Cross-Job Authority Contract: PASS');
