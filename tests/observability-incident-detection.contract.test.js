'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'src/observability/runtimeObservability.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'src/main.jsx'), 'utf8');
const apiClient = fs.readFileSync(path.join(root, 'src/utils/apiClient.js'), 'utf8');

assert.match(apiClient, /axios\.create\(/, 'runtime observability must build on the canonical api client');
assert.match(runtime, /from '@\/utils\/apiClient'/, 'observability must attach to the canonical api client without duplicating transport logic');
assert.match(runtime, /x-request-id/, 'client must capture the server request correlation header');
assert.match(runtime, /response\?\.data\?\.requestId/, 'client must support request correlation from error bodies');
assert.match(runtime, /error\.requestId = requestId/, 'correlated failures must retain request id for support workflows');
assert.match(runtime, /API_SERVER_FAILURE/, '5xx responses must emit a stable client incident code');
assert.match(runtime, /API_NETWORK_FAILURE/, 'network failures must emit a stable client incident code');
assert.match(runtime, /BROWSER_UNCAUGHT_ERROR/, 'uncaught browser errors must emit a stable incident code');
assert.match(runtime, /BROWSER_UNHANDLED_REJECTION/, 'unhandled browser rejections must emit a stable incident code');
assert.match(runtime, /alphatech:runtime-incident/, 'runtime incidents must expose an in-app event integration point');
assert.match(runtime, /Bearer\\s\+/, 'client incident messages must redact bearer credentials');
assert.match(main, /installRuntimeObservability\(\)/, 'runtime observability must be installed during app bootstrap');

console.log('Frontend Observability Incident Detection Contract: PASS');
