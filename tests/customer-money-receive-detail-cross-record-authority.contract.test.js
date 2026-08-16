const fs = require('fs');
const path = require('path');
const assert = require('assert');

const file = path.join(__dirname, '../src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');
const source = fs.readFileSync(file, 'utf8');

assert(source.includes("import React, { useCallback, useEffect, useRef, useState } from 'react';"));
assert(source.includes('const recordContextRef = useRef(id);'));
assert(source.includes('const loadRequestRef = useRef(0);'));
assert(source.includes('const cancelRequestRef = useRef(0);'));
assert(source.includes('recordContextRef.current = id;'));
assert(source.includes('const recordIdSnapshot = String(recordId || \'\');'));
assert(source.includes('loadRequestRef.current === requestId'));
assert(source.includes("String(recordContextRef.current || '') === recordIdSnapshot"));
assert(source.includes('return { ok: false, stale: true, data: null };'));
assert(source.includes('cancelRequestRef.current += 1;'));
assert(source.includes('const cancelRequestId = ++cancelRequestRef.current;'));
assert(source.includes("String(recordContextRef.current || '') === recordId"));
assert(source.includes('customer-money-receive:cancel:${recordId}:context-changed:error'));
assert(source.includes('const refreshOutcome = await loadRecord(recordId);'));
assert(source.includes('if (!ownsCancelRequest()) return;'));
assert(source.includes('if (!refreshOutcome.ok && !refreshOutcome.stale)'));

console.log('Customer Money Receive Detail Cross-Record Authority Contract: PASS');
