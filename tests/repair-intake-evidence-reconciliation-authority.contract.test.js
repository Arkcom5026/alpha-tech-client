import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/repair/components/IntakeEvidencePanel.jsx', 'utf8');

assert.match(source, /const savingRef = useRef\(false\)/);
assert.match(source, /const interactionLocked = loading \|\| saving \|\| savingRef\.current/);
assert.match(source, /const repairJobIdSnapshot = repairJobId/);
assert.match(source, /const draftSnapshot = \{ \.\.\.draft, photos: \[\.\.\.draft\.photos\] \}/);
assert.match(source, /await repairApi\.saveIntakeEvidence\(repairJobIdSnapshot, payload\)/);
assert.match(source, /feedback\.actionSuccess\([\s\S]*repair:intake-evidence:\$\{repairJobIdSnapshot\}:save:success/);
assert.match(source, /const refreshResult = await onSaved\?\.\(saved\)/);
assert.match(source, /refreshResult\?\.ok === false/);
assert.match(source, /repair:intake-evidence:\$\{repairJobIdSnapshot\}:refresh:error/);

const successIndex = source.indexOf('save:success`');
const refreshIndex = source.indexOf('const refreshResult = await onSaved?.(saved)');
const releaseIndex = source.indexOf('savingRef.current = false', refreshIndex);
assert.ok(successIndex >= 0 && refreshIndex > successIndex, 'success feedback must precede reconciliation');
assert.ok(releaseIndex > refreshIndex, 'mutation ownership must remain held through reconciliation');

console.log('Repair Intake Evidence Reconciliation Authority Contract: PASS');
