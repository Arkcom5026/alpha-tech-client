import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/features/customerMoneyReceive/pages/CustomerMoneyReceivePage.jsx');
const source = fs.readFileSync(file, 'utf8');

const required = [
  "import React, { useEffect, useMemo, useRef, useState } from 'react';",
  'const mountedRef = useRef(true);',
  'const createRequestRef = useRef(0);',
  'mountedRef.current = false;',
  'createRequestRef.current += 1;',
  'const requestId = ++createRequestRef.current;',
  'const ownsCreateRequest = () => mountedRef.current && createRequestRef.current === requestId;',
  'if (!ownsCreateRequest()) return;',
  'navigate(`../${created.id}`);',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing Customer Money Receive create authority contract token: ${token}`);
  }
}

const navigateIndex = source.indexOf('navigate(`../${created.id}`);');
const successGuardIndex = source.lastIndexOf('if (!ownsCreateRequest()) return;', navigateIndex);
if (successGuardIndex < 0 || successGuardIndex > navigateIndex) {
  throw new Error('Post-create navigation must be guarded by current request/page ownership.');
}

console.log('Customer Money Receive create navigation authority contract: PASS');
