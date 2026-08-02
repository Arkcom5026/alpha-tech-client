const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const preflight = read('tools/runner/invoke-alde-preflight.ps1');
const pipeline = read('tools/runner/invoke-alde-pipeline.ps1');
const classifier = read('tools/runner/classify-alde-failures.ps1');

assert.match(preflight, /PRISMA_GENERATE_LOCK_RISK/);
assert.match(preflight, /SERVER_NODE_PROCESS_ACTIVE/);
assert.match(preflight, /Stop only the identified Alpha-Tech server node process/);
assert.match(pipeline, /ALDE RELIABILITY PREFLIGHT/);
assert.match(pipeline, /preflightReportPath/);
assert.match(pipeline, /preflight = \$preflight/);
assert.match(classifier, /function Get-GatePolicy/);
assert.match(classifier, /ADVISORY_SKIP/);
assert.match(classifier, /BLOCKING_SKIP/);
assert.match(classifier, /blockingSkippedGateCount/);

console.log('ALDE reliability preflight and evidence policy contract: PASS');
